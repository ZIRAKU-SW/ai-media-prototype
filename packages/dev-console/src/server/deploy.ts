import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { resolveServerConfig, type DevConsoleServerConfig } from "../config";
import { jobPaths } from "./job";

function authorized(request: Request): boolean {
  const required = process.env.DEV_CONSOLE_PASSWORD;
  if (!required) return true;
  return (request.headers.get("x-dev-token") ?? "") === required;
}

export function createDevDeployHandlers(overrides?: Partial<DevConsoleServerConfig>) {
  const cfg = () => resolveServerConfig(overrides);

  async function GET() {
    const statusFile = jobPaths(cfg().projectRoot).buildStatus;
    try {
      const raw = fs.readFileSync(statusFile, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ phase: "idle", message: "", updated_at: null });
    }
  }

  async function POST(request: Request) {
    if (!authorized(request)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { projectRoot, buildScriptPath } = cfg();
    const STATUS_FILE = jobPaths(projectRoot).buildStatus;
    const RUNNER =
      buildScriptPath ?? path.join(projectRoot, "scripts", "dev-console-build.sh");

    try {
      const raw = fs.readFileSync(STATUS_FILE, "utf-8");
      const cur = JSON.parse(raw) as { phase?: string };
      if (cur.phase === "building" || cur.phase === "restarting" || cur.phase === "rolling_back") {
        return NextResponse.json(
          { ok: false, error: "すでにビルド処理が進行中です", phase: cur.phase },
          { status: 409 },
        );
      }
    } catch {
      /* no status yet */
    }

    try {
      fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
      fs.writeFileSync(
        STATUS_FILE,
        JSON.stringify({
          phase: "building",
          message: "ビルドキューに投入しました…",
          updated_at: new Date().toISOString(),
        }),
      );
    } catch {
      /* best effort */
    }

    const child = spawn("bash", [RUNNER], {
      cwd: projectRoot,
      env: { ...process.env },
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    return NextResponse.json({ ok: true, started: true });
  }

  return { GET, POST };
}
