import styles from "./Nav.module.css";

/* The nav (setting: hero nav, glass bar). It sits inside the frame in the hero and in the close, runs edge to edge on glass through 02–03 and 05–06, and is gone from the start of 03 → 04 until 05; the motion engine moves [data-hero-row] and [data-nav-glass] between those states.
   heroLinks is off: the nav's links live in the footer. The logo and the Get a valuation button remain, as in v5. */
export default function Nav() {
  return (
    <header data-nav="" className={styles.nav}>
      <div data-hero-nav="" className={styles.heroNav}>
        <div data-nav-glass="" aria-hidden="true" className={styles.glass} />
        <div data-hero-row="" className={styles.row}>
          <a href="#top" data-go="top" aria-label="OwnCura, home" className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className={styles.mark}>
              <defs>
                <linearGradient id="ocLg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2E6CB8" /><stop offset="1" stopColor="#34B3A5" /></linearGradient>
                <mask id="ocLm1"><rect width="32" height="32" fill="#FFFFFF" /><path d="M28.4 3.6L21.66 10.34A8 8 0 1 0 21.66 21.66L28.4 28.4" fill="none" stroke="#000000" strokeWidth="2.9" strokeLinecap="butt" strokeLinejoin="miter" /></mask>
              </defs>
              <circle cx="16" cy="16" r="15.5" mask="url(#ocLm1)" fill="url(#ocLg1)" />
            </svg>
            <span className={styles.word}>OwnCura</span>
          </a>
          <a href="#valuation" data-go="val" className={styles.cta}>Get a valuation</a>
        </div>
      </div>
    </header>
  );
}
