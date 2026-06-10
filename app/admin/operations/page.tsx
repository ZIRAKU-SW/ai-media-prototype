import Link from 'next/link'
import { withBasePath } from '@/lib/base-path'
import {
  loadPlatformExport,
  statusLabel,
  themeLabel,
  type PlatformBug,
} from '@/lib/platform-bugs'

const STATUS_COLOR: Record<string, string> = {
  open: '#ef4444',
  fixed: '#10b981',
  wontfix: '#6b7280',
}

const SEVERITY_COLOR: Record<string, string> = {
  high: '#dc2626',
  medium: '#f59e0b',
  low: '#6b7280',
}

function BugCard({ bug }: { bug: PlatformBug }) {
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: STATUS_COLOR[bug.status] ?? '#444',
            background: (STATUS_COLOR[bug.status] ?? '#444') + '18',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
          }}
        >
          {statusLabel(bug.status)}
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: SEVERITY_COLOR[bug.severity] ?? '#444',
            background: (SEVERITY_COLOR[bug.severity] ?? '#444') + '18',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
          }}
        >
          {bug.severity}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
          {themeLabel(bug.affected_themes)}
        </span>
        {bug.commit_hash && (
          <span style={{ fontSize: '0.7rem', color: '#6366f1', fontFamily: 'monospace' }}>
            {bug.commit_hash}
          </span>
        )}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: '0 0 0.75rem' }}>
        #{bug.id} {bug.title}
      </h3>
      {bug.symptom && (
        <p style={{ fontSize: '0.85rem', color: '#374151', margin: '0 0 0.5rem', lineHeight: 1.6 }}>
          <strong>症状:</strong> {bug.symptom}
        </p>
      )}
      {bug.root_cause && (
        <p style={{ fontSize: '0.85rem', color: '#374151', margin: '0 0 0.5rem', lineHeight: 1.6 }}>
          <strong>原因:</strong> {bug.root_cause}
        </p>
      )}
      {bug.fix && (
        <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>
          <strong>対策:</strong> {bug.fix}
        </p>
      )}
      {bug.tags && (
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
          tags: {bug.tags}
        </p>
      )}
    </article>
  )
}

export default function AdminOperationsPage() {
  const data = loadPlatformExport()

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: 'sans-serif' }}>
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🛠️</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>運用 — 過去トラブル</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" style={{ fontSize: '0.85rem', color: '#888', textDecoration: 'none' }}>
            ← 管理画面
          </Link>
          <Link href="/" style={{ fontSize: '0.85rem', color: '#888', textDecoration: 'none' }}>
            サイトに戻る
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          SQLite <code style={{ background: '#f3f4f6', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>data/platform.db</code>{' '}
          のバグ台帳をエクスポートした一覧です。エージェントは修正前にここを参照してください。
          {data.exported_at && (
            <span style={{ display: 'block', marginTop: '0.35rem' }}>
              最終エクスポート: {data.exported_at}
            </span>
          )}
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: '1rem' }}>
            バグ・インシデント ({data.bugs.length}件)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.bugs.map((bug) => (
              <BugCard key={bug.id} bug={bug} />
            ))}
            {data.bugs.length === 0 && (
              <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                データがありません。{' '}
                <code>python3 platform_meta/seed.py</code> を実行してください。
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111', marginBottom: '1rem' }}>
            変更履歴 ({data.changelog.length}件)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.changelog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: '#fff',
                  borderRadius: '0.5rem',
                  padding: '0.875rem 1rem',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{entry.entry_date}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#6366f1',
                      background: '#eef2ff',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '0.25rem',
                    }}
                  >
                    {entry.category}
                  </span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111', margin: 0 }}>
                  {entry.title}
                </p>
                {entry.body && (
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                    {entry.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd',
            fontSize: '0.82rem',
            color: '#0369a1',
            lineHeight: 1.6,
          }}
        >
          <strong>エージェント向け登録:</strong>{' '}
          <code>python3 platform_meta/seed.py --register-bug --title &quot;...&quot; ...</code>
          <br />
          詳細は <code>.cursor/rules/bug-registration.mdc</code> と <code>doc/AGENT_SPEC.md</code>
        </section>
      </div>
    </div>
  )
}
