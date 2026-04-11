// MQTT interface for NFC reader node
#pragma once

#include <Arduino.h>

void mqtt_init();
void mqtt_loop();
void mqtt_publish(const char *topic, const char *payload);
