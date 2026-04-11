// Global configuration for NFC reader node
#pragma once

// WiFi Configuration
#define WIFI_SSID "Đừng Kêu Tên Anh"
#define WIFI_PASS "hoango277"

// MQTT Configuration
#define MQTT_HOST      "3ee91461277b4c8ea515775a3473e668.s1.eu.hivemq.cloud"
#define MQTT_PORT      8883
#define MQTT_USER      "smart_classroom"
#define MQTT_PASS      "Smartclassroom15"
#define MQTT_CLIENT_ID "smart-classroom-nfc"
#define MAX_TOPIC_LENGTH 96

// MQTT Topics
#define TOPIC_DOOR_CMD    "classroom/door/0/cmd"
#define TOPIC_NFC_SYNC    "classroom/nfc/sync"
#define TOPIC_NFC_STATUS  "classroom/nfc/status"
#define TOPIC_NFC_SCANNED "classroom/nfc/scanned"

// Timing
#define SCAN_COOLDOWN_MS     3000
#define FEEDBACK_DURATION_MS 1500
#define BEEP_SHORT_MS        200
#define BEEP_LONG_MS         800

// Card storage
#define CARD_FILE_PATH "/cards.json"
#define MAX_CARDS      200
