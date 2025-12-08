from pydantic import BaseModel


class BaseResponse(BaseModel):
    status: str = 'ok'
    message: str = ''
