from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.access_log import AccessLog
from schemas.access_log import AccessLogCreate, AccessLogListResponse, AccessLogResponse
from schemas.base_response import BaseResponse


def get_access_log_service():
    try:
        yield AccessLogService()
    finally:
        pass


class AccessLogService:
    async def log_scan(self, data: AccessLogCreate, db: AsyncSession) -> AccessLogResponse:
        # Determine checkin or checkout based on last action today
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        last_log = await db.execute(
            select(AccessLog)
            .where(
                AccessLog.card_uid == data.card_uid,
                AccessLog.scanned_at >= today_start
            )
            .order_by(AccessLog.scanned_at.desc())
            .limit(1)
        )
        last = last_log.scalar_one_or_none()

        # First scan of the day = checkin, then alternate
        if last is None or last.action == 'checkout':
            action = 'checkin'
        else:
            action = 'checkout'

        log = AccessLog(
            card_uid=data.card_uid,
            student_id=data.student_id,
            full_name=data.full_name,
            action=action,
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)

        return AccessLogResponse(
            message=f'{action.capitalize()} logged',
            action=action
        )

    async def get_logs(self, date: str | None, db: AsyncSession) -> AccessLogListResponse:
        query = select(AccessLog).order_by(AccessLog.scanned_at.desc())

        if date:
            target = datetime.strptime(date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            query = query.where(
                AccessLog.scanned_at >= target.replace(hour=0, minute=0, second=0),
                AccessLog.scanned_at < target + timedelta(days=1)
            )
        else:
            now = datetime.now(timezone.utc)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.where(AccessLog.scanned_at >= today_start)

        result = await db.execute(query)
        logs = result.scalars().all()

        return AccessLogListResponse(
            message='Access logs retrieved',
            logs=[
                {
                    'id': l.id,
                    'card_uid': l.card_uid,
                    'student_id': l.student_id,
                    'full_name': l.full_name,
                    'action': l.action,
                    'scanned_at': l.scanned_at.isoformat() if l.scanned_at else None,
                }
                for l in logs
            ],
            total=len(logs)
        )
