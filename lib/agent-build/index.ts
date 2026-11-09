/**
 * Agent build — public API.
 *
 *   runAgentBuild({ replay })  start (or restart) the hero build
 *   stopAgentBuild()           tear everything down and show the finished page
 *
 * Module map:
 *   boot.ts        pre-paint inline script (decides whether to hide the hero's layers)
 *   layers.ts      layer collection + measurement, reading order
 *   controller.ts  scan → build → done for the on-screen hero; skip / replay
 *   inspect.ts     after the build: one cursor briefly selects each section heading
 *   agents.ts      agent rendering + curved, eased motion
 *   overlay.ts     overlay roots, selection boxes, carets, ghosts, border draws
 *   reveal.ts      per-kind reveal effects (text, card, image, tags, stat, …)
 *   hud.ts         small bottom pill: progress, sound, skip, replay
 *   swarm.ts       optional pointer-orbit swarm (config AFTER_BUILD = "swarm")
 *   sound.ts       Web Audio ticks / pops / chime (opt-in)
 *   clock.ts       GSAP tweens + waits that skip can kill at once
 */
import { SESSION_KEY } from "./boot";
import { BuildController } from "./controller";
import { Inspector } from "./inspect";
import { Sound } from "./sound";

let current: BuildController | null = null;
let inspector: Inspector | null = null;
let sound: Sound | null = null;

export function runAgentBuild(opts: { replay?: boolean } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.removeAttribute("data-ab");
    return;
  }
  stopAgentBuild();
  sound ??= new Sound(); // shared, so a sound opt-in survives Replay
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage blocked — the build simply plays again next time */
  }
  const controller: BuildController = new BuildController(sound, {
    onExit: () => {
      if (current === controller) current = null;
    },
    onDone: () => {
      if (current === controller) current = null;
      inspector = new Inspector();
    },
    onReplay: () => {
      runAgentBuild({ replay: true });
    },
  });
  current = controller;
  void controller.start(opts);
}

export function stopAgentBuild() {
  current?.dispose(false);
  current = null;
  inspector?.destroy();
  inspector = null;
}
