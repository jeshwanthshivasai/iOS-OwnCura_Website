/* 03 Why doctors sell, as in v5's tick: pinned; the three reasons travel along the arc one at a time; the third lands centred, then the stage releases into the priced line and the quote.
   03 → 04 (v5 t34) over the stage's last 320vh, and the reveal words (v5 placeWords). */
import type { Engine } from "./engine";
import { clamp, range, smooth } from "./math";
import { MeshGradient } from "../gl/mesh-gradient";
import { FOUR_STRENGTH } from "../settings";

/** The 4 as v5 draws it (the designer's numeral, 268 units tall): nine points and the circle at (146.101, 109.993), radius 36.7134. */
const P4: [number, number][] = [[67, 0], [127.748, 0], [97.6904, 106.061], [82.6621, 159.09], [164.198, 159.09], [164.198, 268], [112.381, 268], [112.381, 212.12], [0, 212.12]];

export interface T34State { dy: number; arcV: string; arcO: number; dclip: string; qO: number; domeR: boolean }

/** The 4's geometry for one screen size: kn units → px, x0 where the 4 rests in 04, (ax, ay) the anchor it grows about, lSc the log of its largest scale. */
interface T34Geo { key: string; kn: number; x0: number; ax: number; ay: number; lSc: number }

export class S3Motion {
  private s3On = false;
  private domeMesh: MeshGradient | null = null;
  private domeKey = "";
  private readonly revealed = new WeakSet<HTMLElement>();
  private t34g: T34Geo | null = null;
  private t4Mesh: MeshGradient | null = null;
  private wKey: string | null = null;
  private wFontHook = false;
  private readonly bust = () => { this.wKey = null; };

  constructor(private readonly e: Engine) {}

  destroy(): void {
    if (this.domeMesh) this.domeMesh.destroy();
    if (this.t4Mesh) this.t4Mesh.destroy();
    if (this.wFontHook && document.fonts) document.fonts.removeEventListener("loadingdone", this.bust);
  }

  /** 03 → 04, one continuous move over the last 320vh of 03 (timings in vh of scroll): the reasons, heading and quote fade; the dome rises with its lit edge at about scroll speed; while its corners are still leaving the top, the 4's first edge comes in and the gradient pulls back into the 4 at a steady zoom. The 4's own gradient fades in while the shape still fills the screen and zooms out with it, so the 4 that settles is the one 04 starts with; "Your" and "Options" arrive as it settles, and 04 takes over on that frame. */
  private t34(mt: number, vw: number, vh: number, time: number): T34State {
    const e = this.e, r = range, sm = smooth, red = e.reduced, at = (a: number, b: number) => r(mt * 320, a, b);
    // a trapezoid speed profile: accelerates over the first a, coasts, decelerates over the last b
    const TR = (x: number, a: number, b: number) => { const v = 1 / (1 - a / 2 - b / 2); return x < a ? (v * x * x) / (2 * a) : x > 1 - b ? 1 - (v * (1 - x) * (1 - x)) / (2 * b) : v * (x - a / 2); };
    const bx = e.el("t4box", "[data-t4box]"), mc = e.el<HTMLCanvasElement>("t4mesh", "[data-t4mesh]");
    let g = this.t34g;
    if (!g || g.key !== vw + "x" + vh) {
      const k = vh / 1624, kn = vh / 268, x0 = (vw - 2280 * k) / 2 + 336 * k, ax = x0 + 138 * kn, ay = 185.6 * kn;
      g = this.t34g = { key: vw + "x" + vh, kn, x0, ax, ay, lSc: Math.log(1.01 * Math.max((vw - ax) / (26.2 * kn), ay / (26.5 * kn), (vh - ay) / (26.5 * kn), ax / (138 * kn), 1.05)) };
      if (mc) { if (!this.t4Mesh) this.t4Mesh = new MeshGradient(mc, { intensity: 1, scale: 1.6, speed: 1, resolution: 0.5, seed: 11, colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"] }); else this.t4Mesh.resize(); }
      if (bx) bx.style.clipPath = red ? this.p4(1, true) : "none";
    }
    const P0 = 0.3, p = TR(at(55, 285), 0.2, 0.35), S = Math.exp(g.lSc * (1 - (p - P0) / (1 - P0)));
    const T0 = red ? vh * 0.46 : vh * 0.46 - p * vh * 1.8, edge = T0 + vh * 0.2, fin = red ? sm(r(p, 0.45, 0.8)) : sm(r(p, 0.26, 0.5));
    e.set(e.el("t34", "[data-t34]"), "clipPath", red || p <= P0 ? "none" : this.p4(S, false));
    e.set(e.el("domeov", "[data-dome-ov]"), "opacity", (1 - sm(r(p, 0.02, 0.26))).toFixed(3));
    const dcv = e.el("domecv", "[data-dome-mesh]"); e.set(dcv, "opacity", red ? (1 - fin).toFixed(3) : "1"); e.set(dcv, "visibility", fin >= 1 ? "hidden" : "visible");
    // the 4 is filled with the living gradient (fourFill): never the flat one
    if (bx) {
      const sc = red ? 1 : S;
      e.set(bx, "visibility", fin > 0 ? "visible" : "hidden"); e.set(bx, "opacity", (fin * FOUR_STRENGTH).toFixed(3));
      e.set(bx, "transform", "translate(" + (g.ax + sc * (g.x0 - g.ax)).toFixed(2) + "px, " + (g.ay * (1 - sc)).toFixed(2) + "px) scale(" + sc.toFixed(5) + ")");
      e.set(bx, "background", "none"); e.set(mc, "display", "block");
    }
    // v5 stops at mt 1 because 04 covers 03 on that frame; until 04 is in the page, 03's 4 is the last frame and keeps its living gradient
    if (this.t4Mesh && fin > 0 && (mt < 1 || !e.el("s4host", "[data-s4]"))) this.t4Mesh.render(time);
    e.set(e.el("orbit", "[data-orbit]"), "opacity", (1 - sm(at(30, 60))).toFixed(3));
    e.set(e.el("s3dots", "[data-s3-dots]"), "opacity", (1 - sm(at(30, 57))).toFixed(3));
    e.set(e.el("s3head", "[data-s3-head]"), "opacity", (1 - sm(at(33, 64))).toFixed(3));
    const w = sm(at(260, 320)), dx = red ? 0 : (1 - w) * 80, wy = e.el("s3wy", "[data-s3-wy]"), wo = e.el("s3wo", "[data-s3-wo]");
    e.set(wy, "opacity", w.toFixed(3)); e.set(wy, "transform", "translateX(" + (-dx).toFixed(1) + "px)");
    e.set(wo, "opacity", w.toFixed(3)); e.set(wo, "transform", "translateX(" + dx.toFixed(1) + "px)");
    const h = vh * 0.2, dclip = edge > -2 ? "path('M0 " + (T0 + h).toFixed(1) + " Q" + (vw / 2).toFixed(1) + " " + (T0 - h).toFixed(1) + " " + vw + " " + (T0 + h).toFixed(1) + " L" + vw + " " + (vh * 1.6).toFixed(1) + " L0 " + (vh * 1.6).toFixed(1) + " Z')" : "none";
    e.set(e.el("t4clip", "[data-t4clip]"), "clipPath", red ? "none" : dclip);
    return { dy: Math.max(T0, -vh) - vh * 0.46, arcV: edge > -40 ? "visible" : "hidden", arcO: red ? 1 - fin : 1, dclip, qO: 1 - sm(at(37, 70)), domeR: fin < 1 };
  }

  /** The 4 as a clip path: scaled by S about its anchor on screen, or in its own box. */
  private p4(S: number, local: boolean): string {
    const g = this.t34g!, F = (v: number) => v.toFixed(1);
    const f = local ? (x: number, y: number) => [x * g.kn, y * g.kn] : (x: number, y: number) => [g.ax + S * (g.x0 + x * g.kn - g.ax), g.ay + S * (y * g.kn - g.ay)];
    const c = f(146.101, 109.993), rr = (local ? 1 : S) * 36.7134 * g.kn;
    return "path('M" + P4.map((q) => { const v = f(q[0], q[1]); return F(v[0]) + " " + F(v[1]); }).join("L") + "Z M" + F(c[0] - rr) + " " + F(c[1]) + " a" + F(rr) + " " + F(rr) + " 0 1 0 " + F(2 * rr) + " 0 a" + F(rr) + " " + F(rr) + " 0 1 0 " + F(-2 * rr) + " 0 Z')";
  }

  /** The reveal words: one gap on every side. "Your" sits the gap in from the left and the top, "Options" the gap in from the right and the bottom, measured on the letters' ink (the gap is the one in the designer's frame, 161 / 958 of the height). The ink is found by drawing each word to a canvas at the live font and scanning the pixels, so it matches what is rendered.
   *  v5 measures 04's words and places 03's copies with them; until 04 is built the copies are measured themselves (they share every style with 04's words, so their ink is the same). */
  placeWords(): void {
    const e = this.e, vw = window.innerWidth, vh = window.innerHeight;
    const w4y = e.el("w4y", "[data-w-your]"), w4o = e.el("w4o", "[data-w-options]"), s3y = e.el("s3y", "[data-s3-wy]"), s3o = e.el("s3o", "[data-s3-wo]");
    const wy = w4y && w4o ? w4y : s3y, wo = w4y && w4o ? w4o : s3o;
    if (!wy || !wo || !wy.parentNode || !wo.parentNode) return;
    if (!this.wFontHook && document.fonts) { this.wFontHook = true; document.fonts.ready.then(this.bust); document.fonts.addEventListener("loadingdone", this.bust); }
    const cs = getComputedStyle(wy), key = vw + "x" + vh + "x" + cs.fontSize + "x" + wo.offsetWidth + "x" + (document.fonts ? document.fonts.size : 0);
    if (key === this.wKey) return; this.wKey = key;
    const ink = (el: HTMLElement, text: string) => {
      const st = getComputedStyle(el), fs = parseFloat(st.fontSize), cw = Math.ceil(fs * text.length * 1.2) + 40, ch = Math.ceil(fs * 2.2), base = Math.round(fs * 1.5);
      const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
      const c = cv.getContext("2d")!;
      c.font = st.fontWeight + " " + st.fontSize + " " + st.fontFamily; (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = st.letterSpacing;
      c.fillStyle = "#000"; c.textBaseline = "alphabetic"; c.fillText(text, 20, base);
      const d = c.getImageData(0, 0, cw, ch).data; let x0 = cw, x1 = -1, y0 = ch, y1 = -1;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (d[(y * cw + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      // the baseline inside the word's own box, read from a hidden copy of it
      const cl = el.cloneNode(false) as HTMLElement;
      ["data-w-your", "data-w-options", "data-s3-wy", "data-s3-wo"].forEach((a) => cl.removeAttribute(a));
      cl.textContent = text; cl.style.cssText += ";position:absolute;left:0;top:0;visibility:hidden;transform:none;opacity:0;";
      const bl = document.createElement("span"); bl.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;"; cl.appendChild(bl);
      el.parentNode!.appendChild(cl); const blY = bl.getBoundingClientRect().top - cl.getBoundingClientRect().top; cl.remove();
      return { left: x0 - 20, right: x1 + 1 - 20, top: blY + (y0 - base), bottom: blY + (y1 + 1 - base) };
    };
    const M = vh * (161 / 958), ox = (vw - (2280 * vh) / 1624) / 2, iy = ink(wy, "Your"), io = ink(wo, "Options");
    const yl = (M - iy.left - ox).toFixed(1) + "px", yt = (M - iy.top).toFixed(1) + "px", ol = (vw - M - io.right - ox).toFixed(1) + "px", ot = (vh - M - io.bottom).toFixed(1) + "px";
    [w4y, s3y].forEach((x) => { if (x) { x.style.left = yl; x.style.top = yt; } });
    [w4o, s3o].forEach((x) => { if (x) { x.style.left = ol; x.style.top = ot; } });
  }

  tick(time: number): void {
    const e = this.e, vh = window.innerHeight, vw = window.innerWidth, r = range, sm = smooth;
    const w3 = e.el("s3wrap", "[data-s3-wrap]"); if (!w3) return;
    const S3 = e.prog(w3, vh);
    if (!(S3.on || this.s3On)) return;
    this.s3On = S3.on; const y3 = -S3.r.top, p3 = clamp(y3 / (3.2 * vh), 0, 1), M = this.t34(clamp((y3 - 3.2 * vh) / (3.2 * vh), 0, 1), vw, vh, time);
    // the heading and the sub line reveal once the stage is in view
    e.els("rv3", "[data-s3] [data-rv]").forEach((el) => { if (!this.revealed.has(el) && S3.on && S3.r.top < vh * 0.5) { this.revealed.add(el); el.style.opacity = "1"; el.style.transform = "none"; } });
    const orbit = e.el("orbit", "[data-orbit]"), arc = e.el("arc", "[data-arc]");
    const ow = orbit ? orbit.offsetWidth : vw, oh = orbit ? orbit.offsetHeight : vh * 0.52;
    // arc y for x in [0,1]: the same quadratic as the drawn path, in the orbit box: y(0)=1, y(0.5)=0 (the top of the box), y(1)=1
    const arcY = (x: number) => { const t = x; return (1 - t) * (1 - t) * 1 + 2 * (1 - t) * t * (-400 / 400) + t * t * 1; };
    const rel = sm(r(p3, 0.86, 0.95));
    const rise = sm(r(p3, 0.0, 0.05)), domeY = (1 - rise) * vh * 0.45;
    e.set(arc, "opacity", (sm(r(p3, 0.01, 0.05)) * M.arcO).toFixed(3)); e.set(arc, "transform", "translateY(" + (domeY + M.dy).toFixed(1) + "px)"); e.set(arc, "visibility", M.arcV);
    const dome = e.el("dome", "[data-dome]");
    if (dome) {
      const dcv = e.el<HTMLCanvasElement>("domecv", "[data-dome-mesh]");
      if (!this.domeMesh && dcv) this.domeMesh = new MeshGradient(dcv, { intensity: 0.9, scale: 1.3, speed: 0.8, resolution: 0.45, seed: 3, base: "#F8F8F6", colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#6FC3DF"] });
      if (this.domeMesh && this.domeKey !== vw + "x" + vh) { this.domeKey = vw + "x" + vh; this.domeMesh.resize(); }
      e.set(dome, "opacity", rise.toFixed(3)); e.set(dome, "transform", `translateY(${domeY.toFixed(1)}px)`);
      e.set(dome, "clipPath", M.dclip);
      if (this.domeMesh && S3.on && M.domeR) this.domeMesh.render(performance.now());
    }
    // one at a time: each reason enters low on the left, rides the line to the top, holds, rides down to the right and leaves before the next one enters. The third stops at the top.
    const T = [[0.04, 0.14, 0.2, 0.3], [0.3, 0.4, 0.46, 0.56], [0.56, 0.66, 0.74, 0.74]];
    const iconH = 28;
    e.els("orbs", "[data-orb]").forEach((el, i) => {
      const [a, b, c, d] = T[i];
      const up = sm(r(p3, a, b)), down = i === 2 ? 0 : sm(r(p3, c, d));
      // finale: all three ride back along the line and settle at equal intervals, notes fold away
      const gth = sm(r(p3, 0.74, 0.86)), XF = [0.18, 0.5, 0.82], X0 = [0.08, 0.08, 0.5];
      let x2 = 0.08 + 0.42 * up + 0.42 * down, vis = sm(r(p3, a, a + 0.035)) * (i === 2 ? 1 : 1 - sm(r(p3, d - 0.035, d)));
      if (p3 >= 0.74) { x2 = X0[i] + (XF[i] - X0[i]) * gth; vis = i === 2 ? 1 : sm(r(p3, 0.74, 0.78)); }
      const yv = arcY(x2), px = x2 * ow - ow / 2, py = yv * oh;
      const centred = 1 - Math.min(1, Math.abs(x2 - 0.5) * 3), sc = (0.78 + 0.22 * centred) * (1 - gth) + 0.86 * gth;
      e.set(el, "opacity", vis.toFixed(3));
      e.set(el, "transform", `translate(${px.toFixed(1)}px, ${(py - iconH).toFixed(1)}px) scale(${sc.toFixed(3)})`);
      const note = el.children[2] as HTMLElement | undefined; if (note) e.set(note, "opacity", (1 - gth).toFixed(3));
    });
    e.els("orbdots", "[data-orb-dot]").forEach((d, i) => e.set(d, "background", p3 >= 0.74 || (i === 0 && p3 > 0.04 && p3 < 0.3) || (i === 1 && p3 >= 0.3 && p3 < 0.56) || (i === 2 && p3 >= 0.56 && p3 < 0.84) ? "#FFFFFF" : "rgba(255,255,255,0.45)"));
    const subK = sm(r(p3, 0.76, 0.86)); e.set(e.el("s3sub", "[data-s3-sub]"), "opacity", (1 - subK).toFixed(3)); e.set(e.el("s3sub2", "[data-s3-sub2]"), "opacity", subK.toFixed(3));
    const after = e.el("s3after", "[data-s3-after]");
    e.set(after, "opacity", (rel * M.qO).toFixed(3)); e.set(after, "transform", `translateX(-50%) translateY(${((1 - rel) * 28).toFixed(1)}px)`); e.set(after, "pointerEvents", rel * M.qO > 0.5 ? "auto" : "none");
  }
}
