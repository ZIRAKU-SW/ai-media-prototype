'use client'
import { useEffect, useState } from 'react'
import { getArticles, subscribeNewsletter, type Article } from '@/lib/supabase'
import Link from 'next/link'

const DUMMY: Article[] = [
  { id:'1', title:'ChatGPT-4oの新機能まとめ｜業務で使える7つの活用例', slug:'chatgpt-claude-gemini-comparison', excerpt:'OpenAIが発表したGPT-4oの最新機能を徹底解説。営業メールから資料作りまで、すぐ使えるプロンプト例付き。', content:null, thumbnail_url:'https://placehold.co/600x340/1a1a2e/4fc3f7?text=ChatGPT+4o', is_published:true, is_members_only:false, reading_time_minutes:8, view_count:1240, published_at:'2026-05-20', created_at:'2026-05-20', categories:{ name:'AI活用ガイド', slug:'ai-guide', color:'#3B82F6' } },
  { id:'2', title:'中小企業のDXとは？成功するための3つのステップ', slug:'retail-dx-inventory-automation', excerpt:'DX推進を検討している中小企業向けに具体的な始め方を解説。', content:null, thumbnail_url:'https://placehold.co/400x240/1a1a2e/4fc3f7?text=DX', is_published:true, is_members_only:false, reading_time_minutes:6, view_count:980, published_at:'2026-05-19', created_at:'2026-05-19', categories:{ name:'DX・業務改善', slug:'dx-improvement', color:'#10B981' } },
  { id:'3', title:'Notion AIの使い方完全ガイド｜議事録作成を10倍効率化', slug:'ai-meeting-minutes-automation', excerpt:'Notion AIを使って議事録・報告書作成を劇的に効率化する方法を解説。', content:null, thumbnail_url:'https://placehold.co/400x240/1a1a2e/4fc3f7?text=Notion+AI', is_published:true, is_members_only:false, reading_time_minutes:7, view_count:870, published_at:'2026-05-18', created_at:'2026-05-18', categories:{ name:'ツール比較', slug:'tools', color:'#6B7280' } },
  { id:'4', title:'在庫管理を自動化して在庫ロスを80%削減した小売業のDX事例', slug:'retail-dx-inventory-automation', excerpt:'少人数でもAIを駆使して業務を効率化した実例。', content:null, thumbnail_url:'https://placehold.co/400x240/1a1a2e/4fc3f7?text=DX+Case', is_published:true, is_members_only:false, reading_time_minutes:9, view_count:1560, published_at:'2026-05-17', created_at:'2026-05-17', categories:{ name:'1人社長・副業・起業', slug:'solo-business', color:'#8B5CF6' } },
]

const BADGE_CLASS: Record<string, string> = {
  'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green',
  'tools': 'badge--gray', 'solo-business': 'badge--purple',
  'lab': 'badge--purple', 'ai-news': 'badge--blue',
}

export default function WiredPage() {
  const [articles, setArticles] = useState<Article[]>(DUMMY)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    getArticles({ limit: 6 }).then(d => { if (d.length > 0) setArticles(d) }).catch(() => {})
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await subscribeNewsletter(email); setSubscribed(true) } catch {}
  }

  const featured = articles[0]
  const rest = articles.slice(1, 5)

  return (
    <>
      {/* Ticker */}
      <div className="ticker">
        <span className="ticker__label">NEW</span>
        <div className="ticker__text">
          <span>ChatGPT-4oの新機能まとめ｜業務で使える7つの活用例 &nbsp;&nbsp;—&nbsp;&nbsp; Claude 3.5 Sonnetが資料作成を10倍効率化する方法 &nbsp;&nbsp;—&nbsp;&nbsp; 中小企業のDXとは？成功するための3つのステップ</span>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header__inner">
          <Link href="/wired" className="logo">
            <span className="logo__mark">✕</span>
            <div>
              <div className="logo__name">AIビジネスメディア</div>
              <div className="logo__tagline">AIで、ビジネスはもっと進化する。</div>
            </div>
          </Link>
          <nav className="nav">
            {['記事を探す','カテゴリー','導入事例','セミナー','会社情報'].map(n => (
              <a key={n} href="#" className="nav__link">{n}</a>
            ))}
          </nav>
          <div className="header__actions">
            <button className="btn btn--ghost">ログイン</button>
            <button className="btn btn--primary">会員登録（無料）</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">最新のAI活用術とDX事例が毎日わかる</p>
            <h1 className="hero__title">AIでビジネスを加速する<br /><em>最前線のメディア</em></h1>
            <p className="hero__desc">中小企業や1人社長のための、実践的なAI活用術とDX情報を毎日お届け。最新ツールの使い方から業務自動化のノウハウ、導入事例まで、ビジネスの成長につながる情報がここに。</p>
            <div className="hero__cta">
              <button className="btn btn--primary btn--lg">会員登録して最新情報を受け取る（無料）</button>
              <button className="btn btn--outline btn--lg">記事を探す →</button>
            </div>
          </div>
          <div className="hero__stats">
            <p className="hero__stats-label">今、AIを活用する企業が増えています</p>
            <div className="hero__stats-grid">
              <div className="stat"><div className="stat__num">82<span>%</span></div><div className="stat__label">小規模企業のAI導入率</div></div>
              <div className="stat"><div className="stat__num">約45<span>%</span></div><div className="stat__label">平均的な生産性向上</div></div>
              <div className="stat"><div className="stat__num">95–98<span>%</span></div><div className="stat__label">AIスタック導入でのコスト削減</div></div>
            </div>
            <p className="hero__stats-source">※出典：各種調査レポートより</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <div className="values">
        <div className="values__inner">
          <div className="value"><span className="value__icon">📰</span><div><strong>最新情報を毎日更新</strong><p>AIニュースや活用ノウハウを毎日わかりやすく解説</p></div></div>
          <div className="value"><span className="value__icon">⚡</span><div><strong>すぐに使える実践ノウハウ</strong><p>初心者でもわかる解説で、明日から使える内容が満載</p></div></div>
          <div className="value"><span className="value__icon">📊</span><div><strong>DX・自動化の事例が豊富</strong><p>中小企業の導入事例を中心に、成果につながるヒントが見つかる</p></div></div>
          <div className="value"><span className="value__icon">🔒</span><div><strong>会員限定コンテンツ</strong><p>登録者限定の資料やテンプレートをプレゼント</p></div></div>
        </div>
      </div>

      {/* Main */}
      <main className="main">
        <div className="main__inner">
          <div className="main__content">
            <div className="section-header">
              <h2 className="section-title">新着記事</h2>
              <div className="category-tabs">
                <button className="tab tab--active">すべて</button>
                <button className="tab">AI活用術</button>
                <button className="tab">DX・業務改善</button>
                <button className="tab">ツール紹介</button>
                <button className="tab">事例・インタビュー</button>
              </div>
              <a href="#" className="link-more">一覧を見る →</a>
            </div>

            <div className="articles-grid">
              {featured && (
                <article className="article-card article-card--featured">
                  <Link href={`/wired/articles/${featured.slug}`} className="article-card__img-wrap">
                    <img src={featured.thumbnail_url ?? ''} alt={featured.title} className="article-card__img" />
                  </Link>
                  <div className="article-card__body">
                    {featured.categories && <span className={`badge ${BADGE_CLASS[featured.categories.slug] ?? 'badge--blue'}`}>{featured.categories.name}</span>}
                    <h3 className="article-card__title"><Link href={`/wired/articles/${featured.slug}`}>{featured.title}</Link></h3>
                    <p className="article-card__excerpt">{featured.excerpt}</p>
                    <div className="article-card__meta">
                      <span>{featured.published_at ? new Date(featured.published_at).toLocaleDateString('ja-JP') : ''}</span>
                      <span>{featured.reading_time_minutes}分で読める</span>
                    </div>
                  </div>
                </article>
              )}
              {rest.map(a => (
                <article key={a.id} className="article-card">
                  <Link href={`/wired/articles/${a.slug}`} className="article-card__img-wrap">
                    <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" />
                  </Link>
                  <div className="article-card__body">
                    {a.categories && <span className={`badge ${BADGE_CLASS[a.categories.slug] ?? 'badge--blue'}`}>{a.categories.name}</span>}
                    <h3 className="article-card__title"><Link href={`/wired/articles/${a.slug}`}>{a.title}</Link></h3>
                    <div className="article-card__meta">
                      <span>{a.published_at ? new Date(a.published_at).toLocaleDateString('ja-JP') : ''}</span>
                      <span>{a.reading_time_minutes}分で読める</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar__block">
              <h3 className="sidebar__title">今、みんなが読んでる</h3>
              <ol className="ranking">
                {articles.slice(0,5).map((a,i) => (
                  <li key={a.id} className="ranking__item">
                    <span className="ranking__num">{i+1}</span>
                    <Link href={`/wired/articles/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ol>
            </div>
            <div className="sidebar__block sidebar__newsletter">
              <h3 className="sidebar__title">最新AIニュースをメールで受け取る</h3>
              <p>AI活用のヒントや限定資料を定期配信中</p>
              {subscribed ? <p style={{color:'var(--accent)',fontWeight:'bold'}}>✅ 登録しました！</p> : (
                <form onSubmit={handleNewsletter} className="newsletter-form">
                  <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
                  <button type="submit" className="btn btn--primary btn--block">無料で登録する</button>
                </form>
              )}
              <p className="form-note">いつでも配信停止できます。</p>
            </div>
          </aside>
        </div>
      </main>

      {/* Newsletter Banner */}
      <section className="newsletter-banner">
        <div className="newsletter-banner__inner">
          <div className="newsletter-banner__icon">✉️</div>
          <div className="newsletter-banner__content">
            <h2>最新のAI活用情報をメールで受け取る</h2>
            <p>週1回、最新ニュースやおすすめツール、実務ノウハウをまとめてお届けします。</p>
          </div>
          <form className="newsletter-form newsletter-form--inline" onSubmit={handleNewsletter}>
            <input type="email" placeholder="メールアドレスを入力" className="input" required />
            <button type="submit" className="btn btn--primary">無料で登録する</button>
          </form>
        </div>
        <p className="newsletter-banner__note">いつでも配信停止できます。</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="logo__mark">✕</span>
            <div className="logo__name">AIビジネスメディア</div>
            <p>AIで、ビジネスはもっと進化する。</p>
          </div>
          <div className="footer__links">
            <div><strong>コンテンツ</strong><a href="#">AI活用ガイド</a><a href="#">DX・業務改善</a><a href="#">実験室・開発ブログ</a><a href="#">ツール比較</a></div>
            <div><strong>サービス</strong><a href="#">システム開発</a><a href="#">DX支援</a><a href="#">無料相談</a><a href="#">セミナー</a></div>
            <div><strong>その他</strong><a href="#">会社情報</a><a href="#">プライバシーポリシー</a><a href="#">お問い合わせ</a></div>
          </div>
        </div>
        <div className="footer__bottom"><p>© 2026 AIビジネスメディア / ZIRAKU Inc.</p></div>
      </footer>
    </>
  )
}
