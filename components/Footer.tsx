type Theme = 'wired' | 'notion' | 'zapier'

const CONFIG = {
  wired:  { bg: '#0a0a0a', text: '#fff', muted: '#666' },
  notion: { bg: '#37352f', text: '#fff', muted: '#888' },
  zapier: { bg: '#1a1a1a', text: '#fff', muted: '#666' },
}

const LINKS = {
  コンテンツ: ['AI活用ガイド', 'DX・業務改善', '実験室・開発ブログ', 'ツール比較'],
  サービス:   ['システム開発', 'DX支援', '無料相談', 'セミナー'],
  その他:     ['会社情報', 'プライバシーポリシー', 'お問い合わせ'],
}

export default function Footer({ theme }: { theme: Theme }) {
  const c = CONFIG[theme]
  return (
    <footer style={{ background: c.bg, color: c.text, padding: '3rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', paddingBottom: '2rem', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.5rem' }}>AIビジネスメディア</div>
          <p style={{ color: c.muted, fontSize: '0.85rem', lineHeight: 1.6 }}>AIで、ビジネスはもっと進化する。</p>
        </div>
        {Object.entries(LINKS).map(([cat, items]) => (
          <div key={cat}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{cat}</div>
            {items.map((item) => (
              <a key={item} href="#" style={{ display: 'block', color: c.muted, fontSize: '0.85rem', marginBottom: '0.4rem', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1rem', color: c.muted, fontSize: '0.8rem' }}>
        © 2026 AIビジネスメディア / ZIRAKU Inc.
      </div>
    </footer>
  )
}
