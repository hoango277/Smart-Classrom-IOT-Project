// NFC card storage interface (LittleFS-backed)
#pragma once

#include <ArduinoJson.h>

void nfc_store_init();
bool nfc_store_verify(const char *uid);
bool nfc_store_add(const char *uid, const char *username);
bool nfc_store_remove(const char *uid);
bool nfc_store_sync_all(JsonArray &cards);
int  nfc_store_count();
