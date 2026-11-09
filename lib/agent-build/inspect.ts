import { gsap } from "gsap";
import { Agent, type Bounds } from "./agents";
import { Clock } from "./clock";
import { AGENT_COLORS, AGENT_LETTERS, INSPECT_SELECTOR, TIMING } from "./config";
import { Overlay, Selection } from "./overlay";

/**
 * Section inspector — the calm, post-build presence of the agents.
 *
 * Content is never hidden. When a section heading scrolls into view, a single cursor
 * glides in, selects the heading (design-tool box + size badge) for a moment and
 * leaves. Each heading is inspected once; one inspection runs at a time.
 */
export class Inspector {
  private overlay = new Overlay();
  private clock = new Clock();
  private io: IntersectionObserver;
  private queue: HTMLElement[] = [];
  private busy = false;
  private agent: Agent | null = null;
  private count = 0;
  private disposed = false;

  constructor() {
    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          this.io.unobserve(e.target);
          this.enqueue(e.target as HTMLElement);
        }
      },
      // Fire once the heading is comfortably inside the viewport.
      { threshold: 0.9, rootMargin: "0px 0px -20% 0px" },
    );
    document.querySelectorAll<HTMLElement>(INSPECT_SELECTOR).forEach((el) => {
      this.io.observe(el);
    });
    gsap.ticker.add(this.tick);
  }

  private tick = () => {
    if (this.agent) this.agent.render(this.bounds());
  };

  private bounds(): Bounds {
    const w = document.documentElement.clientWidth;
    return { maxX: Math.max(0, w - 46), maxY: Math.max(0, document.documentElement.scrollHeight - 44) };
  }

  private enqueue(el: HTMLElement) {
    // Never build a backlog: if the visitor scrolls fast, skip extras rather than lag behind.
    if (this.queue.length >= 1) this.queue.shift();
    this.queue.push(el);
    void this.drain();
  }

  private async drain() {
    if (this.busy) return;
    this.busy = true;
    for (let el = this.queue.shift(); el && !this.disposed; el = this.queue.shift()) {
      await this.inspect(el);
    }
    this.busy = false;
  }

  private async inspect(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    // Skip if it already scrolled out of view while queued.
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const sx = window.scrollX;
    const sy = window.scrollY;
    const vw = document.documentElement.clientWidth;
    const box = { x: r.left + sx, y: r.top + sy, w: r.width, h: r.height };

    const i = this.count++;
    const color = AGENT_COLORS[i % AGENT_COLORS.length] ?? AGENT_COLORS[0];
    const fromRight = i % 2 === 0;
    const agent = new Agent(
      this.overlay.docRoot,
      color,
      AGENT_LETTERS.charAt(i % AGENT_LETTERS.length),
      fromRight ? vw - 60 : 20,
      box.y + box.h + 60,
      i % AGENT_COLORS.length === 0 ? "#fff" : "#0a0a0b",
    );
    agent.setLook("arrow");
    this.agent = agent;

    await agent.glideTo(this.clock, box.x + Math.min(box.w, 320) * 0.9, box.y + box.h * 0.75, 0.55);
    if (!this.clock.isAlive()) return;
    const sel = new Selection(this.overlay.docRoot, box);
    await this.clock.wait(TIMING.inspectHold);
    sel.remove();
    if (!this.clock.isAlive()) return;
    await agent.glideTo(this.clock, fromRight ? vw - 40 : 0, box.y + box.h + 120, 0.45);
    agent.leave();
    if (this.agent === agent) this.agent = null;
  }

  destroy() {
    this.disposed = true;
    this.io.disconnect();
    gsap.ticker.remove(this.tick);
    this.clock.killAll();
    this.overlay.destroy(false);
  }
}
