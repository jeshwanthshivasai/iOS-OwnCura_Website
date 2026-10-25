/* The footer (v5's footer block of the 05-to-close stage, layoutFoot and initFootDots). It comes in after the close's 80vh rest:
   the close line dissolves into the band (q 0.915–0.945); the description, the "Not an owner yet?" card and the links come up in the H's upper counter (q 0.92–0.955);
   the dotted name appears in the lower one (q 0.925–0.955) and lights left to right (q 0.945–0.99); then the small print (q 0.975–1). */
import type { Engine } from "./engine";
import { frameUW } from "./geometry";
import { WordDots, wordFit } from "../gl/word-dots";

export class FootMotion {
  private key: string | null = null;
  private cvBar: CanvasRenderingContext2D | null = null;
  private cvFoot: CanvasRenderingContext2D | null = null;
  private dots: WordDots | null = null;

  constructor(private readonly e: Engine) {}

  /** The footer's measures, per screen size (v5 layoutFoot): the upper counter is the designer's 1440 × 900 frame scaled to fit; the name fills the lower counter's width. */
  layout(Wv: number, Hv: number): void {
    const key = Wv + "x" + Hv + "|" + (document.fonts ? document.fonts.status : "") + "|f2"; if (key === this.key) return; this.key = key;
    const e = this.e, face = e.fonts.fs, uw = frameUW(Wv), M = Wv * 0.02, cw = Wv - 2 * (uw + M), fs = Math.min(Wv / 1440, Hv / 900);
    const fi = e.q("[data-fu-in]"); if (fi) { fi.style.width = (cw / fs).toFixed(2) + "px"; fi.style.transform = "scale(" + fs.toFixed(4) + ")"; }
    // the description at the size that makes its line and its text exactly as wide as the card
    const card = e.q("[data-fu-card]"), de = e.q("[data-fu-desc]");
    if (card && de) {
      const bar = e.q("[data-fu-bar]"), bw = bar ? bar.offsetWidth : 4; de.style.fontSize = "22.23px"; const have = de.offsetWidth, want = card.offsetWidth - bw - 11; if (have > 0 && want > 0) de.style.fontSize = ((22.23 * want) / have).toFixed(3) + "px";
      // the line runs from the top of the capitals to the baseline
      if (bar) {
        const fD = parseFloat(de.style.fontSize), g2 = this.cvBar || (this.cvBar = document.createElement("canvas").getContext("2d"));
        if (g2) {
          g2.font = "500 " + fD + "px " + face; const mH = g2.measureText("H"), cap = mH.actualBoundingBoxAscent; let top = 0;
          if (!(window.CSS && CSS.supports && CSS.supports("text-box", "trim-both cap text"))) top = (1.1 * fD - (mH.fontBoundingBoxAscent + mH.fontBoundingBoxDescent)) / 2 + mH.fontBoundingBoxAscent - cap;
          bar.style.alignSelf = "flex-start"; bar.style.marginTop = top.toFixed(2) + "px"; bar.style.height = cap.toFixed(2) + "px";
        }
      }
    }
    // the name: as wide as the counter's content, never taller than 80% of the room between the band and the rule, centred in that room
    const we = e.q("[data-foot-word]"); if (!we) return;
    const g = this.cvFoot || (this.cvFoot = document.createElement("canvas").getContext("2d")); if (!g) return;
    g.font = "600 100px " + face; if ("letterSpacing" in g) g.letterSpacing = "-4.5px";
    const m = g.measureText("OwnCura"), iw = Math.max(1, m.actualBoundingBoxLeft + m.actualBoundingBoxRight), ih = Math.max(1, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent), room = Hv * (1 - 0.603 - 0.0711);
    let fN = (100 * cw) / iw; if ((fN * ih) / 100 > room * 0.8) fN = (100 * room * 0.8) / ih;
    const ww = (iw * fN) / 100, wh = (ih * fN) / 100; wordFit.set(we, { fs: fN, ink: true });
    we.style.left = (M + (cw - ww) / 2).toFixed(1) + "px"; we.style.right = "auto"; we.style.width = ww.toFixed(1) + "px"; we.style.top = ((room - wh) / 2).toFixed(1) + "px"; we.style.height = wh.toFixed(1) + "px";
    if (this.dots) this.dots.resize();
  }

  /** The dotted name's field, made the first time the name shows (v5 initFootDots). */
  private initDots(): void {
    const e = this.e, fc = e.q<HTMLCanvasElement>("[data-foot-dots]"), we = e.q("[data-foot-word]"); if (!fc) return;
    this.key = null; this.layout(window.innerWidth, window.innerHeight);
    this.dots = new WordDots(fc, { wordEl: we, noField: true, face: e.fonts.fs });
  }

  tick(q: number, time: number, Wv: number, Hv: number, Rg: (v: number, a: number, b: number) => number, Sm: (v: number) => number): void {
    const e = this.e;
    // the close line dissolves into the band as the footer comes in
    { const cv = Sm(Rg(q, 0.915, 0.945)), cle = e.el("closeline", "[data-close-line]"); e.set(cle, "opacity", (1 - cv).toFixed(3)); e.set(cle, "filter", cv > 0.001 ? "blur(" + (cv * 8).toFixed(2) + "px)" : "none"); }
    this.layout(Wv, Hv);
    const fu = Sm(Rg(q, 0.92, 0.955)), fuE = e.el("fu", "[data-fu]"); e.set(fuE, "opacity", fu.toFixed(3)); e.set(fuE, "transform", "translateY(" + ((1 - fu) * 14).toFixed(1) + "px)"); e.set(fuE, "pointerEvents", fu > 0.6 ? "auto" : "none");
    // the links now live in the footer, so the nav's own links step aside (heroLinks is off, so the nav has none and this finds nothing, as v5's hidden links change nothing)
    const hlk = e.el("herolinks", "[data-hero-links]"); e.set(hlk, "opacity", (1 - fu).toFixed(3)); e.set(hlk, "visibility", fu > 0.98 ? "hidden" : "visible");
    const nm = Sm(Rg(q, 0.925, 0.955)), ftb = e.el("foot", "[data-foot]"); e.set(ftb, "opacity", nm.toFixed(3));
    e.set(e.el("footsmall", "[data-foot-small]"), "opacity", Sm(Rg(q, 0.975, 1)).toFixed(3));
    if (nm > 0.002) { if (!this.dots) this.initDots(); if (this.dots) { this.dots.map = Sm(Rg(q, 0.945, 0.99)); this.dots.fade = 1; this.dots.render(time); } }
  }

  destroy(): void { if (this.dots) this.dots.destroy(); this.dots = null; }
}
