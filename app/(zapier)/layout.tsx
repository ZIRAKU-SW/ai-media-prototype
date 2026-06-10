import './zapier.css'
import '../article-shared.css'
import '../company-shared.css'
import '../mobile-shared.css'

export default function ZapierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="zapier-root"
      style={{
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        background: '#ffffff',
        color: '#1a1a1a',
        lineHeight: '1.7',
        minHeight: '100vh',
        overflowX: 'clip',
        maxWidth: '100vw',
      }}
    >
      {children}
    </div>
  )
}
