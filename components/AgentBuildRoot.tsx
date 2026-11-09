"use client";

import { useEffect } from "react";
import { BOOT_FLAG } from "@/lib/agent-build/boot";
import { REPLAY_EVENT } from "@/lib/agent-build/events";
import "@/lib/agent-build/styles.css";

declare global {
  interface Window {
    [BOOT_FLAG]?: { claimed: boolean };
  }
}

/** Guards against React StrictMode's double effect in development. */
let autoStarted = false;

const load = async () => import("@/lib/agent-build");

/**
 * Mounts the agent build. The heavy module is loaded on demand, so repeat
 * visitors (who get the finished page) never download it unless they hit Replay.
 */
export default function AgentBuildRoot() {
  useEffect(() => {
    const html = document.documentElement;
    const boot = window[BOOT_FLAG];
    if (!autoStarted && boot && html.getAttribute("data-ab") === "pending") {
      autoStarted = true;
      boot.claimed = true;
      load()
        .then((m) => m.runAgentBuild())
        .catch(() => html.removeAttribute("data-ab")); // never leave content hidden
    }

    const onReplay = () => {
      load()
        .then((m) => m.runAgentBuild())
        .catch(() => html.removeAttribute("data-ab"));
    };
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);

  return null;
}
