'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { getArticles, type Article } from '@/lib/supabase'
import { DUMMY_ARTICLES } from '@/lib/dummy-articles'

const BADGE: Record<string, string> = {
  'ai-guide': 'badge--blue',
  'dx-improvement': 'badge--green',
  'tools': 'badge--gray',
  'solo-business': 'badge--purple',
  'lab': 'badge--purple',
  'ai-news': 'badge--blue',
}

export const ZIRAKU_CATEGORIES = [
  { slug: 'ai-guide', label: 'AI活用ガイド' },
  { slug: 'dx-improvement', label: 'DX・業務改善' },
  { slug: 'solo-business', label: '1人社長・副業・起業' },
  { slug: 'ai-news', label: 'AIニュース' },
  { slug: 'lab', label: '実験室・開発ブログ' },
  { slug: 'tools', label: 'ツール比較' },
] as const

export function categoryLabel(slug: string): string {
  return ZIRAKU_CATEGORIES.find(c => c.slug === slug)?.label ?? slug
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
}

type Props = {
  /** カテゴリページのときに指定。指定時はタブを出さずそのカテゴリのみ表示 */
  category?: string
}

export default function ZirakuArticleList({ category }: Props) {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES)
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    getArticles({ limit: 50 }).then(d => { if (d.length > 0) setArticles(d) }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (category) return articles.filter(a => a.categories?.slug === category)
    if (activeTab === 'all') return articles
    return articles.filter(a => a.categories?.slug === activeTab)
  }, [articles, activeTab, category])

  const title = category ? categoryLabel(category) : '記事一覧'
  const lead = category
    ? `${categoryLabel(category)}に関する記事の一覧です。`
    : 'AI活用・DX・自動化に関する記事をすべて掲載しています。'

  return (
    <>
      <ZirakuSiteHeader />

      <nav className="article-breadcrumb" aria-label="パンくずリスト">
        <Link href="/ziraku">ホーム</Link>
        <span aria-hidden>›</span>
        {category ? (
          <>
            <Link href="/ziraku/articles">記事一覧</Link>
            <span aria-hidden>›</span>
            <span className="article-breadcrumb__current">{title}</span>
          </>
        ) : (
          <span className="article-breadcrumb__current">記事一覧</span>
        )}
      </nav>

      <main className="main">
        <div className="main__inner main__inner--single">
          <div className="main__content">
            <div className="section-header">
              <h1 className="section-title">{title}</h1>
              {!category && (
                <div className="category-tabs">
                  <button
                    type="button"
                    className={`tab${activeTab === 'all' ? ' tab--active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    すべて
                  </button>
                  {ZIRAKU_CATEGORIES.map(c => (
                    <button
                      key={c.slug}
                      type="button"
                      className={`tab${activeTab === c.slug ? ' tab--active' : ''}`}
                      onClick={() => setActiveTab(c.slug)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="articles-lead">{lead}</p>

            {filtered.length === 0 ? (
              <p className="articles-empty">該当する記事はまだありません。</p>
            ) : (
              <div className="articles-grid articles-grid--home">
                {filtered.map(a => (
                  <article key={a.id} className="article-card">
                    <Link href={`/ziraku/articles/${a.slug}`} className="article-card__img-wrap">
                      <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" />
                    </Link>
                    <div className="article-card__body">
                      {a.categories && (
                        <span className={`badge ${BADGE[a.categories.slug] ?? 'badge--blue'}`}>{a.categories.name}</span>
                      )}
                      <h3 className="article-card__title">
                        <Link href={`/ziraku/articles/${a.slug}`}>{a.title}</Link>
                      </h3>
                      <p className="article-card__excerpt">{a.excerpt}</p>
                      <div className="article-card__meta">
                        <span>📅 {formatDate(a.published_at)}</span>
                        <span className="article-card__meta-time">⏱ {a.reading_time_minutes}分</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ZirakuFooter />
    </>
  )
}
