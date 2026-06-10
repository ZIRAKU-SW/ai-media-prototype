import type { SiteTheme } from '@/components/theme/ThemeSiteHeader'

export const ZIRAKU_CONTACT_URL = 'https://www.ziraku.co.jp/contact'

export function themeBase(theme: SiteTheme) {
  return `/${theme}`
}

export function themeCompanyHref(theme: SiteTheme) {
  return `${themeBase(theme)}/company`
}

export type NavLink = { label: string; href: string }

export function themeNavLinks(theme: SiteTheme): NavLink[] {
  const base = themeBase(theme)
  const items: NavLink[] = [
    { label: theme === 'notion' ? '記事を探す ▾' : '記事を探す', href: base },
    { label: theme === 'notion' ? 'カテゴリー ▾' : 'カテゴリー', href: base },
    { label: '導入事例', href: base },
    { label: 'セミナー', href: base },
  ]
  items.push({ label: '会社情報', href: themeCompanyHref(theme) })
  return items
}
