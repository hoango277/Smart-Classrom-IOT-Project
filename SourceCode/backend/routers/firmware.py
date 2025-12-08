from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, File
from starlette import status

from configs.authentication import get_current_user
from exceptions.exception_handler import raise_error
from schemas.user import UserResponse
from services.firmware import FirmwareService, get_firmware_service

router = APIRouter(
    prefix='/api/firmware',
    tags=['Firmware']
)

user_dependency = Annotated[UserResponse, Depends(get_current_user)]
firmware_service_dependency = Annotated[FirmwareService, Depends(get_firmware_service)]


@router.post('/upload')
async def upload_firmware(
        current_user: user_dependency,
        firmware_service: firmware_service_dependency,
        file: UploadFile = File(...)
):
    if current_user.role != 'admin':
        return raise_error(
            status_code=status.HTTP_403_FORBIDDEN,
            message='Permission denied'
        )
    return firmware_service.upload_firmware(file)


@router.get('/download/{filename}')
async def download_firmware(
        filename: str,
        firmware_service: firmware_service_dependency
):
    return firmware_service.download_firmware(filename)
