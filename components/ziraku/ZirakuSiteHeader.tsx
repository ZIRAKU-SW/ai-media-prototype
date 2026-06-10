import SiteHeader from '@/components/SiteHeader'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

const NAV = [
  { label: '記事を探す ▾', href: '/ziraku' },
  { label: 'カテゴリー ▾', href: '/ziraku#categories' },
  { label: '導入事例', href: '/ziraku#articles' },
  { label: 'セミナー', href: '/ziraku' },
  { label: '会社情報', href: '/ziraku#about' },
]

const LOGO = (
  <>
    <div className="logo__icon logo__icon--network" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5" r="2.5" fill="#fff" />
        <circle cx="6" cy="14" r="2.5" fill="#fff" />
        <circle cx="18" cy="14" r="2.5" fill="#fff" />
        <circle cx="12" cy="19" r="2.5" fill="#fff" />
        <path d="M12 7.5v3M8.5 12.5L10 14M15.5 12.5L14 14M12 16v2.5" stroke="#fff" strokeWidth="1.2" />
      </svg>
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
