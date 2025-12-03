// Camera driver stubs
#include <Arduino.h>
#include <esp_camera.h>
#include "../../include/pins.h"
#include "cam.h"

void cam_init()
{
  // TODO: configure camera sensor
}

bool cam_capture_jpeg(uint8_t** buf, size_t* len)
{
  // TODO: capture JPEG frame
  (void)buf;
  (void)len;
  return false;
}
