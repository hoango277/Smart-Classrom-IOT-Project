from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import JSONResponse

from configs.authentication import hash_password
from exceptions.exception_handler import raise_error
from models import User
from schemas.base_response import BaseResponse
from schemas.user import UserCreate


def get_user_service():
    try:
        yield UserService()
    finally:
        pass


class UserService:
    async def register(self, data: UserCreate, db: AsyncSession) -> BaseResponse | JSONResponse:
        existing_user = await db.execute(
            select(User).where(User.username == data.username)
        )
        if existing_user.scalar_one_or_none() is not None:
            return raise_error(
                status_code=status.HTTP_409_CONFLICT,
                message='Username already exists'
            )

        new_user = User(
            username=data.username,
            hashed_password=hash_password(data.password),
            role=data.role
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return BaseResponse(message='User created successfully')
