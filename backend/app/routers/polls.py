import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.poll import Poll
from app.models.vote import Vote
from app.models.notification import NotificationSubscription
from app.schemas.poll import PollCreate, PollUpdate, PollResponse, normalize_options
from app.schemas.results import PollResults
from app.services.irv import compute_results
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/polls")


async def _get_poll_or_404(poll_id: str, db: AsyncSession) -> Poll:
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll


async def _verified_vote_count(poll_id: str, db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count()).where(Vote.poll_id == poll_id, Vote.is_verified == True)
    )
    return result.scalar() or 0


@router.get("", response_model=list[PollResponse])
async def list_polls(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Poll).order_by(Poll.created_at.desc()))
    polls = result.scalars().all()
    return [
        PollResponse.from_orm_with_count(poll, await _verified_vote_count(poll.id, db))
        for poll in polls
    ]


@router.post("", response_model=PollResponse, status_code=201)
async def create_poll(
    data: PollCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    poll = Poll(
        title=data.title,
        description=data.description,
        options=json.dumps([o.model_dump() for o in data.options]),
        expires_at=data.expires_at,
        is_private=data.is_private,
        invited_emails=json.dumps([e.lower().strip() for e in data.invited_emails]),
        require_email_verification=data.require_email_verification,
        allow_vote_editing=data.allow_vote_editing,
        randomize_options=data.randomize_options,
    )
    db.add(poll)
    await db.flush()
    return PollResponse.from_orm_with_count(poll, 0)


@router.get("/{poll_id}", response_model=PollResponse)
async def get_poll(poll_id: str, db: AsyncSession = Depends(get_db)):
    poll = await _get_poll_or_404(poll_id, db)
    if poll.is_open and poll.expires_at and poll.expires_at < datetime.now(timezone.utc):
        poll.is_open = False
        db.add(poll)
        await _send_close_notifications(poll_id, poll.title, db)
    count = await _verified_vote_count(poll_id, db)
    return PollResponse.from_orm_with_count(poll, count)


@router.put("/{poll_id}", response_model=PollResponse)
async def update_poll(
    poll_id: str,
    data: PollUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    poll = await _get_poll_or_404(poll_id, db)
    if data.title is not None:
        poll.title = data.title
    if data.description is not None:
        poll.description = data.description
    if data.options is not None:
        poll.options = json.dumps([o.model_dump() for o in data.options])
    if data.expires_at is not None:
        poll.expires_at = data.expires_at
    if data.is_private is not None:
        poll.is_private = data.is_private
    if data.invited_emails is not None:
        poll.invited_emails = json.dumps([e.lower().strip() for e in data.invited_emails])
    if data.require_email_verification is not None:
        poll.require_email_verification = data.require_email_verification
    if data.allow_vote_editing is not None:
        poll.allow_vote_editing = data.allow_vote_editing
    if data.randomize_options is not None:
        poll.randomize_options = data.randomize_options
    db.add(poll)
    count = await _verified_vote_count(poll_id, db)
    return PollResponse.from_orm_with_count(poll, count)


@router.post("/{poll_id}/clone", response_model=PollResponse, status_code=201)
async def clone_poll(
    poll_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    source = await _get_poll_or_404(poll_id, db)
    clone = Poll(
        title=f"{source.title} (Copy)",
        description=source.description,
        options=source.options,
        is_private=source.is_private,
        require_email_verification=source.require_email_verification,
        allow_vote_editing=source.allow_vote_editing,
        randomize_options=source.randomize_options,
        # expires_at and invited_emails intentionally not copied
    )
    db.add(clone)
    await db.flush()
    return PollResponse.from_orm_with_count(clone, 0)


@router.put("/{poll_id}/close", response_model=PollResponse)
async def close_poll(
    poll_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    poll = await _get_poll_or_404(poll_id, db)
    poll.is_open = False
    db.add(poll)
    await _send_close_notifications(poll_id, poll.title, db)
    count = await _verified_vote_count(poll_id, db)
    return PollResponse.from_orm_with_count(poll, count)


async def _send_close_notifications(poll_id: str, poll_title: str, db: AsyncSession):
    from app.services.email import send_poll_results_email

    # Load poll and guard against duplicate sends
    poll_result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = poll_result.scalar_one_or_none()
    if not poll or poll.results_sent_at is not None:
        return

    # Collect emails from verified voters
    votes_result = await db.execute(
        select(Vote).where(Vote.poll_id == poll_id, Vote.is_verified == True)
    )
    votes = votes_result.scalars().all()
    voter_emails = {v.voter_email for v in votes}

    # Collect emails from explicit notification subscribers (not yet notified)
    subs_result = await db.execute(
        select(NotificationSubscription).where(
            NotificationSubscription.poll_id == poll_id,
            NotificationSubscription.notified_at == None,
        )
    )
    subs = subs_result.scalars().all()
    sub_emails = {s.email for s in subs}

    all_emails = voter_emails | sub_emails
    if not all_emails:
        return

    option_names = [o.name for o in normalize_options(json.loads(poll.options))]
    results = compute_results(poll_id, option_names, [{"rankings": v.rankings} for v in votes])

    now = datetime.now(timezone.utc)
    for email in all_emails:
        await send_poll_results_email(email, poll_title, poll_id, results.winner)

    for sub in subs:
        sub.notified_at = now
        db.add(sub)

    poll.results_sent_at = now
    db.add(poll)


@router.put("/{poll_id}/reopen", response_model=PollResponse)
async def reopen_poll(
    poll_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    poll = await _get_poll_or_404(poll_id, db)
    poll.is_open = True
    db.add(poll)
    count = await _verified_vote_count(poll_id, db)
    return PollResponse.from_orm_with_count(poll, count)


@router.delete("/{poll_id}", status_code=204)
async def delete_poll(
    poll_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    poll = await _get_poll_or_404(poll_id, db)
    await db.delete(poll)


@router.delete("/{poll_id}/votes", status_code=204)
async def clear_votes(
    poll_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    await _get_poll_or_404(poll_id, db)
    result = await db.execute(select(Vote).where(Vote.poll_id == poll_id))
    for vote in result.scalars().all():
        await db.delete(vote)


@router.get("/{poll_id}/results", response_model=PollResults)
async def get_results(poll_id: str, db: AsyncSession = Depends(get_db)):
    poll = await _get_poll_or_404(poll_id, db)
    option_names = [o.name for o in normalize_options(json.loads(poll.options))]
    # Only count verified votes
    votes_result = await db.execute(
        select(Vote).where(Vote.poll_id == poll_id, Vote.is_verified == True)
    )
    votes = votes_result.scalars().all()
    return compute_results(poll_id, option_names, [{"rankings": v.rankings} for v in votes])
