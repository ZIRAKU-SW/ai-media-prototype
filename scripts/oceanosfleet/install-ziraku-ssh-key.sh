#!/usr/bin/env bash
# oceanosfleet VM で1回実行 — ZIRAKU VM から SSH できるようにする
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PUBKEY_FILE="${PUBKEY_FILE:-$SCRIPT_DIR/ziraku-vm-deploy.pub}"

if [[ ! -f "$PUBKEY_FILE" ]]; then
  PUBKEY_FILE="$(mktemp)"
  curl -fsSL "https://raw.githubusercontent.com/ZIRAKU-SW/ai-media-prototype/main/scripts/oceanosfleet/ziraku-vm-deploy.pub" -o "$PUBKEY_FILE"
fi

PUBKEY="$(tr -d '\r' < "$PUBKEY_FILE" | head -1)"
if [[ ! "$PUBKEY" =~ ^ssh- ]]; then
  echo "ERROR: 公開鍵が不正です: $PUBKEY_FILE" >&2
  exit 1
fi

mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

if grep -qF "$PUBKEY" ~/.ssh/authorized_keys; then
  echo "既に登録済み: ziraku-nginx-deploy"
else
  echo "$PUBKEY" >> ~/.ssh/authorized_keys
  echo "登録しました: ziraku-nginx-deploy"
fi

echo ""
echo "ZIRAKU VM (34.146.146.150) から接続テスト:"
echo "  ssh oceanosfleet hostname"
