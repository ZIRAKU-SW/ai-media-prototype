import type { Article } from '@/lib/supabase'

export type TopContentProps = {
  articles: Article[]
  email: string
  setEmail: (v: string) => void
  subscribed: boolean
  handleNewsletter: (e: React.FormEvent) => void
}
