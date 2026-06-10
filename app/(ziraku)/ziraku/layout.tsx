import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AIビジネスメディア | ZIRAKU',
  description: 'AI活用でビジネスの可能性を広げる。最新ノウハウ・事例・ツール・ニュースを毎日更新。',
}

export default function ZirakuPageLayout({ children }: { children: React.ReactNode }) {
  return children
}
