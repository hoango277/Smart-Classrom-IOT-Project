from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from configs.authentication import get_current_user
from configs.database import get_db
from schemas.access_log import AccessLogCreate
from schemas.user import UserResponse
from services.access_log import AccessLogService, get_access_log_service

router = APIRouter(
    prefix='/api/access-logs',
    tags=['Access Log']
)

db_dependency = Annotated[AsyncSession, Depends(get_db)]
user_dependency = Annotated[UserResponse, Depends(get_current_user)]
service_dependency = Annotated[AccessLogService, Depends(get_access_log_service)]


@router.post('')
async def log_scan(
        data: AccessLogCreate,
        db: db_dependency,
        current_user: user_dependency,
        service: service_dependency
):
    return await service.log_scan(data, db)


@router.get('')
async def get_logs(
        db: db_dependency,
        current_user: user_dependency,
        service: service_dependency,
        date: str | None = None
):
    return await service.get_logs(date, db)
