import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── 型定義 ──────────────────────────────
export type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  thumbnail_url: string | null
  is_published: boolean
  is_members_only: boolean
  reading_time_minutes: number
  view_count: number
  published_at: string | null
  created_at: string
  categories: { name: string; slug: string; color: string } | null
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
}

// ── 記事取得 ────────────────────────────
export async function getArticles(options?: {
  category?: string
  limit?: number
  page?: number
}) {
  const { category, limit = 12, page = 1 } = options ?? {}
  const from = (page - 1) * limit

  let query = supabase
    .from('articles')
    .select('*, categories(name,slug,color)')
    .eq('is_published', true)
    .eq('is_members_only', false)
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1)

  if (category) query = query.eq('categories.slug', category)

  const { data, error } = await query
  if (error) throw error
  return data as Article[]
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*, categories(name,slug,color)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) throw error
  return data as Article
}

export async function getPopularArticles(limit = 5) {
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,slug,view_count,categories(name,color)')
    .eq('is_published', true)
    .eq('is_members_only', false)
    .order('view_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Category[]
}

// ── メルマガ登録 ────────────────────────
export async function subscribeNewsletter(email: string) {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
  if (error) throw error
}

// ── 問い合わせ ──────────────────────────
export async function submitInquiry(payload: {
  name: string
  email: string
  company?: string
  inquiry_type: string
  message: string
}) {
  const { error } = await supabase.from('inquiries').insert(payload)
  if (error) throw error
}

// ── 閲覧数カウント ──────────────────────
export async function trackView(slug: string) {
  await supabase.rpc('increment_view_count', { article_slug: slug })
}
