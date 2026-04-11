// Pin mapping for NFC reader node (RC522 + feedback)
#pragma once

// RC522 SPI pins (SCK=D5, MOSI=D7, MISO=D6 are fixed by hardware SPI)
#define RC522_SDA_PIN 4  // D2 (GPIO4)
#define RC522_RST_PIN 5  // D1 (GPIO5)

// Feedback pins
#define LED_GREEN_PIN 0  // D3 (GPIO0)
#define LED_RED_PIN   2  // D4 (GPIO2)
#define BUZZER_PIN    15 // D8 (GPIO15)
