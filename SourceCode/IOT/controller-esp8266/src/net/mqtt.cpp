// MQTT interface implementation for controller
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "mqtt.h"
#include "../../include/config.h"
#include "mqtt_handler.h"

// MQTT client setup
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

unsigned long lastReconnectAttempt = 0;

// Forward declaration
void mqtt_callback(char *topic, byte *payload, unsigned int length);
bool mqtt_reconnect();

void mqtt_init()
{
  Serial.println("[MQTT] Initializing...");

  // Configure secure connection for HiveMQ Cloud
  espClient.setInsecure(); // Use this for testing (not validating SSL certificate)
  // For production, use: espClient.setCACert(ca_cert);

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(mqtt_callback);
  mqttClient.setKeepAlive(60);
  mqttClient.setSocketTimeout(30);

  Serial.println("[MQTT] Configuration complete");
}

void mqtt_loop()
{
  if (!mqttClient.connected())
  {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > 5000)
    { // Try reconnect every 5 seconds
      lastReconnectAttempt = now;
      if (mqtt_reconnect())
        lastReconnectAttempt = 0;
    }
  }
  else
    mqttClient.loop();
}

bool mqtt_reconnect()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("[MQTT] WiFi not connected, skipping MQTT reconnect");
    return false;
  }

  Serial.print("[MQTT] Connecting to broker...");

  if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS))
  {
    Serial.println(" Connected!");

    // Subscribe to command topics
    char topic[MAX_TOPIC_LENGTH];

    // Subscribe to OTA update topic
    mqttClient.subscribe(TOPIC_OTA_UPDATE);
    Serial.print("[MQTT] Subscribed: ");
    Serial.println(TOPIC_OTA_UPDATE);

    // Subscribe to all door commands
    for (int i = 0; i < NUM_DOORS; ++i)
    {
      snprintf(topic, MAX_TOPIC_LENGTH, "%s%d/cmd", TOPIC_BASE_DOOR_CMD, i);
      mqttClient.subscribe(topic);
      Serial.print("[MQTT] Subscribed: ");
      Serial.println(topic);
    }

    // Subscribe to all window commands
    for (int i = 0; i < NUM_WINDOWS; ++i)
    {
      snprintf(topic, MAX_TOPIC_LENGTH, "%s%d/cmd", TOPIC_BASE_WINDOW_CMD, i);
      mqttClient.subscribe(topic);
      Serial.print("[MQTT] Subscribed: ");
      Serial.println(topic);
    }

    // Subscribe to all light commands
    for (int i = 0; i < NUM_LIGHTS; ++i)
    {
      snprintf(topic, MAX_TOPIC_LENGTH, "%s%d/cmd", TOPIC_BASE_LIGHT_CMD, i);
      mqttClient.subscribe(topic);
      Serial.print("[MQTT] Subscribed: ");
      Serial.println(topic);
    }

    // Subscribe to all alarm commands
    for (int i = 0; i < NUM_ALARMS; ++i)
    {
      snprintf(topic, MAX_TOPIC_LENGTH, "%s%d/cmd", TOPIC_BASE_ALARM_CMD, i);
      mqttClient.subscribe(topic);
      Serial.print("[MQTT] Subscribed: ");
      Serial.println(topic);
    }

    // Subscribe to all rain commands (close windows when raining)
    // Topic: classroom/rain/+/cmd
    for (int i = 0; i < NUM_ALARMS; ++i)
    {
      snprintf(topic, MAX_TOPIC_LENGTH, "%s%d/cmd", TOPIC_BASE_RAIN, i);
      mqttClient.subscribe(topic);
      Serial.print("[MQTT] Subscribed: ");
      Serial.println(topic);
    }

    return true;
  }
  else
  {
    Serial.print(" Failed! rc=");
    Serial.print(mqttClient.state());
    Serial.println(" retrying in 5 seconds");
    return false;
  }
}

void mqtt_callback(char *topic, byte *payload, unsigned int length)
{
  // Convert payload to string
  String message;
  for (unsigned int i = 0; i < length; ++i)
    message += (char)payload[i];

  Serial.print("[MQTT] Message received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  mqtt_process_message(topic, message);
}

void mqtt_publish_sensor(JsonDocument &doc)
{
  if (!mqttClient.connected())
  {
    Serial.println("[MQTT] Not connected, cannot publish sensor data");
    return;
  }

  String payload;
  serializeJson(doc, payload);

  if (mqttClient.publish(TOPIC_EVENTS, payload.c_str()))
  {
    Serial.print("[MQTT] Sensor data published: ");
    Serial.println(payload);
  }
  else
    Serial.println("[MQTT] Failed to publish sensor data");
}

void mqtt_publish(const char *topic, const String &payload)
{
  if (!mqttClient.connected())
  {
    Serial.println("[MQTT] Not connected, cannot publish");
    return;
  }

  if (mqttClient.publish(topic, payload.c_str()))
  {
    Serial.print("[MQTT] Published to ");
    Serial.print(topic);
    Serial.print(": ");
    Serial.println(payload);
  }
  else
    Serial.println("[MQTT] Publish failed");
}

bool topic_parse_id(const char *topic, const char *base, int *outId)
{
  // Check if topic starts with base
  size_t baseLen = strlen(base);
  if (strncmp(topic, base, baseLen))
    return false;

  // Extract ID (number after base)
  const char *idStr = topic + baseLen;
  char *endPtr;
  long id = strtol(idStr, &endPtr, 10);

  // Check if conversion was successful and followed by "/cmd"
  if (endPtr == idStr || strcmp(endPtr, "/cmd"))
    return false;

  *outId = (int)id;
  return true;
}

void topic_build(char *out, size_t outLen, const char *base, int id, const char *suffix)
{
  snprintf(out, outLen, "%s%d%s", base, id, suffix ? suffix : "");
}
