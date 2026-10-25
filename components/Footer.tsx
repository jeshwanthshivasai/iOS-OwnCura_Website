"use client";

import type { MouseEvent } from "react";
import { plusOn, plusOff } from "@/lib/owner";
import styles from "./Footer.module.css";

/* The footer (v5's 7a, inside the close's layer). The upper counter holds the description, the "Not an owner yet?" card and the links; the lower one the dotted name
   (drawn by the engine into [data-foot-dots] over [data-foot-word]) and the small print. The engine lays it out per screen size and brings it in as the close line dissolves.
   Every + becomes an H: the card's link parts its plus on hover, and each footer link's mark turns from a + into an H. */

// v5's 7a link mark: one gradient shape, a + at rest and an H on hover
const MARK_P = "polygon(4.8px 0px, 7.2px 0px, 7.2px 4.8px, 4.8px 4.8px, 4.8px 0px, 7.2px 0px, 7.2px 4.8px, 12px 4.8px, 12px 7.2px, 7.2px 7.2px, 7.2px 12px, 4.8px 12px, 4.8px 7.2px, 7.2px 7.2px, 7.2px 12px, 4.8px 12px, 4.8px 7.2px, 0px 7.2px, 0px 4.8px, 4.8px 4.8px)";
const MARK_H = "polygon(0px 0px, 2.4px 0px, 2.4px 4.8px, 9.6px 4.8px, 9.6px 0px, 12px 0px, 12px 4.8px, 12px 4.8px, 12px 7.2px, 12px 7.2px, 12px 12px, 9.6px 12px, 9.6px 7.2px, 2.4px 7.2px, 2.4px 12px, 0px 12px, 0px 7.2px, 0px 7.2px, 0px 4.8px, 0px 4.8px)";
const markOn = (e: MouseEvent<HTMLAnchorElement>) => { const m = e.currentTarget.querySelector<HTMLElement>("[data-mk]"); if (m) m.style.clipPath = MARK_H; };
const markOff = (e: MouseEvent<HTMLAnchorElement>) => { const m = e.currentTarget.querySelector<HTMLElement>("[data-mk]"); if (m) m.style.clipPath = MARK_P; };

// the links and where the engine scrolls each to (v5 goHow, goPractices, goTop, goVal, goContact)
const LINKS: [string, string, string][] = [["#how", "how", "How it works"], ["#practices", "practices", "Practices"], ["#top", "top", "Who we are?"], ["#valuation", "val", "Owners"], ["#contact", "contact", "Contact Us"]];

export default function Footer() {
  return (
    <>
      <div data-fu="" className={styles.fu}>
        <div data-fu-in="" className={styles.fuIn}>
          <div className={styles.descRow}><div data-fu-bar="" aria-hidden="true" className={styles.bar} /><p data-fu-desc="" className={styles.desc}>The Ownership Infrastructure for American Healthcare Practices.</p></div>
          <div data-fu-card="" className={styles.card}>
            <div className={styles.cardHead}><div aria-hidden="true" className={styles.cardSquare} /><h3 className={styles.cardTitle}>Not an owner yet?</h3></div>
            <p className={styles.cardText}><span className={styles.line}>Everything above assumes a practice you already have. If you are starting one instead, we do</span><span className={styles.line}>that too — site, licensing, staffing, systems — and the same operators run it with you afterwards.</span></p>
            <a href="#contact" data-go="contact" onMouseEnter={(e) => plusOn(e.currentTarget)} onMouseLeave={(e) => plusOff(e.currentTarget)} className={styles.cta}>
              <span className={styles.ctaLabel}>Start a practice</span>
              <span aria-hidden="true" className={styles.ctaPlusBox}>
                <span className={styles.ctaPlus}><span className={styles.ctaPlusH} /><span data-pl="" className={styles.ctaPlusV} /><span data-pr="" className={styles.ctaPlusV} /></span>
              </span>
            </a>
          </div>
          <nav data-fl-a="" aria-label="Footer" className={styles.links}>
            {LINKS.map(([href, go, label]) => (
              <a key={go} href={href} data-go={go} onMouseEnter={markOn} onMouseLeave={markOff} className={styles.link}>
                <span data-mk="" aria-hidden="true" className={styles.mark} /><span className={styles.linkLabel}>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div data-foot="" className={styles.foot}>
        <canvas data-foot-dots="" aria-hidden="true" className={styles.dots} />
        <div data-foot-word="" role="img" aria-label="OwnCura" className={styles.word} />
        <div data-foot-small="" className={styles.small}>
          <div aria-hidden="true" className={styles.rule} />
          <div className={styles.smallRow}><span>© 2026 OwnCura</span><a href="https://independenceos.ai" target="_blank" rel="noreferrer" className={styles.ios}>An Independence OS company ↗</a></div>
        </div>
      </div>
    </>
  );
}
