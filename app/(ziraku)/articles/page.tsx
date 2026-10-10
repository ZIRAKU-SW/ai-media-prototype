import type { Metadata } from 'next'
import ZirakuArticleList from '@/components/ziraku/ZirakuArticleList'

export const metadata: Metadata = {
  title: '記事一覧 | AIビジネスメディア',
  description: 'AI活用・DX・業務自動化に関する記事の一覧。カテゴリで絞り込めます。',
}

export default function ZirakuArticlesPage() {
  return <ZirakuArticleList />
}
