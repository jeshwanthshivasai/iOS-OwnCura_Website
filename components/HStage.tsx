import { Fragment } from "react";
import Valuation from "./Valuation";
import { OwnerButton } from "./Owner";
import Footer from "./Footer";
import styles from "./HStage.module.css";

/* 05, 06 and the close share one pinned stage (v5 [data-h-wrap], 1005vh, pulled up 265vh under the end of 04; 840vh and not pulled up with reduced motion).
   05: a gradient square, with a larger, left-aligned title over the statement (s5Square on). During 04 → 05 the stage rises under the veil and pins, and the gradient pulls back into the square.
   Its words start unfilled and fill word by word as the stage scrolls (lib/motion/h.ts).
   05 → 06: 05's square grows into a full-bleed living gradient, 06 takes 05's place underneath, and the field bends and sinks until it rests as the dome, 06's globe.
   06: the H measures the practice; the doctor fills in a sentence and the range tightens as the H's uprights close in.
   The close: 06 fades, the H grows into the hero's frame and its crossbar becomes the band holding "Own what happens next.", held at rest for 80vh.
   The footer: the line dissolves into the band; the description, the card and the links come up in the H's upper counter, the dotted name and the small print in the lower one. */

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
        {/* the close: the hero's paper and dot field come up behind the H as it grows into the frame (v5 [data-close-bg]) */}
        <div data-close-bg="" aria-hidden="true" className={styles.closeBg}><canvas data-close-dots="" className={styles.fill} /></div>
        <div data-p5="" className={styles.p5}>
          <canvas data-sdots="05" aria-hidden="true" className={styles.sdots} />
          <div data-s5-title="" className={styles.title}>
            <div data-s5-sq="" aria-hidden="true" className={styles.square} />
            <h2 data-s5-h2="" className={styles.heading}><Words words={TITLE} attr="data-tw" claimAttr="data-tclaim" word={styles.tw} claim={styles.claim} /></h2>
          </div>
          <p data-stmt="" className={styles.stmt}><Words words={STATEMENT} attr="data-sw" claimAttr="data-claim" word={styles.sw} claim={styles.claim} /></p>
        </div>
        {/* hidden inline from the first paint, as in v5: the dot field skips a canvas only by its inline visibility, and 05 → 06 shows this one at q 0.435 */}
        <canvas data-sdots="06" aria-hidden="true" className={styles.sdots} style={{ visibility: "hidden" }} />
        {/* 06 is the designer's 3a frame (OwnCura 06 Study v2) at 1920 × 958, scaled to fit and centred. The H is drawn by the frame layer below; the figures ride its uprights */}
        <div id="valuation" data-p6="" className={styles.p6}>
          <Valuation />
        </div>
        {/* the H of 06 (and, in the close, the hero's frame): the designer's still gradient at rest, the living one as it grows */}
        <div data-close-frame="" aria-hidden="true" className={styles.closeFrame}><canvas data-close-mesh="" className={styles.fill} /><div data-cf-lin="" className={styles.cfLin} /></div>
        {/* 05 → 06: 05's square grows into a full-bleed living gradient, then bends and sinks to rest as 06's dome */}
        <div data-dome6="" aria-hidden="true" className={styles.dome6}><canvas data-dome6-mesh="" className={styles.fill} /><div data-dome6-flat="" className={styles.dome6Flat} /><div data-dome6-veil="" className={styles.dome6Veil} /></div>
        <div data-f6b="" className={styles.f6b}>
          {/* the owner button settles on the dome's centre; it opens "Not an owner yet?" (components/Owner.tsx) */}
          <div data-olink="" className={styles.olink}>
            <OwnerButton />
          </div>
        </div>
        {/* the close: the H has grown into the hero's frame and its crossbar is the band holding the line; held at rest for 80vh, then the footer comes in (v5 [data-close]) */}
        <div data-close="" className={styles.close}>
          <h2 data-close-line="" className={styles.closeLine}>Own what happens next.</h2>
          {/* the footer: it comes in over the band as the line dissolves */}
          <Footer />
        </div>
      </section>
      {/* where "Start a practice" and Contact Us land: the stage's last screen (v5 #contact) */}
      <div id="contact" aria-hidden="true" className={styles.contact} />
    </div>
  );
}
