'use client'

import { useEffect, useState } from 'react'
import { getArticles, subscribeNewsletter, type Article } from '@/lib/supabase'
import { DUMMY_ARTICLES } from '@/lib/dummy-articles'
import WiredTopContent from '@/components/top/WiredTopContent'
import NotionTopContent from '@/components/top/NotionTopContent'
import ZapierTopContent from '@/components/top/ZapierTopContent'

export type Theme = 'wired' | 'notion' | 'zapier'

export default function TopPage({ theme }: { theme: Theme }) {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    getArticles({ limit: 6 }).then(d => { if (d.length > 0) setArticles(d) }).catch(() => {})
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await subscribeNewsletter(email); setSubscribed(true) } catch {}
  }

  const props = { articles, email, setEmail, subscribed, handleNewsletter }

  if (theme === 'wired') return <WiredTopContent {...props} />
  if (theme === 'notion') return <NotionTopContent {...props} />
  return <ZapierTopContent {...props} />
}
