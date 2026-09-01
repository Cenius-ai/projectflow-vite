#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Ensure `python3` is available
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 is required but not found."
  exit 1
fi

echo "==> Installing backend dependencies..."
cd "$ROOT/backend"
pip3 install --break-system-packages -r requirements.txt > /dev/null 2>&1

echo "==> Installing frontend dependencies..."
cd "$ROOT/frontend"
npm ci --silent 2>/dev/null || npm install --silent

echo "==> Setting up environment..."
cd "$ROOT"
if [ ! -f .env ]; then
  cp .env.example .env
  # generate per-install secrets (auto-added by cenius)
  _cenius_gen() { openssl rand -hex 32 2>/dev/null || (head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'); }
  for _k in JWT_SECRET; do
    if grep -qiE "^${_k}=(<.*>|change[-_]?me.*|[[:space:]]*)$" .env 2>/dev/null; then
      sed -i "s|^${_k}=.*|${_k}=$(_cenius_gen)|" .env; fi
  done
  JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
  # Use sed with a delimiter that won't appear in base64/hex secrets: |
  sed -i "s|change-me-to-a-random-secret|${JWT_SECRET}|" .env
fi

# Source env vars
set -a
# shellcheck disable=SC1091
source <(grep -v '^#' "$ROOT/.env" | grep -v '^$')
set +a

echo "==> Running database migrations..."
cd "$ROOT/backend"
python3 -m alembic upgrade head 2>/dev/null || echo "[warn] alembic not available, tables will be created on app start"

echo "==> Starting backend (port 8000)..."
cd "$ROOT"
PYTHONPATH="$ROOT/backend" \
  DATABASE_URL="${DATABASE_URL:-sqlite+aiosqlite:///./projectflow.db}" \
  JWT_SECRET="${JWT_SECRET:-}" \
  python3 -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

echo "==> Starting frontend (port 5173)..."
cd "$ROOT/frontend"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  ProjectFlow is running!"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo ""
echo "  Demo login:"
echo "    Email    : cenius@cenius.ai"
echo "    Password : cenius"
echo "========================================="
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
