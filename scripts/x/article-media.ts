import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { DUMMY_ARTICLES } from '../../lib/dummy-articles'

const IMAGE_DIR = 'data/x-images'

export function getArticleThumbnail(slug: string): string | undefined {
  const article = DUMMY_ARTICLES.find(a => a.slug === slug)
  return article?.thumbnail_url ?? undefined
}

export async function ensureLocalImage(slug: string, imageUrl?: string): Promise<string | undefined> {
  const url = imageUrl ?? getArticleThumbnail(slug)
  if (!url) return undefined

  await mkdir(IMAGE_DIR, { recursive: true })
  const ext = url.includes('.png') ? 'png' : url.includes('.webp') ? 'webp' : 'jpg'
  const localPath = join(IMAGE_DIR, `${slug}.${ext}`)
  if (existsSync(localPath)) return localPath

  const res = await fetch(url)
  if (!res.ok) throw new Error(`画像ダウンロード失敗 (${res.status}): ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(localPath, buf)
  return localPath
}
