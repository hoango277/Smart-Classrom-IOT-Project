// Light actuator implementation
#include <Arduino.h>
#include "../../include/pins.h"
#include "lights.h"

void lights_init()
{
  // Configure light outputs
  for (int i = 0; i < NUM_LIGHTS; i++) {
    if (LIGHT_PINS[i].pin != UNUSED_PIN) {
      pinMode(LIGHT_PINS[i].pin, OUTPUT);
      digitalWrite(LIGHT_PINS[i].pin, LIGHT_PINS[i].active_low ? HIGH : LOW);  // Turn off initially
    }
  }
  Serial.println("[Lights] Initialized");
}

void light_on(int id)
{
  if (id < 0 || id >= NUM_LIGHTS) return;
  if (LIGHT_PINS[id].pin == UNUSED_PIN) return;
  
  // Turn light on
  digitalWrite(LIGHT_PINS[id].pin, LIGHT_PINS[id].active_low ? LOW : HIGH);
}

void light_off(int id)
{
  if (id < 0 || id >= NUM_LIGHTS) return;
  if (LIGHT_PINS[id].pin == UNUSED_PIN) return;
  
  // Turn light off
  digitalWrite(LIGHT_PINS[id].pin, LIGHT_PINS[id].active_low ? HIGH : LOW);
}

void light_toggle(int id)
{
  if (id < 0 || id >= NUM_LIGHTS) return;
  if (LIGHT_PINS[id].pin == UNUSED_PIN) return;
  
  // Toggle light state
  int current = digitalRead(LIGHT_PINS[id].pin);
  digitalWrite(LIGHT_PINS[id].pin, current == HIGH ? LOW : HIGH);
}
