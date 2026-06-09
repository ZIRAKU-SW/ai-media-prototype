# GCP VM セットアップスクリプト

> **注意（2026-06-09）**  
> 今後の開発は **Cursor Remote SSH（22番）** が主経路。  
> ここにある Web 常駐セットアップは **検証用**。詳細は [`docs/GCP_VM_HANDOFF.md`](../../docs/GCP_VM_HANDOFF.md) を読むこと。

---

## ファイル一覧

| ファイル | 用途 | sudo |
|----------|------|------|
| `setup-dev-console-user.sh` | nvm + npm + PM2 で Next.js 起動 | 不要 |
| `setup-dev-console.sh` | nginx + systemd 版 | **必要** |
| `env.local.template` | VM 用 `.env.local` テンプレ |
| `nginx-ai-media.conf` | 80 → 3000 リバースプロキシ | 必要 |
| `ai-media-dev.service` | systemd ユニット | 必要 |
| `open-firewall-cloudshell.sh` | tcp:3000 開放（**通常は不要**） | Cloud Shell |

---

## 推奨: Remote SSH のみ（スクリプト不要）

```bash
# Mac
ssh gcp-vm

# Cursor: Remote-SSH → gcp-vm → /home/powerpass7/ai-media-prototype
```

### git pull 後（初回・env 更新時）

```bash
bash scripts/vm/install-poc-env.sh   # config/*.b64 → .env / .env.local
```

---

## 検証用: VM 上で Next.js + dev console を動かす

```bash
cd ~/ai-media-prototype
cp scripts/vm/env.local.template .env.local
# .env.local を編集（CURSOR_API_KEY 等）
bash scripts/vm/setup-dev-console-user.sh
```

- 外部公開 **しない** 場合: ファイアウォール 3000 は不要
- Mac から Web UI を見る: `~/.ssh/config` の `LocalForward 3001 localhost:3000` → `http://127.0.0.1:3001/admin/dev`

---

## sudo 版（80 番 + 常駐）

VM の SSH から **sudo 可能なセッション** で:

```bash
sudo apt install -y nginx python3.11-venv
bash scripts/vm/setup-dev-console.sh
```

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| SSH `timed out` | 外部 IP が `34.146.146.150` か確認。ファイアウォール 22 番 |
| SSH `Permission denied` | VM の `~/.ssh/authorized_keys` に Mac 公開鍵 |
| `composer-2.5-fast` エラー | `CURSOR_SDK_MODEL=composer-2.5` |
| build で venv symlink エラー | `rm -rf venv`（VM は venv 使わず `/usr/bin/python3`） |
| gcloud でファイアウォール作成失敗 | VM プロジェクト ID `project-f038e552-b038-4be3-994` でコンソール操作 |
