// Application glue stubs
#include <Arduino.h>
#include "app.h"
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
  // TODO: implement runtime loop
  wifi_loop();
  mqtt_loop();
  utils_tick();
  Serial.println("hello");
}
