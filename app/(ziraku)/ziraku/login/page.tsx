import type { Metadata } from 'next'
import ZirakuAuthForm from '@/components/ziraku/ZirakuAuthForm'

export const metadata: Metadata = {
  title: 'ログイン｜AIビジネスメディア',
  description: 'AIビジネスメディアの会員ログインページです。',
}

export default function ZirakuLoginPage() {
  return <ZirakuAuthForm mode="login" />
}
