import { NUMERALS } from "@/lib/numerals";
import styles from "./Stage.module.css";

/* 01 Hero and 02 share one pinned stage (900vh). The gradient object is the story: a plus, an H, two entities, the hero frame, the two entities again.
   The hero: the title in two lines inside the H frame, the dotted field around it, and the earth rising from the bottom.
   02: six step cards pop up in the middle one after another; each pushes the two entities further apart until they leave the screen. */

const STEPS: { n: 1 | 2 | 3 | 4 | 5 | 6; title: string; text: string }[] = [
  { n: 1, title: "The practice is listed.", text: "It appears on a business-for-sale marketplace, between a car wash and a franchise restaurant." },
  { n: 2, title: "A buyer registers interest.", text: "One button. The buyer has done this a hundred times; this is the owner's first." },
  { n: 3, title: "Emails are exchanged.", text: "Through a broker, who is paid when the practice sells and not otherwise." },
  { n: 4, title: "An NDA is signed.", text: "The owner is now in a process, and still has not been told what the practice is worth." },
  { n: 5, title: "The CIM is prepared and sent.", text: "Twenty years of work compressed into a document written for buyers to skim." },
  { n: 6, title: "The EBITDA meeting.", text: "The number is discussed for the first time, in a room where one side has done this before." },
];

export default function Stage() {
  return (
    <div data-stage-wrap="" className={styles.wrap}>
      <section id="top" className={styles.stage}>
        <div data-stage-bg="" aria-hidden="true" className={styles.bg} />
        <canvas data-dots="" aria-hidden="true" className={styles.dots} />
        <div data-globe-wrap="" aria-hidden="true" className={styles.globeWrap}>
          <div data-halo="" className={styles.halo} />
          <div data-globe-section="" className={styles.globeSection}>
            <div id="map" data-map="" className={styles.map} />
          </div>
        </div>
        <div data-obj-blur="" aria-hidden="true" className={styles.objBlur}>
          <div data-obj-clip="" className={styles.objClip}>
            <canvas data-mesh="" className={styles.mesh} />
          </div>
        </div>
        <div data-hero-content="" className={styles.heroContent}>
          <h1 data-title="" className={styles.title}>
            <span data-line1="" className={styles.line1}>The ownership infrastructure for</span>
            <span data-line2="" className={styles.line2}>American healthcare practices.</span>
          </h1>
        </div>
        {/* 02: the row of six step cards, born one by one at the centre; the numerals are the designer's shapes */}
        <div data-card-row="" className={styles.row}>
          {STEPS.map((s) => {
            const nu = NUMERALS[s.n];
            return (
              <article key={s.n} data-scard="" className={styles.card}>
                <div data-cin="" className={styles.cin}>
                  <svg data-num="" aria-hidden="true" viewBox={`0 0 ${nu.w} ${nu.h}`} preserveAspectRatio="xMidYMid meet" className={styles.num}>
                    <defs>
                      <linearGradient id={`ocNum${s.n}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2E6CB8" /><stop offset="1" stopColor="#34B3A5" /></linearGradient>
                    </defs>
                    <path d={nu.d} fill={`url(#ocNum${s.n})`} />
                  </svg>
                  <h3 className={styles.cardTitle}><span>{s.title}</span></h3>
                  <p className={styles.cardText}>{s.text}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div data-s2-head="" className={styles.s2Head}>
          <h2 className={styles.s2Heading}>How a practice is sold today.</h2>
        </div>
        <p data-s2-close="" className={styles.s2Close}>Six steps, and the owner learns what their practice is worth at the last one.</p>
        <button type="button" data-skip="" className={styles.skip} hidden>Skip intro</button>
      </section>
    </div>
  );
}
