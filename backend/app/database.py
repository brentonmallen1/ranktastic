import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings


class Base(DeclarativeBase):
    pass


def get_engine():
    settings = get_settings()
    os.makedirs(settings.data_path, exist_ok=True)
    return create_async_engine(
        settings.database_url,
        echo=False,
        connect_args={"check_same_thread": False},
    )


engine = get_engine()
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add columns introduced after initial schema (safe to run repeatedly)
        migrations = [
            "ALTER TABLE polls ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE polls ADD COLUMN invited_emails TEXT NOT NULL DEFAULT '[]'",
            "ALTER TABLE polls ADD COLUMN require_email_verification INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE polls ADD COLUMN allow_vote_editing INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE polls ADD COLUMN results_sent_at DATETIME",
            "ALTER TABLE votes ADD COLUMN voter_name TEXT",
            "ALTER TABLE votes ADD COLUMN updated_at DATETIME",
            "ALTER TABLE votes ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 1",
            "ALTER TABLE votes ADD COLUMN verification_code TEXT",
            "ALTER TABLE votes ADD COLUMN verification_sent_at DATETIME",
            "ALTER TABLE polls ADD COLUMN randomize_options INTEGER NOT NULL DEFAULT 0",
        ]
        for sql in migrations:
            try:
                await conn.execute(__import__("sqlalchemy").text(sql))
            except Exception:
                pass  # Column already exists


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
