#!/usr/bin/env npx tsx
/**
 * X 自動投稿 — 1スロット分を実行
 *
 * Usage:
 *   npx tsx scripts/x/run-slot.ts commute_morning
 *   npx tsx scripts/x/run-slot.ts lunch --dry-run
 *   npx tsx scripts/x/run-slot.ts --list
 */

import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { POST_SLOTS, SLOT_IDS, type PostSlotId } from './config'
import { fetchHeadlines } from './fetch-news'
import { generateTweet } from './generate-tweet'
import { appendPost, loadHistory, wasRecentlyPosted } from './history'
import { hasXCredentials, postTweet } from './post-tweet'

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run')
  const list = argv.includes('--list')
  const slotArg = argv.find(a => !a.startsWith('-') && a !== process.argv[1])
  return { dryRun, list, slot: slotArg as PostSlotId | undefined }
}

async function main() {
  const { dryRun, list, slot: slotArg } = parseArgs(process.argv.slice(2))

  if (list) {
    console.log('利用可能なスロット:')
    for (const id of SLOT_IDS) {
      const s = POST_SLOTS[id]
      console.log(`  ${id.padEnd(18)} ${String(s.cronHour).padStart(2, '0')}:${String(s.cronMinute).padStart(2, '0')} JST  ${s.label}`)
    }
    return
  }

  if (!slotArg || !SLOT_IDS.includes(slotArg)) {
    console.error('Usage: npx tsx scripts/x/run-slot.ts <slot_id> [--dry-run]')
    console.error('Slots:', SLOT_IDS.join(', '))
    process.exit(1)
  }

  const slot = POST_SLOTS[slotArg]
  console.log(`[x-post] slot=${slotArg} (${slot.label}) dryRun=${dryRun}`)

  const history = await loadHistory()
  let headlines = await fetchHeadlines(slotArg)

  if (wasRecentlyPosted(history, headlines[0].title)) {
    console.log(`[x-post] 直近投稿済み → ${headlines[0].title}`)
    const alt = headlines.find(h => !wasRecentlyPosted(history, h.title))
    if (!alt) {
      console.log('[x-post] 代替ニュースなし。終了。')
      return
    }
    headlines = [alt, ...headlines.filter(h => h !== alt)]
    console.log(`[x-post] 代替ニュースを採用 → ${alt.title}`)
  }

  const { text, sourceHeadline, via } = await generateTweet(slotArg, headlines)
  console.log(`[x-post] generated via=${via} (${text.length} chars)`)
  console.log('---')
  console.log(text)
  console.log('---')

  if (dryRun) {
    await appendPost({
      id: randomUUID(),
      slot: slotArg,
      text,
      sourceHeadline,
      postedAt: new Date().toISOString(),
      dryRun: true,
    })
    console.log('[x-post] dry-run 完了（投稿せず履歴のみ保存）')
    return
  }

  if (!hasXCredentials()) {
    console.error('[x-post] X API キー未設定。--dry-run で文面確認か、docs/X_AUTOMATION.md の手順でキーを設定してください。')
    process.exit(1)
  }

  const result = await postTweet(text)
  await appendPost({
    id: randomUUID(),
    slot: slotArg,
    text: result.text,
    tweetId: result.tweetId,
    sourceHeadline,
    postedAt: new Date().toISOString(),
  })

  console.log(`[x-post] 投稿完了 tweetId=${result.tweetId}`)
  console.log(`https://x.com/i/web/status/${result.tweetId}`)
}

main().catch(err => {
  console.error('[x-post] fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
