from pydantic import BaseModel

from schemas.base_response import BaseResponse


class AccessLogCreate(BaseModel):
    card_uid: str
    student_id: str
    full_name: str


class AccessLogResponse(BaseResponse):
    action: str  # 'checkin' or 'checkout'


class AccessLogListResponse(BaseResponse):
    logs: list[dict]
    total: int
