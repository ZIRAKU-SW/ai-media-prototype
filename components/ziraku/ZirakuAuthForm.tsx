'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useZirakuUser } from '@/components/ziraku/useZirakuUser'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import ZirakuLogoMark from '@/components/ziraku/ZirakuLogoMark'

const BENEFITS = [
  '会員限定記事が読み放題',
  'AI活用チェックリストをプレゼント',
  '便利なプロンプト集を無料配布',
  'セミナー・イベントに優先ご招待',
]

function translateError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'メールアドレスまたはパスワードが違います'
  if (/already registered/i.test(message)) return 'このメールアドレスは既に登録されています'
  if (/rate limit/i.test(message)) return '試行回数が多すぎます。しばらく待ってからお試しください'
  if (/valid email/i.test(message)) return 'メールアドレスの形式が正しくありません'
  return `エラーが発生しました（${message}）`
}

export default function ZirakuAuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [interest, setInterest] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const isLogin = mode === 'login'
  const { user, ready } = useZirakuUser()

  useEffect(() => {
    if (ready && user) router.replace('/ziraku/members')
  }, [ready, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!isLogin && password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    setBusy(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(translateError(error.message)); return }
        router.push('/ziraku/members')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              company_name: companyName,
              company_size: companySize,
              job_role: jobRole,
              interest,
            },
          },
        })
        if (error) { setError(translateError(error.message)); return }
        if (data.session) {
          router.push('/ziraku/members')
        } else {
          setNotice('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ZirakuSiteHeader />
      <main className="auth">
        <div className="auth__card">
          <div className="auth__brand">
            <ZirakuLogoMark size={40} />
            <span className="auth__brand-name">AIビジネスメディア</span>
          </div>
          <h1 className="auth__title">{isLogin ? 'ログイン' : '会員登録（無料）'}</h1>
          <p className="auth__lead">
            {isLogin
              ? '登録済みのメールアドレスとパスワードを入力してください。'
              : '登録は1分で完了します。'}
          </p>

          {!isLogin && (
            <ul className="auth__benefits">
              {BENEFITS.map(b => (
                <li key={b}><span className="auth__check" aria-hidden>✓</span>{b}</li>
              ))}
            </ul>
          )}

          {notice ? (
            <p className="auth__notice">📧 {notice}</p>
          ) : (
            <form onSubmit={handleSubmit} className="auth__form">
              <label className="auth__label">
                メールアドレス
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="auth__label">
                パスワード{!isLogin && <span className="auth__hint">（8文字以上）</span>}
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={isLogin ? undefined : 8}
                  required
                />
              </label>
              {!isLogin && (
                <>
                  <label className="auth__label">
                    お名前
                    <input type="text" className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="山田 太郎" required />
                  </label>
                  <label className="auth__label">
                    会社名 <span className="auth__hint">（任意）</span>
                    <input type="text" className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="株式会社○○" />
                  </label>
                  <div className="auth__row">
                    <label className="auth__label">
                      会社規模
                      <select className="input" value={companySize} onChange={e => setCompanySize(e.target.value)} required>
                        <option value="">選択してください</option>
                        <option value="個人">個人</option>
                        <option value="2-10名">2〜10名</option>
                        <option value="11-50名">11〜50名</option>
                        <option value="51-300名">51〜300名</option>
                        <option value="301名以上">301名以上</option>
                      </select>
                    </label>
                    <label className="auth__label">
                      ご役職
                      <select className="input" value={jobRole} onChange={e => setJobRole(e.target.value)} required>
                        <option value="">選択してください</option>
                        <option value="経営者・役員">経営者・役員</option>
                        <option value="部門責任者">部門責任者</option>
                        <option value="会社員">会社員</option>
                        <option value="個人事業主・フリーランス">個人事業主・フリーランス</option>
                        <option value="その他">その他</option>
                      </select>
                    </label>
                  </div>
                  <label className="auth__label">
                    主なご関心
                    <select className="input" value={interest} onChange={e => setInterest(e.target.value)} required>
                      <option value="">選択してください</option>
                      <option value="ai-adoption">自社業務へのAI導入・DX</option>
                      <option value="dev-partner">システム/AI開発のパートナー探し</option>
                      <option value="learning">情報収集・学習</option>
                      <option value="side-business">発信・副業・起業</option>
                    </select>
                  </label>
                </>
              )}
              {error && <p className="auth__error" role="alert">⚠ {error}</p>}
              <button type="submit" className="btn btn--primary btn--lg btn--pill btn--block" disabled={busy}>
                {busy ? '処理中...' : isLogin ? 'ログイン' : '無料で会員登録する'}
              </button>
            </form>
          )}

          <p className="auth__switch">
            {isLogin ? (
              <>アカウントをお持ちでない方は <Link href="/ziraku/signup">会員登録（無料）→</Link></>
            ) : (
              <>すでにアカウントをお持ちの方は <Link href="/ziraku/login">ログイン →</Link></>
            )}
          </p>
          <p className="auth__back"><Link href="/ziraku">← トップに戻る</Link></p>
        </div>
      </main>
      <ZirakuFooter />
    </>
  )
}
