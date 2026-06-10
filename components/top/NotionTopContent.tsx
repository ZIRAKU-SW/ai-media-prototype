'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ThemeSiteHeader from '@/components/theme/ThemeSiteHeader'
import { themeCompanyHref, ZIRAKU_CONTACT_URL } from '@/lib/theme-links'
import type { TopContentProps } from './types'
import type { Article } from '@/lib/supabase'

const BADGE: Record<string, string> = {
  'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green', 'tools': 'badge--gray',
  'solo-business': 'badge--orange', 'lab': 'badge--purple', 'ai-news': 'badge--blue',
}

const TABS = [
  { id: 'all', label: 'すべて' },
  { id: 'ai-guide', label: 'AI活用術' },
  { id: 'dx-improvement', label: 'DX・業務改善' },
  { id: 'tools', label: 'ツール紹介' },
  { id: 'cases', label: '事例・インタビュー' },
] as const

const CASE_SLUGS = new Set(['solo-business', 'lab', 'ai-news'])

function filterByTab(articles: Article[], tab: string) {
  if (tab === 'all') return articles
  if (tab === 'cases') return articles.filter(a => CASE_SLUGS.has(a.categories?.slug ?? ''))
  return articles.filter(a => a.categories?.slug === tab)
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
}

export default function NotionTopContent({ articles, email, setEmail, subscribed, handleNewsletter }: TopContentProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const latest = articles[0]
  const filtered = useMemo(() => filterByTab(articles, activeTab).slice(0, 8), [articles, activeTab])
  const ranking = articles.slice(0, 3)

  return (
    <>
      <ThemeSiteHeader theme="notion" />

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__badge">✨ 最新のAI活用術とDX事例が毎日わかる！</div>
            <h1 className="hero__title">毎日の業務に、<br /><span>AIという味方を。</span></h1>
            <p className="hero__desc">
              中小企業や1人社長のために、実践的なAI活用術とDX情報を毎日お届け。
              最新ツールの使い方から業務自動化のノウハウ、導入事例まで、ビジネスの成長につながる情報がここに。
            </p>
            <div className="hero__cta">
              <button type="button" className="btn btn--primary btn--lg">
                無料で会員登録する
                <span className="btn__badge">かんたん1分！</span>
              </button>
              <button type="button" className="btn btn--outline btn--lg">🔍 記事を探す</button>
            </div>
          </div>
          <div className="hero__illustration">
            <div className="hero__float hero__float--1">📊</div>
            <div className="hero__float hero__float--2">💡</div>
            <div className="hero__float hero__float--3">📄</div>
            <div className="hero__card hero__card--1">
              <span>💡</span>
              <div><strong>今日から使える</strong><br />AI活用アイデアが<br />見つかる！</div>
            </div>
            <div className="hero__card hero__card--2">
              <span>🎁</span>
              <div><strong>会員限定の<br />特典もたくさん！</strong></div>
            </div>
            <div className="hero__avatar">
              <div className="hero__avatar-circle">👨‍💻</div>
              <div className="hero__avatar-desk" />
            </div>
          </div>
        </div>
      </section>

      <section className="values">
        <div className="values__inner">
          {[
            { icon: '📗', title: '最新情報を毎日お届け', desc: 'AIニュースや活用ノウハウを毎日わかりやすく解説' },
            { icon: '💡', title: 'すぐに使える実践ノウハウ', desc: '初心者でもカンタンに使えるテクニックやプロンプトを紹介' },
            { icon: '📈', title: 'DX・自動化の事例が豊富', desc: '中小企業のリアルな成功事例であなたのヒントが見つかる' },
            { icon: '🎁', title: '会員限定コンテンツ', desc: '登録者限定の資料やテンプレートを無料でプレゼント！' },
          ].map((v) => (
            <div key={v.title} className="value">
              <div className="value__icon-wrap"><span className="value__icon">{v.icon}</span></div>
              <strong>{v.title}</strong>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {latest && (
        <div className="ticker-bar">
          <span className="ticker-bar__label">NEW</span>
          <p className="ticker-bar__text">
            <Link href={`/notion/articles/${latest.slug}`}>{latest.title}</Link>
          </p>
          <span className="ticker-bar__date">{formatDate(latest.published_at)}</span>
          <Link href="#" className="ticker-bar__more">すべて見る →</Link>
        </div>
      )}

      <main className="main">
        <div className="main__inner">
          <div className="main__content">
            <div className="section-header">
              <h2 className="section-title">新着記事</h2>
              <div className="category-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`tab${activeTab === t.id ? ' tab--active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <Link href="#" className="link-more">すべて見る →</Link>
            </div>

            <div className="articles-grid articles-grid--home">
              {filtered.map((a) => (
                <article key={a.id} className="article-card">
                  <Link href={`/notion/articles/${a.slug}`} className="article-card__img-wrap">
                    <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" />
                  </Link>
                  <div className="article-card__body">
                    {a.categories && (
                      <span className={`badge ${BADGE[a.categories.slug] ?? 'badge--blue'}`}>{a.categories.name}</span>
                    )}
                    <h3 className="article-card__title">
                      <Link href={`/notion/articles/${a.slug}`}>{a.title}</Link>
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

            <div className="members-banner">
              <div className="members-banner__illus" aria-hidden>
                <div className="members-banner__character">👩‍💼</div>
              </div>
              <div className="members-banner__body">
                <p className="members-banner__label">まずは無料で試してみよう！</p>
                <h3 className="members-banner__title">会員登録すると、すべての機能が使えます！</h3>
                <ul className="members-banner__list">
                  <li>✅ 会員限定記事が読み放題</li>
                  <li>✅ AI活用チェックリストをプレゼント</li>
                  <li>✅ 便利なプロンプト集を無料配布</li>
                  <li>✅ セミナー・イベントに優先ご招待</li>
                </ul>
              </div>
              <button type="button" className="btn btn--signup-green btn--lg">無料で会員登録する →</button>
            </div>
          </div>

          <aside className="sidebar">
            <div className="sidebar__block sidebar__ranking">
              <h3 className="sidebar__title">今、みんなが読んでる！ 🔥</h3>
              <ol className="ranking ranking--rich">
                {ranking.map((a, i) => (
                  <li key={a.id} className="ranking__item ranking__item--rich">
                    <span className={`ranking__num${i === 0 ? ' ranking__num--gold' : i === 1 ? ' ranking__num--silver' : ' ranking__num--bronze'}`}>
                      {i + 1}
                    </span>
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
              <p className="sidebar__newsletter-desc">週1回、最新AI活用情報や限定プロンプトをお届け！</p>
              {subscribed ? (
                <p className="sidebar__subscribed">✅ 登録しました！</p>
              ) : (
                <form onSubmit={handleNewsletter} className="newsletter-form">
                  <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                  <button type="submit" className="btn btn--primary btn--block">無料で登録する</button>
                </form>
              )}
              <p className="form-note">いつでも配信停止できます</p>
            </div>
          </aside>
        </div>
      </main>

      <section className="newsletter-banner newsletter-banner--wide">
        <div className="newsletter-banner__inner">
          <div className="newsletter-banner__icon">✉️</div>
          <div className="newsletter-banner__content">
            <h2 className="newsletter-banner__title">最新のAI活用情報をメールで受け取る</h2>
            <p className="newsletter-banner__desc">週1回、最新ニュース・使えるプロンプト・限定テンプレートを無料配信中！</p>
          </div>
          <form className="newsletter-banner__form" onSubmit={handleNewsletter}>
            <input type="email" placeholder="メールアドレスを入力してください" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn--primary btn--lg">無料で登録する</button>
          </form>
        </div>
        <p className="newsletter-banner__note">登録無料・いつでも解除OK</p>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="logo__icon">AI</div>
              <span className="logo__name">AIビジネスメディア</span>
            </div>
            <p>AIで、ビジネスはもっと進化する。</p>
            <div className="footer__social">
              <a href="#" className="social-btn" aria-label="X">𝕏</a>
              <a href="#" className="social-btn" aria-label="Facebook">📘</a>
              <a href="#" className="social-btn" aria-label="Instagram">📸</a>
            </div>
          </div>
          <div className="footer__links">
            <div><strong>コンテンツ</strong><a href="#">AI活用ガイド</a><a href="#">DX・業務改善</a><a href="#">実験室・開発ブログ</a><a href="#">ツール比較</a></div>
            <div><strong>サービス</strong><a href="#">システム開発</a><a href="#">DX支援</a><a href="#">無料相談</a><a href="#">セミナー</a></div>
            <div><strong>その他</strong><a href={themeCompanyHref('notion')}>会社情報</a><a href="#">プライバシーポリシー</a><a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">お問い合わせ</a></div>
          </div>
        </div>
        <div className="footer__bottom"><p>© 2026 AIビジネスメディア / ZIRAKU Inc.</p></div>
      </footer>
    </>
  )
}
