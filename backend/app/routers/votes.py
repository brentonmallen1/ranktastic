import json
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.poll import Poll
from app.models.vote import Vote
from app.schemas.vote import VoteCreate, VoteUpdate, VoteResponse, VoterStatus
from app.schemas.poll import normalize_options
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/votes")


async def _get_open_poll(poll_id: str, db: AsyncSession) -> Poll:
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if not poll.is_open:
        raise HTTPException(status_code=400, detail="This poll is closed")
    return poll


@router.post("", response_model=VoteResponse, status_code=201)
async def submit_vote(data: VoteCreate, db: AsyncSession = Depends(get_db)):
    poll = await _get_open_poll(data.poll_id, db)

    # Check private poll access
    if poll.is_private:
        invited = json.loads(poll.invited_emails)
        if data.voter_email not in [e.lower() for e in invited]:
            raise HTTPException(status_code=403, detail="This poll is invite-only. Your email was not invited.")

    # Validate rankings
    poll_option_names = [o.name for o in normalize_options(json.loads(poll.options))]
    for r in data.rankings:
        if r not in poll_option_names:
            raise HTTPException(status_code=400, detail=f"Invalid option: {r}")

    # Check for existing vote
    dup_result = await db.execute(
        select(Vote).where(Vote.poll_id == data.poll_id, Vote.voter_email == data.voter_email)
    )
    existing = dup_result.scalar_one_or_none()

    if existing:
        if not poll.allow_vote_editing:
            raise HTTPException(status_code=409, detail="You have already voted in this poll")
        # Update existing vote
        existing.rankings = json.dumps(data.rankings)
        existing.voter_name = data.voter_name
        existing.updated_at = datetime.now(timezone.utc)
        db.add(existing)
        await db.flush()
        return VoteResponse.from_orm(existing)

    # Create new vote
    needs_verification = poll.require_email_verification
    verification_code = secrets.token_urlsafe(32) if needs_verification else None

    vote = Vote(
        poll_id=data.poll_id,
        voter_name=data.voter_name,
        voter_email=data.voter_email,
        rankings=json.dumps(data.rankings),
        is_verified=not needs_verification,
        verification_code=verification_code,
        verification_sent_at=datetime.now(timezone.utc) if needs_verification else None,
    )
    db.add(vote)
    await db.flush()

    # Send verification email if required
    if needs_verification:
        from app.services.email import send_verification_email
        await send_verification_email(data.voter_email, data.poll_id, verification_code)

    return VoteResponse.from_orm(vote)


@router.post("/verify")
async def verify_vote(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vote).where(Vote.verification_code == token))
    vote = result.scalar_one_or_none()
    if not vote:
        raise HTTPException(status_code=404, detail="Invalid or expired verification link")
    if vote.is_verified:
        return {"message": "Vote already verified"}
    vote.is_verified = True
    vote.verification_code = None
    db.add(vote)
    return {"message": "Vote verified successfully", "poll_id": vote.poll_id}


@router.get("/status")
async def voter_status(poll_id: str, email: str, db: AsyncSession = Depends(get_db)) -> VoterStatus:
    """Check if an email has voted and optionally return their vote for editing."""
    poll_result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = poll_result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    result = await db.execute(
        select(Vote).where(Vote.poll_id == poll_id, Vote.voter_email == email.strip().lower())
    )
    vote = result.scalar_one_or_none()

    if not vote:
        return VoterStatus(has_voted=False)

    # Only return vote data if poll allows editing
    return VoterStatus(
        has_voted=True,
        vote=VoteResponse.from_orm(vote) if poll.allow_vote_editing else None,
    )


@router.get("/poll/{poll_id}", response_model=list[VoteResponse])
async def get_votes_for_poll(
    poll_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Vote).where(Vote.poll_id == poll_id, Vote.is_verified == True)
    )
    return [VoteResponse.from_orm(v) for v in result.scalars().all()]
