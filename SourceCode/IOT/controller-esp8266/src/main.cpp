// Entry point kept minimal
#include <Arduino.h>
#include "app/app.h"

void setup()
{
  Serial.begin(115200);
  app_begin();
}

void loop()
{
  app_tick();
}
