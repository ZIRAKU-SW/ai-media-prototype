import Link from 'next/link'
import type { Article } from '@/lib/supabase'

type Theme = 'wired' | 'notion' | 'zapier'

export default function ArticleCard({ article: a, theme }: { article: Article; theme: Theme }) {
  const base = `/${theme}`
  return (
    <article style={{ background: '#fff', borderRadius: theme === 'notion' ? '0.75rem' : '0.5rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      {a.thumbnail_url && (
        <Link href={`${base}/articles/${a.slug}`}>
          <img src={a.thumbnail_url} alt={a.title} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
        </Link>
      )}
      <div style={{ padding: '1.25rem' }}>
        {a.categories && (
          <span style={{ display: 'inline-block', background: a.categories.color + '20', color: a.categories.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            {a.categories.name}
          </span>
        )}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '0.75rem', color: '#1a1a1a' }}>
          <Link href={`${base}/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {a.title}
          </Link>
        </h3>
        {a.excerpt && (
          <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {a.excerpt}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#999' }}>
          {a.published_at && <span>{new Date(a.published_at).toLocaleDateString('ja-JP')}</span>}
          <span>{a.reading_time_minutes}分で読める</span>
        </div>
      </div>
    </article>
  )
}
