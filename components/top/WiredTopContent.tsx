import Link from 'next/link'
import type { TopContentProps } from './types'

const BADGE_CLASS: Record<string, string> = {
  'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green',
  'tools': 'badge--gray', 'solo-business': 'badge--purple',
  'lab': 'badge--purple', 'ai-news': 'badge--blue',
}

export default function WiredTopContent({ articles, email, setEmail, subscribed, handleNewsletter }: TopContentProps) {
  const featured = articles[0]
  const rest = articles.slice(1, 5)

  return (
    <>
      <div className="ticker">
        <span className="ticker__label">NEW</span>
        <div className="ticker__text">
          <span>ChatGPT-4oの新機能まとめ｜業務で使える7つの活用例 &nbsp;&nbsp;—&nbsp;&nbsp; Claude 3.5 Sonnetが資料作成を10倍効率化する方法 &nbsp;&nbsp;—&nbsp;&nbsp; 中小企業のDXとは？成功するための3つのステップ</span>
        </div>
      </div>

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

      <div className="values">
        <div className="values__inner">
          <div className="value"><span className="value__icon">📰</span><div><strong>最新情報を毎日更新</strong><p>AIニュースや活用ノウハウを毎日わかりやすく解説</p></div></div>
          <div className="value"><span className="value__icon">⚡</span><div><strong>すぐに使える実践ノウハウ</strong><p>初心者でもわかる解説で、明日から使える内容が満載</p></div></div>
          <div className="value"><span className="value__icon">📊</span><div><strong>DX・自動化の事例が豊富</strong><p>中小企業の導入事例を中心に、成果につながるヒントが見つかる</p></div></div>
          <div className="value"><span className="value__icon">🔒</span><div><strong>会員限定コンテンツ</strong><p>登録者限定の資料やテンプレートをプレゼント</p></div></div>
        </div>
      </div>

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
