// DHT11 temperature/humidity driver interface
#pragma once

bool dht_init();
bool dht_read(float *humidity, float *tempC);
float dht_read_humidity();
float dht_read_temperature_c();
