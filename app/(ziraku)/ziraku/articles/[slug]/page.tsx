import ThemeArticlePage from '@/components/pages/ThemeArticlePage'
import { use } from 'react'

export default function ZirakuArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ThemeArticlePage theme="ziraku" slug={slug} />
}
