// Pin mapping for ESP8266 controller (L298N + sensors)
#pragma once

#include "config.h"

typedef struct
{
  int in1_pin;
  int in2_pin;
} MotorPins;

typedef struct
{
  int pin;
  bool active_low;
} DigitalChannelPins;

extern const MotorPins DOOR_PINS[NUM_DOORS];
extern const MotorPins WINDOW_PINS[NUM_WINDOWS];
extern const DigitalChannelPins LIGHT_PINS[NUM_LIGHTS];
extern const DigitalChannelPins ALARM_PINS[NUM_ALARMS];

#define FLAME_SENSOR_PIN 13   // D7, active LOW
#define RAIN_SENSOR_PIN 16    // D0, active LOW
#define BUZZER_PIN 2          // D4, active LOW
#define FIRE_LED_PIN 0        // D3 (GPIO0), for fire alarm LED

#define UNUSED_PIN -1
