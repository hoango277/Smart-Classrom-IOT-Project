from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from configs.authentication import get_current_user
from configs.database import get_db
from schemas.user import UserCreate, UserResponse
from services.user import UserService, get_user_service

router = APIRouter(
    prefix='/api/users',
    tags=['User']
)

db_dependency = Annotated[AsyncSession, Depends(get_db)]
user_dependency = Annotated[UserResponse, Depends(get_current_user)]
user_service_dependency = Annotated[UserService, Depends(get_user_service)]


@router.post('/register')
async def register(
        data: UserCreate,
        db: db_dependency,
        user_service: user_service_dependency
):
    return await user_service.register(data, db)


@router.get('/me')
async def get_current_user(
        current_user: user_dependency
):
    return current_user
