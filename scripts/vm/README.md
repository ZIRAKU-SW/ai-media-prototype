# GCP VM セットアップスクリプト

> **注意（2026-06-10）**  
> 日常開発は **ZIRAKU VM + PM2 + oceanosfleet.com/Ziraku** が主経路。  
> 詳細は [`docs/GCP_VM_HANDOFF.md`](../../docs/GCP_VM_HANDOFF.md) を読むこと。

---

## 日常コマンド（推奨）

```bash
cd ~/ai-media-prototype
npm run dev:vm-url       # 全 URL 一覧（oceanosfleet 含む）
npm run dev:vm-restart   # build + PM2 再起動
pm2 status               # ai-media-dev / dev-console-tunnel
```

本番確認（デプロイ完了の必須チェック）:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://oceanosfleet.com/Ziraku/notion
curl -s -o /dev/null -w "%{http_code}\n" https://oceanosfleet.com/Ziraku/wired
```

---

## ファイル一覧

| ファイル | 用途 | sudo |
|----------|------|------|
| `restart-dev-env.sh` | ビルド + PM2 再起動 | 不要 |
| `dev-url.sh` | URL 一覧表示 | 不要 |
| `cloudflared-tunnel.sh` | Quick Tunnel 起動 | 不要 |
| `setup-dev-console-user.sh` | nvm + npm + PM2 初回セットアップ | 不要 |
| `setup-dev-console.sh` | nginx + systemd 版 | **必要** |
| `env.local.template` | VM 用 `.env.local` テンプレ |
| `nginx-ai-media.conf` | 80 → 3000 リバースプロキシ | 必要 |
| `ai-media-dev.service` | systemd ユニット | 必要 |
| `open-firewall-cloudshell.sh` | tcp:3000 開放（**通常は不要**） | Cloud Shell |

oceanosfleet 連携: [`docs/OCEANOSFLEET_NGINX.md`](../../docs/OCEANOSFLEET_NGINX.md)

---

## 推奨: Remote SSH

```bash
# Mac
ssh gcp-vm

# Cursor: Remote-SSH → gcp-vm → /home/powerpass7/ai-media-prototype
```

`.env.local` に `NEXT_PUBLIC_BASE_PATH=/Ziraku`（VM のみ。Vercel には未設定）。

---

## Cloudflare Tunnel

```bash
bash scripts/vm/cloudflared-tunnel.sh
cat data/ziraku-backend-url.txt   # oceanosfleet nginx の proxy_pass に設定
```

Tunnel URL は PM2 再起動で変わる。変わったら oceanosfleet の `ziraku-locations.conf` を更新。

安定化: `bash scripts/oceanosfleet/open-vm-firewall-for-oceanos.sh` で VM:3000 を oceanosfleet IP のみ開放。

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| oceanosfleet が 404/530 | Tunnel URL 更新 or nginx `proxy_pass` 確認 |
| PM2 クラッシュループ | `npm run dev:vm-restart`（ポート 3000 占有を解放） |
| SSH `timed out` | 外部 IP `34.146.146.150`、ファイアウォール 22 番 |
| `composer-2.5-fast` エラー | `CURSOR_SDK_MODEL=composer-2.5` |
| build で venv symlink エラー | `rm -rf venv` |
