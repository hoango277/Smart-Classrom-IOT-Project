#pragma once

// Initialize the sensor manager and underlying drivers
void sensor_manager_init();

// Periodic tick function to poll sensors
void sensor_manager_tick();

// Manually trigger or clear fire alarm (used by MQTT)
// active = true: Trigger fire sequence
// active = false: Clear fire sequence
void sensor_manager_set_fire(bool active);
