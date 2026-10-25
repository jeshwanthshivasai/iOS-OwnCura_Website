/* 03 Why doctors sell, as in v5's tick: pinned; the three reasons travel along the arc one at a time; the third lands centred, then the stage releases into the priced line and the quote.
   The stage's last 320vh carry 03 → 04 (v5 t34); until that step is built, `t34` holds its rest state, so the dome, the arc and the quote stay as they are at the end of 03. */
import type { Engine } from "./engine";
import { clamp, range, smooth } from "./math";
import { MeshGradient } from "../gl/mesh-gradient";

/** What 03 → 04 hands back to 03 each frame (v5 t34's return): the dome's shift, the arc's visibility and opacity, the dome's clip, the quote's opacity, and whether the dome still renders. */
export interface T34State { dy: number; arcV: string; arcO: number; dclip: string; qO: number; domeR: boolean }

export class S3Motion {
  private s3On = false;
  private domeMesh: MeshGradient | null = null;
  private domeKey = "";
  private readonly revealed = new WeakSet<HTMLElement>();

  constructor(private readonly e: Engine) {}

  destroy(): void { if (this.domeMesh) this.domeMesh.destroy(); }

  /** 03 → 04 at rest (mt 0): the dome under its horizon at 0.46 of the height, the arc visible, the quote unveiled. The next step of the build order replaces this with v5's t34. */
  private t34(mt: number, vw: number, vh: number): T34State {
    void mt;
    const T0 = vh * 0.46, h = vh * 0.2;
    const dclip = "path('M0 " + (T0 + h).toFixed(1) + " Q" + (vw / 2).toFixed(1) + " " + (T0 - h).toFixed(1) + " " + vw + " " + (T0 + h).toFixed(1) + " L" + vw + " " + (vh * 1.6).toFixed(1) + " L0 " + (vh * 1.6).toFixed(1) + " Z')";
    return { dy: 0, arcV: "visible", arcO: 1, dclip, qO: 1, domeR: true };
  }

  tick(time: number): void {
    const e = this.e, vh = window.innerHeight, vw = window.innerWidth, r = range, sm = smooth;
    void time;
    const w3 = e.el("s3wrap", "[data-s3-wrap]"); if (!w3) return;
    const S3 = e.prog(w3, vh);
    if (!(S3.on || this.s3On)) return;
    this.s3On = S3.on; const y3 = -S3.r.top, p3 = clamp(y3 / (3.2 * vh), 0, 1), M = this.t34(clamp((y3 - 3.2 * vh) / (3.2 * vh), 0, 1), vw, vh);
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
