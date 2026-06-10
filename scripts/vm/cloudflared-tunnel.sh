#!/usr/bin/env bash
# Cloudflare Quick Tunnel — ファイアウォール開放不要で VM:3000 を公開
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
URL_FILE="$ROOT/run/dev-console-tunnel-url.txt"
LOG="$ROOT/logs/cloudflared.log"
CLOUDFLARED="${CLOUDFLARED:-$HOME/.local/bin/cloudflared}"
TARGET="${DEV_CONSOLE_TUNNEL_TARGET:-http://127.0.0.1:3000}"

mkdir -p "$ROOT/run" "$ROOT/logs"
: > "$LOG"

if [[ ! -x "$CLOUDFLARED" ]]; then
  echo "cloudflared がありません。bash scripts/vm/setup-cloudflared-tunnel.sh を実行してください。" >&2
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] tunnel start → $TARGET" | tee -a "$LOG"

"$CLOUDFLARED" tunnel --url "$TARGET" 2>&1 | while IFS= read -r line; do
  printf '%s\n' "$line" | tee -a "$LOG"
  if [[ "$line" =~ (https://[a-zA-Z0-9-]+\.trycloudflare\.com) ]]; then
    echo "${BASH_REMATCH[1]}" > "$URL_FILE"
    echo "${BASH_REMATCH[1]}" > "$ROOT/data/ziraku-backend-url.txt"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] tunnel url saved" >> "$LOG"
  fi
done
