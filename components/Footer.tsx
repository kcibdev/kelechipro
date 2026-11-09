import { company, footer, profile } from "@/data/content";
import ReplayBuildButton from "./ReplayBuildButton";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative pb-10">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div data-layer="line" className="mb-7 h-px w-full bg-line" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p data-layer="text" className="text-[13px] text-fg-3">
              © {year} {profile.name}. All rights reserved.
            </p>
            <p data-layer="text" className="mt-1 font-mono text-[10px] tracking-[0.1em] text-fg-3 uppercase">
              {company.name} · RC {company.rcNumber}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <p data-layer="text" className="mono-label text-[10px]">
              {footer.tagline}
            </p>
            <a
              data-layer="text"
              href={profile.resume.href}
              download={profile.resume.fileName}
              className="font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase transition-colors hover:text-accent-ink"
            >
              ↓ {profile.resume.label}
            </a>
            <ReplayBuildButton label={footer.replayLabel} />
          </div>
        </div>
      </div>
    </footer>
  );
}
