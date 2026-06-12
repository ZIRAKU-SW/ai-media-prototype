import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY が未設定です' }, { status: 503 })
  }

  const { data, error } = await admin
    .from('articles')
    .select('*, categories(name,slug,color)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ articles: data ?? [] })
}

export async function POST(request: Request) {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY が未設定です' }, { status: 503 })
  }

  const body = await request.json()
  const { title, slug, excerpt, content, category_id, is_members_only, is_published, thumbnail_url } = body

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'タイトルとスラッグは必須です' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('articles')
    .insert({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || null,
      category_id: category_id || null,
      thumbnail_url: thumbnail_url?.trim() || null,
      is_members_only: Boolean(is_members_only),
      is_published: is_published !== false,
      published_at: new Date().toISOString(),
    })
    .select('*, categories(name,slug,color)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data })
}
