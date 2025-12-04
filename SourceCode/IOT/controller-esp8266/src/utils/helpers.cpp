// Utility implementation
#include <Arduino.h>
#include "helpers.h"

void utils_init()
{
  // Initialize Serial for debugging
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n=== Smart Classroom Controller ===");
  Serial.println("Serial initialized at 115200 baud");
}

void utils_tick()
{
  // Periodic utility work (if needed)
}
