import type { ReactNode } from "react";

/**
 * Layer kinds understood by the agent build (lib/agent-build/reveal.ts).
 * Put `data-layer={kind}` on any element the agents should build.
 */
export type LayerKind = "text" | "card" | "button" | "image" | "tags" | "stat" | "block" | "line" | "fade";

interface RichPart {
  part: string;
  /** Character offset in the source string — a stable, unique React key. */
  at: number;
  bold: boolean;
}

/** Split "plain **bold** plain" into segments. Pure, so it's safe to call during render. */
function splitRich(text: string): RichPart[] {
  const out: RichPart[] = [];
  let at = 0;
  for (const part of text.split(/(\*\*[^*]+\*\*)/g)) {
    if (part) out.push({ part, at, bold: part.startsWith("**") && part.endsWith("**") });
    at += part.length;
  }
  return out;
}

/** Renders a string where **double asterisks** mark bold phrases. */
export function Rich({ text }: { text: string }) {
  const parts = splitRich(text);
  return (
    <>
      {parts.map(({ part, at, bold }) =>
        bold ? (
          <strong key={at} className="font-semibold text-fg">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={at}>{part}</span>
        ),
      )}
    </>
  );
}

/** Logo mark: accent block with a "K" and a period. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="3" fill="var(--accent)" />
      <path d="M9 7.5h3.6v7.1l6.2-7.1h4.4l-6.6 7.3 7 9.7h-4.4l-5-7.1-1.6 1.8v5.3H9z" fill="#fff" />
      <rect x="24.2" y="21" width="3.4" height="3.5" fill="#fff" />
    </svg>
  );
}

/** Row of mono tech tags, built by agents as a duplicated sequence. */
export function TagRow({ tags, className = "", label }: { tags: string[]; className?: string; label?: string }) {
  return (
    <ul data-layer="tags" aria-label={label ?? "Technologies"} className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((t) => (
        <li key={t} data-tag className="tag">
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Section header row: mono label, index counter, title and optional lede. */
export function SectionHeader({
  label,
  index,
  title,
  lede,
  id,
}: {
  label: string;
  index: string;
  title: ReactNode;
  lede?: string;
  id: string;
}) {
  return (
    <header className="mb-12 md:mb-16">
      <div data-layer="line" className="mb-6 h-px w-full bg-line" />
      <div className="mb-8 flex items-center justify-between gap-4">
        <p data-layer="text" className="mono-label text-accent-ink">
          {label}
        </p>
        <p data-layer="text" className="mono-label">
          {index}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2
          id={id}
          data-layer="text"
          className="text-[clamp(2.25rem,5.4vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.035em] md:col-span-7"
        >
          {title}
        </h2>
        {lede ? (
          <p data-layer="text" className="max-w-md text-[15px] leading-relaxed text-fg-2 md:col-span-5 md:justify-self-end">
            {lede}
          </p>
        ) : null}
      </div>
    </header>
  );
}

/** A mono status chip, e.g. "In development". */
export function StatusChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-fg-2 uppercase">
      <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11 11 3M5 3h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
