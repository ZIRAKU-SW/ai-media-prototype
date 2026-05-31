import ArticlePage from '@/components/pages/ArticlePage'

export default function ZapierArticle({ params }: { params: { slug: string } }) {
  return <ArticlePage theme="zapier" slug={params.slug} />
}
