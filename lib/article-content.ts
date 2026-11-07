import 'server-only'
import { readFileSync } from 'fs'
import path from 'path'

/**
 * 記事本文のファイルソース。
 * data/articles-md/<slug>.md が正規の本文（admin UIからも参照）。
 * Supabaseの content が空、またはダミー記事フォールバック時に使う。
 */
export function loadArticleMarkdown(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  try {
    return readFileSync(path.join(process.cwd(), 'data', 'articles-md', `${slug}.md`), 'utf-8')
  } catch {
    return null
  }
}
