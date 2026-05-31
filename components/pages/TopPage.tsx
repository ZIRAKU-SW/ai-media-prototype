'use client'

import { useEffect, useState } from 'react'
import { getArticles, getCategories, subscribeNewsletter, type Article, type Category } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import NewsletterForm from '@/components/NewsletterForm'

type Theme = 'wired' | 'notion' | 'zapier'

const DUMMY_ARTICLES: Article[] = [
  { id:'1', title:'ChatGPT-4oの新機能まとめ｜業務で使える7つの活用例', slug:'chatgpt-4o-business', excerpt:'OpenAIが発表したGPT-4oの最新機能を徹底解説。営業メール作成から資料作りまで、すぐに使える具体的なプロンプト例付きで紹介します。', content:null, thumbnail_url:'https://picsum.photos/seed/tech001/600/340', is_published:true, is_members_only:false, reading_time_minutes:8, view_count:1240, published_at:'2026-05-20', created_at:'2026-05-20', categories:{ name:'AI活用ガイド', slug:'ai-guide', color:'#3B82F6' } },
  { id:'2', title:'中小企業のDXとは？成功するための3つのステップ', slug:'sme-dx-steps', excerpt:'DX推進を検討している中小企業向けに、具体的な始め方とよくある失敗パターンを解説。', content:null, thumbnail_url:'https://picsum.photos/seed/office02/600/340', is_published:true, is_members_only:false, reading_time_minutes:6, view_count:980, published_at:'2026-05-19', created_at:'2026-05-19', categories:{ name:'DX・業務改善', slug:'dx-improvement', color:'#10B981' } },
  { id:'3', title:'Notion AIの使い方完全ガイド｜議事録作成を10倍効率化', slug:'notion-ai-guide', excerpt:'Notion AIを使って議事録・報告書・企画書の作成を劇的に効率化する方法を解説。', content:null, thumbnail_url:'https://picsum.photos/seed/desk03/600/340', is_published:true, is_members_only:false, reading_time_minutes:7, view_count:870, published_at:'2026-05-18', created_at:'2026-05-18', categories:{ name:'ツール比較', slug:'tools', color:'#6B7280' } },
  { id:'4', title:'1人社長がAIで月商100万を達成した具体的な方法', slug:'solo-president-ai', excerpt:'少人数でもAIを駆使してマーケ・営業・CS を回した実例。使ったツールとプロンプトを公開。', content:null, thumbnail_url:'https://picsum.photos/seed/startup04/600/340', is_published:true, is_members_only:false, reading_time_minutes:9, view_count:1560, published_at:'2026-05-17', created_at:'2026-05-17', categories:{ name:'1人社長・副業・起業', slug:'solo-business', color:'#8B5CF6' } },
  { id:'5', title:'営業メール作成ツールを30分で作ってみた【実験室】', slug:'lab-sales-email-tool', excerpt:'Claude APIを使って営業メール自動生成ツールを実際に作った記録。コードと使用感を全公開。', content:null, thumbnail_url:'https://picsum.photos/seed/code05/600/340', is_published:true, is_members_only:false, reading_time_minutes:10, view_count:2100, published_at:'2026-05-16', created_at:'2026-05-16', categories:{ name:'実験室・開発ブログ', slug:'lab', color:'#EF4444' } },
  { id:'6', title:'おすすめAIツール30選【2026年最新版】', slug:'ai-tools-2026', excerpt:'業務効率化・コンテンツ作成・データ分析など用途別にAIツールを厳選して紹介。', content:null, thumbnail_url:'https://picsum.photos/seed/tools06/600/340', is_published:true, is_members_only:false, reading_time_minutes:12, view_count:3200, published_at:'2026-05-15', created_at:'2026-05-15', categories:{ name:'ツール比較', slug:'tools', color:'#6B7280' } },
]

const STATS = [
  { num: '82%', label: '小規模企業のAI導入率' },
  { num: '約45%', label: '平均的な生産性向上' },
  { num: '95〜98%', label: 'AIスタック導入でのコスト削減' },
]

const THEME_CONFIG = {
  wired: {
    hero: { bg: '#0d2b6b', text: '#fff', accent: '#4fc3f7', eyebrow: '#4fc3f7' },
    cta: { bg: '#4fc3f7', text: '#0d2b6b' },
    ctaOutline: { border: '#4fc3f7', text: '#4fc3f7' },
  },
  notion: {
    hero: { bg: '#f7f6f3', text: '#37352f', accent: '#2eaadc', eyebrow: '#2eaadc' },
    cta: { bg: '#37352f', text: '#fff' },
    ctaOutline: { border: '#37352f', text: '#37352f' },
  },
  zapier: {
    hero: { bg: '#ff4a00', text: '#fff', accent: '#fff', eyebrow: 'rgba(255,255,255,0.8)' },
    cta: { bg: '#fff', text: '#ff4a00' },
    ctaOutline: { border: 'rgba(255,255,255,0.6)', text: '#fff' },
  },
}

export default function TopPage({ theme }: { theme: Theme }) {
  const [articles, setArticles] = useState<Article[]>(DUMMY_ARTICLES)
  const cfg = THEME_CONFIG[theme]

  useEffect(() => {
    getArticles({ limit: 6 }).then((data) => { if (data.length > 0) setArticles(data) }).catch(() => {})
  }, [])

  return (
    <>
      <Header theme={theme} />

      {/* Hero */}
      <section style={{ background: cfg.hero.bg, padding: '5rem 1.5rem 4rem', color: cfg.hero.text }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: cfg.hero.eyebrow, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '1rem' }}>
            最新のAI活用術とDX事例が毎日わかる
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            AIでビジネスを加速する<br />
            <em style={{ fontStyle: 'normal', color: cfg.hero.accent }}>最前線のメディア</em>
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.85, maxWidth: '600px', marginBottom: '2rem' }}>
            中小企業や1人社長のための、実践的なAI活用術とDX情報を毎日お届け。
            明日から使えるノウハウがここに。
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{ background: cfg.cta.bg, color: cfg.cta.text, border: 'none', borderRadius: '0.5rem', padding: '0.875rem 1.75rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
              会員登録して最新情報を受け取る（無料）
            </button>
            <button style={{ background: 'transparent', color: cfg.ctaOutline.text, border: `2px solid ${cfg.ctaOutline.border}`, borderRadius: '0.5rem', padding: '0.875rem 1.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
              記事を探す →
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: cfg.hero.accent }}>{s.num}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text)' }}>新着記事</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} theme={theme} />
          ))}
        </div>
      </main>

      {/* Newsletter Banner */}
      <NewsletterForm theme={theme} />

      <Footer theme={theme} />
    </>
  )
}
