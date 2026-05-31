'use client'
import { useEffect, useState } from 'react'
import { getArticles, subscribeNewsletter, type Article } from '@/lib/supabase'
import Link from 'next/link'

const DUMMY: Article[] = [
  { id:'1', title:'ChatGPT-4oの新機能まとめ｜業務で使える7つの活用例', slug:'chatgpt-claude-gemini-comparison', excerpt:'OpenAIが発表したGPT-4oの最新機能を徹底解説。営業メールから資料作りまですぐ使える。', content:null, thumbnail_url:'https://placehold.co/400x240/fff3ee/ff6b35?text=ChatGPT+4o', is_published:true, is_members_only:false, reading_time_minutes:8, view_count:1240, published_at:'2026-05-20', created_at:'2026-05-20', categories:{ name:'AI活用ガイド', slug:'ai-guide', color:'#ff6b35' } },
  { id:'2', title:'中小企業のDXとは？成功するための3つのステップ', slug:'retail-dx-inventory-automation', excerpt:'DX推進を検討している中小企業向けに、具体的な始め方とよくある失敗パターンを解説。', content:null, thumbnail_url:'https://placehold.co/400x240/fff3ee/ff6b35?text=DX', is_published:true, is_members_only:false, reading_time_minutes:6, view_count:980, published_at:'2026-05-19', created_at:'2026-05-19', categories:{ name:'DX・業務改善', slug:'dx-improvement', color:'#2563eb' } },
  { id:'3', title:'Notion AIの使い方完全ガイド｜議事録作成を10倍効率化', slug:'ai-meeting-minutes-automation', excerpt:'Notion AIを使って議事録・報告書の作成を劇的に効率化する方法を解説。', content:null, thumbnail_url:'https://placehold.co/400x240/fff3ee/ff6b35?text=Notion+AI', is_published:true, is_members_only:false, reading_time_minutes:7, view_count:870, published_at:'2026-05-18', created_at:'2026-05-18', categories:{ name:'ツール比較', slug:'tools', color:'#7c3aed' } },
  { id:'4', title:'1人社長がChatGPTだけで月商100万を達成した全手順', slug:'solo-president-chatgpt-100man', excerpt:'副業から独立して1年、ChatGPTを活用して月商100万円を達成した全手順を公開。', content:null, thumbnail_url:'https://placehold.co/400x240/fff3ee/ff6b35?text=Solo+AI', is_published:true, is_members_only:false, reading_time_minutes:10, view_count:6890, published_at:'2026-05-17', created_at:'2026-05-17', categories:{ name:'1人社長・副業', slug:'solo-business', color:'#059669' } },
]

const BADGE: Record<string,string> = { 'ai-guide':'badge--orange','dx-improvement':'badge--blue','tools':'badge--purple','solo-business':'badge--green','lab':'badge--red','ai-news':'badge--orange' }

export default function ZapierPage() {
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

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header__inner">
          <Link href="/zapier" className="logo">
            <div className="logo__icon">⚡</div>
            <div className="logo__name">AIビジネスメディア</div>
          </Link>
          <nav className="nav">
            {['記事を探す','カテゴリー','導入事例','セミナー'].map(n=>(
              <a key={n} href="#" className="nav__link">{n}</a>
            ))}
          </nav>
          <div className="header__actions">
            <button className="btn btn--ghost">ログイン</button>
            <button className="btn btn--primary">無料で始める →</button>
          </div>
        </div>
      </header>

      {/* Hero */}
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

      {/* Stats Bar */}
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

      {/* Values */}
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

      {/* Main */}
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
            <div className="articles-grid">
              {articles.slice(0,4).map(a => (
                <article key={a.id} className="article-card">
                  <Link href={`/zapier/articles/${a.slug}`} className="article-card__img-wrap">
                    <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" />
                  </Link>
                  <div className="article-card__body">
                    {a.categories && <span className={`badge ${BADGE[a.categories.slug]??'badge--orange'}`}>{a.categories.name}</span>}
                    <h3 className="article-card__title"><Link href={`/zapier/articles/${a.slug}`}>{a.title}</Link></h3>
                    <p className="article-card__excerpt">{a.excerpt}</p>
                    <div className="article-card__meta">
                      <span>{a.published_at ? new Date(a.published_at).toLocaleDateString('ja-JP') : ''}</span>
                      <span>⏱ {a.reading_time_minutes}分</span>
                    </div>
                  </div>
                </article>
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

      {/* CTA Banner */}
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="logo"><div className="logo__icon">⚡</div><div className="logo__name">AIビジネスメディア</div></div>
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
    </>
  )
}
