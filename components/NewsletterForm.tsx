'use client'
import { useState } from 'react'
import { subscribeNewsletter } from '@/lib/supabase'

type Theme = 'wired' | 'notion' | 'zapier'

const CONFIG = {
  wired:  { bg: '#0d2b6b', text: '#fff', btnBg: '#4fc3f7', btnText: '#0d2b6b' },
  notion: { bg: '#f7f6f3', text: '#37352f', btnBg: '#37352f', btnText: '#fff' },
  zapier: { bg: '#ff4a00', text: '#fff', btnBg: '#fff', btnText: '#ff4a00' },
}

export default function NewsletterForm({ theme }: { theme: Theme }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const c = CONFIG[theme]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await subscribeNewsletter(email)
      setDone(true)
    } catch {
      alert('登録に失敗しました。既に登録済みの可能性があります。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ background: c.bg, padding: '4rem 1.5rem', textAlign: 'center', color: c.text }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        最新のAI活用情報をメールで受け取る
      </h2>
      <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1rem' }}>
        週1回、最新ニュース・おすすめツール・実務ノウハウをまとめてお届けします。
      </p>
      {done ? (
        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>✅ 登録しました！</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            required
            style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', fontSize: '1rem' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: c.btnBg, color: c.btnText, border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {loading ? '登録中...' : '無料で登録する'}
          </button>
        </form>
      )}
      <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '1rem' }}>いつでも配信停止できます。</p>
    </section>
  )
}
