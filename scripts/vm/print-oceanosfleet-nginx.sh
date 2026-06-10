#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TUNNEL="$(tr -d '[:space:]' < "$ROOT/run/dev-console-tunnel-url.txt" 2>/dev/null || true)"

if [[ -z "$TUNNEL" ]]; then
  echo "トンネル URL がありません。bash scripts/vm/setup-cloudflared-tunnel.sh" >&2
  exit 1
fi

TUNNEL_HOST="${TUNNEL#https://}"
TUNNEL_HOST="${TUNNEL_HOST#http://}"
TUNNEL_HOST="${TUNNEL_HOST%%/*}"
sed -e "s|__TUNNEL_URL__|${TUNNEL%/}|" -e "s|__TUNNEL_HOST__|${TUNNEL_HOST}|" \
  "$ROOT/scripts/vm/nginx-oceanosfleet-ziraku.conf"
