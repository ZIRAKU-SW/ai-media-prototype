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
        welcomeText: '',
        autoDeployDefault: false,
      }}
    />
  )
}
