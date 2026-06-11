'use client'

import { useState } from 'react'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { subscribeNewsletter } from '@/lib/supabase'

export default function ZirakuSeminarContent() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await subscribeNewsletter(email); setSubscribed(true) } catch {}
  }

  return (
    <>
      <ZirakuSiteHeader />

      <nav className="article-breadcrumb" aria-label="パンくずリスト">
        <Link href="/ziraku">ホーム</Link>
        <span aria-hidden>›</span>
        <span className="article-breadcrumb__current">セミナー</span>
      </nav>

      <main className="seminar-page">
        <header className="seminar-hero">
          <div className="seminar-hero__icon">🎤</div>
          <p className="seminar-hero__eyebrow">SEMINAR & EVENT</p>
          <h1 className="seminar-hero__title">セミナー・イベント</h1>
          <p className="seminar-hero__lead">
            AI活用・DX推進をテーマにしたセミナーやオンラインイベントを準備中です。
            現在、開催に向けて企画を進めています。
          </p>
        </header>

        <section className="seminar-status">
          <span className="seminar-status__badge">現在準備中</span>
          <p className="seminar-status__text">
            次回セミナーの開催日程が決まり次第、ニュースレターで開催案内をお届けします。
            実践的なAI活用ノウハウを、ぜひ会場・オンラインで体験してください。
          </p>
        </section>

        <section className="seminar-newsletter" id="newsletter">
          <div className="seminar-newsletter__inner">
            <div className="seminar-newsletter__icon">✉️</div>
            <h2 className="seminar-newsletter__title">セミナー開催案内を受け取る</h2>
            <p className="seminar-newsletter__desc">
              ニュースレターに登録すると、セミナー・イベントの開催案内や最新のAI活用情報を無料でお届けします。
            </p>
            {subscribed ? (
              <p className="sidebar__subscribed">✅ 登録しました！開催案内をお待ちください。</p>
            ) : (
              <form className="newsletter-form newsletter-form--wide" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="メールアドレスを入力"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn--primary btn--lg">無料で登録する</button>
              </form>
            )}
            <p className="form-note">登録無料・いつでも配信停止できます</p>
          </div>
        </section>
      </main>

      <ZirakuFooter />
    </>
  )
}
