'use client'

import { DevConsole } from '@oceanos/dev-console'

export default function AdminDevPage() {
  return (
    <DevConsole
      config={{
        storagePrefix: 'ai-media-v2',
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
        welcomeText: `こんにちは。AIビジネスメディアのコード修正をお手伝いします。

- **3テーマ**（wired / notion / zapier）すべてに対応して修正します
- **画像**は入力欄で Ctrl+V / ⌘+V で貼り付け
- **送信**は ⌘/Ctrl + Enter
- 初回は右上の **トークン** に \`DEV_CONSOLE_PASSWORD\` を入力してください
- 変更後は **git push → Vercel** で本番反映（ビルド確認は右パネル）`,
        autoDeployDefault: false,
      }}
    />
  )
}
