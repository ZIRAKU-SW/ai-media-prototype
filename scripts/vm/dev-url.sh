#!/usr/bin/env bash
# VM 開発環境の URL 一覧を表示
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TUNNEL_FILE="$ROOT/run/dev-console-tunnel-url.txt"

BASE=""
if [[ -f "$TUNNEL_FILE" ]]; then
  BASE="$(tr -d '[:space:]' < "$TUNNEL_FILE")"
fi
if [[ -z "$BASE" ]]; then
  BASE="http://127.0.0.1:3000"
  echo "※ トンネル未起動。ローカル URL のみ表示（bash scripts/vm/setup-cloudflared-tunnel.sh）"
  echo ""
fi

if [[ -f "$ROOT/.env.local" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ROOT/.env.local"; set +a
fi
PREFIX="${NEXT_PUBLIC_BASE_PATH:-/Ziraku}"
PREFIX="${PREFIX%/}"

cat <<EOF
=== VM 開発環境（basePath: $PREFIX）===
トップ（テーマ選択）  $BASE$PREFIX/
ZIRAKU本番想定        $BASE$PREFIX/ziraku
Wired                 $BASE$PREFIX/wired
Notion                $BASE$PREFIX/notion
Zapier                $BASE$PREFIX/zapier
管理画面              $BASE$PREFIX/admin
AI開発コンソール      $BASE$PREFIX/admin/dev
運用（過去トラブル）  $BASE$PREFIX/admin/operations

oceanosfleet（nginx設定後） https://oceanosfleet.com$PREFIX/
nginx スニペット: bash scripts/vm/print-oceanosfleet-nginx.sh

Vercel 本番（リリース時） https://project-7bhii.vercel.app/
EOF
