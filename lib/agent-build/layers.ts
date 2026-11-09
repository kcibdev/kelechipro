import type { Box, Layer, LayerKind } from "./types";

const KINDS: ReadonlySet<string> = new Set(["text", "card", "button", "image", "tags", "stat", "block", "line", "fade"]);

function isInsideFixed(el: HTMLElement): boolean {
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === "fixed") return true;
  }
  return false;
}

/** Reads one element's box. Fixed layers are kept in viewport coordinates. */
function measureOne(layer: Layer, scrollX: number, scrollY: number): Box {
  const r = layer.el.getBoundingClientRect();
  return layer.fixed
    ? { x: r.left, y: r.top, w: r.width, h: r.height }
    : { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
}

/**
 * Collect every [data-layer] element as a layer, in top-to-bottom reading order,
 * each linked to its nearest ancestor layer. This is the only bulk layout read;
 * the animation loop never measures.
 */
export function collectLayers(root: ParentNode = document): Layer[] {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-layer]"));
  const byEl = new Map<HTMLElement, Layer>();
  const sx = window.scrollX;
  const sy = window.scrollY;

  const layers: Layer[] = els.map((el, i) => {
    const raw = el.dataset.layer ?? "fade";
    const kind = (KINDS.has(raw) ? raw : "fade") as LayerKind;
    const layer: Layer = {
      id: i,
      el,
      kind,
      parent: null,
      fixed: isInsideFixed(el),
      box: { x: 0, y: 0, w: 0, h: 0 },
      state: "pending",
    };
    byEl.set(el, layer);
    return layer;
  });

  for (const layer of layers) {
    const parentEl = layer.el.parentElement?.closest<HTMLElement>("[data-layer]");
    layer.parent = parentEl ? (byEl.get(parentEl) ?? null) : null;
    layer.box = measureOne(layer, sx, sy);
  }

  sortReadingOrder(layers);
  return layers;
}

/** Re-measure all boxes (after resize, font swap or a layout change). */
export function remeasure(layers: Layer[]) {
  const sx = window.scrollX;
  const sy = window.scrollY;
  for (const l of layers) l.box = measureOne(l, sx, sy);
}

/** Fixed layers first (they're at the top), then by row (8px buckets), then left → right. */
export function sortReadingOrder(layers: Layer[]) {
  const key = (l: Layer) => (l.fixed ? -1e6 + l.box.y : l.box.y);
  layers.sort((a, b) => {
    const ra = Math.round(key(a) / 8);
    const rb = Math.round(key(b) / 8);
    return ra !== rb ? ra - rb : a.box.x - b.box.x;
  });
}

/** A layer that has no box (display:none, e.g. a filtered card or a mobile-only element). */
export const isInvisible = (l: Layer) => l.box.w < 1 || l.box.h < 1;
