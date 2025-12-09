from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from configs.database import get_db
from schemas.environment import EnvironmentCreate
from services.environment import EnvironmentService, get_environment_service

router = APIRouter(
    prefix='/api/environment',
    tags=['Environment']
)

db_dependency = Annotated[AsyncSession, Depends(get_db)]
environment_service_dependency = Annotated[EnvironmentService, Depends(get_environment_service)]


@router.post('/data')
async def save_environment_data(
        data: EnvironmentCreate,
        db: db_dependency,
        environment_service: environment_service_dependency
):
    return await environment_service.save(data, db)


@router.post('/data/batch')
async def save_environment_data_batch(
        data: list[EnvironmentCreate],
        db: db_dependency,
        environment_service: environment_service_dependency
):
    return await environment_service.save_batch(data, db)


@router.get('/history')
async def get_history(
        db: db_dependency,
        environment_service: environment_service_dependency,
        from_date: str | None = None,
        to_date: str | None = None,
        limit: int = 1000
):
    return await environment_service.get_history(from_date, to_date, limit, db)


@router.get('/latest')
async def get_latest(
        db: db_dependency,
        environment_service: environment_service_dependency
):
    return await environment_service.get_latest(db)


@router.get('/stats')
async def get_statistics(
        db: db_dependency,
        environment_service: environment_service_dependency,
        from_date: str | None = None,
        to_date: str | None = None
):
    return await environment_service.get_stats(from_date, to_date, db)


@router.delete('/cleanup')
async def cleanup_data(
        db: db_dependency,
        environment_service: environment_service_dependency,
        days: int = Query(30, description='Delete data older than N days')
):
    return await environment_service.delete_data(days, db)
