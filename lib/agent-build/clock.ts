import { gsap } from "gsap";

/**
 * Speed-scaled animation clock built on GSAP.
 *
 * Every tween/wait created through the clock is tracked so the speed toggle (1×/2×/4×)
 * can retime everything in flight, and skip/replay can kill it all at once.
 * Promises from killed tweens never resolve — callers check `alive` after each await.
 */
export class Clock {
  speed = 1;
  private alive = true;
  private live = new Set<gsap.core.Animation>();

  private track<T extends gsap.core.Animation>(anim: T, resolve: () => void): T {
    this.live.add(anim);
    anim.timeScale(this.speed);
    anim.eventCallback("onComplete", () => {
      this.live.delete(anim);
      resolve();
    });
    return anim;
  }

  /** gsap.to through the clock. Resolves on completion. */
  async to(target: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
      if (!this.alive) return;
      this.track(gsap.to(target, { ...vars }), resolve);
    });
  }

  /** gsap.fromTo through the clock. */
  async fromTo(target: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
      if (!this.alive) return;
      this.track(gsap.fromTo(target, from, { ...to }), resolve);
    });
  }

  /** Tween a 0 → 1 progress value, calling onUpdate each frame. */
  async progress(duration: number, onUpdate: (p: number) => void, ease = "none"): Promise<void> {
    const proxy = { p: 0 };
    return this.to(proxy, { p: 1, duration, ease, onUpdate: () => onUpdate(proxy.p) });
  }

  /** Speed-scaled wait. */
  async wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.alive) return;
      // An empty tween of the given length is a speed-scalable wait.
      this.track(gsap.to({}, { duration: seconds }), resolve);
    });
  }

  /**
   * Whether the clock is still running. A method (not a field read) on purpose:
   * callers re-check it after each `await`, and the value can change while they wait.
   */
  isAlive(): boolean {
    return this.alive;
  }

  setSpeed(speed: number) {
    this.speed = speed;
    for (const a of this.live) a.timeScale(speed);
  }

  killAll() {
    this.alive = false;
    for (const a of this.live) a.kill();
    this.live.clear();
  }
}
