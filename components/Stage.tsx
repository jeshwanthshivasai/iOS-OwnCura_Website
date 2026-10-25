import styles from "./Stage.module.css";

/* 01 Hero and 02 share one pinned stage (900vh). The gradient object is the story: a plus, an H, two entities, the hero frame, the two entities again.
   The hero: the title in two lines inside the H frame, the dotted field around it, and the earth rising from the bottom. 02 follows in the build order. */
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
        <button type="button" data-skip="" className={styles.skip} hidden>Skip intro</button>
      </section>
    </div>
  );
}
