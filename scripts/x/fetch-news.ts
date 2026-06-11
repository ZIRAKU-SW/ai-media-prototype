import Parser from 'rss-parser'
import { NEWS_FEEDS } from './config'
import type { PostSlotId } from './config'
import { POST_SLOTS } from './config'

export type NewsItem = {
  title: string
  link: string
  source: string
  publishedAt?: string
  score: number
}

const parser = new Parser({ timeout: 15000 })

const KEYWORDS_JP = ['ai', '人工知能', 'chatgpt', 'claude', 'gemini', 'dx', '自動化', '生成ai', 'llm', 'openai', 'anthropic']
const KEYWORDS_US = ['openai', 'anthropic', 'google', 'microsoft', 'nvidia', 'funding', 'launch', 'release', 'agent', 'enterprise']

function matchesSlot(item: NewsItem, slot: PostSlotId): number {
  const text = `${item.title} ${item.source}`.toLowerCase()
  let score = item.score

  if (slot === 'us_morning') {
    for (const kw of KEYWORDS_US) {
      if (text.includes(kw)) score += 2
    }
    if (item.source.includes('TechCrunch') || item.source.includes('VentureBeat')) score += 3
  } else if (slot === 'lunch') {
    if (text.includes('how') || text.includes('guide') || text.includes('使い方') || text.includes('活用')) score += 2
  } else if (slot === 'commute_morning') {
    if (text.includes('日本') || text.includes('中小') || text.includes('business')) score += 1
  }

  for (const kw of KEYWORDS_JP) {
    if (text.includes(kw)) score += 1
  }

  return score
}

export async function fetchHeadlines(slot: PostSlotId, limit = 8): Promise<NewsItem[]> {
  const items: NewsItem[] = []

  for (const feed of NEWS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      for (const entry of parsed.items.slice(0, 12)) {
        if (!entry.title) continue
        items.push({
          title: entry.title.trim(),
          link: entry.link ?? '',
          source: feed.name,
          publishedAt: entry.isoDate ?? entry.pubDate,
          score: 0,
        })
      }
    } catch (err) {
      console.warn(`[fetch-news] skip ${feed.name}:`, err instanceof Error ? err.message : err)
    }
  }

  const ranked = items
    .map(item => ({ ...item, score: matchesSlot(item, slot) }))
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      if (dateB !== dateA) return dateB - dateA
      return b.score - a.score
    })

  const seen = new Set<string>()
  const unique: NewsItem[] = []
  for (const item of ranked) {
    const key = item.title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(item)
    if (unique.length >= limit) break
  }

  if (unique.length === 0) {
    const slotDef = POST_SLOTS[slot]
    unique.push({
      title: `${slotDef.label}のAIビジネスニュース`,
      link: '',
      source: 'fallback',
      score: 0,
    })
  }

  return unique
}

export function formatHeadlinesForPrompt(headlines: NewsItem[]): string {
  return headlines
    .map((h, i) => `${i + 1}. [${h.source}] ${h.title}${h.link ? `\n   URL: ${h.link}` : ''}`)
    .join('\n')
}
