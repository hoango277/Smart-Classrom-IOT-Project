# Wiring Map

## Controller (ESP8266 NodeMCU)

- **L298N (Door channel 1)**: IN1 = D1 (GPIO5), IN2 = D2 (GPIO4)
- **L298N (Window channel 1)**: IN3 = D5 (GPIO14), IN4 = D6 (GPIO12)
- **Flame sensor (DO, active LOW)**: D7 (GPIO13)
- **Rain sensor (DO, active LOW, polled)**: D0 (GPIO16)
- **Buzzer (Alarm channel 1, active LOW)**: D4 (GPIO2)
- **GND**: shared across all modules
- **Unwired expansion**: Door#2, Window#2, Light channels, Alarm channels >1 use pin `-1` placeholders for future hardware.

## Camera (ESP32-CAM AI Thinker)

- Standard AI Thinker pinout is defined in `esp32-cam/include/pins.h`. Adjust if your module differs.
- Face verification endpoint configured via `FACE_VERIFY_URL` in `esp32-cam/include/secrets.h`.
- Ensure stable 5V supply and connect UART (U0R/U0T) for flashing/monitoring.
