import Link from 'next/link'
import ThemeSiteHeader from '@/components/theme/ThemeSiteHeader'
import { themeCompanyHref, ZIRAKU_CONTACT_URL } from '@/lib/theme-links'
import ZapierArticleCard from '@/components/zapier/ZapierArticleCard'
import type { TopContentProps } from './types'

export default function ZapierTopContent({ articles, email, setEmail, subscribed, handleNewsletter }: TopContentProps) {
  return (
    <>
      <ThemeSiteHeader theme="zapier" />

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__tag">🚀 中小企業・1人社長のためのAIメディア</div>
            <h1 className="hero__title">
              AIを使えば、<br />
              <span className="hero__title-highlight">あなたの仕事は<br />もっと速くなる。</span>
            </h1>
            <p className="hero__desc">ChatGPT・Claude・Notion AIなどの最新ツールを使った実務ノウハウを毎日配信。難しい説明ゼロで、明日からすぐ使えます。</p>
            <div className="hero__cta">
              <button className="btn btn--primary btn--xl">無料で会員登録する →</button>
              <p className="hero__cta-note">✓ 登録1分 &nbsp; ✓ 完全無料 &nbsp; ✓ いつでも解除OK</p>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__blob"></div>
            <div className="hero__tools">
              <div className="tool-chip">🤖 ChatGPT</div>
              <div className="tool-chip tool-chip--accent">⚡ Claude</div>
              <div className="tool-chip">📝 Notion AI</div>
              <div className="tool-chip tool-chip--accent">🎨 Canva AI</div>
              <div className="tool-chip">📊 Copilot</div>
              <div className="tool-chip">🔧 Zapier</div>
            </div>
            <div className="hero__result-card">
              <div className="result-card__header">
                <span className="result-card__dot result-card__dot--red"></span>
                <span className="result-card__dot result-card__dot--yellow"></span>
                <span className="result-card__dot result-card__dot--green"></span>
                <span className="result-card__title">AIで業務改善した結果…</span>
              </div>
              <div className="result-card__body">
                <div className="result-row"><span className="result-label">資料作成時間</span><span className="result-before">3時間</span><span className="result-arrow">→</span><span className="result-after">20分</span></div>
                <div className="result-row"><span className="result-label">営業メール作成</span><span className="result-before">30分</span><span className="result-arrow">→</span><span className="result-after">3分</span></div>
                <div className="result-row"><span className="result-label">議事録まとめ</span><span className="result-before">1時間</span><span className="result-arrow">→</span><span className="result-after">即完了</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stats-bar__inner">
          <div className="stats-bar__item"><strong>82%</strong><span>の中小企業がAIを導入済み</span></div>
          <div className="stats-bar__divider"></div>
          <div className="stats-bar__item"><strong>45%</strong><span>平均生産性向上</span></div>
          <div className="stats-bar__divider"></div>
          <div className="stats-bar__item"><strong>10,000+</strong><span>人のビジネスパーソンが読む</span></div>
          <div className="stats-bar__divider"></div>
          <div className="stats-bar__item"><strong>毎日更新</strong><span>新鮮な情報をお届け</span></div>
        </div>
      </div>

      <section className="values">
        <div className="values__inner">
          <h2 className="values__title">このメディアでできること</h2>
          <div className="values__grid">
            <div className="value-card"><div className="value-card__icon">🛠️</div><h3>すぐ使えるノウハウ</h3><p>ChatGPT・Claude・Notion AIなどを使った実務テクニックを、初心者でもわかるように解説。</p></div>
            <div className="value-card value-card--accent"><div className="value-card__icon">⚡</div><h3>実際に作ってみた</h3><p>「AIで営業ツールを作ってみた」「30分でチャットボット完成」など、実装動画つきで紹介。</p></div>
            <div className="value-card"><div className="value-card__icon">📈</div><h3>中小企業のリアル事例</h3><p>大企業ではなく、あなたと似た規模のビジネスのDX・AI活用事例を中心に紹介。</p></div>
            <div className="value-card"><div className="value-card__icon">🎯</div><h3>DX・相談窓口</h3><p>記事を読んで「自社に取り入れたい」と思ったら、そのままDX支援を相談できます。</p></div>
          </div>
        </div>
      </section>

      <main className="main">
        <div className="main__inner">
          <div className="main__content">
            <div className="section-header">
              <h2 className="section-title">新着記事 📰</h2>
              <div className="category-tabs">
                <button className="tab tab--active">すべて</button>
                <button className="tab">AI活用術</button>
                <button className="tab">DX・業務改善</button>
                <button className="tab">ツール紹介</button>
              </div>
              <a href="#" className="link-more">すべて見る →</a>
            </div>
            <div className="articles-grid articles-grid--home">
              {articles.slice(0, 4).map((a, i) => (
                <ZapierArticleCard key={a.id} article={a} featured={i === 0} showNew={i === 0} />
              ))}
            </div>
          </div>
          <aside className="sidebar">
            <div className="sidebar__block sidebar__cta">
              <h3>🚀 AIで仕事を加速しよう</h3>
              <p>毎週届く実務AIノウハウで、ライバルより一歩先へ。</p>
              {subscribed ? <p style={{color:'var(--orange)',fontWeight:'bold'}}>✅ 登録しました！</p> : (
                <form onSubmit={handleNewsletter} className="newsletter-form">
                  <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
                  <button type="submit" className="btn btn--primary btn--block">無料で登録する →</button>
                </form>
              )}
            </div>
            <div className="sidebar__block">
              <h3 className="sidebar__title">よく読まれています</h3>
              <ol className="ranking">
                {articles.slice(0,5).map((a,i) => (
                  <li key={a.id} className="ranking__item">
                    <span className="ranking__num">{i+1}</span>
                    <Link href={`/zapier/articles/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>

      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2>AIで仕事を変えるなら、まず読んでみてください</h2>
          <p>無料会員登録で、限定コンテンツ・プロンプト集・DX事例レポートをプレゼント！</p>
          <div className="cta-banner__actions">
            <button className="btn btn--white btn--xl">無料で会員登録する →</button>
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'0.82rem',marginTop:'8px'}}>✓ 登録1分 ✓ 完全無料 ✓ いつでも解除OK</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="logo"><div className="logo__icon">⚡</div><div className="logo__name">AIビジネスメディア</div></div>
            <p>AIで、ビジネスはもっと進化する。</p>
          </div>
          <div className="footer__links">
            <div><strong>コンテンツ</strong><a href="#">AI活用ガイド</a><a href="#">DX・業務改善</a><a href="#">実験室</a><a href="#">ツール比較</a></div>
            <div><strong>サービス</strong><a href="#">システム開発</a><a href="#">DX支援</a><a href="#">無料相談</a></div>
            <div><strong>その他</strong><a href={themeCompanyHref('zapier')}>会社情報</a><a href="#">プライバシーポリシー</a><a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">お問い合わせ</a></div>
          </div>
        </div>
        <div className="footer__bottom"><p>© 2026 AIビジネスメディア / ZIRAKU Inc.</p></div>
      </footer>
    </>
  )
}
