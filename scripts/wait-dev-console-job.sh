#!/usr/bin/env bash
# dev コンソールの Agent ジョブ完了を待つ（ビルド前の 502 防止）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JOB="$ROOT/run/dev-console-chat.json"
MAX_WAIT="${1:-300}"
PID_FILE="$ROOT/run/dev-console-agent.pid"

phase() {
  python3 -c "
import json
from pathlib import Path
p = Path('${JOB}')
if not p.is_file():
    print('idle')
else:
    print(json.loads(p.read_text()).get('phase', 'idle'))
" 2>/dev/null || echo idle
}

if [[ "$(phase)" != "running" ]]; then
  exit 0
fi

echo ">> dev コンソール Agent 実行中 — 最大 ${MAX_WAIT}s 待機…"
for ((i = 0; i < MAX_WAIT; i += 2)); do
  if [[ "$(phase)" != "running" ]]; then
    echo ">> Agent ジョブ終了"
    exit 0
  fi
  if [[ -f "$PID_FILE" ]]; then
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && ! kill -0 "$pid" 2>/dev/null; then
      echo ">> Agent プロセス終了"
      exit 0
    fi
  fi
  sleep 2
done
echo "WARN: Agent 待機タイムアウト — ビルドを続行します"
