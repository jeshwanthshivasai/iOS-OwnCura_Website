/* 04 Your four options, as in v5's S4Ctl (carried from "OwnCura 04 Study - The Cross" and driven by the page's own scroll and frame loop). The settings build the cross layout only (v5 dir 'cross').
   The 4 moves to the left edge (numeralEdge: flush) and morphs 1 → 2 → 3 → 4 as the options pass, filled with the living gradient (fourFill). A cross of gradient bars divides the room beside it
   into four boxes and moves from box to box; each option's diagram, title and body arrive in its box. After the fourth the cross gathers to the centre and all four show as a grid (gridDiagrams: as designed). */
import type { Engine } from "./engine";
import { inOut, range, smooth } from "./math";
import { MeshGradient } from "../gl/mesh-gradient";
import { CIR, FR, FRL, NL, P9, REC, WIN, type Box } from "../s4-data";
import { FOUR_STRENGTH } from "../settings";

const RC = (x0: number, y0: number, x1: number, y1: number) => "M" + x0.toFixed(1) + " " + y0.toFixed(1) + "H" + x1.toFixed(1) + "V" + y1.toFixed(1) + "H" + x0.toFixed(1) + "Z";
const CL = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const L = (x: number, y: number, s: number) => x + (y - x) * s;
const MESH = { intensity: 1, scale: 1.6, speed: 1, resolution: 0.5, seed: 11, colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"] as [string, string, string, string] };

interface Geo { nx: number; nTop: number; sc: number; cx0: number; cw: number; T: number; cb: number; M: number; W: number; H: number; yC: number; yB: number }
/** One box's state in one frame: whether its title is inked, right-aligned, the title's size and max width, the diagram's height and place, the title's place, and (in the box's own frame) the body's place, width and scale. */
interface Lay { ink: number; right: number; fs: number; mw: number; dh: number; dx: number; dy: number; tx: number; ty: number; bx?: number; by?: number; bwid?: number; bsc?: number }
interface Parts { cg: HTMLElement; ct: HTMLElement; cb: HTMLElement; lead: HTMLElement | null; desc: HTMLElement | null; cta: HTMLElement | null; btn: HTMLElement | null }
type El = HTMLElement & { __barW?: number };

export class S4Motion {
  private root: HTMLElement | null = null;
  private mesh: MeshGradient | null = null;
  private cmesh: MeshGradient | null = null;
  private nb: Element[] = [];
  private nc: Element[][] = [];
  private clipEls: Element[] = [];
  private gga: Element | null = null;
  private cur = 0;
  private ccur = 0;
  private slides: El[][] = [];
  private pos = 0;
  private rOn = false;
  private geo: Geo | null = null;
  private lc: { th: number; gp: number; L0: number; W: number; H: number; T: number; B: number; C: number[][]; CR: number[]; lays: Lay[][]; s: number } | null = null;
  private lastD = "";
  private readonly ac = new AbortController();
  private destroyed = false;

  constructor(private readonly e: Engine) {}

  private q<T extends HTMLElement = HTMLElement>(s: string): T | null { return this.root ? (this.root.querySelector(s) as T | null) : null; }
  private qa<T extends Element = HTMLElement>(s: string): T[] { return this.root ? (Array.from(this.root.querySelectorAll(s)) as T[]) : []; }

  /** v5 boots on its first frame (boot, then applyDir again), then ticks after the page's own tick. */
  boot(): void {
    const root = (this.root = this.e.q("[data-s4-host]")); if (!root) return;
    // the wrapper's height from the same once-read flag as the 04 → 05 hold (v5 applyToggles), so the two cannot drift if the setting changes mid-visit; the CSS covers the first paint
    const w4 = this.q("[data-s4-wrap]"); if (w4) w4.style.height = this.e.reduced ? "760vh" : "1060vh";
    const mc = this.q<HTMLCanvasElement>("[data-four-mesh]"); if (mc) this.mesh = new MeshGradient(mc, MESH);
    this.nb = this.qa("[data-nb]"); this.nc = [0, 1, 2].map((i) => this.qa("[data-nc" + i + "]")); this.clipEls = this.qa("[data-nclip]");
    this.gga = root.querySelector("[data-gga]"); this.cur = 0;
    this.slides = [0, 1, 2, 3].map((i) => this.qa<El>('[data-cs="' + i + '"]'));
    this.pos = 0; this.rOn = false;
    const sig = { signal: this.ac.signal };
    this.qa("[data-go]").forEach((el) => {
      const i = +(el.getAttribute("data-go") || 0);
      el.addEventListener("click", () => this.goOpt(i), sig);
      el.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); this.goOpt(i); } }, sig);
    });
    this.applyDir(); this.fit();
    window.addEventListener("resize", () => this.fit(), sig);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!this.destroyed) this.fit(); });
    this.applyDir();
  }

  destroy(): void {
    this.destroyed = true; this.ac.abort();
    if (this.mesh) this.mesh.destroy(); if (this.cmesh) this.cmesh.destroy();
  }

  /** The cross layout's starting state: every text group below its mask, and the cross's gradient. */
  private applyDir(): void {
    if (!this.root) return;
    this.slides.forEach((g) => this.setGroup(g, "below", 1, true)); this.pos = 0; this.rOn = false;
    if (!this.cmesh) { const cm = this.q<HTMLCanvasElement>("[data-cmesh]"); if (cm) this.cmesh = new MeshGradient(cm, MESH); }
  }

  /** A click on an option's diagram or title scrolls to where that option holds. */
  private goOpt(i: number): void {
    const wrap = this.q("[data-s4-wrap]"); if (!wrap) return;
    const H = window.innerHeight, top = wrap.getBoundingClientRect().top + window.scrollY, y = top + (WIN[i][1] + 0.03) * (wrap.offsetHeight - H - this.e.t45Ex);
    this.e.scrollTo(y);
  }

  fit(): void {
    if (!this.root) return;
    const W = window.innerWidth, H = window.innerHeight, kn = H / 268;
    this.clipEls.forEach((el) => el.setAttribute("transform", "scale(" + kn.toFixed(4) + ")"));
    // the living gradient fills the 4 (fourFill), at full strength (fourStrength)
    const clip = this.q("[data-four-clip]"), four = this.q("[data-four]");
    if (clip) clip.style.display = "block";
    if (four) four.style.opacity = String(FOUR_STRENGTH);
    if (this.mesh) this.mesh.resize();
    // the 4 flush to the left edge (numeralEdge), at full height unless the screen is narrow
    const M = Math.max(20, W * 0.027);
    const nx = 0, sc = Math.min(1, (W * 0.44) / (182.814 * kn)), nTop = (H * (1 - sc)) / 2, nW = 182.814 * kn * sc;
    const cx0 = nx + nW + M, cw = Math.max(320, W - M - cx0);
    const T = Math.max(M, H * 0.065), cb = H - T, k4 = kn * sc;
    this.geo = { nx, nTop, sc, cx0, cw, T, cb, M, W, H, yC: nTop + 146.71 * k4, yB: nTop + 159.09 * k4 };
    this.fitCross();
  }

  /** The cross, as the designer drew it. At 1920 × 958 every box is FR exactly; on any other screen each state is FR scaled as one piece, centred row by row. */
  private fitCross(): void {
    const gS = this.geo; if (!gS) return;
    let WD = 1920, HD = 958;
    const knD = HD / 268, MD = Math.max(20, WD * 0.027), scD = Math.min(1, (WD * 0.44) / (182.814 * knD));
    let L0D = 0 + 182.814 * knD * scD + MD;
    const WdD = Math.max(320, WD - MD - L0D);
    let TD = Math.max(MD, HD * 0.065);
    const HhD = HD - 2 * TD;
    let thD = CL(HD * 0.02, 12, 26);
    const fa = 0.66, ha = 0.74;
    let CD: number[][] = [[L0D + fa * WdD, TD + ha * HhD], [L0D + (1 - fa) * WdD, TD + ha * HhD], [L0D + fa * WdD, TD + (1 - ha) * HhD], [L0D + (1 - fa) * WdD, TD + (1 - ha) * HhD], [L0D + 0.5 * WdD, TD + 0.5 * HhD]];
    const W = gS.W, H = gS.H, L0 = gS.cx0;
    // laptop-shaped screens use the laptop frames (FRL: Two States 5a–5e, drawn at 1512 × 844); wider screens use the 1920 × 958 frames (FR: 4a–4e)
    const SET = Math.abs(Math.log(W / H / (FRL.W / FRL.H))) < Math.abs(Math.log(W / H / (WD / HD))) ? FRL : null;
    if (SET) { WD = SET.W; HD = SET.H; L0D = SET.L0; thD = SET.th; CD = SET.C; TD = Math.max(Math.max(20, WD * 0.027), HD * 0.065); }
    const ST: Record<string, Box[]> = SET ? SET.st : FR, ax = (W - L0) / (WD - L0D), ay = H / HD, s = Math.min(ax, ay);
    const th = Math.max(8, thD * s), C = CD.map((c) => [L0 + (c[0] - L0D) * ax, c[1] * ay]);
    // a box runs from the cross bars to the screen edges
    const box = (i: number, c: number[], l0: number, w: number, h: number, h2: number) => { const x0 = i % 2 ? c[0] + h2 : l0, x1 = i % 2 ? w : c[0] - h2, y0 = i < 2 ? 0 : c[1] + h2, y1 = i < 2 ? c[1] - h2 : h; return [x1 - x0, y1 - y0]; };
    const parts: Parts[] = this.qa("[data-cq]").map((qd) => {
      const cb = qd.querySelector<HTMLElement>("[data-cbody]")!, ps = cb.querySelectorAll<HTMLElement>("p");
      return { cg: qd.querySelector<HTMLElement>("[data-cg]")!, ct: qd.querySelector<HTMLElement>("[data-ct]")!, cb, lead: ps[0] || null, desc: ps[1] || null, cta: cb.querySelector<HTMLElement>("div"), btn: cb.querySelector<HTMLElement>("a") };
    });
    // the body at the design's type (lead 26.72, description 18 at 23.6 below it, button 20 below that) times k; text never drops under 16 and 15
    const bar = (el: El, w: number) => { el.__barW = w; const bz = el.style.backgroundSize; if (bz) el.style.backgroundSize = bz.replace(/^[\d.]+px/, w + "px"); };
    const type = (P: Parts, k: number) => {
      if (P.lead) { P.lead.style.fontSize = Math.max(16, 26.72 * k).toFixed(2) + "px"; P.lead.style.whiteSpace = "nowrap"; P.lead.style.maxWidth = ""; }
      if (P.desc) { P.desc.style.maxHeight = ""; P.desc.style.overflow = ""; P.desc.style.fontSize = Math.max(15, 18 * k).toFixed(2) + "px"; P.desc.style.marginTop = (23.6 * k).toFixed(1) + "px"; P.desc.style.textAlign = "justify"; P.desc.style.lineHeight = "1.55"; bar(P.desc, 3); }
      if (P.cta) P.cta.style.marginTop = (20 * k).toFixed(1) + "px";
      if (P.btn) { P.btn.style.height = "2.75rem"; P.btn.style.padding = "0 1.3rem"; P.btn.style.fontSize = "0.9375rem"; }
    };
    // the laptop frames give every size in the body: b = x, y, width, lead, description, its line height, its gap, the button's gap, height, side padding, type size, the bar's width, lead on one line
    const typeL = (P: Parts, b: number[]) => {
      if (P.lead) { P.lead.style.fontSize = b[3] + "px"; P.lead.style.whiteSpace = b[12] ? "nowrap" : "normal"; P.lead.style.maxWidth = ""; }
      if (P.desc) { P.desc.style.maxHeight = ""; P.desc.style.overflow = ""; P.desc.style.fontSize = b[4] + "px"; P.desc.style.lineHeight = String(b[5]); P.desc.style.marginTop = b[6] + "px"; P.desc.style.textAlign = "justify"; bar(P.desc, b[11]); }
      if (P.cta) P.cta.style.marginTop = b[7] + "px";
      if (P.btn) { P.btn.style.height = b[8] + "px"; P.btn.style.padding = "0 " + b[9] + "px"; P.btn.style.fontSize = b[10] + "px"; }
    };
    const mt = (ct: HTMLElement, fs: number, mw: number) => { ct.style.fontSize = fs.toFixed(2) + "px"; ct.style.maxWidth = Math.max(40, mw).toFixed(1) + "px"; return [ct.offsetWidth, ct.offsetHeight]; };
    // every state is its frame scaled as one piece by s. A screen of another shape leaves spare height (or width); it is split evenly above and below each row (or either side of each column),
    // and the two boxes of a row share one offset, so every alignment and every gap in the frame holds exactly. The grid keeps each diagram at its designed height (gridDiagrams: as designed).
    const lays: Lay[][] = parts.map((P, i) => [0, 1, 2, 3, 4].map((gi) => {
      const f = ST[gi][i], d = f.d.slice(), t = f.t.slice(), b = f.b;
      // the title keeps the frame's line breaks at any size: NL (FRL.NL on laptops) is each title's line count in the frames, and its width is set so the same words share a line
      const n = (SET ? SET.NL : NL)[gi][i], w1 = mt(P.ct, t[2] * s, 1e5)[0];
      const bd = box(i, CD[gi], L0D, WD, HD, thD / 2), bs = box(i, C[gi], L0, W, H, th / 2), ox = (bs[0] - bd[0] * s) / 2, oy = (bs[1] - bd[1] * s) / 2;
      // the body is the frame's own body: laid out at the frame's size and scaled as one piece, so nothing in it re-flows or re-spaces
      if (b) { if (SET) typeL(P, b); else type(P, 1); P.cb.style.width = b[2] + "px"; P.cb.style.transformOrigin = "0 0"; if (!SET && P.lead && P.lead.scrollWidth > P.cb.clientWidth + 1) P.lead.style.whiteSpace = "normal"; }
      const o: Lay = { ink: gi === i || gi === 4 ? 1 : 0, right: t[4], fs: t[2] * s, mw: n > 1 ? Math.min(t[3] * s, w1 - 2) : Math.max(t[3] * s, w1 + 2), dh: d[2] * s, dx: ox + d[0] * s, dy: oy + d[1] * s, tx: ox + t[0] * s, ty: oy + t[1] * s };
      if (b) { o.bx = ox + b[0] * s; o.by = oy + b[1] * s; o.bwid = b[2]; o.bsc = s; }
      return o;
    }));
    // measuring wrote straight to the titles and bodies; clear the frame cache so the next frame writes its own values
    parts.forEach((P) => { this.e.forget(P.ct); this.e.forget(P.cb); this.e.forget(P.cg); });
    this.lc = { th, gp: Math.max(6, th * 0.6), L0, W, H, T: TD * ay, B: (HD - TD) * ay, C: C.slice(0, 4), CR: C[4], lays, s };
    if (this.cmesh) this.cmesh.resize();
  }

  /** Straight-edged morph: every numeral shares the same nine points, so each in-between shape is a clean polygon; circles move and scale. */
  private shape(a: number, b: number, s: number): { d: string; cs: number[][] } {
    const pa = P9[a], pb = P9[b];
    const d = "M" + pa.map((p, i) => L(p[0], pb[i][0], s).toFixed(2) + " " + L(p[1], pb[i][1], s).toFixed(2)).join("L") + "Z";
    const cs = [0, 1, 2].map((i) => {
      let ca = CIR[a][i], cb = CIR[b][i];
      if (!ca && !cb) return [0, 0, 0];
      if (!ca) ca = [cb[0], cb[1], 0]; if (!cb) cb = [ca[0], ca[1], 0];
      return [L(ca[0], cb[0], s), L(ca[1], cb[1], s), L(ca[2], cb[2], s)];
    });
    return { d, cs };
  }
  private setNum(sh: { d: string; cs: number[][] }, p: { x: number; y: number; sc: number }): void {
    const g = this.q("[data-four]"); if (g) g.style.transform = "translate(" + p.x.toFixed(1) + "px, " + p.y.toFixed(1) + "px) scale(" + p.sc.toFixed(4) + ")";
    if (sh.d !== this.lastD) { this.lastD = sh.d; this.nb.forEach((el) => el.setAttribute("d", sh.d)); }
    sh.cs.forEach((c, i) => this.nc[i].forEach((el) => { el.setAttribute("cx", c[0].toFixed(2)); el.setAttribute("cy", c[1].toFixed(2)); el.setAttribute("r", Math.max(0, c[2]).toFixed(2)); }));
  }

  /** Text enters by rising from behind its mask and leaves the same way, in the direction of the scroll. */
  private swap(from: number, to: number): void {
    const dir = to > from ? 1 : -1, g = this.slides;
    if (from >= 1 && from <= 4) this.setGroup(g[from - 1], "out", dir);
    if (to >= 1 && to <= 4) this.setGroup(g[to - 1], "in", dir);
  }
  private setGroup(els: El[], mode: "in" | "out" | "below", dir: number, instant?: boolean): void {
    const red = this.e.reduced || instant;
    els.forEach((el) => {
      const st = parseFloat(el.getAttribute("data-st") || "0.03"), d0 = parseFloat(el.getAttribute("data-d0") || "0");
      if (el.hasAttribute("data-fade")) {
        if (mode === "in") {
          el.style.transition = "none"; el.style.opacity = "0"; el.style.transform = "translateY(" + (dir > 0 ? 16 : -16) + "px)"; el.style.backgroundSize = (el.__barW || 3) + "px 0%"; void el.offsetWidth;
          el.style.transition = red ? "none" : "opacity .8s cubic-bezier(.22,1,.36,1) .32s, transform .9s cubic-bezier(.22,1,.36,1) .32s, background-size 1s cubic-bezier(.22,1,.36,1) .5s";
          el.style.opacity = "1"; el.style.transform = "none"; el.style.backgroundSize = (el.__barW || 3) + "px calc(100% - 0.8em)"; el.style.pointerEvents = "auto";
        } else {
          el.style.transition = red ? "none" : "opacity .35s cubic-bezier(.87,0,.13,1), transform .5s cubic-bezier(.87,0,.13,1), background-size .35s";
          el.style.opacity = "0"; el.style.transform = mode === "below" ? "translateY(16px)" : "translateY(" + (dir > 0 ? -16 : 16) + "px)"; el.style.backgroundSize = (el.__barW || 3) + "px 0%"; el.style.pointerEvents = "none";
        }
        return;
      }
      el.querySelectorAll<HTMLElement>("[data-w]").forEach((w, j) => {
        if (mode === "in") { w.style.transition = "none"; w.style.transform = "translateY(" + (dir > 0 ? "115%" : "-115%") + ")"; void w.offsetWidth; w.style.transition = red ? "none" : "transform .95s cubic-bezier(.22,1,.36,1) " + (d0 + j * st).toFixed(3) + "s"; w.style.transform = "none"; }
        else { w.style.transition = red ? "none" : "transform .5s cubic-bezier(.87,0,.13,1) " + (j * 0.008).toFixed(3) + "s"; w.style.transform = mode === "below" ? "translateY(115%)" : "translateY(" + (dir > 0 ? "-115%" : "115%") + ")"; }
      });
      el.style.pointerEvents = mode === "in" ? "auto" : "none";
    });
  }
  private textPos(r: number, cur: number): number {
    const on = this.rOn ? r > 0.25 : r > 0.35; this.rOn = on;
    const p = on ? 5 : cur;
    if (p !== this.pos) { this.swap(this.pos, p); this.pos = p; }
    return p;
  }

  tick(t: number): void {
    const g = this.geo; if (!g || !this.root) return;
    const e = this.e, W = window.innerWidth, H = window.innerHeight, R = range, S = smooth, IO = inOut;
    const wrap = this.q("[data-s4-wrap]"); if (!wrap) return;
    const rc = wrap.getBoundingClientRect(), EX = e.t45Ex, q = Math.max(0, Math.min(1, -rc.top / Math.max(1, rc.height - H - EX)));
    e.set(e.el("sec4", "[data-s4-wrap] > section"), "visibility", rc.top > 0.5 ? "hidden" : "visible");
    // the gradients draw only while 04 is on screen (README › Performance); render(t) depends on t alone, so the first visible frame is the same as v5's
    const vis = rc.top <= 0.5 && rc.bottom > 0;
    // the 4 arrives where 03 → 04 left it, moves to the left edge (q 0.05–0.18), then morphs 1 → 2 → 3 → 4 as the options pass
    const k = H / 1624, ox = (W - 2280 * k) / 2, start = ox + 336 * k, m = IO(R(q, 0.05, 0.18));
    const P0 = (s: number) => ({ x: L(start, g.nx, s), y: L(0, g.nTop, s), sc: L(1, g.sc, s) });
    const s1 = IO(R(q, 0.34, 0.44)), s2 = IO(R(q, 0.5, 0.6)), s3 = IO(R(q, 0.66, 0.76));
    let a = 4, b = 1, sv = m, first = true;
    if (s3 > 0) { a = 3; b = 4; sv = s3; first = false; } else if (s2 > 0) { a = 2; b = 3; sv = s2; first = false; } else if (s1 > 0) { a = 1; b = 2; sv = s1; first = false; }
    this.setNum(this.shape(a, b, sv), first ? P0(sv) : { x: g.nx, y: g.nTop, sc: g.sc });
    // "Your" and "Options" step aside as the 4 moves
    const yo = S(R(q, 0.05, 0.12)), wy = this.q("[data-w-your]"), wo = this.q("[data-w-options]");
    if (wy) { wy.style.opacity = (1 - yo).toFixed(3); wy.style.transform = "translateX(" + (-yo * 80).toFixed(1) + "px)"; }
    if (wo) { wo.style.opacity = (1 - yo).toFixed(3); wo.style.transform = "translateX(" + (yo * 80).toFixed(1) + "px)"; }
    if (this.mesh && vis) this.mesh.render(t);
    const es = WIN.map((w) => S(R(q, w[0], w[1]))), ph = es[0] + es[1] + es[2] + es[3], rr = S(R(q, REC[0], REC[1]));
    let cur = 0;
    es.forEach((x, i) => { if (x > (i < this.cur ? 0.4 : 0.6)) cur = i + 1; }); this.cur = cur;
    if (this.gga && !e.reduced) this.gga.setAttribute("gradientTransform", "translate(" + (Math.sin(t * 0.00021) * 26).toFixed(2) + " 0) rotate(" + (Math.sin(t * 0.00033) * 38).toFixed(2) + " 90 130)");
    this.tickCross(ph, rr, t, vis);
  }

  private tickCross(ph: number, r: number, t: number, vis: boolean): void {
    const c = this.lc; if (!c) return;
    const e = this.e, R = range, S = smooth, IO = inOut;
    // each step: the cross holds for the first and last 30% and moves in the middle 40%, so every option gets a real rest
    const C = c.C, gl = ph <= 1 ? ph : ph >= 4 ? 4 : Math.floor(ph) + R(ph - Math.floor(ph), 0.3, 0.7);
    let px: number, py: number;
    if (ph <= 1) { px = C[0][0]; py = C[0][1]; } else if (ph >= 4) { px = C[3][0]; py = C[3][1]; } else { const sg = Math.floor(ph), f = IO(R(ph - sg, 0.3, 0.7)); px = L(C[sg - 1][0], C[sg][0], f); py = L(C[sg - 1][1], C[sg][1], f); }
    const ir = IO(r); px = L(px, c.CR[0], ir); py = L(py, c.CR[1], ir);
    const grow = S(R(ph, 0, 0.9)), h2 = c.th / 2;
    const d = RC(px - h2, py - py * grow, px + h2, py + (c.H - py) * grow) + RC(px - (px - c.L0) * grow, py - h2, px + (c.W - px) * grow, py + h2);
    e.set(this.q("[data-cwrap]"), "clipPath", grow > 0.001 ? "path('" + d + "')" : "inset(100%)");
    if (this.cmesh && grow > 0.001 && vis) this.cmesh.render(t);
    const LA = c.lays, op = S(R(ph, 0.25, 0.95));
    let ga: number, gb: number, fm: number;
    if (ph <= 1) { ga = 0; gb = 0; fm = 0; } else if (ph >= 4) { ga = 3; gb = 3; fm = 0; } else { const sg2 = Math.floor(ph); ga = sg2 - 1; gb = sg2; fm = IO(R(ph - sg2, 0.3, 0.7)); }
    // the text leaves as a move starts and the next arrives once it has ended
    const win = (o: number) => (o === 1 ? [0.92, 1.28] : o === 4 ? [3.72, 99] : [o - 0.28, o + 0.28]), prev = this.ccur || 0;
    let cc = 0;
    if (prev && ph >= win(prev)[0] - 0.03 && ph <= win(prev)[1] + 0.03) cc = prev; else for (let o = 1; o <= 4; o++) { const w = win(o); if (ph >= w[0] && ph <= w[1]) { cc = o; break; } }
    this.ccur = cc;
    this.textPos(r, cc);
    if (!LA) return;
    this.qa("[data-cq]").forEach((qd, i) => {
      const x0 = i % 2 ? px + h2 : c.L0, x1 = i % 2 ? c.W : px - h2, y0 = i < 2 ? 0 : py + h2, y1 = i < 2 ? py - h2 : c.H;
      e.set(qd, "left", x0.toFixed(1) + "px"); e.set(qd, "top", y0.toFixed(1) + "px"); e.set(qd, "width", Math.max(0, x1 - x0).toFixed(1) + "px"); e.set(qd, "height", Math.max(0, y1 - y0).toFixed(1) + "px"); e.set(qd, "opacity", op.toFixed(3));
      const A0 = LA[i][ga], A1 = LA[i][gb], G = LA[i][4], lp = (k: keyof Lay) => L(L(A0[k] as number, A1[k] as number, fm), G[k] as number, ir);
      const a = (gl < 1 ? (i === 0 ? gl : 0) : Math.max(0, 1 - Math.abs(gl - (i + 1)))) * (1 - r);
      const cg = qd.querySelector<HTMLElement>("[data-cg]")!, rg = +(cg.getAttribute("data-r") || 1) || 1, dh = lp("dh");
      e.set(cg, "height", dh.toFixed(1) + "px"); e.set(cg, "width", (dh * rg).toFixed(1) + "px"); e.set(cg, "transform", "translate(" + lp("dx").toFixed(1) + "px, " + lp("dy").toFixed(1) + "px)");
      const ct = qd.querySelector<HTMLElement>("[data-ct]")!, m = lp("ink");
      e.set(ct, "fontSize", lp("fs").toFixed(2) + "px"); e.set(ct, "maxWidth", Math.max(40, lp("mw")).toFixed(1) + "px"); e.set(ct, "textAlign", lp("right") > 0.5 ? "right" : "left");
      e.set(ct, "color", "rgb(" + Math.round(154 - 134 * m) + ", " + Math.round(160 - 137 * m) + ", " + Math.round(166 - 138 * m) + ")");
      e.set(ct, "transform", "translate(" + lp("tx").toFixed(1) + "px, " + lp("ty").toFixed(1) + "px)");
      const cb = qd.querySelector<HTMLElement>("[data-cbody]")!, bp = LA[i][i];
      e.set(cb, "width", bp.bwid!.toFixed(1) + "px"); e.set(cb, "transform", "translate(" + bp.bx!.toFixed(1) + "px, " + bp.by!.toFixed(1) + "px) scale(" + (bp.bsc || 1).toFixed(4) + ")"); e.set(cb, "opacity", S(R(a, 0.78, 0.94)).toFixed(3)); e.set(cb, "pointerEvents", a > 0.9 ? "auto" : "none");
    });
  }
}
