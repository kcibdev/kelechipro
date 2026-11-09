import { about } from "@/data/content";
import { Rich, SectionHeader } from "./primitives";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader id="about-title" label={about.sectionLabel} index={about.index} title={about.heading} />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-5">
            {about.bio.map((p) => (
              <p key={p} data-layer="text" className="text-[16px] leading-[1.8] text-fg-2 md:text-[17px]">
                <Rich text={p} />
              </p>
            ))}
          </div>

          <div className="lg:col-span-7">
            <figure data-layer="card" className="panel relative mb-6 overflow-hidden p-7 md:p-9">
              <span aria-hidden="true" className="absolute top-0 left-0 h-full w-[3px] bg-accent" />
              <p className="mono-label mb-5 text-accent-ink">QUOTE.MD</p>
              <blockquote data-layer="text" className="text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.3] font-semibold tracking-[-0.02em] text-fg">
                “{about.quote}”
              </blockquote>
            </figure>

            <ol className="grid gap-3 sm:grid-cols-3" aria-label="Principles">
              {about.principles.map((p) => (
                <li key={p.n} data-layer="card" className="panel panel-hover flex flex-col p-5">
                  <p className="mb-8 font-mono text-[11px] tracking-[0.16em] text-accent-ink">{p.n}</p>
                  <h3 data-layer="text" className="mb-2 text-[16px] font-bold tracking-[-0.01em]">
                    {p.title}
                  </h3>
                  <p data-layer="text" className="text-[13.5px] leading-relaxed text-fg-2">
                    {p.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
