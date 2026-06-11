/** 1人社長・副業・起業カテゴリの試験投稿用 */
export type ArticlePromo = {
  slug: string
  title: string
  hook: string
}

export const SOLO_BUSINESS_TRIAL: ArticlePromo[] = [
  {
    slug: 'solo-president-chatgpt-100man',
    title: '1人社長がChatGPTだけで月商100万を達成した全手順',
    hook: '副業から独立してChatGPTで月商100万を達成した実例。使ったプロンプトと業務フローをまとめました。',
  },
  {
    slug: 'president-ai-first-tasks',
    title: '社長がAIを使うと最初に手放せる業務5つ',
    hook: '経営者がAIに最初に任せるべき業務5選。1人社長・小規模事業者の「最初の一歩」が分かる記事です。',
  },
  {
    slug: 'ai-agent-company-management',
    title: '【保存版】AIエージェントで会社を経営する手順',
    hook: 'リサーチ・コンテンツ・事務をAIエージェントに任せる実践手順。起業・副業で一人経営している方に。',
  },
]

export function buildArticleTweet(promo: ArticlePromo, siteBase: string): string {
  const url = `${siteBase.replace(/\/$/, '')}/articles/${promo.slug}`
  const text = `📘 ${promo.hook}\n\n▼ ${promo.title}\n${url}\n\n#AI #1人社長 #副業`
  if (text.length <= 280) return text
  const short = `📘 ${promo.hook.slice(0, 120)}…\n${url}\n#AI #1人社長`
  return short.slice(0, 280)
}
