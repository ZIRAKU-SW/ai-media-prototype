-- AIビジネスメディア 運用DB（エージェント向け・ローカル/VM）
-- 記事本番データは Supabase。ここはバグ台帳と変更履歴のみ。

CREATE TABLE IF NOT EXISTS bugs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  symptom TEXT,
  root_cause TEXT,
  fix TEXT,
  affected_themes TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'fixed',
  severity TEXT NOT NULL DEFAULT 'medium',
  occurred_at TEXT,
  fixed_at TEXT,
  commit_hash TEXT,
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS changelog_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_date TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fix',
  title TEXT NOT NULL,
  body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_themes ON bugs(affected_themes);
CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog_entries(entry_date DESC);
