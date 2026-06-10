# 🛠️ 開発ルール & デプロイガイド

> このドキュメントはプロジェクトの開発フロー・デプロイ手順・運用ルールをまとめたものです。  
> **変更があれば必ずここを更新してください。**

---

## 📋 目次

1. [技術スタック](#-技術スタック)
2. [開発環境セットアップ](#-開発環境セットアップ)
3. [デプロイルール（必須）](#-デプロイルール必須)
4. [ブランチ戦略](#-ブランチ戦略)
5. [Supabaseルール](#-supabaseルール)
6. [シークレット管理](#-シークレット管理)
7. [トラブルシューティング](#-トラブルシューティング)

---

## 🧰 技術スタック

| レイヤー | 技術 | 備考 |
|---------|------|------|
| フロントエンド | Next.js 16 (App Router) + TypeScript | `app/` ディレクトリ構成 |
| スタイリング | Tailwind CSS + CSS Variables | 3テーマ（WIRED/Notion/Zapier） |
| バックエンド/DB | Supabase (PostgreSQL + Auth + Storage) | `lib/supabase.ts` 参照 |
| デプロイ | Vercel | GitHub連携・自動デプロイ |
| パッケージ管理 | npm | Node.js v20以上推奨 |

---

## 🚀 開発環境セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/ZIRAKU-SW/ai-media-prototype.git
cd ai-media-prototype

# 2. パッケージインストール
npm install

# 3. 環境変数を設定（.env.example を参考に）
cp .env.example .env.local
# .env.local に実際の値を記入する

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000
```

### 環境変数（.env.local）

```env
NEXT_PUBLIC_SUPABASE_URL=https://wqlelowutbxplrzforcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # フロントエンド用（公開可）
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...            # サーバーサイド専用（絶対公開禁止）
```

> ⚠️ `.env.local` は `.gitignore` に含まれています。絶対にコミットしないでください。

---

## 🚦 デプロイルール（必須）

> **プッシュ・デプロイのたびに、必ず以下の手順を踏むこと。**  
> 「デプロイした＝完了」ではなく「動作確認まで完了」が定義です。

### デプロイ手順

```
1. git push origin main
   ↓
2. Vercelのデプロイ状態を確認
   npx vercel ls --token <TOKEN>
   → 最新が "● Ready" になるまで待つ
   ↓
3. ブラウザでサイトを確認（下記チェックリスト）
   ↓
4. 問題があれば修正 → 1に戻る（ループ）
   ↓
5. 全ページOKになって初めて「完了」
```

### ✅ デプロイ後チェックリスト

| チェック項目 | URL | 確認内容 |
|------------|-----|---------|
| トップページ | `oceanosfleet.com/Ziraku/` | テーマ選択画面が表示されるか |
| WIREDテーマ | `/Ziraku/wired` | 記事一覧がSupabaseから取得されているか |
| Notionテーマ | `/Ziraku/notion` | 同上 |
| Zapierテーマ | `/zapier` | 同上 |
| 管理画面 | `/admin` | 記事一覧が表示されているか |

### Vercelデプロイコマンド（手動）

```bash
# 本番デプロイ
npx vercel deploy --token <TOKEN> --prod

# デプロイ状態確認
npx vercel ls --token <TOKEN>
```

### ⚠️ 過去に発生したトラブル（教訓）

| 症状 | 原因 | 解決方法 |
|-----|------|---------|
| `404: NOT_FOUND` | VercelのフレームワークPresetが`null`（静的HTML扱い） | Vercel APIでフレームワークを`nextjs`に変更して再デプロイ |
| `git push` が HTTP 400 エラー | macOSのHTTPバッファが小さい | `git config http.postBuffer 524288000` を設定してから再push |

---

## 🌿 ブランチ戦略

```
main ← 本番（直接pushはNG、PR経由推奨）
develop ← 開発用ブランチ（作業はここから）
feature/* ← 機能ごとのブランチ
```

> 現在は小規模開発のため `main` への直接pushも可。チームが増えたらPRフローに移行する。

---

## 🗄️ Supabaseルール

### スキーマ変更時

1. `supabase/schema.sql` を更新する
2. `supabase/migrations/` に日付付きのマイグレーションファイルを追加する
   ```
   supabase/migrations/YYYYMMDDHHMMSS_変更内容.sql
   ```
3. Supabaseダッシュボード（SQL Editor）で実行する
4. GitHubにコミット・プッシュする

### シードデータ

```bash
# 記事のモックデータ
supabase/seeds/articles.sql

# Supabaseダッシュボードで直接実行するか、
# Management APIを使って投入する
```

### テーブル一覧

| テーブル | 用途 |
|---------|------|
| `articles` | 記事本文・メタ情報 |
| `categories` | カテゴリ（6件初期登録済み） |
| `tags` | タグ |
| `article_tags` | 記事-タグ中間テーブル |
| `profiles` | ユーザープロフィール |
| `article_views` | 閲覧数カウント |
| `bookmarks` | ブックマーク |
| `newsletter_subscribers` | メルマガ登録者 |
| `inquiries` | お問い合わせ |

---

## 🔑 シークレット管理

| キー | 保存場所 | GitHub | 用途 |
|-----|---------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel環境変数 | `.env.example`に項目のみ記載 | Supabase接続 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel環境変数 | `.env.example`に項目のみ記載 | フロントエンド用（公開可） |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel環境変数 | ❌ 絶対コミット禁止 | サーバーサイド管理者操作 |
| Vercelトークン | `.env`（gitignore済み） | ❌ 絶対コミット禁止 | CLIデプロイ用 |

### ⚠️ 注意事項

- `sb_secret_` で始まるキーは **サーバーサイド専用** です。フロントエンドのコードに書かないでください
- `.env`・`.env.local` は gitignore 済みですが、万一コミットした場合はキーを即座にローテートしてください
- `NEXT_PUBLIC_` プレフィックスのついた変数はブラウザから見えます（意図的）

---

## 🐛 トラブルシューティング

### ビルドエラー時

```bash
# ローカルでビルドを確認してからpush
npm run build

# TypeScriptエラーの確認
npx tsc --noEmit
```

### Supabase接続エラー時

1. `.env.local` のURLとキーが正しいか確認
2. Vercel環境変数が設定されているか確認（`npx vercel env ls`）
3. SupabaseダッシュボードでRLSポリシーを確認

### 404エラー時（Vercel）

```bash
# フレームワーク設定を確認・修正
curl -X PATCH https://api.vercel.com/v9/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"framework":"nextjs"}'

# 再デプロイ
npx vercel deploy --token <TOKEN> --prod
```

---

## 📁 ディレクトリ構成

```
ai-media-prototype/
├── app/                    # Next.js App Router
│   ├── (wired)/           # WIREDテーマ
│   ├── (notion)/          # Notionテーマ
│   ├── (zapier)/          # Zapierテーマ
│   ├── admin/             # 記事管理画面
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # テーマ選択トップ
├── components/            # 共通コンポーネント
│   ├── pages/TopPage.tsx  # 3テーマ共通トップページ
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ArticleCard.tsx
│   └── NewsletterForm.tsx
├── lib/
│   └── supabase.ts        # Supabaseクライアント + 型定義 + API関数
├── prototypes/            # 初期HTMLプロトタイプ（参考用）
├── supabase/
│   ├── schema.sql         # DBスキーマ定義
│   ├── migrations/        # マイグレーション履歴
│   ├── seeds/             # モックデータ
│   └── config.toml        # Supabase CLI設定
├── docs/                  # 企画資料・画像
├── public/
├── ROADMAP.md             # ロードマップ・タスク管理
├── CONTRIBUTING.md        # このファイル（開発ルール）
├── .env.example           # 環境変数テンプレート
└── .gitignore
```

---

<div align="center">

**迷ったらまずこのドキュメントを確認。それでも解決しなければ ROADMAP.md を見る。**

</div>
