"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { welcomeMessage } from "../config";
import { DevConsoleProvider, useDevConsoleConfig } from "../context";
import { fetchJsonWithRetry, parseJsonResponse } from "../lib/fetch-json-retry";
import type { DevConsoleConfig, DevConsoleStorageKeys } from "../config";
import { DevAgentActivityPanel, type ActivityLine } from "./DevAgentActivityPanel";
import { DevConsoleChatBubble } from "./DevConsoleChatBubble";
import type { ChatAttachment, ChatMsg, DevRetryContext } from "./types";

type PendingImage = {
  id: string;
  file: File;
  preview: string;
};

type DeployStatus = {
  phase: string;
  message: string;
  updated_at: string | null;
};

type ChatJob = {
  phase: string;
  message?: string;
  error?: string | null;
  reply?: string;
  changed_files?: string[];
  diff?: string;
  needs_build?: boolean;
  activity?: ActivityLine[];
  session_id?: string;
};

type DevSession = {
  id: string;
  title: string;
  messages: ChatMsg[];
  lastResult: ChatMsg | null;
  updatedAt: number;
  retryContext: DevRetryContext | null;
};

const LEFT_WIDTH_MIN = 180;
const LEFT_WIDTH_MAX = 400;
const RIGHT_WIDTH_MIN = 280;
/** 中央チャットの最小幅（これより右パネルは広げない） */
const CHAT_MIN_WIDTH = 280;
const LEFT_COLLAPSED_RAIL = 44;
const RESIZE_HANDLE_WIDTH = 6;

function rightPanelWidthBounds(
  viewportWidth: number,
  leftVisible: boolean,
  leftPanelWidth: number,
): { min: number; max: number } {
  const leftOccupied =
    (leftVisible ? leftPanelWidth : LEFT_COLLAPSED_RAIL) +
    (leftVisible ? RESIZE_HANDLE_WIDTH : 0);
  const max = Math.max(
    RIGHT_WIDTH_MIN,
    viewportWidth - leftOccupied - RESIZE_HANDLE_WIDTH - CHAT_MIN_WIDTH,
  );
  return { min: RIGHT_WIDTH_MIN, max };
}

function clampRightPanelWidth(
  width: number,
  viewportWidth: number,
  leftVisible: boolean,
  leftPanelWidth: number,
): number {
  const { min, max } = rightPanelWidthBounds(viewportWidth, leftVisible, leftPanelWidth);
  return Math.min(max, Math.max(min, width));
}

const PHASE_LABEL: Record<string, { label: string; tone: string }> = {
  idle: { label: "待機中", tone: "text-[var(--cl-muted)]" },
  building: { label: "ビルド中", tone: "text-amber-400/90" },
  restarting: { label: "再起動中", tone: "text-amber-400/90" },
  rolling_back: { label: "ロールバック中", tone: "text-orange-400/90" },
  success: { label: "反映完了", tone: "text-[var(--cl-accent)]" },
  build_failed: { label: "ビルド失敗", tone: "text-red-400/90" },
  rolled_back: { label: "差し戻し済", tone: "text-orange-400/90" },
};

const BUSY_DEPLOY = new Set(["building", "restarting", "rolling_back"]);

function readToken(keys: DevConsoleStorageKeys): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(keys.token) ?? "";
}

function newSession(welcome: ChatMsg): DevSession {
  return {
    id: crypto.randomUUID(),
    title: "新しい会話",
    messages: welcome.text?.trim() ? [welcome] : [],
    lastResult: null,
    updatedAt: Date.now(),
    retryContext: null,
  };
}

function isRetryableErrorMessage(text: string): boolean {
  return (
    text.startsWith("通信エラー:") ||
    text.startsWith("エラー:") ||
    text === "認証が必要です。"
  );
}

const POLL_MAX_MS = 20 * 60 * 1000;

function sessionMissingAssistantReply(messages: ChatMsg[]): boolean {
  let lastUser = -1;
  let lastAssistant = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && lastUser < 0) lastUser = i;
    if (messages[i].role === "assistant" && lastAssistant < 0) lastAssistant = i;
  }
  return lastUser >= 0 && lastAssistant < lastUser;
}

function stripTrailingRetryableErrors(messages: ChatMsg[]): ChatMsg[] {
  const msgs = [...messages];
  while (msgs.length > 0) {
    const last = msgs[msgs.length - 1];
    if (last.role === "system" && isRetryableErrorMessage(last.text)) {
      msgs.pop();
      continue;
    }
    break;
  }
  return msgs;
}

function chatJobToResult(job: ChatJob): ChatMsg {
  return {
    role: "assistant",
    text: job.reply || "(返答なし)",
    changedFiles: job.changed_files ?? [],
    diff: job.diff ?? "",
    needsBuild: job.needs_build ?? false,
  };
}

function loadSessions(
  keys: DevConsoleStorageKeys,
  welcome: ChatMsg,
): { sessions: DevSession[]; activeId: string } {
  try {
    const raw = localStorage.getItem(keys.sessions);
    if (!raw) {
      const s = newSession(welcome);
      return { sessions: [s], activeId: s.id };
    }
    const parsed = JSON.parse(raw) as { sessions: DevSession[]; activeId: string };
    if (!parsed.sessions?.length) {
      const s = newSession(welcome);
      return { sessions: [s], activeId: s.id };
    }
    return {
      sessions: parsed.sessions.map((s) => ({
        ...s,
        retryContext: s.retryContext ?? null,
      })),
      activeId: parsed.activeId,
    };
  } catch {
    const s = newSession(welcome);
    return { sessions: [s], activeId: s.id };
  }
}

function sessionTitleFromMessage(msg: string): string {
  const t = msg.replace(/\s+/g, " ").trim();
  return t.length > 28 ? `${t.slice(0, 28)}…` : t || "新しい会話";
}

function DevConsoleClientInner() {
  const { api, keys, branding, welcomeText, autoDeployDefault } = useDevConsoleConfig();
  // welcome の参照が毎レンダー変わると初期化 effect が再実行され、
  // localStorage から旧セッションを再ロードして送信直後のメッセージを巻き戻してしまう
  const welcome = useMemo(() => welcomeMessage(welcomeText), [welcomeText]);

  const [sessions, setSessions] = useState<DevSession[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLine[]>([]);
  const [deploy, setDeploy] = useState<DeployStatus>({ phase: "idle", message: "", updated_at: null });
  const [needAuth, setNeedAuth] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [rightWidth, setRightWidth] = useState(420);
  const [leftWidth, setLeftWidth] = useState(208);
  const [leftVisible, setLeftVisible] = useState(true);
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragRef = useRef<{ startX: number; startW: number; side: "left" | "right" } | null>(null);
  const sendingSessionRef = useRef<string>("");

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const messages = active?.messages ?? [];
  const lastResult = active?.lastResult ?? null;
  const deployBusy = BUSY_DEPLOY.has(deploy.phase);

  useEffect(() => {
    // 初期化（localStorage からの復元）は一度だけ。再実行すると会話 state が巻き戻る
    if (hydrated) return;
    const savedToken = readToken(keys);
    if (savedToken) {
      setPwInput(savedToken);
    }
    const { sessions: s, activeId: id } = loadSessions(keys, welcome);
    setSessions(s);
    setActiveId(id);
    const leftVis = localStorage.getItem(keys.leftVisible) !== "false";
    const lwRaw = localStorage.getItem(keys.leftWidth);
    const lw = lwRaw
      ? Math.min(LEFT_WIDTH_MAX, Math.max(LEFT_WIDTH_MIN, Number(lwRaw) || 208))
      : 208;
    setLeftVisible(leftVis);
    setLeftWidth(lw);
    const vw = window.innerWidth;
    const rw = localStorage.getItem(keys.rightWidth);
    const rwNum = rw ? Number(rw) || 420 : 420;
    setRightWidth(clampRightPanelWidth(rwNum, vw, leftVis, lw));
    const autoKey = keys.autoDeploy;
    const storedAuto = localStorage.getItem(autoKey);
    setAutoDeploy(
      storedAuto === null ? (autoDeployDefault ?? true) : storedAuto !== "false",
    );
    setHydrated(true);
  }, [hydrated, keys, welcome, autoDeployDefault]);

  useEffect(() => {
    if (!hydrated) return;
    const onResize = () => {
      setRightWidth((w) => {
        const next = clampRightPanelWidth(w, window.innerWidth, leftVisible, leftWidth);
        if (next !== w) localStorage.setItem(keys.rightWidth, String(next));
        return next;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hydrated, leftVisible, leftWidth]);

  useEffect(() => {
    if (!hydrated) return;
    setRightWidth((w) => clampRightPanelWidth(w, window.innerWidth, leftVisible, leftWidth));
  }, [hydrated, leftVisible, leftWidth]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(keys.sessions, JSON.stringify({ sessions, activeId }));
  }, [sessions, activeId, hydrated, keys.sessions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, activityLog, activeId]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingImages]);

  useEffect(() => {
    if (!deployBusy) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(api.deploy, { cache: "no-store" });
        if (res.ok) setDeploy((await res.json()) as DeployStatus);
      } catch {
        /* 再起動中 */
      }
    }, 2000);
    return () => clearInterval(id);
  }, [deployBusy, api.deploy]);

  const patchSession = useCallback((id: string, patch: Partial<DevSession>) => {
    setSessions((list) =>
      list.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s)),
    );
  }, [api, keys]);

  const startDeploy = useCallback(async () => {
    setDeploy({ phase: "building", message: "ビルドを開始します…", updated_at: null });
    try {
      const res = await fetch(api.deploy, {
        method: "POST",
        headers: { "x-dev-token": readToken(keys) },
      });
      if (res.status === 401) {
        setNeedAuth(true);
        return false;
      }
      if (!res.ok) {
        const j = await parseJsonResponse(res).catch(() => ({ error: "起動に失敗しました" }));
        setDeploy({
          phase: "build_failed",
          message: String(j.error ?? "起動に失敗しました"),
          updated_at: null,
        });
        return false;
      }
      return true;
    } catch (err) {
      setDeploy({
        phase: "build_failed",
        message: `起動エラー: ${err instanceof Error ? err.message : String(err)}`,
        updated_at: null,
      });
      return false;
    }
  }, []);

  const pollChatJob = useCallback((sessionId: string): Promise<ChatJob> => {
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();

      const stopPoll = () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };

      const tick = async () => {
        if (Date.now() - startedAt > POLL_MAX_MS) {
          stopPoll();
          reject(
            new Error(
              "エージェントの応答待ちがタイムアウトしました（最大20分）。ページを再読み込みするか「再試行」を押してください。",
            ),
          );
          return;
        }

        try {
          const res = await fetchJsonWithRetry(
            api.chat,
            { cache: "no-store" },
            { retries: 8, delayMs: 1500 },
          );
          const job = (await parseJsonResponse(res)) as ChatJob;
          if (job.activity?.length) setActivityLog(job.activity);
          if (job.phase === "running") return;
          stopPoll();
          resolve(job);
        } catch {
          setActivityLog([
            {
              level: 0,
              text: "サーバー接続を再試行中（ビルド・再起動中の可能性）…",
              status: "active",
            },
          ]);
        }
      };

      void tick();
      pollRef.current = setInterval(() => void tick(), 2000);
    });
  }, []);

  const recoverCompletedJob = useCallback(async (sid: string) => {
    try {
      const res = await fetch(api.chat, { cache: "no-store" });
      const job = (await parseJsonResponse(res)) as ChatJob;
      if (job.phase !== "done" || !job.reply) return;
      const targetSid = job.session_id && job.session_id === sid ? sid : sid;
      if (job.session_id && job.session_id !== sid) return;

      setSessions((list) =>
        list.map((s) => {
          if (s.id !== targetSid) return s;
          if (!sessionMissingAssistantReply(s.messages)) return s;
          const result = chatJobToResult(job);
          if (s.messages.some((m) => m.role === "assistant" && m.text === result.text)) {
            return { ...s, retryContext: null };
          }
          const msgs = [
            ...stripTrailingRetryableErrors(s.messages),
            result,
            {
              role: "system" as const,
              text: "※ サーバー上で完了していた応答を表示しました。",
            },
          ];
          return {
            ...s,
            messages: msgs,
            lastResult: result,
            retryContext: null,
            updatedAt: Date.now(),
          };
        }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !activeId) return;
    void recoverCompletedJob(activeId);
  }, [hydrated, activeId, recoverCompletedJob]);

  const uploadImages = useCallback(
    async (images: PendingImage[]): Promise<{ paths: string[]; attachments: ChatAttachment[] }> => {
      const paths: string[] = [];
      const attachments: ChatAttachment[] = [];
      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img.file);
        const res = await fetch(api.upload, {
          method: "POST",
          headers: { "x-dev-token": readToken(keys) },
          body: fd,
        });
        if (res.status === 401) {
          setNeedAuth(true);
          throw new Error("認証が必要です");
        }
        const data = await parseJsonResponse(res);
        if (!res.ok || !data.path) throw new Error(String(data.error ?? "画像アップロード失敗"));
        paths.push(String(data.path));
        attachments.push({
          url: String(data.preview_url ?? ""),
          name: img.file.name || undefined,
        });
      }
      return { paths, attachments };
    },
    [],
  );

  const updateLastUserMessageAttachments = useCallback(
    (sessionId: string, attachments: ChatAttachment[]) => {
      setSessions((list) =>
        list.map((s) => {
          if (s.id !== sessionId) return s;
          const messages = [...s.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "user") {
              messages[i] = { ...messages[i], attachments };
              break;
            }
          }
          return { ...s, messages, updatedAt: Date.now() };
        }),
      );
    },
    [],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length === 0) return;
    e.preventDefault();
    setPendingImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const runAgentRequest = useCallback(
    async (sid: string, msg: string, imagePaths: string[]) => {
      setSending(true);
      setActivityLog([{ level: 0, text: "リクエストを送信", status: "active" }]);

      const fail = (errorText: string) => {
        setSessions((list) =>
          list.map((s) =>
            s.id === sid
              ? {
                  ...s,
                  messages: [...s.messages, { role: "system", text: errorText }],
                  retryContext: { message: msg, imagePaths },
                  updatedAt: Date.now(),
                }
              : s,
          ),
        );
      };

      try {
        const res = await fetchJsonWithRetry(api.chat, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-dev-token": readToken(keys) },
          body: JSON.stringify({ message: msg, image_paths: imagePaths, session_id: sid }),
        });
        if (res.status === 401) {
          setNeedAuth(true);
          fail("認証が必要です。");
          return;
        }
        const start = await parseJsonResponse(res);
        if (!res.ok) {
          fail(`エラー: ${start.error ?? res.statusText}`);
          return;
        }

        const job = await pollChatJob(sid);
        if (job.session_id && job.session_id !== sid) return;

        if (job.phase === "error" || job.error) {
          fail(`エラー: ${job.error ?? job.message}`);
          return;
        }

        const result = chatJobToResult(job);

        const shouldDeploy =
          autoDeploy &&
          (job.needs_build || (job.changed_files ?? []).some((f) => f.startsWith("web/"))) &&
          (job.changed_files ?? []).length > 0;

        setSessions((list) =>
          list.map((s) => {
            if (s.id !== sid) return s;
            const msgs = [...s.messages, result];
            if (shouldDeploy) {
              msgs.push({
                role: "system",
                text: "web/ に変更があるため、自動でビルド・本番反映を開始します…",
              });
            }
            return {
              ...s,
              messages: msgs,
              lastResult: result,
              retryContext: null,
              updatedAt: Date.now(),
            };
          }),
        );

        if (shouldDeploy) await startDeploy();
      } catch (err) {
        fail(`通信エラー: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setSending(false);
        setActivityLog([]);
        sendingSessionRef.current = "";
      }
    },
    [pollChatJob, autoDeploy, startDeploy],
  );

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || sending || !active) return;

    const sid = active.id;
    sendingSessionRef.current = sid;
    const optimisticAttachments: ChatAttachment[] = pendingImages.map((img) => ({
      url: img.preview,
      name: img.file.name || undefined,
    }));

    const isFirstUser =
      active.messages.filter((m) => m.role === "user").length === 0;
    const title = isFirstUser ? sessionTitleFromMessage(msg) : active.title;

    patchSession(sid, {
      title,
      retryContext: null,
      messages: [
        ...active.messages,
        {
          role: "user",
          text: msg,
          attachments: optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
        },
      ],
    });
    setInput("");
    const imagesToUpload = [...pendingImages];
    setPendingImages([]);

    let imagePaths: string[] = [];
    try {
      if (imagesToUpload.length > 0) {
        setSending(true);
        setActivityLog([{ level: 0, text: `画像 ${imagesToUpload.length} 件をアップロード`, status: "active" }]);
        const uploaded = await uploadImages(imagesToUpload);
        imagePaths = uploaded.paths;
        updateLastUserMessageAttachments(sid, uploaded.attachments);
        imagesToUpload.forEach((img) => URL.revokeObjectURL(img.preview));
        setSending(false);
        setActivityLog([]);
      }
    } catch (err) {
      setSending(false);
      setActivityLog([]);
      setSessions((list) =>
        list.map((s) =>
          s.id === sid
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    role: "system",
                    text: `通信エラー: ${err instanceof Error ? err.message : String(err)}`,
                  },
                ],
                retryContext: { message: msg, imagePaths: [] },
              }
            : s,
        ),
      );
      sendingSessionRef.current = "";
      return;
    }

    await runAgentRequest(sid, msg, imagePaths);
  }, [
    input,
    sending,
    active,
    pendingImages,
    uploadImages,
    runAgentRequest,
    patchSession,
    updateLastUserMessageAttachments,
  ]);

  const retryLastRequest = useCallback(async () => {
    if (!active?.retryContext || sending) return;
    const sid = active.id;
    const { message, imagePaths } = active.retryContext;
    sendingSessionRef.current = sid;

    setSessions((list) =>
      list.map((s) => {
        if (s.id !== sid) return s;
        const msgs = [...s.messages];
        while (msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          if (last.role === "system" && isRetryableErrorMessage(last.text)) {
            msgs.pop();
            continue;
          }
          break;
        }
        return { ...s, messages: msgs };
      }),
    );

    await runAgentRequest(sid, message, imagePaths);
  }, [active, sending, runAgentRequest]);

  const addTab = useCallback(() => {
    const s = newSession(welcome);
    setSessions((list) => [s, ...list]);
    setActiveId(s.id);
    setInput("");
    setPendingImages([]);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      if (sessions.length <= 1) return;
      setSessions((list) => list.filter((s) => s.id !== id));
      if (activeId === id) {
        const rest = sessions.filter((s) => s.id !== id);
        setActiveId(rest[0]?.id ?? "");
      }
    },
    [sessions, activeId],
  );

  const onPanelResizeStart = useCallback(
    (e: React.MouseEvent, side: "left" | "right") => {
      e.preventDefault();
      const startW = side === "left" ? leftWidth : rightWidth;
      dragRef.current = { startX: e.clientX, startW, side };
      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const { startX, startW: sw, side: s } = dragRef.current;
        const delta = s === "left" ? ev.clientX - startX : startX - ev.clientX;
        if (s === "left") {
          const next = Math.min(LEFT_WIDTH_MAX, Math.max(LEFT_WIDTH_MIN, sw + delta));
          setLeftWidth(next);
          localStorage.setItem(keys.leftWidth, String(next));
        } else {
          const next = clampRightPanelWidth(
            sw + delta,
            window.innerWidth,
            leftVisible,
            leftWidth,
          );
          setRightWidth(next);
          localStorage.setItem(keys.rightWidth, String(next));
        }
      };
      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [leftVisible, leftWidth, rightWidth],
  );

  const toggleLeftSidebar = useCallback(() => {
    setLeftVisible((v) => {
      const next = !v;
      localStorage.setItem(keys.leftVisible, next ? "true" : "false");
      return next;
    });
  }, [keys.leftVisible]);

  const saveToken = useCallback(() => {
    window.localStorage.setItem(keys.token, pwInput);
    setNeedAuth(false);
  }, [pwInput, keys.token]);

  const toggleAutoDeploy = useCallback(() => {
    setAutoDeploy((v) => {
      const next = !v;
      localStorage.setItem(keys.autoDeploy, next ? "true" : "false");
      return next;
    });
  }, [keys.autoDeploy]);

  const phase = PHASE_LABEL[deploy.phase] ?? PHASE_LABEL.idle;

  if (!hydrated || !active) {
    return (
      <div className="cl-shell flex h-screen items-center justify-center bg-[var(--cl-canvas)] text-[var(--cl-muted)]">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="cl-shell flex h-screen flex-col bg-[var(--cl-canvas)] text-[var(--cl-text)]">
      <header className="cl-header flex shrink-0 items-center justify-between border-b border-[var(--cl-border)] bg-[var(--cl-sidebar)] px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-input)] px-2.5 py-1.5 text-xs text-[var(--cl-muted)] transition hover:border-[var(--cl-accent)] hover:text-[var(--cl-text)]"
            title={leftVisible ? "会話履歴を隠す" : "会話履歴を表示"}
            aria-expanded={leftVisible}
          >
            {leftVisible ? "⟨" : "⟩"}
          </button>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cl-muted)]">
              {branding.eyebrow}
            </p>
            <h1 className="font-serif text-lg text-[var(--cl-text)]">{branding.title}</h1>
          </div>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--cl-border)] bg-[var(--cl-input)] px-2.5 py-1.5 text-[11px] text-[var(--cl-muted)]">
            <input
              type="checkbox"
              checked={autoDeploy}
              onChange={toggleAutoDeploy}
              className="accent-[var(--cl-accent)]"
            />
            完了後に自動ビルド
          </label>
        </div>
        <a
          href={branding.backHref}
          className="text-xs text-[var(--cl-muted)] transition hover:text-[var(--cl-accent)]"
        >
          {branding.backLabel ?? "← 戻る"}
        </a>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 左: 折りたたみレール（履歴非表示時） */}
        {!leftVisible && (
          <div className="flex w-11 shrink-0 flex-col items-center gap-2 border-r border-[var(--cl-border)] bg-[var(--cl-sidebar)] py-3">
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className="rounded-lg px-1.5 py-2 text-sm text-[var(--cl-muted)] transition hover:bg-[var(--cl-hover)] hover:text-[var(--cl-text)]"
              title="会話履歴を表示"
            >
              ⟩
            </button>
            <button
              type="button"
              onClick={addTab}
              className="rounded-lg px-2 py-1.5 text-lg leading-none text-[var(--cl-muted)] transition hover:bg-[var(--cl-hover)] hover:text-[var(--cl-accent)]"
              title="新しい会話"
            >
              +
            </button>
          </div>
        )}

        {/* 左: 会話履歴サイドバー */}
        {leftVisible && (
          <aside
            className="flex shrink-0 flex-col border-r border-[var(--cl-border)] bg-[var(--cl-sidebar)]"
            style={{ width: leftWidth }}
          >
            <div className="flex items-center justify-between border-b border-[var(--cl-border)] px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cl-muted)]">
                会話履歴
              </span>
              <button
                type="button"
                onClick={toggleLeftSidebar}
                className="rounded px-1.5 py-0.5 text-xs text-[var(--cl-muted)] hover:bg-[var(--cl-hover)] hover:text-[var(--cl-text)]"
                title="隠す"
              >
                ⟨
              </button>
            </div>
            <button
              type="button"
              onClick={addTab}
              className="mx-2 mt-2 rounded-xl border border-dashed border-[var(--cl-border)] py-2.5 text-xs text-[var(--cl-muted)] transition hover:border-[var(--cl-accent)] hover:text-[var(--cl-accent)]"
            >
              + 新しい会話
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-1">
              {sessions
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((s) => (
                  <div
                    key={s.id}
                    className={
                      "group mb-0.5 flex items-center gap-1 rounded-xl px-2 py-2 text-left text-xs transition " +
                      (s.id === activeId
                        ? "bg-[var(--cl-accent-soft)] text-[var(--cl-accent)]"
                        : "text-[var(--cl-muted)] hover:bg-[var(--cl-hover)]")
                    }
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left"
                      onClick={() => setActiveId(s.id)}
                      title={s.title}
                    >
                      {s.title}
                    </button>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--cl-muted)] hover:text-red-400"
                        onClick={() => closeTab(s.id)}
                        aria-label="タブを閉じる"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </aside>
        )}

        {leftVisible && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={(e) => onPanelResizeStart(e, "left")}
            className="w-1.5 shrink-0 cursor-col-resize bg-[var(--cl-border)] hover:bg-[var(--cl-accent)]/40 active:bg-[var(--cl-accent)]"
            title="ドラッグで履歴パネルの幅を調整"
          />
        )}

        {/* 中央: チャット */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="cl-chat-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {messages.map((m, i) => (
              <DevConsoleChatBubble key={i} message={m} />
            ))}
            <DevAgentActivityPanel
              active={sending}
              lines={activityLog}
              headline={sending ? "Cursor Agent" : undefined}
            />
          </div>

          {needAuth && (
            <div className="border-t border-[var(--cl-border)] bg-[var(--cl-sidebar)] p-3">
              <div className="mb-2 text-xs text-[var(--cl-muted)]">DEV_CONSOLE_PASSWORD</div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={pwInput}
                  onChange={(e) => setPwInput(e.target.value)}
                  className="flex-1 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-input)] px-3 py-2 text-sm text-[var(--cl-text)]"
                />
                <button
                  onClick={saveToken}
                  className="rounded-xl bg-[var(--cl-accent)] px-4 py-2 text-sm font-medium text-[var(--cl-accent-fg)]"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          <div className="cl-input-dock border-t border-[var(--cl-border)] bg-[var(--cl-sidebar)]/80 p-4 backdrop-blur-sm">
            {active.retryContext && !sending && (
              <div className="dev-retry-bar mb-3 flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs text-[var(--cl-muted)]">
                  前回のリクエストに失敗しました
                </span>
                <button
                  type="button"
                  onClick={() => void retryLastRequest()}
                  className="dev-retry-bar__btn inline-flex items-center gap-1.5 rounded-full border border-[var(--cl-border)] bg-[var(--cl-input)] px-4 py-1.5 text-sm text-[var(--cl-text)] transition hover:border-[var(--cl-accent)] hover:bg-[var(--cl-hover)]"
                >
                  <span className="text-[var(--cl-muted)]" aria-hidden>
                    ↻
                  </span>
                  再試行
                </button>
              </div>
            )}
            {pendingImages.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {pendingImages.map((img) => (
                  <div key={img.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-[var(--cl-border)] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-600 text-[10px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={3}
                disabled={sending}
                placeholder="依頼を入力（⌘/Ctrl+Enter・画像 Ctrl+V）"
                className="flex-1 resize-none rounded-xl border border-[var(--cl-border)] bg-[var(--cl-input)] px-4 py-3 text-[15px] leading-relaxed text-[var(--cl-text)] placeholder:text-[var(--cl-muted)] outline-none focus:border-[var(--cl-accent)] focus:ring-2 focus:ring-[var(--cl-accent)]/20 disabled:opacity-50"
              />
              <button
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                className="rounded-xl bg-[var(--cl-accent)] px-5 py-2.5 text-sm font-medium text-[var(--cl-accent-fg)] transition hover:opacity-90 disabled:opacity-40"
              >
                送信
              </button>
            </div>
          </div>
        </section>

        {/* リサイズバー */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={(e) => onPanelResizeStart(e, "right")}
          className="w-1.5 shrink-0 cursor-col-resize bg-[var(--cl-border)] hover:bg-[var(--cl-accent)]/40 active:bg-[var(--cl-accent)]"
          title="ドラッグで幅を調整"
        />

        {/* 右: diff + ビルド */}
        <aside
          className="flex min-h-0 shrink-0 flex-col border-l border-[var(--cl-border)] bg-[var(--cl-sidebar)]"
          style={{ width: rightWidth }}
        >
          <div className="border-b border-[var(--cl-border)] p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cl-muted)]">
                ビルド状態
              </h2>
              <span className={"text-xs font-medium " + phase.tone}>
                {sending ? "エージェント実行中" : phase.label}
              </span>
            </div>
            {deploy.message && (
              <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-[var(--cl-muted)]">
                {deploy.message}
              </p>
            )}
            <button
              onClick={() => void startDeploy()}
              disabled={deployBusy || sending || !lastResult?.changedFiles?.length}
              className="mt-3 w-full rounded-xl border border-[var(--cl-border)] bg-[var(--cl-input)] px-4 py-2 text-sm text-[var(--cl-muted)] transition hover:border-[var(--cl-accent)] hover:text-[var(--cl-text)] disabled:opacity-40"
            >
              {deployBusy ? "処理中…" : "手動でビルド反映"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {lastResult?.changedFiles && lastResult.changedFiles.length > 0 ? (
              <>
                <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cl-muted)]">
                  変更（{lastResult.changedFiles.length}）
                </h2>
                <ul className="mb-4 space-y-1">
                  {lastResult.changedFiles.map((f) => (
                    <li key={f} className="truncate font-mono text-[11px] text-[var(--cl-accent)]">
                      {f}
                    </li>
                  ))}
                </ul>
                {lastResult.diff && (
                  <pre className="overflow-x-auto rounded-xl border border-[var(--cl-border)] bg-[var(--cl-canvas)] p-3 font-mono text-[10px] leading-relaxed">
                    {lastResult.diff.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.startsWith("+") && !line.startsWith("+++")
                            ? "text-emerald-400/90"
                            : line.startsWith("-") && !line.startsWith("---")
                              ? "text-red-400/80"
                              : line.startsWith("@@")
                                ? "text-[var(--cl-accent)]/80"
                                : "text-[var(--cl-muted)]"
                        }
                      >
                        {line || " "}
                      </div>
                    ))}
                  </pre>
                )}
              </>
            ) : (
              <p className="text-xs leading-relaxed text-[var(--cl-muted)]">
                変更ファイルと diff がここに表示されます。
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** 設定を渡してマウント（UX は Sensor 版と同一） */
export function DevConsole({ config }: { config: DevConsoleConfig }) {
  return (
    <DevConsoleProvider config={config}>
      <DevConsoleClientInner />
    </DevConsoleProvider>
  );
}
