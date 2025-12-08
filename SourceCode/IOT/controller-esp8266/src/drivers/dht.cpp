// DHT11 temperature/humidity driver implementation
#include <Arduino.h>
#include <DHT.h>
#include "../../include/pins.h"
#include "dht.h"

static DHT dht(DHT11_PIN, DHT11);
static bool dht_ready = false;

bool dht_init()
{
  dht.begin();
  dht_ready = true;
  Serial.println("[DHT] Initialized on D8 (GPIO15)");
  return true;
}

bool dht_read(float *humidity, float *tempC)
{
  if (!dht_ready)
    return false;

  float h = dht.readHumidity();
  float t = dht.readTemperature(); // Celsius

  if (isnan(h) || isnan(t))
    return false;

  if (humidity)
    *humidity = h;
  if (tempC)
    *tempC = t;
  return true;
}

float dht_read_humidity()
{
  float h = NAN;
  dht_read(&h, nullptr);
  return h;
}

float dht_read_temperature_c()
{
  float t = NAN;
  dht_read(nullptr, &t);
  return t;
}
