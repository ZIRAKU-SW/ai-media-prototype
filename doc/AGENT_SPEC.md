# AIビジネスメディア — エージェント向け仕様

> Cursor Agent / Claude Code が作業を始める前に読む統一仕様。  
> ルールの要約は `.cursor/rules/agent-spec.mdc` にもある。

最終更新: 2026-06-10

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 目的 | 3デザインパターン（wired / notion / zapier）の比較・本番選定 |
| 本番 | https://project-7bhii.vercel.app |
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
| Wired | `/wired` |
| Notion | `/notion` |
| Zapier | `/zapier` |

### 2-2. 記事コンテンツ

- 追加: `lib/dummy-articles.ts` + `supabase/seeds/articles.sql` + 各テーマ TopContent
- 本文: Markdown → `lib/render-markdown.ts` で HTML 変換
- 本番 INSERT は `SUPABASE_SERVICE_ROLE_KEY` 必須（anon では INSERT 不可）

### 2-3. モバイル（Notion 中心）

- 共通モバイル CSS: `app/mobile-shared.css`（Notion layout で読み込み）
- 記事リスト（1024px以下）: **左サムネ 96px + 右テキスト** の Flexbox リスト
- カテゴリタブ: 見出し下の横スクロール行（縦書き崩れ禁止）

### 2-4. デプロイ完了の定義

`npm run build` だけでは完了としない。

```
npm run build
git commit & push origin main   # ユーザー依頼時または作業完了時
本番URLで3テーマ確認
```

手順: `.cursor/rules/vercel-deploy.mdc`

### 2-5. バグ・インシデント

- **登録先**: SQLite `data/platform.db` の `bugs` テーブル
- **参照**: 管理画面 **運用**タブ `/admin/operations`、または `data/platform-bugs.json`
- **登録手順**: `.cursor/rules/bug-registration.mdc`

---

## 3. コンポーネント対応表

| ファイル | テーマ |
|---------|--------|
| `components/pages/TopPage.tsx` | 共通（テーマ分岐） |
| `components/pages/ThemeArticlePage.tsx` / `ArticlePage.tsx` | 共通 |
| `components/top/NotionTopContent.tsx` | notion |
| `components/top/WiredTopContent.tsx` | wired |
| `components/top/ZapierTopContent.tsx` | zapier |
| `app/(notion)/notion.css` + `app/mobile-shared.css` | notion |
| `app/(wired)/wired.css` | wired |
| `app/(zapier)/zapier.css` | zapier |

---

## 4. データの置き場

| 種別 | 置き場 |
|------|--------|
| 仕様・デザイン・変更履歴要約 | `doc/AGENT_SPEC.md` §6 |
| バグ・再発・インシデント | SQLite `data/platform.db` + **運用**タブ |
| 記事（本番） | Supabase `articles` |
| 引き継ぎ全文 | `CURSOR_HANDOFF.md` |
| フェーズ計画 | `ROADMAP.md` |

---

## 5. 過去バグの参照方法

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
| 2026-06-10 | fix | モバイル記事リストでタイトルが消える問題 — Grid→Flexbox（`mobile-shared.css`） |
| 2026-06-10 | fix | カテゴリタブの縦書き崩れ — section-header を grid 化 |
| 2026-06-09 | feat | Notion モック準拠 UI + モバイルレスポンシブ |
| 2026-06-09 | infra | GCP VM + Cursor Remote SSH 引き継ぎ |

---

## 7. 関連ドキュメント

| ファイル | 用途 |
|---------|------|
| `CURSOR_HANDOFF.md` | 全体引き継ぎ |
| `CLAUDE.md` | 3テーマ鉄則 |
| `docs/GCP_VM_HANDOFF.md` | VM・SSH |
| `docs/concept.md` | メディアコンセプト |
| `.cursor/rules/bug-registration.mdc` | バグ登録ルール |
