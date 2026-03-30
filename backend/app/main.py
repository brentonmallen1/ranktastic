import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.database import create_tables, AsyncSessionLocal
from app.models.user import User
from app.models.poll import Poll
from app.models.vote import Vote
from app.core.security import hash_password
from app.config import get_settings
from app.routers import health, auth, polls, votes, notifications, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def ensure_admin_user():
    """Create the default admin user if no users exist."""
    settings = get_settings()
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        if not result.scalar_one_or_none():
            admin = User(
                username=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
            )
            db.add(admin)
            await db.commit()
            logger.info("Created default admin user: %s", settings.admin_username)


async def ensure_demo_poll():
    """Create (or upgrade) the demo 'Favorite Color' poll to the rich 10-option version."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Poll).where(Poll.title == "Favorite Color"))
        existing = result.scalar_one_or_none()
        if existing:
            existing_options = json.loads(existing.options)
            if len(existing_options) >= 10:
                return  # Already the rich version
            # Delete old votes and poll to recreate with richer data
            votes_result = await db.execute(select(Vote).where(Vote.poll_id == existing.id))
            for v in votes_result.scalars().all():
                await db.delete(v)
            await db.delete(existing)
            await db.flush()

        options = [
            {"name": "Crimson", "description": "A deep, rich red with hints of blue"},
            {"name": "Ocean Blue", "description": "The deep blue of the open sea"},
            {"name": "Forest Green", "description": "Dark green like a pine forest"},
            {"name": "Sunflower", "description": "Bright, cheerful yellow"},
            {"name": "Violet", "description": "A regal purple hue"},
            {"name": "Tangerine", "description": "Warm, energetic orange"},
            {"name": "Teal", "description": "Blue-green like tropical waters"},
            {"name": "Rose", "description": "Soft, romantic pink"},
            {"name": "Slate", "description": "Cool, sophisticated gray"},
            {"name": "Coral", "description": "Warm peachy-pink tone"},
        ]

        poll = Poll(
            title="Favorite Color",
            description="Vote for your favorite color. Results demonstrate instant-runoff voting with multiple elimination rounds.",
            options=json.dumps(options),
            is_open=False,
            is_private=False,
            invited_emails=json.dumps([]),
        )
        db.add(poll)
        await db.flush()

        # 13 pre-seeded votes designed to produce 8 interesting elimination rounds.
        # Winner: Rose (beats Ocean Blue in final round via warm-family vote transfers).
        option_names = [o["name"] for o in options]
        votes_data = [
            # Warm red family — 3 votes
            ["Crimson", "Coral", "Rose", "Tangerine", "Violet", "Ocean Blue", "Teal", "Forest Green", "Sunflower", "Slate"],
            ["Crimson", "Rose", "Coral", "Tangerine", "Violet", "Teal", "Ocean Blue", "Forest Green", "Sunflower", "Slate"],
            ["Coral", "Crimson", "Rose", "Tangerine", "Sunflower", "Violet", "Teal", "Ocean Blue", "Forest Green", "Slate"],
            # Cool blue/green family — 4 votes
            ["Ocean Blue", "Teal", "Forest Green", "Slate", "Violet", "Rose", "Coral", "Crimson", "Tangerine", "Sunflower"],
            ["Ocean Blue", "Slate", "Teal", "Forest Green", "Violet", "Rose", "Coral", "Tangerine", "Crimson", "Sunflower"],
            ["Forest Green", "Teal", "Ocean Blue", "Slate", "Violet", "Rose", "Coral", "Crimson", "Tangerine", "Sunflower"],
            ["Teal", "Ocean Blue", "Forest Green", "Slate", "Violet", "Rose", "Coral", "Tangerine", "Crimson", "Sunflower"],
            # Yellow/orange family — 2 votes
            ["Sunflower", "Tangerine", "Coral", "Rose", "Crimson", "Violet", "Teal", "Ocean Blue", "Forest Green", "Slate"],
            ["Tangerine", "Sunflower", "Coral", "Rose", "Crimson", "Violet", "Teal", "Ocean Blue", "Forest Green", "Slate"],
            # Purple/pink — 2 votes
            ["Violet", "Rose", "Coral", "Crimson", "Tangerine", "Teal", "Ocean Blue", "Forest Green", "Sunflower", "Slate"],
            ["Rose", "Violet", "Coral", "Crimson", "Tangerine", "Teal", "Ocean Blue", "Forest Green", "Sunflower", "Slate"],
            # Cool crossover — 1 vote
            ["Slate", "Ocean Blue", "Teal", "Forest Green", "Violet", "Rose", "Coral", "Crimson", "Tangerine", "Sunflower"],
            # Wild card — 1 vote
            ["Forest Green", "Ocean Blue", "Teal", "Violet", "Rose", "Coral", "Crimson", "Tangerine", "Sunflower", "Slate"],
        ]

        voter_names = [
            "Alice", "Bob", "Carol", "Dave", "Eve",
            "Frank", "Grace", "Hank", "Iris", "Jack",
            "Kate", "Liam", "Mia",
        ]

        for i, rankings in enumerate(votes_data):
            # Validate all rankings are valid option names
            assert all(r in option_names for r in rankings), f"Invalid ranking in vote {i}"
            vote = Vote(
                poll_id=poll.id,
                voter_name=voter_names[i],
                voter_email=f"{voter_names[i].lower()}@example.com",
                rankings=json.dumps(rankings),
            )
            db.add(vote)

        await db.commit()
        logger.info("Created demo 'Favorite Color' poll with %d votes", len(votes_data))


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    await ensure_admin_user()
    await ensure_demo_poll()
    yield


app = FastAPI(title="Ranktastic API", version="2.0.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api")
app.include_router(polls.router, prefix="/api")
app.include_router(votes.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
