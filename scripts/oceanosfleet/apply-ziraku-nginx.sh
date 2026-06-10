#!/usr/bin/env bash
# oceanosfleet.com（35.192.37.133）で /Ziraku → GCP VM の Next.js にプロキシ
# 実行場所: oceanosfleet サーバー（sudo 必要）
#   curl -fsSL https://raw.githubusercontent.com/ZIRAKU-SW/ai-media-prototype/main/scripts/oceanosfleet/apply-ziraku-nginx.sh | sudo bash
set -euo pipefail

ZIRAKU_VM_IP="${ZIRAKU_VM_IP:-34.146.146.150}"
ZIRAKU_VM_PORT="${ZIRAKU_VM_PORT:-3000}"
ZIRAKU_TUNNEL_URL="${ZIRAKU_TUNNEL_URL:-}"
ZIRAKU_URL_FILE="${ZIRAKU_URL_FILE:-https://raw.githubusercontent.com/ZIRAKU-SW/ai-media-prototype/main/data/ziraku-backend-url.txt}"
CONF="/etc/nginx/conf.d/ziraku-ai-media.conf"

pick_backend() {
  local direct="http://${ZIRAKU_VM_IP}:${ZIRAKU_VM_PORT}"
  if curl -sf --connect-timeout 4 "${direct}/Ziraku/api/dev/health" >/dev/null 2>&1; then
    echo "$direct"
    return
  fi
  if [[ -n "$ZIRAKU_TUNNEL_URL" ]]; then
    echo "${ZIRAKU_TUNNEL_URL%/}"
    return
  fi
  local fetched
  fetched="$(curl -sf --connect-timeout 8 "$ZIRAKU_URL_FILE" 2>/dev/null | tr -d '[:space:]' || true)"
  if [[ -n "$fetched" ]] && curl -sf --connect-timeout 8 "${fetched%/}/Ziraku/api/dev/health" >/dev/null 2>&1; then
    echo "${fetched%/}"
    return
  fi
  echo "ERROR: VM直結 (${direct}) に届きません。GCP ファイアウォールで tcp:3000 を開放するか、ZIRAKU_TUNNEL_URL を指定してください。" >&2
  exit 1
}

BACKEND="$(pick_backend)"
BACKEND_HOST="$(echo "$BACKEND" | sed -E 's#^https?://##; s#/.*##')"

echo "==> backend: $BACKEND"

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx がありません: sudo apt install -y nginx" >&2
  exit 1
fi

mkdir -p /etc/nginx/conf.d
cat > "$CONF" <<EOF
# AIビジネスメディア — /Ziraku（自動生成 $(date -u +%Y-%m-%dT%H:%M:%SZ)）
location = /Ziraku {
    return 301 /Ziraku/;
}

location /Ziraku/ {
    proxy_pass ${BACKEND}/Ziraku/;
    proxy_http_version 1.1;
    proxy_ssl_server_name on;
    proxy_set_header Host ${BACKEND_HOST};
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 1800s;
    proxy_send_timeout 1800s;
    client_max_body_size 20m;
}
EOF

nginx -t
systemctl reload nginx

echo ""
echo "=== 完了 ==="
echo "確認: curl -sI https://oceanosfleet.com/Ziraku/notion | head -3"
curl -sf --connect-timeout 10 -o /dev/null -w "local test: %{http_code}\n" "http://127.0.0.1/Ziraku/notion" || true
