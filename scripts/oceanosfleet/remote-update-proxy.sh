#!/usr/bin/env bash
# ZIRAKU VM（gcp-vm）で実行 — ssh dify-vm 経由で nginx の Tunnel URL を更新
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SSH_HOST="${DIFY_SSH_HOST:-dify-vm}"
REMOTE_SCRIPT="$ROOT/scripts/oceanosfleet/update-ziraku-proxy.sh"

bash "$ROOT/scripts/oceanosfleet/setup-dify-vm-ssh.sh" || exit 1

if ! ssh -o BatchMode=yes -o ConnectTimeout=15 "$SSH_HOST" "hostname" >/dev/null 2>&1; then
  echo "ERROR: ssh $SSH_HOST に接続できません" >&2
  exit 1
fi

echo "==> ssh $SSH_HOST で nginx 更新"
scp -q "$ROOT/data/ziraku-backend-url.txt" "$SSH_HOST:/tmp/ziraku-backend-url.txt"
ssh "$SSH_HOST" "URL_FILE=/tmp/ziraku-backend-url.txt bash -s" < "$REMOTE_SCRIPT"

echo ""
echo "==> oceanosfleet 確認"
bash "$ROOT/scripts/vm/verify-sites.sh"
