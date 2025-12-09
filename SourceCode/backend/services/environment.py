from datetime import datetime, timezone, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import JSONResponse

from exceptions.exception_handler import raise_error
from models import Environment
from schemas.environment import EnvironmentCreate, EnvironmentResponse, EnvironmentBatchResponse, EnvironmentBase, \
    EnvironmentDeleteResponse


def get_environment_service():
    try:
        yield EnvironmentService()
    finally:
        pass


class EnvironmentService:
    async def save(self, data: EnvironmentCreate, db: AsyncSession) -> EnvironmentResponse:
        environment = Environment(**data.model_dump())
        db.add(environment)
        await db.commit()
        await db.refresh(environment)
        return EnvironmentResponse(
            message='Environment saved successfully',
            id=environment.id,
            temperature=environment.temperature,
            humidity=environment.humidity,
            timestamp=environment.timestamp.isoformat()
        )

    async def save_batch(self, data: list[EnvironmentCreate], db: AsyncSession) -> EnvironmentBatchResponse:
        environment_records = [Environment(**item.model_dump()) for item in data]
        db.add_all(environment_records)
        await db.commit()
        return EnvironmentBatchResponse(
            message='Batch environment data saved successfully',
            count=len(environment_records)
        )

    async def get_history(self, from_date: str | None, to_date: str | None, limit: int, db: AsyncSession) -> list[EnvironmentBase]:
        query = select(Environment)

        if from_date:
            from_dt = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            query = query.where(Environment.timestamp >= from_dt)
        if to_date:
            to_dt = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
            query = query.where(Environment.timestamp <= to_dt)
        query = query.order_by(Environment.timestamp.desc()).limit(limit)

        result = await db.execute(query)
        environments = result.scalars().all()
        return [
            EnvironmentBase(
                id=env.id,
                temperature=env.temperature,
                humidity=env.humidity,
                timestamp=env.timestamp.isoformat()
            ) for env in environments
        ]

    async def get_latest(self, db: AsyncSession) -> EnvironmentBase | JSONResponse:
        query = select(Environment).order_by(Environment.timestamp.desc()).limit(1)
        result = await db.execute(query)
        environment = result.scalar_one_or_none()
        if environment:
            return EnvironmentBase(
                id=environment.id,
                temperature=environment.temperature,
                humidity=environment.humidity,
                timestamp=environment.timestamp.isoformat()
            )
        return raise_error(
            status_code=status.HTTP_404_NOT_FOUND,
            message='No environment data found'
        )

    async def get_stats(self, from_date: str | None, to_date: str | None, db: AsyncSession) -> dict | JSONResponse:
        query = select(
            func.avg(Environment.temperature).label('avg_temp'),
            func.min(Environment.temperature).label('min_temp'),
            func.max(Environment.temperature).label('max_temp'),
            func.avg(Environment.humidity).label('avg_humidity'),
            func.min(Environment.humidity).label('min_humidity'),
            func.max(Environment.humidity).label('max_humidity'),
            func.count(Environment.id).label('count')
        )

        if from_date:
            from_dt = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            query = query.where(Environment.timestamp >= from_dt)
        if to_date:
            to_dt = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
            query = query.where(Environment.timestamp <= to_dt)

        result = await db.execute(query)
        row = result.one()
        return {
            "temperature": {
                "avg": round(row.avg_temp, 2) if row.avg_temp else None,
                "min": round(row.min_temp, 2) if row.min_temp else None,
                "max": round(row.max_temp, 2) if row.max_temp else None,
            },
            "humidity": {
                "avg": round(row.avg_humidity, 2) if row.avg_humidity else None,
                "min": round(row.min_humidity, 2) if row.min_humidity else None,
                "max": round(row.max_humidity, 2) if row.max_humidity else None,
            },
            "total_records": row.count or 0
        }

    async def delete_data(self, days: int, db: AsyncSession) -> EnvironmentDeleteResponse:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = select(Environment).where(Environment.timestamp < cutoff)
        result = await db.execute(query)
        to_delete = result.scalars().all()

        for env in to_delete:
            await db.delete(env)
        await db.commit()
        return EnvironmentDeleteResponse(
            message='Old environment data deleted successfully',
            deleted=len(to_delete)
        )
