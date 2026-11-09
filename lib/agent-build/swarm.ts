import type { Agent } from "./agents";

/**
 * Swarm for the "done" phase: the agents orbit the visitor's pointer.
 *
 * Each agent is steered toward its own slot on a rotating ring around a lagged
 * target (boids-style steering: seek the slot + match its orbital velocity, with
 * separation so cursors never stack). Larger swarms split into two
 * counter-rotating rings. Every cursor turns to point at the centre.
 */

const INNER_R = 72;
const OUTER_R = 112;
const OMEGA = 0.85; // ring angular speed, rad/s
const MAX_SPEED = 900; // px/s
const MAX_FORCE = 2600; // px/s²
const SEEK_GAIN = 5.5; // spring toward the slot
const SEP_RADIUS = 26;
const SEP_GAIN = 1400;

export class Swarm {
  /** Smoothed target (document coords). */
  tx: number;
  ty: number;
  /** Raw pointer target in client coords + whether it's a touch anchor. */
  private px: number;
  private py: number;
  private touch = false;
  private time = 0;

  constructor(x: number, y: number) {
    this.tx = this.px = x;
    this.ty = this.py = y;
  }

  /** Pointer position in viewport coordinates. */
  point(clientX: number, clientY: number, touch: boolean) {
    this.px = clientX;
    this.py = clientY;
    this.touch = touch;
  }

  step(agents: Agent[], dt: number, scrollX: number, scrollY: number) {
    this.time += dt;
    const t = this.time;
    let gx = this.px + scrollX;
    let gy = this.py + scrollY;
    // On touch the ring's centre drifts gently around the last tapped point.
    if (this.touch) {
      gx += Math.cos(t * 0.6) * 22;
      gy += Math.sin(t * 0.8) * 16;
    }
    // Lag: the ring's centre trails the pointer.
    const lag = 1 - Math.exp(-dt * 4);
    this.tx += (gx - this.tx) * lag;
    this.ty += (gy - this.ty) * lag;

    const n = agents.length;
    const twoRings = n > 14;
    const inner = twoRings ? Math.ceil(n / 2) : n;
    const outer = n - inner;

    agents.forEach((a, i) => {
      const onOuter = twoRings && i % 2 === 1;
      const slot = twoRings ? Math.floor(i / 2) : i;
      const count = onOuter ? outer : inner;
      const dir = onOuter ? -1 : 1;
      // Radius breathes a little per agent so the ring never looks mechanical.
      const r = (onOuter ? OUTER_R : INNER_R) + Math.sin(t * 1.4 + a.seed) * 6;
      const ang = (slot / count) * Math.PI * 2 + dir * OMEGA * t + (onOuter ? Math.PI / count : 0);
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);

      // Slot position and its orbital (tangential) velocity.
      const sx = this.tx + cos * r;
      const sy = this.ty + sin * r;
      const svx = -sin * r * OMEGA * dir;
      const svy = cos * r * OMEGA * dir;

      let fx = ((sx - a.x) * SEEK_GAIN + svx - a.vx) * 6;
      let fy = ((sy - a.y) * SEEK_GAIN + svy - a.vy) * 6;

      // Separation from neighbours.
      for (const b of agents) {
        if (b === a) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > SEP_RADIUS * SEP_RADIUS || d2 === 0) continue;
        const d = Math.sqrt(d2);
        fx += (dx / d) * (SEP_RADIUS - d) * SEP_GAIN * 0.04;
        fy += (dy / d) * (SEP_RADIUS - d) * SEP_GAIN * 0.04;
      }

      const f = Math.hypot(fx, fy);
      if (f > MAX_FORCE) {
        fx = (fx / f) * MAX_FORCE;
        fy = (fy / f) * MAX_FORCE;
      }
      a.vx += fx * dt;
      a.vy += fy * dt;
      const v = Math.hypot(a.vx, a.vy);
      if (v > MAX_SPEED) {
        a.vx = (a.vx / v) * MAX_SPEED;
        a.vy = (a.vy / v) * MAX_SPEED;
      }
    });

    for (const a of agents) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      // Point the cursor at the centre of the ring.
      a.aim((Math.atan2(this.ty - a.y, this.tx - a.x) * 180) / Math.PI);
    }
  }
}
