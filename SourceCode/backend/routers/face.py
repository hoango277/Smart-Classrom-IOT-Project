from fastapi import APIRouter, UploadFile, File, HTTPException
from starlette import status

from services.face_recognition import get_recognizer
from services.mqtt_client import (
    publish_command,
    build_door_topic,
    build_light_topic,
    start_mqtt,
)

router = APIRouter(prefix="/api/face", tags=["face"])


@router.post("/upload")
async def upload_face(file: UploadFile = File(...)):
    # Ensure MQTT is up (idempotent)
    start_mqtt()

    if file.content_type not in ("image/jpeg", "image/jpg", "image/png"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload JPEG or PNG.",
        )

    data = await file.read()

    # Recognize using FaceNet
    recognizer = get_recognizer()
    try:
        result = recognizer.recognize(data)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face recognition failed: {exc}",
        ) from exc
    recognized = bool(result.get("recognized"))

    # Publish commands according to spec: open door, turn on light
    if recognized:
        publish_command(build_door_topic(0), "open")
        publish_command(build_light_topic(0), "on")

    return {
        "recognized": recognized,
        "user": result.get("user"),
        "confidence": result.get("confidence"),
    }

