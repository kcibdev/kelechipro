"use client";

import { useEffect, useState } from "react";
import { REPLAY_EVENT } from "@/lib/agent-build/events";

/** Small footer link that replays the agent build. Hidden for reduced-motion visitors. */
export default function ReplayBuildButton({ label }: { label: string }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!allowed) return null;
  return (
    <button
      type="button"
      data-layer="text"
      onClick={() => window.dispatchEvent(new CustomEvent(REPLAY_EVENT))}
      className="group inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase transition-colors hover:text-accent-ink"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="transition-transform group-hover:-rotate-90">
        <path d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5V4H7.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      {label}
    </button>
  );
}
