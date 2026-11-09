import { gsap } from "gsap";
import type { Agent } from "./agents";
import type { Clock } from "./clock";
import { TIMING } from "./config";
import { createBorderDraw, createCaret, createGhost, createWipeLine, type Overlay } from "./overlay";
import type { Sound } from "./sound";
import type { Box, Layer } from "./types";

/**
 * Reveal effects — one per layer kind. Each effect:
 *  - measures what it needs once at the start (never inside the frame loop),
 *  - animates only opacity / transform / clip-path,
 *  - registers a cleanup so "skip" can restore the element instantly,
 *  - leaves the element with no inline styles when it finishes.
 */

export interface RevealCtx {
  clock: Clock;
  agent: Agent;
  overlay: Overlay;
  sound: Sound;
  accent: string;
  /** Current scroll position (tracked by a passive listener, never read in the loop). */
  scroll: { x: number; y: number };
  /** Register a cleanup; returns a disposer to call when the effect ends normally. */
  onCleanup: (fn: () => void) => () => void;
}

export const SHOWN = "data-ab-shown";

const markShown = (el: HTMLElement) => el.setAttribute(SHOWN, "");

/** Remove every inline property the build may have written. */
export function clearInline(el: HTMLElement) {
  gsap.set(el, { clearProps: "opacity,transform,scale" });
  el.style.removeProperty("clip-path");
  el.style.removeProperty("min-width");
  el.style.removeProperty("display");
}

/** Fresh box for a layer at task start (document coords, or viewport coords if fixed). */
export function measureLayer(layer: Layer, scroll: { x: number; y: number }): Box {
  const r = layer.el.getBoundingClientRect();
  return layer.fixed
    ? { x: r.left, y: r.top, w: r.width, h: r.height }
    : { x: r.left + scroll.x, y: r.top + scroll.y, w: r.width, h: r.height };
}

/** Convert a point in the layer's space into document space for the agent. */
function agentPoint(layer: Layer, ctx: RevealCtx, x: number, y: number) {
  return layer.fixed ? { x: x + ctx.scroll.x, y: y + ctx.scroll.y } : { x, y };
}

function pin(layer: Layer, ctx: RevealCtx, x: number, y: number) {
  const p = agentPoint(layer, ctx, x, y);
  ctx.agent.setPos(p.x, p.y);
}

/* ─────────────────────────────── Text ─────────────────────────────── */

interface Line {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Line boxes of an element's text, relative to its border box. */
function textLines(el: HTMLElement, origin: DOMRect): Line[] {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5);
  const lines: Line[] = [];
  for (const r of rects) {
    const top = r.top - origin.top;
    const bottom = r.bottom - origin.top;
    const left = r.left - origin.left;
    const right = r.right - origin.left;
    // Merge fragments (bold spans etc.) that sit on the same visual line.
    const mid = (top + bottom) / 2;
    const line = lines.find((l) => mid > l.top && mid < l.bottom);
    if (line) {
      line.top = Math.min(line.top, top);
      line.bottom = Math.max(line.bottom, bottom);
      line.left = Math.min(line.left, left);
      line.right = Math.max(line.right, right);
    } else {
      lines.push({ top, bottom, left, right });
    }
  }
  return lines.sort((a, b) => a.top - b.top);
}

/** Staircase polygon: every line above `line` fully visible, `line` visible up to `x`. */
function typedPolygon(line: Line, first: boolean, last: boolean, x: number, w: number, h: number) {
  const M = 48; // generous margin so strokes, italics and descenders aren't clipped
  const top = first ? -M : line.top;
  const bottom = last ? Math.max(line.bottom, h) + M : line.bottom;
  return `polygon(${-M}px ${-M}px, ${w + M}px ${-M}px, ${w + M}px ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, ${-M}px ${bottom}px)`;
}

async function revealText(layer: Layer, box: Box, ctx: RevealCtx) {
  const { el } = layer;
  const origin = el.getBoundingClientRect();
  const lines = textLines(el, origin);
  if (!lines.length) return revealFade(layer, box, ctx);

  const chars = Math.max(1, el.textContent.replace(/\s+/g, " ").trim().length);
  const widths = lines.map((l) => Math.max(1, l.right - l.left));
  const totalW = widths.reduce((a, b) => a + b, 0);
  // Steps (≈ characters) per line, proportional to line width.
  const steps = widths.map((w) => Math.max(1, Math.round((chars * w) / totalW)));
  const totalSteps = steps.reduce((a, b) => a + b, 0);
  // cumulative[i] = steps on lines 0..i
  const cumulative: number[] = [];
  let running = 0;
  for (const st of steps) {
    running += st;
    cumulative.push(running);
  }

  const display = box.h > 110 && lines.length === 1;
  const duration = display
    ? chars * TIMING.perCharDisplay
    : Math.min(TIMING.textMax, Math.max(TIMING.textMin, chars * TIMING.perChar));

  const root = ctx.overlay.root(layer.fixed);
  const caret = createCaret(root, ctx.accent);
  const useIbeam = !display && Math.random() < 0.55;
  ctx.agent.setLook(useIbeam ? "ibeam" : "arrow");

  el.style.clipPath = "polygon(0 0, 0 0, 0 0)";
  markShown(el);
  const dispose = ctx.onCleanup(() => {
    caret.remove();
    el.style.removeProperty("clip-path");
  });

  let lastStep = -1;
  const apply = (step: number) => {
    let i = 0;
    while (i < lines.length - 1 && step > (cumulative[i] ?? 0)) i++;
    const line = lines[i];
    if (!line) return;
    const before = cumulative[i - 1] ?? 0;
    const frac = Math.min(1, Math.max(0, (step - before) / (steps[i] ?? 1)));
    const x = line.left + (line.right - line.left) * frac;
    el.style.clipPath = typedPolygon(line, i === 0, i === lines.length - 1, x, origin.width, origin.height);
    const cx = box.x + x;
    const cy = box.y + line.top;
    const lh = line.bottom - line.top;
    caret.move(cx + 1, cy, lh);
    if (useIbeam) pin(layer, ctx, cx + 7, cy + lh * 0.5);
    else pin(layer, ctx, cx + 4, cy + lh * 0.72);
  };
  apply(0);

  await ctx.clock.progress(duration, (p) => {
    const step = Math.round(p * totalSteps);
    if (step === lastStep) return;
    lastStep = step;
    apply(step);
    ctx.sound.tick();
  });

  dispose();
  caret.remove();
  el.style.removeProperty("clip-path");
  ctx.agent.setLook("arrow");
}

/* ─────────────────────────────── Cards & buttons ─────────────────────────────── */

async function revealPanel(layer: Layer, box: Box, ctx: RevealCtx, drawDur: number, fillDur: number) {
  const { el } = layer;
  const border = createBorderDraw(ctx.overlay.root(layer.fixed), box, ctx.accent);
  const dispose = ctx.onCleanup(() => {
    border.remove();
    clearInline(el);
  });

  // 1. Border draws, with the agent tracing the tip.
  await ctx.clock.progress(
    drawDur,
    (p) => {
      const tip = border.update(p);
      pin(layer, ctx, box.x + tip.x, box.y + tip.y);
    },
    "power1.inOut",
  );

  // 2. Background + non-layer content fade in. Child layers stay hidden for other agents.
  el.style.opacity = "0";
  markShown(el);
  await ctx.clock.to(el, { opacity: 1, duration: fillDur, ease: "power2.out" });

  // 3. Real border is visible now; retire the drawn one.
  border.fadeOut();
  dispose();
  clearInline(el);
}

/* ─────────────────────────────── Images, blocks, lines ─────────────────────────────── */

async function revealImage(layer: Layer, box: Box, ctx: RevealCtx) {
  const { el } = layer;
  const line = createWipeLine(ctx.overlay.root(layer.fixed), box, ctx.accent);
  el.style.clipPath = "inset(0 0 100% 0)";
  markShown(el);
  const dispose = ctx.onCleanup(() => {
    line.remove();
    clearInline(el);
  });
  await ctx.clock.progress(
    TIMING.imageWipe,
    (p) => {
      el.style.clipPath = `inset(0 0 ${(100 - p * 100).toFixed(2)}% 0)`;
      const y = box.h * p;
      line.at(y);
      pin(layer, ctx, box.x + box.w * 0.62, box.y + y);
    },
    "power2.inOut",
  );
  dispose();
  line.remove();
  clearInline(el);
}

async function revealWipeX(layer: Layer, box: Box, ctx: RevealCtx, duration: number, withLine: boolean) {
  const { el } = layer;
  const line = withLine ? createWipeLine(ctx.overlay.root(layer.fixed), box, "#ffffff", true) : null;
  el.style.clipPath = "inset(0 100% 0 0)";
  markShown(el);
  const dispose = ctx.onCleanup(() => {
    line?.remove();
    clearInline(el);
  });
  await ctx.clock.progress(
    duration,
    (p) => {
      el.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)`;
      const x = box.w * p;
      line?.at(x);
      pin(layer, ctx, box.x + x, box.y + Math.min(box.h * 0.6, box.h - 2));
    },
    "power2.inOut",
  );
  dispose();
  line?.remove();
  clearInline(el);
}

async function revealFade(layer: Layer, _box: Box, ctx: RevealCtx) {
  const { el } = layer;
  el.style.opacity = "0";
  markShown(el);
  const dispose = ctx.onCleanup(() => clearInline(el));
  await ctx.clock.to(el, { opacity: 1, duration: TIMING.fade, ease: "power1.out" });
  dispose();
  clearInline(el);
}

/* ─────────────────────────────── Stats ─────────────────────────────── */

async function revealStat(layer: Layer, box: Box, ctx: RevealCtx) {
  const { el } = layer;
  const countEl = el.querySelector<HTMLElement>("[data-count]");
  const target = countEl ? Number(countEl.dataset.count) : NaN;
  const node = countEl ? Array.from(countEl.childNodes).find((n) => n.nodeType === Node.TEXT_NODE) : undefined;
  if (!countEl || !node || !Number.isFinite(target)) return revealFade(layer, box, ctx);

  const original = node.nodeValue ?? "";
  // Lock the width so counting never nudges the layout.
  const width = countEl.getBoundingClientRect().width;
  countEl.style.display = "inline-block";
  countEl.style.minWidth = `${width}px`;
  node.nodeValue = "0";
  el.style.opacity = "0";
  markShown(el);
  const dispose = ctx.onCleanup(() => {
    node.nodeValue = original;
    clearInline(countEl);
    clearInline(el);
  });

  pin(layer, ctx, box.x + box.w * 0.7, box.y + box.h * 0.35);
  await ctx.clock.to(el, { opacity: 1, duration: 0.2 });
  const counter = { v: 0 };
  let shown = 0;
  await ctx.clock.to(counter, {
    v: target,
    duration: TIMING.statCount,
    ease: "power2.out",
    onUpdate: () => {
      const v = Math.round(counter.v);
      if (v !== shown) {
        shown = v;
        node.nodeValue = String(v);
        ctx.sound.tick();
      }
    },
  });
  dispose();
  node.nodeValue = original;
  clearInline(countEl);
  clearInline(el);
}

/* ─────────────────────────────── Tags ─────────────────────────────── */

async function revealTags(layer: Layer, box: Box, ctx: RevealCtx) {
  const { el } = layer;
  const pillEls = Array.from(el.querySelectorAll<HTMLElement>("[data-tag]"));

  // Measure every pill once, in the layer's coordinate space.
  const off = layer.fixed ? { x: 0, y: 0 } : ctx.scroll;
  const pills = pillEls.map((p) => {
    const r = p.getBoundingClientRect();
    return { el: p, box: { x: r.left + off.x, y: r.top + off.y, w: r.width, h: r.height } satisfies Box };
  });
  const [first, ...rest] = pills;
  if (!first) {
    await revealFade(layer, box, ctx);
    return;
  }

  for (const p of pillEls) p.style.opacity = "0";
  markShown(el);
  const root = ctx.overlay.root(layer.fixed);
  const ghost = createGhost(root, first.box, ctx.accent);
  ghost.el.style.opacity = "0";
  const dispose = ctx.onCleanup(() => {
    ghost.remove();
    pillEls.forEach(clearInline);
  });

  // 1. First tag appears.
  const b0 = first.box;
  await ctx.agent.glideTo(ctx.clock, ...xy(agentPoint(layer, ctx, b0.x + b0.w * 0.75, b0.y + b0.h * 0.7)), 0.28);
  await ctx.clock.fromTo(first.el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: TIMING.tagPop, ease: "back.out(2.2)" });
  ctx.sound.tick();

  // 2. Duplicate sideways into each next position, with a red count badge.
  ghost.el.style.opacity = "1";
  let from = first.box;
  for (const [i, pill] of rest.entries()) {
    const to = pill.box;
    const start = from;
    ghost.set({ x: start.x, y: start.y, w: to.w, h: to.h });
    ghost.count(i + 2);
    await ctx.clock.progress(
      TIMING.tagDuplicate,
      (p) => {
        const x = start.x + (to.x - start.x) * p;
        const y = start.y + (to.y - start.y) * p;
        ghost.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        pin(layer, ctx, x + to.w * 0.75, y + to.h * 0.7);
      },
      "power2.out",
    );
    pill.el.style.opacity = "1";
    ctx.sound.tick();
    from = to;
  }

  dispose();
  ghost.remove();
  pillEls.forEach(clearInline);
}

const xy = (p: { x: number; y: number }) => [p.x, p.y] as const;

/* ─────────────────────────────── Dispatcher ─────────────────────────────── */

export async function reveal(layer: Layer, box: Box, ctx: RevealCtx): Promise<void> {
  switch (layer.kind) {
    case "text":
      return revealText(layer, box, ctx);
    case "card":
      return revealPanel(layer, box, ctx, TIMING.cardBorder, TIMING.cardFill);
    case "button":
      return revealPanel(layer, box, ctx, TIMING.buttonBorder, TIMING.buttonFill);
    case "image":
      return revealImage(layer, box, ctx);
    case "block":
      return revealWipeX(layer, box, ctx, TIMING.blockWipe, true);
    case "line":
      return revealWipeX(layer, box, ctx, TIMING.lineDraw, false);
    case "stat":
      return revealStat(layer, box, ctx);
    case "tags":
      return revealTags(layer, box, ctx);
    case "fade":
      return revealFade(layer, box, ctx);
  }
}

/** Where an agent should land to start working on a layer (layer space). */
export function entryPoint(layer: Layer, box: Box) {
  switch (layer.kind) {
    case "card":
    case "button":
    case "block":
    case "line":
      return { x: box.x, y: box.y };
    case "image":
      return { x: box.x + box.w * 0.62, y: box.y };
    case "stat":
      return { x: box.x + box.w * 0.7, y: box.y + box.h * 0.35 };
    case "text":
    case "tags":
    case "fade":
      return { x: box.x + 2, y: box.y + Math.min(box.h, 40) * 0.6 };
  }
}

export { agentPoint };
