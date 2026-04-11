// RC522 RFID reader driver — scan, verify, feedback, publish
#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include "rfid.h"
#include "nfc_store.h"
#include "feedback.h"
#include "../net/mqtt.h"
#include "../../include/config.h"
#include "../../include/pins.h"

static MFRC522 mfrc522(RC522_SDA_PIN, RC522_RST_PIN);
static unsigned long lastScanTime = 0;
static String lastScannedUid = "";

// Convert raw UID bytes to uppercase hex string (e.g. "A3B2C1D0")
static String uid_to_hex()
{
  String hex = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    if (mfrc522.uid.uidByte[i] < 0x10) hex += "0";
    hex += String(mfrc522.uid.uidByte[i], HEX);
  }
  hex.toUpperCase();
  return hex;
}

void rfid_init()
{
  SPI.begin();
  mfrc522.PCD_Init();
  delay(10);

  Serial.print("[RFID] ");
  mfrc522.PCD_DumpVersionToSerial();
  Serial.println("[RFID] Reader initialized");
}

void rfid_loop()
{
  // Check for new card
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uid = uid_to_hex();

  // Cooldown: ignore same card within SCAN_COOLDOWN_MS
  if (uid == lastScannedUid && millis() - lastScanTime < SCAN_COOLDOWN_MS)
  {
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    return;
  }

  lastScannedUid = uid;
  lastScanTime = millis();

  Serial.print("[RFID] Card scanned: ");
  Serial.println(uid);

  // Publish scanned UID for registration/logging
  String scanPayload = "{\"uid\":\"" + uid + "\"}";
  mqtt_publish(TOPIC_NFC_SCANNED, scanPayload.c_str());

  // Verify against local card store
  if (nfc_store_verify(uid.c_str()))
  {
    Serial.println("[RFID] Access GRANTED");
    feedback_access_granted();
    mqtt_publish(TOPIC_DOOR_CMD, "open");
  }
  else
  {
    Serial.println("[RFID] Access DENIED");
    feedback_access_denied();
  }

  // Release card
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
