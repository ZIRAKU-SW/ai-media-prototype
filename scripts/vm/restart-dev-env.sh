#!/usr/bin/env bash
# VM 開発環境を再起動（ビルド → PM2）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> 孤立 next プロセスを停止"
pkill -f "next-server" 2>/dev/null || true
sleep 2

echo "==> npm run build"
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> PM2 再起動"
if [[ "${RESTART_TUNNEL:-0}" == "1" ]]; then
  echo "    （RESTART_TUNNEL=1 — Tunnel も再起動。oceanosfleet nginx 更新が必要）"
  pm2 delete ai-media-dev dev-console-tunnel 2>/dev/null || true
  pm2 start ecosystem.config.cjs
else
  echo "    （Tunnel は維持 — oceanosfleet nginx の URL 変更を防ぐ）"
  if pm2 describe ai-media-dev >/dev/null 2>&1; then
    pm2 restart ai-media-dev
  else
    pm2 start ecosystem.config.cjs --only ai-media-dev
  fi
  if ! pm2 describe dev-console-tunnel >/dev/null 2>&1; then
    pm2 start ecosystem.config.cjs --only dev-console-tunnel
  fi
fi
pm2 save

echo ""
bash scripts/vm/dev-url.sh
