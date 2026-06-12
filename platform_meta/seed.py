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
        "entry_date": "2026-06-12",
        "category": "feat",
        "title": "会社情報ページをプロ品質ダークコーポレートに全面刷新",
        "body": "『AIが書いたページ感』脱却。Unsplashの未来感写真6枚（地球夜景ヒーロー/回路基板/サーバー/コード）を public/corp/ に取得し、ダークテーマ+グラスKPIストリップ+スクロール連動フェード（IntersectionObserver、JS無効時は常時表示・prefers-reduced-motion対応）+アウトライン数字+オフセットフレーム写真で構成。c2-* 名前空間で実装、会員エリアの corp-* とは独立。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "fix",
        "title": "動画URL切れ2件修正 + モバイルファビコン + ロゴ統一展開 + ヘッダー設定導線",
        "body": "①記事2本の動画が再生不可（抽出スクリプトがURLを90文字で切り詰めたまま記事化）→完全URLに修正し全5動画の疎通確認。②app/apple-icon.png 追加でiOS/Androidのタブ・ホーム画面にロゴ表示。③全テーマの『青箱にAI』『⚡』旧ロゴを ZirakuLogoMark(mono) に統一（header/footer/記事ページ計7箇所）。④ログイン中ヘッダーとハンバーガードロワーに『会員情報・設定』リンク、設定ページにメールアドレス変更を追加。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "コーポレートデザイン刷新（会社情報/会員エリア）+ 顧客アンケート/設定画面 + 記事3本",
        "body": "絵文字を全廃し ZirakuIcons（SVGラインアイコン15種）に統一。会社情報を ZirakuCompanyContent でコーポレート品質に刷新（ダークヒーロー/CEO/事業/選ばれる理由/CTA）。会員エリアに WORK WITH US CTA。signup に顧客セグメントアンケート（氏名/会社/規模/役職/関心→profiles 4カラム追加+トリガー反映、本番DB適用済み）。/ziraku/settings 新設（プロフィール編集+パスワード変更）。記事3本追加（役割プロンプト/一文iOSアプリ/Obsidian×YouTube複利）。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "会員限定記事3本 + 限定記事の閲覧ゲート実装、統計バンド削除",
        "body": "is_members_only 記事（Hyperagent自律実例/YouTube一気通貫/Microsoft採用、いずれも動画埋め込み・編集部深掘り付き）。RLSを『ログイン済みなら閲覧可』に変更、未ログインは🔒ゲート（service_roleでタイトルのみ取得）、会員エリアに限定記事一覧。render-markdown に !video[poster](mp4) 記法追加。ドラフトに無い統計バンドは完全削除（台帳 #25）。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku 会員限定エリア実装 + ログイン後のCTA切替",
        "body": "/ziraku/members 新設（未ログインはゲート表示）。実体特典2つ: AI活用チェックリスト（10項目診断・スコア判定）と営業効率化プロンプト集（コピー機能付き6本）。会員限定記事・セミナー優先は準備中表示。ログイン中はヒーローCTA・緑バナーが会員エリア誘導に切替（『ログイン後も会員登録表示』の不整合を解消）。E2Eログインフローで検証済み。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku 会員ログイン・会員登録を実装（Supabase Auth）",
        "body": "/ziraku/login・/ziraku/signup を新設（メール+パスワード、エラー日本語化、メール確認フロー対応）。ヘッダーがログイン状態を検知しユーザー表示+ログアウトに切替（SiteHeader にオプショナル authArea props 追加・他テーマ不変）。ヒーロー/会員バナーCTAを signup へ接続。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku トップのセクション配置をドラフトに準拠（カテゴリ移動・統計縮小）",
        "body": "カテゴリ6カードをクリック可能なコンパクトリンクカード（/ziraku/category/[slug]）にして記事セクション下へ移動。新着記事+右ランキングがドラフト通り上段に。統計バンドを max-width 820px のコンパクトパネルへ縮小。台帳 #20。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku 会員バナー刷新 + 角丸・ピル化で親しみ路線に統一",
        "body": "会員登録バナーをドラフト準拠の全幅横長レイアウトに（原画切り出しの人物イラスト・横並び4特典・角丸チェックアイコン・緑ピルボタン+白丸矢印）。ヒーローCTAをピル形状+白丸『かんたん1分！』バーストに。--radius 16px / --radius-sm 10px、緑を #0a9180 系ティールへ。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku ロゴ統一 + ファビコン刷新",
        "body": "ドラフトの分子ネットワークマークを ZirakuLogoMark コンポーネント化しヘッダー（青）・フッター（白mono）で統一。ファビコンを Next デフォルト（黒地三角）から青角丸+白マークの app/icon.png / favicon.ico に差し替え（全テーマ共通）。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku ヒーローをドラフト原画イラストに差し替え",
        "body": "自作SVGイラストをやめ、docs/assets/サイトイメージ1.png から手描き風イラスト（人物＋PC＋吹き出しテキスト入り）を原寸切り出して public/ziraku-hero.png として使用。HTML側の浮遊カードはテキストが画像に含まれるため削除。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku トップをドラフト『親しみ路線』に寄せ込み",
        "body": "ヒーローを全面刷新（eyebrow ピル＋黄色マーカーの『AI』ハイライト H1＋自作フラットSVGイラスト＋浮遊カード2枚）。統計バンドをヒーロー直下の薄青帯へ分離、4バリューカードを白＋青アイコン化。PC/モバイル両対応（テキスト→イラスト→全幅CTAの縦積み）。ziraku.css と ZirakuTopContent.tsx のみ編集（他3テーマ非影響）。",
    },
    {
        "entry_date": "2026-06-11",
        "category": "feat",
        "title": "ziraku テーマのバックボーン実装",
        "body": "記事一覧/詳細・カテゴリ別・サービス・会社情報・セミナー・プライバシーの7ページ追加。SiteTheme に ziraku を追加し ThemeArticlePage/CompanyPage を共用。トップのデッドリンク・notion 行きリンクを解消。コミット 4917c60。",
    },
    {
        "entry_date": "2026-06-10",
        "category": "fix",
        "title": "Vercelビルド失敗（ThemeSiteHeader未コミット）",
        "body": "components/theme/ThemeSiteHeader.tsx を追加して push。",
    },
    {
        "entry_date": "2026-06-10",
        "category": "fix",
        "title": "Zapier記事カードが画像のみ表示",
        "body": "ZapierArticleCard コンポーネント + zapier.css モバイルリスト化。",
    },
    {
        "entry_date": "2026-06-10",
        "category": "fix",
        "title": "メルマガバナーの縦書き崩れ",
        "body": "3テーマ共通で newsletter-banner の writing-mode / flex を修正。",
    },
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
    {
        "title": "メルマガバナーの文字が縦書き状に潰れる",
        "symptom": "モバイル幅でメルマガ登録バナーの文言が1文字ずつ縦に並ぶ。3テーマ共通。",
        "root_cause": "バナー内 flex 子要素に min-width:0 / white-space がなく狭幅で折り返しが縦積み化。",
        "fix": "各テーマ CSS + mobile-shared.css: newsletter-banner に flex 横並び・nowrap・writing-mode:horizontal-tb。commit fa95673",
        "affected_themes": "wired,notion,zapier",
        "status": "fixed",
        "severity": "medium",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "fa95673",
        "tags": "mobile,css,newsletter-banner",
    },
    {
        "title": "Notion記事リストでサムネとタイトルが重なる",
        "symptom": "モバイルで新着記事カードのサムネイルとタイトル・日付が重なって読めない。",
        "root_cause": "article-card の Grid レイアウトと position/overflow の組み合わせでテキスト列が画像下に潜る。",
        "fix": "mobile-shared.css を .notion-root にスコープ。Flexbox リスト（左96px+右テキスト）に統一。commit d38d376",
        "affected_themes": "notion",
        "status": "fixed",
        "severity": "high",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "d38d376",
        "tags": "mobile,css,article-card,notion",
    },
    {
        "title": "Zapier新着記事が画像のみ表示（タイトルなし）",
        "symptom": "Zapierトップの記事カードがサムネ画像だけ。タイトル・カテゴリ・日付が見えない。",
        "root_cause": "Zapier 専用カード構造がなく共通 CSS が効かず、モバイルでテキスト領域が非表示化。",
        "fix": "components/zapier/ZapierArticleCard.tsx 追加。zapier.css でモバイル横リスト化。commit 7950072",
        "affected_themes": "zapier",
        "status": "fixed",
        "severity": "high",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "7950072",
        "tags": "mobile,css,zapier,article-card",
    },
    {
        "title": "Wiredモバイルでカテゴリタブが縦書き状に潰れる",
        "symptom": "Wired テーマのタブレット/モバイル幅でカテゴリタブが1文字ずつ縦に並ぶ。",
        "root_cause": "wired.css の section-header が flex-wrap のみ。1200px以下でタブ専用行がなかった。",
        "fix": "wired.css: 1200px以下で section-header を grid 化、category-tabs を横スクロール行に。commit 0bfe446",
        "affected_themes": "wired",
        "status": "fixed",
        "severity": "medium",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "0bfe446",
        "tags": "mobile,css,category-tabs,wired",
    },
    {
        "title": "Vercelデプロイ失敗（ThemeSiteHeader未コミット）",
        "symptom": "git push 後 Vercel ビルドが Module not found: ThemeSiteHeader で失敗。",
        "root_cause": "ThemeSiteHeader.tsx をローカルで作成したが git add/commit 漏れ。リモートにファイルがない。",
        "fix": "components/theme/ThemeSiteHeader.tsx をコミットして push。commit 82c3ad0",
        "affected_themes": "wired,notion,zapier",
        "status": "fixed",
        "severity": "high",
        "occurred_at": "2026-06-10",
        "fixed_at": "2026-06-10",
        "commit_hash": "82c3ad0",
        "tags": "deploy,vercel,build",
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
