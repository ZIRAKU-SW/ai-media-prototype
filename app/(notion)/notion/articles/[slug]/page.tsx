import ArticlePage from '@/components/pages/ArticlePage'

export default function NotionArticle({ params }: { params: { slug: string } }) {
  return <ArticlePage theme="notion" slug={params.slug} />
}
