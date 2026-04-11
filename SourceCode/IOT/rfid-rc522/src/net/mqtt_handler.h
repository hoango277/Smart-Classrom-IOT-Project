// MQTT message handler interface
#pragma once

#include <Arduino.h>

void mqtt_process_message(const char *topic, const String &message);
