// Application glue stubs
#include <Arduino.h>
#include <ArduinoJson.h>
#include "app.h"
#include "../net/mqtt.h"
#include "../net/wifi.h"
#include "../net/ota.h"
#include "../drivers/doors.h"
#include "../drivers/windows.h"
#include "../drivers/lights.h"
#include "../drivers/alarms.h"
#include "../drivers/sensors.h"
#include "../drivers/dht.h"
#include "../drivers/buzzer.h"
#include "../utils/helpers.h"
#include "../../include/pins.h"

void app_begin()
{
  // TODO: implement initialization sequence
  wifi_init();
  mqtt_init();
  ota_init();
  doors_init();
  windows_init();
  lights_init();
  alarms_init();
  sensors_init();
  dht_init();
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

  if (millis() - lastSensorRead >= 200)
  { // Check every 200ms
    lastSensorRead = millis();

    bool flame = read_flame();

    // If flame detected, turn on buzzer and LED
    if (flame)
    {
      if (!lastFlameState)
      {
        // Flame just detected
        Serial.println("[ALARM] FIRE DETECTED! Buzzer ON, LED ON");
        buzzer_on();
        door_open(0);
        window_open(0);
        // door_stop(0);
        // window_stop(0);
        light_on(0); // Light 0 = Fire alarm LED
      }
    }
    else
    {
      if (lastFlameState)
      {
        // Flame cleared
        Serial.println("[ALARM] Fire cleared. Buzzer OFF, LED OFF");
        buzzer_off();
        door_close(0);
        window_close(0);
        // door_stop(0);
        // window_stop(0);
        light_off(0);
      }
    }

    lastFlameState = flame;

    // Print and publish sensor status every second
    static unsigned long lastPrint = 0;
    if (millis() - lastPrint >= 1000)
    {
      lastPrint = millis();

      // Read all sensors
      int flame_raw = digitalRead(FLAME_SENSOR_PIN);
      int rain_raw = digitalRead(RAIN_SENSOR_PIN);
      bool rain = read_rain();
      float humidity = 0.0f, tempC = 0.0f;
      bool dht_ok = dht_read(&humidity, &tempC);

      // Print to Serial (for debugging)
      Serial.print("[Sensors] Flame: ");
      Serial.print(flame ? "DETECTED" : "OK");
      Serial.print(" (raw=");
      Serial.print(flame_raw);
      Serial.print(") | Rain: ");
      Serial.print(rain ? "DETECTED" : "OK");
      Serial.print(" (raw=");
      Serial.print(rain_raw);
      Serial.print(") | Temp: ");
      if (dht_ok)
      {
        Serial.print(tempC, 1);
        Serial.print("C | Humidity: ");
        Serial.print(humidity, 0);
        Serial.print("%");
      }
      else
      {
        Serial.print("ERR | Humidity: ERR");
      }
      Serial.println();

      // Create JSON document for MQTT
      // JsonDocument doc;
      // doc["timestamp"] = millis();
      // doc["device_id"] = MQTT_CLIENT_ID;

      // // Sensor data
      // JsonObject sensors = doc["sensors"].to<JsonObject>();

      // sensors["flame"]["detected"] = flame;
      // sensors["flame"]["raw"] = flame_raw;

      // sensors["rain"]["detected"] = rain;
      // sensors["rain"]["raw"] = rain_raw;

      // if (dht_ok)
      // {
      //   sensors["temperature"]["value"] = tempC;
      //   sensors["temperature"]["unit"] = "C";
      //   sensors["humidity"]["value"] = humidity;
      //   sensors["humidity"]["unit"] = "%";
      // }
      // else
      // {
      //   sensors["temperature"]["value"] = nullptr;
      //   sensors["temperature"]["unit"] = "C";
      //   sensors["humidity"]["value"] = nullptr;
      //   sensors["humidity"]["unit"] = "%";
      // }

      // // Publish to MQTT
      // mqtt_publish_sensor(doc);
    }
  }
}
