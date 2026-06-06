"""ブラウザ経由のコード修正エージェント（/admin/dev コンソール用）。

Cursor SDK の Agent.prompt で ai-media-prototype 内のソースを直接編集する。
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from cursor_sdk import Agent, AgentOptions, CursorAgentError, LocalAgentOptions

PROJECT_ROOT = Path(__file__).resolve().parent.parent
JOB_FILE = PROJECT_ROOT / "run" / "dev-console-chat.json"
ENV_FILE = PROJECT_ROOT / ".env.local"
DEFAULT_MODEL = os.environ.get("CURSOR_SDK_MODEL", "composer-2.5-fast")

DIFF_SCOPE = [
    "app",
    "components",
    "lib",
    "packages/dev-console",
    "public",
    "scripts",
    "supabase",
    "*.py",
    "*.ts",
    "*.tsx",
    "*.css",
    "*.md",
]
DIFF_EXCLUDE = [
    ":(exclude).next/**",
    ":(exclude)node_modules/**",
    ":(exclude)venv/**",
    ":(exclude)**/__pycache__/**",
    ":(exclude)data/dev-console/**",
    ":(exclude)run/**",
    ":(exclude)logs/**",
]
MAX_DIFF_CHARS = 60_000


def _load_dotenv(path: Path = ENV_FILE) -> None:
    for candidate in (path, PROJECT_ROOT / ".env"):
        if not candidate.is_file():
            continue
        for line in candidate.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, _, value = stripped.partition("=")
            key, value = key.strip(), value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def _git(*args: str) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
    )
    return proc.stdout


def _untracked_files() -> set[str]:
    scope = [*DIFF_SCOPE, *DIFF_EXCLUDE]
    out = _git("ls-files", "--others", "--exclude-standard", "--", *scope).strip()
    return {n for n in out.splitlines() if n.strip()}


def _snapshot_base() -> tuple[str, set[str]]:
    sha = _git("stash", "create").strip()
    if not sha:
        sha = _git("rev-parse", "HEAD").strip()
    return sha, _untracked_files()


def _diff_since(base: str, pre_untracked: set[str]) -> tuple[list[str], str, bool]:
    scope = [*DIFF_SCOPE, *DIFF_EXCLUDE]
    names = _git("diff", "--name-only", base, "--", *scope).strip()
    changed = [n for n in names.splitlines() if n.strip()]
    new_untracked = _untracked_files() - pre_untracked
    for n in sorted(new_untracked):
        if n not in changed:
            changed.append(n)
    diff_text = _git("diff", base, "--", *scope)
    truncated = False
    if len(diff_text) > MAX_DIFF_CHARS:
        diff_text = diff_text[:MAX_DIFF_CHARS]
        truncated = True
    return changed, diff_text, truncated


def _build_prompt(message: str, image_paths: list[str] | None = None) -> str:
    image_block = ""
    if image_paths:
        joined = "\n".join(f"- {p}" for p in image_paths)
        image_block = f"""
## 参考画像（貼り付け資料）
以下を Read で確認し、調査・修正の参考にしてください:
{joined}
"""
    return f"""あなたは AIビジネスメディア（Next.js App Router + Supabase + 3デザインテーマ）の
コード修正エージェントです。エンジニアでないユーザーがブラウザから依頼しています。

プロジェクトルート: {PROJECT_ROOT}

## 依頼
{message}
{image_block}
## 作業ルール（必須）
1. UI変更・バグ修正は **wired / notion / zapier の3テーマすべて** に対応する
2. トップページ共通ロジック: components/pages/TopPage.tsx + components/top/*TopContent.tsx
3. 記事詳細: components/pages/ArticlePage.tsx（3テーマ共通）
4. 記事追加: lib/dummy-articles.ts + supabase/seeds/articles.sql
5. テーマCSS: app/(wired)/wired.css, app/(notion)/notion.css, app/(zapier)/zapier.css
6. 詳細ルールは CLAUDE.md と CURSOR_HANDOFF.md を Read して従う

## 進め方
1. app/, components/, lib/ を中心に最小限の変更で実装
2. 提案だけでなく必ずファイルを編集する
3. .next, node_modules, .env.local は編集しない

## 報告（日本語・簡潔）
- 変更ファイルと理由
- 3テーマでの確認URL（/wired, /notion, /zapier）
- ビルドが必要か
"""


def _mark_active_done(activity: list[dict[str, Any]]) -> None:
    for item in activity:
        if item.get("status") == "active":
            item["status"] = "done"


def _write_job(state: dict[str, Any]) -> None:
    JOB_FILE.parent.mkdir(parents=True, exist_ok=True)
    state.setdefault("updated_at", datetime.now(timezone.utc).isoformat())
    JOB_FILE.write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")


def _log_activity(
    activity: list[dict[str, Any]],
    level: int,
    text: str,
    *,
    status: str = "active",
    phase: str = "running",
) -> None:
    _mark_active_done(activity)
    activity.append({"level": level, "text": text, "status": status})
    _write_job({"phase": phase, "message": text, "activity": activity})


def run_dev_agent(
    message: str,
    image_paths: list[str] | None = None,
    activity: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    _load_dotenv()
    message = (message or "").strip()
    if not message:
        return {"error": "message が空です", "reply": "", "changed_files": [], "diff": ""}

    key = os.environ.get("CURSOR_API_KEY")
    if not key:
        return {
            "error": "CURSOR_API_KEY が未設定です（.env.local に設定してください）",
            "reply": "",
            "changed_files": [],
            "diff": "",
        }

    act = activity if activity is not None else []

    def log(level: int, text: str, status: str = "active") -> None:
        if activity is None:
            return
        _log_activity(act, level, text, status=status)

    log(0, "依頼内容を解析", "done")
    log(0, "git stash で作業前スナップショットを取得", "active")
    base, pre_untracked = _snapshot_base()
    log(0, f"スナップショット: {base[:12]}…", "done")

    if image_paths:
        log(0, f"参考画像 {len(image_paths)} 件", "done")

    preview = message.replace("\n", " ")[:72]
    log(0, f"プロンプト: 「{preview}{'…' if len(message) > 72 else ''}」", "done")
    log(0, f"Agent.prompt（model={DEFAULT_MODEL}）を起動", "active")

    started = time.monotonic()
    try:
        result = Agent.prompt(
            _build_prompt(message, image_paths),
            AgentOptions(
                api_key=key,
                model=DEFAULT_MODEL,
                local=LocalAgentOptions(cwd=str(PROJECT_ROOT)),
            ),
        )
        reply = getattr(result, "result", str(result))
    except CursorAgentError as exc:
        log(0, f"Agent エラー: {str(exc)[:120]}", "done")
        return {
            "error": str(exc)[:800],
            "reply": "",
            "changed_files": [],
            "diff": "",
            "elapsed_ms": int((time.monotonic() - started) * 1000),
            "activity": act,
        }

    log(0, "Agent 応答を受信", "done")
    log(0, "git diff で変更ファイルを抽出", "active")
    changed, diff_text, truncated = _diff_since(base, pre_untracked)
    log(0, f"変更 {len(changed)} ファイルを検出", "done")
    for f in changed[:12]:
        log(1, f"Edited   {f}", "done")
    if len(changed) > 12:
        log(1, f"…他 {len(changed) - 12} ファイル", "done")

    if changed:
        log(0, "変更あり → npm run build で確認推奨", "done")

    _mark_active_done(act)
    return {
        "error": None,
        "reply": reply,
        "changed_files": changed,
        "diff": diff_text,
        "truncated": truncated,
        "needs_build": bool(changed),
        "elapsed_ms": int((time.monotonic() - started) * 1000),
        "activity": act,
    }


def run_job_from_payload(payload: dict[str, Any]) -> None:
    message = str(payload.get("message", "")).strip()
    raw_paths = payload.get("image_paths") or []
    image_paths = [str(p) for p in raw_paths if p]
    session_id = str(payload.get("session_id") or "")

    activity: list[dict[str, Any]] = []
    _log_activity(activity, 0, "ジョブを開始", status="done")
    _write_job(
        {
            "phase": "running",
            "message": "Cursor エージェントを実行中…",
            "activity": activity,
            "session_id": session_id,
        }
    )
    try:
        result = run_dev_agent(message, image_paths or None, activity)
        phase = "error" if result.get("error") else "done"
        _mark_active_done(activity)
        _write_job(
            {
                "phase": phase,
                "message": "",
                "session_id": session_id,
                "activity": result.get("activity") or activity,
                **{k: v for k, v in result.items() if k != "activity"},
            }
        )
    except Exception as exc:  # noqa: BLE001
        _mark_active_done(activity)
        _write_job(
            {
                "phase": "error",
                "message": str(exc)[:800],
                "error": str(exc)[:800],
                "reply": "",
                "changed_files": [],
                "diff": "",
                "session_id": session_id,
                "activity": activity,
            }
        )


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "--job":
        input_path = PROJECT_ROOT / "run" / "dev-console-chat-input.json"
        payload = json.loads(input_path.read_text(encoding="utf-8"))
        run_job_from_payload(payload)
        return

    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        payload = {"message": raw}
    image_paths = payload.get("image_paths")
    paths = [str(p) for p in image_paths] if image_paths else None
    result = run_dev_agent(str(payload.get("message", "")), paths)
    sys.stdout.write(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
