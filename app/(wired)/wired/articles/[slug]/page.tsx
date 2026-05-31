import ArticlePage from '@/components/pages/ArticlePage'
import { use } from 'react'

export default function WiredArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ArticlePage theme="wired" slug={slug} />
}
