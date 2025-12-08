#pragma once
#include <Arduino.h>

// Process received MQTT messages and dispatch to appropriate drivers
void mqtt_process_message(const char *topic, const String &message);
