from datetime import datetime
from pydantic import BaseModel, field_validator
import json


class VoteCreate(BaseModel):
    poll_id: str
    voter_name: str | None = None  # Display name, optional
    voter_email: str              # Required
    rankings: list[str]

    @field_validator("voter_email")
    @classmethod
    def email_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Email is required to vote")
        return v.strip().lower()

    @field_validator("rankings")
    @classmethod
    def rankings_not_empty(cls, v):
        if not v:
            raise ValueError("Rankings cannot be empty")
        return v


class VoteUpdate(BaseModel):
    rankings: list[str]
    voter_name: str | None = None


class VoteResponse(BaseModel):
    id: str
    poll_id: str
    voter_name: str | None
    voter_email: str | None
    rankings: list[str]
    created_at: datetime
    updated_at: datetime | None
    is_verified: bool

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, vote):
        return cls(
            id=vote.id,
            poll_id=vote.poll_id,
            voter_name=vote.voter_name,
            voter_email=vote.voter_email,
            rankings=json.loads(vote.rankings),
            created_at=vote.created_at,
            updated_at=vote.updated_at,
            is_verified=vote.is_verified,
        )


class VoterStatus(BaseModel):
    """Returned when checking if an email has already voted."""
    has_voted: bool
    vote: VoteResponse | None = None  # Their existing vote if has_voted=True and poll allows editing
