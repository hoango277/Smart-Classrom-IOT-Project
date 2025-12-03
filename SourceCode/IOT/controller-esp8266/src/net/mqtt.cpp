// MQTT interface stubs for controller
#include <Arduino.h>
#include <ArduinoJson.h>
#include "mqtt.h"
#include "../../include/config.h"
#include "../../include/secrets.h"

void mqtt_init()
{
  // TODO: implement MQTT setup
}

void mqtt_loop()
{
  // TODO: implement MQTT loop
}

void mqtt_publish_sensor(JsonDocument &doc)
{
  // TODO: implement sensor publish
  (void)doc;
}

void mqtt_publish(const char* topic, const String &payload)
{
  // TODO: implement generic publish
  (void)topic;
  (void)payload;
}

bool topic_parse_id(const char* topic, const char* base, int* outId)
{
  // TODO: parse topic to extract id
  (void)topic;
  (void)base;
  (void)outId;
  return false;
}

void topic_build(char* out, size_t outLen, const char* base, int id, const char* suffix)
{
  // TODO: build topic string
  (void)out;
  (void)outLen;
  (void)base;
  (void)id;
  (void)suffix;
}
