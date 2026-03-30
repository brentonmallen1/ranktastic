from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator
import json


class PollOption(BaseModel):
    name: str
    description: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Option name cannot be empty")
        if len(v) > 50:
            raise ValueError("Option name cannot exceed 50 characters")
        return v

    @field_validator("description")
    @classmethod
    def description_strip(cls, v):
        if v is not None:
            stripped = v.strip()
            if stripped and len(stripped) > 250:
                raise ValueError("Option description cannot exceed 250 characters")
            return stripped if stripped else None
        return None


def normalize_options(raw: list) -> list[PollOption]:
    """Normalize legacy string options or new object options to PollOption list."""
    result = []
    for item in raw:
        if isinstance(item, str):
            result.append(PollOption(name=item))
        else:
            result.append(PollOption(name=item["name"], description=item.get("description")))
    return result


class PollSettings(BaseModel):
    is_private: bool = False
    invited_emails: list[str] = []
    require_email_verification: bool = False
    allow_vote_editing: bool = False


class PollCreate(BaseModel):
    title: str
    description: str = ""
    options: list[PollOption]
    expires_at: datetime | None = None
    is_private: bool = False
    invited_emails: list[str] = []
    require_email_verification: bool = False
    allow_vote_editing: bool = False
    randomize_options: bool = False

    @field_validator("options")
    @classmethod
    def options_not_empty(cls, v):
        if len(v) < 2:
            raise ValueError("A poll must have at least 2 options")
        options = [o for o in v if o.name]
        if len(options) < 2:
            raise ValueError("A poll must have at least 2 non-empty options")
        return options

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()


class PollUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    options: list[PollOption] | None = None
    expires_at: datetime | None = None
    is_private: bool | None = None
    invited_emails: list[str] | None = None
    require_email_verification: bool | None = None
    allow_vote_editing: bool | None = None
    randomize_options: bool | None = None


class PollResponse(BaseModel):
    id: str
    title: str
    description: str
    options: list[PollOption]
    created_at: datetime
    expires_at: datetime | None
    is_open: bool
    vote_count: int = 0
    is_private: bool
    invited_emails: list[str]
    require_email_verification: bool
    allow_vote_editing: bool
    randomize_options: bool

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_count(cls, poll, vote_count: int = 0):
        raw_options = json.loads(poll.options)
        return cls(
            id=poll.id,
            title=poll.title,
            description=poll.description,
            options=normalize_options(raw_options),
            created_at=poll.created_at,
            expires_at=poll.expires_at,
            is_open=poll.is_open,
            vote_count=vote_count,
            is_private=poll.is_private,
            invited_emails=json.loads(poll.invited_emails),
            require_email_verification=poll.require_email_verification,
            allow_vote_editing=poll.allow_vote_editing,
            randomize_options=poll.randomize_options,
        )
