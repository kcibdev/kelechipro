"use client";

import { useEffect, useState } from "react";
import { nav, profile } from "@/data/content";
import { LogoMark } from "./primitives";

/**
 * Floating pill navbar. Links smooth-scroll (CSS scroll-behavior) and the active link
 * is tracked with GSAP ScrollTrigger as sections cross the middle of the viewport.
 */
export default function Navbar() {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Mutable box so the async loader can see a cleanup that ran while it was loading.
    const state: { cancelled: boolean; triggers: { kill: () => void }[] } = { cancelled: false, triggers: [] };
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (state.cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      state.triggers = nav.links.map((l) =>
        ScrollTrigger.create({
          trigger: l.href,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setActive(l.href);
            else setActive((cur) => (cur === l.href ? "" : cur));
          },
        }),
      );
    });
    return () => {
      state.cancelled = true;
      for (const t of state.triggers) t.kill();
    };
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4 md:top-4">
      <nav
        data-layer="card"
        aria-label="Primary"
        className="pointer-events-auto relative flex h-[52px] w-full max-w-[1000px] items-center gap-2 rounded-full border border-line bg-[#0b0b0c]/80 pr-1.5 pl-2 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md"
      >
        <a
          href="#top"
          data-layer="fade"
          className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1"
          aria-label={`${profile.shortName} — back to top`}
        >
          <LogoMark size={30} />
          <span className="hidden font-mono text-[12px] font-semibold tracking-[0.16em] uppercase sm:inline">
            {profile.shortName}
          </span>
        </a>

        <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
          {nav.links.map((l) => {
            const isActive = active === l.href;
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  data-layer="text"
                  aria-current={isActive ? "true" : undefined}
                  className={`relative block rounded-full px-3 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
                    isActive ? "bg-accent/12 text-fg" : "text-fg-3 hover:text-fg"
                  }`}
                >
                  {isActive ? (
                    <span className="absolute top-1/2 left-1.5 h-1 w-1 -translate-y-1/2 rounded-full bg-accent" aria-hidden="true" />
                  ) : null}
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <span
            data-layer="text"
            className="hidden items-center gap-2 px-2 font-mono text-[10px] tracking-[0.16em] text-fg-2 uppercase xl:inline-flex"
          >
            <span className="status-dot" aria-hidden="true" />
            {nav.status}
          </span>
          <span className="status-dot mr-1 xl:hidden" aria-label={nav.status} role="img" />
          <a
            href={nav.cta.href}
            data-layer="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-4 whitespace-nowrap font-mono text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-shadow hover:shadow-[0_8px_30px_-8px_var(--accent)]"
          >
            <span className="hidden sm:inline">{nav.cta.label}</span>
            <span className="sm:hidden">Hire</span>
            <span aria-hidden="true">→</span>
          </a>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-fg-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              {open ? (
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>

        {open ? (
          <ul
            id="mobile-menu"
            className="absolute inset-x-0 top-[calc(100%+8px)] grid gap-1 rounded-2xl border border-line bg-[#0b0b0c]/95 p-2 backdrop-blur-md lg:hidden"
          >
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 font-mono text-[12px] tracking-[0.14em] text-fg-2 uppercase hover:bg-panel-2 hover:text-fg"
                >
                  {l.label}
                  <span className="text-fg-3" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
            <li className="mt-1 border-t border-line pt-1">
              <a
                href={profile.resume.href}
                download={profile.resume.fileName}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 font-mono text-[12px] tracking-[0.14em] text-accent-ink uppercase hover:bg-panel-2"
              >
                {profile.resume.label}
                <span aria-hidden="true">↓</span>
              </a>
            </li>
          </ul>
        ) : null}
      </nav>
    </header>
  );
}
