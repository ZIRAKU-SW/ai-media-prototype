import { use } from 'react'
import ZirakuArticleList from '@/components/ziraku/ZirakuArticleList'

export default function ZirakuCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ZirakuArticleList category={slug} />
}
