// MQTT message handler — dispatches sync commands to NFC store
#include <Arduino.h>
#include <ArduinoJson.h>
#include "mqtt_handler.h"
#include "mqtt.h"
#include "../drivers/nfc_store.h"
#include "../drivers/feedback.h"
#include "../../include/config.h"

static void handle_nfc_sync(const String &message)
{
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, message);

  if (err)
  {
    Serial.print("[MqttHandler] JSON parse error: ");
    Serial.println(err.c_str());
    return;
  }

  const char *action = doc["action"];
  if (!action)
  {
    Serial.println("[MqttHandler] Missing 'action' field");
    return;
  }

  if (strcmp(action, "add") == 0)
  {
    const char *uid = doc["uid"];
    const char *username = doc["username"];
    if (!uid || !username)
    {
      Serial.println("[MqttHandler] sync add: missing uid or username");
      return;
    }
    nfc_store_add(uid, username);
    feedback_sync_ok();

    // Ack back to backend
    String ack = "{\"action\":\"add\",\"uid\":\"" + String(uid) + "\",\"status\":\"ok\"}";
    mqtt_publish(TOPIC_NFC_STATUS, ack.c_str());
  }
  else if (strcmp(action, "remove") == 0)
  {
    const char *uid = doc["uid"];
    if (!uid)
    {
      Serial.println("[MqttHandler] sync remove: missing uid");
      return;
    }
    nfc_store_remove(uid);
    feedback_sync_ok();

    String ack = "{\"action\":\"remove\",\"uid\":\"" + String(uid) + "\",\"status\":\"ok\"}";
    mqtt_publish(TOPIC_NFC_STATUS, ack.c_str());
  }
  else if (strcmp(action, "sync_all") == 0)
  {
    JsonArray cards = doc["cards"].as<JsonArray>();
    if (cards.isNull())
    {
      Serial.println("[MqttHandler] sync_all: missing 'cards' array");
      return;
    }
    nfc_store_sync_all(cards);
    feedback_sync_ok();

    String ack = "{\"action\":\"sync_all\",\"count\":" + String(nfc_store_count()) + ",\"status\":\"ok\"}";
    mqtt_publish(TOPIC_NFC_STATUS, ack.c_str());
  }
  else
  {
    Serial.print("[MqttHandler] Unknown action: ");
    Serial.println(action);
  }
}

void mqtt_process_message(const char *topic, const String &message)
{
  if (strcmp(topic, TOPIC_NFC_SYNC) == 0)
    handle_nfc_sync(message);
  else
  {
    Serial.print("[MqttHandler] Unhandled topic: ");
    Serial.println(topic);
  }
}
