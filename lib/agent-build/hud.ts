/**
 * HUD: a small fixed pill at the bottom centre.
 *
 * Deliberately minimal: progress + Skip while building, then a short
 * "Built in Xs · Replay" that hides itself. Every control is a real <button>.
 */

export interface HudHandlers {
  onSkip(): void;
  onSound(): void;
  onReplay(): void;
}

const SOUND_ICON = `<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor"/><path class="ab-wave" d="M11 5.5c1 .8 1.5 1.6 1.5 2.5s-.5 1.7-1.5 2.5M12.8 3.5c1.6 1.2 2.4 2.7 2.4 4.5s-.8 3.3-2.4 4.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;

export class Hud {
  readonly el: HTMLDivElement;

  /** Typed query inside the HUD. Throws if the markup is missing a part (a bug, not a runtime state). */
  private q(sel: string): HTMLElement {
    const found = this.el.querySelector<HTMLElement>(sel);
    if (!found) throw new Error(`HUD element not found: ${sel}`);
    return found;
  }

  constructor(
    parent: HTMLElement,
    private h: HudHandlers,
  ) {
    this.el = document.createElement("div");
    this.el.className = "ab-hud";
    this.el.dataset.phase = "scan";
    this.el.setAttribute("role", "region");
    this.el.setAttribute("aria-label", "Page build animation");
    this.el.innerHTML = `
      <div class="ab-panel ab-scan">
        <span class="ab-pulse"></span>
        <span class="ab-text">Agents arriving…</span>
      </div>
      <div class="ab-panel ab-build">
        <span class="ab-pulse"></span>
        <span class="ab-text">Building · <b class="ab-agents">0</b> agents</span>
        <span class="ab-layers"><span class="ab-layers-n">0 / 0</span><span class="ab-bar"><i></i></span></span>
      </div>
      <div class="ab-panel ab-done">
        <span class="ab-done-dot"></span>
        <span class="ab-done-text ab-text"></span>
        <button type="button" class="ab-btn ab-replay">Replay</button>
      </div>
      <button type="button" class="ab-btn ab-icon ab-sound" aria-pressed="false" aria-label="Toggle build sounds" title="Sound">${SOUND_ICON}</button>
      <button type="button" class="ab-btn ab-skip" title="Skip (Esc)">Skip</button>
    `;
    parent.appendChild(this.el);

    this.q(".ab-skip").addEventListener("click", () => this.h.onSkip());
    this.q(".ab-sound").addEventListener("click", () => this.h.onSound());
    this.q(".ab-replay").addEventListener("click", () => this.h.onReplay());

    requestAnimationFrame(() => this.el.classList.add("ab-on"));
  }

  setPhase(phase: "scan" | "build" | "done") {
    this.el.dataset.phase = phase;
    const skip = this.q(".ab-skip");
    skip.textContent = phase === "done" ? "✕" : "Skip";
    skip.setAttribute("aria-label", phase === "done" ? "Close" : "Skip the build animation");
  }

  setAgents(count: number) {
    this.q(".ab-agents").textContent = String(count);
  }

  setProgress(built: number, total: number) {
    this.q(".ab-layers-n").textContent = `${built} / ${total}`;
    this.q(".ab-bar i").style.transform = `scaleX(${total ? built / total : 0})`;
  }

  setSound(on: boolean) {
    const b = this.q(".ab-sound");
    b.setAttribute("aria-pressed", String(on));
    b.classList.toggle("ab-active", on);
  }

  setDone(agents: number, seconds: number) {
    this.q(".ab-done-text").textContent = `Built by ${agents} agents in ${seconds.toFixed(1)}s`;
  }

  destroy(fade = true) {
    if (!fade) {
      this.el.remove();
      return;
    }
    this.el.classList.remove("ab-on");
    window.setTimeout(() => this.el.remove(), 350);
  }
}
