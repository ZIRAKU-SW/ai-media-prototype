# GCP VM セットアップスクリプト

> **日常運用（2026-06-10）**  
> 開発は **gcp-vm**（ZIRAKU VM）、公開確認は **oceanosfleet.com/Ziraku**。  
> 詳細: [`docs/GCP_VM_HANDOFF.md`](../../docs/GCP_VM_HANDOFF.md) / [`docs/OCEANOSFLEET_NGINX.md`](../../docs/OCEANOSFLEET_NGINX.md)

---

## 日常コマンド

```bash
cd ~/ai-media-prototype
npm run dev:vm-restart    # ビルド + PM2 再起動（Tunnel は維持）
npm run verify:sites      # 本番 URL 一括確認（完了報告前に必須）
npm run dev:vm-url        # URL 一覧
npm run dify:ssh-test     # gcp-vm → dify-vm SSH 確認
npm run dify:update-proxy # Tunnel 変更時: nginx 更新 + verify:sites
```

---

## 2台の VM

| Cursor Host | IP | User | 役割 |
|-------------|-----|------|------|
| gcp-vm | 34.146.146.150 | powerpass7 | Next.js + PM2 + Tunnel |
| dify-vm | 35.192.37.133 | difyaifaq | oceanosfleet nginx |

gcp-vm から dify-vm へ SSH するには Mac の `google_compute_engine` 鍵を gcp-vm にコピー:

```bash
# Mac で1回
scp ~/.ssh/google_compute_engine ~/.ssh/google_compute_engine.pub gcp-vm:~/.ssh/
# gcp-vm で
chmod 600 ~/.ssh/google_compute_engine
```

---

## ファイル一覧

| ファイル | 用途 |
|----------|------|
| `restart-dev-env.sh` | ビルド + PM2 再起動 + verify:sites |
| `verify-sites.sh` | oceanosfleet 全 URL 確認 |
| `dev-url.sh` | URL 一覧 |
| `cloudflared-tunnel.sh` | Quick Tunnel 起動 |
| `setup-dev-console-user.sh` | PM2 初回セットアップ |

oceanosfleet: [`scripts/oceanosfleet/`](../oceanosfleet/)

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| oceanosfleet 530 / Error 1033 | `npm run dify:update-proxy`（Tunnel URL + Host ヘッダー） |
| `/Ziraku/Ziraku/...` リンク | `<Link>` に `withBasePath` を使わない |
| PM2 クラッシュループ | `npm run dev:vm-restart` |
| Tunnel URL 変更したい | `RESTART_TUNNEL=1 npm run dev:vm-restart` → `dify:update-proxy` |
