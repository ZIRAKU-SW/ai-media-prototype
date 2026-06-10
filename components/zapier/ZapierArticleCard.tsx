import Link from 'next/link'
import type { Article } from '@/lib/supabase'

const BADGE: Record<string, string> = {
  'ai-guide': 'badge--orange',
  'dx-improvement': 'badge--blue',
  tools: 'badge--purple',
  'solo-business': 'badge--green',
  lab: 'badge--red',
  'ai-news': 'badge--orange',
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
}

type ZapierArticleCardProps = {
  article: Article
  featured?: boolean
  showNew?: boolean
}

export default function ZapierArticleCard({ article: a, featured = false, showNew = false }: ZapierArticleCardProps) {
  const isLab = a.categories?.slug === 'lab'

  return (
    <article className={`article-card${featured ? ' article-card--big' : ''}${isLab ? ' article-card--lab' : ''}`}>
      {isLab && <div className="article-card__lab-badge">🧪 実験室</div>}
      <Link href={`/zapier/articles/${a.slug}`} className="article-card__link">
        <div className="article-card__img-wrap">
          {a.thumbnail_url ? (
            <img src={a.thumbnail_url} alt="" className="article-card__img" />
          ) : (
            <div className="article-card__img-fallback" aria-hidden>
              <span>{a.categories?.name ?? '記事'}</span>
            </div>
          )}
          {showNew && <span className="article-card__new">NEW</span>}
        </div>
        <div className="article-card__body">
          {a.categories && (
            <span className={`badge ${BADGE[a.categories.slug] ?? 'badge--orange'}`}>{a.categories.name}</span>
          )}
          <h3 className="article-card__title">{a.title}</h3>
          {a.excerpt && <p className="article-card__excerpt">{a.excerpt}</p>}
          <div className="article-card__footer">
            <div className="article-card__meta">
              <span>📅 {formatDate(a.published_at)}</span>
              <span>⏱ {a.reading_time_minutes}分</span>
            </div>
            <span className="article-card__link-label">読む →</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
