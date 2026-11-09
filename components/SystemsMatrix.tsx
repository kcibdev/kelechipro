"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Category } from "@/data/content";
import { systems } from "@/data/content";
import { SectionHeader, StatusChip } from "./primitives";
import { AppIcon, StoreBadges } from "./ProjectMedia";

type FilterId = "all" | Category;

const isBuilding = () => document.documentElement.hasAttribute("data-ab");
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Filterable grid. All cards stay mounted (good for SEO and for the build animation);
 * filtering toggles `hidden`, and GSAP Flip animates cards out, re-flows and in.
 */
export default function SystemsMatrix() {
  const [filter, setFilter] = useState<FilterId>("all");
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<unknown>(null);
  const busy = useRef(false);

  const matches = useCallback(
    (cats: Category[], f: FilterId) => f === "all" || cats.includes(f),
    [],
  );

  const choose = useCallback(
    async (next: FilterId) => {
      if (next === filter || busy.current) return;
      const grid = gridRef.current;
      if (!grid || isBuilding() || prefersReducedMotion()) {
        setFilter(next);
        return;
      }
      busy.current = true;
      const { gsap } = await import("gsap");
      const { Flip } = await import("gsap/Flip");
      gsap.registerPlugin(Flip);

      const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-card]"));
      const leaving = cards.filter((c) => !c.hidden && !matches((c.dataset.cats ?? "").split(",") as Category[], next));
      if (leaving.length) {
        await gsap.to(leaving, { opacity: 0, scale: 0.94, duration: 0.18, ease: "power2.in", stagger: 0.015 });
      }
      flipState.current = Flip.getState(cards);
      setFilter(next);
    },
    [filter, matches],
  );

  // After React applies the new filter, animate from the captured state.
  useLayoutEffect(() => {
    const state = flipState.current;
    const grid = gridRef.current;
    if (!state || !grid) return;
    flipState.current = null;
    void (async () => {
      const { gsap } = await import("gsap");
      const { Flip } = await import("gsap/Flip");
      const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-card]"));
      gsap.set(cards, { clearProps: "opacity,scale,transform" });
      Flip.from(state as ReturnType<typeof Flip.getState>, {
        targets: cards,
        duration: 0.5,
        ease: "power3.inOut",
        absolute: true,
        nested: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35, delay: 0.12, stagger: 0.03, ease: "power2.out" }),
        onComplete: () => {
          gsap.set(cards, { clearProps: "opacity,scale,transform" });
          busy.current = false;
        },
      });
    })();
  }, [filter]);

  const visible = systems.items.filter((p) => matches(p.categories, filter)).length;

  return (
    <section id="systems" aria-labelledby="systems-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader id="systems-title" label={systems.sectionLabel} index={systems.index} title={systems.heading} lede={systems.lede} />

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div data-layer="tags" role="group" aria-label="Filter systems" className="flex flex-wrap gap-2">
            {systems.filters.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-tag
                  aria-pressed={on}
                  onClick={() => void choose(f.id)}
                  className={`tag h-9 cursor-pointer px-4 text-[11px] tracking-[0.12em] uppercase transition-colors ${
                    on ? "border-accent bg-accent text-white" : "hover:border-fg-3 hover:text-fg"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <p data-layer="text" className="mono-label" aria-live="polite">
            SHOWING [{String(visible).padStart(2, "0")} / {String(systems.items.length).padStart(2, "0")}]
          </p>
        </div>

        <ul ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {systems.items.map((p, i) => {
            const id = `#SYS-${String(i + 1).padStart(2, "0")}`;
            const flagship = systems.flagshipSlugs.includes(p.slug);
            return (
              <li
                key={p.slug}
                data-card
                data-cats={p.categories.join(",")}
                hidden={!matches(p.categories, filter)}
                className="min-h-0"
              >
                <article data-layer="card" className="panel panel-hover flex h-full flex-col p-5">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.12em] text-accent-ink">{id}</span>
                    <span className="mono-label text-[10px]">
                      {p.label}
                      {flagship ? " · FLAGSHIP" : ""}
                    </span>
                  </div>
                  <div className="mb-2.5 flex items-center gap-3">
                    {p.media?.icon ? <AppIcon src={p.media.icon} alt={`${p.title} icon`} size={32} /> : null}
                    <h3 data-layer="text" className="text-[19px] leading-tight font-bold tracking-[-0.02em]">
                      {p.title}
                    </h3>
                  </div>
                  {p.metric ? (
                    <p className="mb-2 font-mono text-[11px] text-fg-2">
                      <b className="font-semibold text-fg">{p.metric.value}</b> {p.metric.label}
                    </p>
                  ) : null}
                  <p data-layer="text" className="mb-6 text-[13.5px] leading-relaxed text-fg-2">
                    {p.summary}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <ul data-layer="tags" aria-label="Technologies" className="flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <li key={t} data-tag className="tag h-6 px-2 text-[10px]">
                          {t}
                        </li>
                      ))}
                    </ul>
                    {p.status ? <StatusChip>{p.status}</StatusChip> : null}
                  </div>
                  {p.links ? (
                    <div className="mt-4 border-t border-line pt-4">
                      <StoreBadges links={p.links} title={p.title} />
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
