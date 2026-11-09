/**
 * Tunables for the agent build. Durations are seconds at 1× speed.
 * The whole sequence is tuned to land around 40–50s at 1× on desktop.
 */

export const AGENT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
] as const;

export const AGENT_LETTERS = "KAIRONVESTMLDBQZUFJHPCWGXY";

/** Design-tool selection blue. */
export const SELECTION_BLUE = "#2f80ff";

export interface DeviceProfile {
  startAgents: number;
  maxAgents: number;
  /** Seconds between new agents joining. */
  joinEvery: number;
  defaultSpeed: 1 | 2 | 4;
  /** Auto-scroll smoothing rate (per second). Lower = calmer scroll. */
  tourEase: number;
  /** Hard cap on auto-scroll speed, px per second (at 1×). */
  tourMaxSpeed: number;
  /** Multiplier on cursor glide durations. >1 = slower, calmer cursors. */
  travelScale: number;
}

export const DESKTOP: DeviceProfile = {
  startAgents: 18,
  maxAgents: 30,
  joinEvery: 1.0,
  defaultSpeed: 1,
  tourEase: 2.4,
  tourMaxSpeed: 1400,
  travelScale: 1,
};

/** Tablets (touch, 768–1279px): fewer agents and gentler motion than desktop. */
export const TABLET: DeviceProfile = {
  startAgents: 12,
  maxAgents: 18,
  joinEvery: 1.8,
  defaultSpeed: 1,
  tourEase: 1.3,
  tourMaxSpeed: 420,
  travelScale: 1.5,
};

/** Phones (< 768px): small screen, so slow everything down to stay readable. */
export const MOBILE: DeviceProfile = {
  startAgents: 8,
  maxAgents: 10,
  joinEvery: 3,
  defaultSpeed: 1,
  tourEase: 1.1,
  tourMaxSpeed: 300,
  travelScale: 1.7,
};

export const SPEEDS = [1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];

export const TIMING = {
  /** Phase 1: minimum time on the scan screen (real seconds, not speed-scaled). */
  scanMin: 2.6,
  /** Crosshair → cursor morph before agents start working. */
  morph: 0.7,

  /** Travel: base + distance / pxPerSecond, clamped. */
  travelBase: 0.42,
  travelPxPerSec: 1500,
  travelMax: 1.15,

  selectIn: 0.18,
  /** Pause with the finished element still selected. */
  holdAfter: 0.22,
  /** Agent rest between layers. */
  rest: 0.12,

  /** Text typing */
  perChar: 0.024,
  textMin: 0.4,
  textMax: 2.4,
  /** Display words (huge type) type slower per letter. */
  perCharDisplay: 0.11,

  cardBorder: 0.75,
  cardFill: 0.35,
  buttonBorder: 0.42,
  buttonFill: 0.3,
  imageWipe: 1.1,
  blockWipe: 0.7,
  lineDraw: 0.7,
  fade: 0.6,
  statCount: 1.1,
  tagPop: 0.3,
  tagDuplicate: 0.2,
} as const;

/** Viewport fraction (from the tour position) in which layers may be built while touring. */
export const TOUR_WINDOW = 1.5;
/** Where the frontier sits in the viewport while touring (fraction from the top). */
export const TOUR_ANCHOR = 0.16;
/* Auto-scroll smoothing and max speed are per device: see DeviceProfile.tourEase / tourMaxSpeed. */
