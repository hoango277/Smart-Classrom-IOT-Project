// LED and buzzer feedback driver (non-blocking)
#include <Arduino.h>
#include "feedback.h"
#include "../../include/pins.h"
#include "../../include/config.h"

enum FeedbackType
{
  FB_NONE,
  FB_GRANTED,
  FB_DENIED,
  FB_SYNC_OK
};

static FeedbackType currentFeedback = FB_NONE;
static unsigned long feedbackStart = 0;
static bool buzzerOff = false;

static void all_off()
{
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void feedback_init()
{
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  all_off();
  Serial.println("[Feedback] Initialized");
}

void feedback_access_granted()
{
  all_off();
  digitalWrite(LED_GREEN_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  feedbackStart = millis();
  currentFeedback = FB_GRANTED;
  buzzerOff = false;
}

void feedback_access_denied()
{
  all_off();
  digitalWrite(LED_RED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  feedbackStart = millis();
  currentFeedback = FB_DENIED;
  buzzerOff = false;
}

void feedback_sync_ok()
{
  all_off();
  digitalWrite(LED_GREEN_PIN, HIGH);
  feedbackStart = millis();
  currentFeedback = FB_SYNC_OK;
  buzzerOff = true;
}

void feedback_loop()
{
  if (currentFeedback == FB_NONE) return;

  unsigned long elapsed = millis() - feedbackStart;

  switch (currentFeedback)
  {
  case FB_GRANTED:
    if (!buzzerOff && elapsed >= BEEP_SHORT_MS)
    {
      digitalWrite(BUZZER_PIN, LOW);
      buzzerOff = true;
    }
    if (elapsed >= FEEDBACK_DURATION_MS)
    {
      all_off();
      currentFeedback = FB_NONE;
    }
    break;

  case FB_DENIED:
    if (!buzzerOff && elapsed >= BEEP_LONG_MS)
    {
      digitalWrite(BUZZER_PIN, LOW);
      buzzerOff = true;
    }
    if (elapsed >= FEEDBACK_DURATION_MS)
    {
      all_off();
      currentFeedback = FB_NONE;
    }
    break;

  case FB_SYNC_OK:
    if (elapsed >= 500)
    {
      all_off();
      currentFeedback = FB_NONE;
    }
    break;

  default:
    break;
  }
}
