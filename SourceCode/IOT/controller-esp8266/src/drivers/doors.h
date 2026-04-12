// Door actuator interface (multi-channel)
#pragma once

void doors_init();
void doors_tick();
void door_open(int id);
void door_close(int id);
void door_stop(int id);
