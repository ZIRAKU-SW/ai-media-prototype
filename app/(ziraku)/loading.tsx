export default function ZirakuLoading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: '#2563eb',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '4px solid #dbeafe',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'ziraku-spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>読み込み中…</p>
      <style>{`@keyframes ziraku-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
