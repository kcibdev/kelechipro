import Image from "next/image";
import { hero, profile } from "@/data/content";
import { ArrowIcon, Rich, TagRow } from "./primitives";

/** Stat counter. Numbers count up during the build (data-count); null renders "—". */
function StatBlock({ label, value, suffix, note }: (typeof hero.stats)[number]) {
  return (
    <div data-layer="stat" className="border-l border-line pl-4">
      <p className="font-mono text-[clamp(1.75rem,3vw,2.4rem)] leading-none font-semibold text-fg tabular-nums">
        {value === null ? (
          <span className="text-fg-3" title="Not set yet">
            —
          </span>
        ) : (
          <>
            <span data-count={value}>{value}</span>
            {suffix ? <span className="text-accent">{suffix}</span> : null}
          </>
        )}
      </p>
      <p className="mono-label mt-2.5">{label}</p>
      {note ? <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-fg-3">{note}</p> : null}
    </div>
  );
}

/** Portrait in a framed card with an offset accent block behind it. */
function Portrait() {
  return (
    <figure className="relative mx-auto w-full max-w-[340px] self-start lg:max-w-none">
      {/* Offset accent block */}
      <div data-layer="block" aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[4px] bg-accent" />
      <div data-layer="card" className="panel relative overflow-hidden p-2">
        <div className="mb-2 flex items-center justify-between px-1.5 pt-0.5">
          <span className="mono-label text-[10px]">IMG_PORTRAIT.RAW</span>
          <span className="mono-label text-[10px]">4:5</span>
        </div>
        <div data-layer="image" className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#0b0b0c]">
          {profile.portrait ? (
            <>
              {/* Backdrop for the transparent cutout: accent glow + scanlines */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_oklab,var(--accent)_45%,transparent),transparent_62%),linear-gradient(180deg,#141416,#0a0a0b)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_4px)]"
              />
              <Image
                src={profile.portrait}
                alt={profile.portraitAlt}
                fill
                priority
                sizes="(min-width: 1024px) 340px, 80vw"
                className="object-cover object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              />
            </>
          ) : (
            // Placeholder until profile.portrait is set in data/content.ts
            <div
              role="img"
              aria-label={profile.portraitAlt}
              className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--accent)_28%,transparent),transparent_60%),repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0_1px,transparent_1px_4px)]"
            >
              <svg viewBox="0 0 120 150" className="h-[78%] w-auto" aria-hidden="true">
                <circle cx="60" cy="52" r="24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                <path d="M16 150c4-34 22-52 44-52s40 18 44 52" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                <text x="60" y="58" textAnchor="middle" fontFamily="var(--font-jetbrains)" fontSize="11" fill="rgba(255,255,255,0.5)" letterSpacing="2">
                  IKB
                </text>
              </svg>
            </div>
          )}
          {/* Corner ticks */}
          <span aria-hidden="true" className="absolute top-2 left-2 h-3 w-3 border-t border-l border-white/40" />
          <span aria-hidden="true" className="absolute top-2 right-2 h-3 w-3 border-t border-r border-white/40" />
          <span aria-hidden="true" className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-white/40" />
          <span aria-hidden="true" className="absolute right-2 bottom-2 h-3 w-3 border-r border-b border-white/40" />
        </div>
        <figcaption data-layer="text" className="mt-2 px-1.5 pb-0.5 font-mono text-[10px] tracking-[0.14em] text-ok uppercase">
          {hero.portraitStatus}
        </figcaption>
      </div>
    </figure>
  );
}

export default function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="relative isolate overflow-hidden pt-[calc(var(--nav-h)+40px)] pb-20 md:pb-28">
      {/* Faint radial glow */}
      <div
        data-layer="fade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-10%] -z-10 mx-auto h-[780px] max-w-[1400px] bg-[radial-gradient(ellipse_at_50%_35%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_62%)]"
      />
      {/* Huge outlined word, spanning the full width */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[calc(var(--nav-h)+28px)] -z-10 flex justify-center overflow-hidden">
        <span data-layer="fade" className="outline-word text-[clamp(5rem,19.5vw,22rem)]">
          {hero.outlineWord}
        </span>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        {/* System row */}
        <div className="mb-14 flex flex-wrap items-center justify-between gap-3 md:mb-20">
          <p data-layer="text" className="mono-label text-accent-ink">
            {hero.sectionLabel}
          </p>
          <div className="flex items-center gap-5">
            <p data-layer="text" className="mono-label inline-flex items-center gap-2 text-fg-2">
              <span className="status-dot" aria-hidden="true" />
              {hero.systemStatus}
            </p>
            <p data-layer="text" className="mono-label hidden sm:block">
              {hero.index}
            </p>
          </div>
        </div>

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Copy column */}
          <div className="lg:col-span-7">
            <p data-layer="text" className="mb-3 font-hand text-[clamp(1.6rem,2.6vw,2.1rem)] leading-none text-fg-2 -rotate-2 origin-left">
              {hero.greeting}
            </p>
            <h1 className="mb-7">
              <span className="sr-only">{profile.name} — </span>
              <span className="inline-flex items-end gap-1" aria-hidden="true">
                <span
                  data-layer="block"
                  data-priority="3"
                  className="inline-block bg-accent px-[0.14em] pt-[0.08em] pb-[0.02em] text-[clamp(3.25rem,10vw,8rem)] leading-[0.9] font-extrabold tracking-[-0.045em] text-white uppercase"
                >
                  {profile.shortName}
                </span>
                <span data-layer="text" data-priority="3" className="text-[clamp(3.25rem,10vw,8rem)] leading-[0.9] font-extrabold text-accent">
                  .
                </span>
              </span>
            </h1>
            <p data-layer="text" data-priority="2" className="mb-6 font-mono text-[12px] tracking-[0.18em] text-fg uppercase">
              <span className="mr-2 text-accent-ink" aria-hidden="true">
                ●
              </span>
              {hero.subtitle}
            </p>
            <p data-layer="text" data-priority="2" className="mb-9 max-w-[580px] text-[16px] leading-[1.75] text-fg-2 md:text-[17px]">
              <Rich text={hero.intro} />
            </p>
            <div className="mb-12 flex flex-wrap gap-3">
              <a data-layer="button" data-priority="1" href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
                <ArrowIcon />
              </a>
              <a data-layer="button" data-priority="1" href={hero.secondaryCta.href} className="btn btn-ghost">
                {hero.secondaryCta.label}
              </a>
              <a
                data-layer="text"
                href={profile.resume.href}
                download={profile.resume.fileName}
                className="inline-flex h-12 items-center gap-2 px-2 font-mono text-[12px] font-semibold tracking-[0.14em] text-fg-2 uppercase underline decoration-line-2 underline-offset-[6px] transition-colors hover:text-fg hover:decoration-accent"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5v8M3.5 6 7 9.5 10.5 6M2 12.5h10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {profile.resume.label}
              </a>
            </div>
            <div className="grid max-w-[560px] grid-cols-3 gap-4">
              {hero.stats.map((s) => (
                <StatBlock key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Portrait + focus cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-[1.05fr_1fr] lg:gap-5">
            <Portrait />
            <ol className="grid content-start gap-3" aria-label="What I build">
              {hero.focus.map((f) => (
                <li key={f.n} data-layer="card" className="panel panel-hover p-4">
                  <p className="mb-5 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-3">
                    <span className="text-accent-ink">{f.n}</span>
                    <span aria-hidden="true">/03</span>
                  </p>
                  <p className="mb-1 text-[15px] font-bold tracking-[-0.01em]">{f.title}</p>
                  <p className="text-[13px] leading-snug text-fg-2">{f.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Tech tags */}
        <div data-layer="line" className="mt-16 h-px w-full bg-line" />
        <div className="grid gap-5 pt-8 md:grid-cols-[auto_1fr] md:gap-10">
          <p data-layer="text" className="mono-label pt-1.5">
            Core stack
          </p>
          <div className="grid gap-4">
            <TagRow tags={hero.tags} label="Core stack" />
            <div className="flex flex-wrap items-center gap-3">
              <span data-layer="text" className="mono-label text-[10px]">
                {hero.exploringLabel} →
              </span>
              <TagRow tags={hero.exploring} label={hero.exploringLabel} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
