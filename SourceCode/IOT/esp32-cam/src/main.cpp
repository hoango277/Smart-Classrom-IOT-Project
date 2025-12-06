#include <WiFi.h>
#include "esp_camera.h"

// ================== CẤU HÌNH WIFI ==================
const char* ssid     = "test";
const char* password = "12345678";

// ================== CHỌN LOẠI CAMERA ==================
#define CAMERA_MODEL_AI_THINKER  // nếu bạn dùng board AI-Thinker phổ biến

// ================== CHÂN CAMERA CHO AI-THINKER ==================
#if defined(CAMERA_MODEL_AI_THINKER)
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27

  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22
#else
  #error "Chưa cấu hình chân cho loại camera này!"
#endif

#include <WebServer.h>
WebServer server(80);

// ================== HÀM STREAM MJPEG LIÊN TỤC ==================
void handle_jpg_stream() {
  WiFiClient client = server.client();

  String response = 
      "HTTP/1.1 200 OK\r\n"
      "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
      "\r\n";
  client.print(response);

  while (client.connected()) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Không lấy được frame từ camera");
      break;
    }

    client.printf(
      "--frame\r\n"
      "Content-Type: image/jpeg\r\n"
      "Content-Length: %u\r\n\r\n",
      fb->len
    );
    client.write(fb->buf, fb->len);
    client.print("\r\n");

    esp_camera_fb_return(fb);

    if (!client.connected()) {
      break;
    }

    // tùy nhu cầu mà giảm delay (0–100ms)
    delay(30);
  }

  Serial.println("Client stream disconnected");
}

// ================== INIT CAMERA ==================
bool init_camera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  config.frame_size   = FRAMESIZE_VGA;  // đổi tùy nhu cầu: QQVGA/QVGA/VGA/SVGA/...
  config.jpeg_quality = 12;            // 0-63 (nhỏ = chất lượng cao hơn, size lớn hơn)
  config.fb_count     = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }
  return true;
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();
  Serial.println("Boot ESP32-CAM...");

  if (!init_camera()) {
    Serial.println("Lỗi init camera, reboot...");
    delay(5000);
    ESP.restart();
  }

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Đã kết nối. IP: ");
  Serial.println(WiFi.localIP());

  // Chỉ expose duy nhất endpoint /stream
  server.on("/stream", HTTP_GET, []() {
    handle_jpg_stream();
  });

  server.begin();
  Serial.println("HTTP server started");
  Serial.print("Stream URL: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");
}

// ================== LOOP ==================
void loop() {
  server.handleClient();
}
