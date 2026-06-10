#!/usr/bin/env bash
# oceanosfleet VM で実行 — ZIRAKU Tunnel URL を data/ziraku-backend-url.txt から反映
set -euo pipefail

NGINX_SNIPPET="${NGINX_SNIPPET:-$HOME/ai-agent-platform/deploy/nginx/snippets/ziraku-locations.conf}"
URL_FILE="${URL_FILE:-}"

if [[ -z "$URL_FILE" ]]; then
  if [[ -f "$HOME/ai-media-prototype/data/ziraku-backend-url.txt" ]]; then
    URL_FILE="$HOME/ai-media-prototype/data/ziraku-backend-url.txt"
  elif [[ -f "./data/ziraku-backend-url.txt" ]]; then
    URL_FILE="./data/ziraku-backend-url.txt"
  else
    URL_FILE="$(mktemp)"
    curl -fsSL "https://raw.githubusercontent.com/ZIRAKU-SW/ai-media-prototype/main/data/ziraku-backend-url.txt" -o "$URL_FILE"
  fi
fi

TUNNEL="$(tr -d '[:space:]' < "$URL_FILE")"
if [[ ! "$TUNNEL" =~ ^https://[a-zA-Z0-9-]+\.trycloudflare\.com$ ]]; then
  echo "ERROR: 不正な Tunnel URL: $TUNNEL" >&2
  exit 1
fi
TUNNEL_HOST="${TUNNEL#https://}"

if [[ ! -f "$NGINX_SNIPPET" ]]; then
  echo "ERROR: $NGINX_SNIPPET が見つかりません" >&2
  exit 1
fi

echo "==> Tunnel URL: $TUNNEL"
echo "==> 更新: $NGINX_SNIPPET"

cp "$NGINX_SNIPPET" "${NGINX_SNIPPET}.bak.$(date +%Y%m%d%H%M%S)"
sed -i "s|proxy_pass https://[a-zA-Z0-9-]*\.trycloudflare\.com;|proxy_pass $TUNNEL;|g" "$NGINX_SNIPPET"
sed -i "s|proxy_pass https://[a-zA-Z0-9-]*\.trycloudflare\.com/|proxy_pass $TUNNEL/|g" "$NGINX_SNIPPET"
sed -i "s|proxy_set_header Host [a-zA-Z0-9-]*\.trycloudflare\.com;|proxy_set_header Host $TUNNEL_HOST;|g" "$NGINX_SNIPPET"

NGINX_BIN="${NGINX_BIN:-$HOME/.local/bin/nginx}"
if [[ ! -x "$NGINX_BIN" ]]; then
  echo "ERROR: nginx が見つかりません: $NGINX_BIN" >&2
  exit 1
fi
"$NGINX_BIN" -t -c "$HOME/ai-agent-platform/deploy/nginx/nginx.conf"
"$NGINX_BIN" -s reload -c "$HOME/ai-agent-platform/deploy/nginx/nginx.conf"

echo "==> 確認"
for path in /Ziraku/admin /Ziraku/wired /Ziraku/notion; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://oceanosfleet.com${path}")
  echo "  $code  https://oceanosfleet.com${path}"
  [[ "$code" == "200" ]] || exit 1
done
echo "OK"
