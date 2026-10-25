/* The 05-to-close stage (v5 [data-h-wrap]): 05, 06, the close and the footer. Built so far: its height and pull-up, and 05 at rest, centred in the space under the nav.
   05's own timeline (its words filling), 05 → 06, 06, the close and the footer follow in the build order. */
import type { Engine } from "./engine";
import { clamp } from "./math";

export class HMotion {
  private on = false;
  private c5key = "";

  constructor(private readonly e: Engine) {}

  /** The stage's height and pull-up from the same once-read reduced-motion setting as the 04 → 05 hold, as v5's applyToggles writes them; the CSS covers the first paint. */
  boot(): void {
    const hw = this.e.q("[data-h-wrap]"); if (!hw) return;
    hw.style.marginTop = this.e.reduced ? "0px" : "-265vh"; hw.style.height = this.e.reduced ? "840vh" : "1005vh";
  }

  tick(): void {
    const e = this.e, wh = e.el("hwrap", "[data-h-wrap]"); if (!wh) return;
    const Wv = window.innerWidth, Hv = window.innerHeight, Q = e.prog(wh, Hv);
    if (!(Q.on || this.on)) return;
    this.on = Q.on;
    // 05 sits centred in the space under the nav: the title and the statement move together, measured once per layout
    const t5e = e.el("t5c", "[data-s5-title]"), s5e = e.el("s5c", "[data-stmt]");
    if (s5e) {
      const k5 = Wv + "x" + Hv + "|" + (t5e ? t5e.style.display + t5e.style.top + t5e.offsetHeight : "") + "|" + s5e.style.top + "|" + s5e.offsetHeight;
      if (k5 !== this.c5key) {
        this.c5key = k5;
        const vis = t5e && getComputedStyle(t5e).display !== "none", top = vis && t5e ? t5e.offsetTop : s5e.offsetTop, bot = s5e.offsetTop + s5e.offsetHeight;
        const d5 = clamp((68.8 + Hv) / 2 - (top + bot) / 2, -Hv * 0.1, Hv * 0.2);
        [t5e, s5e].forEach((x) => { if (x) x.style.transform = "translateY(" + d5.toFixed(1) + "px)"; });
      }
    }
  }
}
