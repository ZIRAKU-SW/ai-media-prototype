# Cursor Agent 引き継ぎドキュメント

> **このファイルの目的**  
> Claude Codeで進めてきた開発をCursor Agentに移行するための完全な引き継ぎ資料。  
> 「何を作ったか」「何が動いているか」「何が残っているか」を全部ここに書く。

最終更新: 2026-06-11（ziraku 本番想定・X 自動投稿 PoC 追記）

---

## 1. プロジェクト概要

**AIビジネスメディア** — 中小企業・一人社長・非エンジニア向けのAI活用実践メディア。  
システム開発・DX支援への問い合わせ獲得を最終目的とする。

```
記事を読む → 課題を認識 → 相談・問い合わせ → 開発・DX支援 → 収益
```

### アクセスURL

| 項目 | URL |
|------|-----|
| **本番（スマホ・共有）** | https://oceanosfleet.com/Ziraku/ |
| WIRED テーマ | https://oceanosfleet.com/Ziraku/wired |
| Notion テーマ | https://oceanosfleet.com/Ziraku/notion |
| Zapier テーマ | https://oceanosfleet.com/Ziraku/zapier |
| 管理画面 | https://oceanosfleet.com/Ziraku/admin |
| AI開発コンソール | https://oceanosfleet.com/Ziraku/admin/dev |
| Vercel（リリース時のみ） | https://project-7bhii.vercel.app |
| GitHub | https://github.com/ZIRAKU-SW/ai-media-prototype |
| Supabase | https://supabase.com/dashboard/project/wqlelowutbxplrzforcc |

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| フロントエンド | Next.js + TypeScript | App Router |
| スタイリング | CSS Variables（テーマ別CSS） | Tailwind CSS補助 |
| DB / Auth | Supabase (PostgreSQL + RLS) | Pro plan |
| 公開 | oceanosfleet.com `/Ziraku/*` | nginx → Cloudflare Tunnel → ZIRAKU VM |
| リリース用 | Vercel | `git push` 時のみ（開発中は使わない） |
| AI 開発（Cursor Agent） | GCP VM + SSH | Remote SSH（22番）+ PM2 常駐 |
| パッケージ管理 | npm | Node.js v20+ |

### 環境変数（POC）

**`.env` / `.env.local` を Git 管理。** clone / pull 後そのまま使える。

| ファイル | 用途 |
|----------|------|
| `.env` | Vercel / Supabase DB |
| `.env.local` | Next.js + AI開発コンソール（VM パス設定済み） |

Mac ローカル dev 時は `DEV_CONSOLE_PROJECT_ROOT` / `DEV_CONSOLE_PYTHON` を Mac パスに差し替える。

**X 自動投稿**（`scripts/x/`）用の追加変数:

| 変数 | 用途 |
|------|------|
| `CURSOR_API_KEY` | 投稿文の AI 生成（`.env.local` と共通可） |
| `X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET` | X API v2 投稿（Developer Portal で取得） |
| `X_HANDLE` / `X_POST_SITE_URL` | 文面テンプレート用 |

手順: [`docs/X_AUTOMATION.md`](./docs/X_AUTOMATION.md)

---

## 3. ディレクトリ構成

```
ai-media-prototype/
├── app/
│   ├── (wired)/
│   │   ├── layout.tsx          ← wired.css読み込み
│   │   ├── wired/page.tsx      ← TopPage theme="wired"
│   │   └── wired/articles/[slug]/page.tsx  ← ArticlePage theme="wired"
│   ├── (notion)/               ← 同構造
│   ├── (zapier)/
│   │   ├── zapier.css          ← Zapier専用CSS（独自実装）
│   │   ├── zapier/page.tsx     ← 独自コンポーネント（TopPage非共通）
│   │   └── zapier/articles/[slug]/page.tsx
│   ├── layout.tsx
│   └── page.tsx                ← テーマ選択トップ
│
├── components/
│   ├── pages/
│   │   ├── TopPage.tsx         ← wired・notion共通トップ
│   │   └── ArticlePage.tsx     ← 3テーマ共通記事詳細（テーマ分岐あり）
│   ├── ArticleCard.tsx         ← 記事カード（wired・notion用）
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── NewsletterForm.tsx
│
├── lib/
│   └── supabase.ts             ← クライアント・型・API関数
│
├── data/
│   ├── articles-md/            ← 記事本文 Markdown（{slug}.md、git 管理・Supabase content の正）
│   ├── platform.db             ← 運用・バグ台帳 SQLite
│   └── x-post-history.json    ← X 投稿履歴
│
├── scripts/
│   ├── articles/
│   │   └── upsert-articles.mjs ← Supabase 記事 upsert（npm run articles:upsert）
│   ├── x/                      ← X 自動投稿
│   └── vm/                     ← VM 再起動・サイト検証
│
├── supabase/
│   ├── schema.sql              ← テーブル定義（9テーブル）
│   └── seeds/articles.sql     ← 記事シードSQL（20本）
│
├── docs/
│   ├── concept.md              ← メディアコンセプト・要件定義
│   ├── GCP_VM_HANDOFF.md       ← GCP VM・SSH・AI開発環境（重要）
│   ├── 参考発信者メディア調査まとめ.pdf
│   └── ENTERPRISE_WEB_AGENT_COST.md  ← 企業AIコスト比較（記事化済み）
│
├── scripts/vm/                 ← VM セットアップ（検証用・README 参照）
│
├── app/admin/dev/              ← AI開発コンソール UI（Vercel では Python 不可）
├── packages/dev-console/       ← 開発コンソール共有パッケージ
├── ai_media_agent/dev_agent.py ← Cursor SDK Python エージェント
│
├── ROADMAP.md                  ← フェーズ計画・タスク管理
├── CONTRIBUTING.md             ← 開発ルール・デプロイ手順
├── CLAUDE.md                   ← AI Agentへの作業ルール（重要）
└── CURSOR_HANDOFF.md           ← このファイル
```

---

## 4. Supabaseデータベース構成

### テーブル一覧

| テーブル | 用途 | 状態 |
|---------|------|------|
| `articles` | 記事本文・メタ情報 | ✅ 12本投入済み |
| `categories` | カテゴリ（6件） | ✅ 投入済み |
| `tags` | タグ | 空 |
| `article_tags` | 記事-タグ中間 | 空 |
| `profiles` | ユーザープロフィール | 空 |
| `article_views` | 閲覧数カウント | 空 |
| `bookmarks` | ブックマーク | 空 |
| `newsletter_subscribers` | メルマガ登録者 | 空 |
| `inquiries` | お問い合わせ | 空 |

### カテゴリ一覧（category_id）

| slug | name | id |
|------|------|----|
| ai-guide | AI活用ガイド | f3b9cc16-c000-4170-aca2-5088182a6717 |
| dx-improvement | DX・業務改善 | f43acafd-bbd9-45aa-b456-0d7de8c8ad38 |
| solo-business | 1人社長・副業・起業 | 4849b578-c60d-45a7-bb03-dcba398ac3df |
| ai-news | AIニュース・トレンド | 816fb483-25c9-414d-b66d-30370382f307 |
| lab | 実験室・開発ブログ | e65ef6d0-cbac-4d77-b8c2-98fd133f7866 |
| tools | ツール比較 | c447f2ed-adc5-4583-acb2-e4cf015a031e |

### RLSの挙動（重要）

- **anon key（`sb_publishable_`）**: SELECT・UPDATE は可、INSERT は **不可**
- **service_role key（`sb_secret_`）**: 全操作可能
- 新記事を追加する場合は必ず `npm run articles:upsert` を使うこと（`SUPABASE_SERVICE_ROLE_KEY` を使用）

```bash
# 推奨: スクリプト経由で upsert（slug で on_conflict merge）
npm run articles:upsert   # scripts/articles/upsert-articles.mjs

# 直接 INSERT が必要な場合（service_role keyが必要）
curl -X POST "https://wqlelowutbxplrzforcc.supabase.co/rest/v1/articles" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"title":"...","slug":"...","category_id":"...","is_published":true,...}'
```

---

## 5. 現在の記事一覧（Supabase 20本）

| # | slug | カテゴリ | 本文 |
|---|------|---------|------|
| 1 | generative-ai-business-guide-2026 | AI活用ガイド | なし |
| 2 | chatgpt-claude-gemini-comparison | ツール比較 | **あり** |
| 3 | ai-meeting-minutes-automation | AI活用ガイド | なし |
| 4 | retail-dx-inventory-automation | DX・業務改善 | **あり**（Before/After表） |
| 5 | solo-president-chatgpt-100man | 1人社長・副業 | なし |
| 6 | lab-sales-email-tool-30min | 実験室 | なし |
| 7 | ai-surprising-usecases-2026 | AIニュース | なし |
| 8 | best-ai-tools-2026 | ツール比較 | なし |
| 9 | free-ai-tools-sales-content | AI活用ガイド | **あり** |
| 10 | president-ai-first-tasks | 1人社長・副業 | **あり** |
| 11 | sme-ai-adoption-first-steps | DX・業務改善 | **あり** |
| 12 | enterprise-ai-cost-web-agent-vs-seat | 実験室 | **あり**（コスト比較表） |
| 13 | claude-fable-5-overview | AIニュース | **あり**（`data/articles-md/`） |
| 14 | claude-fable-5-subagent-strategy | AI活用ガイド | **あり**（`data/articles-md/`） |
| 15 | fable-5-self-correction-loops | AIニュース | **あり**（翻訳・`data/articles-md/`） |
| 16 | anthropic-31-ai-skills | DX・業務改善 | **あり**（`data/articles-md/`） |
| 17 | claude-fable-5-notebooklm | ツール比較 | **あり**（`data/articles-md/`） |
| 18 | claude-autopilot-14-steps | AI活用ガイド | **あり**（翻訳・`data/articles-md/`） |
| 19 | kubell-ceo-fable-5-prompt | AIニュース | **あり**（`data/articles-md/`） |
| 20 | ai-agent-company-management | 1人社長・副業・起業 | **あり**（`data/articles-md/`） |

> 本文なしの記事は「本文準備中です」と表示される。  
> #13〜#20 は 2026-06-11 追加。本文 Markdown は `data/articles-md/{slug}.md` で管理（git 管理）。

---

## 6. 実装済みの主要機能

### 6-1. 記事詳細ページ（ArticlePage.tsx）

Markdownを**行単位のステートマシン**でHTMLに変換（`lib/render-markdown.ts`）：

```
対応記法:
- コードブロック（```）→ <pre><code> にエスケープ処理済み
- テーブル（|...|形式）→ <table>（セパレーター行は除去、ヘッダー行は<th>）
- 見出し（#/##/###）
- 太字（**）
- インラインコード（`）
- リスト（-/1.）
- 画像（![alt](url)）→ <img class="article-detail__img" loading="lazy">（リンクより先に処理）
- リンク（[text](url)）→ <a target="_blank" rel="noopener noreferrer">

未対応: 斜体・引用（>）・水平線・ネストリスト

テーマ機能:
- テーマ別CTA（カテゴリに応じてボタン文言を変える）
- 記事末尾のシェアボタン（X）
- 関連記事セクション
- ニュースレター登録フォーム
```

> `.article-detail__img` の CSS は `app/article-shared.css`（wired/zapier/ziraku）と `app/(notion)/notion.css` の両方に追加済み。

### 6-2. 記事カード（ArticleCard.tsx）

```
- サムネイル画像（picsum.photos）
- 画像なし時: カテゴリ別グラデーション＋絵文字アイコンのフォールバック
- カテゴリバッジ（絵文字付き・半透明オーバーレイ）
- 「記事を読む →」ボタン（テーマカラー）
- 閲覧数・読了時間のメタ情報
```

### 6-3. Zapierテーマ（独自実装）

zapier/page.tsx は TopPage.tsx を使わない独自コンポーネント。  
zapier.css で全スタイル管理。主な要素：

```
- ヒーロー（2カラム: コピー左 + ツールチップ・実績カード右）
- スタッツバー（暗背景・オレンジ強調）
- Values グリッド（4カード・アクセントカードあり）
- メインコンテンツ（記事グリッド2列 + サイドバー300px）
- サイドバー（CTAオレンジブロック + ランキング）
```

### 6-4. 3テーマの差分

| 要素 | WIRED | Notion | Zapier |
|------|-------|--------|--------|
| カラー | インクブルー × ペーパーホワイト | ウォームホワイト × ソフトグレー | オレンジ × ホワイト |
| フォント | セリフ（Noto Serif JP） | サンセリフ | 太字サンセリフ |
| カード角丸 | 4px | 14px | 12px |
| 記事カード | ArticleCard.tsx 共通 | 同左 | zapier独自実装 |
| CTAボタン | 紺グラデーション | ダーク角丸ピル | オレンジ |

---

## 7. バグ台帳・過去トラブル（SQLite）

> **2026-06-10 以降** — バグは SQLite + 運用タブで一元管理。以下の手動リストは `platform_meta/seed.py` の `BUG_ENTRIES` に移行済み。

| 参照先 | 用途 |
|--------|------|
| `data/platform.db` | エージェント向け SQLite 台帳 |
| `data/platform-bugs.json` | 本番 `/admin/operations` 表示用エクスポート |
| `doc/AGENT_SPEC.md` | 仕様・変更履歴 §6 |
| `.cursor/rules/bug-registration.mdc` | バグ登録手順 |

```bash
python3 platform_meta/seed.py                              # 初期化・エクスポート
python3 platform_meta/seed.py --register-bug --title "..." ...  # 新規登録
```

管理画面: https://project-7bhii.vercel.app/admin/operations

---

## 7b. これまでに修正したバグ（教訓・要約）

### バグ1: テーブルのセパレーター行が表示される
- **症状**: `|------|--------|` が文字列としてそのまま表示
- **原因**: 正規表現の複数行マッチが不安定
- **修正**: 行単位ステートマシンに完全書き直し（`renderContent` in ArticlePage.tsx）

### バグ2: Zapierカードが縦長すぎる
- **症状**: 記事カード画像エリアが異常に縦長になる
- **原因**: `aspect-ratio: 16/9` と子要素 `height: 100%` のブラウザ干渉
- **修正**: `height: 190px` 固定に変更（zapier.css）

### バグ3: サムネイルに英語テキストが切れて表示
- **症状**: `placehold.co` 画像の英語テキストがカードの端で切れる
- **修正**: 全記事を `picsum.photos/seed/{id}/800/450` に変更（Supabase PATCH + ソース変更）

### バグ4: ニュースレター欄のプレースホルダーが見えない
- **症状**: 暗背景にグレー文字で視認不可
- **修正**: `color: rgba(255,255,255,0.55)` に変更（zapier.css）

### バグ5: Next.js 15+ の params が Promise
- **症状**: `params.slug` が undefined
- **修正**: `const { slug } = use(params)` に変更（各 `[slug]/page.tsx`）

---

## 8. 作業ルール（CLAUDE.md から転記）

### 絶対ルール: 3パターン全部に対応する

変更・追加・修正は **必ず wired / notion / zapier の3パターン全部** に適用。

| 作業 | 対象ファイル |
|------|------------|
| 記事追加 | `data/articles-md/{slug}.md`（本文 Markdown）+ `lib/dummy-articles.ts`（フォールバック）+ `supabase/seeds/articles.sql` + `scripts/articles/upsert-articles.mjs` の ARTICLES 配列 → `npm run articles:upsert` で Supabase に反映 |
| 共通バグ修正 | `components/pages/ArticlePage.tsx` (全テーマ共通) |
| Zapier固有 | `app/(zapier)/zapier.css` + `app/(zapier)/zapier/page.tsx` |
| デプロイ後確認 | 3パターン全てのURLで動作確認 |

> **TopContent 各テーマ（`components/top/`）は修正不要**（記事データは props 経由で渡すため）。  
> anon key では INSERT 不可。本番反映は必ず `npm run articles:upsert`（`.env.local` の `SUPABASE_SERVICE_ROLE_KEY` を使用）。

---

## 9. 未着手タスク（優先順位付き）

### 🔴 要意思決定（前田さんが決めること）

1. **デザインパターン選択** — WIRED / Notion / Zapier どれを本番採用するか
2. **サイト名確定** — AIBizNavi / Practable / AIZUKAN / AIのトリセツ 等
3. **記事管理方法** — Supabase Studio直接 / `/admin`画面作成 / Notion連携

### 🟠 Phase 2 実装タスク

- [ ] Xアカウント開設・記事投稿スレッド連携
- [ ] 実装デモ動画作成・YouTubeチャンネル
- [ ] 本文なし記事（8本）への本文追加

### 🟡 Phase 3 実装タスク

- [ ] お問い合わせフォーム → Supabase `inquiries` テーブル保存 + メール通知
- [ ] ニュースレター登録 → Resend連携（DBには保存済み）
- [ ] 無料資料DLページ `/downloads`
- [ ] Google Analytics 設定
- [ ] OGP / SNSカード設定
- [ ] 会員登録・ログイン（Supabase Auth）

### 🟢 Phase 4 実装タスク

- [ ] サービスページ詳細化（AI/DX支援・業務自動化・チャットボット開発）
- [ ] 事例記事（導入企業インタビュー）
- [ ] 問い合わせ後の自動返信メール

---

## 10. 参考資料（docs/）

| ファイル | 内容 |
|---------|------|
| `docs/concept.md` | メディアコンセプト・ターゲット・CTA設計 |
| `docs/参考発信者メディア調査まとめ.pdf` | チャエン・ウスタク・Jabba等の参考発信者分析 |
| `docs/ENTERPRISE_WEB_AGENT_COST.md` | 席課金 vs 社内Webエージェントのコスト試算（記事化済み） |

---

## 11. git操作・デプロイ

```bash
# 通常の開発フロー
git add <files>
git commit -m "feat/fix/docs: 変更内容の説明"
git push origin main
# → Vercelが自動デプロイ（1〜2分）

# TypeScriptエラー確認
./node_modules/.bin/tsc --noEmit --project tsconfig.json

# ローカル開発
npm run dev  # → http://localhost:3000
```

---

## 12. Cursor Agentへの申し送り事項

1. **このファイル（CURSOR_HANDOFF.md）と CLAUDE.md を最初に読むこと**
2. **GCP VM で AI 開発する場合は [`docs/GCP_VM_HANDOFF.md`](./docs/GCP_VM_HANDOFF.md) を読むこと**
3. **3パターン全対応ルールは絶対** — 1パターンだけ直して終わりにしない
4. **新記事追加は `npm run articles:upsert`** — anon key では INSERT 不可。本文 Markdown を `data/articles-md/{slug}.md` に置き、メタデータを `lib/dummy-articles.ts` / `supabase/seeds/articles.sql` / `scripts/articles/upsert-articles.mjs` の3箇所に追加してから実行
5. **Zapierページは独自コンポーネント** — TopPage.tsx を使っていないので別途対応
6. **記事の content は Markdown 記法** — renderContent() でHTMLに変換している
7. **Vercel デプロイは git push で自動発火** — 手動デプロイ不要
8. **`/admin/dev` の Web エージェントは Vercel では動かない** — 本番 AI 作業は **Remote SSH → gcp-vm**

---

## 13. GCP VM・oceanosfleet 公開（2026-06-10）

> 詳細は **[docs/GCP_VM_HANDOFF.md](./docs/GCP_VM_HANDOFF.md)** と **[docs/OCEANOSFLEET_NGINX.md](./docs/OCEANOSFLEET_NGINX.md)**。

### 採用方針

| 用途 | 場所 |
|------|------|
| **日常の確認・スマホ共有** | **oceanosfleet.com/Ziraku/** |
| 開発・ビルド | **ZIRAKU VM**（PM2 + Tunnel） |
| Cursor Agent によるコード変更 | **GCP VM + SSH（Remote SSH）** |
| リリース | Vercel（`git push`、枠節約のため開発中は使わない） |

```bash
npm run dev:vm-restart      # build + PM2 再起動（Tunnel 維持）
npm run verify:sites        # oceanosfleet 全 URL（完了報告前に exit 0 必須）
npm run dify:update-proxy   # Tunnel 変更時: ssh dify-vm で nginx 更新
```

### Cursor SSH（2台）

| Host | IP | User | 用途 |
|------|-----|------|------|
| **gcp-vm** | 34.146.146.150 | powerpass7 | 開発・ビルド |
| **dify-vm** | 35.192.37.133 | difyaifaq | oceanosfleet nginx |

gcp-vm から dify-vm へ SSH: Mac の `google_compute_engine` 鍵を gcp-vm にコピー済み → `npm run dify:ssh-test`

### 注意（2026-06-10 で修正済み）

- **Link と basePath:** `<Link href="/admin/dev">` はプレフィックスなし（`withBasePath` 禁止）
- **開発コンソール:** VM ではパスワード不要。`DEV_CONSOLE_PASSWORD` は未設定
- **530 / Error 1033:** Tunnel URL または `proxy_set_header Host` が古い → `npm run dify:update-proxy`

### AI開発コンソール

- URL: https://oceanosfleet.com/Ziraku/admin/dev
- パッケージ: `@oceanos/dev-console`
- API: `/api/dev/chat` → `ai_media_agent/dev_agent.py` → Cursor SDK
- モデル: `CURSOR_SDK_MODEL=composer-2.5`
