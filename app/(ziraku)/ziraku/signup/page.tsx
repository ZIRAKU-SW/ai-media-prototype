import type { Metadata } from 'next'
import ZirakuAuthForm from '@/components/ziraku/ZirakuAuthForm'

export const metadata: Metadata = {
  title: '会員登録（無料）｜AIビジネスメディア',
  description: '会員登録すると、会員限定記事・AI活用チェックリスト・プロンプト集・セミナー優先招待などすべての機能が使えます。',
}

export default function ZirakuSignupPage() {
  return <ZirakuAuthForm mode="signup" />
}
