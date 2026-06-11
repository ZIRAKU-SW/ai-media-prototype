/** 1日5回の投稿スロット（JST） */
export type PostSlotId =
  | 'commute_morning'
  | 'lunch'
  | 'commute_evening'
  | 'bedtime'
  | 'us_morning'

export type PostSlot = {
  id: PostSlotId
  label: string
  /** cron: 分 時 * * * (Asia/Tokyo) */
  cronMinute: number
  cronHour: number
  theme: string
  audience: string
}

export const POST_SLOTS: Record<PostSlotId, PostSlot> = {
  commute_morning: {
    id: 'commute_morning',
    label: '朝の通勤時間',
    cronMinute: 30,
    cronHour: 7,
    theme: '今日の業務で使えるAI活用のヒント・国内の朝イチニュース',
    audience: '出勤前にスマホを見る経営者・社員',
  },
  lunch: {
    id: 'lunch',
    label: '昼休み',
    cronMinute: 0,
    cronHour: 12,
    theme: '昼休みに読める実践ノウハウ・ツール比較・短時間で試せるTips',
    audience: '昼休みに情報収集するビジネスパーソン',
  },
  commute_evening: {
    id: 'commute_evening',
    label: '夕方の帰宅時間',
    cronMinute: 0,
    cronHour: 18,
    theme: '本日のAI/DXトレンドまとめ・明日試したい施策',
    audience: '帰宅時間にキャッチアップする経営者',
  },
  bedtime: {
    id: 'bedtime',
    label: '夜・寝る前',
    cronMinute: 0,
    cronHour: 22,
    theme: '深掘り記事の要点・週末に試したいAI活用アイデア',
    audience: '就寝前にじっくり読む層',
  },
  us_morning: {
    id: 'us_morning',
    label: '米国の朝（新着ニュース）',
    cronMinute: 0,
    cronHour: 23,
    theme: '米国で今朝出たAIビジネスニュース・新製品・資金調達（日本時間の夜に速報）',
    audience: '海外トレンドをいち早く知りたい経営者',
  },
}

export const SLOT_IDS = Object.keys(POST_SLOTS) as PostSlotId[]

export const SITE_URL = process.env.X_POST_SITE_URL ?? 'https://project-7bhii.vercel.app/ziraku'
export const X_HANDLE = process.env.X_HANDLE ?? '@AIbusinessmedia'

/** RSS / ニュース取得元 */
export const NEWS_FEEDS = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'Google News AI Business (JP)', url: 'https://news.google.com/rss/search?q=AI+%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9+DX&hl=ja&gl=JP&ceid=JP:ja' },
] as const

export const HISTORY_PATH = 'data/x-post-history.json'
