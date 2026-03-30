# Ranktastic justfile

# Show available commands
default:
    @just --list

# ── Development ──────────────────────────────────────────────────────────────

# Start both frontend and backend in development mode
dev:
    @echo "Starting development servers..."
    @just backend-dev & just frontend-dev & wait

# Start backend only
backend-dev:
    cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend only
frontend-dev:
    cd frontend && npm run dev

# ── Setup ─────────────────────────────────────────────────────────────────────

# Install all dependencies
setup:
    cd backend && uv sync
    cd frontend && npm install

# Copy .env.example to .env (won't overwrite)
init-env:
    @test -f .env || (cp .env.example .env && echo "Created .env — please update SECRET_KEY and ADMIN_PASSWORD")
    @test -f .env && echo ".env already exists"

# ── Testing ───────────────────────────────────────────────────────────────────

# Run backend tests
test-backend:
    cd backend && uv run pytest

# Run frontend type check
test-frontend:
    cd frontend && npm run build

# Run all tests
test:
    just test-backend
    just test-frontend

# ── Docker ────────────────────────────────────────────────────────────────────

# Build Docker image
build:
    docker compose build

# Start production stack
up:
    docker compose up -d

# Stop production stack
down:
    docker compose down

# View logs
logs:
    docker compose logs -f

# Rebuild and restart
redeploy:
    just build
    just down
    just up
    just logs

# ── Release ───────────────────────────────────────────────────────────────────

# Generate CalVer version (YYYY.MM.DD or YYYY.MM.DD.N for multiple releases per day)
_calver:
    #!/usr/bin/env bash
    TODAY=$(date +%Y.%m.%d)
    EXISTING=$(git tag -l "${TODAY}*" 2>/dev/null | sort -V | tail -1)
    if [ -z "$EXISTING" ]; then
        echo "$TODAY"
    elif [ "$EXISTING" = "$TODAY" ]; then
        echo "${TODAY}.1"
    else
        PATCH=$(echo "$EXISTING" | sed "s/${TODAY}\.//")
        echo "${TODAY}.$((PATCH + 1))"
    fi

# Show what version would be released
version:
    @echo "Next version: $(just _calver)"

# Build and push release to registry
release:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ -f .env ]; then
        source .env
    fi

    if [ -z "${DOCKER_REGISTRY:-}" ]; then
        echo "Error: DOCKER_REGISTRY not set in .env"
        echo "Example: DOCKER_REGISTRY=docker.io/username"
        exit 1
    fi

    echo "Cleaning build context..."
    rm -rf backend/.venv frontend/node_modules/.vite 2>/dev/null || true

    VERSION=$(just _calver)
    IMAGE="${DOCKER_REGISTRY}/ranktastic"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Releasing ranktastic v${VERSION}"
    echo "Image: ${IMAGE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    docker buildx build \
        --platform linux/amd64 \
        --build-arg APP_VERSION="${VERSION}" \
        --tag "${IMAGE}:${VERSION}" \
        --tag "${IMAGE}:latest" \
        --push \
        .

    git tag -a "${VERSION}" -m "Release ${VERSION}"
    git push origin "${VERSION}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Released ${IMAGE}:${VERSION}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build release locally without pushing (for testing)
release-local:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Cleaning build context..."
    rm -rf backend/.venv frontend/node_modules/.vite 2>/dev/null || true

    VERSION=$(just _calver)
    echo "Building ranktastic:${VERSION} locally..."
    docker buildx build \
        --platform linux/amd64 \
        --build-arg APP_VERSION="${VERSION}" \
        --tag "ranktastic:${VERSION}" \
        --tag "ranktastic:latest" \
        --load \
        .
