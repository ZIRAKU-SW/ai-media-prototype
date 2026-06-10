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

cat <<EOF
=== VM 開発環境 ===
トップ（テーマ選択）  $BASE/
Wired                 $BASE/wired
Notion                $BASE/notion
Zapier                $BASE/zapier
管理画面              $BASE/admin
AI開発コンソール      $BASE/admin/dev
運用（過去トラブル）  $BASE/admin/operations

本番（リリース時のみ） https://project-7bhii.vercel.app
EOF
