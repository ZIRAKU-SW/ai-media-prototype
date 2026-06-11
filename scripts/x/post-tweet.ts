import { TwitterApi } from 'twitter-api-v2'

export type PostResult = {
  tweetId: string
  text: string
}

export function hasXCredentials(): boolean {
  return Boolean(
    process.env.X_API_KEY &&
    process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_TOKEN_SECRET,
  )
}

export async function postTweet(text: string): Promise<PostResult> {
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

  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  })

  const { data } = await client.v2.tweet(text)
  return { tweetId: data.id, text }
}
