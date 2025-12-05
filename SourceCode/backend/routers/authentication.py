from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from configs.database import get_db
from services.authentication import AuthenticationService, get_authentication_service

router = APIRouter(
    prefix='/api/auth',
    tags=['Authentication']
)

db_dependency = Annotated[AsyncSession, Depends(get_db)]
auth_service_dependency = Annotated[AuthenticationService, Depends(get_authentication_service)]


@router.post('/login')
async def login(
        data: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: db_dependency,
        auth_service: auth_service_dependency
):
    return await auth_service.authenticate(data, db)
