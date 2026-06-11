import Link from 'next/link'
import ThemeSiteHeader, { type SiteTheme } from '@/components/theme/ThemeSiteHeader'
import { ZIRAKU_COMPANY, ZIRAKU_CONTACT_URL, ZIRAKU_SOURCE_URL } from '@/lib/company-data'
import { themeBase } from '@/lib/theme-links'
import ZirakuLogoMark from '@/components/ziraku/ZirakuLogoMark'

export default function CompanyPage({ theme }: { theme: SiteTheme }) {
  const base = themeBase(theme)
  const c = ZIRAKU_COMPANY

  return (
    <div className="company-page">
      <ThemeSiteHeader theme={theme} />

      <nav className="company-breadcrumb" aria-label="パンくずリスト">
        <Link href={base}>ホーム</Link>
        <span aria-hidden>›</span>
        <span>会社情報</span>
      </nav>

      <main className="company-main">
        <header className="company-hero">
          <p className="company-hero__eyebrow">ABOUT — OPERATED BY ZIRAKU</p>
          <h1 className="company-hero__title">会社情報</h1>
          <p className="company-hero__lead">{c.mediaNote}</p>
        </header>

        <section className="company-section" id="mission">
          <p className="company-section__label">01 — MISSION & VISION</p>
          <h2 className="company-section__title">ミッション・ビジョン</h2>
          <div className="company-mv-grid">
            <div className="company-mv-card">
              <p className="company-mv-card__type">MISSION</p>
              <p className="company-mv-card__text">{c.mission}</p>
            </div>
            <div className="company-mv-card">
              <p className="company-mv-card__type">VISION</p>
              <p className="company-mv-card__text">{c.vision}</p>
            </div>
          </div>
        </section>

        <section className="company-section" id="message">
          <p className="company-section__label">02 — MESSAGE</p>
          <h2 className="company-section__title">代表挨拶</h2>
          <div className="company-message">
            <p className="company-message__subtitle">{c.messageTitle}</p>
            <p className="company-message__body">{c.message}</p>
            <div className="company-message__ceo">
              <p className="company-message__ceo-title">{c.ceo.title}</p>
              <p className="company-message__ceo-name">{c.ceo.name}</p>
              <p className="company-message__ceo-en">{c.ceo.nameEn}</p>
              <p className="company-message__profile">{c.ceo.profile}</p>
            </div>
          </div>
        </section>

        <section className="company-section" id="company">
          <p className="company-section__label">03 — COMPANY</p>
          <h2 className="company-section__title">会社概要</h2>
          <table className="company-table">
            <tbody>
              {c.overview.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    {row.label === '所在地' ? (
                      <>
                        {row.value}
                        <br />
                        <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem' }}>
                          Google マップで見る →
                        </a>
                      </>
                    ) : (
                      row.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="company-section" id="services">
          <p className="company-section__label">04 — SERVICE</p>
          <h2 className="company-section__title">事業内容（ZIRAKU）</h2>
          <div className="company-services">
            {c.services.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.name} →
              </a>
            ))}
          </div>
        </section>

        <section className="company-cta">
          <p className="company-cta__text">
            システム開発・AIプロダクト開発・DX支援に関するお問い合わせは、株式会社ZIRAKUまでご連絡ください。
          </p>
          <a href={ZIRAKU_CONTACT_URL} className="btn btn--primary btn--lg" target="_blank" rel="noopener noreferrer">
            お問い合わせ（ZIRAKU公式）
          </a>
        </section>

        <p className="company-source">
          出典:{' '}
          <a href={ZIRAKU_SOURCE_URL} target="_blank" rel="noopener noreferrer">
            ziraku.co.jp/about#company
          </a>
          （2026-06-10 取得）
        </p>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="logo__icon"><ZirakuLogoMark size={20} mono /></div>
              <span className="logo__name">AIビジネスメディア</span>
            </div>
            <p>AIで、ビジネスはもっと進化する。</p>
          </div>
          <div className="footer__links">
            <div>
              <strong>運営</strong>
              <a href={`${base}/company`}>会社情報</a>
              <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">お問い合わせ</a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 AIビジネスメディア / {c.legalName}</p>
        </div>
      </footer>
    </div>
  )
}
