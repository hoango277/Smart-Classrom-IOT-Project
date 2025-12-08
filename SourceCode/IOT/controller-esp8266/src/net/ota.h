// OTA Update interface
#pragma once

void ota_init();
void ota_trigger_update(const char *firmwareUrl);
void ota_check_update();
bool ota_update_available();
void ota_perform_update();
