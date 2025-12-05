from datetime import timedelta

from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import JSONResponse

from configs.authentication import verify_password, create_access_token
from exceptions.exception_handler import raise_error
from models import User
from schemas.authentication import TokenResponse


def get_authentication_service():
    try:
        yield AuthenticationService()
    finally:
        pass


class AuthenticationService:
    async def authenticate(self, data: OAuth2PasswordRequestForm, db: AsyncSession) -> TokenResponse | JSONResponse:
        user_db = await db.execute(
            select(User).where(User.username == data.username)
        )
        user = user_db.scalar_one_or_none()
        if user is None:
            return raise_error(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid username or password"
            )

        if not verify_password(data.password, user.hashed_password):
            return raise_error(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid username or password"
            )

        return TokenResponse(access_token=create_access_token(
            data={"sub": user.username, "id": user.id, "role": user.role},
            expired_delta=timedelta(minutes=60)
        ))
