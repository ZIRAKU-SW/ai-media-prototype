#!/usr/bin/env bash
# Playwright Chromium 用システム依存（Ubuntu/Debian）
# 実行: sudo bash scripts/x/install-browser-deps.sh
set -euo pipefail
apt-get update
apt-get install -y \
  libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 \
  libdbus-1-3 libatspi2.0-0 libxshmfence1
echo "Done. Run: npm run x:browser:trial"
