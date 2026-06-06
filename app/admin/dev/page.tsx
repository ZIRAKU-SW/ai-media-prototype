import { DevConsole } from '@oceanos/dev-console'
import '@oceanos/dev-console/styles.css'

export default function AdminDevPage() {
  return (
    <DevConsole
      config={{
        storagePrefix: 'ai-media',
        api: {
          chat: '/api/dev/chat',
          upload: '/api/dev/upload',
          deploy: '/api/dev/deploy',
        },
        branding: {
          eyebrow: 'AIビジネスメディア · Dev',
          title: 'AI開発コンソール',
          backHref: '/admin',
          backLabel: '← 管理画面',
        },
        welcomeText: `こんにちは。AIビジネスメディアのコード修正・機能追加をお手伝いします。

- **左のタブ**で会話を分けられます
- **画像**は入力欄で Ctrl+V / ⌘+V で貼り付け
- **送信**は ⌘/Ctrl + Enter
- **左右の境界**をドラッグして幅を調整できます
- 変更後は自動ビルド（ヘッダーでオフ可）。本番反映は \`git push\` → Vercel

## 作業ルール
- UI変更は **wired / notion / zapier の3テーマすべて** に対応すること
- 記事追加は \`lib/dummy-articles.ts\` + \`supabase/seeds/articles.sql\`
- 詳細は \`CLAUDE.md\` を参照`,
        autoDeployDefault: false,
      }}
    />
  )
}
