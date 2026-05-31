'use client'
import { useEffect, useState } from 'react'
import { supabase, type Article } from '@/lib/supabase'

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', category_id: '', is_members_only: false })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'list' | 'new'>('list')

  useEffect(() => {
    supabase.from('articles').select('*, categories(name,slug,color)').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setArticles((data ?? []) as Article[]); setLoading(false) })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('articles').insert({
      ...form,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    if (!error) {
      alert('記事を公開しました！')
      setForm({ title: '', slug: '', excerpt: '', content: '', category_id: '', is_members_only: false })
      setTab('list')
      const { data } = await supabase.from('articles').select('*, categories(name,slug,color)').order('created_at', { ascending: false }).limit(50)
      setArticles((data ?? []) as Article[])
    } else {
      alert('エラー: ' + error.message)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #ddd', borderRadius: '0.5rem', fontSize: '0.95rem', fontFamily: 'inherit', marginTop: '0.25rem' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '0.25rem' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚙️</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>管理画面</span>
          <span style={{ fontSize: '0.8rem', color: '#888', padding: '0.2rem 0.5rem', background: '#f3f4f6', borderRadius: '0.25rem' }}>AIビジネスメディア</span>
        </div>
        <a href="/" style={{ fontSize: '0.85rem', color: '#888', textDecoration: 'none' }}>← サイトに戻る</a>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {(['list', 'new'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer', background: tab === t ? '#111' : '#fff', color: tab === t ? '#fff' : '#444', fontSize: '0.9rem', boxShadow: tab === t ? 'none' : '0 1px 3px rgba(0,0,0,0.1)' }}>
              {t === 'list' ? '📋 記事一覧' : '✏️ 新規記事'}
            </button>
          ))}
        </div>

        {/* List */}
        {tab === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>記事一覧 ({articles.length}件)</h2>
              <button onClick={() => setTab('new')} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                + 新規作成
              </button>
            </div>
            {loading ? <p style={{ color: '#888' }}>読み込み中...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {articles.map((a) => (
                  <div key={a.id} style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    {a.thumbnail_url && <img src={a.thumbnail_url} style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '0.375rem', flexShrink: 0 }} alt="" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                        {a.categories && <span style={{ fontSize: '0.7rem', color: a.categories.color, fontWeight: 700, background: a.categories.color + '18', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>{a.categories.name}</span>}
                        {a.is_members_only && <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>会員限定</span>}
                        <span style={{ fontSize: '0.75rem', color: a.is_published ? '#10b981' : '#f87171', fontWeight: 600 }}>{a.is_published ? '公開中' : '非公開'}</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                      <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.25rem 0 0' }}>/articles/{a.slug} · {a.reading_time_minutes}分 · 閲覧数 {a.view_count}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', border: '1px solid #ddd', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer', color: '#444' }}>編集</button>
                    </div>
                  </div>
                ))}
                {articles.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>まだ記事がありません。</p>}
              </div>
            )}
          </div>
        )}

        {/* New Article Form */}
        {tab === 'new' && (
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111' }}>新規記事作成</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>タイトル *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="例：ChatGPTで営業メールを10倍効率化する方法" />
              </div>
              <div>
                <label style={labelStyle}>スラッグ（URL） *</label>
                <input style={inputStyle} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required placeholder="例：chatgpt-sales-email" pattern="[a-z0-9-]+" />
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>英小文字・数字・ハイフンのみ</p>
              </div>
              <div>
                <label style={labelStyle}>抜粋（記事一覧に表示される説明文）</label>
                <textarea style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="この記事の概要を2〜3行で書いてください" />
              </div>
              <div>
                <label style={labelStyle}>本文（Markdown対応）</label>
                <textarea style={{...inputStyle, minHeight: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem'}} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="## はじめに&#10;&#10;ここに記事本文を書いてください..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="membersOnly" checked={form.is_members_only} onChange={e => setForm({...form, is_members_only: e.target.checked})} style={{ width: '1.1rem', height: '1.1rem' }} />
                <label htmlFor="membersOnly" style={{ fontSize: '0.9rem', color: '#444' }}>会員限定記事にする</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="submit" disabled={saving} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  {saving ? '公開中...' : '公開する'}
                </button>
                <button type="button" onClick={() => setTab('list')} style={{ background: '#fff', color: '#444', border: '1px solid #ddd', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
