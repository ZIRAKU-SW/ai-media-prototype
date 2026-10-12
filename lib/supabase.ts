import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://wqlelowutbxplrzforcc.supabase.co'
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_Ud0Q4YAoo49bAKBNbHnT_g_kyJDgMI3'

// Supabase 停止時にDNS解決待ちでページが数十秒固まるのを防ぐ。
// 5秒タイムアウト + 失敗後60秒はサーキットオープン（即エラー → フォールバック）。
const SUPABASE_FETCH_TIMEOUT_MS = 5000
const SUPABASE_DOWN_BACKOFF_MS = 60_000
let supabaseDownUntil = 0

export const supabaseFetch: typeof fetch = async (input, init) => {
  if (Date.now() < supabaseDownUntil) {
    throw new Error('supabase unavailable (circuit open)')
  }
  try {
    const res = await fetch(input, {
      ...init,
      signal: AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS),
    })
    supabaseDownUntil = 0
    return res
  } catch (e) {
    supabaseDownUntil = Date.now() + SUPABASE_DOWN_BACKOFF_MS
    throw e
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: supabaseFetch },
})

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
    .retry(false)

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
    .retry(false)
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
    .retry(false)
  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .retry(false)
  if (error) throw error
  return data as Category[]
}

// ── メルマガ登録 ────────────────────────
export async function subscribeNewsletter(email: string) {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
    .retry(false)
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
    .retry(false)
  if (error) throw error
}

// ── 閲覧数カウント ──────────────────────
export async function trackView(slug: string) {
  await supabase.rpc('increment_view_count', { article_slug: slug }).retry(false)
}
