import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class NotificationSubscription(Base):
    __tablename__ = "notification_subscriptions"
    __table_args__ = (UniqueConstraint("poll_id", "email", name="uq_poll_email"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    poll_id: Mapped[str] = mapped_column(String, ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    subscribed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    poll: Mapped["Poll"] = relationship("Poll", back_populates="subscriptions")
