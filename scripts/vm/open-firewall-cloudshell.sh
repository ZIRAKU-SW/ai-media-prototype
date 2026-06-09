# GCP Cloud Shell で実行（VM と同じプロジェクトで）
# プロジェクト: project-f038e552-b038-4be3-994
gcloud config set project project-f038e552-b038-4be3-994

gcloud compute firewall-rules create default-allow-dev-console-3000 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:3000 \
  --source-ranges=0.0.0.0/0 \
  --description="AI dev console Next.js port 3000"
