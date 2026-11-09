/**
 * Tunables for the agent build.
 *
 * Design goals (from visitor / recruiter feedback):
 *  - content first: only the on-screen part of the hero builds, everything else is visible at first paint;
 *  - fast: the hero finishes in ~3s, then the agents leave;
 *  - calm: a handful of agents in a restrained palette, no auto-scroll, nothing that blocks reading.
 */

/** Lead agent uses the site accent; the rest are neutral greys. */
export const AGENT_COLORS = ["var(--accent)", "#f4f4f5", "#a1a1aa", "#d4d4d8", "#e4e4e7", "#8d8d96"] as const;

export const AGENT_LETTERS = "KAIRONVESTMLDBQZUFJHPCWGXY";

/** Design-tool selection blue. */
export const SELECTION_BLUE = "#2f80ff";

export interface DeviceProfile {
  /** Agents working on the hero. */
  agents: number;
  /** Multiplier on cursor glide durations. >1 = slower, calmer cursors. */
  travelScale: number;
}

export const DESKTOP: DeviceProfile = { agents: 8, travelScale: 1 };
/** Tablets (touch, or 768–1023px). */
export const TABLET: DeviceProfile = { agents: 6, travelScale: 1.15 };
/** Phones (< 768px). */
export const MOBILE: DeviceProfile = { agents: 4, travelScale: 1.25 };

/**
 * What the agents do once the hero is built:
 *  - "leave": fade out and hand over to the section inspector (calm, recommended);
 *  - "swarm": stay and orbit the pointer until the visitor closes the HUD.
 */
export const AFTER_BUILD: "leave" | "swarm" = "leave";

/** How long the "Built in Xs" HUD stays up before it hides itself (ms). */
export const DONE_HUD_MS = 3200;

/** Section headings the inspector briefly selects as they scroll into view. */
export const INSPECT_SELECTOR = "main section[id]:not(#top) h2";

/** Durations in seconds. Tuned so the hero completes in roughly 3s on desktop. */
export const TIMING = {
  /** Wait for fonts before measuring, but never longer than this (s). */
  fontWaitMax: 0.6,
  /** Minimum time the crosshairs show before turning into cursors. */
  scanMin: 0.15,
  /** Crosshair → cursor morph before agents start working. */
  morph: 0.15,

  /** Travel: base + distance / pxPerSecond, clamped. */
  travelBase: 0.18,
  travelPxPerSec: 2600,
  travelMax: 0.45,

  selectIn: 0.06,
  /** Pause with the finished element still selected. */
  holdAfter: 0.1,
  /** Agent rest between layers. */
  rest: 0.04,

  /** Text typing */
  perChar: 0.011,
  textMin: 0.25,
  textMax: 0.9,
  /** Display words (huge type) type slower per letter. */
  perCharDisplay: 0.06,

  cardBorder: 0.4,
  cardFill: 0.2,
  buttonBorder: 0.26,
  buttonFill: 0.15,
  imageWipe: 0.6,
  blockWipe: 0.35,
  lineDraw: 0.35,
  fade: 0.35,
  /** Decorative layers (kind "fade") fade in by themselves over this long. */
  decorFade: 1.2,
  statCount: 0.7,
  tagPop: 0.15,
  tagDuplicate: 0.07,

  /** Section inspector: how long the heading stays selected. */
  inspectHold: 0.7,
} as const;
