import Link from 'next/link'
import type { Article } from '@/lib/supabase'

type Theme = 'wired' | 'notion' | 'zapier'

const CATEGORY_META: Record<string, { icon: string; gradient: string }> = {
  'ai-guide':      { icon: '🤖', gradient: 'linear-gradient(135deg, #0d2b6b 0%, #1a56db 100%)' },
  'dx-improvement':{ icon: '🏢', gradient: 'linear-gradient(135deg, #064e3b 0%, #10B981 100%)' },
  'tools':         { icon: '🛠️', gradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)' },
  'solo-business': { icon: '🚀', gradient: 'linear-gradient(135deg, #4c1d95 0%, #8B5CF6 100%)' },
  'lab':           { icon: '⚗️', gradient: 'linear-gradient(135deg, #991b1b 0%, #EF4444 100%)' },
  'ai-news':       { icon: '📰', gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)' },
}

export default function ArticleCard({ article: a, theme }: { article: Article; theme: Theme }) {
  const base = `/${theme}`
  const catMeta = CATEGORY_META[a.categories?.slug ?? ''] ?? { icon: '📄', gradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)' }
  const radius = theme === 'notion' ? '0.875rem' : theme === 'zapier' ? '0.5rem' : '0.375rem'

  return (
    <article style={{
      background: '#fff',
      borderRadius: radius,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* サムネイル — 画像があれば表示、なければカテゴリグラデーション */}
      <Link href={`${base}/articles/${a.slug}`} style={{ display: 'block', flexShrink: 0, position: 'relative', height: '180px', overflow: 'hidden' }}>
        {a.thumbnail_url ? (
          <img
            src={a.thumbnail_url}
            alt={a.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : null}
        {/* カテゴリオーバーレイ（フォールバック兼アクセント） */}
        <div style={{
          position: 'absolute', inset: 0,
          background: a.thumbnail_url ? 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 50%)' : catMeta.gradient,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: a.thumbnail_url ? 'flex-end' : 'center',
          alignItems: a.thumbnail_url ? 'flex-start' : 'center',
          padding: '1rem',
        }}>
          {!a.thumbnail_url && (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{catMeta.icon}</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.4, maxWidth: '180px' }}>
                {a.categories?.name}
              </div>
            </>
          )}
          {a.categories && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              letterSpacing: '0.04em',
            }}>
              {catMeta.icon} {a.categories.name}
            </span>
          )}
        </div>
      </Link>

      {/* 本文 */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '0.97rem', fontWeight: 700, lineHeight: 1.55, marginBottom: '0.65rem', color: '#1a1a1a', flex: 1 }}>
          <Link href={`${base}/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {a.title}
          </Link>
        </h3>
        {a.excerpt && (
          <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {a.excerpt}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.73rem', color: '#aaa', alignItems: 'center', marginTop: 'auto' }}>
          {a.published_at && <span>🗓 {new Date(a.published_at).toLocaleDateString('ja-JP')}</span>}
          <span>📖 {a.reading_time_minutes}分</span>
          {a.view_count > 0 && <span>👁 {a.view_count.toLocaleString()}</span>}
        </div>
      </div>

      {/* 読む → リンク */}
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <Link
          href={`${base}/articles/${a.slug}`}
          style={{
            display: 'block',
            textAlign: 'center',
            background: theme === 'zapier' ? '#ff4a00' : theme === 'notion' ? '#37352f' : '#0d2b6b',
            color: '#fff',
            padding: '0.6rem 1rem',
            borderRadius: theme === 'notion' ? '8px' : '4px',
            fontWeight: 700,
            fontSize: '0.82rem',
            textDecoration: 'none',
            letterSpacing: '0.03em',
          }}
        >
          記事を読む →
        </Link>
      </div>
    </article>
  )
}
