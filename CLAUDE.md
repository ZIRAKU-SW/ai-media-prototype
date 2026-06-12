# CLAUDE.md — このプロジェクトでの作業ルール

## 実装前に SQLite 過去トラブル台帳で「関連する過去事例」を必ず読む

過去のバグ・トラブルは SQLite `data/platform.db` に集約されている（29件以上）。
**コードを書く・直す前に、作業内容のキーワードで台帳を検索し、該当する過去事例の対策を読んでから着手する。**

```bash
npm run platform:bugs:search -- <キーワード>   # 例: build / mobile / nginx / X browser
npm run platform:bugs                          # 直近15件
```

検索キーワードの対応表は `.cursor/rules/past-troubles.mdc` 参照。
バグを直したら `python3 platform_meta/seed.py --register-bug ...` で台帳登録（`.cursor/rules/bug-registration.mdc`）。

## X ログイン失敗は1回でやめて報告する（連続試行＝アカウント凍結）

ブラウザ自動投稿（`x:browser` 系）の**ログインに失敗したら、1回で停止してユーザーに報告し、指示を仰ぐ**。
連続試行は X のレート制限（一時凍結）を招く（バグ台帳 #28 の教訓）。
スクリプトは失敗時に `data/x-login-lock.json` でロックし再実行を拒否する。**勝手に解除して再試行しない。**
詳細は `doc/AGENT_SPEC.md` §3-1。

## デザイン実装（ドラフトがあるとき）は AGENT_SPEC §2-6 のルールを必ず読む

`doc/AGENT_SPEC.md` §2-6「デザイン実装ルール」に、ドラフト準拠実装の鉄則がある
（原画アセット切り出し・色のピクセルサンプリング・スクショ比較ループ
`bash scripts/vm/shot.sh`・角丸/ピル等トーン確認・ファビコンまでロゴ統一）。
**過去にこれを守らず手戻りが多発した（バグ台帳 #14〜#18）。指示がなくても従うこと。**

## デザインパターンは必ず3つ同時に対応する（確認・追加・修正すべて）

このプロジェクトには **wired / notion / zapier** の3デザインパターンがある。
UIのバグ修正・見た目の変更・新機能追加を行ったら、**必ず3パターン全てのURLで動作確認すること**。

| パターン | トップ | 記事詳細（例） |
|---------|--------|--------------|
| Wired   | `/Ziraku/wired` | `/Ziraku/wired/articles/chatgpt-claude-gemini-comparison` |
| Notion  | `/Ziraku/notion` | `/Ziraku/notion/articles/chatgpt-claude-gemini-comparison` |
| Zapier  | `/Ziraku/zapier` | `/Ziraku/zapier/articles/chatgpt-claude-gemini-comparison` |

本番確認 URL: `https://oceanosfleet.com` + 上記パス

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

## GCP VM・開発環境（日常はここ）

- 詳細: **`docs/GCP_VM_HANDOFF.md`**
- **開発・確認・AIコンソールはすべて VM**（Vercel 枠を消費しない）
- URL 確認: `npm run verify:sites` または `https://oceanosfleet.com/Ziraku/...`
- nginx 更新: `npm run dify:update-proxy`（gcp-vm → dify-vm SSH）
- Cursor Remote SSH → gcp-vm で編集・Agent 実行

## Vercel デプロイ（リリース時のみ）

**開発中は Vercel を使わない。**

**2026-06-11 から `vercel.json` で main の自動デプロイを無効化済み。**
`git push` はバックアップ専用になり、Vercel ビルドは発火しない（無料枠を消費しない）。
Vercel へリリースしたいときだけ: ①`vercel.json` の `deploymentEnabled.main` を `true` にして push、または ②Vercel ダッシュボードから手動 Deploy。

| 日常確認 | https://oceanosfleet.com/Ziraku/... |
| Tunnel（直接） | `npm run dev:vm-url` |
| Vercel（リリース時） | https://project-7bhii.vercel.app |

```
VMで開発 → npm run build → oceanosfleet.com/Ziraku で3テーマ確認 → リリース時のみ git push
```

- 日常の報告・確認は **oceanosfleet.com/Ziraku** を使う（curl 200 必須）
- `git push` はユーザー依頼またはリリース時のみ
