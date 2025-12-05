from sqlalchemy.ext.asyncio import AsyncSession

from configs.authentication import hash_password
from models import User
from schemas.base_response import BaseResponse
from schemas.user import UserCreate


def get_user_service():
    try:
        yield UserService()
    finally:
        pass


class UserService:
    async def register(self, data: UserCreate, db: AsyncSession) -> BaseResponse:
        new_user = User(
            username=data.username,
            hashed_password=hash_password(data.password),
            role=data.role
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return BaseResponse(message='User created successfully')
