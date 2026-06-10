# oceanosfleet.com — ZIRAKU `/Ziraku` 公開手順

> **状態: 設定済み（2026-06-10）** — スマホから `https://oceanosfleet.com/Ziraku/...` でアクセス可能。

最終更新: 2026-06-10

---

## 1. DNS（お名前.com）

| レコード | 値 | 備考 |
|---------|-----|------|
| `@` A | `35.192.37.133` | **変更不要** |
| サブドメイン | 既存のまま | `/AI/stock` 等は触らない |

**パス `/Ziraku` は DNS では作れない。** oceanosfleet VM の nginx でプロキシする。

---

## 2. アーキテクチャ

```
https://oceanosfleet.com/Ziraku/wired
  → oceanosfleet VM (35.192.37.133) user-nginx
  → https://<tunnel>.trycloudflare.com/Ziraku/wired
  → ZIRAKU VM (34.146.146.150) Next.js :3000
```

| ホスト | IP | 役割 |
|--------|-----|------|
| oceanosfleet VM | `35.192.37.133` | リバースプロキシ（user-nginx） |
| ZIRAKU VM | `34.146.146.150` | Next.js + PM2 + Cloudflare Tunnel |

---

## 3. oceanosfleet VM の実際の構成

システム nginx（`/etc/nginx`）ではなく **user-nginx** を使用:

| 項目 | パス |
|------|------|
| nginx 実行ファイル | `~/.local/bin/nginx` |
| 設定ルート | `~/ai-agent-platform/deploy/nginx/` |
| ZIRAKU スニペット | `deploy/nginx/snippets/ziraku-locations.conf` |
| include 元 | `stock-locations.conf` / `oceanosfleet.conf` |

`scripts/oceanosfleet/apply-ziraku-nginx.sh` は **/etc/nginx 用テンプレ**。user-nginx 環境ではスニペットを手動編集する。

---

## 4. oceanosfleet VM への接続（Mac Cursor のみ）

oceanosfleet VM（35.192.37.133）の nginx 更新は **Mac の Cursor Remote SSH** で行う。  
**ZIRAKU VM の `~/.ssh/config` は変更しない。**

Mac の `~/.ssh/config` 例（参考・Cursor 上の設定）:

```
Host dify-vm
    HostName 35.192.37.133
    User difyaifaq
    IdentityFile ~/.ssh/google_compute_engine
```

Cursor: **Remote-SSH → dify-vm** で oceanosfleet VM に接続し、以下を実行:

```bash
bash scripts/oceanosfleet/update-ziraku-proxy.sh
# または print-tunnel-update.sh の手順どおり nginx を更新
```

---

## 5. Tunnel URL の更新手順

通常の `npm run dev:vm-restart` は **Tunnel を維持**する。URL が変わるのは `RESTART_TUNNEL=1` 時のみ。

### ZIRAKU VM 側

```bash
cd ~/ai-media-prototype
npm run dev:vm-restart
cat data/ziraku-backend-url.txt
# 例: https://courts-elvis-shell-template.trycloudflare.com
```

### oceanosfleet VM 側

1. `deploy/nginx/snippets/ziraku-locations.conf` の `proxy_pass` を新 URL に更新
2. `~/.local/bin/nginx -t`
3. `~/.local/bin/nginx -s reload`
4. 確認:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://oceanosfleet.com/Ziraku/notion
curl -s -o /dev/null -w "%{http_code}\n" https://oceanosfleet.com/Ziraku/wired
```

---

## 6. 安定化（Tunnel 更新を不要にする）

ZIRAKU VM のファイアウォールで **oceanosfleet IP のみ** tcp:3000 を開放:

```bash
# ZIRAKU VM で実行（GCP Console または Cloud Shell）
bash scripts/oceanosfleet/open-vm-firewall-for-oceanos.sh
```

oceanosfleet の `proxy_pass` を固定:

```
proxy_pass http://34.146.146.150:3000;
```

---

## 7. 確認 URL 一覧

| ページ | URL |
|--------|-----|
| トップ | https://oceanosfleet.com/Ziraku/ |
| Wired | https://oceanosfleet.com/Ziraku/wired |
| Notion | https://oceanosfleet.com/Ziraku/notion |
| Zapier | https://oceanosfleet.com/Ziraku/zapier |
| 管理 | https://oceanosfleet.com/Ziraku/admin |
| dev console | https://oceanosfleet.com/Ziraku/admin/dev |
| 既存（触らない） | https://oceanosfleet.com/AI/stock |

---

## 8. 関連ファイル（ZIRAKU リポジトリ）

| パス | 内容 |
|------|------|
| `lib/base-path.ts` | `withBasePath()` ヘルパ |
| `next.config.ts` | `basePath` from `NEXT_PUBLIC_BASE_PATH` |
| `data/ziraku-backend-url.txt` | 現在の Tunnel URL（git 管理） |
| `scripts/oceanosfleet/` | nginx テンプレ・ファイアウォールスクリプト |
| `docs/GCP_VM_HANDOFF.md` | ZIRAKU VM 開発環境 |
