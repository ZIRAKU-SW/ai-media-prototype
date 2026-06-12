'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { IconSettings, IconUser } from '@/components/ziraku/ZirakuIcons'
import { useZirakuUser } from '@/components/ziraku/useZirakuUser'

/** ziraku ヘッダーの認証エリア。未ログイン=ログイン/会員登録、ログイン中=ユーザー表示+ログアウト */
export default function ZirakuAuthButtons({ block = false }: { block?: boolean }) {
  const { user, ready, displayName } = useZirakuUser()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/ziraku')
  }

  const blockCls = block ? ' btn--block' : ''

  if (!ready) {
    // セッション確認中は未ログイン表示と同じ幅のプレースホルダ（ちらつき防止）
    return (
      <>
        <span className={`btn btn--ghost auth-placeholder${blockCls}`} aria-hidden>ログイン</span>
        <span className={`btn btn--primary auth-placeholder${blockCls}`} aria-hidden>会員登録（無料）</span>
      </>
    )
  }

  if (user) {
    return (
      <>
        <Link href="/ziraku/members" className="auth-user" title={user.email ?? ''}>
          <IconUser size={15} className="auth-user__icon" /> {displayName} 様
        </Link>
        <Link href="/ziraku/settings" className={`btn btn--ghost${blockCls}`}>
          <IconSettings size={15} /> 会員情報・設定
        </Link>
        <button type="button" className={`btn btn--ghost${blockCls}`} onClick={handleLogout}>
          ログアウト
        </button>
      </>
    )
  }

  return (
    <>
      <Link href="/ziraku/login" className={`btn btn--ghost${blockCls}`}>ログイン</Link>
      <Link href="/ziraku/signup" className={`btn btn--primary${blockCls}`}>会員登録（無料）</Link>
    </>
  )
}
