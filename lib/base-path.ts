/** VM / oceanosfleet 用パス接頭辞（Vercel 本番では未設定のまま） */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')

/**
 * fetch / <a> 用の絶対パス。Next.js の `<Link href>` には使わないこと
 * （next.config の basePath が自動付与されるため二重になる）。
 */
export function withBasePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (!BASE_PATH) return normalized
  if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized
  }
  return `${BASE_PATH}${normalized}`
}
