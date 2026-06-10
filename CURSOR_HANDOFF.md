# Cursor Agent 引き継ぎドキュメント

> **このファイルの目的**  
> Claude Codeで進めてきた開発をCursor Agentに移行するための完全な引き継ぎ資料。  
> 「何を作ったか」「何が動いているか」「何が残っているか」を全部ここに書く。

最終更新: 2026-06-09

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
| Vercel（公開中） | https://project-7bhii.vercel.app |
| WIRED テーマ | https://project-7bhii.vercel.app/wired |
| Notion テーマ | https://project-7bhii.vercel.app/notion |
| Zapier テーマ | https://project-7bhii.vercel.app/zapier |
| GitHub | https://github.com/ZIRAKU-SW/ai-media-prototype |
| Supabase | https://supabase.com/dashboard/project/wqlelowutbxplrzforcc |

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| フロントエンド | Next.js + TypeScript | App Router |
| スタイリング | CSS Variables（テーマ別CSS） | Tailwind CSS補助 |
| DB / Auth | Supabase (PostgreSQL + RLS) | Pro plan |
| デプロイ | Vercel | GitHub連携・自動デプロイ |
| AI 開発（Cursor Agent） | GCP VM + SSH | Remote SSH（22番） |
| パッケージ管理 | npm | Node.js v20+ |

### 環境変数（POC）

**`.env` / `.env.local` を Git 管理。** clone / pull 後そのまま使える。

| ファイル | 用途 |
|----------|------|
| `.env` | Vercel / Supabase DB |
| `.env.local` | Next.js + AI開発コンソール（VM パス設定済み） |

Mac ローカル dev 時は `DEV_CONSOLE_PROJECT_ROOT` / `DEV_CONSOLE_PYTHON` を Mac パスに差し替える。

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
├── supabase/
│   ├── schema.sql              ← テーブル定義（9テーブル）
│   └── seeds/articles.sql     ← 記事シードSQL（12本）
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
- 新記事をAPIで追加する場合は必ず `SUPABASE_SERVICE_ROLE_KEY` を使うこと

```bash
# 記事INSERT例（service_role keyが必要）
curl -X POST "https://wqlelowutbxplrzforcc.supabase.co/rest/v1/articles" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"title":"...","slug":"...","category_id":"...","is_published":true,...}'
```

---

## 5. 現在の記事一覧（Supabase 12本）

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

> 本文なしの記事は「本文準備中です」と表示される。

---

## 6. 実装済みの主要機能

### 6-1. 記事詳細ページ（ArticlePage.tsx）

Markdownを**行単位のステートマシン**でHTMLに変換：

```
機能:
- コードブロック（```）→ <pre><code> にエスケープ処理済み
- テーブル（|...|形式）→ <table>（セパレーター行は除去、ヘッダー行は<th>）
- 見出し（#/##/###）
- 太字（**）
- インラインコード（`）
- リスト（-/1.）
- テーマ別CTA（カテゴリに応じてボタン文言を変える）
- 記事末尾のシェアボタン（X）
- 関連記事セクション
- ニュースレター登録フォーム
```

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
| 記事追加 | `components/pages/TopPage.tsx` のDUMMY + `app/(zapier)/zapier/page.tsx` のDUMMY + `supabase/seeds/articles.sql` |
| 共通バグ修正 | `components/pages/ArticlePage.tsx` (全テーマ共通) |
| Zapier固有 | `app/(zapier)/zapier.css` + `app/(zapier)/zapier/page.tsx` |
| デプロイ後確認 | 3パターン全てのURLで動作確認 |

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
4. **新記事追加は service_role key で INSERT** — anon key では弾かれる
5. **Zapierページは独自コンポーネント** — TopPage.tsx を使っていないので別途対応
6. **記事の content は Markdown 記法** — renderContent() でHTMLに変換している
7. **Vercel デプロイは git push で自動発火** — 手動デプロイ不要
8. **`/admin/dev` の Web エージェントは Vercel では動かない** — 本番 AI 作業は **Remote SSH → gcp-vm**

---

## 13. GCP VM・AI 開発環境（2026-06-09）

> 詳細は **[docs/GCP_VM_HANDOFF.md](./docs/GCP_VM_HANDOFF.md)** に集約。

### 採用方針

| 用途 | 場所 |
|------|------|
| 公開サイト | Vercel（`git push`） |
| Cursor Agent によるコード変更 | **GCP VM + SSH（Remote SSH）** |
| ブラウザ `/admin/dev` | ローカル Mac のみ（任意） |

**VM の 3000 番公開・Web UI 経由 Cursor SDK は不要**（SSH 22 番のみ）。

### 接続

```
Host gcp-vm → 34.146.146.150 / powerpass7 / ~/.ssh/id_ed25519_gcp
```

Cursor: **Remote-SSH: Connect to Host → gcp-vm** → `/home/powerpass7/ai-media-prototype`

### AI開発コンソール（参考）

- パッケージ: `@oceanos/dev-console`（`packages/dev-console/`）
- API: `/api/dev/chat` → Python `ai_media_agent/dev_agent.py` → Cursor SDK
- Vercel: UI のみ。Python エージェントは **サーバーレスでは不可**
- モデル: `CURSOR_SDK_MODEL=composer-2.5`（`composer-2.5-fast` は API エラー）
