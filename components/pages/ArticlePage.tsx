'use client'
import { useEffect, useState } from 'react'
import { getArticleBySlug, getArticles, trackView, subscribeNewsletter, type Article } from '@/lib/supabase'
import Link from 'next/link'
import ZirakuLogoMark from '@/components/ziraku/ZirakuLogoMark'

type Theme = 'wired' | 'notion' | 'zapier'

const BADGE_CLASS: Record<string, string> = {
  'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green',
  'tools': 'badge--gray', 'solo-business': 'badge--purple',
  'lab': 'badge--purple', 'ai-news': 'badge--blue',
}

// Markdownを行単位で処理してHTMLへ変換
function renderContent(raw: string): string {
  const TH = 'padding:10px 14px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;text-align:left'
  const TD = 'padding:10px 14px;border:1px solid #e5e7eb;vertical-align:top'
  const isSepRow = (s: string) => /^\|[\s|:\-]+\|$/.test(s)
  const parseRow = (s: string, tag: 'th' | 'td') =>
    '<tr>' + s.replace(/^\||\|$/g, '').split('|').map(c =>
      `<${tag} style="${tag === 'th' ? TH : TD}">${c.trim()}</${tag}>`).join('') + '</tr>'

  // コードブロックを退避
  const saved: string[] = []
  let text = raw.replace(/```[\s\S]*?```/g, m => { saved.push(
    `<pre style="background:#1e1e1e;color:#d4d4d4;padding:1.25rem;border-radius:6px;overflow-x:auto;font-size:0.85rem;line-height:1.6;margin:1.5rem 0"><code>${
      m.replace(/```\w*\n?/, '').replace(/```$/, '').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }</code></pre>`); return `\x00CODE${saved.length - 1}\x00` })

  // 行単位でテーブルブロックを検出・変換
  const lines = text.split('\n')
  const out: string[] = []
  let tableLines: string[] = []

  const flushTable = () => {
    if (!tableLines.length) return
    const hasSep = tableLines.some(isSepRow)
    let isHeader = hasSep
    const rows: string[] = []
    for (const l of tableLines) {
      if (isSepRow(l)) { isHeader = false; continue }
      rows.push(parseRow(l, isHeader ? 'th' : 'td'))
      if (isHeader) isHeader = false
    }
    out.push(`<div style="overflow-x:auto;margin:1.5rem 0"><table style="width:100%;border-collapse:collapse;font-size:0.9rem">${rows.join('')}</table></div>`)
    tableLines = []
  }

  for (const line of lines) {
    if (line.trimStart().startsWith('|')) {
      tableLines.push(line)
    } else {
      flushTable()
      out.push(line)
    }
  }
  flushTable()
  text = out.join('\n')

  // インライン変換
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.15rem;font-weight:700;margin:2rem 0 0.75rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.35rem;font-weight:700;margin:2.5rem 0 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e5e7eb">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.75rem;font-weight:700;margin:2rem 0 1rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:0.875em">$1</code>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin:0.35rem 0">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:0.35rem 0">$1</li>')
    .replace(/(<\/li>\n)(?=<li)/g, '$1')
    .replace(/(<li[\s\S]+?<\/li>)(\n(?!<li))/g, '<ul style="list-style:disc;padding-left:1.5rem;margin:1rem 0">$1</ul>$2')
    .replace(/\n\n/g, '</p><p style="margin:1rem 0">')
    .replace(/\x00CODE(\d+)\x00/g, (_m, i) => saved[Number(i)])
}

export default function ArticlePage({ theme, slug }: { theme: Theme; slug: string }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const base = `/${theme}`

  useEffect(() => {
    getArticleBySlug(slug)
      .then(a => { setArticle(a); trackView(slug); })
      .catch(() => {})
      .finally(() => setLoading(false))
    getArticles({ limit: 4 }).then(setRelated).catch(() => {})
  }, [slug])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await subscribeNewsletter(email); setSubscribed(true) } catch {}
  }

  // CTA テキストをカテゴリで出し分け
  const ctaMap: Record<string, { text: string; label: string }> = {
    'dx-improvement': { text: '自社の業務もAIで自動化したい方は、お気軽にご相談ください', label: '無料でAI/DX相談をする' },
    'lab':            { text: '実際にAIツールを開発・導入したい方は、ぜひご相談ください', label: '開発・DX支援について相談する' },
    'solo-business':  { text: '1人でもAIで事業を広げたい方は、ぜひご相談ください', label: '業務自動化について相談する' },
  }
  const cta = ctaMap[article?.categories?.slug ?? ''] ?? { text: '最新AI活用情報をメールで受け取る', label: 'メルマガに無料登録する' }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: '1rem' }}>読み込み中...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>記事が見つかりませんでした</p>
        <Link href={base} style={{ color: '#3B82F6', textDecoration: 'underline' }}>← トップに戻る</Link>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header__inner">
          <Link href={base} className="logo">
            {theme === 'wired' && <><span className="logo__mark">✕</span><div><div className="logo__name">AIビジネスメディア</div><div className="logo__tagline">AIで、ビジネスはもっと進化する。</div></div></>}
            {theme === 'notion' && <><div className="logo__icon"><ZirakuLogoMark size={20} mono /></div><div><div className="logo__name">AIビジネスメディア</div><div className="logo__tagline">AIで、ビジネスはもっと進化する。</div></div></>}
            {theme === 'zapier' && <><div className="logo__icon">⚡</div><div className="logo__name">AIビジネスメディア</div></>}
          </Link>
          <nav className="nav">
            {['記事を探す','カテゴリー','導入事例','セミナー','会社情報'].slice(0, theme === 'zapier' ? 4 : 5).map(n => (
              <a key={n} href="#" className="nav__link">{n}</a>
            ))}
          </nav>
          <div className="header__actions">
            <button className="btn btn--ghost">ログイン</button>
            <button className="btn btn--primary">{theme === 'zapier' ? '無料で始める →' : '会員登録（無料）'}</button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1.5rem 0', fontSize: '0.82rem', color: '#888', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link href={base} style={{ color: '#888', textDecoration: 'none' }}>ホーム</Link>
        <span>›</span>
        {article.categories && <Link href={`${base}/category/${article.categories.slug}`} style={{ color: '#888', textDecoration: 'none' }}>{article.categories.name}</Link>}
        {article.categories && <span>›</span>}
        <span style={{ color: '#333' }}>{article.title.slice(0, 30)}...</span>
      </div>

      {/* Article */}
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {article.categories && (
            <span className={`badge ${BADGE_CLASS[article.categories.slug] ?? 'badge--blue'}`}>
              {article.categories.name}
            </span>
          )}
          <span style={{ fontSize: '0.78rem', color: '#888' }}>
            {article.published_at ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>📖 {article.reading_time_minutes}分で読める</span>
          <span style={{ fontSize: '0.78rem', color: '#888' }}>👁 {article.view_count.toLocaleString()}回</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 900,
          lineHeight: 1.4,
          marginBottom: '1.5rem',
          fontFamily: theme === 'wired' ? "'Noto Serif JP', serif" : 'inherit'
        }}>
          {article.title}
        </h1>

        {/* Thumbnail */}
        {article.thumbnail_url && (
          <img
            src={article.thumbnail_url}
            alt={article.title}
            style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: theme === 'notion' ? '12px' : '4px', marginBottom: '2rem', display: 'block' }}
          />
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p style={{
            background: theme === 'zapier' ? '#fff3ee' : theme === 'notion' ? '#f7f6f3' : '#f0f4ff',
            borderLeft: `4px solid ${theme === 'zapier' ? '#ff6b35' : theme === 'notion' ? '#4f86f7' : '#1a56db'}`,
            padding: '1rem 1.25rem',
            borderRadius: theme === 'notion' ? '0 8px 8px 0' : '0 4px 4px 0',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            color: '#444',
            marginBottom: '2rem'
          }}>
            {article.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          style={{ fontSize: '1rem', lineHeight: 1.9, color: '#333' }}
          dangerouslySetInnerHTML={{
            __html: article.content
              ? `<p style="margin:1rem 0">${renderContent(article.content)}</p>`
              : '<p style="color:#888;text-align:center;padding:3rem 0">本文準備中です。</p>'
          }}
        />

        {/* CTA */}
        <div style={{
          background: theme === 'zapier'
            ? 'linear-gradient(135deg, #ff6b35 0%, #ff4a00 100%)'
            : theme === 'notion'
            ? 'linear-gradient(135deg, #f7f6f3 0%, #edecea 100%)'
            : 'linear-gradient(135deg, #0d2b6b 0%, #1a4090 100%)',
          color: theme === 'notion' ? '#37352f' : '#fff',
          padding: '2.5rem 2rem',
          borderRadius: theme === 'notion' ? '16px' : '8px',
          marginTop: '3rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 背景装飾 */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          {/* アイコン */}
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            {article.categories?.slug === 'dx-improvement' ? '🏢' : article.categories?.slug === 'lab' ? '⚗️' : article.categories?.slug === 'solo-business' ? '🚀' : '📬'}
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', opacity: 0.95, lineHeight: 1.6 }}>{cta.text}</p>
          <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem', opacity: 0.7 }}>無料・登録不要でご利用いただけます</p>
          <a
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: theme === 'notion' ? '#37352f' : '#fff',
              color: theme === 'zapier' ? '#ff4a00' : theme === 'notion' ? '#fff' : '#0d2b6b',
              padding: '0.875rem 2.25rem',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s',
            }}
          >
            {cta.label} →
          </a>
        </div>

        {/* Share */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#888' }}>この記事を共有：</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://project-7bhii.vercel.app${base}/articles/${slug}`)}`}
            target="_blank" rel="noopener"
            style={{ background: '#000', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
          >
            𝕏 でシェア
          </a>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section style={{ background: theme === 'wired' ? '#f0f0ec' : theme === 'notion' ? '#f7f6f3' : '#f9f9f9', padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>関連記事</h2>
            <div className="articles-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {related.filter(a => a.slug !== slug).slice(0, 3).map(a => (
                <article key={a.id} className="article-card">
                  <Link href={`${base}/articles/${a.slug}`} className="article-card__img-wrap">
                    <img src={a.thumbnail_url ?? ''} alt={a.title} className="article-card__img" style={{ height: '160px' }} />
                  </Link>
                  <div className="article-card__body">
                    {a.categories && <span className={`badge ${BADGE_CLASS[a.categories.slug] ?? 'badge--blue'}`}>{a.categories.name}</span>}
                    <h3 className="article-card__title">
                      <Link href={`${base}/articles/${a.slug}`}>{a.title}</Link>
                    </h3>
                    <div className="article-card__meta">
                      <span>{a.reading_time_minutes}分で読める</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="newsletter-banner">
        <div className="newsletter-banner__inner">
          <div className="newsletter-banner__icon">✉️</div>
          <div className="newsletter-banner__content">
            <h2>最新のAI活用情報をメールで受け取る</h2>
            <p>週1回、最新ニュース・おすすめツール・実務ノウハウをまとめてお届け。</p>
          </div>
          {subscribed ? (
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>✅ 登録しました！</p>
          ) : (
            <form className="newsletter-form newsletter-form--inline" onSubmit={handleNewsletter}>
              <input type="email" placeholder="メールアドレスを入力" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn btn--primary">無料で登録する</button>
            </form>
          )}
        </div>
        <p className="newsletter-banner__note">いつでも配信停止できます。</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            {theme === 'wired' && <><span className="logo__mark">✕</span><div className="logo__name">AIビジネスメディア</div></>}
            {theme !== 'wired' && <div className="logo__name">AIビジネスメディア</div>}
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
