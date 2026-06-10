#!/usr/bin/env bash
# ZIRAKU VM で実行 — ~/.ssh/config と鍵パスを整える
set -euo pipefail

SSH_DIR="$HOME/.ssh"
CONFIG="$SSH_DIR/config"
KEY="$SSH_DIR/id_oceanos_deploy"
PUB="$KEY.pub"
REPO_KEY="$(cd "$(dirname "$0")" && pwd)/ziraku-vm-deploy.pub"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

if [[ ! -f "$KEY" ]]; then
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "ziraku-nginx-deploy"
fi
chmod 600 "$KEY"
chmod 644 "$PUB"

# リポジトリの .pub と同期（鍵が既にある場合は上書きしない）
if [[ -f "$REPO_KEY" ]] && ! diff -q "$PUB" "$REPO_KEY" >/dev/null 2>&1; then
  echo "注意: ローカル鍵と scripts/oceanosfleet/ziraku-vm-deploy.pub が一致しません。"
  echo "      oceanosfleet に登録するのは次の公開鍵です:"
  cat "$PUB"
fi

BLOCK=$(cat <<'EOF'

# --- ZIRAKU → oceanosfleet（ai-media-prototype 管理用）---
Host oceanosfleet
    HostName 35.192.37.133
    User powerpass7
    IdentityFile ~/.ssh/id_oceanos_deploy
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
)

if [[ -f "$CONFIG" ]] && grep -q '^Host oceanosfleet$' "$CONFIG"; then
  echo "~/.ssh/config に Host oceanosfleet は既にあります"
else
  printf '%s\n' "$BLOCK" >> "$CONFIG"
  chmod 600 "$CONFIG"
  echo "~/.ssh/config に Host oceanosfleet を追加しました"
fi

echo ""
echo "次のステップ（oceanosfleet VM で1回）:"
echo "  bash scripts/oceanosfleet/install-ziraku-ssh-key.sh"
echo ""
echo "接続テスト:"
echo "  ssh oceanosfleet hostname"
