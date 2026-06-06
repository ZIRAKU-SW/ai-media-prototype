"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
  /** ナレッジタブ（nv テーマ）/ 銘柄ノート（notion） */
  variant?: "cl" | "nv" | "notion";
};

const CODE_PLACEHOLDER = "\uE000CODE";

/** コードブロックを退避してから変換し、最後に戻す */
function protectCodeBlocks(input: string): { text: string; blocks: string[] } {
  const blocks: string[] = [];
  let text = input.replace(/```[\s\S]*?```/g, (m) => {
    blocks.push(m);
    return `${CODE_PLACEHOLDER}${blocks.length - 1}\uE001`;
  });
  text = text.replace(/`[^`\n]+`/g, (m) => {
    blocks.push(m);
    return `${CODE_PLACEHOLDER}${blocks.length - 1}\uE001`;
  });
  return { text, blocks };
}

function restoreCodeBlocks(text: string, blocks: string[]): string {
  return text.replace(new RegExp(`${CODE_PLACEHOLDER}(\\d+)\uE001`, "g"), (_, i) => blocks[Number(i)] ?? "");
}

/**
 * AI 出力の Markdown を表示用に正規化。
 * CommonMark は「ひらがな・漢字の直後の **」を太字として解釈しない（intraword 制限）ため、
 * 日本語文中の **foo** はそのまま画面に出る。→ <strong> に変換してから ReactMarkdown へ。
 */
export function normalizeMarkdownInput(raw: string): string {
  const { text: protectedText, blocks } = protectCodeBlocks(
    raw
      .replace(/[\uFF0A＊﹡✱]/g, "*")
      .replace(/\\\*\\\*/g, "**")
      .replace(/\\\*/g, "*"),
  );

  const withBold = protectedText.replace(/\*\*([^*\n][^*]*?)\*\*/g, "<strong>$1</strong>");

  return restoreCodeBlocks(withBold, blocks);
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="my-3 leading-[1.75] last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="knowledge-bold font-bold text-[#fde68a] drop-shadow-sm">{children}</strong>
  ),
  em: ({ children }) => <em className="text-[#a5f3fc] not-italic">{children}</em>,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 font-serif text-2xl font-bold text-[var(--cl-text,#f5f5f5)]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-6 border-b border-[var(--cl-border,#3d3834)] pb-2 font-serif text-xl font-semibold text-[#f0d4c8]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--cl-accent,#d97757)]">{children}</h3>
  ),
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-[var(--cl-accent,#d97757)] bg-[var(--cl-accent-soft,rgba(217,119,87,0.14))] py-2 pl-4 pr-2">
      {children}
    </blockquote>
  ),
};

/** ナレッジ本文の Markdown プレビュー（表・引用・太字 ** を表示） */
export function KnowledgeMarkdown({ content, className = "", variant = "cl" }: Props) {
  if (!content.trim()) {
    return <p className="text-sm text-[var(--cl-muted,#888)]">（本文なし）</p>;
  }

  const normalized = normalizeMarkdownInput(content);
  const proseClass =
    variant === "nv"
      ? "knowledge-prose knowledge-prose--nv"
      : variant === "notion"
        ? "knowledge-prose knowledge-prose--notion"
        : "knowledge-prose";

  return (
    <div className={`${proseClass} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

/** サイドバー用: Markdown 記法を除いたプレーンテキスト */
export function stripMarkdownPreview(text: string, maxLen = 100): string {
  const plain = normalizeMarkdownInput(text)
    .replace(/<strong>/gi, "")
    .replace(/<\/strong>/gi, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_~`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
}
