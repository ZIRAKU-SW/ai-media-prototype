import './notion.css'
import '../mobile-shared.css'

export default function NotionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="notion-root"
      style={{
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        background: '#faf9f7',
        color: '#37352f',
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
