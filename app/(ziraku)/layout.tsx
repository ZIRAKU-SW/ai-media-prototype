import './ziraku.css'
import '../article-shared.css'
import '../company-shared.css'
import '../mobile-shared.css'

export default function ZirakuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ziraku-root"
      style={{
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        background: '#f8fafc',
        color: '#1e293b',
        lineHeight: 1.7,
        minHeight: '100vh',
        overflowX: 'clip',
        maxWidth: '100vw',
      }}
    >
      {children}
    </div>
  )
}
