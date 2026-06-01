# CLAUDE.md — このプロジェクトでの作業ルール

## デザインパターンは必ず3つ同時に対応する（確認・追加・修正すべて）

このプロジェクトには **wired / notion / zapier** の3デザインパターンがある。
UIのバグ修正・見た目の変更・新機能追加を行ったら、**必ず3パターン全てのURLで動作確認すること**。

| パターン | トップ | 記事詳細（例） |
|---------|--------|--------------|
| Wired   | `/wired` | `/wired/articles/chatgpt-claude-gemini-comparison` |
| Notion  | `/notion` | `/notion/articles/chatgpt-claude-gemini-comparison` |
| Zapier  | `/zapier` | `/zapier/articles/chatgpt-claude-gemini-comparison` |

### なぜか

- ページコンポーネント（`ArticlePage.tsx`, `TopPage.tsx` 等）は3パターンで共通。
- テーマ固有のスタイル分岐（`theme === 'notion'` など）があるため、1パターンで直っても別パターンで崩れることがある。
- ユーザーはNotionパターンで確認→他パターンで同じバグが残るケースを経験済み。

### 鉄則（毎回・指示なしで実行）

- 記事追加 → TopPage.tsx の DUMMY + zapier/page.tsx の DUMMY + seeds/articles.sql の3箇所全部
- バグ修正 → 共通コンポーネントでも必ず3パターン全てで動作確認
- UI変更 → wired/notion/zapier それぞれのCSSとテーマ分岐を確認
- **「1パターンだけ直して終わり」は絶対にしない**

### チェックの手順

1. 変更したコンポーネントが何のテーマ分岐を持つか確認する
2. ローカル or Vercelプレビューで3パターン全ての該当ページを開く
3. 特にテーマ別カラー・角丸・フォントの見た目差異が意図通りか確認する

## コンポーネント対応表

| ファイル | 使われるパターン |
|---------|---------------|
| `components/pages/ArticlePage.tsx` | wired / notion / zapier 共通 |
| `components/pages/TopPage.tsx` | wired / notion / zapier 共通 |
| `components/ArticleCard.tsx` | wired / notion / zapier 共通 |
| `components/Header.tsx` | wired / notion / zapier 共通 |
| `components/Footer.tsx` | wired / notion / zapier 共通 |
| `app/(wired)/wired/...` | wired のみ |
| `app/(notion)/notion/...` | notion のみ |
| `app/(zapier)/zapier/...` | zapier のみ |
