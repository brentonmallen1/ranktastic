import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.poll import Poll
from app.models.vote import Vote
from app.models.settings import AppSetting
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin")

DEFAULT_SETTINGS = {
    "allow_public_polls": "true",
}


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total_polls = (await db.execute(select(func.count()).select_from(Poll))).scalar()
    open_polls = (await db.execute(select(func.count()).where(Poll.is_open == True))).scalar()
    total_votes = (await db.execute(select(func.count()).select_from(Vote))).scalar()
    return {"total_polls": total_polls, "open_polls": open_polls, "total_votes": total_votes}


@router.get("/settings")
async def get_settings_endpoint(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(AppSetting))
    rows = {row.key: row.value for row in result.scalars().all()}
    # Merge defaults
    return {**DEFAULT_SETTINGS, **rows}


@router.put("/settings")
async def update_settings_endpoint(
    data: dict,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    for key, value in data.items():
        result = await db.execute(select(AppSetting).where(AppSetting.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = str(value)
            db.add(setting)
        else:
            db.add(AppSetting(key=key, value=str(value)))
    return {"message": "Settings updated"}
