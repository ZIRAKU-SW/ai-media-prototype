'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ZirakuSiteHeader, { ZIRAKU_CONTACT_URL } from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import type { TopContentProps } from './types'
import type { Article } from '@/lib/supabase'

const BADGE: Record<string, string> = {
  'ai-guide': 'badge--blue',
  'dx-improvement': 'badge--green',
  'tools': 'badge--gray',
  'solo-business': 'badge--purple',
  'lab': 'badge--purple',
  'ai-news': 'badge--blue',
}

const TABS = [
  { id: 'all', label: 'すべて' },
  { id: 'ai-guide', label: 'AI活用術' },
  { id: 'dx-improvement', label: 'DX・業務改善' },
  { id: 'tools', label: 'ツール紹介' },
  { id: 'cases', label: '事例・インタビュー' },
] as const

const CASE_SLUGS = new Set(['solo-business', 'lab', 'ai-news'])

const CATEGORIES = [
  {
    icon: '📘',
    title: 'AI活用ガイド / ハウツー',
    desc: '初心者向けの基礎知識から、業務別の具体的な活用方法まで',
    items: ['AIの基礎知識・用語解説', '業務別の活用方法', 'ツールの使い方', 'プロンプト集'],
  },
  {
    icon: '🏢',
    title: '1人社長・中小企業のAI活用事例',
    desc: '実際の導入事例・成功/失敗談・業種別の活用法',
    items: ['導入事例・成功/失敗談', '業種別の活用法', '経営者インタビュー'],
  },
  {
    icon: '📰',
    title: 'AIニュース / トレンド',
    desc: '最新のAI業界ニュース・新サービス・海外トレンド',
    items: ['最新ニュース', '業界動向', '新サービス・新機能', '海外トレンド'],
  },
  {
    icon: '🔬',
    title: 'AI実験室 / 検証ブログ',
    desc: 'AIツールの実際の検証・比較・プロンプト実験',
    items: ['ツール検証・比較', 'プロンプト実験', '自動化フロー検証'],
  },
  {
    icon: '🚀',
    title: '起業・副業 × AI',
    desc: 'AIを活用した起業・副業のノウハウとアイデア',
    items: ['AI起業の始め方', '副業アイデア', '収益化のヒント'],
  },
  {
    icon: '🛠',
    title: 'ツール・リソース集',
    desc: 'おすすめツール一覧・テンプレート・学習リソース',
    items: ['おすすめツール一覧', 'テンプレート配布', '学習リソース'],
  },
]

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function HeroIllustration() {
  return (
    <img
      className="hero__art"
      src={`${BASE_PATH}/ziraku-hero.png`}
      alt="ノートPCでAIを活用する人のイラスト — 今日から使えるAI活用アイデアが見つかる！会員限定の特典もたくさん！"
      width={640}
      height={384}
    />
  )
}

function filterByTab(articles: Article[], tab: string) {
  if (tab === 'all') return articles
  if (tab === 'cases') return articles.filter(a => CASE_SLUGS.has(a.categories?.slug ?? ''))
  return articles.filter(a => a.categories?.slug === tab)
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
}

export default function ZirakuTopContent({ articles, email, setEmail, subscribed, handleNewsletter }: TopContentProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const latest = articles[0]
  const filtered = useMemo(() => filterByTab(articles, activeTab).slice(0, 8), [articles, activeTab])
  const ranking = articles.slice(0, 3)

  return (
    <>
      <ZirakuSiteHeader />

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">最新のAI活用術とDX事例が毎日わかる！</p>
            <h1 className="hero__title">
              毎日の業務に、
              <br />
              <span className="hero__title-mark">AI</span>という味方を。
            </h1>
            <p className="hero__desc">
              中小企業や1人社長のための、実践的なAI活用術とDX情報を毎日お届け。
              最新ツールの使い方から業務自動化のノウハウ、導入事例まで、ビジネスの成長につながる情報がここに。
            </p>
          </div>

          <div className="hero__visual">
            <HeroIllustration />
          </div>

          <div className="hero__cta">
            <a href="#newsletter" className="btn btn--primary btn--lg hero__cta-signup">
              無料で会員登録する
              <span className="hero__cta-badge">かんたん1分！</span>
            </a>
            <Link href="/ziraku/articles" className="btn btn--outline btn--lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              記事を探す
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-band">
        <div className="stats-band__inner">
          <p className="stats-band__label">今、AIを活用する企業が増えています</p>
          <div className="stats-band__grid">
            <div className="stat">
              <div className="stat__icon">📊</div>
              <div className="stat__body">
                <div className="stat__num">82<span>%</span></div>
                <div className="stat__label">小規模企業のAI導入率</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat__icon">⚡</div>
              <div className="stat__body">
                <div className="stat__num">約45<span>%</span></div>
                <div className="stat__label">平均的な生産性向上</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat__icon">💰</div>
              <div className="stat__body">
                <div className="stat__num">95–98<span>%</span></div>
                <div className="stat__label">AIスタック導入でのコスト削減</div>
              </div>
            </div>
          </div>
          <p className="stats-band__source">※出典：各種調査レポートより</p>
        </div>
      </section>

      <section className="values">
        <div className="values__inner">
          {[
            { icon: '📗', title: '最新情報を毎日お届け', desc: 'AIニュースや活用ノウハウを毎日わかりやすく解説' },
            { icon: '💡', title: 'すぐに使える実践ノウハウ', desc: '初心者でもカンタンに使えるテクニックやプロンプトを紹介' },
            { icon: '📈', title: 'DX・自動化の事例が豊富', desc: '中小企業のリアルな成功事例であなたのヒントが見つかる' },
            { icon: '🎁', title: '会員限定コンテンツ', desc: '登録者限定の資料やテンプレートを無料でプレゼント！' },
          ].map(v => (
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
            <Link href={`/ziraku/articles/${latest.slug}`}>{latest.title}</Link>
          </p>
          <span className="ticker-bar__date">{formatDate(latest.published_at)}</span>
          <Link href="/ziraku/articles" className="ticker-bar__more">一覧を見る →</Link>
        </div>
      )}

      <section className="categories" id="categories">
        <div className="categories__inner">
          <div className="categories__header">
            <h2 className="section-title">メディア構成</h2>
            <p className="categories__lead">AI活用で、ビジネスの可能性を広げる — 6つのコンテンツカテゴリ</p>
          </div>
          <div className="categories__grid">
            {CATEGORIES.map(c => (
              <article key={c.title} className="category-card">
                <div className="category-card__icon">{c.icon}</div>
                <h3 className="category-card__title">{c.title}</h3>
                <p className="category-card__desc">{c.desc}</p>
                <ul className="category-card__list">
                  {c.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <main className="main" id="articles">
        <div className="main__inner">
          <div className="main__content">
            <div className="section-header">
              <h2 className="section-title">新着記事</h2>
              <div className="category-tabs">
                {TABS.map(t => (
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
              <Link href="/ziraku/articles" className="link-more">一覧を見る →</Link>
            </div>

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
                    <Link href={`/ziraku/articles/${a.slug}`} className="ranking__link">
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
            <div className="sidebar__block sidebar__consult" id="about">
              <div className="sidebar__consult-icon">💬</div>
              <h3 className="sidebar__title">お問い合わせ / 相談窓口</h3>
              <p className="sidebar__consult-desc">システム開発・DX支援のご相談は無料で承ります。</p>
              <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--block">
                相談する（無料）
              </a>
            </div>
          </aside>
        </div>
      </main>

      <section className="newsletter-banner newsletter-banner--wide" id="newsletter">
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

      <ZirakuFooter />
    </>
  )
}
