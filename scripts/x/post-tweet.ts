import { readFile } from 'node:fs/promises'
import { TwitterApi } from 'twitter-api-v2'

export type PostResult = {
  tweetId: string
  text: string
  mediaIds?: string[]
}

export function hasXCredentials(): boolean {
  return Boolean(
    process.env.X_API_KEY &&
    process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_TOKEN_SECRET,
  )
}

function createClient() {
  const appKey = process.env.X_API_KEY
  const appSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error(
      'X API 認証情報が未設定です。X Developer Portal でアプリを作成し、' +
      'X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET を .env に設定してください。' +
      '（ログイン用パスワードでは投稿できません）',
    )
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
}

export async function uploadMedia(imagePath: string): Promise<string> {
  const client = createClient()
  const buf = await readFile(imagePath)
  const mediaId = await client.v1.uploadMedia(buf, { mimeType: 'image/jpeg' })
  return mediaId
}

export async function postTweet(text: string, imagePath?: string): Promise<PostResult> {
  const client = createClient()
  // twitter-api-v2 の media_ids は固定長タプル型（[string] 等）を要求するため as で合わせる
  const mediaIds = imagePath ? ([await uploadMedia(imagePath)] as [string]) : undefined
  const { data } = await client.v2.tweet(text, mediaIds ? { media: { media_ids: mediaIds } } : undefined)
  return { tweetId: data.id, text, mediaIds }
}
