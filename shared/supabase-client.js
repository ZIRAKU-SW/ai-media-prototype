import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ---- 記事取得 ----
export async function fetchArticles({ category, limit = 8, membersOnly = false } = {}) {
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, thumbnail_url, reading_time_minutes, view_count, published_at, categories(name, slug, color)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('categories.slug', category)
  if (!membersOnly) query = query.eq('is_members_only', false)

  const { data, error } = await query
  return { data, error }
}

// ---- 人気記事 ----
export async function fetchPopularArticles(limit = 5) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, thumbnail_url, view_count, categories(name, color)')
    .eq('is_published', true)
    .eq('is_members_only', false)
    .order('view_count', { ascending: false })
    .limit(limit)
  return { data, error }
}

// ---- メルマガ登録 ----
export async function subscribeNewsletter(email) {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
  return { error }
}

// ---- 問い合わせ送信 ----
export async function sendInquiry({ name, email, company, inquiryType, message }) {
  const { error } = await supabase
    .from('inquiries')
    .insert({ name, email, company, inquiry_type: inquiryType, message })
  return { error }
}

// ---- 閲覧数カウント ----
export async function trackView(slug) {
  await supabase.rpc('increment_view_count', { article_slug: slug })
}

// ---- 認証 ----
export async function signUp(email, password, displayName) {
  return supabase.auth.signUp({
    email, password,
    options: { data: { display_name: displayName } }
  })
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
