# AIビジネスメディア — デザインプロトタイプ

AIでビジネスを加速する実践メディアのサイトデザイン比較用プロトタイプです。
[getdesign.md](https://getdesign.md/) のデザインシステムを参考に、3パターンのUIを実装・比較します。

> 📄 参考発信者・参考メディアの調査まとめは **[docs/参考発信者メディア調査まとめ.pdf](./docs/参考発信者メディア調査まとめ.pdf)** を参照。  
> 🤖 Cursor Agent / 新しいAIエージェントへの引き継ぎは **[CURSOR_HANDOFF.md](./CURSOR_HANDOFF.md)** を参照。  
> 📋 エージェント統一仕様・バグ台帳は **[doc/AGENT_SPEC.md](./doc/AGENT_SPEC.md)**（運用: `/admin/operations`、[過去トラブルまとめ](./docs/過去トラブルまとめ.md)）を参照。  
> 🖥️ GCP VM・oceanosfleet 公開は **[docs/GCP_VM_HANDOFF.md](./docs/GCP_VM_HANDOFF.md)** / **[docs/OCEANOSFLEET_NGINX.md](./docs/OCEANOSFLEET_NGINX.md)** を参照。  
> 🐦 X 自動投稿（@AIbusinessmedia）は **[docs/X_AUTOMATION.md](./docs/X_AUTOMATION.md)** を参照。

---

## 公開URL（2026-06-10 現在）

**日常の確認・スマホ共有はこちら（本番）**

| テーマ | URL |
|--------|-----|
| テーマ選択 | https://oceanosfleet.com/Ziraku/ |
| ZIRAKU本番想定 | https://oceanosfleet.com/Ziraku/ziraku |
| Wired | https://oceanosfleet.com/Ziraku/wired |
| Notion | https://oceanosfleet.com/Ziraku/notion |
| Zapier | https://oceanosfleet.com/Ziraku/zapier |
| 管理画面 | https://oceanosfleet.com/Ziraku/admin |
| AI開発コンソール | https://oceanosfleet.com/Ziraku/admin/dev |

| 用途 | URL |
|------|-----|
| Vercel（リリース時のみ・枠節約のため開発中は使わない） | https://project-7bhii.vercel.app |
| 既存 Oceanos（半導体株等・触らない） | https://oceanosfleet.com/AI/stock |

### 構成の要点

| ホスト | IP | Cursor SSH | 役割 |
|--------|-----|------------|------|
| **ZIRAKU VM**（gcp-vm） | `34.146.146.150` | `gcp-vm` / `powerpass7` | 開発・ビルド・PM2・Tunnel |
| **oceanosfleet VM**（dify-vm） | `35.192.37.133` | `dify-vm` / `difyaifaq` | nginx プロキシ（`/Ziraku/*`） |
| DNS（お名前.com） | `@` → `35.192.37.133` | — | 変更不要 |

```
ブラウザ → oceanosfleet.com/Ziraku/*
  → dify-vm nginx (user-nginx)
  → Cloudflare Tunnel
  → gcp-vm Next.js :3000 (basePath=/Ziraku)
```

---

## 日常運用（ZIRAKU VM）

```bash
cd ~/ai-media-prototype
npm run dev:vm-restart    # ビルド + PM2 再起動（Tunnel は維持）
npm run verify:sites      # oceanosfleet 全 URL 確認（完了報告前に必須）
npm run dev:vm-url        # URL 一覧
```

Tunnel URL が変わったとき（`RESTART_TUNNEL=1` 後など）:

```bash
npm run dify:update-proxy   # ssh dify-vm で nginx 更新 + verify:sites
```

**gcp-vm → dify-vm SSH**（初回のみ Mac で鍵コピー済みであること）:

```bash
# Mac で1回: scp ~/.ssh/google_compute_engine* gcp-vm:~/.ssh/
npm run dify:ssh-test     # ssh dify-vm hostname
```

詳細: [`docs/OCEANOSFLEET_NGINX.md`](./docs/OCEANOSFLEET_NGINX.md) / [`docs/GCP_VM_HANDOFF.md`](./docs/GCP_VM_HANDOFF.md)

### 実装後の鉄則

- `npm run build` だけでは完了としない → **`npm run verify:sites` が exit 0**
- Tunnel 直 URL が 200 でも **oceanosfleet が 530 なら未完了**
- `<Link href>` に `withBasePath()` を使わない（二重 `/Ziraku/Ziraku/...` になる）

### AI開発コンソール

- URL: https://oceanosfleet.com/Ziraku/admin/dev
- **パスワード不要**（VM では `DEV_CONSOLE_PASSWORD` 未設定。ライブラリの任意認証のみ）
- 送信: ⌘/Ctrl + Enter

### X 自動投稿（@AIbusinessmedia）

コンセプト図の「集客チャネル → X」向け PoC。Cursor SDK で投稿文を生成し、X API v2 で1日5回投稿する。

```bash
npm run x:slots                  # スロット一覧（7:30 / 12:00 / 18:00 / 22:00 / 23:00 JST）
npm run x:post:dry -- lunch      # 文面だけ生成（投稿しない）
npm run x:post -- lunch          # 本番投稿（X API トークン4つが必要）
```

| 項目 | 内容 |
|------|------|
| スクリプト | `scripts/x/`（`run-slot.ts` がエントリ） |
| 履歴 | `data/x-post-history.json` |
| cron 例 | `scripts/x/crontab.example` |
| 環境変数 | `.env` の `CURSOR_API_KEY` + `X_API_*` 4つ（詳細は `.env.example`） |
| 手順書 | [docs/X_AUTOMATION.md](./docs/X_AUTOMATION.md) |

> X への投稿は **Developer Portal の API トークン** が必須。アカウントのログインパスワードでは API 投稿できない。

---

## 背景・目的

中小企業経営者・社員・起業副業層を対象に、AI活用術やDX事例を発信するメディアサイト。
最終目的はシステム開発・DX支援への問い合わせ獲得。

詳細は `/docs/concept.md` を参照。

---

## 3デザインパターン

### Pattern A — WIRED スタイル
**テーマ：** 信頼・実績・B2B訴求

| 項目 | 内容 |
|------|------|
| 参考 | [getdesign.md/wired](https://getdesign.md/wired/design-md) |
| カラー | インクブルー × ペーパーホワイト |
| タイポ | セリフ系見出し ＋ モノスペース小見出し |
| レイアウト | ブロードシート密度（新聞型エディトリアル） |
| ターゲット | 経営者・意思決定者層 |
| 強み | メディアとしての信頼感・記事密度・B2B訴求力 |
| ディレクトリ | `pattern-a-wired/` |

---

### Pattern B — Notion スタイル
**テーマ：** 親しみやすさ・会員獲得

| 項目 | 内容 |
|------|------|
| 参考 | [getdesign.md/notion](https://getdesign.md/notion/design-md) |
| カラー | ウォームホワイト × ソフトグレー、暖色アクセント |
| タイポ | セリフ見出し ＋ 読みやすいサンセリフ本文 |
| レイアウト | ソフトサーフェス・角丸・余白重視 |
| ターゲット | AIリテラシーが高くない社員・個人層 |
| 強み | 「難しくないAI」の温度感・ニュースレター登録誘導力 |
| ディレクトリ | `pattern-b-notion/` |

---

### Pattern C — Zapier スタイル
**テーマ：** 差別化・実験室コンテンツ訴求

| 項目 | 内容 |
|------|------|
| 参考 | [getdesign.md/zapier](https://getdesign.md/zapier/design-md) |
| カラー | ウォームオレンジアクセント × ホワイト |
| タイポ | 大きく明快なサンセリフ、アクセシビリティ重視 |
| レイアウト | イラスト・ビジュアル駆動型 |
| ターゲット | 起業・副業・実験好きな層 |
| 強み | バイブコーディング差別化の「作ってみた」コンテンツとの親和性 |
| ディレクトリ | `pattern-c-zapier/` |

---

## ディレクトリ構成（抜粋）

```
ai-media-prototype/
├── README.md               # このファイル
├── doc/AGENT_SPEC.md       # エージェント統一仕様・変更履歴
├── docs/
│   ├── concept.md          # メディアコンセプト
│   └── X_AUTOMATION.md     # X 自動投稿の手順・仕様
├── app/
│   ├── (wired|notion|zapier|ziraku)/   # テーマ別ルート
│   └── admin/              # 管理・運用・AI開発コンソール
├── scripts/
│   ├── x/                  # X 自動投稿（Cursor SDK + X API）
│   ├── articles/           # 記事 upsert スクリプト（upsert-articles.mjs）
│   └── vm/                 # VM 再起動・サイト検証
├── components/top/         # 各テーマ TopContent
├── data/
│   ├── articles-md/        # 記事本文 Markdown（slug.md、git 管理・Supabase content の正）
│   ├── platform.db         # 運用・バグ台帳
│   └── x-post-history.json # X 投稿履歴
├── pattern-a-wired/        # レガシー静的プロトタイプ
│   ├── index.html          # トップページ
│   ├── article.html        # 記事詳細ページ
│   └── style.css
├── pattern-b-notion/
│   ├── index.html
│   ├── article.html
│   └── style.css
└── pattern-c-zapier/
    ├── index.html
    ├── article.html
    └── style.css
```

---

## 各パターンで実装するページ

### トップページ（index.html）
- ヘッダー：ロゴ・ナビ・ログイン・会員登録CTA
- ヒーローセクション：キャッチコピー・サブコピー・CTAボタン
- 特徴訴求：3〜4つのバリュープロポジション
- 新着記事グリッド：カテゴリタブ切替
- ランキング・人気記事
- メルマガ登録バナー
- フッター

### 記事詳細ページ（article.html）
- パンくずリスト
- 記事タイトル・メタ情報（カテゴリ・日付・読了時間）
- 本文エリア（見出し・本文・コードブロック・画像）
- 記事末尾CTA（相談・問い合わせ誘導）
- 関連記事
- サイドバー（プロフィール・人気記事・メルマガ登録）

---

## 比較ポイント

| 評価軸 | A: WIRED | B: Notion | C: Zapier |
|--------|----------|-----------|-----------|
| 信頼感・権威性 | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| 親しみやすさ | ★★☆☆☆ | ★★★★★ | ★★★★☆ |
| 記事読みやすさ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| CTA訴求力 | ★★★★☆ | ★★★★☆ | ★★★★★ |
| 差別化インパクト | ★★★☆☆ | ★★★☆☆ | ★★★★★ |
| B2B問い合わせ誘導 | ★★★★★ | ★★★☆☆ | ★★★☆☆ |

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロント | Next.js 16 App Router + TypeScript |
| スタイル | テーマ別 CSS（wired / notion / zapier / ziraku）+ `mobile-shared.css` |
| DB | Supabase PostgreSQL |
| 開発実行 | GCP VM（PM2 + Cloudflare Tunnel） |
| 公開 | oceanosfleet.com nginx プロキシ → `/Ziraku/*` |
| リリース用 | Vercel（任意・`git push`） |
| AI開発コンソール | `@oceanos/dev-console` + Python `cursor-sdk` |
| X 自動投稿 | `@cursor/sdk` + `twitter-api-v2` + cron（VM） |

レガシーの静的 HTML プロトタイプ（`pattern-a-wired/` 等）もリポジトリに残っているが、**本番実装は `app/` 配下の Next.js**。

---

## 開発ステップ

- [x] README・コンセプト整理
- [x] Pattern A (WIRED) — トップ・記事詳細実装
- [x] Pattern B (Notion) — トップ・記事詳細実装
- [x] Pattern C (Zapier) — トップ・記事詳細実装
- [x] Supabase DB連携（9テーブル・RLS設定済み）
- [x] Vercel公開
- [x] GCP VM + oceanosfleet.com/Ziraku 公開（nginx プロキシ済み）
- [x] gcp-vm → dify-vm SSH（nginx 自動更新）
- [ ] 3パターン比較・最終デザイン選定

---

## 記事コンテンツ

### 現在の記事一覧（Supabase + DUMMY）

| # | タイトル | カテゴリ | slug |
|---|---------|---------|------|
| 1 | 【2026年最新】生成AIをビジネスで活用する方法 | AI活用ガイド | generative-ai-business-guide-2026 |
| 2 | ChatGPT・Claude・Gemini 徹底比較 | ツール比較 | chatgpt-claude-gemini-comparison |
| 3 | 議事録作成をAIで完全自動化する方法 | AI活用ガイド | ai-meeting-minutes-automation |
| 4 | 在庫管理を自動化して在庫ロスを80%削減した小売業のDX事例 | DX・業務改善 | retail-dx-inventory-automation |
| 5 | 1人社長がChatGPTだけで月商100万を達成した全手順 | 1人社長・副業 | solo-president-chatgpt-100man |
| 6 | 営業メール作成ツールを30分で作ってみた | 実験室 | lab-sales-email-tool-30min |
| 7 | AIが変える意外な世界｜匂い生成・犬語翻訳 | AIニュース | ai-surprising-usecases-2026 |
| 8 | おすすめAIツール30選【2026年最新版】 | ツール比較 | best-ai-tools-2026 |
| 9 | 無料AIツールだけで営業資料・SNS投稿・議事録を作る方法 | AI活用ガイド | free-ai-tools-sales-content |
| 10 | 社長がAIを使うと最初に手放せる業務5つ | 1人社長・副業 | president-ai-first-tasks |
| 11 | 中小企業がAI導入で最初にやるべき3つの業務改善 | DX・業務改善 | sme-ai-adoption-first-steps |
| 12 | 席課金 vs 社内Webエージェント｜企業AIコストを最大97%削減 | 実験室 | enterprise-ai-cost-web-agent-vs-seat |
| 13 | 【速報解説】Claude Fable 5登場──「Mythos-class」史上最高性能モデルは何がすごいのか ★新着 | AIニュース | claude-fable-5-overview |
| 14 | Claude Fable 5は「高すぎる」のか？──サブエージェント分業でコストを抑える使い方 ★新着 | AI活用ガイド | claude-fable-5-subagent-strategy |
| 15 | Anthropic公式が明かすFable 5の真の使い方──プロンプトではなく「自己修正ループ」を設計せよ【翻訳解説】 ★新着 | AIニュース | fable-5-self-correction-loops |
| 16 | Anthropicが「31人分のAI社員」を無料公開──中小企業は採用の前に業務のAI化を ★新着 | DX・業務改善 | anthropic-31-ai-skills |
| 17 | Claude Fable 5×NotebookLM活用術──「究極の頭脳」に「最強の知識」を接続する ★新着 | ツール比較 | claude-fable-5-notebooklm |
| 18 | Claudeを「完全自動運転」にする14ステップ──/loopとRoutinesで自動化スタックを組む【海外記事翻訳】 ★新着 | AI活用ガイド | claude-autopilot-14-steps |
| 19 | 上場企業CEOも実践──高コストなFable 5を「一文のプロンプト」で実用的に使う ★新着 | AIニュース | kubell-ceo-fable-5-prompt |
| 20 | 【保存版】AIエージェントで会社を経営する手順──リサーチ・コンテンツ・事務をAIに任せる ★新着 | 1人社長・副業・起業 | ai-agent-company-management |

> ★新着（#13〜#20）は 2026-06-11 追加。X(Twitter) の話題ポストを出典明記のうえ記事化（#15・#18 は英語記事翻訳）。  
> 本文 Markdown は `data/articles-md/{slug}.md` で管理。Supabase への本番反映は下記コマンドを使う（anon key では INSERT 不可）。

### 記事追加・Supabase 反映

```bash
# 1. data/articles-md/{slug}.md に本文 Markdown を作成（git 管理）
# 2. 以下の3箇所にメタデータを追加:
#    - lib/dummy-articles.ts（フォールバック用）
#    - supabase/seeds/articles.sql
#    - scripts/articles/upsert-articles.mjs の ARTICLES 配列
# 3. Supabase に upsert（slug で on_conflict merge）:
npm run articles:upsert
```

> `.env.local` の `SUPABASE_SERVICE_ROLE_KEY` が必要。TopContent 各テーマへの反映は props 経由のため修正不要。

---

## ロードマップ・タスク管理

> 詳細な計画・タスクリスト・進捗状況はすべて **[ROADMAP.md](./ROADMAP.md)** にまとめています。

[ROADMAP.md](./ROADMAP.md) には以下が記載されています：

| セクション | 内容 |
|-----------|------|
| 💡 なぜこのメディアか | 一般AIメディアとの違い・立ち上げの背景 |
| 🎯 コンセプト・ターゲット | 読者3層（経営者・社員・起業副業）の解説 |
| 💰 収益モデル | 記事→信頼→相談→案件化までのフロー |
| 📂 コンテンツ構成 | 6カテゴリとそれぞれの役割 |
| ⭐ 差別化ポイント | 「紹介する」ではなく「作って見せる」戦略 |
| 📢 拡散戦略 | SEO / X / YouTube / ニュースレターの連携図 |
| 🗺️ 4フェーズ ロードマップ | Phase 1（土台）→ Phase 4（サービス化）のガントチャート |
| ✅ 実装タスク全リスト | フェーズ別の全チェックリスト |
| 📊 現在の進捗 | 何が完了済みで、何が未着手かの一覧 |
| 🚦 次にやること | デザイン確定・サイト名・記事管理方法の意思決定事項 |

**→ まず何をすべきか確認したいときは [ROADMAP.md の「次にやること」](./ROADMAP.md#-次にやること要意思決定) を見てください。**
