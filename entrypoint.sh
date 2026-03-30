#!/bin/bash
set -e

echo "=== Ranktastic (Unified Container) ==="

# Start nginx in background
echo "[start] Starting nginx..."
nginx

# Start uvicorn in foreground
echo "[start] Starting backend API..."
exec uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
