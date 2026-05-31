import Link from 'next/link'

const themes = [
  {
    href: '/wired',
    label: 'Pattern A',
    name: 'WIRED風',
    desc: 'インクブルー × セリフ体\n重厚なエディトリアル',
    bg: '#0d2b6b',
    accent: '#4fc3f7',
  },
  {
    href: '/notion',
    label: 'Pattern B',
    name: 'Notion風',
    desc: '温かみのある余白重視\nやわらかいUI',
    bg: '#f7f6f3',
    accent: '#2eaadc',
    dark: true,
  },
  {
    href: '/zapier',
    label: 'Pattern C',
    name: 'Zapier風',
    desc: 'オレンジ × 大胆タイポ\n強いCTA',
    bg: '#ff4a00',
    accent: '#ffffff',
  },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>AIビジネスメディア / デザイン比較</p>
      <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>3パターン 並行開発中</h1>
      <p style={{ color: '#666', marginBottom: '3rem', textAlign: 'center' }}>テーマを選択してプレビュー</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '900px' }}>
        {themes.map((t) => (
          <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: t.bg, borderRadius: '1rem', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.7rem', color: t.accent, letterSpacing: '0.15em', fontWeight: 600 }}>{t.label}</span>
              <h2 style={{ color: t.dark ? '#37352f' : '#fff', fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{t.name}</h2>
              <p style={{ color: t.dark ? '#888' : 'rgba(255,255,255,0.7)', fontSize: '0.9rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{t.desc}</p>
              <div style={{ marginTop: '1.5rem', color: t.accent, fontSize: '0.9rem', fontWeight: 600 }}>開く →</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link href="/admin" style={{ color: '#555', fontSize: '0.85rem', textDecoration: 'none', border: '1px solid #333', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
          ⚙️ 管理画面
        </Link>
      </div>
    </div>
  )
}
