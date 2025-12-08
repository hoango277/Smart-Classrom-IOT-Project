#include "sensor_manager.h"
#include <Arduino.h>
#include "../drivers/sensors.h"
#include "../drivers/dht.h"
#include "../drivers/buzzer.h"
#include "../drivers/doors.h"
#include "../drivers/windows.h"
#include "../drivers/lights.h"
#include "../net/mqtt.h"
#include "../../include/config.h"

static unsigned long lastSensorRead = 0;
// Rain State
static bool lastRainState = false;

// Fire Alarm State
static bool fireActive = false;
static unsigned long fireStartTime = 0;
static bool doorsStopped = false;
static unsigned long lastBlinkTime = 0;
static bool blinkState = false;

void sensor_manager_init()
{
  sensors_init();
  dht_init();
  buzzer_init();
  Serial.println("[SensorManager] Initialized");
}

static void trigger_fire_start() {
  if (fireActive) return; // Already/Still active
  
  fireActive = true;
  fireStartTime = millis();
  doorsStopped = false;
  blinkState = true; 
  lastBlinkTime = 0; // Force immediate blink

  Serial.println("[SensorManager] FIRE ALARM ACTIVE!");
  
  // 1. Open All Doors & Windows
  for (int i = 0; i < NUM_DOORS; ++i) door_open(i);
  for (int i = 0; i < NUM_WINDOWS; ++i) window_open(i);

  // 2. Initial Buzzer/Light ON
  buzzer_on();
  for (int i = 0; i < NUM_LIGHTS; ++i) light_on(i);

  // 3. Publish
  char topic[MAX_TOPIC_LENGTH];
  snprintf(topic, MAX_TOPIC_LENGTH, "%s0", TOPIC_BASE_ALARM_CMD);
  // Remove "/cmd" from base? No, existing config might vary. 
  // Config: TOPIC_BASE_ALARM_CMD "classroom/alarm/"
  // We want to publish status to "classroom/alarm/0". 
  // It matches the ID structure.
  mqtt_publish(topic, "detected");
}

static void trigger_fire_stop() {
  if (!fireActive) return;

  Serial.println("[SensorManager] Fire Alarm Cleared.");
  fireActive = false;

  // Stop everything
  buzzer_off();
  for (int i = 0; i < NUM_LIGHTS; ++i) light_off(i);
  
  // Optional: Do we close doors? Usually manual reset is safer.
  // But we should stop motors if they are running?
  // They should have stopped after 3s anyway.
  
  // Publish
  char topic[MAX_TOPIC_LENGTH];
  snprintf(topic, MAX_TOPIC_LENGTH, "%s0", TOPIC_BASE_ALARM_CMD);
  mqtt_publish(topic, "cleared");
}

void sensor_manager_set_fire(bool active) {
  if (active) trigger_fire_start();
  else trigger_fire_stop();
}

void sensor_manager_tick()
{
  // --- Fire Alarm Logic (Highest Priority) ---
  // Check Sensor
  // Note: We also respect manual override via MQTT (which calls trigger_fire_* directly)
  // But here we pool the sensor.
  
  // Poll sensor logic
  if (millis() - lastSensorRead >= 200) {
    bool flame = read_flame();
    
    // Auto-trigger from sensor
    if (flame && !fireActive) {
      trigger_fire_start();
    } 
    // Auto-clear from sensor? 
    // User said "thực hiện... cho đến khi không phát hiện nữa".
    // So if sensor goes LOW, we should clear.
    // BUT, if it was triggered by MQTT, should sensor LOW clear it?
    // Probably yes, or we keep it simple: Sensor OR MQTT triggers it. 
    // If Sensor is LOW, and it was triggered by MQTT, it stays ON?
    // Let's assume Sensor is the master truth. 
    // If Manual Mode overrides sensor, we need a flag.
    // For now: If Sensor says NO FIRE, we clear it (unless we want latching).
    // Let's implement: If Sensor is LOW and fireActive is TRUE:
    else if (!flame && fireActive) {
        // We only clear if it's been active for at least some checks? 
        // Or just clear.
        trigger_fire_stop();
    }
  }

  // Active Fire Routine
  if (fireActive) {
    unsigned long now = millis();

    // 1. Stop Doors after 3 seconds
    if (!doorsStopped && (now - fireStartTime > 3000)) {
      Serial.println("[SensorManager] Stopping doors after 3s safety timeout.");
      for (int i = 0; i < NUM_DOORS; ++i) door_stop(i);
      doorsStopped = true;
    }

    // 2. Blink Lights & Buzzer (every 500ms)
    if (now - lastBlinkTime > 500) {
      lastBlinkTime = now;
      blinkState = !blinkState;
      
      if (blinkState) {
        buzzer_on();
        for (int i = 0; i < NUM_LIGHTS; ++i) light_on(i);
      } else {
        buzzer_off();
        for (int i = 0; i < NUM_LIGHTS; ++i) light_off(i);
      }
    }
  }

  // --- Rain Sensor Logic (Lower Priority) ---
  if (millis() - lastSensorRead >= 200) {
    lastSensorRead = millis(); // Update timestamp for 200ms poll

    bool rain = read_rain();
    if (rain != lastRainState) {
      lastRainState = rain;
      if (rain) {
        Serial.println("[SensorManager] Rain DETECTED!");
        char topic[MAX_TOPIC_LENGTH];
        snprintf(topic, MAX_TOPIC_LENGTH, "%s0", TOPIC_BASE_RAIN);
        mqtt_publish(topic, "detected");
      } else {
        Serial.println("[SensorManager] Rain cleared.");
        char topic[MAX_TOPIC_LENGTH];
        snprintf(topic, MAX_TOPIC_LENGTH, "%s0", TOPIC_BASE_RAIN);
        mqtt_publish(topic, "cleared");
      }
    }
  }
}
