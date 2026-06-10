import ThemeArticlePage from '@/components/pages/ThemeArticlePage'
import { use } from 'react'

export default function ZapierArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return <ThemeArticlePage theme="zapier" slug={slug} />
}
