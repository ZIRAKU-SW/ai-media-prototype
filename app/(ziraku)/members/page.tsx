import type { Metadata } from 'next'
import ZirakuMembersContent from '@/components/ziraku/ZirakuMembersContent'

export const metadata: Metadata = {
  title: '会員限定コンテンツ｜AIビジネスメディア',
  description: 'AI活用チェックリスト・営業効率化プロンプト集など、会員限定の特典コンテンツです。',
  robots: { index: false },
}

export default function ZirakuMembersPage() {
  return <ZirakuMembersContent />
}
