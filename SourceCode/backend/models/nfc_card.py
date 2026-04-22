from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from configs.database import Base


class NFCCard(Base):
    __tablename__ = 'nfc_cards'

    id = Column(Integer, primary_key=True, index=True)
    card_uid = Column(String(32), unique=True, index=True, nullable=False)
    student_id = Column(String(20), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
