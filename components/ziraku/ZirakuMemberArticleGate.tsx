'use client'

import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'

/** 会員限定記事に未ログインでアクセスしたときのゲート表示 */
export default function ZirakuMemberArticleGate({ title }: { title?: string }) {
  return (
    <>
      <ZirakuSiteHeader />
      <main className="members">
        <div className="members__gate">
          <div className="members__gate-icon" aria-hidden>🔒</div>
          <h1 className="members__gate-title">この記事は会員限定です</h1>
          {title && <p className="members__gate-article">「{title}」</p>}
          <p className="members__gate-desc">
            会員登録（無料）すると、この記事を含む会員限定コンテンツが
            すべてご覧いただけます。登録は1分で完了します。
          </p>
          <div className="members__gate-actions">
            <Link href="/ziraku/signup" className="btn btn--primary btn--lg btn--pill">無料で会員登録する</Link>
            <Link href="/ziraku/login" className="btn btn--outline btn--lg btn--pill">ログイン</Link>
          </div>
          <p className="members__gate-back"><Link href="/ziraku/articles">← 記事一覧に戻る</Link></p>
        </div>
      </main>
      <ZirakuFooter />
    </>
  )
}
