export type LayerKind = "text" | "card" | "button" | "image" | "tags" | "stat" | "block" | "line" | "fade";

/** A rectangle in document coordinates (or viewport coordinates for fixed layers). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One buildable element on the page. */
export interface Layer {
  id: number;
  el: HTMLElement;
  kind: LayerKind;
  /** Nearest ancestor layer; this layer can only start once the parent is done. */
  parent: Layer | null;
  /** Lives inside a position:fixed ancestor (e.g. the navbar). */
  fixed: boolean;
  /** Higher builds first (data-priority). Ties keep reading order. Default 0. */
  priority: number;
  /** Last measured box (document coords, or viewport coords when fixed). */
  box: Box;
  state: "pending" | "active" | "done";
}

export type Phase = "idle" | "scan" | "build" | "done";
