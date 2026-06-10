#!/usr/bin/env bash
# 本番 URL 一括確認（開発完了報告前に必ず実行）
set -euo pipefail

BASE="${VERIFY_BASE_URL:-https://oceanosfleet.com}"
PREFIX="${VERIFY_BASE_PATH:-/Ziraku}"
PREFIX="${PREFIX%/}"

PASS=0
FAIL=0
BAD=0

check() {
  local label="$1"
  local url="$2"
  local expect="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "$expect" ]]; then
    echo "OK  $code  $label  $url"
    PASS=$((PASS + 1))
  else
    echo "NG  $code  $label  $url  (expected $expect)"
    FAIL=$((FAIL + 1))
  fi
}

check_must_not() {
  local label="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "404" || "$code" == "000" ]]; then
    echo "OK  $code  $label  $url  (must not work)"
    PASS=$((PASS + 1))
  else
    echo "NG  $code  $label  $url  (double basePath — must be 404)"
    BAD=$((BAD + 1))
  fi
}

echo "=== Site verification: $BASE$PREFIX ==="
echo ""

check "トップ"           "$BASE$PREFIX/"
check "Wired"            "$BASE$PREFIX/wired"
check "Notion"           "$BASE$PREFIX/notion"
check "Zapier"           "$BASE$PREFIX/zapier"
check "ZIRAKUテーマ"     "$BASE$PREFIX/ziraku"
check "管理画面"         "$BASE$PREFIX/admin"
check "AI開発コンソール" "$BASE$PREFIX/admin/dev"
check "運用タブ"         "$BASE$PREFIX/admin/operations"
check "dev health API"   "$BASE$PREFIX/api/dev/health"
check "dev chat API"     "$BASE$PREFIX/api/dev/chat"

echo ""
echo "=== Double basePath guard (must 404) ==="
check_must_not "double /Ziraku admin/dev" "$BASE$PREFIX$PREFIX/admin/dev"
check_must_not "double /Ziraku wired"     "$BASE$PREFIX$PREFIX/wired"

echo ""
echo "=== Summary: pass=$PASS fail=$FAIL bad_double_path=$BAD ==="
if [[ "$FAIL" -gt 0 || "$BAD" -gt 0 ]]; then
  exit 1
fi
