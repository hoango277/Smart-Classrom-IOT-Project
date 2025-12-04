from starlette import status
from starlette.responses import JSONResponse

from schemas.base_response import BaseResponse


def build(message: str) -> BaseResponse:
    return BaseResponse(status='error', message=message)


def raise_error(status_code: status, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=build(message).model_dump()
    )
