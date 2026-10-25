/* 04 → 05 (setting A, "Into the 4, out of the square"), as v5's t45: over an extra 300vh hold at the end of 04 (t 0–1). The cards fade under a veil, the 4 grows about its stem until its gradient fills
   the screen, then the gradient pulls back into 05's square. Meanwhile 05 rises under the veil, pins at t 0.45, and its own timeline waits 165vh. Off with reduced motion. */
import type { Engine } from "./engine";
import { clamp, range, smooth } from "./math";
import { MeshGradient } from "../gl/mesh-gradient";

const P4: [number, number][] = [[67, 0], [127.748, 0], [97.6904, 106.061], [82.6621, 159.09], [164.198, 159.09], [164.198, 268], [112.381, 268], [112.381, 212.12], [0, 212.12]];
const C4 = [146.101, 109.993, 36.7134];
const MESH = { intensity: 1, scale: 1.6, speed: 1, resolution: 0.5, seed: 11, colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"] as [string, string, string, string] };
const F = (v: number) => v.toFixed(1);

/** A polygon and an optional circle as one clip path (v5 t45Path). */
function t45Path(pts: number[][], c?: number[]): string {
  let d = "M" + pts.map((p) => F(p[0]) + " " + F(p[1])).join("L") + "Z";
  if (c && c[2] > 0.05) d += " M" + F(c[0] - c[2]) + " " + F(c[1]) + " a" + F(c[2]) + " " + F(c[2]) + " 0 1 0 " + F(2 * c[2]) + " 0 a" + F(c[2]) + " " + F(c[2]) + " 0 1 0 " + F(-2 * c[2]) + " 0 Z";
  return "path('" + d + "')";
}

export class T45Motion {
  private key: string | null = null;
  private bMesh: MeshGradient | null = null;
  private fMesh: MeshGradient | null = null;

  constructor(private readonly e: Engine) {}

  destroy(): void { if (this.bMesh) this.bMesh.destroy(); if (this.fMesh) this.fMesh.destroy(); }

  /** Runs first in each frame: it also sets the hold's length (t45Ex) and the next stage's wait (t45D) that 04, the nav and the anchors read. */
  tick(time: number): void {
    const e = this.e, vw = window.innerWidth, vh = window.innerHeight, on = !e.reduced;
    e.t45Ex = on ? 3 * vh : 0; e.t45D = on ? 1.65 * vh : 0;
    const ov = e.el("t45", "[data-t45]"), w4 = e.el("s4wrap45", "[data-s4-wrap]"), g4 = e.s4.geometry;
    const hide = () => { if (ov && ov.style.visibility !== "hidden") ov.style.visibility = "hidden"; };
    if (!ov || !w4 || !g4 || !on) return hide();
    const rc = w4.getBoundingClientRect(), Ex = e.t45Ex, t = clamp((-rc.top - (rc.height - vh - Ex)) / Ex, 0, 1);
    if (t <= 0 || t >= 0.9) return hide();
    ov.style.visibility = "visible";
    const r = range, sm = smooth, E = (x: number) => x * x * (3 - 2 * x), kn = vh / 268, k4 = kn * g4.sc;
    const bm = e.el<HTMLCanvasElement>("t45bm", "[data-t45-bmesh]"), fm = e.el<HTMLCanvasElement>("t45fm", "[data-t45-full]"), box = e.el("t45box", "[data-t45-box]"), veil = e.el("t45veil", "[data-t45-veil]"), flat = e.el("t45flat", "[data-t45-flat]");
    const key = vw + "x" + vh + "x" + g4.sc;
    if (this.key !== key) {
      this.key = key;
      if (bm) { if (!this.bMesh) this.bMesh = new MeshGradient(bm, MESH); else this.bMesh.resize(); }
      if (fm) { if (!this.fMesh) this.fMesh = new MeshGradient(fm, MESH); else this.fMesh.resize(); }
      if (box) box.style.clipPath = t45Path(P4.map((p) => [p[0] * kn, p[1] * kn]), [C4[0] * kn, C4[1] * kn, C4[2] * kn]);
    }
    // where 05's square rests once 05 is pinned (v5's own estimate if the square is not laid out)
    const sec5 = e.el("sec5", "[data-h-wrap] > section"), sqe = e.el("sq5", "[data-s5-sq]");
    let sq: { x: number; y: number; s: number };
    if (sqe && sqe.offsetWidth > 0 && sec5) { const a = sqe.getBoundingClientRect(), b = sec5.getBoundingClientRect(); sq = { x: a.left, y: a.top - b.top, s: a.width }; }
    else { const T = clamp(vw * 0.05, 32, 96); sq = { x: vw * 0.104, y: 176 + 0.15 * T, s: 0.75 * T }; }
    const cx = sq.x + sq.s / 2, cy = sq.y + sq.s / 2;
    const sqPath = (h: number) => "path('M" + F(cx - h) + " " + F(cy - h) + "H" + F(cx + h) + "V" + F(cy + h) + "H" + F(cx - h) + "Z')";
    // the 4 grows about its stem until its gradient fills the screen
    const ax = g4.nx + 138 * k4, ay = g4.nTop + 185.6 * k4;
    const Smax = 1.01 * Math.max((vw - ax) / (26.2 * k4), ay / (26.5 * k4), (vh - ay) / (26.5 * k4), ax / (138 * k4), 1.05);
    const S = Math.exp(Math.log(Smax) * E(r(t, 0.08, 0.4))), kk = k4 * S;
    e.set(veil, "opacity", t < 0.47 ? sm(r(t, 0, 0.1)).toFixed(3) : "0");
    e.set(box, "opacity", t < 0.47 ? sm(r(t, 0, 0.05)).toFixed(3) : "0");
    e.set(box, "transform", "translate(" + F(ax - 138 * kk) + "px, " + F(ay - 185.6 * kk) + "px) scale(" + (g4.sc * S).toFixed(5) + ")");
    // then the gradient pulls back into the square
    const S2max = (1.02 * 2 * Math.max(cx, vw - cx, cy, vh - cy)) / sq.s, h = (sq.s / 2) * Math.exp(Math.log(S2max) * (1 - E(r(t, 0.48, 0.88))));
    e.set(fm, "opacity", sm(r(t, 0.4, 0.46)).toFixed(3));
    e.set(fm, "clipPath", t < 0.48 ? "none" : sqPath(h));
    e.set(flat, "clipPath", "none"); e.set(flat, "backgroundSize", "100% 100%"); e.set(flat, "backgroundPosition", "0 0");
    e.set(flat, "left", F(cx - h) + "px"); e.set(flat, "top", F(cy - h) + "px"); e.set(flat, "width", F(2 * h) + "px"); e.set(flat, "height", F(2 * h) + "px");
    e.set(flat, "opacity", sm(r(t, 0.76, 0.88)).toFixed(3));
    if (this.bMesh && t < 0.47) this.bMesh.render(time);
    if (this.fMesh && t > 0.4) this.fMesh.render(time);
  }
}
