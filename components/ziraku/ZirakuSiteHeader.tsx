import SiteHeader from '@/components/SiteHeader'
import ZirakuAuthButtons from '@/components/ziraku/ZirakuAuthButtons'
import ZirakuLogoMark from '@/components/ziraku/ZirakuLogoMark'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

const NAV = [
  { label: '記事を探す', href: '/articles' },
  { label: 'カテゴリー ▾', href: '/#categories' },
  { label: 'サービス', href: '/services' },
  { label: 'セミナー', href: '/seminar' },
  { label: '会社情報', href: '/company' },
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
      homeHref="/"
      navItems={NAV}
      signupLabel="会員登録（無料）"
      logo={LOGO}
      authArea={<ZirakuAuthButtons />}
      authAreaMobile={<ZirakuAuthButtons block />}
    />
  )
}

export { ZIRAKU_CONTACT_URL }
