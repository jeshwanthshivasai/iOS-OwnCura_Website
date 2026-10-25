/* The footer's dotted name (v5 initFootDots → WordDots): the word "OwnCura" in dots, drawn by the shared dot field. Its letters are sampled at a pitch fine enough that every stem
   holds three or more dots, and they light left to right in the brand gradient as the footer comes in (the field's `map`). The field around it is off in the footer (noField). */
import { DotField, type DotFieldOptions } from "./dot-field";
import { clamp } from "../motion/math";

export interface WordDotsOptions extends DotFieldOptions {
  /** The element whose box the name fills ([data-foot-word]). */
  wordEl: HTMLElement | null;
  /** Leave out the field at the hero's pitch around the letters. */
  noField: boolean;
  /** The face the name is set in (Schibsted Grotesk, from the page's --fs token). */
  face: string;
}

/** What the footer's layout measured for the name: its font size, and that it is centred by its ink rather than its advance (v5 we.__fs / we.__ink). */
export const wordFit = new WeakMap<HTMLElement, { fs: number; ink: boolean }>();

export class WordDots extends DotField<WordDotsOptions> {
  resize(): void {
    const dpr = (this.dpr = Math.min(2, window.devicePixelRatio || 1));
    const w = (this.w = this.c.clientWidth || 1), h = (this.h = this.c.clientHeight || 1);
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    const s = this.o.spacing, el = this.o.wordEl, cr = this.c.getBoundingClientRect(), wr = el && el.offsetParent ? el.getBoundingClientRect() : null;
    const mw = Math.ceil(w), mh = Math.ceil(h);
    let inA: Uint8ClampedArray | null = null, inB: Uint8ClampedArray | null = null, bx = 0, bw = 1, p = s, box: number[] | null = null;
    const g = wr && wr.width > 0 && el ? (() => { const mk = document.createElement("canvas"); mk.width = mw; mk.height = mh; return mk.getContext("2d"); })() : null;
    if (wr && el && g) {
      // the word's own pitch: fine enough that every stem holds three or more dots
      const fit = wordFit.get(el), fs = (fit && fit.fs) || 100; p = clamp(0.032 * fs, 5, 9);
      g.font = "600 " + fs + "px " + this.o.face; if ("letterSpacing" in g) g.letterSpacing = (-0.045 * fs).toFixed(2) + "px";
      const m = g.measureText("OwnCura"); bx = wr.left - cr.left; bw = wr.width;
      const tx = fit && fit.ink ? bx + (bw - m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2 + m.actualBoundingBoxLeft : bx + (bw - m.width) / 2, ty = wr.top - cr.top + m.actualBoundingBoxAscent;
      const draw = (lw: number) => { g.clearRect(0, 0, mw, mh); g.fillStyle = "#000"; g.strokeStyle = "#000"; g.lineJoin = "round"; g.lineWidth = lw; g.textBaseline = "alphabetic"; g.fillText("OwnCura", tx, ty); g.strokeText("OwnCura", tx, ty); return g.getImageData(0, 0, mw, mh).data; };
      inA = draw(p * 0.5); inB = draw(s * 1.3);
      box = [tx - s, ty - m.actualBoundingBoxAscent - s, tx + m.width + s, ty + m.actualBoundingBoxDescent + s];
    }
    const hit = (img: Uint8ClampedArray | null, x: number, y: number) => { const xi = Math.round(x), yi = Math.round(y); return !!img && xi >= 0 && yi >= 0 && xi < mw && yi < mh && img[(yi * mw + xi) * 4 + 3] > 110; };
    const cols = Math.ceil(w / s) + 2, rows = Math.ceil(h / s) + 2, data: number[] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    // the field at the hero's pitch, kept clear of the letters so they separate
    if (!this.o.noField) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * s + (rnd() - 0.5) * 2.2, y = j * s + (rnd() - 0.5) * 2.2;
      if (hit(inB, x, y)) continue;
      data.push(x, y, 0, clamp((x - bx) / bw, 0, 1), rnd());
    }
    // the letters at the finer pitch
    if (box) for (let y = box[1]; y <= box[3]; y += p) for (let x = box[0]; x <= box[2]; x += p) {
      const xj = x + (rnd() - 0.5) * p * 0.2, yj = y + (rnd() - 0.5) * p * 0.2;
      if (hit(inA, xj, yj)) data.push(xj, yj, 1, clamp((xj - bx) / bw, 0, 1), rnd());
    }
    this.n = data.length / 5;
    this.data = data;
  }
}
