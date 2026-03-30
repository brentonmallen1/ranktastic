import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Poll(Base):
    __tablename__ = "polls"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    options: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)

    # Access control
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    invited_emails: Mapped[str] = mapped_column(Text, default="[]")  # JSON array of allowed emails

    # Voting options
    require_email_verification: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_vote_editing: Mapped[bool] = mapped_column(Boolean, default=False)
    randomize_options: Mapped[bool] = mapped_column(Boolean, default=False)

    # Results notification tracking
    results_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    votes: Mapped[list["Vote"]] = relationship("Vote", back_populates="poll", cascade="all, delete-orphan")
    subscriptions: Mapped[list["NotificationSubscription"]] = relationship(
        "NotificationSubscription", back_populates="poll", cascade="all, delete-orphan"
    )
