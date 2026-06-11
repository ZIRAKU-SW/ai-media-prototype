import Link from 'next/link'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

export default function ZirakuFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="logo__icon logo__icon--network">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="2.5" fill="#fff" />
                <circle cx="6" cy="14" r="2.5" fill="#fff" />
                <circle cx="18" cy="14" r="2.5" fill="#fff" />
                <circle cx="12" cy="19" r="2.5" fill="#fff" />
              </svg>
            </div>
            <span className="logo__name">AIビジネスメディア</span>
          </div>
          <p>AIを味方に、すべてのビジネスの挑戦の選択肢を増やす。</p>
          <div className="footer__social">
            <a href="#" className="social-btn" aria-label="X">𝕏</a>
            <a href="#" className="social-btn" aria-label="YouTube">▶</a>
            <a href="#" className="social-btn" aria-label="note">n</a>
          </div>
        </div>
        <div className="footer__links">
          <div>
            <strong>コンテンツ</strong>
            <Link href="/ziraku/category/ai-guide">AI活用ガイド</Link>
            <Link href="/ziraku/category/dx-improvement">DX・業務改善</Link>
            <Link href="/ziraku/category/lab">実験室</Link>
            <Link href="/ziraku/category/tools">ツール比較</Link>
          </div>
          <div>
            <strong>サービス</strong>
            <Link href="/ziraku/services">システム開発</Link>
            <Link href="/ziraku/services">DX支援</Link>
            <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">無料相談</a>
          </div>
          <div>
            <strong>その他</strong>
            <Link href="/ziraku/company">会社情報</Link>
            <Link href="/ziraku/privacy">プライバシーポリシー</Link>
            <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">お問い合わせ</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom"><p>© 2026 AIビジネスメディア / ZIRAKU Inc.</p></div>
    </footer>
  )
}
