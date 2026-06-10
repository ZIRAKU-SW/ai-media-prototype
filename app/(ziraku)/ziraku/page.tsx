'use client'

import { useEffect, useState } from 'react'
import { getArticles, subscribeNewsletter, type Article } from '@/lib/supabase'
import { DUMMY_ARTICLES } from '@/lib/dummy-articles'
import ZirakuTopContent from '@/components/top/ZirakuTopContent'

export default function ZirakuPage() {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    getArticles({ limit: 8 }).then(d => { if (d.length > 0) setArticles(d) }).catch(() => {})
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await subscribeNewsletter(email); setSubscribed(true) } catch {}
  }

  return (
    <ZirakuTopContent
      articles={articles}
      email={email}
      setEmail={setEmail}
      subscribed={subscribed}
      handleNewsletter={handleNewsletter}
    />
  )
}
