# GCP VM 開発環境 — 引き継ぎドキュメント

> **目的**  
> GCP VM・SSH・AI開発コンソールに関する検討と設定を、次の Cursor Agent / 開発者がリポジトリだけで引き継げるようにまとめた資料。

最終更新: 2026-06-09

---

## 1. 結論（先に読む）

### 採用方針

| 用途 | 場所 | 方法 |
|------|------|------|
| **公開サイト**（wired / notion / zapier） | **Vercel** | `git push origin main` → 自動デプロイ |
| **AI によるコード変更** | **GCP VM** | **Cursor Remote SSH**（22番）で VM に接続し、別 Agent で実行 |
| **ブラウザの `/admin/dev`** | ローカル Mac のみ（任意） | Vercel 上では **UI のみ**（Python エージェント不可） |

### やらないこと（2026-06-09 時点の決定）

- **VM の 3000 番をインターネットに公開しない**（ファイアウォール不要）
- **`http://34.146.146.150:3000/admin/dev` を本番運用しない**
- VM 上の Web UI 経由 Cursor SDK は **検証用に一度構築したが、今後の開発フローには使わない**

**理由:** 今後は Cursor の別 Agent を **SSH 経由**（Remote SSH）で VM 上で動かす。22 番だけで足りる。

---

## 2. アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│  Vercel（本番）                                          │
│  https://project-7bhii.vercel.app                       │
│  · 記事サイト 3 テーマ                                    │
│  · /admin（記事管理 UI）                                  │
│  · /admin/dev → UI のみ（Python / Cursor SDK は動かない） │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  GCP VM（開発・AI 実行用）                                │
│  SSH :22 のみ公開                                         │
│  · Cursor Remote SSH → ファイル編集・ターミナル           │
│  · Cursor Agent が git / npm / Python を実行              │
│  · 変更は git commit → push → Vercel 反映                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ローカル Mac（任意）                                     │
│  · npm run dev + /admin/dev（Cursor SDK 付き Web UI）     │
│  · ssh gcp-vm で VM に接続                                │
└─────────────────────────────────────────────────────────┘
```

### AI開発コンソール（`/admin/dev`）の位置づけ

| 環境 | Web UI | Cursor SDK（Python） |
|------|--------|----------------------|
| Vercel | ○ 表示 | **× 不可**（サーバーレス・Python なし） |
| ローカル Mac | ○ | **○** `.env.local` + venv |
| GCP VM（PM2） | ○（検証済・**運用しない**） | ○（検証済） |
| **GCP VM + Remote SSH** | 不要 | **○ Agent が直接実行（推奨）** |

関連コード:

- UI: `app/admin/dev/`, `packages/dev-console/`
- API: `app/api/dev/{chat,upload,deploy}/`
- Python: `ai_media_agent/dev_agent.py`（`cursor-sdk` の `Agent.prompt`）
- ビルド: `scripts/dev-console-build.sh`

---

## 3. GCP VM 情報

| 項目 | 値 |
|------|-----|
| インスタンス名 | `instance-20260609-065002` |
| ゾーン | `asia-northeast1-a` |
| 外部 IP（固定） | **`34.146.146.150`**（静的 IP 名: `vm-ip1`） |
| 内部 IP | `10.146.0.2` |
| OS ユーザー | `powerpass7` |
| GCP プロジェクト ID | **`project-f038e552-b038-4be3-994`** |
| プロジェクト番号 | `1062866428387` |
| リポジトリ（VM 上） | `~/ai-media-prototype` |

> ⚠️ Mac の `gcloud` が指すプロジェクト（例: `project-582dce35-04c1-4648-a3c`）と **VM のプロジェクトは別** の可能性がある。ファイアウール等は **VM のプロジェクト** のコンソールで操作すること。

---

## 4. SSH 接続（必須）

### Mac の `~/.ssh/config`（設定済み）

```
Host gcp-vm
    HostName 34.146.146.150
    User powerpass7
    IdentityFile ~/.ssh/id_ed25519_gcp
    IdentitiesOnly yes
    LocalForward 3001 localhost:3000   # 任意: VM 上で Next が動いているときだけ
```

### 接続

```bash
ssh gcp-vm
```

### Cursor Remote SSH

1. **Cmd + Shift + P** → `Remote-SSH: Connect to Host...`
2. **`gcp-vm`** を選択
3. フォルダを開く: `/home/powerpass7/ai-media-prototype`

### 公開鍵

- Mac 秘密鍵: `~/.ssh/id_ed25519_gcp`
- VM: `~/.ssh/authorized_keys` に Mac の公開鍵を登録済み

### ファイアウォール

- **`default-allow-ssh`（tcp:22）** があれば SSH は OK
- **tcp:3000 は開放しない**（開発方針上不要）

---

## 5. VM 上に構築したもの（参考・任意）

2026-06-09 に検証用セットアップを実施。Remote SSH 開発のみなら **PM2 / Next.js 常駐は停止してよい**。

| 項目 | 状態 |
|------|------|
| git clone | `~/ai-media-prototype` |
| Node.js 20 | nvm（`~/.nvm`） |
| cursor-sdk | `pip install --user`（`~/.local/bin`） |
| `.env.local` | VM 上に配置済み（**秘密情報は Git に含めない**） |
| PM2 `ai-media-dev` | `npm run start`（port 3000）— **停止可** |
| nginx / systemd | **未導入**（sudo パスワードが必要だったため） |

### PM2 を止める場合（VM 上）

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
pm2 delete ai-media-dev
pm2 save
```

### 再セットアップ用スクリプト

`scripts/vm/` を参照（`scripts/vm/README.md`）。

---

## 6. 環境変数

**`.env` / `.env.local` を Git 管理（POC）。** VM では `git pull` でそのまま取得。

| ファイル | 内容 |
|----------|------|
| `.env` | Vercel トークン、Supabase DB |
| `.env.local` | Next.js、Cursor API、dev console（VM パス） |

### VM 引き継ぎ

```bash
cd ~/ai-media-prototype && git pull
# .env / .env.local はリポジトリから取得済み
```

### Python デフォルトモデル

`ai_media_agent/dev_agent.py` のデフォルトは **`composer-2.5`** に変更済み。

---

## 7. 検討経緯メモ

### 静的 IP

- GCP コンソール **VPC ネットワーク → IP アドレス** で外部 IP を「静的アドレスに昇格」
- 固定後: `34.146.146.150`（以前メモしていた `34.146.145.250` は **別 IP / 誤記**）

### SSH が `timed out` になった原因

1. `~/.ssh/config` の IP が古かった → `34.146.146.150` に修正で解決
2. 公開鍵未登録 → `Permission denied`（タイムアウトとは別）
3. VM 内の `gcloud` は Compute サービスアカウント権限のみ → **GCP 管理はブラウザコンソール or Mac の gcloud**

### 3000 番を開ける必要があるか

**Remote SSH 開発のみ → 不要。**

- 22 番: SSH / Cursor Remote SSH
- 3000 番: ブラウザから `http://外部IP:3000/...` で Web UI を見る場合のみ必要
- SSH トンネル（`LocalForward 3001 localhost:3000`）なら 22 番だけで `http://127.0.0.1:3001/admin/dev` にアクセス可能（Web UI を使う場合の回避策）

### Vercel と VM の役割分担

| | Vercel | GCP VM |
|---|--------|--------|
| 公開トラフィック | ○ | ×（22 のみ） |
| Next.js 常駐 | ○ | 任意（推奨しない） |
| Cursor SDK / Python Agent | × | ○（SSH 上で実行） |
| git push デプロイ | ○ 自動 | 変更源になりうる |

---

## 8. 推奨開発フロー（次 Agent 向け）

1. **CURSOR_HANDOFF.md** と **CLAUDE.md** を読む
2. **Remote SSH → `gcp-vm`** で VM に接続
3. `cd ~/ai-media-prototype && git pull`
4. 変更・Agent 実行（VM 上または Mac ローカル）
5. `npm run build` で確認
6. `git commit` → `git push origin main`
7. **Vercel 本番**で wired / notion / zapier を確認

ローカルで `/admin/dev` の Web UI を使う場合は Mac で `npm run dev` + `.env.local`。

---

## 9. 関連ファイル

| パス | 内容 |
|------|------|
| `docs/GCP_VM_HANDOFF.md` | このファイル |
| `scripts/vm/README.md` | VM セットアップスクリプト説明 |
| `CURSOR_HANDOFF.md` | プロジェクト全体の引き継ぎ |
| `CLAUDE.md` | 3 テーマ・デプロイルール |
| `.cursor/rules/vercel-deploy.mdc` | Vercel デプロイ必須ルール |
| `packages/dev-console/README.md` | 開発コンソール統合ガイド |
| `.env.example` | 環境変数テンプレ |

---

## 10. セキュリティ

- **POC:** `.env` / `.env.local` を Git 管理（demo 引き継ぎ優先）
- **本番化時:** `.gitignore` に戻し、全キーをローテーション
- VM の 3000 番を公開しない方針で、攻撃面を SSH のみに限定
