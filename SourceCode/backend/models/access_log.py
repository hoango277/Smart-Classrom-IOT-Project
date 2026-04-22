from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from configs.database import Base


class AccessLog(Base):
    __tablename__ = 'access_logs'

    id = Column(Integer, primary_key=True, index=True)
    card_uid = Column(String(32), nullable=False, index=True)
    student_id = Column(String(20), nullable=False)
    full_name = Column(String(255), nullable=False)
    action = Column(String(10), nullable=False)  # 'checkin' or 'checkout'
    scanned_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
