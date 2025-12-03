// MQTT interface stubs for controller
#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>

void mqtt_init();
void mqtt_loop();
void mqtt_publish_sensor(JsonDocument &doc);
void mqtt_publish(const char* topic, const String &payload);

bool topic_parse_id(const char* topic, const char* base, int* outId);
void topic_build(char* out, size_t outLen, const char* base, int id, const char* suffix);
