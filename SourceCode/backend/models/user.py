from sqlalchemy import Column, Integer, String

from configs.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(10), nullable=False)
    hashed_password = Column(String(255), nullable=False)
