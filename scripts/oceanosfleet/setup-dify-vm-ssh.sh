#!/usr/bin/env bash
# ZIRAKU VM（gcp-vm）で実行 — Mac の dify-vm 設定どおり ~/.ssh/config を整える
set -euo pipefail

SSH_DIR="$HOME/.ssh"
CONFIG="$SSH_DIR/config"
KEY="$SSH_DIR/google_compute_engine"
PUB="$KEY.pub"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

BLOCK='# gcp-vm（ZIRAKU VM）から oceanosfleet VM へ — Mac の Cursor 設定と同じ
Host dify-vm
    HostName 35.192.37.133
    User difyaifaq
    IdentityFile ~/.ssh/google_compute_engine
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new'

if [[ -f "$CONFIG" ]] && grep -q '^Host dify-vm$' "$CONFIG"; then
  echo "~/.ssh/config: Host dify-vm あり"
else
  printf '\n%s\n' "$BLOCK" >> "$CONFIG"
  chmod 600 "$CONFIG"
  echo "~/.ssh/config に Host dify-vm を追加しました"
fi

if [[ ! -f "$KEY" ]]; then
  echo ""
  echo "!!! 秘密鍵がありません: $KEY"
  echo ""
  echo "Mac（Cursor で dify-vm に繋いでいるマシン）で1回実行:"
  echo ""
  echo "  scp ~/.ssh/google_compute_engine ~/.ssh/google_compute_engine.pub gcp-vm:~/.ssh/"
  echo ""
  echo "その後 ZIRAKU VM で:"
  echo "  chmod 600 ~/.ssh/google_compute_engine"
  echo "  chmod 644 ~/.ssh/google_compute_engine.pub"
  echo "  ssh dify-vm hostname"
  exit 1
fi

chmod 600 "$KEY"
[[ -f "$PUB" ]] && chmod 644 "$PUB"

echo "鍵: $KEY OK"
echo "接続テスト: ssh dify-vm hostname"
