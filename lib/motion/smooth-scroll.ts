/* Lenis-style smooth scroll on native scroll, as in v5 (OC.SmoothScroll): the wheel is intercepted and lerped, everything else stays native. */
import { clamp } from "./math";

export interface SmoothScrollOptions {
  /** How much of the remaining distance is covered each frame. */
  lerp: number;
  enabled: boolean;
}

export class SmoothScroll {
  o: SmoothScrollOptions;
  target: number;
  current: number;
  velocity = 0;
  /** While locked (the intro), wheel input is ignored. */
  locked = false;
  private prev: number;
  private readonly onWheel: (e: WheelEvent) => void;
  private readonly onScroll: () => void;

  constructor(opts?: Partial<SmoothScrollOptions>) {
    this.o = Object.assign({ lerp: 0.085, enabled: true }, opts || {});
    this.target = this.current = window.scrollY;
    this.prev = window.scrollY;
    this.onWheel = (e) => {
      if (!this.o.enabled || this.locked || e.ctrlKey) return;
      const t = e.target as Element | null;
      if (t && t.closest && t.closest("[data-native-scroll]")) return;
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      else if (e.deltaMode === 2) d *= window.innerHeight;
      this.target = clamp(this.target + d, 0, this.max());
    };
    // a jump made by anything else (keys, anchors, the browser) is taken as the new position
    this.onScroll = () => {
      if (Math.abs(window.scrollY - this.current) > 1.5) this.current = this.target = window.scrollY;
    };
    window.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  max(): number {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  scrollTo(y: number): void {
    this.target = clamp(y, 0, this.max());
    if (!this.o.enabled) window.scrollTo(0, this.target);
  }

  /** Once per frame, before the choreography reads the scroll. */
  update(): void {
    if (this.o.enabled) {
      const d = this.target - this.current;
      if (Math.abs(d) > 0.4) {
        this.current += d * this.o.lerp;
        window.scrollTo(0, this.current);
      } else if (this.current !== this.target) {
        this.current = this.target;
        window.scrollTo(0, this.current);
      }
    } else {
      this.current = this.target = window.scrollY;
    }
    this.velocity = this.current - this.prev;
    this.prev = this.current;
  }

  destroy(): void {
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("scroll", this.onScroll);
  }
}
