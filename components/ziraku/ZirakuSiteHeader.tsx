import SiteHeader from '@/components/SiteHeader'
import ZirakuLogoMark from '@/components/ziraku/ZirakuLogoMark'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

const NAV = [
  { label: '記事を探す', href: '/ziraku/articles' },
  { label: 'カテゴリー ▾', href: '/ziraku#categories' },
  { label: 'サービス', href: '/ziraku/services' },
  { label: 'セミナー', href: '/ziraku/seminar' },
  { label: '会社情報', href: '/ziraku/company' },
]

const LOGO = (
  <>
    <div className="logo__mark" aria-hidden>
      <ZirakuLogoMark size={34} />
    </div>
    <div>
      <div className="logo__name">AIビジネスメディア</div>
      <div className="logo__tagline">AIで、ビジネスはもっと進化する。</div>
    </div>
  </>
)

export default function ZirakuSiteHeader() {
  return (
    <SiteHeader
      homeHref="/ziraku"
      navItems={NAV}
      signupLabel="会員登録（無料）"
      logo={LOGO}
    />
  )
}

export { ZIRAKU_CONTACT_URL }
