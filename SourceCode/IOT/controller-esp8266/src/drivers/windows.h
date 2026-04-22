// Window actuator interface (multi-channel)
#pragma once

void windows_init();
void windows_tick();
void window_open(int id);
void window_close(int id);
void window_stop(int id);
