/* 06's valuation, as v5 computes it (calc, comps, money, commas). The figures are illustrative: README › Open items 2 asks for the formula to be confirmed with OwnCura before the site is public.
   A range, never a single number, from comparable transactions; it tightens as the doctor gives revenue and margin. */

export interface Spec { m: [number, number]; rev: number; mg: number; n: number; p: number }
export const SPECS: Record<string, Spec> = {
  "Pediatrics": { m: [2.7, 3.6], rev: 2400000, mg: 28, n: 18, p: 3 },
  "Family practice": { m: [2.5, 3.4], rev: 2100000, mg: 26, n: 23, p: 3 },
  "Internal medicine": { m: [2.6, 3.5], rev: 2300000, mg: 27, n: 15, p: 3 },
  "Dermatology": { m: [4.2, 5.8], rev: 3200000, mg: 34, n: 11, p: 3 },
  "Ophthalmology": { m: [4.5, 6.2], rev: 3800000, mg: 33, n: 9, p: 3 },
  "Orthopedics": { m: [4.0, 5.5], rev: 4100000, mg: 31, n: 12, p: 4 },
};
/** The specialty as it reads in the sentence. */
export const SPEC_WORDS: Record<string, string> = { "Pediatrics": "pediatrics", "Family practice": "family practice", "Internal medicine": "internal medicine", "Dermatology": "dermatology", "Ophthalmology": "ophthalmology", "Orthopedics": "orthopedics" };

export interface ValuationInput { loc: string; spec: string; prov: number; rev: string; margin: number | null }
export const DEFAULT_INPUT: ValuationInput = { loc: "Houston, TX", spec: "Pediatrics", prov: 3, rev: "", margin: null };

const frac = (x: number) => x - Math.floor(x);
export const money = (n: number) => "$" + (n / 1e6).toFixed(2) + "M";
export const commas = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** The multiples of the specialty's comparable transactions (a fixed pseudo-random spread per specialty). */
function comps(spec: string): number[] {
  const s = SPECS[spec]; let seed = 0;
  for (let i = 0; i < spec.length; i++) seed += spec.charCodeAt(i) * (i + 1);
  const out: number[] = [];
  for (let i = 0; i < s.n; i++) {
    const r1 = frac(Math.sin(seed + i * 12.9898) * 43758.5453), r2 = frac(Math.sin(seed + i * 78.233) * 12543.1234);
    out.push(s.m[0] - 0.35 + (s.m[1] - s.m[0] + 0.7) * ((r1 + r2) / 2));
  }
  return out;
}

export function calc(st: ValuationInput) {
  const s = SPECS[st.spec] || SPECS.Pediatrics;
  const typed = parseFloat(String(st.rev).replace(/[^0-9.]/g, ""));
  let revenue = (s.rev / s.p) * st.prov, revGiven = false;
  if (typed > 0) { revenue = typed < 100 ? typed * 1e6 : typed < 100000 ? typed * 1000 : typed; revGiven = true; }
  const marginGiven = st.margin != null, margin = marginGiven ? (st.margin as number) : s.mg, known = (revGiven ? 1 : 0) + (marginGiven ? 1 : 0);
  const sorted = comps(st.spec).sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)];
  const span = s.m[1] - s.m[0], half = [span / 2, span * 0.33, span * 0.2][known];
  const center = Math.min(s.m[1] - half, Math.max(s.m[0] + half, known ? med : (s.m[0] + s.m[1]) / 2));
  const mlo = center - half, mhi = center + half, ebitda = (revenue * margin) / 100;
  return { s, revenue, revGiven, margin, marginGiven, known, mlo, mhi, ebitda, lo: ebitda * mlo, hi: ebitda * mhi };
}

/** What 06's form shares with the motion engine, which reads it each frame (v5's frame loop reads its component's state): the inputs, whether the specialty list is open, and a way to close it. */
export const valuationStore: { input: ValuationInput; specOpen: boolean; closeSpec: () => void } = {
  input: { ...DEFAULT_INPUT },
  specOpen: false,
  closeSpec: () => {},
};
