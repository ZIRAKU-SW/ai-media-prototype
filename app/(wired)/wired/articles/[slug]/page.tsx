import ArticlePage from '@/components/pages/ArticlePage'

export default function WiredArticle({ params }: { params: { slug: string } }) {
  return <ArticlePage theme="wired" slug={params.slug} />
}
