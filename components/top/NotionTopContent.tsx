import Link from 'next/link'
import type { TopContentProps } from './types'

const BADGE: Record<string,string> = { 'ai-guide':'badge--blue','dx-improvement':'badge--green','tools':'badge--gray','solo-business':'badge--orange','lab':'badge--purple','ai-news':'badge--blue' }

export default function NotionTopContent({ articles, email, setEmail, subscribed, handleNewsletter }: TopContentProps) {
  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Link href="/notion" className="logo">
            <div className="logo__icon">AI</div>
            <div>
              <div className="logo__name">AIビジネスメディア</div>
              <div className="logo__tagline">AIで、ビジネスはもっと進化する。</div>
            </div>
          </Link>
          <nav className="nav">
            {['記事を探す ▾','カテゴリー ▾','導入事例','セミナー','会社情報'].map(n=>(
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
            <div className="hero__badge">✨ 最新のAI活用術とDX事例が毎日わかる！</div>
            <h1 className="hero__title">毎日の業務に、<br /><span>AIという味方を。</span></h1>
            <p className="hero__desc">中小企業や1人社長のために、実践的なAI活用術とDX情報を毎日お届け。最新ツールの使い方から業務自動化のノウハウ、導入事例まで、ビジネスの成長につながる情報がここに。</p>
            <div className="hero__cta">
              <button className="btn btn--primary btn--lg">無料で会員登録する<span className="btn__badge">かんたん1分！</span></button>
              <button className="btn btn--outline btn--lg">🔍 記事を探す</button>
            </div>
          </div>
          <div className="hero__illustration">
            <div className="hero__card hero__card--1"><span>💡</span><div><strong>今日から使える</strong><br />AI活用アイデアが<br />見つかる！</div></div>
            <div className="hero__card hero__card--2"><span>🎁</span><div><strong>会員限定の<br />特典もたくさん！</strong></div></div>
            <div className="hero__card hero__card--3"><span>📊</span><div>DX・自動化の<br />事例が豊富</div></div>
            <div className="hero__avatar"><div className="hero__avatar-circle">👨‍💻</div></div>
          </div>
        </div>
      </section>

      <section className="values">
        <div className="values__inner">
          <div className="value"><div className="value__icon">📗</div><strong>最新情報を毎日お届け</strong><p>AIニュースや活用ノウハウを毎日わかりやすく解説</p></div>
          <div className="value"><div className="value__icon">💡</div><strong>すぐに使える実践ノウハウ</strong><p>初心者でもカンタンに使えるテクニックやプロンプトを紹介</p></div>
          <div className="value"><div className="value__icon">📈</div><strong>DX・自動化の事例が豊富</strong><p>中小企業のリアルな成功事例であなたのヒントが見つかる</p></div>
          <div className="value"><div className="value__icon">🎁</div><strong>会員限定コンテンツ</strong><p>登録者限定の資料やテンプレートを無料でプレゼント！</p></div>
        </div>
      </section>

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
              <a href="#" className="link-more">すべて見る →</a>
            </div>

            <div className="articles-grid">
              {articles.slice(0,4).map(a => (
                <article key={a.id} className="article-card">
                  <Link href={`/notion/articles/${a.slug}`} className="article-card__img-wrap">
                    <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" />
                  </Link>
                  <div className="article-card__body">
                    {a.categories && <span className={`badge ${BADGE[a.categories.slug]??'badge--blue'}`}>{a.categories.name}</span>}
                    <h3 className="article-card__title"><Link href={`/notion/articles/${a.slug}`}>{a.title}</Link></h3>
                    <p className="article-card__excerpt">{a.excerpt}</p>
                    <div className="article-card__meta">
                      <span>📅 {a.published_at ? new Date(a.published_at).toLocaleDateString('ja-JP') : ''}</span>
                      <span>⏱ {a.reading_time_minutes}分</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="members-cta">
              <div className="members-cta__left">
                <span className="members-cta__emoji">🚀</span>
                <div>
                  <p className="members-cta__label">まずは無料で試してみよう！</p>
                  <h3 className="members-cta__title">会員登録すると、すべての機能が使えます！</h3>
                </div>
              </div>
              <div className="members-cta__features">
                <div className="feature-check">✅ 会員限定記事が読み放題</div>
                <div className="feature-check">✅ AI活用チェックリストをプレゼント</div>
                <div className="feature-check">✅ 便利なプロンプト集を無料配布</div>
                <div className="feature-check">✅ セミナー・イベントに優先ご招待</div>
              </div>
              <button className="btn btn--primary btn--lg">無料で会員登録する →</button>
            </div>
          </div>

          <aside className="sidebar">
            <div className="sidebar__block sidebar__ranking">
              <h3 className="sidebar__title">今、みんなが読んでる！ 🔥</h3>
              <ol className="ranking">
                {articles.slice(0,5).map((a,i) => (
                  <li key={a.id} className="ranking__item">
                    <span className={`ranking__num${i===0?' ranking__num--gold':i===1?' ranking__num--silver':i===2?' ranking__num--bronze':''}`}>{i+1}</span>
                    <Link href={`/notion/articles/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ol>
            </div>
            <div className="sidebar__block sidebar__newsletter">
              <h3 className="sidebar__title">📧 無料メルマガ登録</h3>
              <p className="sidebar__newsletter-desc">週1回、最新AI活用情報や限定プロンプトをお届け！</p>
              {subscribed ? <p style={{color:'var(--accent)',fontWeight:'bold'}}>✅ 登録しました！</p> : (
                <form onSubmit={handleNewsletter} className="newsletter-form">
                  <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
                  <button type="submit" className="btn btn--primary btn--block">無料で登録する 🎁</button>
                </form>
              )}
              <p className="form-note">いつでも配信停止できます</p>
            </div>
          </aside>
        </div>
      </main>

      <section className="newsletter-banner">
        <div className="newsletter-banner__inner">
          <div className="newsletter-banner__content">
            <h2 className="newsletter-banner__title">📮 最新AI活用情報を<br />メールで受け取ろう！</h2>
            <p className="newsletter-banner__desc">週1回、最新ニュース・使えるプロンプト・限定テンプレートを無料配信中！</p>
          </div>
          <form className="newsletter-banner__form" onSubmit={handleNewsletter}>
            <input type="email" placeholder="メールアドレスを入力してください" className="input" required />
            <button type="submit" className="btn btn--primary btn--lg">無料で登録する！</button>
            <p className="form-note">登録無料・いつでも解除OK</p>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo"><div className="logo__icon">AI</div><span className="logo__name">AIビジネスメディア</span></div>
            <p>AIで、ビジネスはもっと進化する。</p>
            <div className="footer__social"><a href="#" className="social-btn">𝕏</a><a href="#" className="social-btn">📘</a><a href="#" className="social-btn">📸</a></div>
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
