import Image from "next/image";
import type { ProjectLink } from "@/data/content";

/* ─────────────────────────────── Store / web badges ─────────────────────────────── */

function PlayGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 2.8v18.4c0 .6.7 1 1.2.7l15.6-9.2c.5-.3.5-1.1 0-1.4L5.2 2.1C4.7 1.8 4 2.2 4 2.8Z" fill="currentColor" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6-.1 0-2.5-1-2.5-3.7ZM14.2 5.6c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const GLYPH = { play: PlayGlyph, appstore: AppleGlyph, web: GlobeGlyph } as const;

/** Small outlined badges linking to store listings or a live site. */
export function StoreBadges({ links, title }: { links: ProjectLink[]; title: string }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${title} links`}>
      {links.map((l) => {
        const Glyph = GLYPH[l.kind];
        return (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} — ${l.label} (opens in a new tab)`}
              className="inline-flex h-8 items-center gap-2 rounded-full border border-line-2 px-3 font-mono text-[10.5px] tracking-[0.08em] text-fg-2 uppercase transition-colors hover:border-accent hover:text-fg"
            >
              <Glyph />
              {l.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/* ─────────────────────────────── Media ─────────────────────────────── */

export function AppIcon({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded-[22%] border border-line-2 bg-white object-contain"
    />
  );
}

/** Portrait phone screenshots in a tidy strip of equal frames. */
export function PhoneStrip({ shots, title }: { shots: string[]; title: string }) {
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label={`${title} screenshots`}>
      {shots.map((src, i) => (
        <li key={src} className="relative aspect-[9/19.5] overflow-hidden rounded-[10px] border border-line-2 bg-[#0b0b0c]">
          <Image
            src={src}
            alt={`${title} app screenshot ${String(i + 1)}`}
            fill
            sizes="(min-width: 768px) 120px, 30vw"
            className="object-cover object-top"
          />
        </li>
      ))}
    </ul>
  );
}

/** Website screenshot in a minimal browser frame. */
export function BrowserFrame({ src, alt, url }: { src: string; alt: string; url: string }) {
  return (
    <figure className="overflow-hidden rounded-[6px] border border-line-2 bg-[#0b0b0c]">
      <figcaption className="flex items-center gap-3 border-b border-line px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="h-2 w-2 rounded-full bg-[#3a3a40]" />
          <i className="h-2 w-2 rounded-full bg-[#3a3a40]" />
          <i className="h-2 w-2 rounded-full bg-[#3a3a40]" />
        </span>
        <span className="truncate font-mono text-[10.5px] text-fg-3">{url}</span>
      </figcaption>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 560px, 92vw" className="object-cover object-top" />
      </div>
    </figure>
  );
}

/** Headline number, e.g. "100K+ Google Play downloads". */
export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="font-mono text-[22px] leading-none font-semibold text-fg tabular-nums">{value}</span>
      <span className="mono-label text-[10px]">{label}</span>
    </p>
  );
}
