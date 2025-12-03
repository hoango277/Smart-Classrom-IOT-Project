// Camera interface stubs
#pragma once

#include <Arduino.h>

void cam_init();
bool cam_capture_jpeg(uint8_t** buf, size_t* len);
