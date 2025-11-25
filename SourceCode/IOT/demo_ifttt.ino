#include "secrets.h"


#include <ESP8266WiFi.h>
#include "AdafruitIO_WiFi.h"

const int LED_PIN = D1;
const bool ACTIVE_LOW = false;

AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
AdafruitIO_Feed *lamp = io.feed("lamp");

void setLed(bool on){
  bool level = on ? HIGH : LOW;
  if (ACTIVE_LOW) level = !level;
  digitalWrite(LED_PIN, level);
}

void handleMessage(AdafruitIO_Data *data) {
  String v = data->toString();
  v.trim(); v.toUpperCase();

  Serial.print("[AIO] lamp feed = ");
  Serial.println(v);

  if (v == "ON")  setLed(true);
  if (v == "OFF") setLed(false);
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(LED_PIN, OUTPUT);
  setLed(false);

  Serial.println();
  Serial.println("[BOOT] Starting...");

  Serial.print("[AIO] Connecting to Adafruit IO");
  io.connect();
  lamp->onMessage(handleMessage);

  // Đợi tới khi AIO connected (WiFi cũng sẽ được connect bên trong)
 Serial.print("[AIO] Connecting");
unsigned long t0 = millis();
while (io.status() < AIO_CONNECTED) {
  io.run();
  delay(10);
  if (millis() - t0 > 30000) { // 30s timeout
    Serial.print("\n[AIO] FAILED: ");
    Serial.println(io.statusText());
    break;
  }
}
Serial.print("\n[AIO] Status: ");
Serial.println(io.statusText());

  Serial.println("[AIO] Connected!");
  Serial.print("[AIO] Status: ");
  Serial.println(io.statusText());

  // Log WiFi sau khi AIO đã connected
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[WiFi] Connected. IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.print("[WiFi] NOT connected. status=");
    Serial.println(WiFi.status());
  }

  lamp->get(); // lấy trạng thái hiện tại feed
}

void loop() {
  io.run();
}
