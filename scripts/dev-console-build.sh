#!/usr/bin/env bash
# /admin/dev コンソールからのビルド確認（ローカル開発用）
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATUS="$ROOT/run/dev-console-build.json"
LOG="$ROOT/logs/dev-console-build.log"

mkdir -p "$ROOT/run" "$ROOT/logs"
: > "$LOG"

write_status() {
  local phase="$1" msg="$2" ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '{"phase":"%s","message":%s,"updated_at":"%s"}\n' \
    "$phase" "$(printf '%s' "$msg" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')" "$ts" \
    > "$STATUS"
}

log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG"; }

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT/.env.local"
  set +a
elif [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT/.env"
  set +a
fi

write_status "building" "ビルドを開始しています…"
log "build start (ai-media-prototype)"

bash "$ROOT/scripts/wait-dev-console-job.sh" 300 || true

cd "$ROOT"

if npm run build >>"$LOG" 2>&1; then
  log "build ok"
  write_status "success" "ビルド成功。本番反映は git push → Vercel デプロイを実行してください。"
  exit 0
fi

log "build FAILED"
tail_log="$(tail -n 30 "$LOG" 2>/dev/null)"
write_status "build_failed" "ビルドに失敗しました。ログ末尾:
${tail_log}"
exit 1
