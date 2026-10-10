import type { Metadata } from 'next'
import ZirakuSettingsContent from '@/components/ziraku/ZirakuSettingsContent'

export const metadata: Metadata = {
  title: 'アカウント設定｜AIビジネスメディア',
  robots: { index: false },
}

export default function ZirakuSettingsPage() {
  return <ZirakuSettingsContent />
}
