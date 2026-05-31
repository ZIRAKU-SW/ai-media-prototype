import './wired.css'

export default function WiredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Noto Serif JP', 'Noto Sans JP', sans-serif", background: '#fafaf8', color: '#1a1a1a', lineHeight: '1.7', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
