import ThemeArticlePage from '@/components/pages/ThemeArticlePage'
import { use } from 'react'

export default function NotionArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ThemeArticlePage theme="notion" slug={slug} />
}
