#!/usr/bin/env bash
# oceanosfleet VM で実行する Tunnel URL 更新手順を表示
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
URL_FILE="$ROOT/data/ziraku-backend-url.txt"

if [[ ! -f "$URL_FILE" ]]; then
  echo "ERROR: $URL_FILE がありません。先に npm run dev:vm-restart を実行してください。" >&2
  exit 1
fi

TUNNEL="$(tr -d '[:space:]' < "$URL_FILE")"

cat <<EOF
=== oceanosfleet VM で Tunnel URL を更新 ===

現在のバックエンド: $TUNNEL

1. deploy/nginx/snippets/ziraku-locations.conf の proxy_pass を更新:
   proxy_pass $TUNNEL;

2. nginx テスト & reload:
   ~/.local/bin/nginx -t && ~/.local/bin/nginx -s reload

3. 確認:
   curl -s -o /dev/null -w "%{http_code}\n" https://oceanosfleet.com/Ziraku/admin/dev

※ コード変更時は restart-dev-env.sh が Tunnel を維持するようになった。
  Tunnel を意図的に再発行する場合のみ:
    RESTART_TUNNEL=1 bash scripts/vm/restart-dev-env.sh
EOF
