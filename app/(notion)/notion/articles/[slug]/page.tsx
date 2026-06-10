import NotionArticlePage from '@/components/notion/NotionArticlePage'
import { use } from 'react'

export default function NotionArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <NotionArticlePage slug={slug} />
}
