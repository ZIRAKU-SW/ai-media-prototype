#!/usr/bin/env bash
# Cloud Shell 不要 — VM 上で Cloudflare Tunnel を PM2 常駐
# 使い方: bash scripts/vm/setup-cloudflared-tunnel.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/ai-media-prototype}"
BIN_DIR="${HOME}/.local/bin"
CLOUDFLARED="$BIN_DIR/cloudflared"

mkdir -p "$BIN_DIR" "$APP_DIR/run" "$APP_DIR/logs"

if [[ ! -x "$CLOUDFLARED" ]]; then
  echo "==> cloudflared インストール"
  curl -fsSL -o "$CLOUDFLARED" \
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
  chmod +x "$CLOUDFLARED"
fi

"$CLOUDFLARED" --version

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

cd "$APP_DIR"
chmod +x scripts/vm/cloudflared-tunnel.sh

echo "==> PM2: dev-console-tunnel"
pm2 delete dev-console-tunnel 2>/dev/null || true
pm2 start scripts/vm/cloudflared-tunnel.sh --name dev-console-tunnel --interpreter bash
pm2 save

echo "==> トンネル URL 待機（最大 30 秒）"
for _ in $(seq 1 30); do
  if [[ -f run/dev-console-tunnel-url.txt ]]; then
    URL="$(cat run/dev-console-tunnel-url.txt)"
    if [[ -n "$URL" ]]; then
      echo ""
      echo "=== セットアップ完了 ==="
      echo "トンネル URL: $URL"
      echo ""
      echo "Vercel 環境変数:"
      echo "  DEV_CONSOLE_BACKEND_URL=$URL"
      echo "  DEV_CONSOLE_PASSWORD=<.env.local と同じ値>"
      echo ""
      echo "確認: curl -s $URL/api/dev/health"
      exit 0
    fi
  fi
  sleep 1
done

echo "URL ファイルがまだありません。logs/cloudflared.log を確認してください。" >&2
exit 1
