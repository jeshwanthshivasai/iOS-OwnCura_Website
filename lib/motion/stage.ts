/* The hero stage's motion, as in v5's class Component: the intro, the hero inside the H frame, its exit into the resting H, the earth, the nav's states, and 02: the two entities, the six step cards, the row's exit and the closing line. */
import type { Engine, Progress } from "./engine";
import { clamp, expoOut, inOut, range, smooth } from "./math";
import { RECT, L, halvesPath, frameUW } from "./geometry";
import { DotField } from "../gl/dot-field";
import { MeshGradient } from "../gl/mesh-gradient";
import { loadGlobe, type Globe } from "../globe";
import { EXIT_DROP, EXIT_GROW, GLOBE_START_TOP, GLOBE_TOP, GRADIENT_COLORS, GRADIENT_SCALE, GRADIENT_SPEED, HERO_GRADIENT, LINE1_LIFT, LINE1_SIZE, LINE2_SIZE } from "../settings";

interface StageEls { clip: HTMLElement; blur: HTMLElement; hc: HTMLElement; l1: HTMLElement | null; l2: HTMLElement | null; gw: HTMLElement | null; nav: HTMLElement | null; bg: HTMLElement | null; row: HTMLElement | null; close: HTMLElement | null }
/** When each of 02's six cards is fully up, in the stage's p (0 at P 0.30, 1 at the end). */
const STEP_T = [0.16, 0.27, 0.38, 0.49, 0.6, 0.71];
/** k scales the plus, m swaps the halves into the H, part/reach/hk make the two entities, f grows the H into the hero frame. */
export interface ObjectState { k?: number; m?: number; part?: number; reach?: number; hk?: number; f: number }

export class StageMotion {
  dots: DotField | null = null;
  mesh: MeshGradient | null = null;
  globe: Globe | null = null;
  introRunning = false;
  /** 02's cards are laid out and measurable. v5 sets it on every stage frame once the intro is over (from P = 0, before 02's own range), so the H the frame shrinks back to is already a third of a card's height; 02 sets it at the same point in tick. */
  cardsLive = false;
  private se: StageEls | null = null;
  private introRaf = 0;
  private globeOp = 0;
  private earthShown = false;
  private globeEntering = false;
  private timers: number[] = [];
  private stOn = false;
  private navZ: string | null = null;
  private l1Key = "";
  private l1Fs: string | null = null;
  /** The card width the row was last laid out for; a new width lays the cards out again. */
  private cardS: number | null = null;
  private s2RowBottom = 0;
  private s2Gap = 0;
  /** How far the hero's frame has shrunk back (0–1); part of the horizon measure's key. */
  private earthBack = 0;
  private apexC: { k: string; off: number | null } | null = null;
  private offResize: (() => void) | null = null;
  private destroyed = false;

  constructor(private readonly e: Engine) {}

  boot(): void {
    const e = this.e;
    const dc = e.q<HTMLCanvasElement>("[data-dots]");
    if (dc) { this.dots = new DotField(dc); this.dots.fade = 0; this.dots.map = 0; }
    const mc = e.q<HTMLCanvasElement>("[data-mesh]");
    if (mc) this.mesh = new MeshGradient(mc, { intensity: HERO_GRADIENT, scale: GRADIENT_SCALE, speed: GRADIENT_SPEED, resolution: 0.5, seed: 7, colors: GRADIENT_COLORS });
    // the earth's library and map start loading now; the intro runs about nine seconds
    loadGlobe().catch(() => {});
    const gs = e.q("[data-globe-section]"); if (gs && !this.globeEntering) gs.style.top = GLOBE_TOP + "vh";
    this.fitHero();
    this.offResize = e.onResize(() => { this.se = null; this.cardS = null; if (this.mesh) this.mesh.resize(); if (this.globe) this.globe.resize(); this.fitHero(); });
    e.stageOn = true;
    if (!e.reduced) this.runIntro(); else this.finishIntro();
  }

  destroy(): void {
    this.destroyed = true;
    this.introRunning = false; // a start still waiting on fonts.ready, or a running frame, then returns
    cancelAnimationFrame(this.introRaf); this.timers.forEach((t) => clearTimeout(t)); this.timers = [];
    if (this.offResize) this.offResize();
    if (this.dots) this.dots.destroy(); if (this.mesh) this.mesh.destroy(); if (this.globe) this.globe.destroy();
    document.documentElement.style.overflow = "";
  }

  /** Stroke of the object: the H is as tall as the step cards (three strokes), centred at 53% of the viewport. */
  objS(): number {
    const vh = window.innerHeight; const base = Math.max(50, Math.min(80, vh * 0.067));
    const c = this.e.el("card0", "[data-scard]"); const h = c && this.cardsLive ? c.offsetHeight : 0;
    return h > 0 ? h / 3 : base;
  }

  /** One call draws every state of the object. */
  drawObject(o: ObjectState): void {
    const clip = this.e.el("objclip", "[data-obj-clip]"); if (!clip) return;
    const vw = window.innerWidth, vh = window.innerHeight, s = this.objS(), cx = vw / 2, cy = vh * 0.53;
    let d: string;
    if (o.f > 0) {
      const uw = frameUW(vw), top = cy - 1.5 * s, bot = cy + 1.5 * s, f = smooth(o.f);
      const A = [[cx - 1.5 * s, top, cx - 0.5 * s, bot], [cx + 0.5 * s, top, cx + 1.5 * s, bot], [cx - 0.5 * s, cy - s / 2, cx + 0.5 * s, cy + s / 2]];
      const B = [[0, 0, uw, vh], [vw - uw, 0, vw, vh], [uw, vh * 0.429, vw - uw, vh * 0.603]];
      d = A.map((a, i) => RECT(L(a[0], B[i][0], f), L(a[1], B[i][1], f), L(a[2], B[i][2], f), L(a[3], B[i][3], f))).join("");
    } else d = halvesPath(cx, cy, s * (o.k == null ? 1 : o.k), o.m == null ? 1 : o.m, o.part || 0, o.reach || 0, o.hk || 0);
    this.e.set(clip, "clipPath", `path('${d}')`);
  }

  stageEls(): StageEls | null {
    if (this.se && this.se.clip.isConnected) return this.se;
    const q = (s: string) => this.e.q(s);
    const clip = q("[data-obj-clip]"), blur = q("[data-obj-blur]"), hc = q("[data-hero-content]");
    if (!clip || !hc || !blur) return null;
    return (this.se = { clip, blur, hc, l1: q("[data-line1]"), l2: q("[data-line2]"), gw: q("[data-globe-wrap]"), nav: q("[data-nav]"), bg: q("[data-stage-bg]"), row: q("[data-card-row]"), close: q("[data-s2-close]") });
  }

  /** The hero lines at their sizes. Line 1 shrinks only when it would cross the uprights (narrower screens such as a 14" laptop). */
  fitHero(): void {
    const l1 = this.e.q("[data-line1]"), l2 = this.e.q("[data-line2]");
    if (l1) { l1.style.fontSize = LINE1_SIZE + "vh"; l1.style.bottom = LINE1_LIFT + "vh"; }
    if (l2) l2.style.fontSize = LINE2_SIZE + "vh";
    if (l1) {
      const k1 = [LINE1_SIZE, window.innerWidth, window.innerHeight, document.fonts ? document.fonts.status : ""].join("|");
      if (k1 !== this.l1Key) {
        this.l1Key = k1;
        const vw = window.innerWidth, avail = vw - 2 * frameUW(vw) - 2 * Math.max(16, vw * 0.025), rg = document.createRange(); rg.selectNodeContents(l1);
        const tw = rg.getBoundingClientRect().width;
        this.l1Fs = tw > avail && tw > 0 ? ((LINE1_SIZE * avail) / tw).toFixed(3) + "vh" : null;
      }
      if (this.l1Fs) l1.style.fontSize = this.l1Fs;
    }
  }

  // ---------- intro: one material condenses into a plus (already two halves) → the halves slide into an H → two entities shake hands → one H → it grows into the hero's frame ----------
  runIntro(): void {
    const el = this.stageEls(); if (!el) { this.finishIntro(); return; }
    this.introRunning = true; this.e.stageOn = true;
    document.documentElement.style.overflow = "hidden"; this.e.ss.locked = true;
    window.scrollTo(0, 0);
    el.hc.style.opacity = "1";
    const skip = this.e.q("[data-skip]"); if (skip) skip.hidden = false;
    const start = () => {
      if (!this.introRunning) return;
      if (this.globe) this.globe.resize();
      let t = 0, last = performance.now();
      const frame = (now: number) => {
        if (!this.introRunning) return;
        t += Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
        this.introAt(t);
        if (t < 9.6) this.introRaf = requestAnimationFrame(frame); else this.finishIntro();
      };
      this.introRaf = requestAnimationFrame(frame);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  }
  /** Renders the intro at time t (seconds). */
  introAt(t: number): void {
    const el = this.stageEls(); if (!el) return; const r = range, s = this.objS(), e = this.e;
    // A. a soft cloud of the gradient condenses and sharpens into the square cross (0.2–1.7); it holds a beat
    const k = L(0.55, 1, expoOut(r(t, 0.2, 1.6))), blur = 30 * (1 - smooth(r(t, 0.2, 1.7)));
    e.set(el.blur, "opacity", r(t, 0.1, 0.9).toFixed(3)); e.set(el.blur, "filter", blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none");
    // B. the two halves slide apart and land as the H, one entity (2.6–3.9)
    const m = inOut(r(t, 2.6, 3.9));
    // C. two entities: the H parts a little, heads rise above the uprights, a handshake, then one H (4.4–6.8)
    const hu = expoOut(r(t, 4.4, 5.1)), hd = smooth(r(t, 6.2, 6.8)), hk = hu * (1 - hd);
    const part = 0.15 * s * hk, reach = part * Math.sin(Math.PI * r(t, 5.3, 6.0));
    // D. the H grows into the hero's frame (7.2–8.7)
    const f = inOut(r(t, 7.2, 8.7));
    this.drawObject({ k, m, part, reach, hk, f });
    // E. the hero arrives inside the frame: line one, line two on the crossbar, the earth, the nav
    e.fadeUp(el.l1, expoOut(r(t, 8.0, 8.9)), 0.3, "em"); e.fadeUp(el.l2, expoOut(r(t, 8.2, 9.1)), 0.3, "em");
    this.globeOp = smooth(r(t, 8.3, 9.5)); e.set(el.gw, "opacity", this.globeOp.toFixed(3)); if (t >= 8.25) this.revealEarth();
    if (this.dots) this.dots.fade = smooth(r(t, 8.3, 9.5));
    const nn = expoOut(r(t, 8.7, 9.4)); if (el.nav) { el.nav.style.opacity = nn.toFixed(3); el.nav.style.transform = `translateY(${(-(1 - nn) * 14).toFixed(1)}px)`; }
  }
  finishIntro(): void {
    this.introRunning = false; cancelAnimationFrame(this.introRaf);
    const el = this.stageEls(), e = this.e;
    if (el) {
      e.set(el.blur, "opacity", "1.000"); e.set(el.blur, "filter", "none");
      this.drawObject({ k: 1, m: 1, part: 0, reach: 0, hk: 0, f: 1 });
      el.hc.style.opacity = "1";
      [el.l1, el.l2].forEach((x) => { if (x) { x.style.opacity = "1"; x.style.transform = "none"; } });
      this.globeOp = 1; e.set(el.gw, "opacity", "1.000"); this.revealEarth();
      if (this.dots) this.dots.fade = 1;
      if (el.nav) { el.nav.style.opacity = "1"; el.nav.style.transform = "none"; }
    }
    document.documentElement.style.overflow = ""; e.ss.locked = false;
    const skip = e.q("[data-skip]"); if (skip) skip.hidden = true;
  }

  // ---------- the earth ----------
  /** Shown only when the hero reveals it, so the globe's own entry (tilt 0 → 50°) plays then: the section rises from 24vh to its resting 36vh over 3 s. */
  revealEarth(): void {
    if (this.earthShown) return; this.earthShown = true;
    const gw = this.e.q("[data-globe-wrap]"); if (gw) gw.style.display = "block";
    const gs = this.e.q("[data-globe-section]");
    if (gs && !this.e.reduced) {
      this.globeEntering = true; gs.style.transition = "none"; gs.style.top = GLOBE_START_TOP + "vh"; void gs.offsetHeight;
      requestAnimationFrame(() => {
        if (this.destroyed) return;
        gs.style.transition = "top 3s ease"; gs.style.top = GLOBE_TOP + "vh";
        this.timers.push(window.setTimeout(() => { gs.style.transition = "none"; this.globeEntering = false; }, 3500));
      });
    }
    this.startGlobe();
    requestAnimationFrame(() => { if (this.globe && !this.destroyed) this.globe.resize(); });
  }
  private startGlobe(): void {
    if (this.globe) return;
    const mc = this.e.q("#map"), gs = this.e.q("[data-globe-section]"), halo = this.e.q("[data-halo]");
    if (!mc || !gs) return;
    loadGlobe().then((m) => {
      if (this.globe || this.destroyed) return;
      this.globe = new m.Globe(mc, gs, halo);
      return this.globe.start();
    }).catch((err) => console.warn("globe", err));
  }

  // ---------- scroll choreography ----------
  tick(time: number): void {
    const e = this.e, vh = window.innerHeight, r = range, sm = smooth;
    const sw = e.el("stage", "[data-stage-wrap]"); if (!sw) return;
    const ST = e.prog(sw, vh), P = ST.p; e.stageOn = ST.on;
    this.tickNav(ST, vh);
    const se = this.introRunning ? null : this.stageEls();
    if (se && (ST.on || this.stOn)) {
      this.stOn = ST.on; const el = se, s = this.objS(), vw = window.innerWidth;
      // hero text out (0–0.10); the frame shrinks from both sides back to the resting H (0.03–0.24); the earth grows a little with it
      const c = 1 - sm(r(P, 0, 0.1)), back = sm(r(P, 0.03, 0.24));
      const k1 = 1 - c; e.set(el.hc, "opacity", c.toFixed(3)); e.set(el.hc, "transform", "none"); e.set(el.hc, "filter", k1 > 0.01 ? `blur(${(k1 * 6).toFixed(1)}px)` : "none");
      const dis = `rgb(${Math.round(20 + 26 * k1)}, ${Math.round(23 + 85 * k1)}, ${Math.round(28 + 156 * k1)})`; [el.l1, el.l2].forEach((x) => e.set(x, "color", dis));
      this.earthBack = back;
      // the dotted field stays: the hero's field and 02's are both on
      if (this.dots) this.dots.fade = 1;
      this.globeOp = 1; e.set(el.gw, "opacity", "1.000");
      const p = r(P, 0.3, 1);
      // into 02 the globe grows about its horizon until the arc runs off both edges, and stays through the exit
      const gsec = e.el("gsec", "[data-globe-section]"); if (gsec) e.set(gsec, "transform", `translateY(${(back * vh * (EXIT_DROP / 100)).toFixed(1)}px) scale(${(1 + (EXIT_GROW - 1) * back).toFixed(4)})`);
      e.set(el.bg, "opacity", sm(r(p, 0, 0.16)).toFixed(3));
      // 02: the resting H becomes the two entities (heads rise, p 0–0.05); six cards pop up in the middle one after another; each pushes the entities further apart; after the sixth they leave the screen
      const row = el.row, close = el.close;
      if (!row || !close) { this.drawObject({ k: 1, m: 1, part: 0, reach: 0, hk: 0, f: 1 - back }); }
      else {
        const cards = e.els("scards", "[data-scard]");
        const cw = cards[0] ? cards[0].offsetWidth : 200, gap2 = vw * 0.009, pitch = cw + gap2;
        // the first card waits until the entities have stepped apart (g1), so it rises into an open gap instead of over them
        const kOf = (i: number) => (i === 0 ? sm(r(p, 0.09, STEP_T[0] + 0.02)) : sm(r(p, STEP_T[i] - 0.11, STEP_T[i] + 0.02)));
        let n = 0; for (let i = 0; i < 6; i++) n += kOf(i);
        e.set(row, "height", "auto");
        // exit: the whole row rises and settles under the section title; the closing line then appears under the row
        const upK = sm(r(p, 0.8, 0.92)), hdEl = e.el("s2head", "[data-s2-head]"), rowH = row.offsetHeight || 0, rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const apexY = this.s2ApexY(vh), chS = close.offsetHeight;
        const tb = hdEl ? hdEl.offsetTop + hdEl.offsetHeight : vh * 0.2, g = Math.max(16, (apexY - tb - rowH - chS) / 3.5);
        // exit rhythm: title, 1.5 gaps, the row, a gap, the closing line, the same gap, the globe; the globe never moves for the row, on shorter screens the gaps shrink instead
        const rowTop0 = vh * 0.53 - rowH / 2, rowTop1 = Math.min(rowTop0, tb + 1.5 * g);
        e.set(row, "transform", `translate(-50%, -50%) translateY(${((rowTop1 - rowTop0) * upK).toFixed(1)}px)`);
        this.s2RowBottom = rowTop1 + rowH; this.s2Gap = g;
        // the card composition from the design, at whatever width six across gives: numeral height 0.62 × card width, text column right of it, height from the content
        const cwNow = cards[0] ? cards[0].offsetWidth : 0;
        this.cardsLive = true;
        if (this.cardS !== cwNow) { this.cardS = cwNow; this.fitCards(cards); }
        const exit = sm(r(p, 0.8, 0.92)) * (vw / 2 + 6 * s);
        const hk = sm(r(p, 0, 0.05));
        const g1 = sm(r(p, 0.05, 0.13)), base = 0.15 * s * hk + 0.45 * s * Math.max(clamp(n * 3, 0, 1), g1) + Math.max(Math.max(0, n * pitch - gap2) / 2, (g1 * cw) / 2);
        const flush = Math.max(0, vw / 2 + 0.5 * s - base), sixth = sm(r(p, STEP_T[5] - 0.11, STEP_T[5] + 0.02));
        const part = base + flush * sixth + exit;
        this.drawObject({ k: 1, m: 1, part, reach: 0, hk, f: 1 - back });
        // each card is born at the centre, between the two entities; the row spreads to make room
        cards.forEach((m, i) => {
          const k = kOf(i);
          const slot = (i - (Math.max(1, n) - 1) / 2) * pitch, x = slot * k - (i - 2.5) * pitch;
          e.set(m, "opacity", k.toFixed(3)); e.set(m, "transform", `translateX(${x.toFixed(1)}px) translateY(${((1 - k) * 24).toFixed(1)}px) scale(${(0.72 + 0.28 * k).toFixed(3)})`);
          e.set(m, "zIndex", String(10 + Math.round(k * 10)));
        });
        // the closing line reveals where the cards were: centred on the row (the stage centre)
        { const rb = this.s2RowBottom || vh * 0.6; e.set(close, "top", (rb + (this.s2Gap || rem)).toFixed(1) + "px"); }
        const ho = sm(r(p, 0.0, 0.08));
        e.set(hdEl, "opacity", ho.toFixed(3)); e.set(hdEl, "transform", `translateY(${((1 - ho) * 12).toFixed(1)}px)`);
        const o = sm(r(p, 0.91, 0.97)); e.set(close, "opacity", o.toFixed(3)); e.set(close, "transform", `translateY(${((1 - o) * 14).toFixed(1)}px)`);
      }
    }
    if (e.stageOn) {
      if (this.dots && this.dots.fade > 0.005) this.dots.render(time);
      if (this.mesh) this.mesh.render(time);
    }
  }
  /** The card composition from the design, at whatever width six across gives. The title gets the largest size that fits in two lines, the same on all six; the description the largest size at which its column ends level with the numeral. */
  private fitCards(cards: HTMLElement[]): void {
    const fits: { inner: HTMLElement; nh: number; put: (t: number, d: number) => void; ts: number }[] = [];
    cards.forEach((cd) => {
      const w = cd.offsetWidth; cd.style.height = "auto"; cd.style.minHeight = (w * 0.68).toFixed(1) + "px";
      const inn = cd.querySelector<HTMLElement>("[data-cin]");
      if (inn) { inn.style.position = "relative"; inn.style.inset = "auto"; inn.style.margin = (w * 0.05).toFixed(1) + "px"; inn.style.minHeight = (w * 0.62).toFixed(1) + "px"; }
      const nuEl = cd.querySelector<SVGSVGElement>("[data-num]"); if (nuEl) nuEl.style.height = (w * 0.62).toFixed(1) + "px";
      const inner = inn, nu = nuEl, h3 = cd.querySelector<HTMLElement>("h3"), pp = cd.querySelector<HTMLElement>("p"); if (!inner) return;
      const cwid = w * 0.9, nh = w * 0.62; let nw = 0;
      if (nu) { const vb = (nu.getAttribute("viewBox") || "0 0 157 268").split(" ").map(Number); nw = nh * (vb[2] / vb[3]); }
      const left = Math.round(nw + cwid * 0.03);
      // title: the largest size that fits in two lines; description: the largest size at which the column ends level with the numeral
      const span = h3 ? h3.querySelector<HTMLElement>("span") || (() => { const sp = document.createElement("span"); sp.textContent = h3.textContent; h3.textContent = ""; h3.appendChild(sp); return sp; })() : null;
      let ts = 14, ds = 10;
      const put = () => {
        if (h3) { h3.style.marginLeft = left + "px"; h3.style.fontSize = ts.toFixed(1) + "px"; h3.style.minHeight = "0"; h3.style.lineHeight = "1.02"; h3.style.alignItems = "flex-start"; }
        if (pp) { pp.style.marginLeft = left + "px"; pp.style.fontSize = ds.toFixed(1) + "px"; pp.style.lineHeight = "1.35"; }
      };
      put();
      if (h3) { h3.style.minWidth = "0"; h3.style.overflowWrap = "normal"; }
      if (h3 && span) { span.style.display = "inline-block"; span.style.maxWidth = "100%"; for (let k = 0; k < 40; k++) { ts += 1; put(); if (span.offsetHeight > ts * 1.02 * 2 + 2 || h3.scrollWidth > h3.clientWidth || ts > 44) { ts -= 1; put(); break; } } }
      inner.style.minHeight = nh.toFixed(1) + "px";
      fits.push({ inner, nh, put: (t, d) => { ts = t; ds = d; put(); }, ts });
    });
    // one title size for the row: the smallest of the six, so neighbours read as one system
    const sorted = fits.map((f) => f.ts).sort((a, b) => a - b);
    const shared = Math.max(14, Math.min(...sorted));
    fits.forEach((f) => { const cap = Math.max(10.5, Math.min(14, shared / 1.9)); let d = 10; f.put(shared, d); for (let k = 0; k < 40; k++) { d += 0.5; f.put(shared, d); if (f.inner.scrollHeight > f.nh + 1 || d > cap) { d -= 0.5; f.put(shared, d); break; } } });
  }
  /** The globe's horizon on screen (the top of the disc), measured from the map itself. */
  private s2ApexY(vh: number): number {
    const m = this.globe ? this.globe.map : null; if (!m || (m.isStyleLoaded && !m.isStyleLoaded())) return vh * 0.72;
    let cc: { lng: number; lat: number }; try { cc = m.getCenter(); } catch { return vh * 0.72; }
    const key = window.innerWidth + "x" + vh + ":" + this.earthBack.toFixed(2) + ":" + cc.lng.toFixed(1) + "," + cc.lat.toFixed(1) + ":" + m.getZoom().toFixed(2);
    // the disc's top inside the map is cached per view; where the map sits on screen is read fresh every call, so a globe still settling (its entry, a scroll back from 03) never leaves a stale horizon behind
    if (!this.apexC || this.apexC.k !== key) {
      let off: number | null = null;
      try {
        const ctr = m.getCenter(), c = m.project(ctr); let R = 0;
        for (let d = 2; d <= 90; d += 2) { const lat = ctr.lat + d; if (lat > 89.5) break; const pt = m.project([ctr.lng, lat]); if (isFinite(pt.y) && Math.abs(pt.x - c.x) < 40) R = Math.max(R, c.y - pt.y); }
        if (R > 0) off = c.y - R;
      } catch {}
      this.apexC = { k: key, off };
    }
    if (this.apexC.off == null) return vh * 0.72;
    // measured against the stage, not the screen: when the stage scrolls away the row and the closing line travel with it instead of sliding up
    try { const ct = m.getContainer(), rc = ct.getBoundingClientRect(), k = rc.height / (ct.offsetHeight || rc.height || 1), st = this.e.el("stagesec", "[data-stage-wrap] > section"), s0 = st ? st.getBoundingClientRect().top : 0; return Math.min(vh * 0.95, Math.max(vh * 0.5, rc.top - s0 + this.apexC.off * k)); } catch { return vh * 0.72; }
  }
  /** The nav: inside the frame in the hero and the close; edge to edge on glass through 02–03 and 05–06; gone from the start of 03 → 04 until 05. */
  private tickNav(ST: Progress, vh: number): void {
    if (this.introRunning) return;
    const e = this.e, row = e.el("herorow", "[data-hero-row]"), gl = e.el("navglass", "[data-nav-glass]");
    let z = "hero";
    const s3w = e.el("nz3", "[data-s3-wrap]"), hw = e.el("nzh", "[data-h-wrap]"), D = e.t45D, hr = hw ? hw.getBoundingClientRect() : null, y3 = s3w ? -s3w.getBoundingClientRect().top : -1e9;
    if (hr && -hr.top >= D - 1) z = e.hq(hr.top, hr.height, vh, D) >= 0.8 ? "hero" : "bar";
    else if (y3 > 3.2 * vh + 8) z = "gone";
    else z = ST.on && ST.p < 0.12 ? "hero" : "bar";
    if (row && z !== this.navZ) {
      this.navZ = z; const gone = z === "gone", bar = z === "bar", fr = "calc(clamp(150px, 10vw, 220px) + 2vw)";
      row.style.left = row.style.right = bar ? "2.7vw" : fr; row.style.top = bar ? "0.9rem" : "1.35rem";
      row.style.opacity = gone ? "0" : "1"; row.style.transform = gone ? "translateY(calc(-100% - 2.6rem))" : "none"; row.style.pointerEvents = gone ? "none" : "auto";
      if (gl) { gl.style.opacity = bar ? "1" : "0"; gl.style.transform = gone ? "translateY(-100%)" : "none"; }
    }
  }
}
