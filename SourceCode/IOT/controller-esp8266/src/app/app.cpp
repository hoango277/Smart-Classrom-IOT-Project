// Application glue stubs
#include <Arduino.h>
#include "app.h"
#include "../../include/pins.h"
#include "../net/mqtt.h"
#include "../net/wifi.h"
#include "../drivers/doors.h"
#include "../drivers/windows.h"
#include "../drivers/lights.h"
#include "../drivers/alarms.h"
#include "../drivers/sensors.h"
#include "../drivers/buzzer.h"
#include "../utils/helpers.h"

void app_begin()
{
  // TODO: implement initialization sequence
  wifi_init();
  mqtt_init();
  doors_init();
  windows_init();
  lights_init();
  alarms_init();
  sensors_init();
  buzzer_init();
  utils_init();
}

void app_tick()
{
  // Runtime loop
  wifi_loop();
  mqtt_loop();
  utils_tick();
  
  // Check flame sensor and trigger alarm
  static unsigned long lastSensorRead = 0;
  static bool lastFlameState = false;
  
  if (millis() - lastSensorRead >= 200) {  // Check every 200ms
    lastSensorRead = millis();
    
    bool flame = read_flame();
    
    // If flame detected, turn on buzzer and LED
    if (flame) {
      if (!lastFlameState) {
        // Flame just detected
        Serial.println("[ALARM] FIRE DETECTED! Buzzer ON, LED ON");
        buzzer_on();
        light_on(0);  // Light 0 = Fire alarm LED
      }
    } else {
      if (lastFlameState) {
        // Flame cleared
        Serial.println("[ALARM] Fire cleared. Buzzer OFF, LED OFF");
        buzzer_off();
        light_off(0);
      }
    }
    
    lastFlameState = flame;
    
    // Print sensor status every second
    static unsigned long lastPrint = 0;
    if (millis() - lastPrint >= 1000) {
      lastPrint = millis();
      int flame_raw = digitalRead(FLAME_SENSOR_PIN);
      int rain_raw = digitalRead(RAIN_SENSOR_PIN);
      bool rain = read_rain();
      
      Serial.print("[Sensors] Flame: ");
      Serial.print(flame ? "DETECTED" : "OK");
      Serial.print(" (raw=");
      Serial.print(flame_raw);
      Serial.print(") | Rain: ");
      Serial.print(rain ? "DETECTED" : "OK");
      Serial.print(" (raw=");
      Serial.print(rain_raw);
      Serial.println(")");
    }
  }
}
