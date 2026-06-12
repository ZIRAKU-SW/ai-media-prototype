'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ZirakuSiteHeader from '@/components/ziraku/ZirakuSiteHeader'
import ZirakuFooter from '@/components/ziraku/ZirakuFooter'
import { useZirakuUser } from '@/components/ziraku/useZirakuUser'
import { supabase, type Article } from '@/lib/supabase'
import { IconClipboard, IconDocument, IconLock, IconCalendar, IconCheck, IconSettings, IconChat, IconArrowRight } from '@/components/ziraku/ZirakuIcons'

const CHECKLIST = [
  '社内の定型文書（議事録・報告書・メール）のどれかをAIで下書きしている',
  'ChatGPT / Claude などのAIツールを週3回以上業務で使っている',
  'AIに渡してはいけない情報（顧客個人情報など）のルールを決めている',
  '繰り返し使う指示文（プロンプト）をチームで共有している',
  '会議の音声やメモから議事録をAIで生成したことがある',
  '営業メール・提案書の作成にAIを使ったことがある',
  'ExcelやスプレッドシートのデータをAIに分析させたことがある',
  '自社の業務マニュアルやFAQをAIに読み込ませて活用している',
  'AIで効率化できそうな業務の棚卸しをしたことがある',
  '月1回以上、新しいAIツールや機能を試している',
]

const PROMPTS = [
  {
    title: '新規営業メールの下書き',
    body: 'あなたはBtoB営業のプロです。以下の条件で新規開拓メールを書いてください。\n・宛先: ［業種］の［役職］\n・自社サービス: ［サービス概要］\n・目的: 30分のオンライン面談の打診\n・条件: 件名は30文字以内で具体的なメリットを入れる。本文は300字以内。売り込み感を抑え、相手の課題への共感から入る。',
  },
  {
    title: '商談後のフォローアップメール',
    body: '以下の商談メモをもとに、お礼と次のアクションを明確にしたフォローアップメールを書いてください。\n・商談メモ: ［メモを貼り付け］\n・条件: 冒頭で具体的な話題に触れて感謝を伝える。決定事項と宿題を箇条書きで整理。次回日程の候補を2つ提示。',
  },
  {
    title: '議事録の要約・整形',
    body: '以下の会議メモを議事録に整形してください。\n・フォーマット: ①決定事項 ②宿題（担当者・期限つき） ③持ち越し論点 の3部構成\n・条件: 発言の引用ではなく結論ベースで。宿題は「誰が・何を・いつまでに」を必ず明記。\n・メモ: ［貼り付け］',
  },
  {
    title: '提案書の構成案づくり',
    body: '［顧客の業種・課題］向けに［自社サービス］を提案します。提案書の構成案を作ってください。\n・条件: 表紙含め10ページ以内。「現状課題→放置リスク→解決後の姿→提案内容→費用対効果→スケジュール」の流れ。各ページに入れるべき要素を箇条書きで。',
  },
  {
    title: '想定問答集（FAQ）の作成',
    body: '次の提案に対して、顧客の決裁者が聞きそうな質問を10個挙げ、それぞれに簡潔な回答案を作ってください。\n・提案内容: ［概要を貼り付け］\n・条件: 価格・導入工数・セキュリティ・既存業務への影響・失敗時のリスクの観点を必ず含める。',
  },
  {
    title: 'SNS告知文の作成',
    body: '以下の記事（またはお知らせ）をX向けに告知する投稿文を3パターン作ってください。\n・内容: ［URL または概要］\n・条件: 各140字以内。1つ目は実利訴求、2つ目は疑問形の引き、3つ目は数字を使ったインパクト重視。ハッシュタグは2個まで。',
  },
]

const MEMBER_BENEFITS = [
  { icon: IconClipboard, no: '01', title: 'AI活用チェックリスト', desc: '自社のAI活用レベルを10項目で診断', href: '#checklist', ready: true },
  { icon: IconDocument, no: '02', title: '営業効率化プロンプト集', desc: 'コピペで使える実務プロンプト6本', href: '#prompts', ready: true },
  { icon: IconLock, no: '03', title: '会員限定記事', desc: '深掘り解説・実装ノウハウ', href: '#exclusive', ready: true },
  { icon: IconCalendar, no: '04', title: 'セミナー優先案内', desc: '開催決定時に優先的にご案内', href: '#seminar', ready: false },
]

function PromptCard({ title, body }: { title: string; body: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }
  return (
    <div className="members-prompt">
      <div className="members-prompt__head">
        <h3 className="members-prompt__title">{title}</h3>
        <button type="button" className="btn btn--outline members-prompt__copy" onClick={copy}>
          {copied ? '✓ コピーしました' : 'コピー'}
        </button>
      </div>
      <pre className="members-prompt__body">{body}</pre>
    </div>
  )
}

export default function ZirakuMembersContent() {
  const { user, ready, displayName } = useZirakuUser()
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST.map(() => false))
  const [memberArticles, setMemberArticles] = useState<Article[]>([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('articles')
      .select('*, categories(name, slug, color)')
      .eq('is_published', true)
      .eq('is_members_only', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => setMemberArticles((data as Article[]) ?? []))
  }, [user])
  const score = checked.filter(Boolean).length

  const scoreComment =
    score >= 8 ? '素晴らしい活用度です。次は業務フロー全体の自動化・内製化を検討するフェーズです。'
    : score >= 5 ? '基礎はできています。「個人の効率化」から「チームの仕組み化」へ進みましょう。'
    : score >= 2 ? '伸びしろ大です。まずは議事録・メールなど毎日の定型業務から始めるのが近道です。'
    : 'これからが楽しみな状態です。当サイトのAI活用ガイドの記事から、できそうなものを1つ試してみてください。'

  if (!ready) {
    return (
      <>
        <ZirakuSiteHeader />
        <main className="members"><p className="members__loading">読み込み中...</p></main>
        <ZirakuFooter />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <ZirakuSiteHeader />
        <main className="members">
          <div className="members__gate">
            <div className="members__gate-icon"><IconLock size={34} /></div>
            <h1 className="members__gate-title">会員限定エリア</h1>
            <p className="members__gate-desc">
              このページの閲覧には会員登録（無料）が必要です。
              チェックリスト・プロンプト集などの特典をご利用いただけます。
            </p>
            <div className="members__gate-actions">
              <Link href="/ziraku/signup" className="btn btn--primary btn--lg btn--pill">無料で会員登録する</Link>
              <Link href="/ziraku/login" className="btn btn--outline btn--lg btn--pill">ログイン</Link>
            </div>
          </div>
        </main>
        <ZirakuFooter />
      </>
    )
  }

  return (
    <>
      <ZirakuSiteHeader />
      <main className="members">
        <header className="members__hero corp-hero">
          <div className="corp-hero__row">
            <div>
              <p className="corp-eyebrow">MEMBERS LOUNGE</p>
              <h1 className="members__title">会員限定コンテンツ</h1>
              <p className="members__lead">ようこそ、{displayName} 様。以下の特典をご利用いただけます。</p>
            </div>
            <Link href="/ziraku/settings" className="btn btn--ghost btn--pill members__settings-link">
              <IconSettings size={16} /> アカウント設定
            </Link>
          </div>
          <div className="members__nav">
            {MEMBER_BENEFITS.map(b => (
              <a key={b.title} href={b.href} className={`members__nav-card${b.ready ? '' : ' members__nav-card--soon'}`}>
                <span className="members__nav-no">{b.no}</span>
                <span className="members__nav-icon"><b.icon size={24} /></span>
                <span className="members__nav-title">{b.title}{!b.ready && <em className="members__soon">準備中</em>}</span>
                <span className="members__nav-desc">{b.desc}</span>
              </a>
            ))}
          </div>
        </header>

        <section className="members__section" id="checklist">
          <h2 className="members__section-title"><IconClipboard className="section-icon" />AI活用チェックリスト</h2>
          <p className="members__section-lead">当てはまるものにチェックを入れると、自社のAI活用レベルを診断できます。</p>
          <ul className="members-checklist">
            {CHECKLIST.map((item, i) => (
              <li key={item}>
                <label className="members-checklist__item">
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={() => setChecked(c => c.map((v, j) => (j === i ? !v : v)))}
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="members-checklist__result">
            <strong>診断結果: {score} / {CHECKLIST.length}</strong>
            <p>{scoreComment}</p>
          </div>
        </section>

        <section className="members__section" id="prompts">
          <h2 className="members__section-title"><IconDocument className="section-icon" />営業効率化プロンプト集</h2>
          <p className="members__section-lead">［　］の部分を自社の情報に置き換えて、そのままAIに貼り付けて使えます。</p>
          <div className="members__prompts">
            {PROMPTS.map(p => <PromptCard key={p.title} {...p} />)}
          </div>
        </section>

        <section className="members__section" id="exclusive">
          <h2 className="members__section-title"><IconLock className="section-icon" />会員限定記事</h2>
          <p className="members__section-lead">編集部の深掘り解説つき。会員の方だけが読める記事です。</p>
          {memberArticles.length === 0 ? (
            <p className="members__section-lead">読み込み中...</p>
          ) : (
            <div className="members__articles">
              {memberArticles.map(a => (
                <Link key={a.id} href={`/ziraku/articles/${a.slug}`} className="members__article-card">
                  <img src={a.thumbnail_url ?? ''} alt="" className="members__article-thumb" />
                  <span className="members__article-body">
                    <strong className="members__article-title"><IconLock size={14} className="title-lock" /> {a.title}</strong>
                    <span className="members__article-excerpt">{a.excerpt}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="members__section members__section--soon" id="seminar">
          <h2 className="members__section-title"><IconCalendar className="section-icon" />セミナー・イベント優先案内</h2>
          <p className="members__section-lead">
            セミナー開催が決まり次第、会員の皆さまへ優先的にご案内します。
            開催情報は<Link href="/ziraku/seminar" className="members__inline-link">セミナーページ</Link>でもお知らせします。
          </p>
        </section>

        <section className="corp-cta">
          <div className="corp-cta__body">
            <p className="corp-eyebrow corp-eyebrow--light">WORK WITH US</p>
            <h2 className="corp-cta__title">記事の内容を、自社の業務で実現しませんか</h2>
            <p className="corp-cta__desc">
              当メディアで紹介している自動化・AI導入は、運営元の株式会社ZIRAKUが実際に設計・開発しているものです。
              業務自動化、AIエージェント開発、システム内製化のご相談を無料で承っています。
            </p>
          </div>
          <div className="corp-cta__actions">
            <a href="https://www.ziraku.co.jp/contact" target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--lg btn--pill">
              <IconChat size={16} /> 無料で相談する
            </a>
            <Link href="/ziraku/company" className="btn btn--outline btn--lg btn--pill corp-cta__sub">
              運営会社について <IconArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <ZirakuFooter />
    </>
  )
}
