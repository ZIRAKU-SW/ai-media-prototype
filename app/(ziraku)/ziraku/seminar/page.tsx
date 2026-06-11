import type { Metadata } from 'next'
import ZirakuSeminarContent from '@/components/ziraku/ZirakuSeminarContent'

export const metadata: Metadata = {
  title: 'セミナー・イベント | AIビジネスメディア',
  description: 'AI活用・DX推進をテーマにしたセミナー・イベントを準備中。ニュースレターで開催案内をお届けします。',
}

export default function ZirakuSeminarPage() {
  return <ZirakuSeminarContent />
}
