// Door actuator control (L298N style, active HIGH dir lines)
#include <Arduino.h>
#include "../../include/config.h"
#include "../../include/pins.h"
#include "doors.h"

static bool valid_id(int id)
{
  return id >= 0  && id < NUM_DOORS;
}

static bool wired(int id)
{;
  return DOOR_PINS[id].in1_pin != UNUSED_PIN && DOOR_PINS[id].in2_pin != UNUSED_PIN;
}

static void set_outputs(const MotorPins &p, int in1, int in2)
{
  digitalWrite(p.in1_pin, in1);
  digitalWrite(p.in2_pin, in2);
}

void doors_init()
{
  for (int i = 0; i < NUM_DOORS; ++i)
  {
    if (wired(i))
    {
      pinMode(DOOR_PINS[i].in1_pin, OUTPUT);
      pinMode(DOOR_PINS[i].in2_pin, OUTPUT);
      set_outputs(DOOR_PINS[i], LOW, LOW); 
    }
  }
  Serial.println("[Doors] Initialized");
}

void door_open(int id)
{
  Serial.print("[door] open called for id ");
  Serial.println(id);
  if (!valid_id(id))
  {
    Serial.println("[door] invalid id");
    return;
  }
  if (!wired(id))
  {
    Serial.println("[door] unwired door");
    return;
  }
  const MotorPins &p = DOOR_PINS[id];
  // Direction: IN1=HIGH, IN2=LOW -> open
  set_outputs(p, HIGH, LOW);
}

void door_close(int id)
{
  Serial.print("[door] close called for id ");
  Serial.println(id);
  if (!valid_id(id) || !wired(id))
  {
    return;
  }
  const MotorPins &p = DOOR_PINS[id];
  // Direction: IN1=LOW, IN2=HIGH -> close
  set_outputs(p, LOW, HIGH);
}

void door_stop(int id)
{
  if (!valid_id(id) || !wired(id))
  {
    return;
  }
  const MotorPins &p = DOOR_PINS[id];
  set_outputs(p, LOW, LOW);
  Serial.print("[door] stop called for id ");
  Serial.println(id);
}
