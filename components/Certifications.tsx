import Image from "next/image";
import { credentials } from "@/data/content";
import { ArrowIcon, SectionHeader } from "./primitives";

export default function Certifications() {
  return (
    <section id="certifications" aria-labelledby="certifications-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader
          id="certifications-title"
          label={credentials.sectionLabel}
          index={credentials.index}
          title={credentials.heading}
          lede={credentials.lede}
        />

        <ul className="grid gap-4 md:grid-cols-3">
          {credentials.items.map((c, i) => (
            <li key={c.title} data-layer="card" className="panel panel-hover flex flex-col overflow-hidden">
              <a href={c.file} target="_blank" rel="noopener" className="group block p-3 pb-0" aria-label={`Open the ${c.title} certificate`}>
                <div data-layer="image" className="relative aspect-[16/11] overflow-hidden rounded-[2px] bg-[#0b0b0c]">
                  <Image
                    src={c.image}
                    alt={c.imageAlt}
                    fill
                    sizes="(min-width: 768px) 380px, 92vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              </a>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] tracking-[0.12em] text-accent-ink">
                    #CRT-{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mono-label text-[10px]">{c.kind}</span>
                </div>
                <h3 data-layer="text" className="mb-2 text-[17px] leading-snug font-bold tracking-[-0.015em]">
                  {c.title}
                </h3>
                <p data-layer="text" className="mb-4 text-[13.5px] text-fg-2">
                  {c.issuer} · {c.date}
                  {c.note ? <span className="mt-1 block text-fg-3">{c.note}</span> : null}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="font-mono text-[10px] tracking-[0.08em] text-fg-3">{c.id ? `ID ${c.id}` : "—"}</span>
                  <span className="flex gap-4">
                    {c.verify ? (
                      <a
                        href={c.verify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-fg uppercase hover:text-accent-ink"
                      >
                        Verify <ArrowIcon />
                      </a>
                    ) : null}
                    <a
                      href={c.file}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-fg uppercase hover:text-accent-ink"
                    >
                      View <ArrowIcon />
                    </a>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
