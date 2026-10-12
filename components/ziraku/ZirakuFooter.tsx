import Link from 'next/link'
import ZirakuLogoMark from '@/components/ziraku/ZirakuLogoMark'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

export default function ZirakuFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <div className="logo__mark" aria-hidden>
              <ZirakuLogoMark size={28} mono />
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
            <Link href="/category/ai-guide">AI活用ガイド</Link>
            <Link href="/category/dx-improvement">DX・業務改善</Link>
            <Link href="/category/lab">実験室</Link>
            <Link href="/category/tools">ツール比較</Link>
          </div>
          <div>
            <strong>サービス</strong>
            <Link href="/services">システム開発</Link>
            <Link href="/services">DX支援</Link>
            <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">無料相談</a>
          </div>
          <div>
            <strong>その他</strong>
            <Link href="/company">会社情報</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
            <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">お問い合わせ</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom"><p>© 2026 AIビジネスメディア / ZIRAKU Inc.</p></div>
    </footer>
  )
}
