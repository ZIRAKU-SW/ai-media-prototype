import type { ReactNode } from 'react'
import SiteHeader from '@/components/SiteHeader'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import { themeNavLinks } from '@/lib/theme-links'

export type SiteTheme = 'wired' | 'notion' | 'zapier' | 'ziraku'

const SIGNUP: Record<SiteTheme, string> = {
  wired: '会員登録（無料）',
  notion: '会員登録（無料）',
  zapier: '無料で始める →',
  ziraku: '会員登録（無料）',
}

function themeLogo(theme: SiteTheme): ReactNode {
  if (theme === 'wired') {
    return (
      <div>
        <div className="logo__name">AIビジネスメディア</div>
        <div className="logo__tagline">AIで、ビジネスはもっと進化する。</div>
      </div>
    )
  }
  if (theme === 'zapier') {
    return (
      <>
        <div className="logo__icon">⚡</div>
        <div className="logo__name">AIビジネスメディア</div>
      </>
    )
  }
  return (
    <>
      <div className="logo__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
}

export default function ThemeSiteHeader({ theme }: { theme: SiteTheme }) {
  if (theme === 'ziraku') {
    return <ZirakuSiteHeader />
  }
  return (
    <SiteHeader
      homeHref={`/${theme}`}
      navItems={themeNavLinks(theme)}
      signupLabel={SIGNUP[theme]}
      logo={themeLogo(theme)}
    />
  )
}

export const THEME_BADGE: Record<SiteTheme, Record<string, string>> = {
  wired: {
    'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green',
    'tools': 'badge--gray', 'solo-business': 'badge--purple',
    'lab': 'badge--purple', 'ai-news': 'badge--blue',
  },
  notion: {
    'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green', 'tools': 'badge--gray',
    'solo-business': 'badge--orange', 'lab': 'badge--purple', 'ai-news': 'badge--blue',
  },
  zapier: {
    'ai-guide': 'badge--orange', 'dx-improvement': 'badge--blue', 'tools': 'badge--purple',
    'solo-business': 'badge--green', 'lab': 'badge--orange', 'ai-news': 'badge--orange',
  },
  ziraku: {
    'ai-guide': 'badge--blue', 'dx-improvement': 'badge--green', 'tools': 'badge--gray',
    'solo-business': 'badge--purple', 'lab': 'badge--purple', 'ai-news': 'badge--blue',
  },
}
