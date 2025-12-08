# 🚀 OTA Update Testing Guide

## ✅ Đã Hoàn Thành

Trang **Update OTA** đã được tích hợp đầy đủ với:
- ✅ Upload file firmware (.bin/.hex) lên backend
- ✅ Progress bar hiển thị tiến trình upload
- ✅ Gửi MQTT command tới ESP32 qua HiveMQ Cloud
- ✅ Error handling đầy đủ
- ✅ Success notification với thông tin chi tiết

---

## 📋 Workflow

```
1. User chọn file .bin/.hex
   ↓
2. User click "Start OTA Update"
   ↓
3. Frontend upload file lên Backend API
   POST /api/firmware/upload
   Content-Type: multipart/form-data
   Body: { file: UploadFile }
   ↓
4. Backend trả về response:
   {
     "status": "ok",
     "message": "...",
     "filename": "firmware.bin",
     "download_url": "http://example.com/firmware.bin",
     "size": 123456
   }
   ↓
5. Frontend kết nối MQTT (HiveMQ Cloud)
   ↓
6. Frontend publish message:
   Topic: classroom/ota/update
   Payload: {"url": "http://example.com/firmware.bin"}
   ↓
7. ESP32 nhận message và download firmware
   ↓
8. ESP32 thực hiện OTA update
```

---

## 🔧 API Endpoint

### POST /api/firmware/upload

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  ```
  file: UploadFile (File binary data)
  ```

**Response Success (200):**
```json
{
  "status": "ok",
  "message": "Firmware uploaded successfully",
  "filename": "firmware_v1.2.3.bin",
  "download_url": "http://localhost:8000/firmware/download/firmware_v1.2.3.bin",
  "size": 524288
}
```

**Response Error (4xx/5xx):**
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## 📡 MQTT Configuration

**Broker:** HiveMQ Cloud
- Host: `3ee91461277b4c8ea515775a3473e668.s1.eu.hivemq.cloud`
- Port: `8884` (WebSocket Secure)
- Username: `smart_classroom`
- Password: `Smartclassroom15`

**OTA Topic:** `classroom/ota/update`

**Message Format:**
```json
{
  "url": "http://backend-url/firmware/download/filename.bin"
}
```

---

## 🧪 Cách Test

### 1. Khởi động Backend
```bash
# Đảm bảo backend đang chạy tại http://localhost:8000
python main.py
# hoặc
uvicorn main:app --reload
```

### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
```

### 3. Truy cập trang OTA
```
http://localhost:5173/ota
```

### 4. Test Upload
1. Click vào "Click to upload firmware"
2. Chọn file .bin hoặc .hex
3. Click "Start OTA Update"
4. Quan sát:
   - Progress bar upload (0-100%)
   - Trạng thái "Sending OTA Command via MQTT..."
   - Success message với thông tin file
   - ESP32 console sẽ log nhận được message MQTT

### 5. Kiểm tra Console
```javascript
// Browser Console sẽ hiển thị:
[MQTT] Connected
[MQTT] Publishing to classroom/ota/update
[MQTT] Message sent successfully
```

### 6. Kiểm tra ESP32
ESP32 sẽ nhận được message từ topic `classroom/ota/update`:
```json
{"url": "http://localhost:8000/firmware/download/firmware.bin"}
```

---

## 🐛 Troubleshooting

### Lỗi: "MQTT host is missing"
- Kiểm tra file `.env` có `VITE_MQTT_HOST`
- Restart dev server: `npm run dev`

### Lỗi: "Failed to upload firmware"
- Kiểm tra backend đang chạy
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Kiểm tra endpoint `/api/firmware/upload` tồn tại

### Lỗi: "MQTT connection failed"
- Kiểm tra credentials trong `.env`
- Kiểm tra internet connection
- Kiểm tra HiveMQ Cloud cluster đang hoạt động

### File không được chọn
- Chỉ accept file `.bin` và `.hex`
- Kiểm tra file extension

---

## 📁 File Structure

```
src/
├── pages/
│   └── UpdateOTA.jsx          # Main OTA page
├── services/
│   ├── mqtt.js                # MQTT service
│   └── mqttCommand.js         # MQTT commands (không dùng cho OTA)
├── config/
│   └── axios.js               # Axios instance với baseURL
└── components/
    └── layout/
        └── MainLayout.jsx     # Layout wrapper
```

---

## 🎨 UI States

1. **Idle** - Chờ user chọn file
2. **File Selected** - File đã chọn, hiển thị info
3. **Uploading** - Upload progress 0-100%
4. **MQTT Sending** - Gửi command qua MQTT (animated)
5. **Success** - Hiển thị success message + file info
6. **Error** - Hiển thị error message, button "Retry"

---

## 🔐 Security Notes

⚠️ **Không có authentication** cho mục đích test!
- Trong production, cần thêm JWT authentication
- Kiểm tra quyền admin trước khi upload
- Validate file signature/checksum
- Rate limiting cho upload endpoint

---

## 📊 Backend Requirements

Backend cần implement endpoint `/api/firmware/upload`:

```python
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

class BaseResponse(BaseModel):
    status: str
    message: str

class OTAResponse(BaseResponse):
    filename: str | None = None
    download_url: str | None = None
    size: int | None = None

@app.post("/api/firmware/upload", response_model=OTAResponse)
async def upload_firmware(file: UploadFile = File(...)):
    # Save file
    # Generate download URL
    # Return response
    return OTAResponse(
        status="ok",
        message="Firmware uploaded successfully",
        filename=file.filename,
        download_url=f"http://localhost:8000/firmware/download/{file.filename}",
        size=file.size
    )
```

---

## ✨ Features

✅ Drag & drop zone (visual only, use click)
✅ File type validation (.bin, .hex)
✅ Upload progress bar
✅ Real-time status updates
✅ MQTT integration
✅ Error handling with retry
✅ Success notification with details
✅ Responsive design
✅ Dark theme UI

---

Happy Testing! 🎉
