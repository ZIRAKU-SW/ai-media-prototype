import type { Metadata } from 'next'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | AIビジネスメディア',
  description: 'AIビジネスメディア（株式会社ZIRAKU運営）の個人情報の取扱い・利用目的・第三者提供・Cookie・お問い合わせ窓口について。',
}

export default function ZirakuPrivacyPage() {
  return (
    <>
      <ZirakuSiteHeader />

      <nav className="article-breadcrumb" aria-label="パンくずリスト">
        <Link href="/ziraku">ホーム</Link>
        <span aria-hidden>›</span>
        <span className="article-breadcrumb__current">プライバシーポリシー</span>
      </nav>

      <main className="legal-page">
        <header className="legal-hero">
          <h1 className="legal-hero__title">プライバシーポリシー</h1>
          <p className="legal-hero__lead">
            AIビジネスメディア（以下「当メディア」）は、株式会社ZIRAKU（以下「当社」）が運営しています。
            当社は、当メディアの利用者の個人情報を以下の方針に基づき適切に取り扱います。
          </p>
        </header>

        <section className="legal-section">
          <h2 className="legal-section__title">1. 個人情報の取得</h2>
          <p>
            当メディアは、ニュースレター登録・お問い合わせ・会員登録などの際に、メールアドレス・氏名・会社名など、
            サービスの提供に必要な範囲で個人情報を取得します。取得にあたっては、適法かつ公正な手段によります。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">2. 利用目的</h2>
          <p>当メディアは、取得した個人情報を以下の目的で利用します。</p>
          <ul className="legal-list">
            <li>ニュースレター・セミナー開催案内など、各種情報の配信のため</li>
            <li>お問い合わせ・ご相談への対応のため</li>
            <li>会員向けコンテンツ・サービスの提供のため</li>
            <li>サービスの改善・新機能の開発・利用状況の分析のため</li>
            <li>法令に基づく対応のため</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">3. 第三者提供</h2>
          <p>
            当メディアは、次のいずれかに該当する場合を除き、あらかじめ利用者の同意を得ることなく、
            個人情報を第三者に提供しません。
          </p>
          <ul className="legal-list">
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護のために必要で、本人の同意取得が困難な場合</li>
            <li>利用目的の達成に必要な範囲で業務委託先に提供する場合（この場合、委託先を適切に監督します）</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">4. Cookie・アクセス解析</h2>
          <p>
            当メディアは、サービス向上やアクセス状況の把握のため、Cookieおよびアクセス解析ツールを利用することがあります。
            これらにより収集される情報には個人を特定する情報は含まれません。ブラウザの設定によりCookieを無効化できますが、
            一部機能がご利用いただけない場合があります。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">5. 個人情報の管理</h2>
          <p>
            当社は、取得した個人情報の漏えい・滅失・毀損を防止するため、必要かつ適切な安全管理措置を講じます。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">6. 開示・訂正・削除</h2>
          <p>
            利用者ご本人から個人情報の開示・訂正・利用停止・削除のご請求があった場合は、ご本人であることを確認のうえ、
            法令に従い速やかに対応します。
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">7. お問い合わせ窓口</h2>
          <p>
            本ポリシーに関するお問い合わせ、個人情報の取扱いに関するご請求は、以下の窓口までご連絡ください。
          </p>
          <p>
            <a href={ZIRAKU_CONTACT_URL} target="_blank" rel="noopener noreferrer">
              株式会社ZIRAKU お問い合わせフォーム →
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section__title">8. 改定</h2>
          <p>
            当社は、法令の変更やサービス内容の変更に応じて、本ポリシーを改定することがあります。
            重要な変更がある場合は、当メディア上でお知らせします。
          </p>
        </section>

        <p className="legal-updated">制定日：2026年6月11日</p>
      </main>

      <ZirakuFooter />
    </>
  )
}
