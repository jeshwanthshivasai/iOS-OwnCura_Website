/* The gradient object's shapes, as in v5: unions of rectangles (and circles for the heads) written as one clip-path path(), in viewport px. */
import { lerp } from "./math";

export const RECT = (x0: number, y0: number, x1: number, y1: number): string => `M${x0.toFixed(1)} ${y0.toFixed(1)}H${x1.toFixed(1)}V${y1.toFixed(1)}H${x0.toFixed(1)}Z`;
export const CIRC = (cx: number, cy: number, r: number): string =>
  r <= 0.05 ? "" : `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0Z`;
export const L = lerp;

/** The plus is two identical halves sharing one stem: A = stem + arm to the left, B = stem + arm to the right. They slide apart by one stroke (m 0→1) and land as the H: the stems become the uprights, the two arms meet as the crossbar. The stroke never changes. part separates them further, reach extends the arms toward each other, hk raises the heads. */
export function halvesPath(cx: number, cy: number, s: number, m: number, part: number, reach: number, hk: number): string {
  const top = cy - 1.5 * s, bot = cy + 1.5 * s, a0 = cy - s / 2, a1 = cy + s / 2, r = (s / 2) * hk, hy = top - 0.3 * s - s / 2, arm = s * (1 - 0.5 * hk);
  const o = m * s + part;
  const A = { sx0: cx - 0.5 * s + o, sx1: cx + 0.5 * s + o, ax0: 0, ax1: 0 }; A.ax1 = A.sx0; A.ax0 = A.ax1 - arm - reach;
  const B = { sx0: cx - 0.5 * s - o, sx1: cx + 0.5 * s - o, ax0: 0, ax1: 0 }; B.ax0 = B.sx1; B.ax1 = B.ax0 + arm + reach;
  return RECT(A.sx0, top, A.sx1, bot) + RECT(A.ax0, a0, A.ax1, a1) + RECT(B.sx0, top, B.sx1, bot) + RECT(B.ax0, a0, B.ax1, a1) + CIRC((A.sx0 + A.sx1) / 2, hy, r) + CIRC((B.sx0 + B.sx1) / 2, hy, r);
}

/** The frame's uprights: a tenth of the width, never thinner than 150px or wider than 220px, so the logo and the CTA sit on them. */
export function frameUW(vw: number): number { return Math.min(220, Math.max(150, vw * 0.1)); }
