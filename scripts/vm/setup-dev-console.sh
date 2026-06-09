#!/usr/bin/env bash
# GCP VM 上で AI開発コンソール（Cursor SDK）を動かすセットアップ
# 使い方: bash scripts/vm/setup-dev-console.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ZIRAKU-SW/ai-media-prototype.git}"
APP_DIR="${APP_DIR:-$HOME/ai-media-prototype}"
NODE_MAJOR="${NODE_MAJOR:-20}"

echo "==> 1/7 システムパッケージ"
sudo apt-get update -qq
sudo apt-get install -y -qq git curl ca-certificates nginx

echo "==> 2/7 Node.js ${NODE_MAJOR}.x"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi
node -v
npm -v

echo "==> 3/7 リポジトリ"
if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" pull --ff-only || true
fi

cd "$APP_DIR"

echo "==> 4/7 Python venv + cursor-sdk"
if [[ ! -d venv ]]; then
  python3 -m venv venv
fi
./venv/bin/pip install -q -U pip
./venv/bin/pip install -q -r requirements-dev.txt

echo "==> 5/7 npm install & build"
npm ci 2>/dev/null || npm install
mkdir -p run logs data/dev-console/uploads

if [[ ! -f .env.local ]]; then
  cp scripts/vm/env.local.template .env.local
  chmod 600 .env.local
  echo ""
  echo "!!! .env.local を編集してください（CURSOR_API_KEY, Supabase, DEV_CONSOLE_PASSWORD）"
  echo "    nano $APP_DIR/.env.local"
  echo ""
fi

# shellcheck disable=SC1091
set -a && source .env.local && set +a
export DEV_CONSOLE_PROJECT_ROOT="${DEV_CONSOLE_PROJECT_ROOT:-$APP_DIR}"

if [[ -z "${CURSOR_API_KEY:-}" || "${CURSOR_API_KEY}" == "key_xxxxxxxxxx" ]]; then
  echo "CURSOR_API_KEY 未設定のため build はスキップ（.env.local 編集後に npm run build）"
else
  npm run build
fi

echo "==> 6/7 systemd"
sudo cp scripts/vm/ai-media-dev.service /etc/systemd/system/ai-media-dev.service
sudo systemctl daemon-reload
sudo systemctl enable ai-media-dev
sudo systemctl restart ai-media-dev || echo "（.env 未設定の場合は start 失敗 — 設定後に sudo systemctl restart ai-media-dev）"

echo "==> 7/7 nginx"
sudo cp scripts/vm/nginx-ai-media.conf /etc/nginx/sites-available/ai-media-dev
sudo ln -sf /etc/nginx/sites-available/ai-media-dev /etc/nginx/sites-enabled/ai-media-dev
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "=== セットアップ完了 ==="
echo "1. .env.local に CURSOR_API_KEY / Supabase / DEV_CONSOLE_PASSWORD を入れる"
echo "2. npm run build && sudo systemctl restart ai-media-dev"
echo "3. GCP ファイアウォールで tcp:80 を許可"
echo "4. ブラウザ: http://$(curl -s -H 'Metadata-Flavor: Google' http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)/admin/dev"
echo "5. DEV_CONSOLE_PASSWORD を Dev Console のトークン欄に入力"
