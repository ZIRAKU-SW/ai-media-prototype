export default function WiredLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-wired" style={{ minHeight: '100vh', background: '#f5f5f0' }}>{children}</div>
}
