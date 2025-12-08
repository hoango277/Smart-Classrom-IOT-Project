from pydantic import BaseModel

from schemas.base_response import BaseResponse


class FirmwareInfo(BaseModel):
    filename: str
    upload_time: str
    size: int
    download_url: str


class FirmwareListResponse(BaseResponse):
    firmwares: list[FirmwareInfo]
    count: int


class OTAResponse(BaseResponse):
    filename: str | None = None
    download_url: str | None = None
    size: int | None = None
