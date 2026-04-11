// NFC card storage implementation using LittleFS
#include <Arduino.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include "nfc_store.h"
#include "../../include/config.h"

static bool fs_mounted = false;

// Load cards JSON from file into doc. Returns false on any failure.
static bool load_cards(JsonDocument &doc)
{
  if (!fs_mounted) return false;

  File f = LittleFS.open(CARD_FILE_PATH, "r");
  if (!f)
  {
    Serial.println("[NfcStore] Card file not found");
    return false;
  }

  DeserializationError err = deserializeJson(doc, f);
  f.close();

  if (err)
  {
    Serial.print("[NfcStore] JSON parse error: ");
    Serial.println(err.c_str());
    return false;
  }
  return true;
}

// Save cards JSON doc to file. Returns false on failure.
static bool save_cards(JsonDocument &doc)
{
  if (!fs_mounted) return false;

  File f = LittleFS.open(CARD_FILE_PATH, "w");
  if (!f)
  {
    Serial.println("[NfcStore] Failed to open file for writing");
    return false;
  }

  serializeJson(doc, f);
  f.close();

  Serial.print("[NfcStore] Saved ");
  Serial.print(doc.as<JsonArray>().size());
  Serial.println(" cards");
  return true;
}

void nfc_store_init()
{
  Serial.println("[NfcStore] Initializing LittleFS...");

  if (!LittleFS.begin())
  {
    Serial.println("[NfcStore] Mount failed, attempting format...");
    LittleFS.format();
    if (!LittleFS.begin())
    {
      Serial.println("[NfcStore] CRITICAL: LittleFS unavailable! All access denied.");
      fs_mounted = false;
      return;
    }
  }

  fs_mounted = true;

  // Create empty card file if it doesn't exist
  if (!LittleFS.exists(CARD_FILE_PATH))
  {
    Serial.println("[NfcStore] Creating empty card file");
    JsonDocument doc;
    doc.to<JsonArray>();
    save_cards(doc);
  }

  Serial.print("[NfcStore] Ready, ");
  Serial.print(nfc_store_count());
  Serial.println(" cards loaded");
}

bool nfc_store_verify(const char *uid)
{
  if (!fs_mounted)
  {
    Serial.println("[NfcStore] FS not mounted, denying access");
    return false;
  }

  JsonDocument doc;
  if (!load_cards(doc)) return false;

  JsonArray arr = doc.as<JsonArray>();
  for (JsonObject card : arr)
  {
    if (strcasecmp(card["uid"].as<const char *>(), uid) == 0)
      return true;
  }
  return false;
}

bool nfc_store_add(const char *uid, const char *username)
{
  if (!fs_mounted) return false;

  JsonDocument doc;
  if (!load_cards(doc))
  {
    // File missing or corrupt — start fresh
    doc.to<JsonArray>();
  }

  JsonArray arr = doc.as<JsonArray>();

  // Check duplicate
  for (JsonObject card : arr)
  {
    if (strcasecmp(card["uid"].as<const char *>(), uid) == 0)
    {
      Serial.print("[NfcStore] Card already exists: ");
      Serial.println(uid);
      return true;
    }
  }

  // Check capacity
  if ((int)arr.size() >= MAX_CARDS)
  {
    Serial.println("[NfcStore] Card limit reached");
    return false;
  }

  JsonObject entry = arr.add<JsonObject>();
  entry["uid"] = uid;
  entry["username"] = username;

  if (!save_cards(doc)) return false;

  Serial.print("[NfcStore] Added: ");
  Serial.print(uid);
  Serial.print(" (");
  Serial.print(username);
  Serial.println(")");
  return true;
}

bool nfc_store_remove(const char *uid)
{
  if (!fs_mounted) return false;

  JsonDocument doc;
  if (!load_cards(doc)) return false;

  JsonArray arr = doc.as<JsonArray>();
  for (size_t i = 0; i < arr.size(); i++)
  {
    if (strcasecmp(arr[i]["uid"].as<const char *>(), uid) == 0)
    {
      arr.remove(i);
      save_cards(doc);
      Serial.print("[NfcStore] Removed: ");
      Serial.println(uid);
      return true;
    }
  }

  Serial.print("[NfcStore] Card not found: ");
  Serial.println(uid);
  return false;
}

bool nfc_store_sync_all(JsonArray &cards)
{
  if (!fs_mounted) return false;

  JsonDocument doc;
  JsonArray arr = doc.to<JsonArray>();

  int count = 0;
  for (JsonObject card : cards)
  {
    if (count >= MAX_CARDS) break;
    JsonObject entry = arr.add<JsonObject>();
    entry["uid"] = card["uid"];
    entry["username"] = card["username"];
    count++;
  }

  if (!save_cards(doc)) return false;

  Serial.print("[NfcStore] Full sync complete: ");
  Serial.print(count);
  Serial.println(" cards");
  return true;
}

int nfc_store_count()
{
  if (!fs_mounted) return 0;

  JsonDocument doc;
  if (!load_cards(doc)) return 0;

  return doc.as<JsonArray>().size();
}
