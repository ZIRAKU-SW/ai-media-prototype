'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { getArticleBySlug, getArticles, trackView, subscribeNewsletter, type Article } from '@/lib/supabase'
import { renderMarkdown } from '@/lib/render-markdown'

const BADGE: Record<string, string> = {
  'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green', 'tools': 'badge--gray',
  'solo-business': 'badge--orange', 'lab': 'badge--purple', 'ai-news': 'badge--blue',
}

const CTA_MAP: Record<string, { text: string; label: string }> = {
  'dx-improvement': { text: '自社の業務もAIで自動化したい方は、お気軽にご相談ください', label: '無料でAI/DX相談をする' },
  'lab': { text: '実際にAIツールを開発・導入したい方は、ぜひご相談ください', label: '開発・DX支援について相談する' },
  'solo-business': { text: '1人でもAIで事業を広げたい方は、ぜひご相談ください', label: '業務自動化について相談する' },
}

export default function NotionArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    getArticleBySlug(slug)
      .then(a => { setArticle(a); trackView(slug) })
      .catch(() => {})
      .finally(() => setLoading(false))
    getArticles({ limit: 5 }).then(setRelated).catch(() => {})
  }, [slug])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await subscribeNewsletter(email); setSubscribed(true) } catch {}
  }

  if (loading) {
    return <div className="article-page article-page--loading"><p>読み込み中...</p></div>
  }

  if (!article) {
    return (
      <div className="article-page article-page--not-found">
        <p>記事が見つかりませんでした</p>
        <Link href="/notion">← トップに戻る</Link>
      </div>
    )
  }

  const cta = CTA_MAP[article.categories?.slug ?? ''] ?? { text: '最新AI活用情報をメールで受け取る', label: 'メルマガに無料登録する' }
  const ctaIcon = article.categories?.slug === 'dx-improvement' ? '🏢'
    : article.categories?.slug === 'lab' ? '⚗️'
    : article.categories?.slug === 'solo-business' ? '🚀' : '📬'

  return (
    <div className="article-page">
      <SiteHeader
        homeHref="/notion"
        navItems={['記事を探す ▾', 'カテゴリー ▾', '導入事例', 'セミナー', '会社情報']}
        signupLabel="会員登録（無料）"
        logo={
          <>
            <div className="logo__icon">AI</div>
            <div>
              <div className="logo__name">AIビジネスメディア</div>
              <div className="logo__tagline">AIで、ビジネスはもっと進化する。</div>
            </div>
          </>
        }
      />

      <nav className="article-breadcrumb" aria-label="パンくずリスト">
        <Link href="/notion">ホーム</Link>
        <span aria-hidden>›</span>
        {article.categories && (
          <>
            <Link href={`/notion/category/${article.categories.slug}`}>{article.categories.name}</Link>
            <span aria-hidden>›</span>
          </>
        )}
        <span className="article-breadcrumb__current">{article.title}</span>
      </nav>

      <div className="article-layout">
        <article className="article-detail">
          <div className="article-detail__meta">
            {article.categories && (
              <span className={`badge ${BADGE[article.categories.slug] ?? 'badge--blue'}`}>{article.categories.name}</span>
            )}
            <span className="article-detail__meta-item">
              {article.published_at ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </span>
            <span className="article-detail__meta-item">📖 {article.reading_time_minutes}分で読める</span>
            <span className="article-detail__meta-item article-detail__meta-item--views">👁 {article.view_count.toLocaleString()}回</span>
          </div>

          <h1 className="article-detail__title">{article.title}</h1>

          {article.thumbnail_url && (
            <img src={article.thumbnail_url} alt={article.title} className="article-detail__thumb" />
          )}

          {article.excerpt && <p className="article-detail__excerpt">{article.excerpt}</p>}

          <div
            className="article-detail__content"
            dangerouslySetInnerHTML={{
              __html: article.content
                ? `<p>${renderMarkdown(article.content)}</p>`
                : '<p class="article-detail__empty">本文準備中です。</p>',
            }}
          />

          <div className="article-detail__cta">
            <div className="article-detail__cta-icon">{ctaIcon}</div>
            <p className="article-detail__cta-text">{cta.text}</p>
            <p className="article-detail__cta-note">無料・登録不要でご利用いただけます</p>
            <a href="/contact" className="btn btn--primary btn--lg article-detail__cta-btn">{cta.label} →</a>
          </div>

          <div className="article-detail__share">
            <span>この記事を共有：</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://project-7bhii.vercel.app/notion/articles/${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="article-detail__share-btn"
            >
              𝕏 でシェア
            </a>
          </div>
        </article>

        <aside className="article-sidebar">
          <div className="sidebar__block sidebar__ranking">
            <h3 className="sidebar__title">今、みんなが読んでる！ 🔥</h3>
            <ol className="ranking ranking--rich">
              {related.slice(0, 3).map((a, i) => (
                <li key={a.id} className="ranking__item ranking__item--rich">
                  <span className={`ranking__num${i === 0 ? ' ranking__num--gold' : i === 1 ? ' ranking__num--silver' : ' ranking__num--bronze'}`}>{i + 1}</span>
                  <Link href={`/notion/articles/${a.slug}`} className="ranking__link">
                    <img src={a.thumbnail_url ?? ''} alt="" className="ranking__thumb" />
                    <span className="ranking__text">{a.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className="sidebar__block sidebar__newsletter">
            <div className="sidebar__newsletter-icon">📧</div>
            <h3 className="sidebar__title">メールでいち早く<br />最新情報をゲット！</h3>
            {subscribed ? (
              <p className="sidebar__subscribed">✅ 登録しました！</p>
            ) : (
              <form onSubmit={handleNewsletter} className="newsletter-form">
                <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" className="btn btn--primary btn--block">無料で登録する</button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {related.length > 1 && (
        <section className="article-related">
          <div className="article-related__inner">
            <h2 className="section-title">関連記事</h2>
            <div className="articles-grid articles-grid--home articles-grid--related">
              {related.filter(a => a.slug !== slug).slice(0, 4).map(a => (
                <article key={a.id} className="article-card">
                  <Link href={`/notion/articles/${a.slug}`} className="article-card__img-wrap">
                    <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" />
                  </Link>
                  <div className="article-card__body">
                    {a.categories && <span className={`badge ${BADGE[a.categories.slug] ?? 'badge--blue'}`}>{a.categories.name}</span>}
                    <h3 className="article-card__title"><Link href={`/notion/articles/${a.slug}`}>{a.title}</Link></h3>
                    <div className="article-card__meta"><span>{a.reading_time_minutes}分で読める</span></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="newsletter-banner newsletter-banner--wide">
        <div className="newsletter-banner__inner">
          <div className="newsletter-banner__icon">✉️</div>
          <div className="newsletter-banner__content">
            <h2 className="newsletter-banner__title">最新のAI活用情報をメールで受け取る</h2>
            <p className="newsletter-banner__desc">週1回、最新ニュース・使えるプロンプト・限定テンプレートを無料配信中！</p>
          </div>
          {subscribed ? (
            <p className="article-detail__subscribed">✅ 登録しました！</p>
          ) : (
            <form className="newsletter-banner__form" onSubmit={handleNewsletter}>
              <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn btn--primary btn--lg">無料で登録する</button>
            </form>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo"><div className="logo__icon">AI</div><span className="logo__name">AIビジネスメディア</span></div>
            <p>AIで、ビジネスはもっと進化する。</p>
          </div>
          <div className="footer__links">
            <div><strong>コンテンツ</strong><a href="#">AI活用ガイド</a><a href="#">DX・業務改善</a><a href="#">実験室</a><a href="#">ツール比較</a></div>
            <div><strong>サービス</strong><a href="#">システム開発</a><a href="#">DX支援</a><a href="#">無料相談</a></div>
            <div><strong>その他</strong><a href="#">会社情報</a><a href="#">プライバシーポリシー</a><a href="#">お問い合わせ</a></div>
          </div>
        </div>
        <div className="footer__bottom"><p>© 2026 AIビジネスメディア / ZIRAKU Inc.</p></div>
      </footer>
    </div>
  )
}
