// Wi-Fi interface implementation
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "wifi.h"
#include "../../include/config.h"

void wifi_init()
{
  Serial.println("\n[WiFi] Initializing...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.print("[WiFi] Connecting to ");
  Serial.print(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30)
  {
    delay(500);
    Serial.print(".");
    ++attempts;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  }
  else
    Serial.println("\n[WiFi] Connection failed!");
}

void wifi_loop()
{
  // Auto-reconnect if connection lost
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 30000)
  {
    // Check every 30 seconds
    lastCheck = millis();

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("[WiFi] Connection lost! Reconnecting...");
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASS);
    }
  }
}
