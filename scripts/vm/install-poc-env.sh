#!/usr/bin/env bash
# POC 用 env を config/*.b64 から復元（git pull 後に実行）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

base64 -d config/env.b64 > .env
base64 -d config/env.local.b64 > .env.local
chmod 600 .env .env.local

echo "Installed: $ROOT/.env"
echo "Installed: $ROOT/.env.local"
