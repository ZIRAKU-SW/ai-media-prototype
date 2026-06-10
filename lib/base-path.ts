/** VM / oceanosfleet 用パス接頭辞（Vercel 本番では未設定のまま） */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')

export function withBasePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (!BASE_PATH) return normalized
  return `${BASE_PATH}${normalized}`
}
