// OTA Update implementation via HTTP/HTTPS
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266httpUpdate.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "ota.h"
#include "mqtt.h"
#include "../../include/config.h"
#include "../../include/secrets.h"

// Firmware version
#define FIRMWARE_VERSION "1.0.0"

// Helper function to detect if URL is HTTPS
bool isHTTPS(const char *url)
{
    return strncmp(url, "https://", 8) == 0;
}

void ota_init()
{
    Serial.println("[OTA] Initialized");
    Serial.print("[OTA] Current firmware version: ");
    Serial.println(FIRMWARE_VERSION);
}

void ota_trigger_update(const char *firmwareUrl)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("[OTA] WiFi not connected, cannot update");
        mqtt_publish(TOPIC_OTA_STATUS, "{\"status\":\"failed\",\"reason\":\"wifi_not_connected\"}");
        return;
    }

    Serial.println("[OTA] Manual update triggered!");
    Serial.print("[OTA] Downloading from: ");
    Serial.println(firmwareUrl);

    mqtt_publish(TOPIC_OTA_STATUS, "{\"status\":\"downloading\"}");

    // Configure update callbacks
    ESPhttpUpdate.setLedPin(LED_BUILTIN, LOW);
    ESPhttpUpdate.onStart([]()
                          { Serial.println("[OTA] Update started"); });

    ESPhttpUpdate.onEnd([]()
                        {
    Serial.println("\n[OTA] Update finished");
    mqtt_publish(TOPIC_OTA_STATUS, "{\"status\":\"success\"}"); });

    ESPhttpUpdate.onProgress([](int current, int total)
                             { Serial.printf("[OTA] Progress: %d%%\r", (current * 100) / total); });

    ESPhttpUpdate.onError([](int error)
                          {
    Serial.printf("\n[OTA] Error (%d): ", error);
    Serial.println(ESPhttpUpdate.getLastErrorString().c_str());
    
    String errorMsg = "{\"status\":\"failed\",\"error\":\"" + ESPhttpUpdate.getLastErrorString() + "\"}";
    mqtt_publish(TOPIC_OTA_STATUS, errorMsg); });

    // Perform update with appropriate client
    t_httpUpdate_return ret;

    if (isHTTPS(firmwareUrl))
    {
        Serial.println("[OTA] Using HTTPS (insecure mode)");
        WiFiClientSecure client;
        client.setInsecure(); // Skip SSL certificate validation
        ret = ESPhttpUpdate.update(client, firmwareUrl);
    }
    else
    {
        Serial.println("[OTA] Using HTTP");
        WiFiClient client;
        ret = ESPhttpUpdate.update(client, firmwareUrl);
    }

    switch (ret)
    {
    case HTTP_UPDATE_FAILED:
        Serial.printf("[OTA] Update failed: %s\n", ESPhttpUpdate.getLastErrorString().c_str());
        break;

    case HTTP_UPDATE_NO_UPDATES:
        Serial.println("[OTA] No updates available (server response)");
        mqtt_publish(TOPIC_OTA_STATUS, "{\"status\":\"no_updates\"}");
        break;

    case HTTP_UPDATE_OK:
        Serial.println("[OTA] Update successful! Rebooting...");
        delay(1000);
        ESP.restart();
        break;
    }
}
