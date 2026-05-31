import './zapier.css'

export default function ZapierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Noto Sans JP', system-ui, sans-serif", background: '#ffffff', color: '#1a1a1a', lineHeight: '1.7', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
