'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { ZIRAKU_COMPANY, ZIRAKU_CONTACT_URL, ZIRAKU_SOURCE_URL } from '@/lib/company-data'
import {
  IconCode, IconChip, IconLayers, IconSearchDoc, IconChat, IconArrowRight,
} from '@/components/ziraku/ZirakuIcons'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const KPIS = [
  { num: '2023', label: 'FOUNDED', desc: '設立' },
  { num: '4', label: 'BUSINESS DOMAINS', desc: '事業領域' },
  { num: '30+', label: 'ARTICLES', desc: '運営メディア記事' },
  { num: 'GINZA', label: 'TOKYO', desc: '東京・銀座' },
]

const SERVICES = [
  { icon: IconChip, en: 'AI PRODUCT', title: 'AIプロダクト開発', desc: 'AIエージェント・チャットボット・業務AIツールの設計から実装まで。当メディアで紹介する自動化を、作る側として提供します。', href: 'https://www.ziraku.co.jp/service/ai' },
  { icon: IconCode, en: 'SYSTEM DEV', title: 'システム開発', desc: '業務システム・Webサービス・SaaSの受託開発。企画段階からの伴走で「作って終わり」にしない開発を行います。', href: 'https://www.ziraku.co.jp/service/system-development' },
  { icon: IconLayers, en: 'WEB / EC', title: 'EC・ホームページ制作', desc: 'コーポレートサイト・ECサイトの制作。デザインから実装、公開後の改善まで一気通貫で対応します。', href: 'https://www.ziraku.co.jp/service/web' },
  { icon: IconSearchDoc, en: 'SUBSIDY', title: '補助金リサーチ', desc: 'IT導入・DX関連の補助金活用を調査・支援。開発投資のハードルを下げる選択肢をご提案します。', href: 'https://www.ziraku.co.jp/service/subsidy' },
]

const STRENGTHS = [
  { title: '「紹介する」ではなく「作って見せる」', desc: '当メディアの実験・検証記事は、実際に開発できるチームが手を動かした一次情報です。提案は資料ではなく、動くもので行います。' },
  { title: '企画からマーケティングまで伴走', desc: '要件定義の前段階、「何を作るべきか」の整理からご一緒します。制作後の運用・改善まで密に支援します。' },
  { title: '金融 × エンジニアリングの視点', desc: '代表は銀行法人営業出身のエンジニア。事業数値とシステムの両面から、投資対効果の見える開発をご提案します。' },
]

/** スクロールで .is-visible を付与（CSS でフェードアップ） */
function useReveal() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    root.setAttribute('data-anim', '1')
    const targets = root.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.12 }
    )
    targets.forEach(t => io.observe(t))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function ZirakuCompanyContent() {
  const c = ZIRAKU_COMPANY
  const ref = useReveal()

  return (
    <>
      <ZirakuSiteHeader />
      <main className="c2" ref={ref as React.RefObject<HTMLElement>}>

        {/* HERO */}
        <section className="c2-hero" style={{ backgroundImage: `url(${BASE_PATH}/corp/hero-network.jpg)` }}>
          <div className="c2-hero__veil" />
          <div className="c2-hero__inner">
            <p className="c2-eyebrow reveal">ZIRAKU Inc. — TECHNOLOGY × IMAGINATION</p>
            <h1 className="c2-hero__title reveal">
              人々の挑戦を、<br />自由で楽しくする。
            </h1>
            <p className="c2-hero__sub reveal">{c.vision}</p>
            <p className="c2-hero__note reveal">
              AIビジネスメディアは、{c.legalName}が運営する<br className="c2-sp-br" />AI活用・DX情報メディアです。
            </p>
          </div>
          <div className="c2-kpis reveal">
            {KPIS.map(k => (
              <div key={k.label} className="c2-kpi">
                <span className="c2-kpi__num">{k.num}</span>
                <span className="c2-kpi__label">{k.label}</span>
                <span className="c2-kpi__desc">{k.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* MESSAGE */}
        <section className="c2-section">
          <div className="c2-section__grid">
            <div className="c2-section__side reveal">
              <p className="c2-eyebrow">MESSAGE</p>
              <h2 className="c2-title">{c.messageTitle}</h2>
            </div>
            <div className="c2-section__body">
              <div className="c2-message reveal">
                {c.message.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
              <div className="c2-ceo reveal">
                <div className="c2-ceo__meta">
                  <span className="c2-ceo__role">{c.ceo.title}</span>
                  <span className="c2-ceo__name">{c.ceo.name}</span>
                  <span className="c2-ceo__en">{c.ceo.nameEn}</span>
                </div>
                <p className="c2-ceo__bio">{c.ceo.profile}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="c2-services" style={{ backgroundImage: `url(${BASE_PATH}/corp/circuit.jpg)` }}>
          <div className="c2-services__veil" />
          <div className="c2-services__inner">
            <div className="c2-center reveal">
              <p className="c2-eyebrow">SERVICES</p>
              <h2 className="c2-title">事業内容</h2>
              <p className="c2-lead">メディアで発信している活用術を、実装する側として提供しています。</p>
            </div>
            <div className="c2-services__grid">
              {SERVICES.map(sv => (
                <a key={sv.title} href={sv.href} target="_blank" rel="noopener noreferrer" className="c2-card reveal">
                  <div className="c2-card__top">
                    <span className="c2-card__icon"><sv.icon size={24} /></span>
                    <span className="c2-card__en">{sv.en}</span>
                  </div>
                  <h3 className="c2-card__title">{sv.title}</h3>
                  <p className="c2-card__desc">{sv.desc}</p>
                  <span className="c2-card__more">VIEW MORE <IconArrowRight size={13} /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* STRENGTHS */}
        <section className="c2-section">
          <div className="c2-strengths__grid">
            <div className="c2-strengths__list">
              <div className="reveal">
                <p className="c2-eyebrow">WHY ZIRAKU</p>
                <h2 className="c2-title">選ばれる理由</h2>
              </div>
              {STRENGTHS.map((st, i) => (
                <div key={st.title} className="c2-strength reveal">
                  <span className="c2-strength__no">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="c2-strength__title">{st.title}</h3>
                    <p className="c2-strength__desc">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <figure className="c2-strengths__visual reveal">
              <img src={`${BASE_PATH}/corp/server.jpg`} alt="" loading="lazy" />
              <figcaption>AI AGENT × ENGINEERING</figcaption>
            </figure>
          </div>
        </section>

        {/* MEDIA BAND */}
        <section className="c2-media" style={{ backgroundImage: `url(${BASE_PATH}/corp/code-dark.jpg)` }}>
          <div className="c2-media__veil" />
          <div className="c2-media__inner reveal">
            <p className="c2-eyebrow">MEDIA</p>
            <h2 className="c2-title">このメディアについて</h2>
            <div className="c2-media__points">
              <div className="c2-media__point"><span>01</span>中小企業・1人社長向けに、実務で使えるAI活用術とDX事例を毎日発信</div>
              <div className="c2-media__point"><span>02</span>実験・検証記事は、実際に開発できるチームによる一次情報</div>
              <div className="c2-media__point"><span>03</span>記事のテーマは、そのまま開発・導入のご相談を承れる領域</div>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="c2-section">
          <div className="c2-section__grid">
            <div className="c2-section__side reveal">
              <p className="c2-eyebrow">COMPANY PROFILE</p>
              <h2 className="c2-title">会社概要</h2>
            </div>
            <div className="c2-section__body reveal">
              <dl className="c2-dl">
                {c.overview.map(row => (
                  <div key={row.label} className="c2-dl__row">
                    <dt>{row.label}</dt>
                    <dd>
                      {row.label === '所在地' ? (
                        <a href={c.mapUrl} target="_blank" rel="noopener noreferrer">{row.value}</a>
                      ) : row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="c2-source">
                SOURCE: <a href={ZIRAKU_SOURCE_URL} target="_blank" rel="noopener noreferrer">{ZIRAKU_SOURCE_URL}</a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="c2-cta">
          <div className="c2-cta__panel reveal">
            <p className="c2-eyebrow">CONTACT</p>
            <h2 className="c2-cta__title">AI導入・システム開発のご相談</h2>
            <p className="c2-cta__desc">
              「何から始めればいいか分からない」段階のご相談も歓迎です。課題の整理からご一緒します。
            </p>
            <div className="c2-cta__actions">
              <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="c2-btn c2-btn--primary">
                <IconChat size={16} /> 無料で相談する
              </a>
              <Link href="/ziraku/articles" className="c2-btn c2-btn--ghost">
                記事を読む <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <ZirakuFooter />
    </>
  )
}
