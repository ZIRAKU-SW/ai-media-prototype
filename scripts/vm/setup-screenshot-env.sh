#!/usr/bin/env bash
# ヘッドレス Chromium スクショ環境を sudo なしで構築する（VM 再起動後の再構築用）
# 構築先: /tmp/chromelibs + /tmp/node_modules/playwright
# 使い方: bash scripts/vm/setup-screenshot-env.sh && bash scripts/vm/shot.sh <URL> <out.png> <幅> [full]
set -euo pipefail

LIBROOT=/tmp/chromelibs
LIBDIR=$LIBROOT/extracted/usr/lib/x86_64-linux-gnu

if [[ -x "$LIBDIR/../../../usr/lib/x86_64-linux-gnu" ]] && [[ -f $LIBROOT/shot.mjs ]] && [[ -d /tmp/node_modules/playwright ]]; then
  echo "既に構築済み: $LIBROOT"
  exit 0
fi

mkdir -p $LIBROOT
cd $LIBROOT

echo "==> playwright + chromium headless shell"
# 注意: --no-save 禁止。package.json に記録しないと、/tmp で別パッケージを
# npm install したときに playwright が「不要物」として削除される（台帳 #22）
( cd /tmp && npm init -y >/dev/null 2>&1 && npm install --save playwright@1.60.0 2>&1 | tail -1 )
npx -y playwright@1.60.0 install chromium 2>&1 | tail -1

echo "==> 共有ライブラリ（sudo 不要: apt-get download + dpkg -x）"
apt-get download \
  libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libatspi2.0-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libx11-6 libxcb1 libxext6 libexpat1 libglib2.0-0 \
  libxau6 libxdmcp6 libxi6 libxrender1 libwayland-server0 \
  libfontconfig1 libfreetype6 fontconfig-config fonts-liberation fonts-noto-cjk \
  fonts-noto-color-emoji libpng16-16 libbrotli1 zlib1g 2>&1 | tail -1
for f in *.deb; do dpkg -x "$f" extracted/; done
rm -f *.deb

# 不足分を ldd で検出して追加（バイナリのバージョンに依存するため）
BIN=$(ls -d ~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
for round in 1 2 3; do
  missing=$(LD_LIBRARY_PATH=$LIBDIR ldd "$BIN" 2>/dev/null | grep "not found" | awk '{print $1}' | sort -u)
  [[ -z "$missing" ]] && break
  pkgs=""
  for so in $missing; do
    base=$(echo "$so" | sed 's/\.so.*//' | tr 'A-Z' 'a-z')
    ver=$(echo "$so" | grep -oP '(?<=so\.)\d+' || echo "")
    pkgs="$pkgs ${base}${ver}"
  done
  apt-get download $pkgs 2>/dev/null | tail -1 || true
  for f in *.deb; do dpkg -x "$f" extracted/ 2>/dev/null || true; done
  rm -f *.deb
done

echo "==> fontconfig（日本語 + 絵文字）"
mkdir -p $LIBROOT/fontconfig
cat > $LIBROOT/fontconfig/fonts.conf <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>$LIBROOT/extracted/usr/share/fonts</dir>
  <cachedir>$LIBROOT/fontcache</cachedir>
</fontconfig>
EOF

cat > $LIBROOT/shot.mjs <<'EOF'
// usage: node shot.mjs <url> <out.png> <width> [fullpage]
import { chromium } from '/tmp/node_modules/playwright/index.mjs'
const [url, out, width, full] = process.argv.slice(2)
const b = await chromium.launch()
const page = await b.newPage({ viewport: { width: Number(width) || 1280, height: 900 } })
await page.goto(url, { waitUntil: 'load', timeout: 30000 })
await page.waitForTimeout(2500)
await page.screenshot({ path: out, fullPage: full === 'full' })
await b.close()
console.log('saved', out)
EOF

echo "構築完了。bash scripts/vm/shot.sh <URL> <out.png> <幅> [full] で撮影"
