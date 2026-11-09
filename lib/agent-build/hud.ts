import type { Speed } from "./config";

/**
 * HUD: a fixed, pill-shaped control bar at the bottom centre.
 * Phases: scan → build → done. Every control is a real <button>, so it's
 * keyboard-accessible; the ✕ is visible from the very first frame.
 */

export interface HudHandlers {
  onClose(): void;
  onTouring(): void;
  onSpeed(): void;
  onSound(): void;
  onGoLive(): void;
  onReplay(): void;
}

const SOUND_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor"/><path class="ab-wave" d="M11 5.5c1 .8 1.5 1.6 1.5 2.5s-.5 1.7-1.5 2.5M12.8 3.5c1.6 1.2 2.4 2.7 2.4 4.5s-.8 3.3-2.4 4.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
const TOUR_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v10M4 8l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 14.5h10" stroke="currentColor" stroke-width="1.5"/></svg>`;

const LOGO = `<svg width="44" height="44" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="3" fill="var(--accent)"/><path d="M9 7.5h3.6v7.1l6.2-7.1h4.4l-6.6 7.3 7 9.7h-4.4l-5-7.1-1.6 1.8v5.3H9z" fill="#fff"/><rect x="24.2" y="21" width="3.4" height="3.5" fill="#fff"/></svg>`;

export class Hud {
  readonly el: HTMLDivElement;
  private logo: HTMLDivElement;
  /** Typed query inside the HUD. Throws if the markup is missing a part (a bug, not a runtime state). */
  private q(sel: string): HTMLElement {
    const found = this.el.querySelector<HTMLElement>(sel);
    if (!found) throw new Error(`HUD element not found: ${sel}`);
    return found;
  }

  constructor(parent: HTMLElement, private h: HudHandlers) {
    // Centered logo mark for the scan phase.
    this.logo = document.createElement("div");
    this.logo.className = "ab-logo";
    this.logo.setAttribute("aria-hidden", "true");
    this.logo.innerHTML = `${LOGO}<span class="ab-logo-ring"></span>`;
    parent.appendChild(this.logo);

    this.el = document.createElement("div");
    this.el.className = "ab-hud";
    this.el.dataset.phase = "scan";
    this.el.setAttribute("role", "region");
    this.el.setAttribute("aria-label", "Page build animation controls");
    this.el.innerHTML = `
      <div class="ab-panel ab-scan">
        <span class="ab-pulse"></span>
        <span class="ab-scan-text">Scanning page…</span>
        <span class="ab-scanbar"><i></i></span>
      </div>
      <div class="ab-panel ab-build">
        <span class="ab-avatars"></span>
        <span class="ab-agents"><b>0</b> agents</span>
        <span class="ab-div"></span>
        <span class="ab-layers"><span class="ab-layers-n"><b>0</b> / 0 <em>layers</em></span><span class="ab-bar"><i></i></span></span>
        <span class="ab-div"></span>
        <button type="button" class="ab-btn ab-tour" aria-pressed="true" title="Auto-scroll to follow the build">${TOUR_ICON}<span>Touring</span></button>
        <button type="button" class="ab-btn ab-speed" title="Change speed">1×</button>
        <button type="button" class="ab-btn ab-sound" aria-pressed="false" title="Sound">${SOUND_ICON}<span>Tap for sound</span></button>
      </div>
      <div class="ab-panel ab-done">
        <span class="ab-done-dot"></span>
        <span class="ab-done-text"></span>
        <button type="button" class="ab-btn ab-live">Go live</button>
        <button type="button" class="ab-btn ab-replay">Replay</button>
      </div>
      <button type="button" class="ab-btn ab-x" aria-label="Skip the build animation and show the finished page" title="Skip (Esc)">✕</button>
    `;
    parent.appendChild(this.el);

    this.q(".ab-x").addEventListener("click", () => this.h.onClose());
    this.q(".ab-tour").addEventListener("click", () => this.h.onTouring());
    this.q(".ab-speed").addEventListener("click", () => this.h.onSpeed());
    this.q(".ab-sound").addEventListener("click", () => this.h.onSound());
    this.q(".ab-live").addEventListener("click", () => this.h.onGoLive());
    this.q(".ab-replay").addEventListener("click", () => this.h.onReplay());

    requestAnimationFrame(() => this.el.classList.add("ab-on"));
  }

  setPhase(phase: "scan" | "build" | "done") {
    this.el.dataset.phase = phase;
    if (phase !== "scan") this.logo.classList.add("ab-off");
    if (phase === "done") this.q(".ab-live").focus({ preventScroll: true });
  }

  setScanProgress(p: number) {
    this.q(".ab-scanbar i").style.transform = `scaleX(${Math.min(1, p)})`;
  }

  setAgents(list: { color: string; letter: string }[]) {
    this.q(".ab-agents b").textContent = String(list.length);
    const shown = list.slice(-4).reverse();
    this.q(".ab-avatars").innerHTML = shown
      .map((a) => `<i style="background:${a.color}">${a.letter}</i>`)
      .join("");
  }

  setProgress(built: number, total: number) {
    this.q(".ab-layers-n").innerHTML = `<b>${built}</b> / ${total} <em>layers</em>`;
    this.q(".ab-bar i").style.transform = `scaleX(${total ? built / total : 0})`;
  }

  setTouring(on: boolean) {
    const b = this.q(".ab-tour");
    b.setAttribute("aria-pressed", String(on));
    b.classList.toggle("ab-active", on);
  }

  setSpeed(s: Speed) {
    this.q(".ab-speed").textContent = `${s}×`;
  }

  setSound(on: boolean) {
    const b = this.q(".ab-sound");
    b.setAttribute("aria-pressed", String(on));
    b.classList.toggle("ab-active", on);
    this.q(".ab-sound span").textContent = on ? "Sound on" : "Tap for sound";
  }

  setDone(agents: number, seconds: number) {
    this.q(".ab-done-text").textContent = `Rebuilt by ${agents} agents in ${seconds.toFixed(1)}s`;
  }

  destroy(fade = true) {
    this.logo.remove();
    if (!fade) { this.el.remove(); return; }
    this.el.classList.remove("ab-on");
    window.setTimeout(() => this.el.remove(), 350);
  }
}
