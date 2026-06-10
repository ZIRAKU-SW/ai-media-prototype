import { readFileSync } from 'fs'
import { join } from 'path'

export type PlatformBug = {
  id: number
  title: string
  symptom: string | null
  root_cause: string | null
  fix: string | null
  affected_themes: string
  status: 'open' | 'fixed' | 'wontfix' | string
  severity: 'low' | 'medium' | 'high' | string
  occurred_at: string | null
  fixed_at: string | null
  commit_hash: string | null
  tags: string | null
  created_at: string
  updated_at: string
}

export type ChangelogEntry = {
  id: number
  entry_date: string
  category: string
  title: string
  body: string | null
  created_at: string
}

export type PlatformExport = {
  exported_at: string
  bugs: PlatformBug[]
  changelog: ChangelogEntry[]
}

const EXPORT_PATH = join(process.cwd(), 'data', 'platform-bugs.json')

export function loadPlatformExport(): PlatformExport {
  try {
    const raw = readFileSync(EXPORT_PATH, 'utf-8')
    return JSON.parse(raw) as PlatformExport
  } catch {
    return { exported_at: '', bugs: [], changelog: [] }
  }
}

export function themeLabel(themes: string): string {
  if (!themes || themes === 'all') return '全テーマ'
  return themes
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' / ')
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    open: '未対応',
    fixed: '修正済み',
    wontfix: '対応しない',
  }
  return map[status] ?? status
}
