#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

FRONTEND_PID=""
BACKEND_PID=""

log() {
  printf '[start_all_server] %s\n' "$1"
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

if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
  log '找不到 frontend/package.json，无法启动前端。'
  exit 1
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  log 'frontend 依赖尚未安装，请先执行: cd frontend && npm install'
  exit 1
fi

log '启动 frontend (Vite dev server)...'
(
  cd "$FRONTEND_DIR" || exit 1
  npm run dev
) &
FRONTEND_PID=$!

if [[ -f "$BACKEND_DIR/package.json" ]]; then
  if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
    log '检测到 backend/package.json，但 backend 依赖尚未安装，已跳过后端启动。'
  elif node -e "const p=require('$BACKEND_DIR/package.json'); process.exit(p.scripts?.dev || p.scripts?.start ? 0 : 1)"; then
    BACKEND_SCRIPT="$(node -e "const p=require('$BACKEND_DIR/package.json'); process.stdout.write(p.scripts?.dev ? 'dev' : 'start')")"
    log "启动 backend (npm run $BACKEND_SCRIPT)..."
    (
      cd "$BACKEND_DIR" || exit 1
      npm run "$BACKEND_SCRIPT"
    ) &
    BACKEND_PID=$!
  else
    log 'backend/package.json 存在，但未定义 dev/start 脚本，已跳过后端启动。'
  fi
else
  log 'backend 尚未初始化启动脚本，当前仅启动 frontend。'
fi

log '服务启动中。按 Ctrl+C 可关闭所有由此脚本启动的进程。'

wait
