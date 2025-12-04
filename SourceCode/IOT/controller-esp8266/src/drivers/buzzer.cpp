// Buzzer driver implementation
#include <Arduino.h>
#include "../../include/pins.h"
#include "buzzer.h"

void buzzer_init()
{
  // Configure buzzer pin as output
  // Note: GPIO2 (D4) has internal pull-up, try active HIGH first
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);  // Turn off buzzer initially (try active HIGH)
  Serial.println("[Buzzer] Initialized on D4 (GPIO2) - OFF");
}

void buzzer_on()
{
  // Turn buzzer on (try active HIGH: HIGH = ON)
  digitalWrite(BUZZER_PIN, HIGH);
}

void buzzer_off()
{
  // Turn buzzer off (active HIGH: LOW = OFF)
  digitalWrite(BUZZER_PIN, LOW);
}
