#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_ENV_FILE="$FRONTEND_DIR/.env"
BACKEND_ENV_FILE="$BACKEND_DIR/.env"
DEFAULT_DATABASE_NAME="hikelog_maps"
DEFAULT_FRONTEND_URL="http://127.0.0.1:4321"
DEFAULT_BACKEND_URL="http://127.0.0.1:3000"
POSTGRES_FORMULA="postgresql@16"

FRONTEND_PID=""
BACKEND_PID=""

append_postgres_path() {
  for candidate in "/opt/homebrew/opt/$POSTGRES_FORMULA/bin" "/usr/local/opt/$POSTGRES_FORMULA/bin"; do
    if [[ -d "$candidate" ]]; then
      export PATH="$candidate:$PATH"
      return
    fi
  done
}

log() {
  printf '[start_all_server] %s\n' "$1"
}

fail() {
  log "$1"
  exit 1
}

cleanup() {
  log '正在关闭已启动的服务...'

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

require_command() {
  local command_name="$1"
  local install_hint="${2:-}"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    if [[ -n "$install_hint" ]]; then
      fail "缺少命令 $command_name。请先执行：$install_hint"
    fi

    fail "缺少命令 $command_name。"
  fi
}

ensure_env_file() {
  local target_file="$1"
  local template_file="$2"

  if [[ ! -f "$target_file" ]]; then
    cp "$template_file" "$target_file"
    log "已建立 $(basename "$(dirname "$target_file")")/.env"
  fi
}

read_env_value() {
  local file_path="$1"
  local key="$2"

  if [[ ! -f "$file_path" ]]; then
    return
  fi

  awk -F '=' -v key="$key" '$1 == key { sub($1 "=", ""); print; exit }' "$file_path"
}

upsert_env_value() {
  local file_path="$1"
  local key="$2"
  local value="$3"
  local escaped_value

  escaped_value="$(printf '%s' "$value" | sed -e 's/[\/&]/\\&/g')"

  if grep -q "^${key}=" "$file_path"; then
    sed -i '' "s/^${key}=.*/${key}=${escaped_value}/" "$file_path"
  else
    printf '\n%s=%s\n' "$key" "$value" >>"$file_path"
  fi
}

ensure_node_modules() {
  local package_dir="$1"

  if [[ ! -d "$package_dir/node_modules" ]]; then
    log "正在安装 $(basename "$package_dir") 依赖..."
    (
      cd "$package_dir"
      npm install
    )
  fi
}

wait_for_postgres() {
  local attempts=30
  local i

  for ((i = 1; i <= attempts; i += 1)); do
    if pg_isready -q; then
      return
    fi
    sleep 1
  done

  fail 'PostgreSQL 未能在预期时间内启动。请检查 brew services status 或本机 5432 端口占用。'
}

ensure_database() {
  local database_name="$1"

  if ! psql postgres -Atqc "SELECT 1 FROM pg_database WHERE datname = '${database_name}'" | grep -q 1; then
    log "正在建立数据库 ${database_name}..."
    createdb "$database_name"
  fi
}

wait_for_healthcheck() {
  local url="$1"
  local attempts=40
  local i

  for ((i = 1; i <= attempts; i += 1)); do
    if curl --silent --fail "$url" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done

  fail "Backend 健康检查失败：$url"
}

append_postgres_path

require_command node
require_command npm
require_command brew
require_command curl
require_command pg_isready "brew install $POSTGRES_FORMULA"
require_command psql "brew install $POSTGRES_FORMULA"
require_command createdb "brew install $POSTGRES_FORMULA"

[[ -f "$FRONTEND_DIR/package.json" ]] || fail '找不到 frontend/package.json，无法启动前端。'
[[ -f "$BACKEND_DIR/package.json" ]] || fail '找不到 backend/package.json，无法启动后端。'

ensure_env_file "$FRONTEND_ENV_FILE" "$FRONTEND_DIR/.env.example"
ensure_env_file "$BACKEND_ENV_FILE" "$BACKEND_DIR/.env.example"

if [[ -z "$(read_env_value "$BACKEND_ENV_FILE" 'JWT_SECRET')" ]]; then
  upsert_env_value "$BACKEND_ENV_FILE" 'JWT_SECRET' "$(openssl rand -base64 32)"
  log '已自动写入 backend JWT_SECRET'
fi

if [[ -z "$(read_env_value "$BACKEND_ENV_FILE" 'DATABASE_URL')" ]]; then
  upsert_env_value \
    "$BACKEND_ENV_FILE" \
    'DATABASE_URL' \
    "postgresql://${USER}@localhost:5432/${DEFAULT_DATABASE_NAME}?schema=public"
  log '已自动写入 backend DATABASE_URL'
fi

if [[ -z "$(read_env_value "$FRONTEND_ENV_FILE" 'VITE_API_BASE_URL')" ]]; then
  upsert_env_value "$FRONTEND_ENV_FILE" 'VITE_API_BASE_URL' "$DEFAULT_BACKEND_URL"
  log '已自动写入 frontend VITE_API_BASE_URL'
fi

ensure_node_modules "$BACKEND_DIR"
ensure_node_modules "$FRONTEND_DIR"

log "尝试启动 PostgreSQL 服务 ($POSTGRES_FORMULA)..."
brew services start "$POSTGRES_FORMULA" >/dev/null
wait_for_postgres
ensure_database "$DEFAULT_DATABASE_NAME"

log '正在生成 Prisma Client...'
(
  cd "$BACKEND_DIR"
  npm run prisma:generate
)

log '正在应用数据库 migration...'
(
  cd "$BACKEND_DIR"
  npm run prisma:deploy
)

log '启动 backend (npm run dev)...'
(
  cd "$BACKEND_DIR"
  npm run dev
) &
BACKEND_PID=$!

wait_for_healthcheck "$DEFAULT_BACKEND_URL/health"

log '启动 frontend (npm run dev)...'
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

log "Frontend 已启动：$DEFAULT_FRONTEND_URL"
log "Backend 已启动：$DEFAULT_BACKEND_URL"
log '按 Ctrl+C 可关闭本脚本启动的前后端进程。'

wait
