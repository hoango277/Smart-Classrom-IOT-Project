#include "mqtt_handler.h"
#include "../app/sensor_manager.h"
#include "mqtt.h"
#include "../../include/config.h"
#include "../drivers/doors.h"
#include "../drivers/windows.h"
#include "../drivers/lights.h"
#include "../drivers/alarms.h"
#include "../net/ota.h"

static void handle_ota_update(const String &message)
{
  // Expected message format: {"url": "http://your-server.com/api/firmware/download"}
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error && doc.containsKey("url"))
  {
    String firmwareUrl = doc["url"].as<String>();
    Serial.print("[MQTT] OTA update requested from: ");
    Serial.println(firmwareUrl);

    // Trigger OTA update
    ota_trigger_update(firmwareUrl.c_str());
  }
  else
  {
    Serial.println("[MQTT] Invalid OTA message format");
    mqtt_publish(TOPIC_OTA_STATUS, "{\"status\":\"failed\",\"reason\":\"invalid_format\"}");
  }
}

// Helper functions for specific device types
static void handle_door_command(int deviceId, const String &message)
{
  if (message == "open")
    door_open(deviceId);
  else if (message == "close")
    door_close(deviceId);
  else if (message == "stop")
    door_stop(deviceId);
}

static void handle_window_command(int deviceId, const String &message)
{
  if (message == "open")
    window_open(deviceId);
  else if (message == "close")
    window_close(deviceId);
  else if (message == "stop")
    window_stop(deviceId);
}

static void handle_light_command(int deviceId, const String &message)
{
  if (message == "on")
    light_on(deviceId);
  else if (message == "off")
    light_off(deviceId);
  else if (message == "toggle")
    light_toggle(deviceId);
}

static void handle_alarm_command(int deviceId, const String &message)
{
  // User req: Handle "detected" or "cleared" similar to fire logic
  if (message == "detected" || message == "on")
  {
    Serial.println("[MQTT] Alarm CMD: DETECTED/ON");
    sensor_manager_set_fire(true);
  }
  else if (message == "cleared" || message == "off")
  {
    Serial.println("[MQTT] Alarm CMD: CLEARED/OFF");
    sensor_manager_set_fire(false);
  }
}

static void handle_rain_command(int deviceId, const String &message)
{
  // If rain is detected (or any trigger message like "detected" or "on")
  // We close ALL windows
  if (message == "detected" || message == "on" || message == "close")
  {
    Serial.println("[MQTT] Rain alert received! Closing all windows...");
    for (int i = 0; i < NUM_WINDOWS; ++i)
    {
      window_close(i);
    }
  }
}

void mqtt_process_message(const char *topic, const String &message)
{
  int deviceId = -1;

  // Dispatch based on topic
  if (!strcmp(topic, TOPIC_OTA_UPDATE))
  {
    handle_ota_update(message);
  }
  else if (topic_parse_id(topic, TOPIC_BASE_DOOR_CMD, &deviceId))
  {
    handle_door_command(deviceId, message);
  }
  else if (topic_parse_id(topic, TOPIC_BASE_WINDOW_CMD, &deviceId))
  {
    handle_window_command(deviceId, message);
  }
  else if (topic_parse_id(topic, TOPIC_BASE_LIGHT_CMD, &deviceId))
  {
    handle_light_command(deviceId, message);
  }
  else if (topic_parse_id(topic, TOPIC_BASE_ALARM_CMD, &deviceId))
  {
    handle_alarm_command(deviceId, message);
  }
  else if (topic_parse_id(topic, TOPIC_BASE_RAIN, &deviceId))
  {
    handle_rain_command(deviceId, message);
  }
}
