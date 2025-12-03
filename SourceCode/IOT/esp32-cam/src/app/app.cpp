// Application glue stubs
#include <Arduino.h>
#include "app.h"
#include "../drivers/cam.h"
#include "../net/http.h"
#include "../net/mqtt.h"
#include "../net/wifi.h"
#include "../utils/helpers.h"

void app_begin()
{
  // TODO: implement initialization sequence
  wifi_init();
  mqtt_init();
  cam_init();
  utils_init();
}

void app_tick()
{
  // TODO: implement runtime loop
  wifi_loop();
  mqtt_loop();
  utils_tick();
}
