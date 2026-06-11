import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { ZIRAKU_COMPANY, ZIRAKU_CONTACT_URL, ZIRAKU_SOURCE_URL } from '@/lib/company-data'
import {
  IconCode, IconChip, IconLayers, IconSearchDoc, IconRocket, IconChat, IconArrowRight, IconCheck,
} from '@/components/ziraku/ZirakuIcons'

const SERVICES = [
  { icon: IconChip, title: 'AIプロダクト開発', desc: 'AIエージェント・チャットボット・業務AIツールの設計から実装まで。当メディアで紹介する自動化を、実際に作る側として提供します。', href: 'https://www.ziraku.co.jp/service/ai' },
  { icon: IconCode, title: 'システム開発', desc: '業務システム・Webサービス・SaaSの受託開発。企画段階からの伴走で「作って終わり」にしない開発を行います。', href: 'https://www.ziraku.co.jp/service/system-development' },
  { icon: IconLayers, title: 'EC・ホームページ制作', desc: 'コーポレートサイト・ECサイトの制作。デザインから実装、公開後の改善まで一気通貫で対応します。', href: 'https://www.ziraku.co.jp/service/web' },
  { icon: IconSearchDoc, title: '補助金リサーチ', desc: 'IT導入・DX関連の補助金活用を調査・支援。開発投資のハードルを下げる選択肢をご提案します。', href: 'https://www.ziraku.co.jp/service/subsidy' },
]

const STRENGTHS = [
  { title: '「紹介する」ではなく「作って見せる」', desc: '当メディアの実験・検証記事は、実際に開発できるチームが手を動かした一次情報です。動くものでご説明します。' },
  { title: '企画からマーケティングまで伴走', desc: '要件定義の前段階、「何を作るべきか」の整理からご一緒します。制作後の運用・改善まで密に支援します。' },
  { title: '金融×エンジニアリングの視点', desc: '代表は銀行法人営業出身のエンジニア。事業数値とシステムの両面から、投資対効果の見える開発をご提案します。' },
]

export default function ZirakuCompanyContent() {
  const c = ZIRAKU_COMPANY
  return (
    <>
      <ZirakuSiteHeader />
      <main className="corp">

        <section className="corp-head">
          <div className="corp-head__inner">
            <p className="corp-eyebrow corp-eyebrow--light">COMPANY</p>
            <h1 className="corp-head__title">{c.mission}</h1>
            <p className="corp-head__sub">{c.vision}</p>
            <p className="corp-head__note">
              AIビジネスメディアは、{c.legalName}が運営するAI活用・DX情報メディアです。
            </p>
          </div>
        </section>

        <section className="corp-section">
          <div className="corp-section__head">
            <p className="corp-eyebrow">MESSAGE</p>
            <h2 className="corp-section__title">{c.messageTitle}</h2>
          </div>
          <div className="corp-message">
            {c.message.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="corp-ceo">
            <div className="corp-ceo__head">
              <span className="corp-ceo__title">{c.ceo.title}</span>
              <span className="corp-ceo__name">{c.ceo.name}<small>{c.ceo.nameEn}</small></span>
            </div>
            <p className="corp-ceo__profile">{c.ceo.profile}</p>
          </div>
        </section>

        <section className="corp-section corp-section--alt">
          <div className="corp-section__head">
            <p className="corp-eyebrow">SERVICES</p>
            <h2 className="corp-section__title">事業内容</h2>
            <p className="corp-section__lead">メディアで発信している活用術を、実装する側として提供しています。</p>
          </div>
          <div className="corp-services">
            {SERVICES.map(sv => (
              <a key={sv.title} href={sv.href} target="_blank" rel="noopener noreferrer" className="corp-service">
                <span className="corp-service__icon"><sv.icon size={26} /></span>
                <span className="corp-service__title">{sv.title}</span>
                <span className="corp-service__desc">{sv.desc}</span>
                <span className="corp-service__more">詳しく見る <IconArrowRight size={13} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="corp-section">
          <div className="corp-section__head">
            <p className="corp-eyebrow">WHY ZIRAKU</p>
            <h2 className="corp-section__title">選ばれる理由</h2>
          </div>
          <div className="corp-strengths">
            {STRENGTHS.map((st, i) => (
              <div key={st.title} className="corp-strength">
                <span className="corp-strength__no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="corp-strength__title">{st.title}</h3>
                  <p className="corp-strength__desc">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="corp-section corp-section--alt">
          <div className="corp-section__head">
            <p className="corp-eyebrow">OVERVIEW</p>
            <h2 className="corp-section__title">会社概要</h2>
          </div>
          <table className="corp-table">
            <tbody>
              {c.overview.map(row => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  <td>
                    {row.label === '所在地' ? (
                      <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="corp-table__link">{row.value}</a>
                    ) : row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="corp-source">
            出典: <a href={ZIRAKU_SOURCE_URL} target="_blank" rel="noopener noreferrer">{ZIRAKU_SOURCE_URL}</a>
          </p>
        </section>

        <section className="corp-section">
          <div className="corp-section__head">
            <p className="corp-eyebrow">MEDIA</p>
            <h2 className="corp-section__title">このメディアについて</h2>
          </div>
          <ul className="corp-media-points">
            <li><IconCheck size={16} className="corp-check" />中小企業・1人社長向けに、実務で使えるAI活用術とDX事例を毎日発信</li>
            <li><IconCheck size={16} className="corp-check" />実験・検証記事は、実際に開発できるチームによる一次情報</li>
            <li><IconCheck size={16} className="corp-check" />記事のテーマは、そのまま開発・導入のご相談を承れる領域</li>
          </ul>
        </section>

        <section className="corp-cta corp-cta--page">
          <div className="corp-cta__body">
            <p className="corp-eyebrow corp-eyebrow--light">CONTACT</p>
            <h2 className="corp-cta__title">AI導入・システム開発のご相談</h2>
            <p className="corp-cta__desc">
              「何から始めればいいか分からない」段階のご相談も歓迎です。
              課題の整理からご一緒します。
            </p>
          </div>
          <div className="corp-cta__actions">
            <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--lg btn--pill">
              <IconChat size={16} /> 無料で相談する
            </a>
            <Link href="/ziraku/articles" className="btn btn--outline btn--lg btn--pill corp-cta__sub">
              記事を読む <IconArrowRight size={14} />
            </Link>
          </div>
        </section>

      </main>
      <ZirakuFooter />
    </>
  )
}
