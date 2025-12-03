// HTTP client stubs
#pragma once

#include <Arduino.h>

bool http_post_jpeg(const uint8_t* buf, size_t len, String &resp);
