'use client'

import { DevConsole } from '@oceanos/dev-console'
import { withBasePath } from '@/lib/base-path'

// config は毎レンダー新規オブジェクトにしない（Provider の useMemo が無効化され
// 子の初期化 effect が再実行されてチャット state が巻き戻るため）
const DEV_CONSOLE_CONFIG = {
  storagePrefix: 'ai-media-v2',
  api: {
    chat: withBasePath('/api/dev/chat'),
    upload: withBasePath('/api/dev/upload'),
    deploy: withBasePath('/api/dev/deploy'),
  },
  branding: {
    eyebrow: 'AIビジネスメディア · Dev',
    title: 'AI開発コンソール',
    backHref: withBasePath('/admin'),
    backLabel: '← 管理画面',
  },
  welcomeText: `こんにちは。AIビジネスメディアのコード修正をお手伝いします。

- **3テーマ**（wired / notion / zapier）すべてに対応して修正します
- **画像**は入力欄で Ctrl+V / ⌘+V で貼り付け
- **送信**は ⌘/Ctrl + Enter
- 変更後は右パネルでビルド確認 → \`npm run dev:vm-restart\` で oceanosfleet.com/Ziraku へ反映`,
  autoDeployDefault: false,
}

export default function AdminDevPage() {
  return <DevConsole config={DEV_CONSOLE_CONFIG} />
}
