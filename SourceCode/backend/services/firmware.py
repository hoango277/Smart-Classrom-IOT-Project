import os.path
import shutil
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from fastapi import UploadFile
from starlette import status
from starlette.responses import JSONResponse, FileResponse

from configs.firmware_storage import UPLOAD_DIR
from exceptions.exception_handler import raise_error
from schemas.base_response import BaseResponse
from schemas.firmware import OTAResponse, FirmwareListResponse, FirmwareInfo

load_dotenv()

BASE_URL = os.getenv('BASE_URL')


def get_firmware_service():
    try:
        yield FirmwareService()
    finally:
        pass


class FirmwareService:
    def upload_firmware(self, file: UploadFile) -> OTAResponse | JSONResponse:
        if not file.filename.endswith('.bin'):
            return raise_error(
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Only .bin files allowed'
            )

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_name = Path(file.filename).stem
        filename = f'{original_name}_{timestamp}.bin'
        file_path = UPLOAD_DIR / filename

        try:
            with open(file_path, 'wb') as buffer:
                shutil.copyfileobj(file.file, buffer)
            size = os.path.getsize(file_path)
            download_url = f'{BASE_URL}/firmware/download/{filename}'
            return OTAResponse(
                message='Firmware uploaded successfully',
                filename=filename,
                download_url=download_url,
                size=size
            )
        except Exception as e:
            if file_path.exists():
                os.remove(file_path)
            return raise_error(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e)
            )

    def download_firmware(self, filename: str) -> FileResponse | JSONResponse:
        file_path = UPLOAD_DIR / filename

        if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
            return raise_error(
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Invalid filename'
            )
        if not file_path.exists():
            return raise_error(
                status_code=status.HTTP_404_NOT_FOUND,
                message='Firmware not found'
            )

        return FileResponse(
            path=file_path,
            media_type='application/octet-stream',
            filename=filename,
            headers={'Cache-Control': 'no-cache'}
        )

    def list_firmwares(self) -> FirmwareListResponse:
        firmwares = []
        for file_path in UPLOAD_DIR.glob('*.bin'):
            stat = file_path.stat()
            firmwares.append(
                FirmwareInfo(
                    filename=file_path.name,
                    upload_time=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    size=stat.st_size,
                    download_url=f'{BASE_URL}/firmware/download/{file_path.name}'
                )
            )

        firmwares.sort(key=lambda x: x.upload_time, reverse=True)
        return FirmwareListResponse(
            message='Firmware list retrieved successfully',
            firmwares=firmwares,
            count=len(firmwares)
        )

    def delete_firmware(self, filename: str) -> BaseResponse | JSONResponse:
        file_path = UPLOAD_DIR / filename

        if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
            return raise_error(
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Invalid filename'
            )

        if not file_path.exists():
            return raise_error(
                status_code=status.HTTP_404_NOT_FOUND,
                message='Firmware not found'
            )

        try:
            os.remove(file_path)
            return BaseResponse(message=f'Deleted {filename} successfully')
        except Exception as e:
            return raise_error(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e)
            )
