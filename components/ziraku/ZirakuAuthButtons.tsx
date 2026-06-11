'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { IconSettings, IconUser } from '@/components/ziraku/ZirakuIcons'
import type { User } from '@supabase/supabase-js'

/** ziraku ヘッダーの認証エリア。未ログイン=ログイン/会員登録、ログイン中=ユーザー表示+ログアウト */
export default function ZirakuAuthButtons({ block = false }: { block?: boolean }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

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
          <IconUser size={15} className="auth-user__icon" /> {(user.email ?? '').split('@')[0]}
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
