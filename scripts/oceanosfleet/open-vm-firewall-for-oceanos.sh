#!/usr/bin/env bash
# GCP コンソール用 — oceanosfleet(35.192.37.133) から VM:3000 へ直結できるようにする
# プロジェクト: 1062866428387 / VM: instance-20260609-065002 / asia-northeast1-a
#
# Cloud Shell または gcloud 権限がある環境で:
#   bash scripts/oceanosfleet/open-vm-firewall-for-oceanos.sh
set -euo pipefail

PROJECT="${GCP_PROJECT:-1062866428387}"
RULE="allow-oceanosfleet-to-ziraku-3000"
OCEANOS_IP="35.192.37.133/32"

gcloud config set project "$PROJECT"

if gcloud compute firewall-rules describe "$RULE" --project="$PROJECT" >/dev/null 2>&1; then
  echo "ルール $RULE は既に存在します"
else
  gcloud compute firewall-rules create "$RULE" \
    --project="$PROJECT" \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:3000 \
    --source-ranges="$OCEANOS_IP" \
    --description="oceanosfleet nginx → Ziraku dev VM :3000"
  echo "ファイアウォール $RULE を作成しました"
fi

echo ""
echo "確認（oceanosfleet サーバー上）:"
echo "  curl -s http://34.146.146.150:3000/Ziraku/api/dev/health"
