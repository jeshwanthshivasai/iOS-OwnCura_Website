"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
import { ownerStore, plusOn, plusOff } from "@/lib/owner";
import styles from "./Owner.module.css";

/* "Not an owner yet?" (v5's 07). The button settles on 06's dome (placed by the engine); pressing it turns its plus into a cross and the panel rises out of it,
   centred above it, over the dimmed, blurred page. A copy of the button sits exactly over the real one, above the dim, and closes the panel. The panel also closes
   on Escape, on a click on the dim, from its own link, and when 06 leaves the screen. */

const useOwnerOpen = () => useSyncExternalStore(ownerStore.subscribe, ownerStore.get, () => false);

// v5's m7 values
const m7 = (open: boolean) => ({
  clip: open ? "inset(0% 0% 0% 0%)" : "inset(100% 50% 0% 50%)", pe: (open ? "auto" : "none") as "auto" | "none", dim: open ? 1 : 0, rot: open ? "45deg" : "0deg",
  hidden: open ? "false" : "true", tab: open ? 0 : -1, btnT: open ? "opacity 0s" : "opacity 0s linear .45s",
});

/** The dome's button (v5 [data-owner-link], inside [data-olink] in 06's frame). */
export function OwnerButton() {
  const v = m7(useOwnerOpen());
  const openOwner = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.querySelectorAll<HTMLElement>("[data-pl],[data-pr]").forEach((s) => { s.style.transform = "none"; });
    ownerStore.place(); ownerStore.set(true);
  };
  return (
    <button type="button" data-owner-link="" onClick={openOwner} className={styles.btn}>
      <span className={styles.label}>Not an owner yet?</span>
      <span aria-hidden="true" className={styles.plusBox}>
        <span className={styles.plus} style={{ transform: `rotate(${v.rot})` }}>
          <span className={styles.plusH} /><span data-pl="" data-d="6" className={`${styles.plusV} ${styles.plusMove}`} /><span data-pr="" data-d="6" className={`${styles.plusV} ${styles.plusMove}`} />
        </span>
      </span>
    </button>
  );
}

/** The dim, the panel and the button's copy (v5's fixed layers at the end of the page). */
export function OwnerPanel() {
  const v = m7(useOwnerOpen());
  // Escape closes it, as v5's page-wide key handler does
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") ownerStore.set(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <div onClick={(e) => { if (e.target === e.currentTarget) ownerStore.set(false); }} className={styles.dim} style={{ opacity: v.dim, pointerEvents: v.pe }} />
      <div data-m7="" role="dialog" aria-modal="true" aria-label="Not an owner yet?" aria-hidden={v.hidden === "true"} className={styles.panel} style={{ clipPath: v.clip, pointerEvents: v.pe }}>
        <div className={styles.head}><div aria-hidden="true" className={styles.square} /><h3 className={styles.title}>Not an owner <span className={styles.yet}>yet?</span></h3></div>
        <div className={styles.body}><div aria-hidden="true" className={styles.bar} /><p className={styles.text}>Everything above assumes a practice you already have. If you are starting one instead, we do that too — site, licensing, staffing, systems — and the same operators run it with you afterwards.</p></div>
        {/* the engine scrolls to #contact (data-go) and the panel closes, as v5's goContactFromModal does */}
        <a href="#contact" data-go="contact" onClick={() => ownerStore.set(false)} onMouseEnter={(e) => plusOn(e.currentTarget)} onMouseLeave={(e) => plusOff(e.currentTarget)} className={styles.cta}>
          <span className={styles.ctaLabel}>Start a practice</span>
          <span aria-hidden="true" className={styles.ctaPlusBox}>
            <span className={styles.ctaPlus}><span className={styles.ctaPlusH} /><span data-pl="" className={styles.ctaPlusV} /><span data-pr="" className={styles.ctaPlusV} /></span>
          </span>
        </a>
      </div>
      <button type="button" data-m7-btn="" onClick={() => ownerStore.set(false)} aria-label="Close" tabIndex={v.tab} className={styles.copy} style={{ opacity: v.dim, pointerEvents: v.pe, transition: v.btnT }}>
        <span className={styles.label}>Not an owner yet?</span>
        <span aria-hidden="true" className={styles.plusBox}>
          <span className={styles.plus} style={{ transform: `rotate(${v.rot})` }}><span className={styles.plusH} /><span className={styles.plusV} /></span>
        </span>
      </button>
    </>
  );
}
