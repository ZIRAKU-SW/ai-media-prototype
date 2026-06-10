#!/usr/bin/env bash
# GCP VM の tcp:3000 を開放（Vercel プロキシ → 開発コンソールバックエンド用）
# 実行: bash scripts/vm/open-dev-console-firewall.sh
set -euo pipefail

PROJECT="${GCP_PROJECT:-project-f038e552-b038-4be3-994}"
RULE_NAME="${FIREWALL_RULE_NAME:-default-allow-dev-console-3000}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud が見つかりません。GCP Cloud Shell で scripts/vm/open-firewall-cloudshell.sh を実行してください。"
  exit 1
fi

gcloud config set project "$PROJECT"

if gcloud compute firewall-rules describe "$RULE_NAME" >/dev/null 2>&1; then
  echo "ファイアウォールルール $RULE_NAME は既に存在します"
else
  gcloud compute firewall-rules create "$RULE_NAME" \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:3000 \
    --source-ranges=0.0.0.0/0 \
    --description="AI dev console Next.js port 3000 (x-dev-token で保護)"
  echo "ファイアウォールルール $RULE_NAME を作成しました"
fi

EXTERNAL_IP="$(curl -s -H 'Metadata-Flavor: Google' \
  http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)"

echo ""
echo "バックエンド URL: http://${EXTERNAL_IP}:3000"
echo "Vercel 環境変数 DEV_CONSOLE_BACKEND_URL に上記を設定してください"
