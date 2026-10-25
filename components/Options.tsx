import { Fragment } from "react";
import { QUADRANTS } from "@/lib/s4-data";
import styles from "./Options.module.css";

/* 04 Your four options (1060vh; 760vh with reduced motion), carried from "OwnCura 04 Study - The Cross" (v5 S4Ctl). The settings build the cross layout only.
   The 4 moves to the left edge at full height and changes number, 1 → 2 → 3 → 4, as the options pass. Beside it a cross of gradient bars divides the screen into four boxes;
   it moves from box to box, and each option's diagram, title and body arrive in its box. After the fourth, the cross gathers to the centre and all four show together as a grid. */

const Square = () => <span aria-hidden="true" className={styles.square} />;

export default function Options() {
  return (
    <div id="options" data-s4="" data-s4-host="" className={styles.host}>
      <div data-s4-wrap="" className={styles.wrap}>
        <section className={styles.stage}>
          <svg width="0" height="0" aria-hidden="true" className={styles.defs}>
            <defs>
              <linearGradient id="o4gk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A2F36" /><stop offset="1" stopColor="#14171C" /></linearGradient>
              <linearGradient id="o4ggs" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="180" y2="246"><stop offset="0" stopColor="#2E6CB8" /><stop offset="1" stopColor="#34B3A5" /></linearGradient>
              <linearGradient id="o4gga" data-gga="" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="220" y2="246"><stop offset="0" stopColor="#2E6CB8" /><stop offset="0.45" stopColor="#34B3A5" /><stop offset="0.72" stopColor="#6FC3DF" /><stop offset="1" stopColor="#2E6CB8" /></linearGradient>
              <linearGradient id="o4gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
              <filter id="o4fb" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9" /></filter>
            </defs>
          </svg>
          <canvas data-sdots="04" aria-hidden="true" className={styles.sdots} />
          {/* the 4's shape as a clip path in its own units (268 tall); the engine scales it to the screen and morphs it 1 → 4 */}
          <svg width="0" height="0" aria-hidden="true" className={styles.defs}>
            <defs>
              <clipPath id="c04" clipPathUnits="userSpaceOnUse">
                <path data-nb="" data-nclip="" d="M67 0L127.748 0L97.6904 106.061L82.6621 159.09L164.198 159.09L164.198 268L112.381 268L112.381 212.12L0 212.12Z" />
                <circle data-nc0="" data-nclip="" cx="146.101" cy="109.993" r="36.7134" />
                <circle data-nc1="" data-nclip="" cx="146.101" cy="109.993" r="0" />
                <circle data-nc2="" data-nclip="" cx="146.101" cy="109.993" r="0" />
              </clipPath>
            </defs>
          </svg>
          {/* the 4, filled with the living gradient */}
          <div data-four="" aria-hidden="true" className={styles.four}>
            <div data-four-clip="" className={styles.fourClip}><canvas data-four-mesh="" className={styles.fill} /></div>
          </div>
          <div data-words="" className={styles.words}>
            <h2 className={styles.heading}>
              <span data-w-your="" className={`${styles.word} ${styles.wordYour}`}>Your</span>
              <span className={styles.srOnly}> four </span>
              <span data-w-options="" className={`${styles.word} ${styles.wordOptions}`}>Options</span>
            </h2>
          </div>
          <div data-dir="cross" className={styles.cross}>
            <div data-cwrap="" aria-hidden="true" className={styles.cwrap}><canvas data-cmesh="" className={styles.fill} /></div>
            {QUADRANTS.map((Q) => (
              <div key={Q.q} data-cq={Q.q} className={styles.cq}>
                <div data-clabel="" data-go={Q.q} className={styles.clabel}>
                  <div data-cg="" data-r={Q.r} className={styles.cg}>
                    <svg viewBox={Q.viewBox} preserveAspectRatio={Q.par} aria-hidden="true" className={styles.cgSvg} dangerouslySetInnerHTML={{ __html: Q.diagram }} />
                  </div>
                  <h3 data-ct="" data-size-as={Q.sizeAs ?? undefined} className={styles.ct}>{Q.label}<Square /></h3>
                </div>
                <div data-cbody="" className={styles.cbody}>
                  {/* the body's title stays hidden in the cross layout, as in v5: the label on the cross carries the name */}
                  <h3 data-cs={Q.q} data-st={Q.titleSt} data-d0={Q.titleD0} className={styles.ctitle}>
                    {Q.title.map((w, j) => (
                      <Fragment key={j}>
                        {j > 0 ? " " : null}
                        <span className={styles.clip}><span data-w="" className={styles.w}>{w}{j === Q.title.length - 1 ? <Square /> : null}</span></span>
                      </Fragment>
                    ))}
                  </h3>
                  <p data-cs={Q.q} data-st={Q.leadSt} data-d0={Q.leadD0} className={styles.lead}>
                    {Q.lead.map(([w, strong], j) => (
                      <Fragment key={j}>
                        {j > 0 ? " " : null}
                        <span className={`${styles.clip} ${strong ? styles.strong : styles.soft}`}><span data-w="" className={styles.w}>{w}</span></span>
                      </Fragment>
                    ))}
                  </p>
                  <p data-cs={Q.q} data-fade="" className={styles.desc}>{Q.desc}</p>
                  <div data-cs={Q.q} data-fade="" className={styles.ctaWrap}><a href={Q.href} className={styles.cta}>{Q.cta}</a></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
