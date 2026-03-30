import uuid
import secrets
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    poll_id: Mapped[str] = mapped_column(String, ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    voter_name: Mapped[str | None] = mapped_column(String(200), nullable=True)  # Display name, optional
    voter_email: Mapped[str] = mapped_column(String(200), nullable=False)  # Required
    rankings: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array of option strings
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Email verification
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)  # False if poll requires verification
    verification_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    verification_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    poll: Mapped["Poll"] = relationship("Poll", back_populates="votes")
