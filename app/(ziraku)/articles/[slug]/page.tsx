import type { Metadata } from 'next'
import ThemeArticlePage from '@/components/pages/ThemeArticlePage'
import ZirakuMemberArticleGate from '@/components/ziraku/ZirakuMemberArticleGate'
import { getArticleBySlug, getArticles, type Article } from '@/lib/supabase'

export const revalidate = 300

/** anon では RLS で見えない会員限定記事のメタ情報を service_role で取得 */
async function getMembersOnlyMeta(slug: string): Promise<{ title: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  try {
    const res = await fetch(
      `${url}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&is_members_only=eq.true&select=title`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } }
    )
    const rows = await res.json()
    return Array.isArray(rows) && rows[0]?.title ? { title: rows[0].title } : null
  } catch {
    return null
  }
}

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
    const membersMeta = await getMembersOnlyMeta(slug)
    if (membersMeta) {
      return { title: `${membersMeta.title}｜AIビジネスメディア（会員限定）`, robots: { index: false } }
    }
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

  if (initialArticle) {
    return (
      <ThemeArticlePage
        theme="ziraku"
        slug={slug}
        initialArticle={initialArticle}
        initialRelated={initialRelated}
      />
    )
  }

  // anon で取得できない場合: 会員限定記事ならクライアント側で
  // ログインユーザーの JWT による再取得を試み、未ログインはゲートを表示
  const membersMeta = await getMembersOnlyMeta(slug)
  if (membersMeta) {
    return (
      <ThemeArticlePage
        theme="ziraku"
        slug={slug}
        initialRelated={initialRelated}
        notFoundFallback={<ZirakuMemberArticleGate title={membersMeta.title} />}
      />
    )
  }

  return (
    <ThemeArticlePage
      theme="ziraku"
      slug={slug}
      initialArticle={null}
      initialRelated={initialRelated}
    />
  )
}
