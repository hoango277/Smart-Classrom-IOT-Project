from pydantic import BaseModel

from schemas.base_response import BaseResponse


class NFCCardCreate(BaseModel):
    card_uid: str
    student_id: str
    full_name: str


class NFCCardResponse(BaseResponse):
    id: int
    card_uid: str
    student_id: str
    full_name: str
    is_active: bool


class NFCCardListResponse(BaseResponse):
    cards: list[dict]
    total: int


class NFCCardDeleteResponse(BaseResponse):
    pass
