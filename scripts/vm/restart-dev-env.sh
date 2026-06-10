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
pm2 delete ai-media-dev dev-console-tunnel 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
bash scripts/vm/dev-url.sh
