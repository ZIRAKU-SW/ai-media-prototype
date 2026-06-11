# X（Twitter）自動投稿 — Cursor SDK + X API

`@AIbusinessmedia` 向けに、1日5回のAIビジネスニュース投稿を自動化する PoC です。

## 仕組み

```
cron（5回/日）
  → scripts/x/run-slot.ts
      1. RSS から旬なニュース取得
      2. Cursor SDK（Agent.prompt）で日本語投稿文を生成
      3. X API v2 で投稿
      4. data/x-post-history.json に履歴保存
```

## 投稿スロット（JST）

| スロット ID | 時刻 | 内容 |
|------------|------|------|
| `commute_morning` | 7:30 | 朝の通勤 — 今日使えるAI活用 |
| `lunch` | 12:00 | 昼休み — 実践ノウハウ |
| `commute_evening` | 18:00 | 夕方帰宅 — 本日のトレンド |
| `bedtime` | 22:00 | 寝る前 — 深掘り要点 |
| `us_morning` | 23:00 | 米国の朝 — 海外新着ニュース |

## セットアップ

### 1. X Developer API（必須）

**ログイン用パスワードでは API 投稿はできません。** [X Developer Portal](https://developer.x.com/) でアプリを作成し、OAuth 1.0a の User context トークンを取得してください。

1. Developer Portal で Project + App を作成
2. App permissions を **Read and write** に変更
3. Keys and tokens から以下4つを取得:
   - API Key（Consumer Key）
   - API Secret（Consumer Secret）
   - Access Token
   - Access Token Secret
4. Access Token は **@AIbusinessmedia** アカウントで Generate する

### 2. 環境変数（`.env` に追加）

```bash
# Cursor SDK（投稿文生成）
CURSOR_API_KEY=cursor_xxxxxxxx
CURSOR_SDK_MODEL=composer-2.5

# X API v2（投稿実行）— パスワードは不要・使わない
X_API_KEY=xxxxxxxx
X_API_SECRET=xxxxxxxx
X_ACCESS_TOKEN=xxxxxxxx
X_ACCESS_TOKEN_SECRET=xxxxxxxx

# 任意
X_HANDLE=@AIbusinessmedia
X_USERNAME=AIbusinessmedia
X_POST_SITE_URL=https://oceanosfleet.com/Ziraku/ziraku
```

> **セキュリティ**: チャットや Git にパスワードを載せないこと。漏洩した場合は X 側でパスワード変更を推奨。

### 3. 手動テスト

```bash
# スロット一覧
npm run x:slots

# 文面だけ生成（投稿しない）
npm run x:post:dry -- lunch

# 本番投稿
npm run x:post -- lunch
```

### 4. cron 登録（VM）

```bash
# 例をコピーしてパスを調整
cat scripts/x/crontab.example
crontab -e
```

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `scripts/x/run-slot.ts` | エントリポイント |
| `scripts/x/fetch-news.ts` | RSS ニュース取得 |
| `scripts/x/generate-tweet.ts` | Cursor SDK で投稿文生成 |
| `scripts/x/post-tweet.ts` | X API 投稿 |
| `scripts/x/config.ts` | スロット定義 |
| `scripts/x/history.ts` | 投稿履歴・重複防止 |
| `data/x-post-history.json` | 履歴 JSON |

## トラブルシュート

| 症状 | 対処 |
|------|------|
| `X API キー未設定` | Developer Portal で4トークンを `.env` に設定 |
| `403 Forbidden` | App permissions が Read and write か確認 |
| `CURSOR_API_KEY 未設定` | テンプレート文で生成される（投稿は可能） |
| 同じニュースが連投 | 48h 以内の同一見出しはスキップ |

## 全体像との対応

コンセプト図の「集客チャネル → X」に対応。記事サイト（`https://oceanosfleet.com/Ziraku/ziraku`）への導線 URL を毎投稿に含めます。

## 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| `README.md` | 日常運用コマンド・技術スタック |
| `doc/AGENT_SPEC.md` §3-1 | エージェント向け仕様要約 |
| `CURSOR_HANDOFF.md` | 環境変数・URL 一覧 |
| `.env.example` | 必要な環境変数テンプレート |
| `ROADMAP.md` §拡散戦略 | X チャネルの位置づけ |
