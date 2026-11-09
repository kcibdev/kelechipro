import { skills } from "@/data/content";
import { SectionHeader, TagRow } from "./primitives";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader id="skills-title" label={skills.sectionLabel} index={skills.index} title={skills.heading} lede={skills.lede} />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {skills.groups.map((g, i) => (
            <li key={g.id} data-layer="card" className="panel panel-hover flex flex-col p-5">
              <div className="mb-6 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-fg-3 uppercase">
                <span className="text-accent-ink">
                  {`${String(i + 1).padStart(2, "0")} // ${g.id}`}
                </span>
                <span>[{String(g.items.length).padStart(2, "0")}]</span>
              </div>
              <h3 data-layer="text" className="mb-4 text-[18px] font-bold tracking-[-0.02em]">
                {g.title}
              </h3>
              <TagRow tags={g.items} label={`${g.title} skills`} className="gap-1.5" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
