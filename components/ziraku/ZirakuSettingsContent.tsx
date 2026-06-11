'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { useZirakuUser } from '@/components/ziraku/useZirakuUser'
import { supabase } from '@/lib/supabase'
import { IconUser, IconLock, IconBuilding } from '@/components/ziraku/ZirakuIcons'

const SIZES = ['個人', '2-10名', '11-50名', '51-300名', '301名以上']
const ROLES = ['経営者・役員', '部門責任者', '会社員', '個人事業主・フリーランス', 'その他']
const INTERESTS = [
  { value: 'ai-adoption', label: '自社業務へのAI導入・DX' },
  { value: 'dev-partner', label: 'システム/AI開発のパートナー探し' },
  { value: 'learning', label: '情報収集・学習' },
  { value: 'side-business', label: '発信・副業・起業' },
]

export default function ZirakuSettingsContent() {
  const { user, ready } = useZirakuUser()
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [interest, setInterest] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (!data) return
      setDisplayName(data.display_name ?? '')
      setCompanyName(data.company_name ?? '')
      setCompanySize(data.company_size ?? '')
      setJobRole(data.job_role ?? '')
      setInterest(data.interest ?? '')
    })
  }, [user])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setBusy(true); setProfileMsg('')
    const { error } = await supabase.from('profiles').update({
      display_name: displayName, company_name: companyName,
      company_size: companySize, job_role: jobRole, interest,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    setProfileMsg(error ? `保存に失敗しました（${error.message}）` : '保存しました')
    setBusy(false)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) { setPasswordMsg('パスワードは8文字以上で設定してください'); return }
    setBusy(true); setPasswordMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordMsg(error ? `変更に失敗しました（${error.message}）` : 'パスワードを変更しました')
    if (!error) setNewPassword('')
    setBusy(false)
  }

  if (!ready) {
    return (<><ZirakuSiteHeader /><main className="members"><p className="members__loading">読み込み中...</p></main><ZirakuFooter /></>)
  }

  if (!user) {
    return (
      <>
        <ZirakuSiteHeader />
        <main className="members">
          <div className="members__gate">
            <h1 className="members__gate-title">アカウント設定</h1>
            <p className="members__gate-desc">設定の変更にはログインが必要です。</p>
            <div className="members__gate-actions">
              <Link href="/ziraku/login" className="btn btn--primary btn--lg btn--pill">ログイン</Link>
            </div>
          </div>
        </main>
        <ZirakuFooter />
      </>
    )
  }

  return (
    <>
      <ZirakuSiteHeader />
      <main className="members settings">
        <header className="settings__head">
          <p className="corp-eyebrow">ACCOUNT</p>
          <h1 className="members__title">アカウント設定</h1>
          <p className="members__lead">{user.email}</p>
        </header>

        <section className="members__section">
          <h2 className="members__section-title"><IconUser className="section-icon" />プロフィール</h2>
          <form onSubmit={saveProfile} className="auth__form">
            <label className="auth__label">お名前
              <input type="text" className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </label>
            <label className="auth__label">会社名
              <input type="text" className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </label>
            <div className="auth__row">
              <label className="auth__label">会社規模
                <select className="input" value={companySize} onChange={e => setCompanySize(e.target.value)}>
                  <option value="">未設定</option>
                  {SIZES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
              <label className="auth__label">ご役職
                <select className="input" value={jobRole} onChange={e => setJobRole(e.target.value)}>
                  <option value="">未設定</option>
                  {ROLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
            </div>
            <label className="auth__label">主なご関心
              <select className="input" value={interest} onChange={e => setInterest(e.target.value)}>
                <option value="">未設定</option>
                {INTERESTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            {profileMsg && <p className={profileMsg.includes('失敗') ? 'auth__error' : 'auth__notice'}>{profileMsg}</p>}
            <button type="submit" className="btn btn--primary btn--pill" disabled={busy}>プロフィールを保存</button>
          </form>
        </section>

        <section className="members__section">
          <h2 className="members__section-title"><IconLock className="section-icon" />パスワード変更</h2>
          <form onSubmit={changePassword} className="auth__form">
            <label className="auth__label">新しいパスワード <span className="auth__hint">（8文字以上）</span>
              <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
            </label>
            {passwordMsg && <p className={passwordMsg.includes('失敗') || passwordMsg.includes('8文字') ? 'auth__error' : 'auth__notice'}>{passwordMsg}</p>}
            <button type="submit" className="btn btn--outline btn--pill" disabled={busy}>パスワードを変更</button>
          </form>
        </section>

        <section className="members__section members__section--soon">
          <h2 className="members__section-title"><IconBuilding className="section-icon" />ご相談・お問い合わせ</h2>
          <p className="members__section-lead">
            システム開発・AI導入・DX支援のご相談は<a href="https://www.ziraku.co.jp/contact" target="_blank" rel="noopener noreferrer" className="members__inline-link">こちら（無料）</a>から。
          </p>
        </section>

        <p className="auth__back"><Link href="/ziraku/members">← 会員限定コンテンツに戻る</Link></p>
      </main>
      <ZirakuFooter />
    </>
  )
}
