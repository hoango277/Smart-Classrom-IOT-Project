from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import JSONResponse

from exceptions.exception_handler import raise_error
from models.nfc_card import NFCCard
from schemas.nfc_card import NFCCardCreate, NFCCardResponse, NFCCardListResponse, NFCCardDeleteResponse


def get_nfc_card_service():
    try:
        yield NFCCardService()
    finally:
        pass


class NFCCardService:
    async def register(self, data: NFCCardCreate, db: AsyncSession) -> NFCCardResponse | JSONResponse:
        existing = await db.execute(
            select(NFCCard).where(NFCCard.card_uid == data.card_uid)
        )
        if existing.scalar_one_or_none() is not None:
            return raise_error(
                status_code=status.HTTP_409_CONFLICT,
                message='Card UID already registered'
            )

        card = NFCCard(
            card_uid=data.card_uid,
            student_id=data.student_id,
            full_name=data.full_name,
            is_active=True
        )
        db.add(card)
        await db.commit()
        await db.refresh(card)

        return NFCCardResponse(
            message='Card registered successfully',
            id=card.id,
            card_uid=card.card_uid,
            student_id=card.student_id,
            full_name=card.full_name,
            is_active=card.is_active
        )

    async def get_all(self, db: AsyncSession) -> NFCCardListResponse:
        result = await db.execute(
            select(NFCCard).where(NFCCard.is_active == True).order_by(NFCCard.registered_at.desc())
        )
        cards = result.scalars().all()
        return NFCCardListResponse(
            message='Cards retrieved successfully',
            cards=[
                {
                    'id': c.id,
                    'card_uid': c.card_uid,
                    'student_id': c.student_id,
                    'full_name': c.full_name,
                    'is_active': c.is_active,
                    'registered_at': c.registered_at.isoformat() if c.registered_at else None
                }
                for c in cards
            ],
            total=len(cards)
        )

    async def delete(self, card_id: int, db: AsyncSession) -> NFCCardDeleteResponse | JSONResponse:
        result = await db.execute(
            select(NFCCard).where(NFCCard.id == card_id)
        )
        card = result.scalar_one_or_none()
        if card is None:
            return raise_error(
                status_code=status.HTTP_404_NOT_FOUND,
                message='Card not found'
            )

        await db.delete(card)
        await db.commit()

        return NFCCardDeleteResponse(message='Card deleted successfully')

    async def get_sync_data(self, db: AsyncSession) -> list[dict]:
        result = await db.execute(
            select(NFCCard).where(NFCCard.is_active == True)
        )
        cards = result.scalars().all()
        return [{'uid': c.card_uid, 'username': c.full_name} for c in cards]
