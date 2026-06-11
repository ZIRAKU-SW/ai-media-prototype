# AIビジネスメディア — エージェント向け仕様

> Cursor Agent / Claude Code が作業を始める前に読む統一仕様。  
> ルールの要約は `.cursor/rules/agent-spec.mdc` にもある。

最終更新: 2026-06-11

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 目的 | 3デザインパターン比較 + **ziraku 本番想定UI** の実装 |
| 本番（日常確認） | https://oceanosfleet.com/Ziraku/ |
| 本番想定トップ | https://oceanosfleet.com/Ziraku/ziraku |
| X 公式アカウント | @AIbusinessmedia（自動投稿 PoC: `scripts/x/`） |
| Vercel（リリース時） | https://project-7bhii.vercel.app |
| DB（記事） | Supabase PostgreSQL |
| DB（運用・バグ） | SQLite `data/platform.db` + エクスポート `data/platform-bugs.json` |
| 開発 | GCP VM + Cursor Remote SSH（`docs/GCP_VM_HANDOFF.md`） |

---

## 2. 鉄則

### 2-1. 3テーマ同時対応（必須）

UI・バグ修正・記事追加は **wired / notion / zapier すべて** に適用・確認する。  
詳細は `CLAUDE.md` を参照。

| 作業 | 確認URL |
|------|---------|
| Wired | https://oceanosfleet.com/Ziraku/wired |
| Notion | https://oceanosfleet.com/Ziraku/notion |
| Zapier | https://oceanosfleet.com/Ziraku/zapier |

### 2-2. 記事コンテンツ

**記事追加手順（2026-06-11 確立）:**

1. 本文 Markdown を `data/articles-md/{slug}.md` に作成（git 管理、Supabase `content` の正）
2. 以下の **3箇所にメタデータを追加**:
   - `lib/dummy-articles.ts`（フォールバック用）
   - `supabase/seeds/articles.sql`
   - `scripts/articles/upsert-articles.mjs` の `ARTICLES` 配列
3. Supabase に反映: `npm run articles:upsert`（slug で `on_conflict` merge）

> **anon key では INSERT 不可**。本番反映は必ず `npm run articles:upsert`（`.env.local` の `SUPABASE_SERVICE_ROLE_KEY` を使用）。  
> **TopContent 各テーマは修正不要**（記事データは props 経由のため）。

**Markdown レンダラー（`lib/render-markdown.ts`）対応記法:**

| 記法 | 出力 |
|------|------|
| コードブロック（` ``` `） | `<pre><code>` エスケープ済み |
| テーブル（`\|...\|`） | `<table>` ヘッダー `<th>` / セパレーター行除去 |
| 見出し（`#` / `##` / `###`） | `<h1>` / `<h2>` / `<h3>` |
| 太字（`**`） | `<strong>` |
| インラインコード（`` ` ``） | `<code class="article-detail__inline-code">` |
| リスト（`-` / `1.`） | `<li>` → `<ul>` |
| 画像（`![alt](url)`） | `<img class="article-detail__img" loading="lazy">` |
| リンク（`[text](url)`） | `<a target="_blank" rel="noopener noreferrer">` |

未対応: 斜体・引用（`>`）・水平線・ネストリスト

### 2-3. モバイル（Notion 中心）

- 共通モバイル CSS: `app/mobile-shared.css`（Notion layout で読み込み）
- 記事リスト（1024px以下）: **左サムネ 96px + 右テキスト** の Flexbox リスト
- カテゴリタブ: 見出し下の横スクロール行（縦書き崩れ禁止）

### 2-4. 実装後の接続確認（完了の定義）

**実装・修正・デプロイのあと、本番が繋がるか確認してから完了報告する。**

```
npm run build
npm run dev:vm-restart          # VM 変更時は必須
npm run verify:sites            # exit 0 必須（oceanosfleet.com）
git commit & push origin main   # ユーザー依頼時またはリリース時
```

| やってはいけないこと | 理由 |
|---------------------|------|
| build 成功だけで完了報告 | 本番は古いビルドのままのことがある |
| Tunnel 直 URL だけ 200 で完了報告 | oceanosfleet nginx が古い URL のまま 530 になりうる |
| curl 未実行で「繋がっています」 | 過去に誤報が発生済み |

oceanosfleet が 530 → `data/ziraku-backend-url.txt` を oceanosfleet nginx に反映（`scripts/oceanosfleet/update-ziraku-proxy.sh`）。

手順: `.cursor/rules/site-verification.mdc` / `.cursor/rules/vercel-deploy.mdc`

### 開発環境（VM が主・Vercel はリリース時のみ）

| 用途 | 場所 |
|------|------|
| 日常開発・3テーマ確認 | https://oceanosfleet.com/Ziraku/... |
| AI開発コンソール | https://oceanosfleet.com/Ziraku/admin/dev |
| Tunnel URL（直接） | `npm run dev:vm-url` |
| リリース | `git push` → Vercel（開発中は使わない） |

VM 再起動: `npm run dev:vm-restart`

### 2-5. バグ・インシデント

- **登録先**: SQLite `data/platform.db` の `bugs` テーブル
- **参照**: 管理画面 **運用**タブ `/admin/operations`、または `data/platform-bugs.json`
- **登録手順**: `.cursor/rules/bug-registration.mdc`

### 2-6. デザイン実装ルール（ドラフトがあるとき・テイスト変更時の共通鉄則）

> 2026-06-11 の ziraku 寄せ込みで繰り返し手戻りになった内容の一般化（台帳 #14〜#18）。
> 別テイストのサイトを作るときも、このプロセスを**指示なしで**踏むこと。

1. **ドラフト原画が正。** `docs/assets/` のデザイン画像（例: `サイトイメージ1.png` = 親しみ路線、`サイトイメージ2.png` = プロ路線）を最初に Read で見てから実装する。記憶や雰囲気で作らない。
2. **イラスト・ロゴ等の複雑なアセットは自作しない。** 原画から PIL で該当領域を切り出して `public/` に置き実画像として使う（例: `ziraku-hero.png`, `ziraku-member.png`）。SVG 自作はアイコンレベルの単純図形のみ。
3. **色はドラフトからピクセルサンプリングして決める**（`im.getpixel()`）。「緑っぽい」で `#10b981` を置かない（ziraku の緑は `#0a9180` 系ティール）。
4. **デザイントーンの確認項目**: 角丸の大きさ（親しみ路線 = `--radius: 16px` 以上）/ ボタン形状（ピル `border-radius: 999px`）/ アイコンの形（丸・角丸スクエア）/ バッジ（白丸バースト）。要素単位でドラフトと見比べる。
5. **スクショ比較ループ必須。** `bash scripts/vm/shot.sh <URL> <out.png> <幅> [full]`（未構築なら自動で `setup-screenshot-env.sh` が走る。playwright + 日本語/絵文字フォント、sudo 不要）で PC 1280px / モバイル 390px を撮り、原画と並べて確認してから完了報告。
6. **ページを作ったらリンクから先に潰す。** トップだけ作って記事リンクを他テーマ URL や `#` のまま残さない。バックページ（一覧・詳細・カテゴリ・サービス・会社情報・法務）を骨格でも先に用意する。
7. **本番想定テーマの記事詳細は SSR + generateMetadata + OGP を最初から**（クライアントフェッチのみは SEO 非対応。共通コンポーネントにはオプショナル initial props で他テーマ無影響に）。
8. **ロゴは1コンポーネントに集約**（例: `ZirakuLogoMark`、青/白mono variant）。ヘッダー・フッター・**ファビコン**（`app/icon.png` + `favicon.ico`）まで同一マークで揃える。ファビコン差し替えを忘れない。

---

## 3. コンポーネント対応表

| ファイル | テーマ |
|---------|--------|
| `components/pages/TopPage.tsx` | 共通（テーマ分岐） |
| `components/pages/ThemeArticlePage.tsx` / `ArticlePage.tsx` | 共通 |
| `components/top/NotionTopContent.tsx` | notion |
| `components/top/WiredTopContent.tsx` | wired |
| `components/top/ZapierTopContent.tsx` | zapier |
| `components/top/ZirakuTopContent.tsx` | ziraku（本番想定） |
| `components/ziraku/ZirakuSiteHeader.tsx` | ziraku |
| `app/(notion)/notion.css` + `app/mobile-shared.css` | notion |
| `app/(wired)/wired.css` | wired |
| `app/(zapier)/zapier.css` | zapier |
| `app/(ziraku)/ziraku.css` + `app/mobile-shared.css` | ziraku |

---

## 3-1. X 自動投稿（@AIbusinessmedia）

拡散戦略（ROADMAP §拡散）の X チャネル向け PoC。詳細は [`docs/X_AUTOMATION.md`](../docs/X_AUTOMATION.md)。

| 項目 | 内容 |
|------|------|
| 実行 | VM 上で cron → `npm run x:post -- <slot>` |
| スロット | 1日5回（7:30 / 12:00 / 18:00 / 22:00 / 23:00 JST） |
| 文面生成 | `@cursor/sdk` の `Agent.prompt`（`CURSOR_API_KEY`） |
| 投稿 | `twitter-api-v2`（`X_API_*` トークン4つ） |
| 履歴 | `data/x-post-history.json`（48h 重複防止） |
| ドライラン | `npm run x:post:dry -- lunch` |

環境変数は `.env` / `.env.example` を参照。**ログインパスワードは使わない。**

---

## 4. データの置き場

| 種別 | 置き場 |
|------|--------|
| 仕様・デザイン・変更履歴要約 | `doc/AGENT_SPEC.md` §6 |
| バグ・再発・インシデント | SQLite `data/platform.db` + **運用**タブ + [`docs/過去トラブルまとめ.md`](../docs/過去トラブルまとめ.md) |
| 記事（本番） | Supabase `articles` |
| 引き継ぎ全文 | `CURSOR_HANDOFF.md` |
| フェーズ計画 | `ROADMAP.md` |

---

## 5. バグ台帳（全エージェント必須）

直したトラブルは **必ず** SQLite に登録する。詳細手順は `.cursor/rules/bug-registration.mdc`。

- 修正したのに台帳未登録 → **作業未完了**（`git push` 前に登録まで終える）
- 過去セッションで直したが未登録のもの → 会話履歴・コミットログから漏れを埋める
- 一覧: `/admin/operations`（運用タブ） / `data/platform-bugs.json`

### 過去バグの参照方法

```bash
# SQLite 直接
sqlite3 data/platform.db "SELECT id, title, status, affected_themes FROM bugs ORDER BY id DESC LIMIT 20;"

# シード再生成 + JSON エクスポート
python3 platform_meta/seed.py

# 新規バグ登録
python3 platform_meta/seed.py --register-bug \
  --title "症状の一行要約" \
  --symptom "ユーザーが見た現象" \
  --root-cause "技術的原因" \
  --fix "修正内容とファイル" \
  --themes notion \
  --commit d1e4bc8
```

---

## 6. 変更履歴（要約）

エージェントが仕様・重要修正をしたら **この §6** と `platform_meta/seed.py` の `CHANGELOG_ENTRIES` を両方更新する。

| 日付 | 区分 | 内容 |
|------|------|------|
| 2026-06-11 | content | 新記事8件追加（Fable 5特集）: claude-fable-5-overview / claude-fable-5-subagent-strategy / fable-5-self-correction-loops / anthropic-31-ai-skills / claude-fable-5-notebooklm / claude-autopilot-14-steps / kubell-ceo-fable-5-prompt / ai-agent-company-management。X 話題ポスト出典明記、英語2本翻訳 |
| 2026-06-11 | feat | `lib/render-markdown.ts` に画像（`![alt](url)` → `<img class="article-detail__img" loading="lazy">`）とリンク（`[text](url)` → `<a target="_blank" rel="noopener noreferrer">`）対応追加。CSS（`app/article-shared.css` / `app/(notion)/notion.css`）に `.article-detail__img` 追加 |
| 2026-06-11 | feat | 記事追加ワークフロー確立 — 本文 Markdown を `data/articles-md/{slug}.md` で管理、`scripts/articles/upsert-articles.mjs` + `npm run articles:upsert` で Supabase に upsert |
| 2026-06-11 | feat | コーポレート刷新（会社情報/会員エリア・絵文字全廃→`ZirakuIcons`）+ signup顧客アンケート（profiles 4カラム）+ `/ziraku/settings` + 記事3本 |
| 2026-06-11 | feat | 会員限定記事3本+閲覧ゲート（RLS=ログイン済み可・🔒ゲート・`!video[]()` 記法）+ ドラフトに無い統計バンド削除（台帳 #25） |
| 2026-06-11 | feat | ziraku 会員限定エリア（/ziraku/members: チェックリスト診断+プロンプト集）+ ログイン後CTA切替 |
| 2026-06-11 | feat | ziraku 会員ログイン/登録実装（Supabase Auth）— /ziraku/login・/signup、ヘッダー状態切替、signup 500 の DB トリガー修正（台帳 #21） |
| 2026-06-11 | feat | ziraku トップ配置をドラフト準拠に — カテゴリをリンクカード化し記事下へ移動（ランキング上段復帰）、統計バンド縮小（台帳 #20） |
| 2026-06-11 | feat | ziraku 会員バナー刷新（全幅・人物イラスト・横並び特典・緑ピル）+ CTAピル化 + 角丸拡大（--radius 16px）で親しみ路線統一 |
| 2026-06-11 | feat | ziraku ロゴ統一 + ファビコン刷新 — `ZirakuLogoMark` 新設（ヘッダー青/フッター白）、`app/icon.png`・`favicon.ico` を青角丸+白マークに（全テーマ共通） |
| 2026-06-11 | feat | ziraku ヒーローをドラフト原画イラストに差し替え — `サイトイメージ1.png` から切り出した `public/ziraku-hero.png` を使用、HTML浮遊カード削除 |
| 2026-06-11 | feat | ziraku トップをドラフト『親しみ路線』に寄せ込み — ヒーロー刷新（黄色マーカーH1＋自作フラットSVGイラスト＋浮遊カード）、統計を薄青バンドへ分離、バリューカード白化、PC/モバイル調整（`ziraku.css`/`ZirakuTopContent.tsx` のみ） |
| 2026-06-11 | feat | ziraku バックボーン実装 — 記事一覧/詳細・カテゴリ・サービス・会社情報・セミナー・プライバシー7ページ追加、SiteTheme に ziraku 追加、デッドリンク解消（4917c60） |
| 2026-06-10 | fix | Vercelビルド失敗 — `ThemeSiteHeader.tsx` 未コミットを追加 |
| 2026-06-10 | fix | Zapier記事カード画像のみ — `ZapierArticleCard` + モバイルリスト |
| 2026-06-10 | fix | Wiredモバイルカテゴリタブ縦書き — `wired.css` grid 化 |
| 2026-06-10 | fix | Notion記事リスト重なり — `.notion-root` スコープ Flexbox |
| 2026-06-10 | fix | メルマガバナー縦書き崩れ — 3テーマ共通 CSS |
| 2026-06-10 | fix | モバイル記事リストでタイトルが消える問題 — Grid→Flexbox（`mobile-shared.css`） |
| 2026-06-10 | fix | カテゴリタブの縦書き崩れ — section-header を grid 化 |
| 2026-06-09 | feat | Notion モック準拠 UI + モバイルレスポンシブ |
| 2026-06-10 | infra | gcp-vm→dify-vm SSH + `dify:update-proxy`（nginx 自動更新） |
| 2026-06-10 | fix | 開発コンソールパスワード UI 削除（VM では認証なし） |
| 2026-06-10 | rule | 実装後は `verify:sites` 必須（Tunnel 直のみでは完了報告不可） |
| 2026-06-10 | fix | 管理画面 Link の二重 /Ziraku 修正 |
| 2026-06-10 | infra | oceanosfleet.com/Ziraku 公開（nginx + basePath） |
| 2026-06-09 | infra | GCP VM + Cursor Remote SSH 引き継ぎ |

---

## 7. 関連ドキュメント

| ファイル | 用途 |
|---------|------|
| `CURSOR_HANDOFF.md` | 全体引き継ぎ |
| `CLAUDE.md` | 3テーマ鉄則 |
| `docs/GCP_VM_HANDOFF.md` | VM・SSH |
| `docs/OCEANOSFLEET_NGINX.md` | oceanosfleet 公開・nginx |
| `docs/concept.md` | メディアコンセプト |
| `docs/X_AUTOMATION.md` | X 自動投稿のセットアップ・仕様 |
| `.cursor/rules/bug-registration.mdc` | バグ登録ルール |
