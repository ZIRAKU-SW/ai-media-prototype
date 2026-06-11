#!/usr/bin/env node
/**
 * Upsert 8 new articles to Supabase.
 * Usage: node scripts/articles/upsert-articles.mjs
 *
 * Reads .env.local for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Reads article body from data/articles-md/{slug}.md (skips if missing).
 * Requires Node 20+ (built-in fetch).
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../')

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv(filePath) {
  if (!existsSync(filePath)) {
    console.error(`ERROR: ${filePath} not found`)
    process.exit(1)
  }
  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = loadEnv(resolve(ROOT, '.env.local'))
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local')
  process.exit(1)
}

// ── Article metadata ──────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: 'fable-5-hyperagent-autonomous',
    title: 'Fable 5×Hyperagent: 目標を渡すだけで数時間働く「自律エージェント」の実例3つ【会員限定】',
    cat_slug: 'ai-news',
    excerpt: 'NASAデータの小惑星可視化、100エーカーの施設設計、PDFからのパネル再現──人が触らず完結する働き方と、中小企業が今やるべき2つの準備を深掘り。',
    thumbnail_url: 'https://pbs.twimg.com/amplify_video_thumb/2064407893022019584/img/vb-5Z-ZXaHQvzapN.jpg',
    reading_time_minutes: 7,
    view_count: 28,
    published_at: '2026-06-11T16:00:00Z',
    is_members_only: true,
  },
  {
    slug: 'fable-5-youtube-pipeline',
    title: 'Fable 5がYouTube編集〜SNS投稿を一本通しで実行──「業務の塊」をAIに渡す設計図【会員限定】',
    cat_slug: 'lab',
    excerpt: 'ダウンロード→バズ検出→キャプション→リフレーム→予約投稿の5工程を1つのAIが連鎖実行。自社の「塊で渡せる業務」の見つけ方を編集部が解説。',
    thumbnail_url: 'https://pbs.twimg.com/amplify_video_thumb/2064569986702553088/img/NOKbGKboBn_6Xzn0.jpg',
    reading_time_minutes: 7,
    view_count: 31,
    published_at: '2026-06-11T15:50:00Z',
    is_members_only: true,
  },
  {
    slug: 'microsoft-adopts-fable-5',
    title: 'MicrosoftがFable 5を採用、Copilotにも展開──「AIチーム」時代が中小企業に届く順番【会員限定】',
    cat_slug: 'ai-news',
    excerpt: 'FoundryとGitHub Copilotに「次世代の自律型AIエージェント」として導入。いつものOfficeにエージェントが入ってくる意味を深掘り解説。',
    thumbnail_url: 'https://pbs.twimg.com/amplify_video_thumb/2064757396577431552/img/fXfTolMqXUz5ohoI.jpg',
    reading_time_minutes: 6,
    view_count: 24,
    published_at: '2026-06-11T15:40:00Z',
    is_members_only: true,
  },
  {
    slug: 'fable-5-ui-oneshot-designer',
    title: 'Claude Fable 5、5つのUIワンショット生成に全合格──「コードを書かないデザイナー」の仕事が変わる',
    cat_slug: 'ai-news',
    excerpt: 'GSAP/Three.js込みの高品質UIが1プロンプトで。著名UI/UX教育者の検証全合格が示す「デザイン→実装」分業の崩壊と、発注側が知るべき3つの変化。',
    thumbnail_url: 'https://pbs.twimg.com/amplify_video_thumb/2064717260200030208/img/rDa5YZj-oOnNzufl.jpg',
    reading_time_minutes: 6,
    view_count: 44,
    published_at: '2026-06-11T15:00:00Z',
  },
  {
    slug: 'obsidian-claude-skills-second-brain',
    title: 'Obsidian×Claude Skillsで「第二の脳」を構築する──元OpenAI Karpathy式・3フォルダ最小実装',
    cat_slug: 'ai-guide',
    excerpt: '議事録もSlackも死蔵させない。AIを「コンパイラと図書館係」として動かし、自分の業務を覚え続けるナレッジベースを週末2日で立ち上げる手順。',
    thumbnail_url: 'https://pbs.twimg.com/media/HIjfOY2bMAAqnvB.jpg',
    reading_time_minutes: 9,
    view_count: 58,
    published_at: '2026-06-11T13:00:00Z',
  },
  {
    slug: 'mcp-servers-30-selection',
    title: 'Claudeを最強化するMCPサーバー30選──「コピペ中継」を卒業する接続ガイド',
    cat_slug: 'tools',
    excerpt: 'DBの確認もSlack要約もGitHubのIssueも、人間が中継する必要はもうない。海外で130万回読まれたMCPサーバーまとめをビジネス目線で整理。',
    thumbnail_url: 'https://pbs.twimg.com/media/HGPeW6ubsAAmNP-.jpg',
    reading_time_minutes: 8,
    view_count: 72,
    published_at: '2026-06-11T12:50:00Z',
  },
  {
    slug: 'claude-fable-5-beginner-guide',
    title: '【超初心者向け】Claude Fable 5完全ガイド──何がすごいのか・いくらかかるのか・どう使うのか',
    cat_slug: 'ai-guide',
    excerpt: 'Opusの上「Mythos級」初の一般提供モデルを、公式発表ベースで分かりやすく解説。6月22日までの無料期間と、真価を体感するコピペ実験つき。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKZ5tkzagAAnGcX.jpg',
    reading_time_minutes: 9,
    view_count: 104,
    published_at: '2026-06-11T12:40:00Z',
  },
  {
    slug: 'claude-code-skills-guide',
    title: 'Claude Code Skills徹底ガイド──AIに仕事のやり方を覚えさせる「判断の資産化」',
    cat_slug: 'dx-improvement',
    excerpt: '毎回のお膳立てを卒業。SKILL.mdファイル1つで「上司は3ページ読まない」のような自社ルールをAIにセットし、チームで共有して属人化を解消する。',
    thumbnail_url: 'https://pbs.twimg.com/media/HGu1Vrab0AA9goz.jpg',
    reading_time_minutes: 9,
    view_count: 66,
    published_at: '2026-06-11T12:30:00Z',
  },
  {
    slug: 'claude-fable-5-business-cautions',
    title: 'Claude Fable 5の実力と導入前の注意点──コスト3.6倍・ZDRなしでも使うべきか',
    cat_slug: 'ai-news',
    excerpt: 'シニアエンジニア水準91点の実力の裏で、トークン大食い・30日データ保持必須・ZDRなし。企業導入の判断に必要な情報を公式発表と実測値から整理。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKbuXPHaMAAavTJ.jpg',
    reading_time_minutes: 8,
    view_count: 49,
    published_at: '2026-06-11T12:20:00Z',
  },
  {
    slug: 'fable-5-lp-reproduction-workflow',
    title: 'デザイン画像1枚からLPを作る──Fable 5×画像生成AIの分業ワークフロー',
    cat_slug: 'lab',
    excerpt: 'LP画像をNext.jsで再現させたら一致度が圧倒的。数値ゴール・自己検証ループ・素材生成まで設計した「AIへの仕事の任せ方」の型を実例プロンプト付きで。',
    thumbnail_url: 'https://picsum.photos/seed/lp-workflow/800/450',
    reading_time_minutes: 6,
    view_count: 38,
    published_at: '2026-06-11T12:10:00Z',
  },
  {
    slug: 'claude-fable-5-overview',
    title: '【速報解説】Claude Fable 5登場──「Mythos-class」史上最高性能モデルは何がすごいのか',
    cat_slug: 'ai-news',
    excerpt: 'Anthropicが公開した過去最高性能のAIモデル「Fable 5」。仕事の任せ方が本質的に変わると言われる新モデルの要点を速報解説。',
    thumbnail_url: 'https://pbs.twimg.com/media/HIdxS1PbEAA23lz.jpg',
    reading_time_minutes: 5,
    view_count: 120,
    published_at: '2026-06-11T09:40:00Z',
  },
  {
    slug: 'claude-fable-5-subagent-strategy',
    title: 'Claude Fable 5は「高すぎる」のか？──サブエージェント分業でコストを抑える使い方',
    cat_slug: 'ai-guide',
    excerpt: '1タスク数万円という衝撃のコスト。それでも最強モデルを実務で使うために、安いモデルで設計し高いモデルで実行する「エージェントチーム」戦略を解説。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKc9eg5b0AAyQvn.jpg',
    reading_time_minutes: 7,
    view_count: 95,
    published_at: '2026-06-11T09:35:00Z',
  },
  {
    slug: 'fable-5-self-correction-loops',
    title: 'Anthropic公式が明かすFable 5の真の使い方──プロンプトではなく「自己修正ループ」を設計せよ【翻訳解説】',
    cat_slug: 'ai-news',
    excerpt: 'Anthropic社員Lance Martin氏の技術記事を翻訳解説。ゴール設定・検証サブエージェント・メモリ活用でFable 5の性能を最大限引き出す。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKYnS0Za8AA_BoV.jpg',
    reading_time_minutes: 9,
    view_count: 88,
    published_at: '2026-06-11T09:30:00Z',
  },
  {
    slug: 'anthropic-31-ai-skills',
    title: 'Anthropicが「31人分のAI社員」を無料公開──中小企業は採用の前に業務のAI化を',
    cat_slug: 'dx-improvement',
    excerpt: '請求書追跡、契約書レビュー、営業資料作成…実務スキル31種が公式公開。「作業を手伝うAI」から「仕事を任せるAI」への転換点。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKYAtFVbIAAnxNK.jpg',
    reading_time_minutes: 6,
    view_count: 76,
    published_at: '2026-06-11T09:25:00Z',
  },
  {
    slug: 'claude-fable-5-notebooklm',
    title: 'Claude Fable 5×NotebookLM活用術──「究極の頭脳」に「最強の知識」を接続する',
    cat_slug: 'tools',
    excerpt: '史上最強モデルの弱点は「あなたの会社のことを知らない」こと。NotebookLMと組み合わせて自社専用AIに変える活用術。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKeTevybUAAgzLM.jpg',
    reading_time_minutes: 8,
    view_count: 64,
    published_at: '2026-06-11T09:20:00Z',
  },
  {
    slug: 'claude-autopilot-14-steps',
    title: 'Claudeを「完全自動運転」にする14ステップ──/loopとRoutinesで自動化スタックを組む【海外記事翻訳】',
    cat_slug: 'ai-guide',
    excerpt: '月200ドル払ってChatGPTの有料版のように使っていないか？海外で話題のClaude自動化スタック構築ガイドを日本語で全解説。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKD8XW4W0AAHp-f.jpg',
    reading_time_minutes: 12,
    view_count: 59,
    published_at: '2026-06-11T09:15:00Z',
  },
  {
    slug: 'kubell-ceo-fable-5-prompt',
    title: '上場企業CEOも実践──高コストなFable 5を「一文のプロンプト」で実用的に使う',
    cat_slug: 'ai-news',
    excerpt: 'kubell（旧Chatwork）山本CEOの投稿が話題に。メインセッションは設計とレビューに専念させ、実装はOpus/Sonnetに切り出す分業プロンプトとは。',
    thumbnail_url: 'https://picsum.photos/seed/fable-prompt/800/450',
    reading_time_minutes: 4,
    view_count: 47,
    published_at: '2026-06-11T09:10:00Z',
  },
  {
    slug: 'claude-fable-5-side-business',
    title: 'Claude Fable 5で会社員が副業月30万円を目指す──AIを「戦略責任者」として雇う4ステップ',
    cat_slug: 'solo-business',
    excerpt: '市場分析も商品設計も未来予測もAIに任せ、自分は実行だけ。「考えるAI」Fable 5で副業の役割分担が逆転する具体的な手順を解説。',
    thumbnail_url: 'https://pbs.twimg.com/media/HKcStMIaUAAww-M.jpg',
    reading_time_minutes: 8,
    view_count: 42,
    published_at: '2026-06-11T09:45:00Z',
  },
  {
    slug: 'ai-agent-company-management',
    title: '【保存版】AIエージェントで会社を経営する手順──リサーチ・コンテンツ・事務をAIに任せる',
    cat_slug: 'solo-business',
    excerpt: '「AIに任せてるつもりで結局全部自分でやってる」を卒業。東大AIエージェントラボSwarmによる、経営業務をAIに任せる実践手順。',
    thumbnail_url: 'https://pbs.twimg.com/media/HHtptx_a8AARAev.jpg',
    reading_time_minutes: 10,
    view_count: 31,
    published_at: '2026-06-11T09:05:00Z',
  },
]

// ── Fetch category slug → id map ──────────────────────────────────────────────
async function fetchCategoryMap() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=id,slug`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to fetch categories: ${res.status} ${body}`)
  }
  const rows = await res.json()
  const map = {}
  for (const row of rows) map[row.slug] = row.id
  return map
}

// ── Read markdown file ─────────────────────────────────────────────────────────
function readMd(slug) {
  const mdPath = resolve(ROOT, 'data', 'articles-md', `${slug}.md`)
  if (!existsSync(mdPath)) {
    console.warn(`  WARN: ${mdPath} not found – skipping slug "${slug}"`)
    return null
  }
  return readFileSync(mdPath, 'utf8')
}

// ── Upsert single article ──────────────────────────────────────────────────────
async function upsertArticle(payload) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?on_conflict=slug`,
    {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(payload),
    }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${body}`)
  }
  return await res.json()
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching categories…')
  const catMap = await fetchCategoryMap()
  console.log(`  Found ${Object.keys(catMap).length} categories: ${Object.keys(catMap).join(', ')}`)

  let failures = 0

  for (const article of ARTICLES) {
    const content = readMd(article.slug)
    if (content === null) {
      failures++
      continue
    }

    const categoryId = catMap[article.cat_slug]
    if (!categoryId) {
      console.error(`  ERROR [${article.slug}]: category slug "${article.cat_slug}" not found in DB`)
      failures++
      continue
    }

    const payload = {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      thumbnail_url: article.thumbnail_url,
      category_id: categoryId,
      content,
      is_published: true,
      is_members_only: article.is_members_only ?? false,
      reading_time_minutes: article.reading_time_minutes,
      view_count: article.view_count,
      published_at: article.published_at,
      created_at: article.published_at,
    }

    try {
      await upsertArticle(payload)
      console.log(`  OK  [${article.slug}]`)
    } catch (err) {
      console.error(`  FAIL [${article.slug}]: ${err.message}`)
      failures++
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} article(s) failed.`)
    process.exit(1)
  }
  console.log('\nAll articles upserted successfully.')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
