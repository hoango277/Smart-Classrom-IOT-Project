// Application glue stubs
#include <Arduino.h>
#include <ArduinoJson.h>
#include "app.h"
#include "sensor_manager.h"
#include "../../include/pins.h"
#include "../net/mqtt.h"
#include "../net/wifi.h"
#include "../net/ota.h"
#include "../drivers/doors.h"
#include "../drivers/windows.h"
#include "../drivers/lights.h"
#include "../utils/helpers.h"
#include "../../include/pins.h"

void app_begin()
{
  wifi_init();
  mqtt_init();
  ota_init();
  doors_init();
  windows_init();
  lights_init();
  utils_init();
  sensor_manager_init();
}

void app_tick()
{
  wifi_loop();
  mqtt_loop();

  doors_tick();
  windows_tick();
  utils_tick();
  sensor_manager_tick();
}
