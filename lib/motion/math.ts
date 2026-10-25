/* The page's easing and interpolation helpers, as in v5's owncura-landing-v2.js (OC.clamp, OC.lerp, OC.range, OC.smooth, OC.expoOut, OC.quintOut, OC.inOut). */

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** Where p sits between a and b, held to 0–1. */
export const range = (p: number, a: number, b: number): number => clamp((p - a) / (b - a), 0, 1);
export const smooth = (t: number): number => t * t * (3 - 2 * t);
export const expoOut = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const quintOut = (t: number): number => 1 - Math.pow(1 - t, 5);
export const inOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
