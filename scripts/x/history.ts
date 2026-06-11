import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { PostSlotId } from './config'
import { HISTORY_PATH } from './config'

export type PostRecord = {
  id: string
  slot: PostSlotId
  text: string
  tweetId?: string
  sourceHeadline?: string
  postedAt: string
  dryRun?: boolean
}

export type PostHistory = {
  posts: PostRecord[]
}

export async function loadHistory(): Promise<PostHistory> {
  try {
    const raw = await readFile(HISTORY_PATH, 'utf8')
    return JSON.parse(raw) as PostHistory
  } catch {
    return { posts: [] }
  }
}

export async function saveHistory(history: PostHistory): Promise<void> {
  await mkdir(dirname(HISTORY_PATH), { recursive: true })
  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n', 'utf8')
}

export function wasRecentlyPosted(history: PostHistory, headline: string, hours = 48): boolean {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  const norm = headline.trim().toLowerCase()
  return history.posts.some(p => {
    if (!p.sourceHeadline) return false
    if (new Date(p.postedAt).getTime() < cutoff) return false
    return p.sourceHeadline.trim().toLowerCase() === norm
  })
}

export async function appendPost(record: PostRecord): Promise<void> {
  const history = await loadHistory()
  history.posts.unshift(record)
  history.posts = history.posts.slice(0, 200)
  await saveHistory(history)
}
