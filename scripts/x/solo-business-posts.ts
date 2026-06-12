/** 1人社長・副業・起業カテゴリの試験投稿用 */
export type ArticlePromo = {
  slug: string
  title: string
  hook: string
  /** 記事サムネイル（省略時は dummy-articles から解決） */
  thumbnail_url?: string
  hashtags?: string
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

export const ENTERPRISE_AI_COST_PROMO: ArticlePromo = {
  slug: 'enterprise-ai-cost-web-agent-vs-seat',
  title: '席課金 vs 社内Webエージェント｜企業AIコストを最大97%削減する方法【2026年試算】',
  hook: '100人にChatGPTを配ると月30万円超。社内WebにAPIを1本通すだけで最大97%削減できる試算を公開しました。',
  thumbnail_url: 'https://picsum.photos/seed/ai012/800/450',
  hashtags: '#AI #DX #企業AI',
}

export function buildArticleTweet(promo: ArticlePromo, siteBase: string): string {
  const url = `${siteBase.replace(/\/$/, '')}/articles/${promo.slug}`
  const tags = promo.hashtags ?? '#AI #1人社長 #副業'
  // 先頭絵文字は Cursor IDE ブラウザ自動入力で React 状態が壊れやすいため使わない
  const text = `${promo.hook}\n\n▼ ${promo.title}\n${url}\n\n${tags}`
  if (text.length <= 280) return text
  const short = `${promo.hook.slice(0, 120)}…\n${url}\n${tags.split(' ').slice(0, 2).join(' ')}`
  return short.slice(0, 280)
}
