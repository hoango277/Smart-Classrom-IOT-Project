import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from starlette import status
from starlette.responses import JSONResponse

from exceptions.exception_handler import raise_error
from schemas.user import UserResponse

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


def hash_password(plain_password: str) -> str:
    return bcrypt_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expired_delta: timedelta) -> str:
    to_encode = data.copy()
    expires = datetime.now(timezone.utc) + expired_delta
    to_encode.update({'exp': expires})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]) -> UserResponse | JSONResponse:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        role: str = payload.get('role')
        if username is None or user_id is None or role is None:
            return raise_error(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message='Could not validate credentials'
            )
        return UserResponse(id=user_id, username=username, role=role)
    except Exception:
        return raise_error(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message='Could not validate credentials'
        )
