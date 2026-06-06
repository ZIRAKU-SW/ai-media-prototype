"use client";

export type ActivityLine = {
  level: number;
  text: string;
  status: "done" | "active" | "pending";
};

type Props = {
  active: boolean;
  lines: ActivityLine[];
  headline?: string;
};

/** Claude 風のインデント付きグレー進捗表示 */
export function DevAgentActivityPanel({ active, lines, headline }: Props) {
  if (!active && lines.length === 0) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-sidebar)]/80 px-3 py-3"
      role="status"
      aria-live="polite"
      aria-busy={active}
    >
      <div className="mb-2 flex items-center gap-2.5">
        {active && <div className="dev-console-spinner shrink-0" aria-hidden />}
        <span className="text-xs font-medium text-[var(--cl-muted)]">
          {headline ?? (active ? "エージェントが作業中" : "作業ログ")}
        </span>
      </div>
      <div className="space-y-0.5 font-mono text-[11px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={`${i}-${line.text}`}
            className="flex gap-1.5"
            style={{ paddingLeft: `${line.level * 14}px` }}
          >
            <span className="w-3 shrink-0 text-[var(--cl-muted)]/45">
              {line.status === "done" ? "✓" : line.status === "active" ? "›" : "·"}
            </span>
            <span
              className={
                line.status === "active"
                  ? "text-[var(--cl-text)]"
                  : line.status === "done"
                    ? "text-[var(--cl-muted)]/70"
                    : "text-[var(--cl-muted)]/40"
              }
            >
              {line.text}
            </span>
          </div>
        ))}
        {active && lines.length === 0 && (
          <p className="text-[var(--cl-muted)]">接続中…</p>
        )}
      </div>
    </div>
  );
}
