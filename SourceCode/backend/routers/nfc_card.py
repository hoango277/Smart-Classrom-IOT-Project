from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from configs.authentication import get_current_user
from configs.database import get_db
from schemas.nfc_card import NFCCardCreate
from schemas.user import UserResponse
from services.nfc_card import NFCCardService, get_nfc_card_service

router = APIRouter(
    prefix='/api/nfc',
    tags=['NFC Card']
)

db_dependency = Annotated[AsyncSession, Depends(get_db)]
user_dependency = Annotated[UserResponse, Depends(get_current_user)]
nfc_service_dependency = Annotated[NFCCardService, Depends(get_nfc_card_service)]


@router.post('/cards')
async def register_card(
        data: NFCCardCreate,
        db: db_dependency,
        current_user: user_dependency,
        nfc_service: nfc_service_dependency
):
    return await nfc_service.register(data, db)


@router.get('/cards')
async def get_all_cards(
        db: db_dependency,
        current_user: user_dependency,
        nfc_service: nfc_service_dependency
):
    return await nfc_service.get_all(db)


@router.delete('/cards/{card_id}')
async def delete_card(
        card_id: int,
        db: db_dependency,
        current_user: user_dependency,
        nfc_service: nfc_service_dependency
):
    return await nfc_service.delete(card_id, db)


@router.get('/cards/sync-data')
async def get_sync_data(
        db: db_dependency,
        current_user: user_dependency,
        nfc_service: nfc_service_dependency
):
    return await nfc_service.get_sync_data(db)
