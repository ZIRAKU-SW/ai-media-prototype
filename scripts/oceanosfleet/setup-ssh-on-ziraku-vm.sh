#!/usr/bin/env bash
# ZIRAKU VM で実行 — ~/.ssh/config を Mac の dify-vm 設定に合わせる
set -euo pipefail

SSH_DIR="$HOME/.ssh"
CONFIG="$SSH_DIR/config"
GC_KEY="$SSH_DIR/google_compute_engine"
GC_PUB="$GC_KEY.pub"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

BLOCK=$(cat <<'EOF'
# --- ZIRAKU → oceanosfleet（Mac の dify-vm と同じ）---
Host oceanosfleet dify-vm
    HostName 35.192.37.133
    User difyaifaq
    IdentityFile ~/.ssh/google_compute_engine
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
)

if [[ -f "$CONFIG" ]] && grep -q '^Host oceanosfleet dify-vm$' "$CONFIG"; then
  # 古い powerpass7 設定を置換
  sed -i '/^# --- ZIRAKU → oceanosfleet/,/^$/d' "$CONFIG" 2>/dev/null || true
fi

if [[ -f "$CONFIG" ]] && grep -q '^Host oceanosfleet dify-vm$' "$CONFIG"; then
  echo "~/.ssh/config は既に更新済みです"
else
  # 旧 Host oceanosfleet ブロックを削除
  if [[ -f "$CONFIG" ]] && grep -q '^Host oceanosfleet$' "$CONFIG"; then
    awk '
      /^Host oceanosfleet$/ { skip=1; next }
      skip && /^Host / { skip=0 }
      skip && /^$/ { skip=0; next }
      !skip { print }
    ' "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"
  fi
  printf '\n%s\n' "$BLOCK" >> "$CONFIG"
  chmod 600 "$CONFIG"
  echo "~/.ssh/config に Host oceanosfleet / dify-vm を追加しました"
fi

echo ""
if [[ -f "$GC_KEY" ]]; then
  chmod 600 "$GC_KEY"
  [[ -f "$GC_PUB" ]] && chmod 644 "$GC_PUB"
  echo "鍵: $GC_KEY あり"
  echo "接続テスト: ssh oceanosfleet hostname"
else
  echo "!!! 鍵がありません: $GC_KEY"
  echo ""
  echo "Mac で以下を実行して ZIRAKU VM にコピーしてください:"
  echo ""
  echo "  # Mac — 鍵の確認"
  echo "  ls -la ~/.ssh/google_compute_engine*"
  echo "  ssh dify-vm hostname"
  echo ""
  echo "  # Mac — ZIRAKU VM へコピー（Host gcp-vm または powerpass7@34.146.146.150）"
  echo "  scp ~/.ssh/google_compute_engine ~/.ssh/google_compute_engine.pub gcp-vm:~/.ssh/"
  echo ""
  echo "  # ZIRAKU VM — 権限設定"
  echo "  chmod 600 ~/.ssh/google_compute_engine"
  echo "  chmod 644 ~/.ssh/google_compute_engine.pub"
  echo "  ssh oceanosfleet hostname"
  exit 1
fi
