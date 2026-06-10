import Link from 'next/link'
import type { Article } from '@/lib/supabase'

const BADGE: Record<string, string> = {
  'ai-guide': 'badge--blue',
  'dx-improvement': 'badge--green',
  tools: 'badge--gray',
  'solo-business': 'badge--orange',
  lab: 'badge--purple',
  'ai-news': 'badge--blue',
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
}

type NotionArticleCardProps = {
  article: Article
  showExcerpt?: boolean
}

export default function NotionArticleCard({ article: a, showExcerpt = true }: NotionArticleCardProps) {
  return (
    <article className="article-card">
      <Link href={`/notion/articles/${a.slug}`} className="article-card__link">
        <div className="article-card__img-wrap">
          {a.thumbnail_url ? (
            <img src={a.thumbnail_url} alt="" className="article-card__img" />
          ) : (
            <div className="article-card__img-fallback" aria-hidden>
              <span>{a.categories?.name ?? '記事'}</span>
            </div>
          )}
        </div>
        <div className="article-card__body">
          {a.categories && (
            <span className={`badge ${BADGE[a.categories.slug] ?? 'badge--blue'}`}>{a.categories.name}</span>
          )}
          <h3 className="article-card__title">{a.title}</h3>
          {showExcerpt && a.excerpt && <p className="article-card__excerpt">{a.excerpt}</p>}
          <div className="article-card__meta">
            <span>📅 {formatDate(a.published_at)}</span>
            <span className="article-card__meta-time">⏱ {a.reading_time_minutes}分</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
