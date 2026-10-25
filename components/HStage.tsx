import { Fragment } from "react";
import styles from "./HStage.module.css";

/* 05, 06 and the close share one pinned stage (v5 [data-h-wrap], 1005vh, pulled up 265vh under the end of 04; 840vh and not pulled up with reduced motion).
   05: a gradient square, with a larger, left-aligned title over the statement (s5Square on). During 04 → 05 the stage rises under the veil and pins, and the gradient pulls back into the square.
   Its words start unfilled and fill word by word as the stage scrolls (lib/motion/h.ts). 06 and the close follow in the build order. */

// the words, with the claims that take the brand gradient when they fill (v5 data-tclaim / data-claim)
const TITLE: [string, boolean][] = [["What", false], ["we", false], ["own", true], ["and", false], ["run.", true]];
const STATEMENT: [string, boolean][] = [["We", false], ["own", false], ["and", false], ["operate", false], ["hundreds", true], ["of", true], ["practices", true], ["across", false], ["most", true], ["states.", true], ["Thousands", true], ["of", true], ["physicians", true], ["work", false], ["in", false], ["them", false], ["and", false], ["see", false], ["millions", true], ["of", true], ["patients", true], ["a", false], ["year.", false], ["We", false], ["have", false], ["run", false], ["practices", false], ["for", false], ["over", true], ["a", true], ["decade,", true], ["and", false], ["last", false], ["year", false], ["we", false], ["bought", false], ["dozens", true], ["more,", false], ["each", false], ["still", false], ["under", false], ["its", false], ["own", false], ["name.", false]];

const Words = ({ words, attr, claimAttr, word, claim }: { words: [string, boolean][]; attr: string; claimAttr: string; word: string; claim: string }) => (
  <>
    {words.map(([w, c], i) => (
      <Fragment key={i}>
        {i > 0 ? " " : null}
        <span {...{ [attr]: "" }} {...(c ? { [claimAttr]: "" } : {})} className={c ? claim : word}>{w}</span>
      </Fragment>
    ))}
  </>
);

export default function HStage() {
  return (
    <div id="practices" data-h-wrap="" className={styles.wrap}>
      <section className={styles.stage}>
        <div data-p5="" className={styles.p5}>
          <canvas data-sdots="05" aria-hidden="true" className={styles.sdots} />
          <div data-s5-title="" className={styles.title}>
            <div data-s5-sq="" aria-hidden="true" className={styles.square} />
            <h2 data-s5-h2="" className={styles.heading}><Words words={TITLE} attr="data-tw" claimAttr="data-tclaim" word={styles.tw} claim={styles.claim} /></h2>
          </div>
          <p data-stmt="" className={styles.stmt}><Words words={STATEMENT} attr="data-sw" claimAttr="data-claim" word={styles.sw} claim={styles.claim} /></p>
        </div>
      </section>
    </div>
  );
}
