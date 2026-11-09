/**
 * Procedural sound with the Web Audio API — no audio files.
 * Silent until the visitor opts in (enable() must be called from a user gesture).
 */
export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastTick = 0;
  private noise: AudioBuffer | null = null;
  enabled = false;

  /** Create/resume the audio context. Call from a click/tap handler. */
  async enable() {
    if (!this.ctx) {
      // Older Safari only exposes the prefixed constructor.
      const Ctor =
        "AudioContext" in window
          ? window.AudioContext
          : (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      // Short noise buffer for the typing tick's "click" texture.
      const len = Math.floor(this.ctx.sampleRate * 0.03);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  /** Soft, short typing tick. Rate-limited so 30 agents don't become a buzz. */
  tick() {
    if (!this.enabled || !this.ctx || !this.master || !this.noise) return;
    const now = this.ctx.currentTime;
    if (now - this.lastTick < 0.045) return;
    this.lastTick = now;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2600 + Math.random() * 1600;
    bp.Q.value = 1.6;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    src.connect(bp).connect(g).connect(this.master);
    src.start(now);
    src.stop(now + 0.035);
  }

  /** Gentle "pop" when a layer finishes. */
  pop() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    const base = 420 + Math.random() * 160;
    osc.frequency.setValueAtTime(base * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.11);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(g).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /** Subtle chime when the build completes: a soft major arpeggio. */
  chime() {
    const { ctx, master } = this;
    if (!this.enabled || !ctx || !master) return;
    const now = ctx.currentTime;
    [659.25, 830.61, 987.77, 1318.51].forEach((f, i) => {
      const t = now + i * 0.085;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const overtone = ctx.createOscillator();
      overtone.type = "sine";
      overtone.frequency.value = f * 2.01;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      const og = ctx.createGain();
      og.gain.value = 0.18;
      osc.connect(g);
      overtone.connect(og).connect(g);
      g.connect(master);
      osc.start(t);
      overtone.start(t);
      osc.stop(t + 1.5);
      overtone.stop(t + 1.5);
    });
  }

  dispose() {
    this.enabled = false;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }
}
