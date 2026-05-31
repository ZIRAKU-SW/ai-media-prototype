export default function NotionLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-notion" style={{ minHeight: '100vh', background: '#ffffff' }}>{children}</div>
}
