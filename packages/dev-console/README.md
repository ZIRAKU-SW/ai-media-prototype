# @oceanos/dev-console

Cursor SDK 開発コンソールの共有ライブラリ。**Sensor `/sensor/dev` と同一 UX**（⌘/Ctrl+Enter、画像 Ctrl+V、左右リサイズ、非同期ジョブ、502 リトライ、自動デプロイ）。

## 新規サイトへの接続（最短）

### 1. 依存追加

```json
{
  "dependencies": {
    "@oceanos/dev-console": "file:./packages/dev-console"
  }
}
```

`next.config.ts`:

```ts
transpilePackages: ["@oceanos/dev-console"],
```

**重要 — Tailwind（必須）:** コンポーネントは Tailwind ユーティリティ前提。ホスト側で dev-console 用 CSS を用意する:

```css
/* app/admin/dev/dev-console.css */
@import "tailwindcss";
@source "../../../packages/dev-console/src/**/*.{tsx,ts}";
@import "@oceanos/dev-console/styles.css";
```

```tsx
/* app/admin/dev/layout.tsx */
import "./dev-console.css";
```

`dev-console.css` 単体の `@import styles.css` だけではレイアウトが崩れる。

### 2. 環境変数（`.env`）

```env
CURSOR_API_KEY=...
DEV_CONSOLE_PROJECT_ROOT=/absolute/path/to/your-repo
DEV_CONSOLE_PYTHON_MODULE=your_pkg.dev_agent
# 任意
DEV_CONSOLE_PASSWORD=...
```

### 3. ページ

```tsx
import { DevConsole } from "@oceanos/dev-console";
import "@oceanos/dev-console/styles.css";

export default function DevPage() {
  return (
    <DevConsole
      config={{
        storagePrefix: "myapp",
        api: {
          chat: "/api/dev/chat",
          upload: "/api/dev/upload",
          deploy: "/api/dev/deploy",
        },
        branding: {
          eyebrow: "My App · Dev",
          title: "開発コンソール",
          backHref: "/",
          backLabel: "← ダッシュボード",
        },
        welcomeText: `こんにちは。...（welcome.md をコピー）`,
      }}
    />
  );
}
```

basePath がある場合は API を `/myapp/api/dev/chat` のように **絶対パスで** 指定。

### 4. Vercel 本番 + GCP VM バックエンド（プロキシ）

Vercel では Python エージェントが動かないため、**API を VM に転送**する:

| 環境 | 環境変数 |
|------|----------|
| Vercel | `DEV_CONSOLE_BACKEND_URL=http://VM_IP:3000` |
| GCP VM（PM2） | `CURSOR_API_KEY`, `DEV_CONSOLE_PASSWORD`（`DEV_CONSOLE_BACKEND_URL` は未設定） |

VM で `bash scripts/vm/open-dev-console-firewall.sh`（または Cloud Shell 版）で tcp:3000 を開放。

### 5. API ルート（各1ファイル）

`app/api/dev/chat/route.ts`:

```ts
import { createDevChatHandlers } from "@oceanos/dev-console/server/chat";
export const { GET, POST, DELETE, dynamic, revalidate } = createDevChatHandlers();
```

`upload/route.ts` → `createDevUploadHandlers()`  
`deploy/route.ts` → `createDevDeployHandlers()`

### 6. Python

`python -m your_pkg.dev_agent --job` を実装（`sensor_ai/dev_agent.py` をコピーしてプロンプトだけ差し替え）。

### 7. デプロイスクリプト

`scripts/dev-console-build.sh`（Sensor 版をコピーし PORT / HEALTH_PATH を変更）。

## 操作仕様

`src/content/usage.md` が正本。ライブラリの挙動変更時は必ず同ファイルを更新すること。

## 共有される UX 定数（サイトごとに変えない）

- 左幅 180–400px、右幅最小 280px、中央最小 280px
- ⌘/Ctrl+Enter 送信
- 画像は clipboard paste のみ
- ポーリング最大 20 分、502 リトライ
- スタックジョブ 25 分で reconcile
