import { getArticles } from '@/lib/supabase'

export const revalidate = 300

const SITE_BASE = (process.env.X_POST_SITE_URL ?? 'https://oceanosfleet.com/Ziraku/ziraku').replace(/\/$/, '')
const FEED_SELF = 'https://oceanosfleet.com/Ziraku/feed.xml'

/** XML エスケープ（URL 属性・本文テキスト用） */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** CDATA セクション用ガード（]]> の出現を分割して無害化） */
function cdata(s: string): string {
  return s.replace(/]]>/g, ']]]]><![CDATA[>')
}

function buildEmptyFeed(): string {
  const now = new Date().toUTCString()
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AIビジネスメディア</title>
    <link>${xmlEscape(SITE_BASE)}</link>
    <description>AIでビジネスを加速する実践メディア。最新のAI活用術・DX事例をお届けします。</description>
    <language>ja</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${xmlEscape(FEED_SELF)}" rel="self" type="application/rss+xml" />
  </channel>
</rss>`
}

export async function GET() {
  const headers = {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
  }

  let articles
  try {
    const raw = await getArticles({ limit: 20 })
    // 二重防御: is_published=true かつ is_members_only=false で絞り込み
    articles = raw.filter(a => a.is_published && !a.is_members_only)
  } catch (err) {
    console.error('[feed.xml] getArticles failed:', err)
    return new Response(buildEmptyFeed(), { headers })
  }

  const lastBuildDate =
    articles.length > 0
      ? new Date(articles[0].published_at ?? articles[0].created_at).toUTCString()
      : new Date().toUTCString()

  const items = articles
    .map(article => {
      const articleUrl = `${SITE_BASE}/articles/${article.slug}`
      const pubDate = new Date(article.published_at ?? article.created_at).toUTCString()

      const categoryLine =
        article.categories?.name
          ? `    <category><![CDATA[${cdata(article.categories.name)}]]></category>`
          : ''

      const enclosureLine =
        article.thumbnail_url
          ? `    <enclosure url="${xmlEscape(article.thumbnail_url)}" type="image/jpeg" />`
          : ''

      return `  <item>
    <title><![CDATA[${cdata(article.title)}]]></title>
    <link>${xmlEscape(articleUrl)}</link>
    <description><![CDATA[${cdata(article.excerpt ?? '')}]]></description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${xmlEscape(articleUrl)}</guid>
${categoryLine}
${enclosureLine}
  </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AIビジネスメディア</title>
    <link>${xmlEscape(SITE_BASE)}</link>
    <description>AIでビジネスを加速する実践メディア。最新のAI活用術・DX事例をお届けします。</description>
    <language>ja</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${xmlEscape(FEED_SELF)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, { headers })
}
