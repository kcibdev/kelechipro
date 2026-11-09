import { gsap } from "gsap";
import { Agent, type Bounds } from "./agents";
import { Clock } from "./clock";
import {
  AGENT_COLORS,
  AGENT_LETTERS,
  DESKTOP,
  MOBILE,
  TABLET,
  SPEEDS,
  TIMING,
  TOUR_ANCHOR,
  TOUR_WINDOW,
  type DeviceProfile,
  type Speed,
} from "./config";
import { Hud } from "./hud";
import { collectLayers, isInvisible, remeasure, sortReadingOrder } from "./layers";
import { Overlay, Selection } from "./overlay";
import { agentPoint, clearInline, entryPoint, measureLayer, reveal, SHOWN, type RevealCtx } from "./reveal";
import type { Sound } from "./sound";
import { Swarm } from "./swarm";
import type { Layer, Phase } from "./types";

export interface ControllerHooks {
  /** The visitor chose to leave the build (✕, Esc or "Go live"). */
  onExit(): void;
  /** The visitor pressed "Replay". */
  onReplay(): void;
}

const NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);

/**
 * Orchestrates the whole sequence: scan → build → done.
 *
 * Owns the agents, assigns layers to free agents in reading order, drives the
 * "Touring" auto-scroll, retimes everything for the speed toggle and guarantees
 * that skip always leaves a clean, finished page.
 */
export class BuildController {
  phase: Phase = "idle";
  private clock = new Clock();
  private overlay!: Overlay;
  private hud!: Hud;
  private agents: Agent[] = [];
  private layers: Layer[] = [];
  private built = 0;
  private frontier = 0;
  private cleanups = new Set<() => void>();
  private device: DeviceProfile;
  private speed: Speed;
  private touring = true;
  private accent = "#e11d48";
  private startedAt = 0;
  private swarm: Swarm | null = null;

  /** Tracked scroll + viewport (updated by listeners; never read in the frame loop). */
  private scroll = { x: 0, y: 0 };
  private vw = 0;
  private vh = 0;
  private docH = 0;
  private bounds: Bounds = { maxX: 0, maxY: 0 };

  private tourPos = 0;
  private tourTarget = 0;
  private expectedScroll = -1;

  private assignTimer = 0;
  private joinTimer = 0;
  private ro: ResizeObserver | null = null;
  private remeasureTimer = 0;
  private off: (() => void)[] = [];
  private disposed = false;

  constructor(
    private sound: Sound,
    private hooks: ControllerHooks,
  ) {
    // Phone < 768px; tablet = < 1024px wide or any other touch-first screen; else desktop.
    const mq = (q: string) => window.matchMedia(q).matches;
    this.device = mq("(max-width: 767px)")
      ? MOBILE
      : mq("(max-width: 1023px)") || mq("(pointer: coarse)")
        ? TABLET
        : DESKTOP;
    this.speed = this.device.defaultSpeed;
    this.clock.setSpeed(this.speed);
  }

  /* ─────────────────────────────── Lifecycle ─────────────────────────────── */

  async start() {
    const html = document.documentElement;
    // Fresh state (also covers Replay on an already-live page).
    document.querySelectorAll<HTMLElement>(`[${SHOWN}]`).forEach((el) => el.removeAttribute(SHOWN));
    html.setAttribute("data-ab", "build");

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    this.accent = getComputedStyle(html).getPropertyValue("--accent").trim() || this.accent;
    this.readViewport();
    this.startedAt = performance.now();

    this.overlay = new Overlay();
    this.hud = new Hud(this.overlay.fixedRoot, {
      onClose: () => this.skip(),
      onTouring: () => this.setTouring(!this.touring),
      onSpeed: () => this.cycleSpeed(),
      onSound: () => void this.toggleSound(),
      onGoLive: () => this.goLive(),
      onReplay: () => this.hooks.onReplay(),
    });
    this.hud.setSpeed(this.speed);
    this.hud.setTouring(this.touring);
    this.hud.setSound(this.sound.enabled);

    for (let i = 0; i < this.device.startAgents; i++) this.spawn(true);
    this.hud.setAgents(this.agents);
    this.listen();
    gsap.ticker.add(this.tick);

    /* Phase 1 — scan */
    this.phase = "scan";
    const scanBar = { p: 0 };
    gsap.to(scanBar, {
      p: 1,
      duration: TIMING.scanMin,
      ease: "power1.inOut",
      onUpdate: () => this.hud.setScanProgress(scanBar.p),
    });
    await Promise.all([
      document.fonts.ready.catch(() => undefined),
      new Promise((r) => window.setTimeout(r, TIMING.scanMin * 1000)),
    ]);
    if (this.disposed) return;

    this.readViewport();
    this.layers = collectLayers();
    this.layers.forEach((l) => isInvisible(l) && this.completeLayer(l, true));
    this.hud.setProgress(this.built, this.layers.length);

    /* Phase 2 — build */
    this.phase = "build";
    this.hud.setPhase("build");
    this.agents.forEach((a, i) => {
      window.setTimeout(() => a.setLook("arrow"), i * 35);
      void this.clock.wait(TIMING.morph + i * 0.08).then(() => {
        if (a.state === "joining") a.state = "idle";
      });
    });
    if (this.built === this.layers.length) this.finish();
  }

  /** Tear everything down. `fade` animates the overlay out. */
  dispose(fade = false) {
    if (this.disposed) return;
    this.disposed = true;
    gsap.ticker.remove(this.tick);
    this.clock.killAll();
    this.off.forEach((fn) => fn());
    this.ro?.disconnect();
    window.clearTimeout(this.remeasureTimer);
    this.cleanups.forEach((fn) => fn());
    this.cleanups.clear();
    this.revealEverything();
    this.hud.destroy(fade);
    this.overlay.destroy(fade);
    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    this.phase = "idle";
  }

  /** ✕ / Esc: jump straight to the finished page. */
  skip() {
    this.dispose(true);
    this.hooks.onExit();
  }

  /** "Go live": hide the HUD and the swarm. */
  goLive() {
    this.dispose(true);
    this.hooks.onExit();
  }

  /** Make every layer visible with no leftover inline styles. */
  private revealEverything() {
    const html = document.documentElement;
    document.querySelectorAll<HTMLElement>("[data-layer]").forEach((el) => {
      clearInline(el);
      el.querySelectorAll<HTMLElement>("[data-tag]").forEach(clearInline);
      el.removeAttribute(SHOWN);
    });
    html.removeAttribute("data-ab");
  }

  /* ─────────────────────────────── Agents ─────────────────────────────── */

  private spawn(initial: boolean) {
    const i = this.agents.length;
    const color = AGENT_COLORS[i % AGENT_COLORS.length] ?? AGENT_COLORS[0];
    const letter = AGENT_LETTERS.charAt(i % AGENT_LETTERS.length);
    let x: number;
    let y: number;
    if (initial) {
      x = this.vw * (0.08 + Math.random() * 0.84);
      y = this.scroll.y + this.vh * (0.1 + Math.random() * 0.75);
    } else {
      // New agents fly in from a side edge.
      x = Math.random() < 0.5 ? 0 : this.bounds.maxX;
      y = this.scroll.y + this.vh * (0.2 + Math.random() * 0.6);
    }
    const a = new Agent(this.overlay.docRoot, color, letter, x, y);
    a.travelScale = this.device.travelScale;
    this.pickWander(a);
    if (!initial) {
      a.setLook("arrow");
      a.state = "idle";
    }
    this.agents.push(a);
    return a;
  }

  private pickWander(a: Agent) {
    a.wanderX = this.vw * (0.08 + Math.random() * 0.84);
    a.wanderY = this.scroll.y + this.vh * (0.15 + Math.random() * 0.65);
  }

  /* ─────────────────────────────── Frame loop ─────────────────────────────── */

  private tick = (_time: number, deltaMs: number) => {
    const real = Math.min(deltaMs / 1000, 0.05);
    const dt = real * this.speed;

    if (this.phase === "build") {
      this.updateJoins(dt);
      this.assignTimer -= real;
      if (this.assignTimer <= 0) {
        this.assignTimer = 0.08;
        this.assign();
      }
      if (this.touring) this.updateTour(real);
    }

    if (this.phase === "done" && this.swarm) {
      this.swarm.step(this.agents, real, this.scroll.x, this.scroll.y);
    } else {
      // Idle drift (scan crosshairs + agents waiting for work).
      const rate = 1 - Math.exp(-dt * (this.phase === "scan" ? 0.45 : 0.9));
      for (const a of this.agents) {
        if (a.state !== "idle" && a.state !== "joining") continue;
        const dx = a.wanderX - a.x;
        const dy = a.wanderY - a.y;
        const wobble = Math.sin((performance.now() / 1000) * 1.3 + a.seed) * 0.4;
        a.x += dx * rate + wobble;
        a.y += dy * rate;
        const off = a.wanderY < this.scroll.y || a.wanderY > this.scroll.y + this.vh;
        if (dx * dx + dy * dy < 900 || off) this.pickWander(a);
      }
    }

    for (const a of this.agents) a.render(this.bounds);
  };

  private updateJoins(dt: number) {
    if (this.agents.length >= this.device.maxAgents) return;
    this.joinTimer += dt;
    if (this.joinTimer < this.device.joinEvery) return;
    this.joinTimer = 0;
    this.spawn(false);
    this.hud.setAgents(this.agents);
  }

  /* ─────────────────────────────── Scheduling ─────────────────────────────── */

  private advanceFrontier() {
    // Skip past finished layers (and fixed ones, which never block the tour).
    for (;;) {
      const l = this.layers[this.frontier];
      if (!l || (l.state !== "done" && !l.fixed)) break;
      this.frontier++;
    }
  }

  private isEligible(l: Layer, mode: "window" | "above") {
    if (l.fixed) return true;
    const { y, h } = l.box;
    if (this.touring) {
      // At the bottom of the page the tour can't move further, so open up the rest.
      const atBottom = this.tourTarget >= this.docH - this.vh - 2;
      // Build near what's actually on screen: don't run far ahead of a slower scroll.
      const base = Math.min(this.tourTarget, this.tourPos + this.vh * 0.35);
      return atBottom || y < base + this.vh * TOUR_WINDOW;
    }
    if (mode === "above") return y + h <= this.scroll.y;
    return y < this.scroll.y + this.vh * 0.95 && y + h > this.scroll.y - this.vh * 0.05;
  }

  /** Give eligible layers (reading order, parent done) to the nearest free agents. */
  private assign() {
    let idle = this.agents.filter((a) => a.state === "idle");
    if (!idle.length) return;
    this.advanceFrontier();

    const pass = (mode: "window" | "above") => {
      for (const l of this.layers) {
        if (!idle.length) return;
        if (l.state !== "pending") continue;
        if (l.parent && l.parent.state !== "done") continue;
        if (!this.isEligible(l, mode)) continue;
        const target = agentPoint(l, { scroll: this.scroll } as RevealCtx, l.box.x, l.box.y);
        let agent: Agent | undefined;
        let bestD = Infinity;
        for (const a of idle) {
          const d = (a.x - target.x) ** 2 + (a.y - target.y) ** 2;
          if (d < bestD) {
            bestD = d;
            agent = a;
          }
        }
        if (!agent) return;
        const chosen = agent;
        idle = idle.filter((a) => a !== chosen);
        void this.runTask(chosen, l);
      }
    };
    pass("window");
    // When the visitor has scrolled away, finish anything left above the viewport too.
    if (!this.touring && idle.length) pass("above");
  }

  private async runTask(agent: Agent, layer: Layer) {
    const clock = this.clock;
    layer.state = "active";
    agent.state = "busy";
    agent.setLook("arrow");

    const ctx: RevealCtx = {
      clock,
      agent,
      overlay: this.overlay,
      sound: this.sound,
      accent: this.accent,
      scroll: this.scroll,
      onCleanup: (fn) => {
        this.cleanups.add(fn);
        return () => this.cleanups.delete(fn);
      },
    };

    let box = measureLayer(layer, this.scroll);
    if (box.w < 1 || box.h < 1) {
      this.completeLayer(layer, true);
      agent.state = "idle";
      return;
    }
    const entry = entryPoint(layer, box);
    const p = agentPoint(layer, ctx, entry.x, entry.y);
    await agent.glideTo(clock, p.x, p.y);
    if (!clock.isAlive()) return;

    box = measureLayer(layer, this.scroll);
    const sel = new Selection(this.overlay.root(layer.fixed), box);
    const disposeSel = ctx.onCleanup(() => sel.el.remove());
    await clock.wait(TIMING.selectIn);
    if (!clock.isAlive()) return;

    await reveal(layer, box, ctx);
    if (!clock.isAlive()) return;
    this.completeLayer(layer);
    this.sound.pop();

    await clock.wait(TIMING.holdAfter);
    if (!clock.isAlive()) return;
    sel.remove();
    disposeSel();

    await clock.wait(TIMING.rest);
    if (!clock.isAlive()) return;
    agent.state = this.phase === "done" ? "swarm" : "idle";
    this.pickWander(agent);
  }

  private completeLayer(layer: Layer, instant = false) {
    if (layer.state === "done") return;
    layer.state = "done";
    if (instant) {
      clearInline(layer.el);
      layer.el.querySelectorAll<HTMLElement>("[data-tag]").forEach(clearInline);
    }
    layer.el.setAttribute(SHOWN, "");
    this.built++;
    this.hud.setProgress(this.built, this.layers.length);
    if (this.phase === "build" && this.built >= this.layers.length) this.finish();
  }

  /* ─────────────────────────────── Phase 3 — done ─────────────────────────────── */

  private finish() {
    if (this.phase === "done") return;
    this.phase = "done";
    const secs = (performance.now() - this.startedAt) / 1000;
    document.documentElement.removeAttribute("data-ab");
    document.querySelectorAll<HTMLElement>(`[${SHOWN}]`).forEach((el) => el.removeAttribute(SHOWN));
    this.hud.setDone(this.agents.length, secs);
    this.hud.setPhase("done");
    this.sound.chime();

    // Gather into a swarm around the pointer (or the viewport centre until it moves).
    this.swarm = new Swarm(this.vw / 2, this.scroll.y + this.vh / 2);
    this.swarm.point(this.vw / 2, this.vh / 2, false);
    this.agents.forEach((a) => {
      a.setLook("arrow");
      if (a.state !== "busy") a.state = "swarm";
    });
  }

  /* ─────────────────────────────── Touring ─────────────────────────────── */

  private updateTour(real: number) {
    this.advanceFrontier();
    const maxScroll = Math.max(0, this.docH - this.vh);
    const front = this.layers[this.frontier];
    if (front) {
      const want = Math.min(maxScroll, Math.max(0, front.box.y - this.vh * TOUR_ANCHOR));
      this.tourTarget = Math.max(this.tourTarget, want);
    } else {
      this.tourTarget = Math.max(this.tourTarget, maxScroll);
    }
    // Eased approach, capped to a per-device max speed so small screens scroll calmly.
    const k = 1 - Math.exp(-real * this.device.tourEase * Math.sqrt(this.speed));
    const maxStep = this.device.tourMaxSpeed * this.speed * real;
    const step = (this.tourTarget - this.tourPos) * k;
    this.tourPos += Math.max(-maxStep, Math.min(maxStep, step));
    const top = Math.round(this.tourPos);
    if (top !== Math.round(this.scroll.y)) {
      this.expectedScroll = top;
      window.scrollTo({ top, left: 0, behavior: "instant" });
    }
  }

  private setTouring(on: boolean) {
    this.touring = on;
    this.hud.setTouring(on);
    if (on) {
      this.tourPos = this.scroll.y;
      this.advanceFrontier();
      const front = this.layers[this.frontier];
      this.tourTarget = front ? Math.max(0, front.box.y - this.vh * TOUR_ANCHOR) : this.scroll.y;
    }
  }

  /* ─────────────────────────────── Controls ─────────────────────────────── */

  private cycleSpeed() {
    const i = SPEEDS.indexOf(this.speed);
    this.speed = SPEEDS[(i + 1) % SPEEDS.length] ?? 1;
    this.clock.setSpeed(this.speed);
    this.hud.setSpeed(this.speed);
  }

  private async toggleSound() {
    if (this.sound.enabled) this.sound.disable();
    else await this.sound.enable();
    this.hud.setSound(this.sound.enabled);
  }

  /* ─────────────────────────────── Listeners ─────────────────────────────── */

  private readViewport() {
    this.vw = document.documentElement.clientWidth;
    this.vh = window.innerHeight;
    this.docH = document.documentElement.scrollHeight;
    this.scroll.x = window.scrollX;
    this.scroll.y = window.scrollY;
    this.bounds = { maxX: Math.max(0, this.vw - 46), maxY: Math.max(0, this.docH - 44) };
  }

  private on<K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) {
    window.addEventListener(type, fn, opts);
    this.off.push(() => window.removeEventListener(type, fn, opts));
  }

  private listen() {
    const manual = () => {
      if (this.touring && this.phase === "build") this.setTouring(false);
    };

    this.on(
      "scroll",
      () => {
        this.scroll.x = window.scrollX;
        this.scroll.y = window.scrollY;
        // Any scroll we didn't cause (scrollbar drag, anchor jump) turns Touring off.
        if (this.touring && this.expectedScroll >= 0 && Math.abs(this.scroll.y - this.expectedScroll) > 8) manual();
      },
      { passive: true },
    );
    this.on("wheel", manual, { passive: true });
    this.on("touchmove", manual, { passive: true });
    this.on("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.phase === "done") this.goLive();
        else this.skip();
        return;
      }
      const t = e.target as HTMLElement | null;
      if (NAV_KEYS.has(e.key) && !(t && /^(INPUT|TEXTAREA|BUTTON)$/.test(t.tagName))) manual();
    });

    // Pointer → swarm target.
    this.on(
      "pointermove",
      (e) => {
        if (e.pointerType === "mouse") this.swarm?.point(e.clientX, e.clientY, false);
      },
      { passive: true },
    );
    this.on(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "mouse") this.swarm?.point(e.clientX, e.clientY, true);
      },
      { passive: true },
    );

    // Any layout change (resize, font swap, filter change) → re-measure once things settle.
    const schedule = () => {
      window.clearTimeout(this.remeasureTimer);
      this.remeasureTimer = window.setTimeout(() => this.onLayoutChange(), 120);
    };
    this.on("resize", schedule);
    this.ro = new ResizeObserver(schedule);
    const page = document.getElementById("page");
    if (page) this.ro.observe(page);
  }

  private onLayoutChange() {
    if (this.disposed) return;
    this.readViewport();
    if (!this.layers.length) return;
    remeasure(this.layers);
    sortReadingOrder(this.layers);
    this.frontier = 0;
    for (const l of this.layers) if (l.state === "pending" && isInvisible(l)) this.completeLayer(l, true);
  }
}
