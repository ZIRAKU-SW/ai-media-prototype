#!/usr/bin/env npx tsx
/**
 * 新着公開記事を検知して X(Twitter) に自動投稿する
 *
 * Usage:
 *   npx tsx scripts/x/post-articles.ts              # 本番投稿（最大3件）
 *   npx tsx scripts/x/post-articles.ts --dry-run    # 文面確認のみ（履歴を書かない）
 *   npx tsx scripts/x/post-articles.ts --seed       # 現時点の記事を全て「投稿済み」として登録（初回ベースライン）
 *   npx tsx scripts/x/post-articles.ts --max 5      # 最大投稿件数を変更
 *
 * cron: * /15 * * * * cd /home/powerpass7/ai-media-prototype && npm run x:articles >> data/x-articles-cron.log 2>&1
 */

import 'dotenv/config'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Article } from '../../lib/supabase'
import { hasXCredentials, postTweet } from './post-tweet'

// ── Supabase REST 直呼び（Node 20 で @supabase/realtime-js が ws を要求する問題を回避）
// lib/supabase.ts の getArticles と同じロジック: is_published=true, is_members_only=false, published_at 降順
async function getArticles(options?: { limit?: number }): Promise<Article[]> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wqlelowutbxplrzforcc.supabase.co'
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_Ud0Q4YAoo49bAKBNbHnT_g_kyJDgMI3'
  const limit = options?.limit ?? 12
  const url = `${SUPABASE_URL}/rest/v1/articles?select=*,categories(name,slug,color)&is_published=eq.true&is_members_only=eq.false&order=published_at.desc&limit=${limit}`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Supabase REST error: ${res.status} ${await res.text()}`)
  return res.json() as Promise<Article[]>
}

// ── 定数 ──────────────────────────────────────────────────────────────────────

const SITE_BASE = (process.env.X_POST_SITE_URL ?? 'https://oceanosfleet.com/Ziraku/ziraku').replace(/\/$/, '')
const HISTORY_PATH = 'data/x-article-history.json'
const DEFAULT_MAX_PER_RUN = 3   // 1回のcronで投稿する最大件数（暴発防止）
const FETCH_LIMIT = 30          // getArticles の取得件数

// ── 履歴（slug ベース） ────────────────────────────────────────────────────────

type ArticleHistory = {
  posted: { slug: string; tweetId?: string; postedAt: string; seeded?: boolean }[]
}

async function loadHistory(): Promise<ArticleHistory> {
  try {
    const raw = await readFile(HISTORY_PATH, 'utf8')
    return JSON.parse(raw) as ArticleHistory
  } catch {
    return { posted: [] }
  }
}

async function saveHistory(h: ArticleHistory): Promise<void> {
  await mkdir(dirname(HISTORY_PATH), { recursive: true })
  await writeFile(HISTORY_PATH, JSON.stringify(h, null, 2) + '\n', 'utf8')
}

function isPosted(h: ArticleHistory, slug: string): boolean {
  return h.posted.some(p => p.slug === slug)
}

// ── 文字数計算（X 重み付き） ────────────────────────────────────────────────────
//
// CJK文字は2、その他は1。URL は実長によらず23固定で計上。
// 上限280。
//
// CJK判定レンジ（コードポイント）:
//   U+1100–U+115F   Hangul Jamo
//   U+2E80–U+303E   CJK Radicals / Kangxi / Enclosed CJK
//   U+3041–U+33FF   Hiragana / Katakana / Bopomofo etc.
//   U+3400–U+4DBF   CJK Extension A
//   U+4E00–U+9FFF   CJK Unified Ideographs
//   U+A000–U+A4CF   Yi
//   U+AC00–U+D7A3   Hangul Syllables
//   U+F900–U+FAFF   CJK Compatibility Ideographs
//   U+FE30–U+FE4F   CJK Compatibility Forms
//   U+FF00–U+FF60   Fullwidth Forms
//   U+FFE0–U+FFE6   Fullwidth / Halfwidth Signs
//   U+20000–U+2FA1F CJK Extension B–F + Supplement

function isCJK(cp: number): boolean {
  return (
    (cp >= 0x1100  && cp <= 0x115F)  ||
    (cp >= 0x2E80  && cp <= 0x303E)  ||
    (cp >= 0x3041  && cp <= 0x33FF)  ||
    (cp >= 0x3400  && cp <= 0x4DBF)  ||
    (cp >= 0x4E00  && cp <= 0x9FFF)  ||
    (cp >= 0xA000  && cp <= 0xA4CF)  ||
    (cp >= 0xAC00  && cp <= 0xD7A3)  ||
    (cp >= 0xF900  && cp <= 0xFAFF)  ||
    (cp >= 0xFE30  && cp <= 0xFE4F)  ||
    (cp >= 0xFF00  && cp <= 0xFF60)  ||
    (cp >= 0xFFE0  && cp <= 0xFFE6)  ||
    (cp >= 0x20000 && cp <= 0x2FA1F)
  )
}

/**
 * URLを除いた文字列の重み付き長を返す。
 * CJK=2、その他=1。サロゲートペア対応で for...of（コードポイント単位）を使用。
 */
function weightedLen(s: string): number {
  let len = 0
  for (const char of s) {
    const cp = char.codePointAt(0) ?? 0
    len += isCJK(cp) ? 2 : 1
  }
  return len
}

/**
 * ツイート本文全体の重み付き長を返す。URLは23固定として計上。
 * text 中に含まれる URL (http/https で始まる単語) を23に置き換えて計算。
 */
function tweetWeightedLen(text: string): number {
  // URL部分を23文字相当のプレースホルダーに置換してから計算
  const normalized = text.replace(/https?:\/\/\S+/g, '_'.repeat(23))
  return weightedLen(normalized)
}

// ── ツイート文面生成 ───────────────────────────────────────────────────────────

const HASHTAGS = '#AI #AI活用 #DX #中小企業'
const LIMIT = 280

/**
 * 記事からツイート本文を生成する。
 * 文字数上限 280 (X 重み付き) を厳密に守る。
 */
function buildTweet(article: Article): string {
  const url = `${SITE_BASE}/articles/${article.slug}`
  const title = article.title
  const rawExcerpt = article.excerpt ?? ''

  // テンプレートの固定部分（URL は23固定）:
  //   {title}\n\n{excerpt}\n\n▼続きを読む\n{url}\n\n{hashtags}
  // 固定部分 = title + "\n\n" + "▼続きを読む\n" + url(23) + "\n\n" + hashtags
  // excerpt を挟む場合は excerpt + "\n\n" が追加される

  const titleWeight = weightedLen(title)
  const hashtagsWeight = weightedLen(HASHTAGS)
  const urlWeight = 23 // X は URL を常に23文字として計上
  // 固定区切り: "\n\n▼続きを読む\n" + "\n\n" (url後) = weightedLen は全て1
  const separatorsNoExcerpt = weightedLen('\n\n▼続きを読む\n') + weightedLen('\n\n')
  // excerpt がある場合の追加区切り: excerpt後の "\n\n"
  const excerptSeparatorWeight = weightedLen('\n\n')

  // excerpt なし版の固定合計
  const baseWeight = titleWeight + separatorsNoExcerpt + urlWeight + hashtagsWeight

  // excerpt を入れられる残り文字数
  const excerptBudget = LIMIT - baseWeight - excerptSeparatorWeight

  let finalExcerpt = ''

  if (excerptBudget > 2 && rawExcerpt.length > 0) {
    // 1文字ずつ累積して収まる範囲を探す
    let accum = 0
    let cut = 0
    for (const char of rawExcerpt) {
      const cp = char.codePointAt(0) ?? 0
      const w = isCJK(cp) ? 2 : 1
      if (accum + w > excerptBudget) break
      accum += w
      cut += char.length // サロゲートペアは2バイト
    }
    if (cut < rawExcerpt.length) {
      // 切り詰め: 末尾に「…」(重み2) を付けるので2文字分縮める
      // すでに budget 内に収まっていれば … は不要
      // 切り詰めが発生した場合: … の分をさらに縮める
      let accum2 = 0
      let cut2 = 0
      for (const char of rawExcerpt) {
        const cp = char.codePointAt(0) ?? 0
        const w = isCJK(cp) ? 2 : 1
        if (accum2 + w > excerptBudget - 2) break // … の重み2を確保
        accum2 += w
        cut2 += char.length
      }
      finalExcerpt = rawExcerpt.slice(0, cut2) + '…'
    } else {
      finalExcerpt = rawExcerpt
    }
  }

  // 組み立て
  let text: string
  if (finalExcerpt) {
    text = `${title}\n\n${finalExcerpt}\n\n▼続きを読む\n${url}\n\n${HASHTAGS}`
  } else {
    text = `${title}\n\n▼続きを読む\n${url}\n\n${HASHTAGS}`
  }

  // フォールバック: もし超えていたら excerpt を落とす
  if (tweetWeightedLen(text) > LIMIT) {
    text = `${title}\n\n▼続きを読む\n${url}\n\n${HASHTAGS}`
  }

  // さらに超えるケースは理論上ないが念のため assert
  const finalWeight = tweetWeightedLen(text)
  if (finalWeight > LIMIT) {
    // タイトルを切り詰める（極端なケース）
    const fixedPart = '\n\n▼続きを読む\n' + url + '\n\n' + HASHTAGS
    const fixedWeight = urlWeight + weightedLen('\n\n▼続きを読む\n') + weightedLen('\n\n') + hashtagsWeight
    let truncTitle = ''
    let tw = 0
    for (const char of title) {
      const cp = char.codePointAt(0) ?? 0
      const w = isCJK(cp) ? 2 : 1
      if (tw + w > LIMIT - fixedWeight - 2) break
      tw += w
      truncTitle += char
    }
    text = `${truncTitle}…${fixedPart}`
  }

  return text
}

// ── 引数パース ─────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run')
  const seed = argv.includes('--seed')
  const maxIdx = argv.indexOf('--max')
  const max = maxIdx !== -1 && argv[maxIdx + 1]
    ? parseInt(argv[maxIdx + 1], 10)
    : DEFAULT_MAX_PER_RUN
  return { dryRun, seed, max }
}

// ── メイン ─────────────────────────────────────────────────────────────────────

async function main() {
  const { dryRun, seed, max } = parseArgs(process.argv.slice(2))

  console.log(`[x-articles] start  dryRun=${dryRun} seed=${seed} max=${max}`)

  const articles = await getArticles({ limit: FETCH_LIMIT })
  // 二重防御
  const published = articles.filter(a => a.is_published && !a.is_members_only)

  const history = await loadHistory()
  const fresh = published.filter(a => !isPosted(history, a.slug))

  // ── seed モード ──────────────────────────────────────────────────────────────
  if (seed) {
    const now = new Date().toISOString()
    let added = 0
    for (const a of published) {
      if (!isPosted(history, a.slug)) {
        history.posted.push({ slug: a.slug, postedAt: now, seeded: true })
        added++
      }
    }
    await saveHistory(history)
    console.log(`[x-articles] seed 完了: ${added}件を投稿済みとして登録しました（実際には投稿していません）`)
    return
  }

  // ── 通常モード ───────────────────────────────────────────────────────────────
  if (fresh.length === 0) {
    console.log('[x-articles] 新着記事なし。終了。')
    return
  }

  // 古い順（新しい順で来るのでreverseして古い順に）
  const targets = [...fresh].reverse().slice(0, max)
  console.log(`[x-articles] 新着 ${fresh.length}件 → 今回投稿: ${targets.length}件`)

  // ── dry-run ──────────────────────────────────────────────────────────────────
  if (dryRun) {
    for (const article of targets) {
      const text = buildTweet(article)
      const wlen = tweetWeightedLen(text)
      console.log(`\n[x-articles] --- ${article.slug} (weightedLen=${wlen}) ---`)
      console.log(text)
      console.log('---')
      if (wlen > LIMIT) {
        console.error(`[x-articles] ERROR: weightedLen ${wlen} > ${LIMIT}!`)
      }
    }
    console.log('\n[x-articles] dry-run 完了（履歴は書いていません）')
    return
  }

  // ── 本番投稿 ─────────────────────────────────────────────────────────────────
  if (!hasXCredentials()) {
    console.error(
      '[x-articles] X API キー未設定。' +
      'X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET（および X_API_KEY / X_API_SECRET）を ' +
      '.env に設定してください。',
    )
    process.exit(1)
  }

  for (const article of targets) {
    const text = buildTweet(article)
    const wlen = tweetWeightedLen(text)
    console.log(`[x-articles] 投稿中: ${article.slug} (weightedLen=${wlen})`)

    try {
      const result = await postTweet(text)
      history.posted.push({
        slug: article.slug,
        tweetId: result.tweetId,
        postedAt: new Date().toISOString(),
      })
      await saveHistory(history) // 1件ごとに保存（途中失敗でも記録が残る）
      console.log(`[x-articles] 投稿完了: https://x.com/i/web/status/${result.tweetId}`)
    } catch (err) {
      console.error('[x-articles] 投稿失敗。残りは次回cronに回します:', err instanceof Error ? err.message : err)
      process.exit(1) // X レート制限対策：1件失敗したらそこで停止
    }
  }

  console.log(`[x-articles] 全 ${targets.length}件の投稿が完了しました。`)
}

main().catch(err => {
  console.error('[x-articles] fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
