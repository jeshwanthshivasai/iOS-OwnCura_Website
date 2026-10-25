import styles from "./Why.module.css";

/* 03 Why doctors sell: a pinned stage (740vh). The three reasons travel one at a time along an arc, the lit edge of a dome; the third stops at the top, all three settle at equal intervals, then the stage releases into the priced line and the quote.
   03 → 04 over the stage's last 320vh: the reasons, heading and quote fade; the dome rises; the gradient pulls back into the 4, and "Your" and "Options" arrive either side of it as it settles. 04 takes over on that frame. */

const REASONS = [
  {
    title: "Retirement.", note: "Thirty years in, and no one to hand the keys to.",
    fill: "M240,128a32,32,0,0,1-32,32v40a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V160a32,32,0,0,1,0-64V72A32,32,0,0,1,80,40h96a32,32,0,0,1,32,32V96A32,32,0,0,1,240,128Z",
    line: "M216,88.8V72a40,40,0,0,0-40-40H80A40,40,0,0,0,40,72V88.8a40,40,0,0,0,0,78.4V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V167.2a40,40,0,0,0,0-78.4ZM80,48h96a24,24,0,0,1,24,24V88.8A40.07,40.07,0,0,0,168,128H88A40.07,40.07,0,0,0,56,88.8V72A24,24,0,0,1,80,48ZM208.39,152H208a8,8,0,0,0-8,8v40H56V160a8,8,0,0,0-8-8h-.39A24,24,0,1,1,72,128v40a8,8,0,0,0,16,0V144h80v24a8,8,0,0,0,16,0V128a24,24,0,1,1,24.39,24Z",
  },
  {
    title: "Liquidity.", note: "The practice is the retirement plan, and it is illiquid.",
    fill: "M16,152H48v56H16a8,8,0,0,1-8-8V160A8,8,0,0,1,16,152ZM204,56a28,28,0,0,0-12,2.71h0A28,28,0,1,0,176,85.29h0A28,28,0,1,0,204,56Z",
    line: "M230.33,141.06a24.43,24.43,0,0,0-21.24-4.23l-41.84,9.62A28,28,0,0,0,140,112H89.94a31.82,31.82,0,0,0-22.63,9.37L44.69,144H16A16,16,0,0,0,0,160v40a16,16,0,0,0,16,16H120a7.93,7.93,0,0,0,1.94-.24l64-16a6.94,6.94,0,0,0,1.19-.4L226,182.82l.44-.2a24.6,24.6,0,0,0,3.93-41.56ZM16,160H40v40H16Zm203.43,8.21-38,16.18L119,200H56V155.31l22.63-22.62A15.86,15.86,0,0,1,89.94,128H140a12,12,0,0,1,0,24H112a8,8,0,0,0,0,16h32a8.32,8.32,0,0,0,1.79-.2l67-15.41.31-.08a8.6,8.6,0,0,1,6.3,15.9ZM164,96a36,36,0,0,0,5.9-.48,36,36,0,1,0,28.22-47A36,36,0,1,0,164,96Zm60-12a20,20,0,1,1-20-20A20,20,0,0,1,224,84ZM164,40a20,20,0,0,1,19.25,14.61,36,36,0,0,0-15,24.93A20.42,20.42,0,0,1,164,80a20,20,0,0,1,0-40Z",
  },
  {
    title: "Administration.", note: "Two jobs, and only one of them is medicine.",
    fill: "M208,72V184a8,8,0,0,1-8,8H176V104L136,64H80V40a8,8,0,0,1,8-8h80Z",
    line: "M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z",
  },
];

// "sell." rises letter by letter, each 60 ms after the last
const SELL = ["s", "e", "l", "l", "."];

export default function Why() {
  return (
    <div data-s3-wrap="" className={styles.wrap}>
      <section data-s3="" className={styles.stage}>
        <svg width="0" height="0" aria-hidden="true" className={styles.defs}>
          <defs><linearGradient id="ocIcG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2E6CB8" /><stop offset="1" stopColor="#34B3A5" /></linearGradient></defs>
        </svg>
        <canvas data-sdots="03" aria-hidden="true" className={styles.sdots} />
        <div data-s3-head="" className={styles.head}>
          <h2 className={styles.heading}>
            <span className={styles.clip}><span data-rv="" className={styles.rvWhy}>Why</span></span>
            <span className={styles.persp}><span data-rv="" className={styles.rvDoctors}>doctors</span></span>
            <span className={styles.clip}>
              {SELL.map((ch, i) => <span key={i} data-rv="" className={styles.rvLetter} style={{ transitionDelay: `${(0.3 + i * 0.06).toFixed(2)}s` }}>{ch}</span>)}
            </span>
          </h2>
          <div data-rv="" className={styles.subs}>
            <p data-s3-sub="" className={styles.sub}>Physicians cite three reasons for selling.</p>
            <p data-s3-sub2="" className={`${styles.sub} ${styles.sub2}`}>Each of those gets priced. The thing they are actually worried about does not.</p>
          </div>
        </div>
        <div data-t34="" aria-hidden="true" className={styles.t34}>
          <div data-dome="" aria-hidden="true" className={styles.dome}>
            <canvas data-dome-mesh="" className={styles.domeMesh} />
            <div data-dome-ov="" className={styles.domeOv} />
          </div>
          {/* 03 → 04: the 4 in its own box, with its own gradient, under the dome's clip */}
          <div data-t4clip="" className={styles.t4clip}>
            <div data-t4box="" className={styles.t4box}><canvas data-t4mesh="" className={styles.t4mesh} /></div>
          </div>
          {/* the arc: the lit edge of the dome, the line the reasons ride on */}
          <svg data-arc="" aria-hidden="true" viewBox="0 0 1000 400" preserveAspectRatio="none" className={styles.arc}>
            <path d="M0 400 Q500 -400 1000 400" className={styles.arcPath} />
          </svg>
        </div>
        <div data-orbit="" className={styles.orbit}>
          {REASONS.map((o, i) => (
            <div key={o.title} data-orb="" data-orb-i={i} className={styles.orb}>
              <span className={styles.icon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="26" height="26" aria-hidden="true" className={styles.iconSvg}>
                  <path d={o.fill} fill="url(#ocIcG)" opacity="0.65" stroke="none" />
                  <path d={o.line} />
                </svg>
              </span>
              <span className={styles.orbTitle}>{o.title}</span>
              <span className={styles.orbNote}>{o.note}</span>
            </div>
          ))}
        </div>
        <div data-s3-after="" className={styles.after}>
          <blockquote className={styles.quote}>“Whoever takes it should handle it the way I did.”</blockquote>
        </div>
        <div data-s3-dots="" aria-hidden="true" className={styles.dots}>
          <span data-orb-dot="" className={styles.dot} /><span data-orb-dot="" className={styles.dot} /><span data-orb-dot="" className={styles.dot} />
        </div>
        {/* 03 → 04: copies of 04's "Your" and "Options", arriving either side of the 4 as it settles; 04's own heading carries the words */}
        <div data-s3-words="" aria-hidden="true" className={styles.words}>
          <span data-s3-wy="" className={`${styles.word} ${styles.wordYour}`}>Your</span>
          <span data-s3-wo="" className={`${styles.word} ${styles.wordOptions}`}>Options</span>
        </div>
      </section>
    </div>
  );
}
