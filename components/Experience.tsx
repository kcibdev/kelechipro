import Image from "next/image";
import { experience, profile } from "@/data/content";
import { SectionHeader, StatusChip } from "./primitives";

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.5v8M3.5 6 7 9.5 10.5 6M2 12.5h10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Resume card with a preview of page one and a download button. */
export function ResumeCard() {
  const r = profile.resume;
  return (
    <div data-layer="card" className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="mono-label text-[10px] text-accent-ink">CV.PDF</span>
        <span className="mono-label text-[10px]">{r.meta}</span>
      </div>
      <a href={r.href} target="_blank" rel="noopener" className="group block p-4" aria-label="Open the CV in a new tab">
        <div data-layer="image" className="relative aspect-[1/1.414] max-h-[300px] w-full overflow-hidden rounded-[2px] bg-white">
          <Image
            src={r.preview}
            alt="Preview of the first page of Isaac Kelechi Bright's CV"
            fill
            sizes="(min-width: 1024px) 340px, 90vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-linear-to-t from-[#0f0f10] via-transparent to-transparent" aria-hidden="true" />
        </div>
      </a>
      <div className="flex gap-2 px-4 pb-4">
        <a data-layer="button" href={r.href} download={r.fileName} className="btn btn-primary h-11 flex-1 text-[11px]">
          <DownloadIcon />
          {r.label}
        </a>
        <a data-layer="button" href={r.href} target="_blank" rel="noopener" className="btn btn-ghost h-11 px-4 text-[11px]">
          View
        </a>
      </div>
    </div>
  );
}

export default function Experience() {
  const edu = experience.education;
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader
          id="experience-title"
          label={experience.sectionLabel}
          index={experience.index}
          title={experience.heading}
          lede={experience.lede}
        />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <ol className="grid gap-3 lg:col-span-8" aria-label="Work history">
            {experience.roles.map((r, i) => (
              <li
                key={`${r.company}-${r.period}`}
                data-layer="card"
                className="panel panel-hover grid gap-4 p-5 md:grid-cols-[170px_1fr] md:gap-6 md:p-6"
              >
                <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 md:flex-col md:items-start">
                  <span className="font-mono text-[11px] tracking-[0.1em] text-accent-ink">
                    LOG_{String(experience.roles.length - i).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[12px] text-fg">{r.period}</span>
                  <span className="font-mono text-[11px] text-fg-3">{r.location}</span>
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h3 data-layer="text" className="text-[17px] leading-snug font-bold tracking-[-0.015em]">
                      {r.title} <span className="text-fg-3">@</span> <span className="text-fg">{r.company}</span>
                    </h3>
                    {r.current ? <StatusChip>Active</StatusChip> : null}
                  </div>
                  <ul data-layer="text" className="space-y-1.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[14px] leading-relaxed text-fg-2">
                        <span aria-hidden="true" className="mt-[0.62em] h-1 w-1 shrink-0 bg-accent" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <aside className="lg:col-span-4">
            <div className="grid gap-4">
              <ResumeCard />
              <div data-layer="card" className="panel p-5">
                <p className="mono-label mb-5 text-[10px] text-accent-ink">EDUCATION</p>
                <h3 data-layer="text" className="mb-1 text-[16px] leading-snug font-bold">
                  {edu.school}
                </h3>
                <p data-layer="text" className="text-[14px] text-fg-2">
                  {edu.course}
                </p>
                <p className="mt-4 flex justify-between font-mono text-[11px] text-fg-3">
                  <span>{edu.period}</span>
                  <span>{edu.location}</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
