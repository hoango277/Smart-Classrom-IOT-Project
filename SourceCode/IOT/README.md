# Smart Classroom IoT Firmware (PlatformIO)

This workspace hosts two independent PlatformIO firmware projects:

- `controller-esp8266`: Central controller on NodeMCU ESP8266 handling MQTT control of doors, windows, lights, alarms, and basic sensors.
- `esp32-cam`: AI Thinker ESP32-CAM capturing images for face verification and notifying the controller over MQTT.

Only minimal interfaces and stubs are provided so you can implement the logic later. Each firmware keeps modules separated into `drivers/`, `net/`, `app/`, and `utils/`.

## Quick start

1) Install [PlatformIO](https://platformio.org/install) in VS Code.  
2) Copy `include/secrets.example.h` to `include/secrets.h` inside each firmware folder and fill in Wi-Fi/MQTT/HTTP values.  
3) Build, upload, and monitor from each firmware folder:

```sh
# Controller (ESP8266)
cd controller-esp8266
pio run               # build
pio run -t upload     # flash
pio device monitor    # serial monitor

# Camera (ESP32-CAM)
cd esp32-cam
pio run
pio run -t upload
pio device monitor
```

## Docs

- Wiring map: `docs/wiring.md`
