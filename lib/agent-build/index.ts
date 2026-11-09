/**
 * Agent build — public API.
 *
 *   runAgentBuild()   start (or restart) the "agents build the page" sequence
 *   stopAgentBuild()  tear it down and show the finished page
 *
 * Module map:
 *   boot.ts        pre-paint inline script (decides whether to hide layers)
 *   layers.ts      layer collection + measurement, reading order
 *   controller.ts  phases, scheduling, touring, speed, skip/replay
 *   agents.ts      agent rendering + curved, eased motion
 *   overlay.ts     overlay roots, selection boxes, carets, ghosts, border draws
 *   reveal.ts      per-kind reveal effects (text, card, image, tags, stat, …)
 *   hud.ts         bottom control bar
 *   swarm.ts       boids flocking for the finished state
 *   sound.ts       Web Audio ticks / pops / chime (opt-in)
 *   clock.ts       speed-scaled GSAP tweens + waits
 */
import { SESSION_KEY } from "./boot";
import { BuildController } from "./controller";
import { Sound } from "./sound";

let current: BuildController | null = null;
let sound: Sound | null = null;

export function runAgentBuild() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.removeAttribute("data-ab");
    return;
  }
  current?.dispose(false);
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
    onReplay: () => runAgentBuild(),
  });
  current = controller;
  void controller.start();
}

export function stopAgentBuild() {
  current?.dispose(false);
  current = null;
}
