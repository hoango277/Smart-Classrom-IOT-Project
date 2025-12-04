// Sensor implementation
#include <Arduino.h>
#include "../../include/pins.h"
#include "sensors.h"

void sensors_init()
{
  // Configure sensor pins as inputs
  // Note: GPIO16 (D0) doesn't have internal pull-up, but rain sensor module should have pull-up
  pinMode(FLAME_SENSOR_PIN, INPUT);
  pinMode(RAIN_SENSOR_PIN, INPUT);
  
  Serial.println("[Sensors] Initialized - Flame: D7 (GPIO13), Rain: D0 (GPIO16)");
  Serial.println("[Sensors] Testing pin states...");
  
  // Test initial pin states
  int flame_raw = digitalRead(FLAME_SENSOR_PIN);
  int rain_raw = digitalRead(RAIN_SENSOR_PIN);
  Serial.print("[Sensors] Initial - Flame raw: ");
  Serial.print(flame_raw);
  Serial.print(" (");
  Serial.print(flame_raw == HIGH ? "HIGH" : "LOW");
  Serial.print(") | Rain raw: ");
  Serial.print(rain_raw);
  Serial.print(" (");
  Serial.print(rain_raw == HIGH ? "HIGH" : "LOW");
  Serial.println(")");
}

bool read_flame()
{
  // Read flame sensor (active LOW: LOW = flame detected)
  int raw = digitalRead(FLAME_SENSOR_PIN);
  return (raw == LOW);
}

bool read_rain()
{
  // Read rain sensor (active LOW: LOW = rain detected)
  int raw = digitalRead(RAIN_SENSOR_PIN);
  return (raw == LOW);
}
