#!/usr/bin/env bash
# oceanosfleet.com/Ziraku 全ページの HTTP ステータスを検証（開発完了報告前に必須）
set -euo pipefail

BASE="${OCEANOSFLEET_BASE:-https://oceanosfleet.com/Ziraku}"
FAIL=0

check() {
  local path="$1"
  local expect="${2:-200}"
  local url="${BASE}${path}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "$expect" ]]; then
    echo "OK  $code  $url"
  else
    echo "NG  $code (expected $expect)  $url"
    FAIL=1
  fi
}

echo "=== oceanosfleet サイト検証: $BASE ==="

check "/" 200
check "/wired" 200
check "/notion" 200
check "/zapier" 200
check "/ziraku" 200
check "/admin" 200
check "/admin/dev" 200
check "/admin/operations" 200
check "/wired/articles/chatgpt-claude-gemini-comparison" 200
check "/notion/articles/chatgpt-claude-gemini-comparison" 200
check "/zapier/articles/chatgpt-claude-gemini-comparison" 200

# ziraku バックページ
check "/ziraku/articles" 200
check "/ziraku/articles/chatgpt-claude-gemini-comparison" 200
check "/ziraku/services" 200
check "/ziraku/company" 200
check "/ziraku/seminar" 200
check "/ziraku/privacy" 200
check "/ziraku/category/ai-guide" 200

# 二重 basePath は 404 であること（リンクバグの検知）
check "/Ziraku/admin/dev" 404

echo ""
if [[ "$FAIL" -eq 0 ]]; then
  echo "=== 全チェック合格 ==="
  exit 0
else
  echo "=== 失敗あり。開発完了として報告しないこと ==="
  exit 1
fi
