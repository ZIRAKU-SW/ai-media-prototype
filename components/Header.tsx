'use client'
import Link from 'next/link'

type Theme = 'wired' | 'notion' | 'zapier'

const CONFIG = {
  wired:  { bg: '#fff', border: '#e0ddd0', logo: '#0d2b6b', nav: '#333', cta: '#0d2b6b', ctaText: '#fff' },
  notion: { bg: '#fff', border: '#e9e9e7', logo: '#37352f', nav: '#37352f', cta: '#37352f', ctaText: '#fff' },
  zapier: { bg: '#fff', border: '#f0f0f0', logo: '#1a1a1a', nav: '#333', cta: '#ff4a00', ctaText: '#fff' },
}

const NAV = ['記事を探す', 'カテゴリー', '導入事例', 'セミナー', '会社情報']

export default function Header({ theme }: { theme: Theme }) {
  const c = CONFIG[theme]
  const base = `/${theme}`

  return (
    <header style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <Link href={base} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: c.logo, fontWeight: 900, fontSize: '1.1rem' }}>AIビジネスメディア</span>
        </Link>

        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          {NAV.map((n) => (
            <a key={n} href="#" style={{ color: c.nav, fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>{n}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ background: 'transparent', border: `1px solid ${c.logo}`, color: c.logo, borderRadius: '0.375rem', padding: '0.4rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            ログイン
          </button>
          <button style={{ background: c.cta, color: c.ctaText, border: 'none', borderRadius: '0.375rem', padding: '0.4rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            会員登録（無料）
          </button>
        </div>
      </div>
    </header>
  )
}
