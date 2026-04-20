#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_VITE_CONFIG_FILE="$FRONTEND_DIR/vite.config.ts"
FRONTEND_ENV_FILE="$FRONTEND_DIR/.env"
BACKEND_ENV_FILE="$BACKEND_DIR/.env"
POSTGRES_FORMULA="postgresql@16"
BACKEND_DEV_PATTERN="$BACKEND_DIR/node_modules/.bin/tsx watch src/server.ts"
FRONTEND_DEV_PATTERN="$FRONTEND_DIR/node_modules/.bin/vite"

FRONTEND_PID=""
BACKEND_PID=""
BACKEND_PORT=""
FRONTEND_PORT=""
BACKEND_URL=""
FRONTEND_URL=""
DATABASE_URL=""
DATABASE_NAME=""

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

  stop_matching_processes "$FRONTEND_DEV_PATTERN" 'frontend'
  stop_matching_processes "$BACKEND_DEV_PATTERN" 'backend'
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

require_env_value() {
  local file_path="$1"
  local key="$2"
  local value

  value="$(read_env_value "$file_path" "$key")"

  if [[ -z "$value" ]]; then
    fail "$(basename "$(dirname "$file_path")")/.env 缺少必要配置：${key}"
  fi

  printf '%s' "$value"
}

ensure_not_template_value() {
  local label="$1"
  local value="$2"

  if [[ "$value" == *"<system-user>"* ]] || [[ "$value" == *"YOUR_"* ]] || [[ "$value" == "REPLACE_WITH_A_REAL_SECRET" ]]; then
    fail "${label} 仍是样板值，请先填写真实配置。"
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

parse_port_from_url() {
  local raw_url="$1"

  node -e "
    const raw = process.argv[1];
    try {
      const parsed = new URL(raw);
      if (!parsed.port) {
        throw new Error('missing port');
      }
      console.log(parsed.port);
    } catch (error) {
      process.exit(1);
    }
  " "$raw_url" || fail "无法从 URL 读取 port：$raw_url"
}

parse_database_name_from_url() {
  local raw_url="$1"

  node -e "
    const raw = process.argv[1];
    try {
      const parsed = new URL(raw);
      const protocol = parsed.protocol;
      const name = parsed.pathname.replace(/^\\/+/, '');
      if (!['postgresql:', 'postgres:'].includes(protocol) || !name) {
        throw new Error('invalid database url');
      }
      console.log(name);
    } catch (error) {
      process.exit(1);
    }
  " "$raw_url" || fail "DATABASE_URL 格式错误，必须是 PostgreSQL 连接串。"
}

read_frontend_port_from_vite_config() {
  [[ -f "$FRONTEND_VITE_CONFIG_FILE" ]] || fail "找不到 frontend/vite.config.ts，无法读取 frontend dev port。"

  node -e "
    const fs = require('fs');
    const filePath = process.argv[1];
    const source = fs.readFileSync(filePath, 'utf8');
    const match = source.match(/server\\s*:\\s*\\{[\\s\\S]*?port\\s*:\\s*(\\d+)/);
    if (!match) {
      process.exit(1);
    }
    console.log(match[1]);
  " "$FRONTEND_VITE_CONFIG_FILE" || fail '无法从 frontend/vite.config.ts 读取 server.port。'
}

load_runtime_config() {
  local database_url frontend_api_base_url frontend_api_port jwt_secret

  BACKEND_PORT="$(require_env_value "$BACKEND_ENV_FILE" 'PORT')"
  DATABASE_URL="$(require_env_value "$BACKEND_ENV_FILE" 'DATABASE_URL')"
  jwt_secret="$(require_env_value "$BACKEND_ENV_FILE" 'JWT_SECRET')"
  frontend_api_base_url="$(require_env_value "$FRONTEND_ENV_FILE" 'VITE_API_BASE_URL')"
  FRONTEND_PORT="$(read_frontend_port_from_vite_config)"

  [[ "$BACKEND_PORT" =~ ^[0-9]+$ ]] || fail "backend/.env 的 PORT 必须是数字。"
  ensure_not_template_value 'backend/.env 的 DATABASE_URL' "$DATABASE_URL"
  ensure_not_template_value 'backend/.env 的 JWT_SECRET' "$jwt_secret"

  frontend_api_port="$(parse_port_from_url "$frontend_api_base_url")"
  [[ "$frontend_api_port" == "$BACKEND_PORT" ]] || fail "frontend/.env 的 VITE_API_BASE_URL port (${frontend_api_port}) 与 backend/.env 的 PORT (${BACKEND_PORT}) 不一致。"

  DATABASE_NAME="$(parse_database_name_from_url "$DATABASE_URL")"
  BACKEND_URL="http://127.0.0.1:${BACKEND_PORT}"
  FRONTEND_URL="http://127.0.0.1:${FRONTEND_PORT}"
}

list_listening_pids() {
  local port="$1"

  lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
}

stop_matching_processes() {
  local pattern="$1"
  local label="$2"
  local pids pid attempt

  pids="$(pgrep -f "$pattern" || true)"
  [[ -z "$pids" ]] && return

  log "检测到残留的 ${label} dev 进程，正在关闭..."

  while read -r pid; do
    [[ -z "$pid" ]] && continue
    kill "$pid" 2>/dev/null || true
  done <<<"$pids"

  for attempt in {1..10}; do
    pids="$(pgrep -f "$pattern" || true)"
    [[ -z "$pids" ]] && return
    sleep 1
  done

  while read -r pid; do
    [[ -z "$pid" ]] && continue
    kill -9 "$pid" 2>/dev/null || true
  done <<<"$pids"
}

ensure_port_available() {
  local port="$1"
  local owner_dir="$2"
  local label="$3"
  local pids pid command

  pids="$(list_listening_pids "$port")"
  [[ -z "$pids" ]] && return

  while read -r pid; do
    [[ -z "$pid" ]] && continue
    command="$(ps -p "$pid" -o command= 2>/dev/null || true)"

    if [[ "$command" == *"$owner_dir"* ]]; then
      continue
    fi

    fail "端口 ${port} 已被非本项目的 ${label} 进程占用：PID ${pid} (${command})"
  done <<<"$pids"

  fail "端口 ${port} 仍被本项目旧的 ${label} 进程占用，请稍后再试。"
}

stop_stale_project_processes() {
  stop_matching_processes "$BACKEND_DEV_PATTERN" 'backend'
  stop_matching_processes "$FRONTEND_DEV_PATTERN" 'frontend'
  ensure_port_available "$BACKEND_PORT" "$BACKEND_DIR" 'backend'
  ensure_port_available "$FRONTEND_PORT" "$FRONTEND_DIR" 'frontend'
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
    if curl --silent --fail --noproxy '*' "$url" >/dev/null 2>&1; then
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
require_command lsof
require_command pgrep
require_command pg_isready "brew install $POSTGRES_FORMULA"
require_command psql "brew install $POSTGRES_FORMULA"
require_command createdb "brew install $POSTGRES_FORMULA"

[[ -f "$FRONTEND_DIR/package.json" ]] || fail '找不到 frontend/package.json，无法启动前端。'
[[ -f "$BACKEND_DIR/package.json" ]] || fail '找不到 backend/package.json，无法启动后端。'

ensure_env_file "$FRONTEND_ENV_FILE" "$FRONTEND_DIR/.env.example"
ensure_env_file "$BACKEND_ENV_FILE" "$BACKEND_DIR/.env.example"
load_runtime_config

ensure_node_modules "$BACKEND_DIR"
ensure_node_modules "$FRONTEND_DIR"
stop_stale_project_processes

log "尝试启动 PostgreSQL 服务 ($POSTGRES_FORMULA)..."
brew services start "$POSTGRES_FORMULA" >/dev/null
wait_for_postgres
ensure_database "$DATABASE_NAME"

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

wait_for_healthcheck "$BACKEND_URL/health"

log '启动 frontend (npm run dev)...'
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

log "Frontend 已启动：$FRONTEND_URL"
log "Backend 已启动：$BACKEND_URL"
log '按 Ctrl+C 可关闭本脚本启动的前后端进程。'

wait
