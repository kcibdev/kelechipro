import type { Project } from "@/data/content";
import { projects } from "@/data/content";
import { ArrowIcon, SectionHeader, StatusChip, TagRow } from "./primitives";

function ProjectLink({ link }: { link?: Project["link"] }) {
  if (!link) return null;
  return (
    <a
      data-layer="text"
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-fg uppercase hover:text-accent-ink"
    >
      {link.label}
      <ArrowIcon />
    </a>
  );
}

function Bullets({ items, size = "sm" }: { items: string[]; size?: "sm" | "md" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((d) => (
        <li
          key={d}
          data-layer="text"
          className={`flex gap-3 leading-relaxed text-fg-2 ${size === "md" ? "text-[14.5px]" : "text-[13px]"}`}
        >
          <span aria-hidden="true" className="mt-[0.62em] h-1 w-1 shrink-0 bg-accent" />
          <span>{d}</span>
        </li>
      ))}
    </ul>
  );
}

function FeaturedCard({ p }: { p: Project }) {
  return (
    <article data-layer="card" className="panel panel-hover relative mb-5 grid overflow-hidden md:grid-cols-12">
      <div className="flex flex-col p-7 md:col-span-7 md:p-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <p className="mono-label text-accent-ink">{p.label}</p>
          <p className="mono-label">#FLAG-01</p>
        </div>
        <h3 data-layer="text" className="mb-4 text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.9] font-extrabold tracking-[-0.045em]">
          {p.title}
          <span className="text-accent">.</span>
        </h3>
        <p data-layer="text" className="mb-8 max-w-[520px] text-[16px] leading-[1.7] text-fg-2">
          {p.summary}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-5">
          <TagRow tags={p.tags} />
          <ProjectLink link={p.link} />
        </div>
      </div>
      <div className="border-t border-line bg-[#0b0b0c] p-7 md:col-span-5 md:border-t-0 md:border-l md:p-10">
        <p className="mono-label mb-6">SPEC // CORE MODULES</p>
        <Bullets items={p.details} size="md" />
      </div>
    </article>
  );
}

function ProjectCard({ p, n }: { p: Project; n: number }) {
  return (
    <article data-layer="card" className="panel panel-hover flex flex-col p-6 md:p-7">
      <div className="mb-8 flex items-center justify-between gap-3">
        <p className="mono-label text-accent-ink">{p.label}</p>
        <p className="mono-label">#FLAG-{String(n).padStart(2, "0")}</p>
      </div>
      <h3 data-layer="text" className="mb-3 text-[26px] leading-none font-extrabold tracking-[-0.03em]">
        {p.title}
      </h3>
      <p data-layer="text" className="mb-6 text-[14px] leading-relaxed text-fg-2">
        {p.summary}
      </p>
      <div className="mb-7">
        <Bullets items={p.details} />
      </div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
        <TagRow tags={p.tags} />
        {p.status ? (
          <span data-layer="text">
            <StatusChip>{p.status}</StatusChip>
          </span>
        ) : null}
      </div>
      {p.link ? (
        <div className="mt-5">
          <ProjectLink link={p.link} />
        </div>
      ) : null}
    </article>
  );
}

export default function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader
          id="projects-title"
          label={projects.sectionLabel}
          index={projects.index}
          title={projects.heading}
          lede={projects.lede}
        />
        <FeaturedCard p={projects.featured} />
        <div className="grid gap-5 md:grid-cols-3">
          {projects.row.map((p, i) => (
            <ProjectCard key={p.slug} p={p} n={i + 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
