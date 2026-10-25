/* 04 → 05: the veil, the 4 in its own box, a full-screen gradient, and the square's flat fill (v5 [data-t45]). A fixed layer above the page, hidden outside the transition. */
import styles from "./Handover.module.css";

export default function Handover() {
  return (
    <div data-t45="" aria-hidden="true" className={styles.layer}>
      <div data-t45-veil="" className={styles.veil} />
      <div data-t45-box="" className={styles.box}><canvas data-t45-bmesh="" className={styles.fill} /></div>
      <canvas data-t45-full="" className={`${styles.fill} ${styles.full}`} />
      <div data-t45-flat="" className={styles.flat} />
    </div>
  );
}
