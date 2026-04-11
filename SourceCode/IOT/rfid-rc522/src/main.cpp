// Entry point kept minimal
#include <Arduino.h>
#include "app/app.h"

void setup()
{
  app_begin();
}

void loop()
{
  app_tick();
}
