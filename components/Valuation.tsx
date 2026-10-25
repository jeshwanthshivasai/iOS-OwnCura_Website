"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { SPECS, SPEC_WORDS, DEFAULT_INPUT, calc, commas, money, valuationStore } from "@/lib/valuation";
import styles from "./Valuation.module.css";

/* 06: the H measures the practice. The designer's 3a frame at 1920 × 958 ([data-f6]); the motion engine scales it to fit and centres it, sizes the sentence to span the range,
   and moves the figures with the H's uprights as the range tightens. The doctor fills in the sentence; the forms send nothing yet (decided 23 Oct 2026). */

const TITLE: [string, boolean][] = [["See", false], ["what", false], ["your", false], ["practice", false], ["is", false], ["worth.", true]];

/** The fonts' version for the inputs' widths: 0 on the server and while hydrating (so the first client render matches the server's), 1 once mounted, and one more each time
 *  the fonts finish loading, so the widths are measured again at the real face. */
let fontVer = 1;
const fontSubs = new Set<() => void>();
function subscribeFonts(cb: () => void): () => void {
  fontSubs.add(cb);
  if (fontSubs.size === 1 && document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fontVer++; fontSubs.forEach((f) => f()); });
  return () => { fontSubs.delete(cb); };
}

/** An input's width: its text measured at the sentence's face, in em (v5 emS). Until it has measured, it falls back to v5's estimate, which is also what the server renders;
 *  it measures again once the fonts are in. */
function useEmS(): (t: string) => string {
  const ver = useSyncExternalStore(subscribeFonts, () => fontVer, () => 0);
  const cv = useRef<CanvasRenderingContext2D | null>(null);
  return useCallback((t: string) => {
    const fallback = (String(t).length * 0.55).toFixed(2) + "em";
    if (!ver) return fallback;
    try {
      if (!cv.current) cv.current = document.createElement("canvas").getContext("2d");
      const g = cv.current; if (!g) return fallback;
      const face = getComputedStyle(document.documentElement).getPropertyValue("--fs").trim() || "'Schibsted Grotesk', system-ui, sans-serif";
      g.font = "500 100px " + face;
      return (g.measureText(String(t)).width / 100 + 0.1).toFixed(3) + "em";
    } catch { return fallback; }
  }, [ver]);
}

export default function Valuation() {
  const [loc, setLoc] = useState(DEFAULT_INPUT.loc);
  const [spec, setSpec] = useState(DEFAULT_INPUT.spec);
  const [prov, setProv] = useState(DEFAULT_INPUT.prov);
  const [rev, setRev] = useState(DEFAULT_INPUT.rev);
  const [margin, setMargin] = useState<number | null>(DEFAULT_INPUT.margin);
  const [marginTxt, setMarginTxt] = useState<string | null>(null);
  const [specOpen, setSpecOpen] = useState(false);
  const emS = useEmS();
  const c = calc({ loc, spec, prov, rev, margin });
  const sp = SPECS[spec] || SPECS.Pediatrics, specLower = SPEC_WORDS[spec] || "pediatrics", revPh = commas((sp.rev / sp.p) * prov), mt = marginTxt != null ? marginTxt : String(c.margin);

  // the engine reads the inputs each frame (the H's span) and can close the list when 06 leaves the screen
  useLayoutEffect(() => { valuationStore.input = { loc, spec, prov, rev, margin }; valuationStore.specOpen = specOpen; }, [loc, spec, prov, rev, margin, specOpen]);
  useEffect(() => { valuationStore.closeSpec = () => setSpecOpen(false); return () => { valuationStore.closeSpec = () => {}; }; }, []);

  // the list closes on a pick, on a click outside it, or on Escape
  const wrapRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!specOpen) return;
    const h = (e: Event) => { const w = wrapRef.current; if (e.type === "keydown" ? (e as KeyboardEvent).key === "Escape" : !(w && w.contains(e.target as Node))) setSpecOpen(false); };
    document.addEventListener("pointerdown", h, true); document.addEventListener("keydown", h, true);
    return () => { document.removeEventListener("pointerdown", h, true); document.removeEventListener("keydown", h, true); };
  }, [specOpen]);
  const pick = (k: string) => { setSpecOpen(false); setSpec(k); setMargin(null); setMarginTxt(null); };

  // the range eases to its new figures as v5's does: a 16 ms timer from the moment of the change, cubic-out over 480 ms. The timer writes the two figures' text itself, so
  // no frame goes through React, and it writes between frames, so the engine always places the text that is painted. As in v5, the shown range starts unset: the first change
  // shows the new figures until the timer's first tick, then counts up from the old ones. With reduced motion (read once, as v5 reads it) the figures change at once.
  const loRef = useRef<HTMLDivElement>(null), hiRef = useRef<HTMLDivElement>(null), reduced = useRef(false);
  const tw = useRef<{ tLo: number; tHi: number; dLo: number | null; dHi: number | null; iv: ReturnType<typeof setInterval> | undefined }>({ tLo: c.lo, tHi: c.hi, dLo: null, dHi: null, iv: undefined });
  useLayoutEffect(() => { reduced.current = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useLayoutEffect(() => {
    const T = tw.current, show = (lo: number, hi: number) => { const a = loRef.current?.firstChild, b = hiRef.current?.firstChild; if (a) a.nodeValue = money(lo); if (b) b.nodeValue = money(hi); };
    // what v5 renders on this commit: the shown range once it is set, else the new figures (React's own text)
    if (T.dLo != null && T.dHi != null) show(T.dLo, T.dHi);
    if (Math.abs(c.lo - (T.tLo || 0)) < 1 && Math.abs(c.hi - (T.tHi || 0)) < 1) return;
    const fLo = T.dLo == null ? T.tLo || c.lo : T.dLo, fHi = T.dHi == null ? T.tHi || c.hi : T.dHi, toLo = c.lo, toHi = c.hi;
    T.tLo = toLo; T.tHi = toHi; clearInterval(T.iv);
    const set = (lo: number, hi: number) => { T.dLo = lo; T.dHi = hi; show(lo, hi); };
    if (reduced.current) { set(toLo, toHi); return; }
    const t0 = Date.now(), D = 480;
    T.iv = setInterval(() => { const k = Math.min(1, (Date.now() - t0) / D), e = 1 - Math.pow(1 - k, 3); set(fLo + (toLo - fLo) * e, fHi + (toHi - fHi) * e); if (k >= 1) clearInterval(T.iv); }, 16);
  }, [c.lo, c.hi]);
  useEffect(() => { const T = tw.current; return () => clearInterval(T.iv); }, []);

  return (
    <div data-f6="" className={styles.frame}>
      <div data-p6-title="" className={styles.titleRow}>
        <div data-s6-sq="" aria-hidden="true" className={styles.square} />
        <h2 className={styles.title}>
          {TITLE.map(([w, claim], i) => (
            <Fragment key={i}>{i > 0 ? " " : null}<span data-tw6="" {...(claim ? { "data-tclaim6": "" } : {})} className={claim ? styles.claim : styles.tw}>{w}</span></Fragment>
          ))}
        </h2>
      </div>
      {/* each run of words is one text node, as in v5: Blink rounds every run to 1/64 px, and the engine sizes the sentence from the line's whole-pixel width */}
      <p data-p6-in="" data-sent="" className={styles.sentence}>
        <span data-sl="" className={styles.line}>
          My practice is in <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="City or ZIP" placeholder="City or ZIP" className={styles.field} style={{ width: emS(loc || "City or ZIP") }} />{". It is a "}
          <span data-spec-wrap="" ref={wrapRef} className={styles.specWrap}>
            <button type="button" onClick={() => setSpecOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={specOpen ? "true" : "false"} aria-label="Specialty" className={styles.specBtn}>
              {specLower}<span aria-hidden="true" className={styles.chevron} style={{ transform: specOpen ? "translateY(0.06em) rotate(225deg)" : "translateY(-0.12em) rotate(45deg)" }} />
            </button>
            {specOpen ? (
              <span role="listbox" aria-label="Specialty" className={styles.list}>
                {Object.keys(SPECS).map((k) => (
                  <button key={k} type="button" role="option" aria-selected={k === spec ? "true" : "false"} onClick={() => pick(k)} className={styles.option}>
                    <span aria-hidden="true" className={styles.mark} style={{ background: k === spec ? "linear-gradient(135deg, #2E6CB8, #34B3A5)" : "transparent" }} />{SPEC_WORDS[k] || k.toLowerCase()}
                  </button>
                ))}
              </span>
            ) : null}
          </span>{" practice with "}<span className={styles.stepper}>
            <button type="button" onClick={() => setProv((x) => Math.max(1, x - 1))} aria-label="Fewer providers" className={styles.stepBtn}>−</button>
            <span className={styles.count}>{prov}</span>
            <button type="button" onClick={() => setProv((x) => Math.min(40, x + 1))} aria-label="More providers" className={styles.stepBtn}>+</button>
          </span>{" "}
          {prov === 1 ? "provider" : "providers"},
        </span>
        <span data-sl="" className={styles.line}>
          bringing in <input type="text" inputMode="numeric" value={rev} onChange={(e) => setRev(e.target.value)} aria-label="Annual revenue" placeholder={revPh} className={`${styles.field} ${styles.dashed}`} style={{ width: emS(rev || revPh) }} />{" a year, and I keep about "}
          <input type="text" inputMode="numeric" value={mt} aria-label="Owner's margin, percent" className={`${styles.field} ${styles.centred}`} style={{ width: emS(mt || "00") }}
            onChange={(e) => { const t = String(e.target.value).replace(/[^0-9]/g, "").slice(0, 2), n = parseInt(t, 10); setMarginTxt(t); setMargin(n >= 5 && n <= 70 ? n : null); }} />% of it.
        </span>
      </p>
      <div data-p6-in="" data-lo="" ref={loRef} className={`${styles.figure} ${styles.lo}`}>{money(c.lo)}</div>
      <div data-p6-in="" data-hi="" ref={hiRef} className={`${styles.figure} ${styles.hi}`}>{money(c.hi)}</div>
      <p data-p6-in="" data-comps="" className={styles.note}>Based on {sp.n} comparable transactions we have reviewed in {specLower} across your state. It is a starting point, not an offer.</p>
    </div>
  );
}
