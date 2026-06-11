'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'

export type NavLink = { label: string; href: string }

export type SiteHeaderProps = {
  homeHref: string
  logo: ReactNode
  navItems: NavLink[]
  loginLabel?: string
  signupLabel: string
  /** 指定時、ログイン/会員登録ボタンの代わりに描画（デスクトップ） */
  authArea?: ReactNode
  /** 指定時、モバイルドロワーのボタン群の代わりに描画 */
  authAreaMobile?: ReactNode
}

export default function SiteHeader({
  homeHref,
  logo,
  navItems,
  loginLabel = 'ログイン',
  signupLabel,
  authArea,
  authAreaMobile,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Link href={homeHref} className="logo">
            {logo}
          </Link>
          <nav className="nav nav--desktop" aria-label="メインナビゲーション">
            {navItems.map((n) => (
              <Link key={n.label} href={n.href} className="nav__link">{n.label}</Link>
            ))}
          </nav>
          <div className="header__actions header__actions--desktop">
            <button
              type="button"
              className="header__search-btn"
              aria-label="記事を検索"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </button>
            {authArea ?? (
              <>
                <button type="button" className="btn btn--ghost">{loginLabel}</button>
                <button type="button" className="btn btn--primary">{signupLabel}</button>
              </>
            )}
          </div>
          <div className="header__mobile">
            <button
              type="button"
              className="header__icon-btn"
              aria-label="記事を検索"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </button>
            <button
              type="button"
              className="header__icon-btn"
              aria-label="メニューを開く"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="header__search-bar">
            <input type="search" placeholder="記事を検索..." className="input" autoFocus />
          </div>
        )}
      </header>

      {menuOpen && (
        <>
          <button type="button" className="mobile-overlay" aria-label="メニューを閉じる" onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="ナビゲーションメニュー">
            <div className="mobile-drawer__header">
              <span className="mobile-drawer__title">メニュー</span>
              <button type="button" className="header__icon-btn" aria-label="メニューを閉じる" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="mobile-drawer__nav">
              {navItems.map((n) => (
                <Link key={n.label} href={n.href} className="mobile-drawer__link" onClick={() => setMenuOpen(false)}>{n.label}</Link>
              ))}
            </nav>
            <div className="mobile-drawer__actions">
              {authAreaMobile ?? (
                <>
                  <button type="button" className="btn btn--ghost btn--block">{loginLabel}</button>
                  <button type="button" className="btn btn--primary btn--block">{signupLabel}</button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
