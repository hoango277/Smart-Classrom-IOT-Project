from pydantic import BaseModel

from schemas.base_response import BaseResponse


class EnvironmentCreate(BaseModel):
    temperature: float
    humidity: float


class EnvironmentBase(EnvironmentCreate):
    id: int
    timestamp: str


class EnvironmentResponse(BaseResponse):
    id: int
    temperature: float
    humidity: float
    timestamp: str


class EnvironmentBatchResponse(BaseResponse):
    count: int


class EnvironmentDeleteResponse(BaseResponse):
    deleted: int
