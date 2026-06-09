#!/usr/bin/env bash
# sudo 不要版 — Node(nvm) + cursor-sdk + PM2 で dev console を起動
# 使い方: bash scripts/vm/setup-dev-console-user.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/ai-media-prototype}"
NODE_VERSION="${NODE_VERSION:-20}"

export NVM_DIR="$HOME/.nvm"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "==> nvm インストール"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
# shellcheck disable=SC1090
source "$NVM_DIR/nvm.sh"
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"

grep -q '\.local/bin' "$HOME/.bashrc" || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
export PATH="$HOME/.local/bin:$PATH"

cd "$APP_DIR"

echo "==> cursor-sdk (pip --user)"
if ! python3 -c "import cursor_sdk" 2>/dev/null; then
  curl -sS https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
  python3 /tmp/get-pip.py --user --break-system-packages
  pip install --user --break-system-packages -r requirements-dev.txt
fi

echo "==> npm install"
npm install
mkdir -p run logs data/dev-console/uploads
rm -rf venv

if [[ ! -f .env.local ]]; then
  cp scripts/vm/env.local.template .env.local
  chmod 600 .env.local
fi

if [[ -z "${SKIP_BUILD:-}" ]]; then
  echo "==> npm run build"
  npm run build
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> PM2 で Next.js 起動"
pm2 delete ai-media-dev 2>/dev/null || true
pm2 start npm --name ai-media-dev -- run start
pm2 save

EXTERNAL_IP="$(curl -s -H 'Metadata-Flavor: Google' http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)"

echo ""
echo "=== セットアップ完了 ==="
echo "1. nano $APP_DIR/.env.local"
echo "   - CURSOR_API_KEY（必須）"
echo "   - DEV_CONSOLE_PASSWORD（推奨）"
echo "2. pm2 restart ai-media-dev"
echo "3. GCP ファイアウール: tcp:3000 を許可"
echo "4. http://${EXTERNAL_IP}:3000/admin/dev"
