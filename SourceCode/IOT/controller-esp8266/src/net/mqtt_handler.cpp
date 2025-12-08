#include "mqtt_handler.h"
#include "mqtt.h"
#include "../../include/config.h"
#include "../drivers/doors.h"
#include "../drivers/windows.h"
#include "../drivers/lights.h"
#include "../drivers/alarms.h"

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
  if (message == "on")
    alarm_on(deviceId);
  else if (message == "off")
    alarm_off(deviceId);
  else if (message == "toggle")
    alarm_toggle(deviceId);
}

void mqtt_process_message(const char *topic, const String &message)
{
  int deviceId = -1;

  // Dispatch based on topic
  if (topic_parse_id(topic, TOPIC_BASE_DOOR_CMD, &deviceId))
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
}
