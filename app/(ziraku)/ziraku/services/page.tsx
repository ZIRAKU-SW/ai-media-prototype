import type { Metadata } from 'next'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { ZIRAKU_CONTACT_URL } from '@/lib/theme-links'

export const metadata: Metadata = {
  title: 'サービス | AIビジネスメディア',
  description: 'AI/DX導入支援・業務自動化・AIチャットボット・社内ナレッジ検索・SaaS開発・新規事業支援・AI研修。株式会社ZIRAKUが提供するサービス一覧。',
}

const SERVICES = [
  {
    icon: '🤖',
    name: 'AI/DX導入支援',
    desc: '現状業務の棚卸しから、最適なAI・DXツールの選定・導入・定着までを一気通貫で伴走します。何から始めるべきか分からない段階のご相談も歓迎です。',
  },
  {
    icon: '⚙️',
    name: '業務自動化システム開発',
    desc: '繰り返しの手作業や転記業務を、API連携・RPA・スクリプトで自動化。月数十時間の工数削減につながる仕組みを設計・実装します。',
  },
  {
    icon: '💬',
    name: 'AIチャットボット開発',
    desc: '自社データに基づいて回答する社内・顧客向けチャットボットを構築。問い合わせ対応の負荷を下げ、24時間の一次対応を実現します。',
  },
  {
    icon: '🔎',
    name: '社内ナレッジ検索システム開発',
    desc: '社内ドキュメント・マニュアル・議事録を横断検索できるRAG型の検索基盤を構築。「あの資料どこ？」をなくし、情報共有を加速します。',
  },
  {
    icon: '🌐',
    name: 'Webサービス / SaaS開発',
    desc: '企画・設計からフロント・バックエンド・インフラまで、Webサービスやサブスク型SaaSの立ち上げをワンストップで支援します。',
  },
  {
    icon: '🚀',
    name: '新規事業開発支援',
    desc: 'アイデアの壁打ち・MVP開発・検証までを高速に回し、新規事業の立ち上げを技術と事業の両面から伴走します。',
  },
  {
    icon: '🎓',
    name: 'AI活用研修',
    desc: '経営者・現場メンバー向けに、生成AIの実務活用とプロンプト設計を体系的にレクチャー。組織全体のAIリテラシーを底上げします。',
  },
]

export default function ZirakuServicesPage() {
  return (
    <>
      <ZirakuSiteHeader />

      <nav className="article-breadcrumb" aria-label="パンくずリスト">
        <Link href="/ziraku">ホーム</Link>
        <span aria-hidden>›</span>
        <span className="article-breadcrumb__current">サービス</span>
      </nav>

      <main className="services-page">
        <header className="services-hero">
          <p className="services-hero__eyebrow">SERVICE — OPERATED BY ZIRAKU</p>
          <h1 className="services-hero__title">サービス紹介</h1>
          <p className="services-hero__lead">
            AIビジネスメディアを運営する株式会社ZIRAKUは、AI・DXの導入支援からシステム開発・研修まで、
            中小企業・1人社長のビジネスを技術で前に進めるサービスを提供しています。
          </p>
        </header>

        <div className="services-grid">
          {SERVICES.map(s => (
            <article key={s.name} className="service-card">
              <div className="service-card__icon">{s.icon}</div>
              <h2 className="service-card__title">{s.name}</h2>
              <p className="service-card__desc">{s.desc}</p>
              <a
                href={ZIRAKU_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline service-card__cta"
              >
                このサービスを相談する →
              </a>
            </article>
          ))}
        </div>

        <section className="services-cta">
          <p className="services-cta__text">
            「自社の場合はどう進めればいい？」という段階のご相談も歓迎です。
            まずはお気軽にお問い合わせください。
          </p>
          <a
            href={ZIRAKU_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary btn--lg"
          >
            お問い合わせ（ZIRAKU公式）
          </a>
        </section>
      </main>

      <ZirakuFooter />
    </>
  )
}
