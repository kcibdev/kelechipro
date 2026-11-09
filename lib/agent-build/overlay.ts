import { SELECTION_BLUE } from "./config";
import type { Box } from "./types";

/**
 * Overlay layers. Both are pointer-events:none so the page stays fully usable.
 *  - docRoot:   absolute at the document origin (0×0, overflow visible). Children use
 *               document coordinates and scroll natively with the page — no jitter.
 *  - fixedRoot: fixed to the viewport. Hosts the HUD (interactive, so NOT aria-hidden)
 *               and `fixedArt`, an aria-hidden layer for the scan logo and selections
 *               on fixed elements such as the navbar.
 */
export class Overlay {
  readonly docRoot: HTMLDivElement;
  readonly fixedRoot: HTMLDivElement;
  readonly fixedArt: HTMLDivElement;

  constructor() {
    this.docRoot = document.createElement("div");
    this.docRoot.className = "ab-doc";
    this.docRoot.setAttribute("aria-hidden", "true");
    this.fixedRoot = document.createElement("div");
    this.fixedRoot.className = "ab-fixed";
    this.fixedArt = document.createElement("div");
    this.fixedArt.className = "ab-fixed-art";
    this.fixedArt.setAttribute("aria-hidden", "true");
    this.fixedRoot.appendChild(this.fixedArt);
    document.body.append(this.docRoot, this.fixedRoot);
  }

  root(fixed: boolean) {
    return fixed ? this.fixedArt : this.docRoot;
  }

  /** Fade the whole overlay out, then remove it. */
  destroy(fade = false) {
    if (!fade) {
      this.docRoot.remove();
      this.fixedRoot.remove();
      return;
    }
    this.docRoot.classList.add("ab-out");
    this.fixedRoot.classList.add("ab-out");
    window.setTimeout(() => this.destroy(false), 450);
  }
}

const place = (el: HTMLElement, b: Box) => {
  el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
  el.style.width = `${b.w}px`;
  el.style.height = `${b.h}px`;
};

/** Design-tool style selection: 1px blue outline, white corner handles, size badge. */
export class Selection {
  readonly el: HTMLDivElement;

  constructor(parent: HTMLElement, box: Box) {
    this.el = document.createElement("div");
    this.el.className = "ab-sel";
    this.el.style.setProperty("--sel", SELECTION_BLUE);
    const w = Math.round(box.w);
    const h = Math.round(box.h);
    this.el.innerHTML =
      `<i class="ab-h ab-tl"></i><i class="ab-h ab-tr"></i><i class="ab-h ab-bl"></i><i class="ab-h ab-br"></i>` +
      `<span class="ab-size">${w} × ${h}</span>`;
    place(this.el, box);
    parent.appendChild(this.el);
    // Next frame → CSS transition in.
    requestAnimationFrame(() => this.el.classList.add("ab-on"));
  }

  remove() {
    this.el.classList.remove("ab-on");
    this.el.classList.add("ab-off");
    window.setTimeout(() => this.el.remove(), 220);
  }
}

/** Blinking typing caret. */
export function createCaret(parent: HTMLElement, color: string) {
  const el = document.createElement("div");
  el.className = "ab-caret";
  el.style.background = color;
  parent.appendChild(el);
  return {
    el,
    move(x: number, y: number, h: number) {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.style.height = `${h}px`;
    },
    remove: () => el.remove(),
  };
}

/** Four edges that "draw" a card's border, sequenced clockwise. */
export function createBorderDraw(parent: HTMLElement, box: Box, color: string) {
  const wrap = document.createElement("div");
  wrap.className = "ab-border";
  place(wrap, box);
  const edge = (cls: string) => {
    const i = document.createElement("i");
    i.className = cls;
    wrap.appendChild(i);
    return i;
  };
  const t = edge("t");
  const r = edge("r");
  const b = edge("b");
  const l = edge("l");
  wrap.style.setProperty("--c", color);
  parent.appendChild(wrap);
  const perimeter = 2 * (box.w + box.h);
  const horiz = box.w / perimeter;
  const vert = box.h / perimeter;
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  return {
    /** p in 0..1 → edges scaled clockwise; returns the drawing tip position (box-local). */
    update(p: number): { x: number; y: number } {
      const top = clamp01(p / horiz);
      const right = clamp01((p - horiz) / vert);
      const bottom = clamp01((p - horiz - vert) / horiz);
      const left = clamp01((p - 2 * horiz - vert) / vert);
      t.style.transform = `scaleX(${top})`;
      r.style.transform = `scaleY(${right})`;
      b.style.transform = `scaleX(${bottom})`;
      l.style.transform = `scaleY(${left})`;
      if (right === 0) return { x: box.w * top, y: 0 };
      if (bottom === 0) return { x: box.w, y: box.h * right };
      if (left === 0) return { x: box.w * (1 - bottom), y: box.h };
      return { x: 0, y: box.h * (1 - left) };
    },
    fadeOut() {
      wrap.classList.add("ab-off");
      window.setTimeout(() => wrap.remove(), 300);
    },
    remove: () => wrap.remove(),
  };
}

/** Bright scan line that rides the front of an image wipe. */
export function createWipeLine(parent: HTMLElement, box: Box, color: string, vertical = false) {
  const el = document.createElement("div");
  el.className = vertical ? "ab-wipe ab-wipe-v" : "ab-wipe";
  el.style.background = color;
  el.style.color = color;
  el.style.width = vertical ? "2px" : `${box.w}px`;
  el.style.height = vertical ? `${box.h}px` : "2px";
  parent.appendChild(el);
  return {
    at(offset: number) {
      el.style.transform = vertical
        ? `translate3d(${box.x + offset}px, ${box.y}px, 0)`
        : `translate3d(${box.x}px, ${box.y + offset}px, 0)`;
    },
    remove: () => el.remove(),
  };
}

/** Dashed ghost outline used while duplicating tags, plus a red count badge. */
export function createGhost(parent: HTMLElement, box: Box, color: string) {
  const el = document.createElement("div");
  el.className = "ab-ghost";
  el.style.setProperty("--c", color);
  el.innerHTML = `<span class="ab-count"></span>`;
  place(el, box);
  parent.appendChild(el);
  const badge = el.firstElementChild as HTMLElement;
  return {
    el,
    set(b: Box) {
      place(el, b);
    },
    count(n: number) {
      badge.textContent = `${n}`;
    },
    remove: () => el.remove(),
  };
}
