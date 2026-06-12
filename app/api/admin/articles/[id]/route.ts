import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY が未設定です' }, { status: 503 })
  }

  const { id } = await context.params
  const { data, error } = await admin
    .from('articles')
    .select('*, categories(name,slug,color)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ article: data })
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY が未設定です' }, { status: 503 })
  }

  const { id } = await context.params
  const body = await request.json()
  const { title, slug, excerpt, content, category_id, is_members_only, is_published, thumbnail_url } = body

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'タイトルとスラッグは必須です' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt?.trim() || null,
    content: content?.trim() || null,
    is_members_only: Boolean(is_members_only),
    is_published: is_published !== false,
    updated_at: new Date().toISOString(),
  }
  if (category_id !== undefined) updates.category_id = category_id || null
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url?.trim() || null

  const { data, error } = await admin
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select('*, categories(name,slug,color)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data })
}
