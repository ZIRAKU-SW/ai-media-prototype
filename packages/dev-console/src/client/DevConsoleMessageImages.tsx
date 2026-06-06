"use client";

import { useCallback, useEffect, useState } from "react";

import type { ChatAttachment } from "./types";

type Props = {
  attachments: ChatAttachment[];
  /** user bubble uses light text on accent bg */
  variant?: "user" | "default";
};

async function copyImageFromUrl(url: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("画像の取得に失敗しました");
  const blob = await res.blob();
  const type = blob.type.startsWith("image/") ? blob.type : "image/png";
  await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
}

export function DevConsoleMessageImages({ attachments, variant = "default" }: Props) {
  const [preview, setPreview] = useState<ChatAttachment | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const onCopy = useCallback(async () => {
    if (!preview) return;
    setCopyState("idle");
    try {
      await copyImageFromUrl(preview.url);
      setCopyState("ok");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("err");
      window.setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [preview]);

  if (!attachments.length) return null;

  const thumbRing =
    variant === "user"
      ? "ring-white/30 hover:ring-white/60"
      : "ring-[var(--cl-border)] hover:ring-[var(--cl-accent)]";

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {attachments.map((att, i) => (
          <button
            key={`${att.url}-${i}`}
            type="button"
            onClick={() => setPreview(att)}
            className={`group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition ${thumbRing}`}
            title={att.name ?? "添付画像を表示"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.url}
              alt={att.name ?? "添付画像"}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal
          aria-label="添付画像のプレビュー"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[90vh] max-w-3xl flex-col gap-3 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-sidebar)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs text-[var(--cl-muted)]">{preview.name ?? "添付画像"}</p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void onCopy()}
                  className="rounded-lg border border-[var(--cl-border)] px-3 py-1.5 text-xs text-[var(--cl-text)] transition hover:border-[var(--cl-accent)]"
                >
                  {copyState === "ok" ? "コピーしました" : copyState === "err" ? "コピー失敗" : "画像をコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg px-2 py-1.5 text-xs text-[var(--cl-muted)] hover:text-[var(--cl-text)]"
                >
                  閉じる
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.name ?? "添付画像"}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
