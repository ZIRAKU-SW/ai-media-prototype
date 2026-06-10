import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { resolveServerConfig, type DevConsoleServerConfig } from "../config";
import { jobPaths, reconcileDevChatJob, writeDevChatJob } from "./job";
import { proxyDevRequest, shouldProxyToBackend } from "./proxy";

function authorized(request: Request): boolean {
  const required = process.env.DEV_CONSOLE_PASSWORD;
  if (!required) return true;
  return (request.headers.get("x-dev-token") ?? "") === required;
}

export function createDevChatHandlers(overrides?: Partial<DevConsoleServerConfig>) {
  if (shouldProxyToBackend()) {
    return {
      GET: (request: Request) => proxyDevRequest(request, "chat"),
      POST: (request: Request) => proxyDevRequest(request, "chat"),
      DELETE: (request: Request) => proxyDevRequest(request, "chat"),
    };
  }

  const cfg = () => resolveServerConfig(overrides);

  async function GET() {
    return NextResponse.json(reconcileDevChatJob(cfg().projectRoot));
  }

  async function DELETE(request: Request) {
    if (!authorized(request)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    const { projectRoot } = cfg();
    writeDevChatJob(projectRoot, { phase: "idle", message: "", activity: [] });
    try {
      fs.unlinkSync(jobPaths(projectRoot).agentPid);
    } catch {
      /* ignore */
    }
    return NextResponse.json({ ok: true, phase: "idle" });
  }

  async function POST(request: Request) {
    if (!authorized(request)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { projectRoot, pythonModule, pythonPath } = cfg();
    const paths = jobPaths(projectRoot);

    let message = "";
    let imagePaths: string[] = [];
    let sessionId = "";
    try {
      const body = await request.json();
      message = String(body.message ?? "").trim();
      sessionId = String(body.session_id ?? "").trim();
      if (Array.isArray(body.image_paths)) {
        imagePaths = body.image_paths.map((p: unknown) => String(p)).filter(Boolean);
      }
    } catch {
      return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "メッセージが空です" }, { status: 400 });
    }

    const cur = reconcileDevChatJob(projectRoot);
    if (cur.phase === "running") {
      return NextResponse.json(
        { error: "すでにエージェントが実行中です。完了までお待ちください。" },
        { status: 409 },
      );
    }

    fs.mkdirSync(path.dirname(paths.chatInput), { recursive: true });
    fs.writeFileSync(
      paths.chatInput,
      JSON.stringify({ message, image_paths: imagePaths, session_id: sessionId }),
      "utf-8",
    );
    writeDevChatJob(projectRoot, {
      phase: "running",
      message: "キューに投入しました…",
      session_id: sessionId,
      activity: [{ level: 0, text: "ジョブをキューに投入", status: "done" }],
    });

    fs.mkdirSync(path.dirname(paths.agentLog), { recursive: true });
    const logFd = fs.openSync(paths.agentLog, "a");

    const py = pythonPath ?? "python3";
    const child = spawn(py, ["-m", pythonModule, "--job"], {
      cwd: projectRoot,
      env: { ...process.env, PYTHONPATH: projectRoot },
      detached: true,
      stdio: ["ignore", logFd, logFd],
    });
    if (child.pid) {
      fs.writeFileSync(paths.agentPid, String(child.pid), "utf-8");
    }
    child.unref();
    fs.closeSync(logFd);

    return NextResponse.json({ ok: true, phase: "running" });
  }

  return { GET, POST, DELETE };
}
