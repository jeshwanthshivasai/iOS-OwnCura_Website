/* The 05-to-close stage (v5 [data-h-wrap]): 05, 06, the close and the footer, in one pinned stage driven by its own progress q (v5 hq).
   05: centred under the nav; the title fills just ahead of the statement, then the statement word by word, the claims taking the brand gradient.
   05 → 06 (setting A): 05's square grows into a full-bleed living gradient, 06 takes 05's place underneath, then the field bends first and sinks until it rests as the dome, 06's globe.
   06: the H measures the practice. The designer's frame at 1920 × 958, scaled to fit and centred; the uprights close in as the range tightens and the figures ride them.
   The close (06 fading out from q 0.68, the H growing into the hero's frame from q 0.72) and the footer are the next steps: until then `out` and `f` stay at rest. */
import type { Engine } from "./engine";
import { clamp, lerp as L, range, smooth } from "./math";
import { RECT, frameUW } from "./geometry";
import { MeshGradient } from "../gl/mesh-gradient";
import { calc, valuationStore } from "../valuation";
import { GRADIENT_COLORS, GRADIENT_SCALE, GRADIENT_SPEED, HERO_GRADIENT } from "../settings";

const F1 = (v: number) => v.toFixed(1);

export class HMotion {
  private on = false;
  private c5key = "";
  private t6key = "";
  private fT6 = 96;
  private spanCur: number | null = null;
  private cmpTop: number | null = null;
  private boxes: Record<string, [string, number, number]> = {};
  private sentKey = "";
  private sentK = 0;
  private sentFs: number | null = null;
  private d6key = "";
  private sq56: { x: number; y: number; s: number } | null = null;
  private sq56k = "";
  private domeMesh6: MeshGradient | null = null;
  private closeMesh: MeshGradient | null = null;
  private closeMeshSize = "";
  private cmWarm = false;

  constructor(private readonly e: Engine) {}

  /** The stage's height and pull-up from the same once-read reduced-motion setting as the 04 → 05 hold, as v5's applyToggles writes them; the CSS covers the first paint. */
  boot(): void {
    const hw = this.e.q("[data-h-wrap]"); if (!hw) return;
    hw.style.marginTop = this.e.reduced ? "0px" : "-265vh"; hw.style.height = this.e.reduced ? "840vh" : "1005vh";
  }

  destroy(): void { if (this.domeMesh6) this.domeMesh6.destroy(); if (this.closeMesh) this.closeMesh.destroy(); }

  tick(time: number): void {
    const e = this.e, wh = e.el("hwrap", "[data-h-wrap]"); if (!wh) return;
    const Wv = window.innerWidth, Hv = window.innerHeight, Q = e.prog(wh, Hv);
    if (!(Q.on || this.on)) return;
    this.on = Q.on;
    const q = Q.r ? e.hq(Q.r.top, Q.r.height, Hv, e.t45D) : Q.p, Rg = range, Sm = smooth;
    const p5 = e.el("p5", "[data-p5]"), p6 = e.el("p6", "[data-p6]");
    // the field covers the screen while 06 takes 05's place underneath (sw6), then sinks back to rest (dn)
    const dn = Sm(Rg(q, 0.44, 0.515)), sw6 = q >= 0.435, turn = sw6 ? 1 : 0;
    // 05 sits centred in the space under the nav: the title and the statement move together, measured once per layout
    const t5e = e.el("t5c", "[data-s5-title]"), s5e = e.el("s5c", "[data-stmt]");
    if (s5e) {
      const k5 = Wv + "x" + Hv + "|" + (t5e ? t5e.style.display + t5e.style.top + t5e.offsetHeight : "") + "|" + s5e.style.top + "|" + s5e.offsetHeight;
      if (k5 !== this.c5key) {
        this.c5key = k5;
        const vis = t5e && getComputedStyle(t5e).display !== "none", top = vis && t5e ? t5e.offsetTop : s5e.offsetTop, bot = s5e.offsetTop + s5e.offsetHeight;
        const d5 = clamp((68.8 + Hv) / 2 - (top + bot) / 2, -Hv * 0.1, Hv * 0.2);
        [t5e, s5e].forEach((x) => { if (x) x.style.transform = "translateY(" + d5.toFixed(1) + "px)"; });
      }
    }
    e.set(p5, "visibility", sw6 ? "hidden" : "visible"); e.set(p6, "visibility", sw6 ? "visible" : "hidden");
    e.set(e.el("sd06", '[data-sdots="06"]'), "visibility", sw6 ? "visible" : "hidden");
    // the statement fills word by word over q 0.04–0.32 (v5 counts the words on screen, so a hidden copy never counts); a claim takes the gradient, the rest the ink
    const sw = e.els("sw", "[data-sw]").filter((w) => w.offsetParent !== null), n = Rg(q, 0.04, 0.32) * sw.length;
    sw.forEach((w, i) => { const on = i < n; if (w.hasAttribute("data-claim")) e.set(w, "webkitTextFillColor", on ? "transparent" : "#C9CCC7"); else e.set(w, "color", on ? "#14171C" : "#C9CCC7"); });
    // the title fills just ahead of the statement (q 0–0.05); its verbs take the gradient like the claims below
    const tw5 = e.els("tw5", "[data-tw]"), tn = Rg(q, 0, 0.05) * tw5.length;
    tw5.forEach((w, i) => { const on = i < tn; if (w.hasAttribute("data-tclaim")) e.set(w, "webkitTextFillColor", on ? "transparent" : "#C9CCC7"); else e.set(w, "color", on ? "#14171C" : "#C9CCC7"); });
    // 06 takes the pointer while it is the scene; the specialty list sits above the dome while open, and closes when 06 leaves
    e.set(p6, "pointerEvents", q > 0.5 && q < 0.7 ? "auto" : "none");
    e.set(p6, "zIndex", valuationStore.specOpen ? "4" : ""); if (valuationStore.specOpen && (q < 0.5 || q > 0.7)) valuationStore.closeSpec();
    // the close (the next step): 06 fades out over q 0.68–0.73 and the H grows into the hero's frame over q 0.72–0.86; at rest until it is built
    const out = 0, f = 0;
    e.els("p6in", "[data-p6-in]").forEach((x) => e.set(x, "opacity", (1 - out).toFixed(3)));
    e.set(e.el("p6title", "[data-p6-title]"), "opacity", (1 - out).toFixed(3));
    // 06: the designer's 3a frame at 1920 × 958, scaled to fit and centred
    const s6 = Math.min(Wv / 1920, Hv / 958), ox6 = (Wv - 1920 * s6) / 2, oyF = (Hv - 958 * s6) / 2, oy6 = (1 - turn) * Hv, o6 = 0;
    { const tf6 = "translate(" + ox6.toFixed(2) + "px," + oyF.toFixed(2) + "px) scale(" + s6.toFixed(5) + ")"; e.set(e.el("f6", "[data-f6]"), "transform", tf6); e.set(e.el("f6b", "[data-f6b]"), "transform", tf6); }
    // the title reads like 05's: the same size on screen (the frame's scale undone), and its words fill as 06 settles, "worth." taking the gradient
    { const k6 = Wv + "x" + Hv + "|true";
      if (this.t6key !== k6) {
        this.t6key = k6; this.fT6 = clamp(Wv * 0.05, 32, 96) / s6;
        const tr = e.q("[data-p6-title]"), h2 = tr && tr.querySelector("h2"), sq = e.q("[data-s6-sq]");
        if (h2) h2.style.fontSize = this.fT6.toFixed(2) + "px"; if (sq) sq.style.width = sq.style.height = (this.fT6 * 0.75).toFixed(2) + "px"; if (tr) tr.style.gap = (this.fT6 * 0.21).toFixed(2) + "px";
      } }
    { const tw6 = e.els("tw6", "[data-tw6]"), tn6 = Rg(q, 0.49, 0.545) * tw6.length; tw6.forEach((w, i) => { const on = i < tn6; if (w.hasAttribute("data-tclaim6")) e.set(w, "webkitTextFillColor", on ? "transparent" : "#C9CCC7"); else e.set(w, "color", on ? "#14171C" : "#C9CCC7"); }); }
    // the H's span follows how tight the range is: wide when little is known, closing in as revenue and margin are given (eased per frame)
    const c6 = calc(valuationStore.input), prec = (c6.hi - c6.lo) / Math.max(1, c6.hi + c6.lo), g6 = (p: number) => Math.max(0.18, Math.min(0.52, 0.2 + ((p - 0.05) / 0.11) * 0.3)), tgt = clamp((960 * g6(prec)) / g6(1 / 7), 400, 1150);
    this.spanCur = this.spanCur == null ? tgt : this.spanCur + (tgt - this.spanCur) * 0.12;
    const SP = this.spanCur, bw = 20 * s6, xl = ox6 + (960 - SP / 2) * s6, xr = ox6 + (960 + SP / 2) * s6, Y0 = oyF + 500 * s6, Y1 = oyF + 604 * s6, YB = oyF + 542 * s6;
    const lo6 = e.el("lo6", "[data-lo]"), hi6 = e.el("hi6", "[data-hi]"), cmp6 = e.el("cmp6", "[data-comps]");
    const box6 = (el: HTMLElement, k: string) => { const key = el.textContent + "|" + this.t6key + "|" + (document.fonts ? document.fonts.status : ""); if (!this.boxes[k] || this.boxes[k][0] !== key) this.boxes[k] = [key, el.offsetWidth, el.offsetHeight]; return this.boxes[k]; };
    if (lo6) { const b = box6(lo6, "lo"); e.set(lo6, "left", (960 - SP / 2 - 36 - b[1]).toFixed(1) + "px"); e.set(lo6, "top", (552 - b[2] / 2).toFixed(1) + "px"); }
    if (hi6) { const b = box6(hi6, "hi"); e.set(hi6, "left", (960 + SP / 2 + 36).toFixed(1) + "px"); e.set(hi6, "top", (552 - b[2] / 2).toFixed(1) + "px"); }
    // the note sits in the H's lower counter while it fits between the uprights, and steps under the H when they close in
    if (cmp6) { const nt = SP - 40 >= 820 ? 594 : 618; this.cmpTop = this.cmpTop == null ? nt : this.cmpTop + (nt - this.cmpTop) * 0.2; e.set(cmp6, "top", this.cmpTop.toFixed(1) + "px"); }
    // the sentence spans the range: its longer line runs from the low figure's left edge to the high figure's right edge, centred between the title and the H
    { const sent = e.el("sent6", "[data-sent]");
      if (sent && lo6 && hi6) {
        const lb = box6(lo6, "lo"), hb = box6(hi6, "hi"), want = SP + 72 + lb[1] + hb[1];
        const sk = sent.textContent + "|" + Array.from(sent.querySelectorAll("input")).map((x) => x.value).join("|") + "|" + (document.fonts ? document.fonts.status : "");
        if (sk !== this.sentKey) { const f0 = parseFloat(sent.style.fontSize) || 37.7; let w = 0; sent.querySelectorAll<HTMLElement>("[data-sl]").forEach((x) => { w = Math.max(w, x.offsetWidth); }); if (w > 0) { this.sentK = w / f0; this.sentKey = sk; } }
        if (this.sentK) {
          const fsT = clamp(want / this.sentK, 24, 60);
          this.sentFs = this.sentFs == null || Math.abs(this.sentFs - fsT) < 0.02 ? fsT : this.sentFs + (fsT - this.sentFs) * 0.25;
          const tb = 150 + 1.05 * (this.fT6 || 96), hs = 3.2 * this.sentFs;
          e.set(sent, "fontSize", this.sentFs.toFixed(2) + "px"); e.set(sent, "top", (tb + (500 - tb - hs) / 2).toFixed(1) + "px"); e.set(sent, "transform", "translateX(" + ((hb[1] - lb[1]) / 2).toFixed(1) + "px)");
        }
      } }
    // 05 → 06 (setting A): 05's square grows into a full-bleed living gradient (04 → 05 run backwards), 06 takes 05's place underneath, then the field's top edge bends into the horizon and sinks to rest as the globe under the range
    { const d6 = e.el("dome6", "[data-dome6]");
      if (d6) {
        const ed = Hv * 0.2, apexR = oyF + 690 * s6, HdR = Math.max(40, Hv - apexR), Hd = Math.ceil(Hv * 1.28 + ed), so = Sm(out);
        if (this.d6key !== Wv + "x" + Hv) { this.d6key = Wv + "x" + Hv; d6.style.height = Hd + "px"; const vl = d6.querySelector<HTMLElement>("[data-dome6-veil]"); if (vl) vl.style.height = HdR.toFixed(1) + "px"; if (this.domeMesh6) { this.domeMesh6.o.scale = (1.3 * Hd) / Hv; this.domeMesh6.resize(); } }
        const arc = (c: number) => "path('M0 " + F1(c) + " Q" + F1(Wv / 2) + " " + F1(-c) + " " + Wv + " " + F1(c) + " L" + Wv + " " + Hd + " L0 " + Hd + " Z')";
        const sqe6 = e.el("sq5", "[data-s5-sq]"), fl6 = e.el("d6flat", "[data-dome6-flat]"), vl6 = e.el("d6veil", "[data-dome6-veil]");
        let ay = 0, vis6 = false, clip = "inset(100%)";
        if (sqe6 && sqe6.style.display !== "none") {
          const k56 = Wv + "x" + Hv + "|" + this.c5key;
          if (q >= 0.3 && this.sq56k !== k56) { const sc5 = e.el("sec5", "[data-h-wrap] > section"), a = sqe6.getBoundingClientRect(), b = sc5 ? sc5.getBoundingClientRect() : { left: 0, top: 0 }; this.sq56 = { x: a.left - b.left, y: a.top - b.top, s: a.width }; this.sq56k = k56; }
          const sq = this.sq56, gq = Rg(q, 0.355, 0.43);
          if (!sw6) {
            if (sq && sq.s > 0 && gq > 0) {
              const E = (x: number) => x * x * (3 - 2 * x), cx = sq.x + sq.s / 2, cy = sq.y + sq.s / 2, h0 = sq.s / 2;
              const h = h0 * Math.exp(Math.log((1.02 * 2 * Math.max(cx, Wv - cx, cy, Hv - cy)) / sq.s) * E(gq)), x0 = cx - h, x1 = cx + h, y0 = cy - h, y1 = cy + h;
              clip = "path('M" + F1(x0) + " " + F1(y0) + "H" + F1(x1) + "V" + F1(y1) + "H" + F1(x0) + "Z')"; vis6 = true;
              // it leaves 05 as the square's own flat gradient and turns living as it grows (04 → 05 lands the other way round)
              const fo = 1 - Sm(Rg(gq, 0.02, 0.3));
              if (fl6) { e.set(fl6, "opacity", fo.toFixed(3)); if (fo > 0) { e.set(fl6, "left", F1(x0) + "px"); e.set(fl6, "top", F1(y0) + "px"); e.set(fl6, "width", F1(x1 - x0) + "px"); e.set(fl6, "height", F1(y1 - y0) + "px"); } }
            } else { clip = "inset(100%)"; vis6 = false; if (fl6) e.set(fl6, "opacity", "0"); }
            ay = 0; if (vl6) e.set(vl6, "opacity", "0");
          } else {
            // the field bends first, then sinks: its edges fall ahead of the centre until it rests as the dome
            ay = L(0, apexR, dn) + so * 0.5 * HdR; clip = arc(ed * Sm(Rg(dn, 0, 0.6))); vis6 = so < 0.999;
            if (fl6) e.set(fl6, "opacity", "0"); if (vl6) e.set(vl6, "opacity", Sm(Rg(dn, 0.15, 0.9)).toFixed(3));
          }
        }
        e.set(d6, "clipPath", clip); e.set(d6, "visibility", vis6 ? "visible" : "hidden"); e.set(d6, "opacity", (1 - so).toFixed(3)); e.set(d6, "transform", "translateY(" + ay.toFixed(1) + "px)");
        if (vis6 && !this.domeMesh6) { const c = e.q<HTMLCanvasElement>("[data-dome6-mesh]"); if (c) this.domeMesh6 = new MeshGradient(c, { intensity: 0.9, scale: (1.3 * Hd) / Hv, speed: 0.8, resolution: 0.45, seed: 3, base: "#F8F8F6", colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#6FC3DF"] }); }
        if (vis6 && this.domeMesh6) this.domeMesh6.render(time);
        // the owner button settles on the dome's centre once it is at rest
        const ol = e.el("olink6", "[data-olink]"), ob = e.el("olinkb", "[data-owner-link]"), bt = Sm(Rg(q, 0.49, 0.53));
        if (ol) { e.set(ol, "top", (((apexR + Hv) / 2 - oyF) / s6 - 26).toFixed(1) + "px"); e.set(ol, "opacity", (bt * (1 - out)).toFixed(3)); e.set(ol, "transform", "translateY(" + ((1 - bt) * 24).toFixed(1) + "px)"); }
        if (ob) e.set(ob, "pointerEvents", bt > 0.5 && q < 0.7 ? "auto" : "none");
      } }
    // the H of 06, drawn by the frame layer the close grows into the hero's frame (f, the next step)
    const cf = e.el("closeframe", "[data-close-frame]");
    if (cf) {
      if (turn <= 0.001) e.set(cf, "clipPath", "inset(100%)");
      else {
        const uw = frameUW(Wv), lr = (p: number[], p2: number[]) => RECT(L(p[0], p2[0], f), L(p[1], p2[1], f), L(p[2], p2[2], f), L(p[3], p2[3], f));
        const d = lr([xl + o6, Y0 + oy6, xl + bw + o6, Y1 + oy6], [0, 0, uw, Hv]) + lr([xr - bw + o6, Y0 + oy6, xr + o6, Y1 + oy6], [Wv - uw, 0, Wv, Hv]) + lr([xl + bw + o6, YB + oy6, xr - bw + o6, YB + bw + oy6], [uw, Hv * 0.429, Wv - uw, Hv * 0.603]);
        e.set(cf, "clipPath", "path('" + d + "')");
        if (!this.closeMesh) { const mc = e.q<HTMLCanvasElement>("[data-close-mesh]"); if (mc) { this.closeMesh = new MeshGradient(mc, { intensity: HERO_GRADIENT, scale: GRADIENT_SCALE, speed: GRADIENT_SPEED, resolution: 0.5, seed: 7, colors: GRADIENT_COLORS }); this.closeMeshSize = Wv + "x" + Hv; } }
        if (this.closeMesh) { if (this.closeMeshSize !== Wv + "x" + Hv) { this.closeMesh.resize(); this.closeMeshSize = Wv + "x" + Hv; } if (f > 0.0005 || !this.cmWarm) { this.cmWarm = true; this.closeMesh.render(time); } }
        // at rest the H is the designer's still gradient; as it grows into the close frame the living gradient takes over
        const lin = e.el("cflin", "[data-cf-lin]");
        if (lin) { e.set(lin, "opacity", (1 - Sm(Rg(f, 0.05, 0.6))).toFixed(3)); const gx0 = L(xl + o6, 0, f), gy0 = L(Y0 + oy6, 0, f), gx1 = L(xr + o6, Wv, f), gy1 = L(Y1 + oy6, Hv, f); e.set(lin, "backgroundSize", (gx1 - gx0).toFixed(1) + "px " + (gy1 - gy0).toFixed(1) + "px"); e.set(lin, "backgroundPosition", gx0.toFixed(1) + "px " + gy0.toFixed(1) + "px"); }
      }
    }
  }
}
