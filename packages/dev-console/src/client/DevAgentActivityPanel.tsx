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

/**
 * Claude 風の進捗表示:
 * - いま実行中のタスクをヘッダーに大きく表示（スピナー付き）
 * - 完了済みステップは下に薄いチェックリストで表示
 */
export function DevAgentActivityPanel({ active, lines, headline }: Props) {
  if (!active && lines.length === 0) return null;

  const currentTask = active
    ? [...lines].reverse().find((l) => l.status === "active")?.text
    : undefined;
  const steps = lines.filter((l) => !(active && l.status === "active" && l.text === currentTask));

  return (
    <div
      className="mt-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-sidebar)]/80 px-4 py-3.5"
      role="status"
      aria-live="polite"
      aria-busy={active}
    >
      <div className="flex items-center gap-3">
        {active && <div className="dev-console-spinner shrink-0" aria-hidden />}
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cl-muted)]">
            {headline ?? (active ? "Cursor Agent" : "作業ログ")}
          </p>
          <p className="truncate text-[15px] font-medium leading-snug text-[var(--cl-text)]">
            {active ? (currentTask ?? "処理中…") : "完了"}
          </p>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-[var(--cl-border)]/60 pt-2.5 text-xs leading-relaxed">
          {steps.map((line, i) => (
            <div
              key={`${i}-${line.text}`}
              className="flex gap-2"
              style={{ paddingLeft: `${line.level * 14}px` }}
            >
              <span
                className={
                  "w-3.5 shrink-0 " +
                  (line.status === "done"
                    ? "text-[var(--cl-accent)]/70"
                    : "text-[var(--cl-muted)]/45")
                }
              >
                {line.status === "done" ? "✓" : line.status === "active" ? "›" : "·"}
              </span>
              <span
                className={
                  line.status === "active"
                    ? "text-[var(--cl-text)]"
                    : line.status === "done"
                      ? "text-[var(--cl-muted)]"
                      : "text-[var(--cl-muted)]/40"
                }
              >
                {line.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {active && lines.length === 0 && (
        <p className="mt-2 text-xs text-[var(--cl-muted)]">接続中…</p>
      )}
    </div>
  );
}
