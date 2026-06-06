import fs from "node:fs";
import path from "node:path";

export const DEV_JOB_STALE_MS = 25 * 60 * 1000;

export type DevChatJob = Record<string, unknown> & {
  phase?: string;
  updated_at?: string | null;
};

export function jobPaths(projectRoot: string) {
  const run = path.join(projectRoot, "run");
  return {
    chatJob: path.join(run, "dev-console-chat.json"),
    chatInput: path.join(run, "dev-console-chat-input.json"),
    agentPid: path.join(run, "dev-console-agent.pid"),
    buildStatus: path.join(run, "dev-console-build.json"),
    uploadDir: path.join(projectRoot, "data", "dev-console", "uploads"),
    agentLog: path.join(projectRoot, "logs", "nextjs", "dev-console-agent.log"),
  };
}

export function readDevChatJob(projectRoot: string): DevChatJob {
  const { chatJob } = jobPaths(projectRoot);
  try {
    return JSON.parse(fs.readFileSync(chatJob, "utf-8")) as DevChatJob;
  } catch {
    return { phase: "idle", message: "", updated_at: null };
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function isDevChatJobStale(projectRoot: string, job: DevChatJob): boolean {
  if (job.phase !== "running") return false;
  const updated = job.updated_at ? Date.parse(String(job.updated_at)) : NaN;
  const { agentPid } = jobPaths(projectRoot);
  if (!Number.isNaN(updated) && Date.now() - updated > DEV_JOB_STALE_MS) {
    return true;
  }
  try {
    const raw = fs.readFileSync(agentPid, "utf-8").trim();
    const pid = Number(raw);
    if (raw && Number.isFinite(pid) && pid > 0 && !isProcessAlive(pid)) {
      return true;
    }
  } catch {
    if (!Number.isNaN(updated) && Date.now() - updated > 3 * 60 * 1000) {
      return true;
    }
  }
  return false;
}

export function writeDevChatJob(projectRoot: string, state: DevChatJob): void {
  const { chatJob } = jobPaths(projectRoot);
  fs.mkdirSync(path.dirname(chatJob), { recursive: true });
  const next = { ...state, updated_at: new Date().toISOString() };
  fs.writeFileSync(chatJob, JSON.stringify(next, null, 2), "utf-8");
}

export function clearStaleDevChatJob(projectRoot: string, reason: string): DevChatJob {
  const cleared: DevChatJob = {
    phase: "error",
    message: reason,
    error: reason,
    reply: "",
    changed_files: [],
    diff: "",
    activity: [],
    updated_at: new Date().toISOString(),
  };
  writeDevChatJob(projectRoot, cleared);
  const { agentPid } = jobPaths(projectRoot);
  try {
    fs.unlinkSync(agentPid);
  } catch {
    /* ignore */
  }
  return cleared;
}

export function reconcileDevChatJob(projectRoot: string): DevChatJob {
  const job = readDevChatJob(projectRoot);
  if (!isDevChatJobStale(projectRoot, job)) return job;
  return clearStaleDevChatJob(
    projectRoot,
    "前回のエージェント実行が中断されました（サーバー再起動など）。もう一度送信してください。",
  );
}
