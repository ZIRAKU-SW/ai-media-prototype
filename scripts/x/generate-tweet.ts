import { Agent, CursorAgentError } from '@cursor/sdk'
import type { PostSlotId } from './config'
import { POST_SLOTS, SITE_URL, X_HANDLE } from './config'
import { formatHeadlinesForPrompt, type NewsItem } from './fetch-news'

const MAX_TWEET_LEN = 275

function buildPrompt(slotId: PostSlotId, headlines: NewsItem[], topHeadline: NewsItem): string {
  const slot = POST_SLOTS[slotId]
  const headlineBlock = formatHeadlinesForPrompt(headlines)

  return `あなたは「AIビジネスメディア」公式Xアカウント ${X_HANDLE} のSNS編集者です。
日本の中小企業・1人社長・非エンジニア経営者向けに、AI/DXの実践情報を発信しています。

## 今回の投稿スロット
- 時間帯: ${slot.label}
- 狙い: ${slot.theme}
- 読者: ${slot.audience}

## 参考ニュース（この中から1つを選び、要点を日本語で伝える）
${headlineBlock}

## 主に取り上げるニュース
[${topHeadline.source}] ${topHeadline.title}

## 出力ルール（厳守）
1. 投稿本文のみを出力（説明・前置き・引用符は不要）
2. ${MAX_TWEET_LEN}文字以内（日本語。URL・ハッシュタグ込み）
3. 冒頭でニュースの要点を1〜2文でわかりやすく
4. 中小企業の経営者が「自分の業務にどう効くか」が想像できる一言を入れる
5. ハッシュタグは #AI #DX から最大2個
6. 最後にメディアURLを1つ: ${SITE_URL}
7. 煽り・誇大表現・投資助言は禁止。事実ベースで中立的に

投稿文:`
}

function trimTweet(text: string): string {
  let t = text.trim()
  t = t.replace(/^["「『]|["」』]$/g, '').trim()
  if (t.length <= 280) return t
  return t.slice(0, MAX_TWEET_LEN - 1) + '…'
}

function fallbackTweet(slotId: PostSlotId, headline: NewsItem): string {
  const slot = POST_SLOTS[slotId]
  const base = `【${slot.label}】${headline.title.slice(0, 80)}。中小企業のAI活用・DX推進に役立つ視点で解説しています。`
  const tags = '\n#AI #DX'
  const url = `\n${SITE_URL}`
  const room = MAX_TWEET_LEN - tags.length - url.length
  return trimTweet(base.slice(0, room) + tags + url)
}

export async function generateTweet(
  slotId: PostSlotId,
  headlines: NewsItem[],
): Promise<{ text: string; sourceHeadline: string; via: 'cursor-sdk' | 'fallback' }> {
  const top = headlines[0]
  const apiKey = process.env.CURSOR_API_KEY

  if (!apiKey) {
    console.warn('[generate-tweet] CURSOR_API_KEY 未設定 → テンプレートで生成')
    return {
      text: fallbackTweet(slotId, top),
      sourceHeadline: top.title,
      via: 'fallback',
    }
  }

  const prompt = buildPrompt(slotId, headlines, top)

  try {
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: process.env.CURSOR_SDK_MODEL ?? 'composer-2.5' },
      local: { cwd: process.cwd(), settingSources: [] },
    })

    if (result.status === 'error' || !result.result?.trim()) {
      console.warn('[generate-tweet] Agent error → fallback:', result.status)
      return {
        text: fallbackTweet(slotId, top),
        sourceHeadline: top.title,
        via: 'fallback',
      }
    }

    return {
      text: trimTweet(result.result),
      sourceHeadline: top.title,
      via: 'cursor-sdk',
    }
  } catch (err) {
    if (err instanceof CursorAgentError) {
      console.warn('[generate-tweet] CursorAgentError → fallback:', err.message)
    } else {
      console.warn('[generate-tweet] unknown error → fallback:', err)
    }
    return {
      text: fallbackTweet(slotId, top),
      sourceHeadline: top.title,
      via: 'fallback',
    }
  }
}
