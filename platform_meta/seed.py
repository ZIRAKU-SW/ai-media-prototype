#!/usr/bin/env python3
"""運用DB（SQLite）の初期化・シード・バグ登録・JSONエクスポート。

Usage:
  python3 platform_meta/seed.py
  python3 platform_meta/seed.py --register-bug --title "..." --symptom "..." ...
"""

from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "platform.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
EXPORT_PATH = ROOT / "data" / "platform-bugs.json"


CHANGELOG_ENTRIES: list[dict[str, str]] = [
    {
        "entry_date": "2026-06-10",
        "category": "fix",
        "title": "モバイル記事リストでタイトルが消える",
        "body": "Grid→Flexbox。mobile-shared.css を 1024px 以下に適用。",
    },
    {
        "entry_date": "2026-06-10",
        "category": "fix",
        "title": "カテゴリタブの縦書き崩れ",
        "body": "section-header を grid 化しタブを横スクロール行に配置。",
    },
    {
        "entry_date": "2026-06-09",
        "category": "feat",
        "title": "Notion モック準拠 UI + モバイルレスポンシブ",
        "body": "NotionTopContent / mobile-shared.css 追加。",
    },
]

BUG_ENTRIES: list[dict[str, str | None]] = [
    {
        "title": "モバイル新着記事が画像のみ表示（タイトルなし）",
        "symptom": "iPhone Safari で新着記事がサムネ全幅のみ。カテゴリ・タイトル・日付が見えない。ランキングは正常。",
        "root_cause": "640px以下の article-card が CSS Grid (96px+1fr)。Safari等でテキスト列が潰れる。641–1024px はリスト用CSS未適用。",
        "fix": "app/mobile-shared.css: 1024px以下で Flexbox リスト（左96px+右テキスト）。overflow:visible, min-width:0。commit d1e4bc8",
        "affected_themes": "notion",
        "status": "fixed",
        "severity": "high",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "d1e4bc8",
        "tags": "mobile,css,safari,article-card",
    },
    {
        "title": "カテゴリタブが縦書き状に潰れる",
        "symptom": "タブレット幅でカテゴリタブの文字が1文字ずつ縦に並ぶ。",
        "root_cause": "section-header が flex-wrap のみでタブに flex-shrink:0 / 専用行がなかった。",
        "fix": "section-header を grid 化。category-tabs を2行目全幅+横スクロール。commit c2259a2",
        "affected_themes": "notion",
        "status": "fixed",
        "severity": "medium",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "c2259a2",
        "tags": "mobile,css,category-tabs",
    },
    {
        "title": "Markdownテーブルのセパレーター行がそのまま表示",
        "symptom": "|------|--------| が本文に文字列として出る。",
        "root_cause": "正規表現の複数行マッチが不安定。",
        "fix": "render-markdown.ts / ArticlePage: 行単位ステートマシンに書き直し。",
        "affected_themes": "wired,notion,zapier",
        "status": "fixed",
        "severity": "medium",
        "occurred_at": "2026-05-01",
        "fixed_at": "2026-05-01",
        "commit_hash": None,
        "tags": "markdown,article",
    },
    {
        "title": "Zapier記事カード画像が異常に縦長",
        "symptom": "カード画像エリアが画面を占有するほど縦長。",
        "root_cause": "aspect-ratio:16/9 と子 height:100% の干渉。",
        "fix": "zapier.css: article-card__img-wrap を height:190px 固定。",
        "affected_themes": "zapier",
        "status": "fixed",
        "severity": "medium",
        "occurred_at": "2026-05-01",
        "fixed_at": "2026-05-01",
        "commit_hash": None,
        "tags": "css,zapier",
    },
    {
        "title": "Next.js 15+ で params.slug が undefined",
        "symptom": "記事詳細で slug が取れず 404。",
        "root_cause": "App Router の params が Promise 化。",
        "fix": "各 [slug]/page.tsx で const { slug } = use(params)。",
        "affected_themes": "wired,notion,zapier",
        "status": "fixed",
        "severity": "high",
        "occurred_at": "2026-05-01",
        "fixed_at": "2026-05-01",
        "commit_hash": None,
        "tags": "nextjs,routing",
    },
]


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    conn.commit()


def seed_changelog(conn: sqlite3.Connection) -> None:
    for entry in CHANGELOG_ENTRIES:
        exists = conn.execute(
            "SELECT 1 FROM changelog_entries WHERE entry_date = ? AND title = ?",
            (entry["entry_date"], entry["title"]),
        ).fetchone()
        if exists:
            continue
        conn.execute(
            """
            INSERT INTO changelog_entries (entry_date, category, title, body)
            VALUES (?, ?, ?, ?)
            """,
            (entry["entry_date"], entry["category"], entry["title"], entry.get("body", "")),
        )
    conn.commit()


def seed_bugs(conn: sqlite3.Connection) -> None:
    for bug in BUG_ENTRIES:
        exists = conn.execute(
            "SELECT 1 FROM bugs WHERE title = ?",
            (bug["title"],),
        ).fetchone()
        if exists:
            continue
        conn.execute(
            """
            INSERT INTO bugs (
              title, symptom, root_cause, fix, affected_themes,
              status, severity, occurred_at, fixed_at, commit_hash, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                bug["title"],
                bug.get("symptom"),
                bug.get("root_cause"),
                bug.get("fix"),
                bug.get("affected_themes", "all"),
                bug.get("status", "fixed"),
                bug.get("severity", "medium"),
                bug.get("occurred_at"),
                bug.get("fixed_at"),
                bug.get("commit_hash"),
                bug.get("tags"),
            ),
        )
    conn.commit()


def register_bug(conn: sqlite3.Connection, args: argparse.Namespace) -> int:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    conn.execute(
        """
        INSERT INTO bugs (
          title, symptom, root_cause, fix, affected_themes,
          status, severity, occurred_at, fixed_at, commit_hash, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            args.title,
            args.symptom,
            args.root_cause,
            args.fix,
            args.themes or "all",
            args.status or "fixed",
            args.severity or "medium",
            args.occurred_at or now,
            args.fixed_at or (now if (args.status or "fixed") == "fixed" else None),
            args.commit,
            args.tags,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT last_insert_rowid() AS id").fetchone()
    return int(row["id"])


def export_json(conn: sqlite3.Connection) -> None:
    bugs = [dict(row) for row in conn.execute("SELECT * FROM bugs ORDER BY id DESC")]
    changelog = [
        dict(row)
        for row in conn.execute(
            "SELECT * FROM changelog_entries ORDER BY entry_date DESC, id DESC"
        )
    ]
    payload = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "bugs": bugs,
        "changelog": changelog,
    }
    EXPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    EXPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Exported → {EXPORT_PATH.relative_to(ROOT)} ({len(bugs)} bugs)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Platform SQLite seed & bug registry")
    parser.add_argument("--register-bug", action="store_true", help="Register a new bug")
    parser.add_argument("--title", help="Bug title (required with --register-bug)")
    parser.add_argument("--symptom", default=None)
    parser.add_argument("--root-cause", dest="root_cause", default=None)
    parser.add_argument("--fix", default=None)
    parser.add_argument("--themes", default="all", help="e.g. notion,wired")
    parser.add_argument("--status", default="fixed", choices=["open", "fixed", "wontfix"])
    parser.add_argument("--severity", default="medium", choices=["low", "medium", "high"])
    parser.add_argument("--occurred-at", dest="occurred_at", default=None)
    parser.add_argument("--fixed-at", dest="fixed_at", default=None)
    parser.add_argument("--commit", default=None)
    parser.add_argument("--tags", default=None)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.register_bug and not args.title:
        raise SystemExit("--register-bug requires --title")

    conn = connect()
    init_schema(conn)
    seed_changelog(conn)
    seed_bugs(conn)

    if args.register_bug:
        bug_id = register_bug(conn, args)
        print(f"Registered bug #{bug_id}: {args.title}")

    export_json(conn)
    print(f"SQLite → {DB_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
