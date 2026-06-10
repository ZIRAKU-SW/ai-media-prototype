import './wired.css'
import '../article-shared.css'
import '../company-shared.css'
import '../mobile-shared.css'

export default function WiredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="wired-root"
      style={{
        fontFamily: "'Noto Serif JP', 'Noto Sans JP', sans-serif",
        background: '#fafaf8',
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
