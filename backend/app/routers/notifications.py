from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.poll import Poll
from app.models.notification import NotificationSubscription
from app.schemas.notification import SubscribeRequest, SubscribeResponse

router = APIRouter(prefix="/notifications")


@router.post("/subscribe", response_model=SubscribeResponse, status_code=201)
async def subscribe(data: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    poll_result = await db.execute(select(Poll).where(Poll.id == data.poll_id))
    poll = poll_result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    sub = NotificationSubscription(poll_id=data.poll_id, email=str(data.email))
    db.add(sub)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        return SubscribeResponse(message="You are already subscribed to this poll")

    return SubscribeResponse(message="You will be notified when this poll closes")


@router.delete("/unsubscribe")
async def unsubscribe(poll_id: str, email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NotificationSubscription).where(
            NotificationSubscription.poll_id == poll_id,
            NotificationSubscription.email == email,
        )
    )
    sub = result.scalar_one_or_none()
    if sub:
        await db.delete(sub)
    return {"message": "Unsubscribed"}
