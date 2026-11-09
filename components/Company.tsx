import Image from "next/image";
import { company, companySection } from "@/data/content";
import { ArrowIcon, SectionHeader } from "./primitives";

export default function Company() {
  const facts: [string, string][] = [
    ["Company", company.name],
    ["RC number", company.rcNumber],
    ["Incorporated", company.incorporated],
    ["Type", company.type],
    ["Registrar", company.registrar],
    ["Status", company.status],
  ];

  return (
    <section id="company" aria-labelledby="company-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader
          id="company-title"
          label={companySection.sectionLabel}
          index={companySection.index}
          title={companySection.heading}
          lede={companySection.lede}
        />

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Certificate of incorporation */}
          <figure data-layer="card" className="panel overflow-hidden lg:col-span-4">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="mono-label text-[10px] text-accent-ink">CAC // CERT_INC</span>
              <span className="mono-label text-[10px]">RC {company.rcNumber}</span>
            </div>
            <a href={company.certificate.file} target="_blank" rel="noopener" className="group block p-4" aria-label="Open the Certificate of Incorporation">
              <div data-layer="image" className="relative aspect-[1/1.414] max-h-[420px] w-full overflow-hidden rounded-[2px] bg-white">
                <Image
                  src={company.certificate.image}
                  alt={`Certificate of Incorporation for ${company.name}, RC ${company.rcNumber}`}
                  fill
                  sizes="(min-width: 1024px) 380px, 90vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </a>
            <figcaption data-layer="text" className="px-4 pb-4 font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">
              Certificate of Incorporation · {company.incorporated}
            </figcaption>
          </figure>

          <div className="grid content-start gap-5 lg:col-span-8">
            {/* Register facts */}
            <div data-layer="card" className="panel p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="mono-label text-[10px] text-accent-ink">REGISTER EXTRACT</p>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-ok uppercase">
                  <span className="status-dot" aria-hidden="true" />
                  {company.status}
                </span>
              </div>
              <dl data-layer="text" className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-b border-line pb-3">
                    <dt className="mono-label mb-1 text-[10px]">{k}</dt>
                    <dd className="text-[15px] font-medium text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <a data-layer="button" href={company.certificate.file} target="_blank" rel="noopener" className="btn btn-ghost h-11 text-[11px]">
                  View certificate <ArrowIcon />
                </a>
                <a data-layer="button" href={company.verify} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-11 text-[11px]">
                  Verify on CAC <ArrowIcon />
                </a>
              </div>
            </div>

            {/* Services */}
            <ol className="grid gap-3 sm:grid-cols-2" aria-label="Services">
              {companySection.services.map((s) => (
                <li key={s.n} data-layer="card" className="panel panel-hover p-5">
                  <p className="mb-6 font-mono text-[11px] tracking-[0.16em] text-accent-ink">SVC_{s.n}</p>
                  <h3 data-layer="text" className="mb-1.5 text-[17px] font-bold tracking-[-0.015em]">
                    {s.title}
                  </h3>
                  <p data-layer="text" className="text-[13.5px] leading-relaxed text-fg-2">
                    {s.body}
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
