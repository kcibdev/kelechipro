import type { Clock } from "./clock";
import { TIMING } from "./config";

/**
 * Agent rendering + motion.
 *
 * An agent is a small absolutely-positioned element in the document-space overlay,
 * moved only with translate3d. It can look like a "+" crosshair (scan phase),
 * a cursor arrow (building) or an I-beam (typing).
 */

export type AgentLook = "cross" | "arrow" | "ibeam";
export type AgentState = "joining" | "idle" | "busy" | "swarm";

const ARROW = `<svg class="ab-arrow" width="22" height="24" viewBox="0 0 22 24" aria-hidden="true"><path d="M2.5 1.8v17.6l4.9-4.6 3 6.8 3.2-1.4-3-6.7h6.8z" fill="currentColor" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const CROSS = `<svg class="ab-cross" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2v14M2 9h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>`;
const IBEAM = `<svg class="ab-ibeam" width="14" height="22" viewBox="0 0 14 22" aria-hidden="true"><path d="M3 2h3l1 1 1-1h3M7 3v16M3 20h3l1-1 1 1h3" fill="none" stroke="#050505" stroke-width="3.2" stroke-linecap="round"/><path d="M3 2h3l1 1 1-1h3M7 3v16M3 20h3l1-1 1 1h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export interface Bounds {
  /** Document-space clamp so agents never extend the page. */
  maxX: number;
  maxY: number;
}

interface Path {
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Agent {
  readonly el: HTMLDivElement;
  readonly color: string;
  readonly letter: string;
  x: number;
  y: number;
  /** Velocity, used by idle drift and the boids swarm (px/s). */
  vx = 0;
  vy = 0;
  state: AgentState = "joining";
  look: AgentLook = "cross";
  /** Per-agent random seed for drift + swarm spread. */
  readonly seed = Math.random() * 1000;
  /** Multiplier on glide durations (per device: calmer cursors on phones/tablets). */
  travelScale = 1;
  /** Idle drift target. */
  wanderX = 0;
  wanderY = 0;

  /**
   * @param ink label text colour — white on the accent lead, near-black on the light neutrals.
   */
  constructor(parent: HTMLElement, color: string, letter: string, x: number, y: number, ink = "#fff") {
    this.color = color;
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.el = document.createElement("div");
    this.el.className = "ab-agent";
    this.el.style.color = color;
    this.el.dataset.look = "cross";
    this.el.innerHTML = `${CROSS}${ARROW}${IBEAM}<span class="ab-agent-tag" style="background:${color};color:${ink}">${letter}</span>`;
    parent.appendChild(this.el);
    this.render();
  }

  setLook(look: AgentLook) {
    if (this.look === look) return;
    this.look = look;
    this.el.dataset.look = look;
  }

  /** Continuous (unwrapped) arrow rotation, so the cursor never spins the long way round. */
  private rot = 0;

  /**
   * Point the arrow cursor in a direction (degrees, screen space).
   * The arrow's tip naturally points up-left (≈ -116°), so offset by that.
   */
  aim(directionDeg: number) {
    if (!this.el.hasAttribute("data-aim")) this.el.setAttribute("data-aim", "");
    let target = directionDeg + 116;
    // Unwrap toward the current angle.
    target += Math.round((this.rot - target) / 360) * 360;
    // Ease toward it for a smooth turn.
    this.rot += (target - this.rot) * 0.2;
    this.el.style.setProperty("--rot", `${this.rot.toFixed(1)}deg`);
  }

  /** Write the current position. Transform only — no layout. */
  render(bounds?: Bounds) {
    if (bounds) {
      this.x = Math.max(0, Math.min(bounds.maxX, this.x));
      this.y = Math.max(0, Math.min(bounds.maxY, this.y));
    }
    this.el.style.transform = `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0)`;
  }

  /**
   * Glide to (x, y) along a slightly curved quadratic path with eased timing.
   * Duration scales with distance. Speed-scaled via the clock.
   */
  async glideTo(clock: Clock, x: number, y: number, durationOverride?: number): Promise<void> {
    const dx = x - this.x;
    const dy = y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return Promise.resolve();
    // Perpendicular offset for the control point: 10–22% of distance, random side.
    const bend = (0.1 + Math.random() * 0.12) * (Math.random() < 0.5 ? -1 : 1);
    const path: Path = {
      x0: this.x,
      y0: this.y,
      cx: this.x + dx / 2 - dy * bend,
      cy: this.y + dy / 2 + dx * bend,
      x1: x,
      y1: y,
    };
    const duration =
      (durationOverride ?? Math.min(TIMING.travelMax, TIMING.travelBase + dist / TIMING.travelPxPerSec)) *
      this.travelScale;
    return clock.progress(duration, (p) => {
      const t = easeInOutCubic(p);
      const u = 1 - t;
      this.x = u * u * path.x0 + 2 * u * t * path.cx + t * t * path.x1;
      this.y = u * u * path.y0 + 2 * u * t * path.cy + t * t * path.y1;
    });
  }

  /** Pin the agent to a point (used while it drags/traces during a reveal). */
  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Fade out (CSS), then remove. */
  leave() {
    this.el.classList.add("ab-gone");
    window.setTimeout(() => this.el.remove(), 450);
  }

  destroy() {
    this.el.remove();
  }
}
