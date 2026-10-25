/* The motion engine, as in v5's `class Component`: one requestAnimationFrame loop reads the scroll and writes styles straight to the elements it finds by their data- attributes.
   Nothing per frame goes through React. Sections attach their choreography to `tick` in the README's build order. */
import { clamp } from "./math";
import { SmoothScroll } from "./smooth-scroll";
import { StageMotion } from "./stage";
import { S3Motion } from "./s3";
import { S4Motion } from "./s4";
import { T45Motion } from "./t45";
import { HMotion } from "./h";
import { SectionDots } from "./sdots";

export interface Progress {
  /** 0 at the top of the element's scroll, 1 at the end. */
  p: number;
  /** The element is on screen. */
  on: boolean;
  r: DOMRect;
}

export class Engine {
  readonly root: HTMLElement;
  /** prefers-reduced-motion: the intro is skipped, two stages shorten, and 04 → 05 is off. */
  readonly reduced: boolean;
  /** A fine pointer (mouse or trackpad): smooth scroll runs only then. */
  readonly fine: boolean;
  ss: SmoothScroll;
  /** The faces for measuring text on a canvas, read from the page's tokens at boot: the display face (--fd) and Schibsted Grotesk (--fs). */
  fonts = { fd: "'Instrument Serif', Georgia, serif", fs: "'Schibsted Grotesk', system-ui, sans-serif" };
  /** 04 → 05: the extra hold at the end of 04 (3 viewport heights, 300vh) and the wait it gives the next stage (1.65 viewport heights, 165vh), in px. Written by the transition at the start of each frame, read by 04, the nav and the scroll anchors. */
  t45Ex = 0;
  t45D = 0;
  /** The hero stage is on screen; its canvases render only then. */
  stageOn = true;
  /** The hero stage: the intro, the hero, the earth, the nav's states, and 02. */
  readonly stage: StageMotion;
  /** 03: why doctors sell. */
  readonly s3: S3Motion;
  /** The dotted field behind 03–06. */
  readonly sdots: SectionDots;
  /** 04: your four options. */
  readonly s4: S4Motion;
  /** 04 → 05. */
  readonly t45: T45Motion;
  /** The 05-to-close stage. */
  readonly h: HMotion;

  private cache: Record<string, HTMLElement | HTMLElement[] | null> = {};
  private readonly written = new WeakMap<HTMLElement, Record<string, string>>();
  private readonly resizeHooks = new Set<() => void>();
  private raf = 0;
  private warned = false;
  private warned4 = false;
  private readonly handleResize: () => void;
  private readonly handleClick: (ev: MouseEvent) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    this.fine = !!(window.matchMedia && window.matchMedia("(pointer: fine)").matches);
    const cs = getComputedStyle(root);
    const fd = cs.getPropertyValue("--fd").trim(), fs = cs.getPropertyValue("--fs").trim();
    if (fd) this.fonts.fd = fd;
    if (fs) this.fonts.fs = fs;
    this.ss = new SmoothScroll({ enabled: this.fine && !this.reduced });
    this.handleResize = () => { this.resizeHooks.forEach((fn) => fn()); };
    // "Skip intro" ends the intro; the nav's anchors (v5 go) end it too if it is running, then scroll to the anchor's place in the story
    this.handleClick = (ev) => {
      const t = ev.target as Element | null;
      if (!t || !t.closest) return;
      if (t.closest("[data-skip]")) { this.stage.finishIntro(); return; }
      const a = t.closest<HTMLAnchorElement>("a[data-go]");
      if (!a) return;
      ev.preventDefault();
      if (this.stage.introRunning) this.stage.finishIntro();
      this.scrollTo(this.anchorY(a.dataset.go || ""));
    };
    this.stage = new StageMotion(this);
    this.s3 = new S3Motion(this);
    this.sdots = new SectionDots(this);
    this.s4 = new S4Motion(this);
    this.t45 = new T45Motion(this);
    this.h = new HMotion(this);
  }

  start(): void {
    window.addEventListener("resize", this.handleResize);
    this.root.addEventListener("click", this.handleClick);
    // once the fonts are in, every measurement is taken again
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { this.clearCache(); this.handleResize(); });
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      this.ss.update();
      try { this.tick(t); } catch (e) { if (!this.warned) { this.warned = true; console.warn(e); } }
      // as in v5's loop: 04 steps after the page's own tick, guarded on its own
      try { this.s4.tick(t); } catch (e) { if (!this.warned4) { this.warned4 = true; console.warn(e); } }
    };
    this.raf = requestAnimationFrame(loop);
    this.stage.boot();
    this.s4.boot();
    this.h.boot();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.handleResize);
    this.root.removeEventListener("click", this.handleClick);
    this.stage.destroy();
    this.s3.destroy();
    this.sdots.destroy();
    this.s4.destroy();
    this.t45.destroy();
    this.h.destroy();
    this.resizeHooks.clear();
    this.ss.destroy();
    document.documentElement.style.overflow = "";
  }

  /** Runs on every resize and once the fonts are in. Returns the function that removes it. */
  onResize(fn: () => void): () => void {
    this.resizeHooks.add(fn);
    return () => { this.resizeHooks.delete(fn); };
  }

  // ---------- lookups and writes ----------
  q<T extends HTMLElement = HTMLElement>(sel: string): T | null { return this.root.querySelector<T>(sel); }
  /** One element, found once and kept under `name`. As in v5, a miss is not kept: the next call looks again. */
  el<T extends HTMLElement = HTMLElement>(name: string, sel: string): T | null {
    const c = this.cache[name];
    if (c && !Array.isArray(c) && c.isConnected) return c as T;
    return (this.cache[name] = this.q<T>(sel)) as T | null;
  }
  /** Every match, found once and kept under `name`. */
  els<T extends HTMLElement = HTMLElement>(name: string, sel: string): T[] {
    const c = this.cache[name];
    if (Array.isArray(c)) return c as T[];
    return (this.cache[name] = Array.from(this.root.querySelectorAll<T>(sel))) as T[];
  }
  clearCache(): void { this.cache = {}; }
  /** Forgets what was last written to an element, so the next set() writes again (after code that wrote to it directly). */
  forget(el: HTMLElement | null | undefined): void { if (el) this.written.delete(el); }
  /** Writes a style only when it changes, so a frame that holds still costs nothing. `prop` is the camel-cased property (clipPath, pointerEvents). */
  set(el: HTMLElement | null | undefined, prop: string, val: string): void {
    if (!el) return;
    let k = this.written.get(el);
    if (!k) { k = {}; this.written.set(el, k); }
    if (k[prop] === val) return;
    k[prop] = val;
    (el.style as unknown as Record<string, string>)[prop] = val;
  }

  // ---------- scroll geometry ----------
  /** How far a pinned wrapper has scrolled: 0 as its top reaches the top of the screen, 1 as its bottom does. */
  prog(el: Element, vh: number): Progress {
    const r = el.getBoundingClientRect();
    return { p: clamp(-r.top / Math.max(1, r.height - vh), 0, 1), on: r.top < vh && r.bottom > 0, r };
  }
  /** The 05-to-close stage's progress. It runs 80vh longer than its story: that scroll holds "Own what happens next." at rest (q 0.912) before the footer comes in. D is the pull-up 04 → 05 gives it. */
  hq(top: number, height: number, vh: number, D: number): number {
    const H = 0.8 * vh, S = Math.max(1, height - vh - D), So = Math.max(1, S - H), s = clamp(-top - D, 0, S), a = 0.912 * So;
    return clamp(s <= a ? s / So : s <= a + H ? 0.912 : (s - H) / So, 0, 1);
  }
  /** The page position at progress q of a pinned wrapper, for the nav's anchors. */
  stageY(sel: string, q: number): number {
    const el = this.q(sel); if (!el) return 0;
    const rct = el.getBoundingClientRect(), vh = window.innerHeight, hw = sel === "[data-h-wrap]", D = hw ? this.t45D : 0, S = Math.max(0, rct.height - vh - D);
    if (!hw) return window.scrollY + rct.top + q * S;
    const H = 0.8 * vh, So = Math.max(1, S - H);
    return window.scrollY + rct.top + D + (q <= 0.912 ? q * So : q * So + H);
  }
  scrollTo(y: number): void { this.ss.scrollTo(y); }
  /** Where each anchor of the nav and the footer lands (v5 goTop, goHow, goOptions, goPractices, goVal, goContact). */
  anchorY(name: string): number {
    const top = (sel: string, d = 0) => { const el = this.q(sel); return el ? window.scrollY + el.getBoundingClientRect().top + d : 0; };
    switch (name) {
      case "how": return this.stageY("[data-stage-wrap]", 0.31);
      case "options": return top("[data-s4]", -40);
      case "practices": return this.stageY("[data-h-wrap]", 0.2);
      case "val": return this.stageY("[data-h-wrap]", 0.58);
      case "contact": return top("#contact");
      default: return 0;
    }
  }
  /** Fades an element in over its last `d` units of travel. */
  fadeUp(el: HTMLElement | null, k: number, d: number, unit: string): void {
    if (!el) return;
    el.style.opacity = k.toFixed(3);
    el.style.transform = k >= 1 ? "none" : `translateY(${((1 - k) * d).toFixed(3)}${unit})`;
  }

  // ---------- per frame ----------
  /** The scroll choreography. Each section of the README's build order adds its part here, in page order. */
  tick(time: number): void {
    // as in v5: 04 → 05 runs first (it also sets the hold's length that the rest reads), then the reveal words
    this.t45.tick(time);
    this.s3.placeWords();
    this.stage.tick(time);
    this.s3.tick(time);
    this.sdots.tick(time);
    this.h.tick(time);
  }
}
