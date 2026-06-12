# 引き継ぎ: 記事公開 → 自動X投稿（RSS + Zapier）

> 次の実装エージェント向け。このファイルだけで着手できるよう、調査済みの事実を全部書く。
> 作成: 2026-06-12

## 1. ゴール（ユーザーの要望）

サイトで**記事が公開されると、自動で X（@AIbusinessmedia）に投稿される**仕組みを作る。
手段は **Zapier**。ユーザーは Zapier アカウント作成済み。X Developer API キーは**不要**
（Zapier の「RSS by Zapier」トリガー →「Twitter/X」アクションを使う。X アカウントは Zapier に OAuth 連携するだけ）。

```
記事公開（Supabase articles.is_published=true）
  → サイトが RSS フィードを配信（/Ziraku/feed.xml）
  → Zapier「RSS by Zapier」が新着を検知（5〜15分ポーリング）
  → Zapier「Twitter（X）」アクションで自動投稿
```

**フィード形式は RSS 2.0**（Atom ではなく。Zapier 互換性・枯れ具合で RSS 2.0 を採用と決定済み）。

## 2. このエージェントが実装する範囲

**RSS 2.0 フィードを配信する API ルートを新規実装する**（ここまでがコード作業）。
Zapier 側の Zap 設定はユーザーが行う（手順書を §5 として渡す）。

## 3. 実装の具体（調査済みの事実）

### 3-1. ルートの場所と公開URL

- ファイル: `app/feed.xml/route.ts`（App Router の Route Handler）
- `next.config.ts` に `basePath`（`NEXT_PUBLIC_BASE_PATH=/Ziraku`）があるため、
  **公開URLは `https://oceanosfleet.com/Ziraku/feed.xml`** になる。
- 既存 Route Handler の書き方は `app/api/admin/articles/route.ts` を参照（`NextResponse` 使用）。

### 3-2. 記事データの取得

`lib/supabase.ts` の `getArticles({ limit })` を使う（anon キーで公開記事を取得できる）。
または既存 admin ルート同様に直接クエリでも可。**公開記事のみ**を対象にすること。

`Article` 型（`lib/supabase.ts`）の利用フィールド:
```
title, slug, excerpt, thumbnail_url, published_at, created_at,
is_published (true のみ), is_members_only, categories: { name, slug }
```

要件:
- `is_published = true` のみ
- `is_members_only = true` の会員限定記事は**フィードに含めない**（公開導線なので）
- `published_at`（無ければ `created_at`）の降順、**最新20件**程度
- 記事URL: `https://oceanosfleet.com/Ziraku/ziraku/articles/{slug}`
  （`ziraku` テーマが本番想定。URL のベースは環境変数 `X_POST_SITE_URL`
  = `https://oceanosfleet.com/Ziraku/ziraku` が `.env` にあるのでそれを使うか、
  ハードコードでも可だが定数化すること）

### 3-3. RSS 2.0 の最小要件（Zapier が拾うフィールド）

各 `<item>` に最低限これを入れる（Zapier の RSS トリガーが title/link/description/pubDate/guid を読む）:
```xml
<item>
  <title><![CDATA[記事タイトル]]></title>
  <link>https://oceanosfleet.com/Ziraku/ziraku/articles/{slug}</link>
  <description><![CDATA[excerpt]]></description>
  <pubDate>RFC822形式（例: Thu, 12 Jun 2026 09:00:00 GMT）</pubDate>
  <guid isPermaLink="true">記事URL（slugで一意・重複投稿防止のキーになる）</guid>
  <category>カテゴリ名</category>
  <enclosure url="thumbnail_url" type="image/jpeg" />  <!-- 任意・画像 -->
</item>
```

- `<guid>` は**記事URL（slug 由来）で一意**にすること。Zapier はこれで「新着か既出か」を判定するので、
  公開済み記事の URL が変わらない限り重複投稿しない。
- `pubDate` は **RFC822**（`new Date(published_at).toUTCString()` でOK）。
- 日本語・記号の混入に備え title/description は **CDATA** で囲む。
- チャンネル要素: `<title>AIビジネスメディア</title>`、
  `<link>https://oceanosfleet.com/Ziraku/ziraku</link>`、`<description>…</description>`、
  `<language>ja</language>`、`<atom:link rel="self" href="…/Ziraku/feed.xml" />`。

### 3-4. レスポンスヘッダ・キャッシュ

```ts
return new Response(xml, {
  headers: {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
  },
})
```
- `export const revalidate = 300`（ISR 5分）または上記ヘッダで十分。
- XML特殊文字（`& < >`）のエスケープに注意（CDATA 内でも `]]>` が本文に出ないようガード）。

## 4. 完了の定義（このプロジェクトの鉄則・必須）

1. `./node_modules/.bin/tsc --noEmit` が通る（**`scripts/` 配下に既存の型エラーが残っていないかも確認**。
   過去、無関係な `scripts/x/*.ts` の型エラーで `next build` 全体が落ちた。AGENT_SPEC §2-4 の再発パターン参照）
2. `npm run build` 成功
3. `npm run dev:vm-restart`
4. **本番で疎通確認**（curl 必須・このプロジェクトの絶対ルール）:
   ```
   curl -s https://oceanosfleet.com/Ziraku/feed.xml | head -40
   ```
   - `<rss version="2.0">` で始まり、`<item>` が複数、各 item に link/guid/pubDate があること
   - Content-Type が `application/rss+xml` であること（`curl -sI` で確認）
   - 会員限定記事（slug 例 `fable-5-hyperagent-autonomous`）が**含まれていない**こと
5. `bash scripts/vm/verify-oceanosfleet.sh` が exit 0（既存ページの回帰なし）
6. **バグ/変更を台帳に記録**: `doc/AGENT_SPEC.md` §6 と `platform_meta/seed.py` の
   `CHANGELOG_ENTRIES` に feat 行を追記 → `python3 platform_meta/seed.py` で再エクスポート
7. `git commit`（**push はユーザー依頼時のみ**。今回はリリース運用上 push までやってよい＝
   ユーザーが「公開して集客したい」案件なので、commit 後 `git push origin main` まで実施）

## 5. ユーザーに渡す Zapier 設定手順（コード完了後にこれを案内する）

1. Zapier で「Create Zap」
2. **Trigger: 「RSS by Zapier」→「New Item in Feed」**
   - Feed URL: `https://oceanosfleet.com/Ziraku/feed.xml`
   - 「Test trigger」で記事が拾えることを確認
3. **Action: 「Twitter」（X）→「Create Tweet」**
   - Twitter アカウントを接続（@AIbusinessmedia で OAuth 認証。API キー不要）
   - ツイート本文を組む。推奨テンプレ:
     ```
     {{Title}}

     {{Description}}

     ▼続きを読む
     {{Link}}

     #AI #AI活用 #DX #中小企業
     ```
   - X の文字数（半角280/全角140相当）を超えないよう Description は長すぎ注意。
     超える場合は Zapier の Formatter で truncate するか、本文を `{{Title}} {{Link}}` だけに。
4. 「Publish Zap」。RSS トリガーは無料プランだと**15分間隔**ポーリング（有料で短縮可）。
5. 初回は過去記事が一気に投稿されるのを避けるため、Zap 公開直後の挙動に注意
   （RSS by Zapier は「Zap 作成後に追加された新item」から拾うのが基本だが、
   初回テストで数件投稿されることがある）。

## 6. 注意・ハマりどころ

- **basePath**: ルートは `app/feed.xml/route.ts` だが公開URLは `/Ziraku/feed.xml`。
  フィード内の各 URL も `/Ziraku/ziraku/...` のフルURLにすること（相対パス禁止）。
- **会員限定記事を漏らさない**: `is_members_only` を必ず除外。X に流すと未ログインで読めず体験が悪い。
- **重複投稿**: guid を slug 由来の不変URLにすれば Zapier 側で防げる。guid をランダムにしない。
- **ビルド全体が落ちる再発パターン**（台帳 #19・#29）: 自分の変更と無関係でも
  `scripts/` の型エラーでビルドが落ちる。落ちたら `tsc --noEmit` で全体確認。
- 文面生成を Cursor SDK で凝りたい場合は別途（今回は Zapier の素直なテンプレ投稿で十分）。

## 7. 参考ファイル

| 用途 | パス |
|------|------|
| 記事取得・型 | `lib/supabase.ts`（`getArticles`, `Article`） |
| Route Handler 例 | `app/api/admin/articles/route.ts` |
| 公開URLベース | `.env` の `X_POST_SITE_URL` |
| 完了の定義・鉄則 | `doc/AGENT_SPEC.md` §2-4 |
| 既存のX投稿実装（参考・今回は使わない） | `scripts/x/`（API方式 `x:post`、ブラウザ方式） |
