// Global configuration macros for controller firmware
#pragma once

// WiFi Configuration
#define WIFI_SSID "Duy Anh"
#define WIFI_PASS "22122004"

#define DOOR_MOVE_MS 5000
#define WINDOW_MOVE_MS 5000
#define AUTO_CLOSE_MS 30000
#define CAPTURE_INTERVAL_MS 10000

#define SENSOR_POLL_MS 200
#define EVENT_COOLDOWN_MS 1000

#define NUM_DOORS 2
#define NUM_WINDOWS 2
#define NUM_LIGHTS 2
#define NUM_ALARMS 2

#define TOPIC_EVENTS "classroom/events"
#define TOPIC_BASE_DOOR_CMD "classroom/door/"
#define TOPIC_BASE_WINDOW_CMD "classroom/window/"
#define TOPIC_BASE_LIGHT_CMD "classroom/light/"
#define TOPIC_BASE_ALARM_CMD "classroom/alarm/"
#define TOPIC_OTA_UPDATE "classroom/ota/update"
#define TOPIC_OTA_STATUS "classroom/ota/status"

#define MQTT_CLIENT_ID "smart-classroom-controller"
#define MAX_TOPIC_LENGTH 96

#define MQTT_HOST "3ee91461277b4c8ea515775a3473e668.s1.eu.hivemq.cloud"
#define MQTT_PORT 8883
#define MQTT_USER "smart_classroom"
#define MQTT_PASS "Smartclassroom15"
