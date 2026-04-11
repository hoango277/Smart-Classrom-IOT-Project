// Application glue — initializes and ticks all subsystems
#include <Arduino.h>
#include "app.h"
#include "../drivers/nfc_store.h"
#include "../drivers/feedback.h"
#include "../drivers/rfid.h"
#include "../net/wifi.h"
#include "../net/mqtt.h"

void app_begin()
{
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n=== Smart Classroom NFC Reader ===");

  nfc_store_init();
  feedback_init();
  rfid_init();
  wifi_init();
  mqtt_init();
}

void app_tick()
{
  wifi_loop();
  mqtt_loop();
  rfid_loop();
  feedback_loop();
}
