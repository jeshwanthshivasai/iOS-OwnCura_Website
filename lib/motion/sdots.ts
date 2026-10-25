/* 03–06: the hero's dot field, one canvas per section (v5 tick, "the hero's dot field, one canvas per section"). Each field is made the first time its canvas is on screen and drawn only while it is. All four switches (dots03–dots06) are on. */
import type { Engine } from "./engine";
import { DotField } from "../gl/dot-field";

const IDS = ["03", "04", "05", "06"];

export class SectionDots {
  private fields: Record<string, DotField> = {};
  constructor(private readonly e: Engine) {}

  tick(time: number): void {
    for (const id of IDS) {
      const c = this.e.el<HTMLCanvasElement>("sd" + id, `[data-sdots="${id}"]`); if (!c) continue;
      if (c.style.display !== "block") { c.style.display = "block"; if (this.fields[id]) this.fields[id].resize(); }
      if (c.style.visibility === "hidden" || (c.parentElement && c.parentElement.style.visibility === "hidden")) continue;
      const rc = c.getBoundingClientRect(); if (rc.bottom <= 0 || rc.top >= window.innerHeight) continue;
      if (!this.fields[id]) { const d = new DotField(c); d.map = 0; d.fade = 1; this.fields[id] = d; }
      this.fields[id].render(time);
    }
  }

  destroy(): void {
    Object.values(this.fields).forEach((d) => d.destroy());
    this.fields = {};
  }
}
