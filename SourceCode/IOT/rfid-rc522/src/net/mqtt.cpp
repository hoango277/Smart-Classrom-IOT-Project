// MQTT client implementation for NFC reader node
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "mqtt.h"
#include "mqtt_handler.h"
#include "../../include/config.h"

static WiFiClientSecure espClient;
static PubSubClient mqttClient(espClient);
static unsigned long lastReconnectAttempt = 0;

static void mqtt_callback(char *topic, byte *payload, unsigned int length)
{
  String message;
  for (unsigned int i = 0; i < length; i++)
    message += (char)payload[i];

  Serial.print("[MQTT] Message received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  mqtt_process_message(topic, message);
}

static bool mqtt_reconnect()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("[MQTT] WiFi not connected, skipping reconnect");
    return false;
  }

  Serial.print("[MQTT] Connecting to broker...");

  if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS))
  {
    Serial.println(" Connected!");

    mqttClient.subscribe(TOPIC_NFC_SYNC);
    Serial.print("[MQTT] Subscribed: ");
    Serial.println(TOPIC_NFC_SYNC);

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

void mqtt_init()
{
  Serial.println("[MQTT] Initializing...");

  espClient.setInsecure();

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(mqtt_callback);
  mqttClient.setKeepAlive(60);
  mqttClient.setSocketTimeout(30);
  mqttClient.setBufferSize(4096);

  Serial.println("[MQTT] Configuration complete");
}

void mqtt_loop()
{
  if (!mqttClient.connected())
  {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > 5000)
    {
      lastReconnectAttempt = now;
      if (mqtt_reconnect())
        lastReconnectAttempt = 0;
    }
  }
  else
    mqttClient.loop();
}

void mqtt_publish(const char *topic, const char *payload)
{
  if (!mqttClient.connected())
  {
    Serial.println("[MQTT] Not connected, cannot publish");
    return;
  }

  if (mqttClient.publish(topic, payload))
  {
    Serial.print("[MQTT] Published [");
    Serial.print(topic);
    Serial.print("]: ");
    Serial.println(payload);
  }
  else
    Serial.println("[MQTT] Publish failed");
}
