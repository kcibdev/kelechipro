import { gsap } from "gsap";
import { Agent, type Bounds } from "./agents";
import { Clock } from "./clock";
import { AFTER_BUILD, AGENT_COLORS, AGENT_LETTERS, DESKTOP, DONE_HUD_MS, MOBILE, TABLET, TIMING, type DeviceProfile } from "./config";
import { Hud } from "./hud";
import { collectLayers, isInvisible, remeasure, sortReadingOrder } from "./layers";
import { Overlay, Selection } from "./overlay";
import { agentPoint, clearInline, entryPoint, measureLayer, reveal, SHOWN, type RevealCtx } from "./reveal";
import type { Sound } from "./sound";
import { Swarm } from "./swarm";
import type { Layer, Phase } from "./types";

export interface ControllerHooks {
  /** The visitor skipped or closed the build. */
  onExit(): void;
  /** The build finished on its own (start the calm, post-build extras). */
  onDone(): void;
  /** The visitor pressed "Replay". */
  onReplay(): void;
}

export interface StartOptions {
  /** Replays scroll back to the top so the hero is in view. */
  replay?: boolean;
}

/** The region that builds. Everything outside it is visible from the first paint. */
const BUILD_ROOT_ID = "top";

/**
 * Orchestrates the hero build: a short scan → build → done.
 *
 * Only layers inside the hero that are on screen at start are built; anything else is
 * revealed instantly, so the visitor can scroll and read from the first second. There's
 * no auto-scroll and no speed toggle — the whole thing takes a few seconds.
 */
export class BuildController {
  phase: Phase = "idle";
  private clock = new Clock();
  private overlay!: Overlay;
  private hud!: Hud;
  private agents: Agent[] = [];
  private layers: Layer[] = [];
  /** Layers in the order agents pick them up: priority first, then reading order. */
  private queue: Layer[] = [];
  private built = 0;
  private cleanups = new Set<() => void>();
  private device: DeviceProfile;
  private accent = "#e11d48";
  private startedAt = 0;
  private swarm: Swarm | null = null;
  private doneTimer = 0;

  /** Tracked scroll + viewport (updated by listeners; never read in the frame loop). */
  private scroll = { x: 0, y: 0 };
  private vw = 0;
  private vh = 0;
  private docH = 0;
  private bounds: Bounds = { maxX: 0, maxY: 0 };

  private assignTimer = 0;
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
  }

  /* ─────────────────────────────── Lifecycle ─────────────────────────────── */

  async start(opts: StartOptions = {}) {
    const html = document.documentElement;
    // Fresh state (also covers Replay on an already-live page).
    document.querySelectorAll<HTMLElement>(`[${SHOWN}]`).forEach((el) => el.removeAttribute(SHOWN));
    html.setAttribute("data-ab", "build");
    if (opts.replay) window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    this.accent = getComputedStyle(html).getPropertyValue("--accent").trim() || this.accent;
    this.readViewport();
    this.startedAt = performance.now();

    this.overlay = new Overlay();
    this.hud = new Hud(this.overlay.fixedRoot, {
      onSkip: () => this.skip(),
      onSound: () => void this.toggleSound(),
      onReplay: () => this.hooks.onReplay(),
    });
    this.hud.setSound(this.sound.enabled);

    for (let i = 0; i < this.device.agents; i++) this.spawn(i);
    this.hud.setAgents(this.agents.length);
    this.listen();
    gsap.ticker.add(this.tick);

    /* Phase 1 — scan: a beat of crosshairs while fonts settle (capped, never a loading screen). */
    this.phase = "scan";
    await Promise.all([
      Promise.race([document.fonts.ready, sleep(TIMING.fontWaitMax)]),
      sleep(TIMING.scanMin),
    ]);
    if (this.disposed) return;

    this.readViewport();
    const root = document.getElementById(BUILD_ROOT_ID) ?? document;
    this.layers = collectLayers(root);
    // Only what's on screen gets built. The rest of the hero appears instantly.
    for (const l of this.layers) if (isInvisible(l) || !this.inView(l)) this.completeLayer(l, true);
    this.queue = this.layers.filter((l) => l.kind !== "fade").sort((a, b) => b.priority - a.priority);
    this.hud.setProgress(this.built, this.layers.length);
    // Decoration (glow, outline word) fades in on its own — no agent, no selection box.
    for (const l of this.layers) if (l.kind === "fade" && l.state === "pending") void this.autoFade(l);

    /* Phase 2 — build */
    this.phase = "build";
    this.hud.setPhase("build");
    this.agents.forEach((a, i) => {
      window.setTimeout(() => a.setLook("arrow"), i * 30);
      void this.clock.wait(TIMING.morph + i * 0.04).then(() => {
        if (a.state === "joining") a.state = "idle";
      });
    });
    if (this.built >= this.layers.length) this.finish();
  }

  /** Tear everything down. `fade` animates the overlay out. */
  dispose(fade = false) {
    if (this.disposed) return;
    this.disposed = true;
    window.clearTimeout(this.doneTimer);
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
    this.phase = "idle";
  }

  /** Skip / ✕ / Esc: jump straight to the finished page. */
  skip() {
    this.dispose(true);
    this.hooks.onExit();
  }

  /** Make every layer visible with no leftover inline styles. */
  private revealEverything() {
    document.querySelectorAll<HTMLElement>("[data-layer]").forEach((el) => {
      clearInline(el);
      el.querySelectorAll<HTMLElement>("[data-tag]").forEach(clearInline);
      el.removeAttribute(SHOWN);
    });
    document.documentElement.removeAttribute("data-ab");
  }

  private inView(l: Layer) {
    if (l.fixed) return true;
    return l.box.y < this.scroll.y + this.vh && l.box.y + l.box.h > this.scroll.y;
  }

  /* ─────────────────────────────── Agents ─────────────────────────────── */

  private spawn(i: number) {
    const color = AGENT_COLORS[i % AGENT_COLORS.length] ?? AGENT_COLORS[0];
    const letter = AGENT_LETTERS.charAt(i % AGENT_LETTERS.length);
    // Start scattered over the hero, inside the viewport.
    const x = this.vw * (0.12 + Math.random() * 0.76);
    const y = this.scroll.y + this.vh * (0.15 + Math.random() * 0.6);
    const a = new Agent(this.overlay.docRoot, color, letter, x, y, i === 0 ? "#fff" : "#0a0a0b");
    a.travelScale = this.device.travelScale;
    this.pickWander(a);
    this.agents.push(a);
  }

  private pickWander(a: Agent) {
    a.wanderX = this.vw * (0.1 + Math.random() * 0.8);
    a.wanderY = this.scroll.y + this.vh * (0.15 + Math.random() * 0.65);
  }

  /* ─────────────────────────────── Frame loop ─────────────────────────────── */

  private tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs / 1000, 0.05);

    if (this.phase === "build") {
      this.assignTimer -= dt;
      if (this.assignTimer <= 0) {
        this.assignTimer = 0.05;
        this.assign();
      }
    }

    if (this.swarm) {
      this.swarm.step(this.agents, dt, this.scroll.x, this.scroll.y);
    } else {
      // Gentle drift for agents waiting for work.
      const rate = 1 - Math.exp(-dt * 0.8);
      for (const a of this.agents) {
        if (a.state !== "idle" && a.state !== "joining") continue;
        const dx = a.wanderX - a.x;
        const dy = a.wanderY - a.y;
        a.x += dx * rate;
        a.y += dy * rate;
        if (dx * dx + dy * dy < 900) this.pickWander(a);
      }
    }

    for (const a of this.agents) a.render(this.bounds);
  };

  /* ─────────────────────────────── Scheduling ─────────────────────────────── */

  /** Give pending layers (reading order, parent done) to the nearest free agents. */
  private assign() {
    let idle = this.agents.filter((a) => a.state === "idle");
    for (const l of this.queue) {
      if (!idle.length) return;
      if (l.state !== "pending") continue;
      if (l.parent && l.parent.state !== "done") continue;
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

  private async autoFade(layer: Layer) {
    const { el } = layer;
    layer.state = "active";
    el.style.opacity = "0";
    el.setAttribute(SHOWN, "");
    const dispose = (() => {
      const fn = () => clearInline(el);
      this.cleanups.add(fn);
      return () => this.cleanups.delete(fn);
    })();
    await this.clock.to(el, { opacity: 1, duration: TIMING.decorFade, ease: "power1.out" });
    if (!this.clock.isAlive()) return;
    dispose();
    clearInline(el);
    this.completeLayer(layer);
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

    if (AFTER_BUILD === "swarm") {
      // Optional: agents stay and orbit the pointer until the visitor closes the HUD.
      this.swarm = new Swarm(this.vw / 2, this.scroll.y + this.vh / 2);
      this.swarm.point(this.vw / 2, this.vh / 2, false);
      for (const a of this.agents) a.state = "swarm";
      return;
    }

    // Calm default: agents leave, the HUD hides itself, then the quiet extras take over.
    for (const a of this.agents) a.leave();
    this.agents = [];
    this.doneTimer = window.setTimeout(() => {
      this.dispose(true);
      this.hooks.onDone();
    }, DONE_HUD_MS);
  }

  /* ─────────────────────────────── Controls ─────────────────────────────── */

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
    this.on(
      "scroll",
      () => {
        this.scroll.x = window.scrollX;
        this.scroll.y = window.scrollY;
      },
      { passive: true },
    );
    this.on("keydown", (e) => {
      if (e.key === "Escape") this.skip();
    });

    // Pointer → swarm target (only used when AFTER_BUILD is "swarm").
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

    // Any layout change (resize, font swap) → re-measure once things settle.
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
    for (const l of this.layers) if (l.state === "pending" && isInvisible(l)) this.completeLayer(l, true);
  }
}

const sleep = async (seconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, seconds * 1000);
  });
