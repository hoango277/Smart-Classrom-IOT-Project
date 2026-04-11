// LED and buzzer feedback driver interface
#pragma once

void feedback_init();
void feedback_loop();
void feedback_access_granted();
void feedback_access_denied();
void feedback_sync_ok();
