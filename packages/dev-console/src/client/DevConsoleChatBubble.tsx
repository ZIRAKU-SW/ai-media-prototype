"use client";

import { DevConsoleMessageImages } from "./DevConsoleMessageImages";
import { KnowledgeMarkdown } from "./KnowledgeMarkdown";
import type { ChatMsg } from "./types";

export function DevConsoleChatBubble({ message }: { message: ChatMsg }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-[var(--cl-accent)] px-5 py-3.5 text-base leading-relaxed text-[var(--cl-accent-fg)] shadow-sm">
          {message.text ? <p className="whitespace-pre-wrap">{message.text}</p> : null}
          {message.attachments && message.attachments.length > 0 && (
            <DevConsoleMessageImages attachments={message.attachments} variant="user" />
          )}
        </div>
      </div>
    );
  }

  if (message.role === "system") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-2xl border border-[var(--cl-error-border)] bg-[var(--cl-error-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--cl-error)]">
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] min-w-0 rounded-2xl rounded-bl-sm border border-[var(--cl-border)] bg-[var(--cl-input)] px-4 py-3 shadow-sm">
        <KnowledgeMarkdown content={message.text} variant="cl" />
        {message.changedFiles && message.changedFiles.length > 0 && (
          <p className="mt-3 border-t border-[var(--cl-border)] pt-2 text-xs text-[var(--cl-muted)]">
            変更 {message.changedFiles.length} ファイル
          </p>
        )}
      </div>
    </div>
  );
}
