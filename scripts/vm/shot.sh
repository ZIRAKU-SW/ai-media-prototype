#!/usr/bin/env bash
# ヘッドレススクショ: bash scripts/vm/shot.sh <URL> <out.png> <幅> [full]
# 例: bash scripts/vm/shot.sh http://localhost:3000/Ziraku/ziraku /tmp/pc.png 1280 full
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
if [[ ! -f /tmp/chromelibs/shot.mjs ]]; then
  echo "スクショ環境が未構築（VM 再起動後など）。構築します..." >&2
  bash "$SCRIPT_DIR/setup-screenshot-env.sh" >&2
fi
LD_LIBRARY_PATH=/tmp/chromelibs/extracted/usr/lib/x86_64-linux-gnu \
FONTCONFIG_FILE=/tmp/chromelibs/fontconfig/fonts.conf \
node /tmp/chromelibs/shot.mjs "$@"
