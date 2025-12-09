from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Float, DateTime

from configs.database import Base


class Environment(Base):
    __tablename__ = 'environments'

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
