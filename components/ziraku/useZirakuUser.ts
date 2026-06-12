'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

/** ziraku テーマ共通のログイン状態フック */
export function useZirakuUser() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [profileName, setProfileName] = useState('')

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

  // 登録済みの表示名を profiles から取得（設定画面での変更を反映するため）
  useEffect(() => {
    if (!user) {
      setProfileName('')
      return
    }
    let cancelled = false
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfileName((data?.display_name ?? '').trim())
      })
    return () => {
      cancelled = true
    }
  }, [user])

  // 表示名の優先順: profiles.display_name → 登録時の user_metadata → メールアドレスの @ 前
  const displayName =
    profileName ||
    ((user?.user_metadata?.display_name as string | undefined)?.trim() ?? '') ||
    (user?.email ?? '').split('@')[0]

  return { user, ready, displayName }
}
