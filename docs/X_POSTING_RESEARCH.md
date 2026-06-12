# X 自動投稿 — 検討まとめ

`@AIbusinessmedia` 向けに、AIビジネスメディア（Ziraku）の記事・ニュースを X で拡散するための手段を比較・検討した記録です。

**運用手順（実装済み）** は [`X_AUTOMATION.md`](./X_AUTOMATION.md) を参照してください。

---

## 1. 目的・前提

| 項目 | 内容 |
|------|------|
| アカウント | `@AIbusinessmedia`（AIビジネスメディア） |
| 投稿頻度（想定） | 1日5回（JST 7:30 / 12:00 / 18:00 / 22:00 / 23:00） |
| 文面生成 | Cursor SDK（`Agent.prompt`）で日本語投稿文を生成 |
| 導線URL | `https://oceanosfleet.com/Ziraku/ziraku` および記事個別URL |
| リポジトリ | `ai-media-prototype` の `scripts/x/` |

**重要:** X への API 投稿には **ログインパスワードは使えない**。Developer Portal の OAuth トークン4つ、またはブラウザ操作・サードパーティ連携が必要。

---

## 2. 検討した4つの方式

```mermaid
flowchart LR
  subgraph gen [文面生成]
    RSS[RSSニュース]
    SDK[Cursor SDK]
    ART[記事テンプレ]
  end
  subgraph post [投稿手段]
    API[X API v2]
    BUF[Buffer等]
    SEMI[半自動コピペ]
    BR[Playwright]
  end
  RSS --> SDK
  ART --> SDK
  SDK --> API
  SDK --> BUF
  SDK --> SEMI
  SDK --> BR
  API --> X[@AIbusinessmedia]
  BUF --> X
  SEMI --> X
  BR --> X
```

### 比較表

| 方式 | 月額コスト目安 | 完全自動 | 公式準拠 | 実装状況 | おすすめ度 |
|------|----------------|----------|----------|----------|------------|
| **① X API（Developer Portal）** | URL付きで約 $30/月（5回/日） | ✅ | ✅ | 実装済み・トークン未設定 | 本番向け |
| **② サードパーティ（Buffer 等）** | 無料枠あり | △（予約は自動） | △（各社がAPI利用） | 未連携 | 無料で始めるなら |
| **③ 半自動（文面だけ自動）** | $0 | ❌ | ✅ | **今すぐ使える** | 検証・少額運用 |
| **④ ブラウザ自動化（Playwright）** | $0 | ✅ | ❌（BANリスク） | 実装済み・試験投稿未完了 | PoC・捨てアカウントのみ |

---

## 3. 方式① X API（公式・推奨だが有料）

### Developer Portal と「無料」の関係

| 種類 | 無料でできる？ |
|------|----------------|
| Xアカウント（@AIbusinessmedia） | ✅ 無料で作成可 |
| Developer Portal 登録 | ✅ 登録自体は可 |
| **API による自動投稿（新規）** | ❌ 実質有料（従量課金） |

2026年2月以降、新規向けの **Free ティアは廃止** され、Pay-per-use（クレジット購入 + 支払い方法登録）がデフォルトです。

参考: [X API pricing](https://docs.x.com/x-api/getting-started/pricing)

### 料金目安（ざっくり）

| 操作 | 単価目安 |
|------|---------|
| テキストのみ投稿 | 約 $0.015 / 回 |
| **URL付き投稿** | 約 **$0.20 / 回** |

本システムは毎回記事URLを載せる想定のため:

- 1日5回 × 30日 ≒ **月150回 → 約 $30/月**
- テキストのみなら **月 $2〜3 程度**

### 必要な設定

Developer Portal で Project + App を作成し、**Read and write** 権限で以下4つを取得:

- `X_API_KEY` / `X_API_SECRET`
- `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET`（@AIbusinessmedia で Generate）

### 実装（リポジトリ内）

```
cron → scripts/x/run-slot.ts
  ① RSS から AI ニュース取得
  ② Cursor SDK で投稿文生成
  ③ twitter-api-v2 で投稿
  ④ data/x-post-history.json に履歴
```

```bash
npm run x:slots
npm run x:post:dry -- lunch    # 文面のみ
npm run x:post -- lunch          # 本番（APIトークン4つ必須）
```

**現状:** コード・cron 例・ドライランは動作確認済み。**API トークン4つは未設定**のため本番投稿は未実施。

---

## 4. 方式② サードパーティ予約投稿

X アカウントを連携し、予約キューに載せる方式。裏では各社が X API を利用しているため、**自分で Developer Portal を触らなくてよい**ことが多い。

| サービス | 無料枠の目安 | 向いている用途 |
|---------|-------------|----------------|
| **Buffer** | 3チャネル、各10件キュー | シンプルな予約投稿 |
| **Typefully** | 月15投稿程度（プランにより変動） | X特化・スレッド |
| Hootsuite / Later 等 | 制限あり | 複数SNS一括管理 |

1日5回でも Buffer 無料枠（キュー10件）で回せる。

### メリット・デメリット

- **メリット:** 無料枠で開始しやすい、BANリスクがブラウザ自動化より低い、スケジュール投稿が安定
- **デメリット:** `scripts/x/` の Cursor SDK 生成文を **別途 Buffer に貼る or API連携** が必要。完全無人化には追加開発

### 連携イメージ（未実装）

1. `npm run x:post:dry -- lunch` で文面生成
2. Buffer のキューにコピペ、または Buffer API / Zapier で転送
3. Buffer が指定時刻に投稿

---

## 5. 方式③ 半自動（無料・今すぐ使える）

すでに実装済みの **文面生成だけ自動、投稿は人間 or Buffer** です。

```bash
npm run x:post:dry -- lunch
npm run x:browser:dry    # 記事3件のプレビュー
```

| 項目 | 評価 |
|------|------|
| コスト | $0 |
| 安全性 | 高（規約違反リスクほぼなし） |
| 手間 | 1日5回コピペ、または Buffer にまとめて登録 |

**PoC・検証フェーズでは最も現実的** な選択肢。

---

## 6. 方式④ ブラウザ自動化（Playwright）

X API 課金を避ける PoC 方式。**利用規約・凍結リスクあり**。捨てアカウント想定。

### 実装内容

| ファイル | 役割 |
|---------|------|
| `scripts/x/browser-post.ts` | ログイン → compose → 投稿、セッション保存 |
| `scripts/x/solo-business-posts.ts` | 1人社長・副業・起業の試験投稿3件 |
| `scripts/x/install-browser-deps.sh` | VM 用 Chromium 依存パッケージ |
| `data/x-browser-state.json` | ログインセッション（gitignore） |

### 環境変数

```bash
X_USERNAME=AIbusinessmedia
X_PASSWORD=********          # APIでは使わない・Gitに載せないこと
X_POST_SITE_URL=https://oceanosfleet.com/Ziraku/ziraku
X_BROWSER_HEADLESS=1
X_BROWSER_POST_DELAY_MS=90000  # 連投防止（90秒）
```

### コマンド

```bash
npm run x:browser:dry      # 3件文面プレビュー
npm run x:browser:trial    # 3件を90秒間隔で投稿
npm run x:browser -- --text "任意の文"
```

### 試験投稿対象（記事3本）

| slug | タイトル |
|------|---------|
| `solo-president-chatgpt-100man` | 1人社長がChatGPTだけで月商100万を達成した全手順 |
| `president-ai-first-tasks` | 社長がAIを使うと最初に手放せる業務5つ |
| `ai-agent-company-management` | 【保存版】AIエージェントで会社を経営する手順 |

記事URL: `https://oceanosfleet.com/Ziraku/ziraku/articles/{slug}`

### 試験投稿の結果（2026-06-12 更新）

| 環境 | 結果 |
|------|------|
| `npm run x:browser:dry` | ✅ 3件の文面生成成功 |
| Cursor IDE ブラウザ | ⚠️ ログイン・投稿は可能だが **自動入力が X の contenteditable と相性悪い**（画面上は全文見えても、投稿時は先頭絵文字だけになる等） |
| GCP VM + Playwright | ❌ `libnspr4.so` 不足（sudo なしで deps インストール不可） |

**教訓:** Post ボタンが disabled なのは「未入力」が原因。逆に、**入力欄に見えている文字 ≠ X が投稿に使う文字** になることがある（Cursor IDE ブラウザの `type` / `fill` 限界）。

**推奨:**
1. **半自動** — `npm run x:browser:dry` の文面をコピーし、手動で compose に貼って Post（いちばん確実）
2. **Playwright（Mac ローカル）** — `browser-post.ts` はクリップボード貼り付け方式に変更済み
3. 文面先頭の **📘 絵文字は廃止**（自動入力で壊れやすい）

### 投稿を完了する手順

**A. Mac ローカル（推奨）**

```bash
npx playwright install chromium
npm run x:browser:trial
```

**B. VM（sudo あり）**

```bash
sudo bash scripts/x/install-browser-deps.sh
npm run x:browser:trial
```

**C. 手動** — `npm run x:browser:dry` の出力を https://x.com/compose/post にコピペ

---

## 7. 推奨ロードマップ

| フェーズ | 手段 | やること |
|---------|------|---------|
| **今（PoC）** | 半自動 | `x:post:dry` で文面生成 → 手動 or Buffer で投稿 |
| **検証後** | Buffer 無料枠 | 予約キュー運用、1日5回を安定化 |
| **本番・無人化** | X API | Developer Portal でクレジット購入、トークン4つ設定、`cron` 登録 |
| **非推奨** | ブラウザ自動化 | 捨てアカウント以外では使わない |

---

## 8. セキュリティ注意

- **ログインパスワードを Git / チャットに載せない**（漏洩時は X でパスワード変更）
- API トークン4つも `.env` のみ。`.env.example` にはプレースホルダのみ
- ブラウザセッション `data/x-browser-state.json` は gitignore 済み

---

## 9. ファイル・コマンド一覧

### npm scripts

| コマンド | 説明 |
|---------|------|
| `npm run x:slots` | 投稿スロット一覧 |
| `npm run x:post:dry -- <slot>` | API方式・文面のみ |
| `npm run x:post -- <slot>` | API方式・本番投稿 |
| `npm run x:browser:dry` | ブラウザ方式・3記事プレビュー |
| `npm run x:browser:trial` | ブラウザ方式・3記事投稿 |

### 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| [`X_AUTOMATION.md`](./X_AUTOMATION.md) | セットアップ・cron・トラブルシュート |
| [`README.md`](../README.md) | 日常運用コマンド |
| [`CURSOR_HANDOFF.md`](../CURSOR_HANDOFF.md) | 環境変数一覧 |
| [`.env.example`](../.env.example) | 変数テンプレート |
| [`ROADMAP.md`](../ROADMAP.md) | 拡散戦略の位置づけ |

---

## 10. 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-06-10 | X API + Cursor SDK 方式を実装（`scripts/x/`） |
| 2026-06-11 | Developer Portal 従量課金の調査、代替手段（Buffer・半自動・ブラウザ）を比較 |
| 2026-06-11 | Playwright ブラウザ自動投稿を実装、記事3本の試験投稿を試行（VM/IDE で未完了） |
