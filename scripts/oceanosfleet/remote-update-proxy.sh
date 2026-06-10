#!/usr/bin/env bash
# ZIRAKU VM で実行 — SSH 経由で oceanosfleet nginx の Tunnel URL を更新
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SSH_HOST="${OCEANOS_SSH_HOST:-oceanosfleet}"
REMOTE_SCRIPT="${REMOTE_SCRIPT:-$ROOT/scripts/oceanosfleet/update-ziraku-proxy.sh}"

if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$SSH_HOST" "hostname" >/dev/null 2>&1; then
  echo "ERROR: ssh $SSH_HOST に接続できません。" >&2
  echo "" >&2
  echo "oceanosfleet VM で1回実行してください:" >&2
  echo "  curl -fsSL https://raw.githubusercontent.com/ZIRAKU-SW/ai-media-prototype/main/scripts/oceanosfleet/install-ziraku-ssh-key.sh | bash" >&2
  exit 1
fi

echo "==> $SSH_HOST に接続して nginx を更新"
scp -q "$ROOT/data/ziraku-backend-url.txt" "$SSH_HOST:/tmp/ziraku-backend-url.txt"
ssh "$SSH_HOST" "URL_FILE=/tmp/ziraku-backend-url.txt bash -s" < "$REMOTE_SCRIPT"

echo ""
echo "==> ZIRAKU VM から oceanosfleet 確認"
bash "$ROOT/scripts/vm/verify-sites.sh"
