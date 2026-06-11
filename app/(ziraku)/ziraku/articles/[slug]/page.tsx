import type { Metadata } from 'next'
import ThemeArticlePage from '@/components/pages/ThemeArticlePage'
import { getArticleBySlug, getArticles, type Article } from '@/lib/supabase'

export const revalidate = 300

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  try {
    const article = await getArticleBySlug(slug)
    return {
      title: `${article.title}｜AIビジネスメディア`,
      description: article.excerpt ?? undefined,
      openGraph: {
        title: `${article.title}｜AIビジネスメディア`,
        description: article.excerpt ?? undefined,
        images: article.thumbnail_url ? [article.thumbnail_url] : [],
      },
    }
  } catch {
    return { title: '記事が見つかりません' }
  }
}

export default async function ZirakuArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let initialArticle: Article | null = null
  let initialRelated: Article[] = []

  try {
    initialArticle = await getArticleBySlug(slug)
  } catch {
    initialArticle = null
  }

  try {
    initialRelated = await getArticles({ limit: 5 })
  } catch {
    initialRelated = []
  }

  return (
    <ThemeArticlePage
      theme="ziraku"
      slug={slug}
      initialArticle={initialArticle}
      initialRelated={initialRelated}
    />
  )
}
