import './notion.css'

export default function NotionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Noto Sans JP', system-ui, sans-serif", background: '#faf9f7', color: '#37352f', lineHeight: '1.7', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
