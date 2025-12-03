// Alarm actuator interface (multi-channel)
#pragma once

void alarms_init();
void alarm_on(int id);
void alarm_off(int id);
void alarm_toggle(int id);
