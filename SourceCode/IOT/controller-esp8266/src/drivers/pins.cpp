// Pin mapping definitions for controller hardware
#include "../../include/pins.h"

const MotorPins DOOR_PINS[NUM_DOORS] = {
    {5, 4},   // Door 1: D1->IN1, D2->IN2
    {UNUSED_PIN, UNUSED_PIN}  // Door 2: unwired placeholder
};

const MotorPins WINDOW_PINS[NUM_WINDOWS] = {
    {14, 12},  // Window 1: D5->IN3, D6->IN4
    {UNUSED_PIN, UNUSED_PIN}  // Window 2: unwired placeholder
};

const DigitalChannelPins LIGHT_PINS[NUM_LIGHTS] = {
    {UNUSED_PIN, false},  // Light 1: unwired
    {UNUSED_PIN, false}   // Light 2: unwired
};

const DigitalChannelPins ALARM_PINS[NUM_ALARMS] = {
    {BUZZER_PIN, true},   // Alarm 1 mapped to buzzer, active LOW
    {UNUSED_PIN, false}   // Alarm 2: unwired placeholder
};
