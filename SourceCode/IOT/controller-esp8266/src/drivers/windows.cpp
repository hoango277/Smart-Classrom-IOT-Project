// Window actuator stubs
#include <Arduino.h>
#include "../../include/pins.h"
#include "windows.h"

static unsigned long window_start[NUM_WINDOWS] = {0};
static bool window_running[NUM_WINDOWS] = {false};

static bool valid_id(int id)
{
  return id >= 0 && id < NUM_WINDOWS;
}

static bool wired(int id)
{
  return WINDOW_PINS[id].in1_pin != UNUSED_PIN && WINDOW_PINS[id].in2_pin != UNUSED_PIN;
}

static void set_outputs(const MotorPins &p, int in1, int in2)
{
  digitalWrite(p.in1_pin, in1);
  digitalWrite(p.in2_pin, in2);
}

void windows_init()
{
  for (int i = 0; i < NUM_WINDOWS; ++i)
  {
    if (wired(i))
    {
      pinMode(WINDOW_PINS[i].in1_pin, OUTPUT);
      pinMode(WINDOW_PINS[i].in2_pin, OUTPUT);
      set_outputs(WINDOW_PINS[i], LOW, LOW); // idle state
    }
  }
  Serial.println("[Windows] Initialized");
}

void window_open(int id)
{
  Serial.print("[window] open called for id ");
  Serial.println(id);
  if (!valid_id(id))
  {
    Serial.println("[window] invalid id");
    return;
  }
  if (!wired(id))
  {
    Serial.println("[window] unwired window");
    return;
  }
  const MotorPins &p = WINDOW_PINS[id];
  set_outputs(p, HIGH, LOW);
  window_start[id] = millis();
  window_running[id] = true;
}

void window_close(int id)
{
  Serial.print("[window] close called for id ");
  Serial.println(id);
  if (!valid_id(id) || !wired(id))
  {
    return;
  }
  const MotorPins &p = WINDOW_PINS[id];
  set_outputs(p, LOW, HIGH);
  window_start[id] = millis();
  window_running[id] = true;
}

void window_stop(int id)
{
  if (!valid_id(id) || !wired(id))
  {
    return;
  }
  const MotorPins &p = WINDOW_PINS[id];
  set_outputs(p, LOW, LOW);
  window_running[id] = false;
  Serial.print("[window] stop called for id ");
  Serial.println(id);
}

void windows_tick()
{
  unsigned long now = millis();
  for (int i = 0; i < NUM_WINDOWS; ++i)
  {
    if (window_running[i] && (now - window_start[i] >= WINDOW_MOVE_MS))
    {
      window_stop(i);
    }
  }
}
