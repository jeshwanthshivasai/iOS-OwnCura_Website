/* The dotted field (WebGL), as in v5's owncura-landing-v2.js (OC.DotField): a faint grid of dots that brighten under the pointer and breathe.
   `map` and the per-dot `in`/`t` values light part of the field in the brand gradient; the hero's flat US map (usMap) is off, so the base field marks no dot as lit.
   The footer's dotted name (a subclass that builds its own points) lights its letters through the same values.
   Every field on a page shares one WebGL context: each keeps its own buffer, draws into the shared canvas and copies the result into its own canvas.
   Browsers drop the oldest contexts past about 16, and the landing page holds more surfaces than that; dropped ones went blank. */
import { lerp } from "../motion/math";

const DOT_VS = `precision mediump float; attribute vec2 a_pos; attribute float a_in; attribute float a_t; attribute float a_ph;
    uniform vec2 u_res; uniform vec2 u_mouse; uniform float u_time; uniform float u_map; uniform float u_dpr;
    varying float v_in; varying float v_t; varying float v_a;
    void main(){ float d = distance(a_pos, u_mouse); float m = smoothstep(150.0, 0.0, d);
      float br = 1.0 + 0.16 * sin(u_time * 0.9 + a_ph * 6.2831);
      float sz = (2.2 + 1.6 * a_in * u_map) * br * (1.0 + 1.2 * m);
      gl_PointSize = sz * u_dpr; vec2 c = (a_pos / u_res) * 2.0 - 1.0;
      gl_Position = vec4(c.x, -c.y, 0.0, 1.0); v_in = a_in; v_t = a_t; v_a = 1.0 + 0.7 * m; }`;
const DOT_FS = `precision mediump float; varying float v_in; varying float v_t; varying float v_a;
    uniform float u_fade; uniform float u_map; uniform vec3 u_base; uniform vec3 u_blue; uniform vec3 u_teal; uniform float u_baseA; uniform float u_mapA;
    void main(){ vec2 q = gl_PointCoord * 2.0 - 1.0; float r = length(q); float a = 1.0 - smoothstep(0.7, 1.0, r);
      float k = v_in * u_map; vec3 col = mix(u_base, mix(u_blue, u_teal, v_t), k);
      float al = mix(u_baseA, u_mapA, k) * a * u_fade * min(v_a, 1.4); gl_FragColor = vec4(col * al, al); }`;

const UNIFORMS = ["u_res", "u_mouse", "u_time", "u_map", "u_dpr", "u_fade", "u_base", "u_blue", "u_teal", "u_baseA", "u_mapA"] as const;
type UniformName = (typeof UNIFORMS)[number];

interface Shared {
  c: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  u: Record<UniformName, WebGLUniformLocation | null>;
  a: { pos: number; in: number; t: number; ph: number };
  w: number;
  h: number;
}
type SharedState = Shared | { gl: null };

let DG: SharedState | null = null;
const dotGL = (): SharedState => {
  if (DG) return DG;
  const c = document.createElement("canvas");
  c.width = c.height = 2;
  const gl = c.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false });
  if (!gl) return (DG = { gl: null });
  const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, mk(gl.VERTEX_SHADER, DOT_VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, DOT_FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn("OC dot field: shader link failed", gl.getProgramInfoLog(pr)); return (DG = { gl: null }); }
  gl.useProgram(pr); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const u = {} as Record<UniformName, WebGLUniformLocation | null>;
  UNIFORMS.forEach((k) => { u[k] = gl.getUniformLocation(pr, k); });
  const a = { pos: gl.getAttribLocation(pr, "a_pos"), in: gl.getAttribLocation(pr, "a_in"), t: gl.getAttribLocation(pr, "a_t"), ph: gl.getAttribLocation(pr, "a_ph") };
  [a.pos, a.in, a.t, a.ph].forEach((l) => gl.enableVertexAttribArray(l));
  // a lost context is rebuilt on the next draw; every field re-uploads its buffer into the new one
  c.addEventListener("webglcontextlost", (e) => { e.preventDefault(); DG = null; });
  return (DG = { c, gl, u, a, w: 2, h: 2 });
};

type RGB = [number, number, number];
export interface DotFieldOptions {
  /** Pitch of the grid, in CSS pixels. */
  spacing: number;
  base: RGB;
  baseA: number;
  blue: RGB;
  teal: RGB;
  /** Alpha of a lit dot. */
  mapA: number;
}

/** A dot is five floats: x, y, lit (0 or 1), position along the gradient (0–1), phase (0–1). */
export type DotData = number[] | Float32Array;

/** A field that builds its own points (the footer's dotted name) extends this with its own options type and its own resize(). The base constructor calls resize() before a subclass's own fields exist, so a subclass reads what it needs from `this.o`, never from fields of its own. */
export class DotField<O extends DotFieldOptions = DotFieldOptions> {
  c: HTMLCanvasElement;
  o: O;
  /** Overall alpha of the field. */
  fade = 1;
  /** How far the lit dots show their gradient. */
  map = 0;
  protected mouse: [number, number] = [-9999, -9999];
  protected n = 0;
  protected data: DotData | null = null;
  protected dpr = 1;
  protected w = 1;
  protected h = 1;
  protected g2: CanvasRenderingContext2D | null = null;
  private buf: WebGLBuffer | null = null;
  private bufS: SharedState | null = null;
  private upData: DotData | null = null;
  private readonly onMove: (e: PointerEvent) => void;
  private readonly onLeave: () => void;
  private readonly onResize: () => void;

  constructor(canvas: HTMLCanvasElement, opts?: Partial<O>) {
    this.c = canvas;
    this.o = Object.assign({ spacing: 15, base: [0.78, 0.79, 0.77] as RGB, baseA: 0.75, blue: [0.18, 0.42, 0.72] as RGB, teal: [0.2, 0.7, 0.65] as RGB, mapA: 0.7 }, opts || {}) as O;
    this.onMove = (e) => { const r = this.c.getBoundingClientRect(); this.mouse = [e.clientX - r.left, e.clientY - r.top]; };
    this.onLeave = () => { this.mouse = [-9999, -9999]; };
    window.addEventListener("pointermove", this.onMove, { passive: true });
    window.addEventListener("pointerleave", this.onLeave);
    this.onResize = () => this.resize();
    window.addEventListener("resize", this.onResize);
    this.init();
    this.resize();
  }

  // the field's own canvas is a plain 2D one; subclasses that build their own points only have to set this.data and this.n in resize()
  protected init(): void { this.g2 = this.c.getContext("2d"); }

  resize(): void {
    const dpr = (this.dpr = Math.min(2, window.devicePixelRatio || 1));
    const w = (this.w = this.c.clientWidth || 1), h = (this.h = this.c.clientHeight || 1);
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    const s = this.o.spacing;
    const cols = Math.ceil(w / s) + 2, rows = Math.ceil(h / s) + 2, data: number[] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * s + (rnd() - 0.5) * 2.2, y = j * s + (rnd() - 0.5) * 2.2;
      data.push(x, y, 0, 0, rnd());
    }
    this.n = data.length / 5;
    this.data = data;
  }

  /** Draws the frame at `time` (a requestAnimationFrame time) into the canvas. */
  render(time: number): void {
    const o = this.o, cw = this.c.clientWidth, ch = this.c.clientHeight;
    if (cw > 1 && ch > 1 && (cw !== this.w || ch !== this.h)) this.resize();
    if (this.w <= 1 || this.h <= 1) return;
    const g = this.g2; if (!g || !this.data) return;
    const S = dotGL();
    if (!S.gl) {
      // no WebGL: the same dots drawn one by one, without the pointer glow or the breathing
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.clearRect(0, 0, this.w, this.h);
      for (let i = 0; i < this.data.length; i += 5) {
        const inside = this.data[i + 2], t = this.data[i + 3], k = inside * this.map;
        const r = Math.round(255 * lerp(o.base[0], lerp(o.blue[0], o.teal[0], t), k)), gc = Math.round(255 * lerp(o.base[1], lerp(o.blue[1], o.teal[1], t), k)), b = Math.round(255 * lerp(o.base[2], lerp(o.blue[2], o.teal[2], t), k));
        g.fillStyle = `rgba(${r},${gc},${b},${(lerp(o.baseA, o.mapA, k) * this.fade).toFixed(3)})`;
        g.beginPath(); g.arc(this.data[i], this.data[i + 1], 1.2 + 0.9 * k, 0, 6.2832); g.fill();
      }
      return;
    }
    const gl = S.gl, u = S.u, a = S.a, W = this.c.width, H = this.c.height;
    if (W > S.w || H > S.h) { S.w = Math.max(S.w, W); S.h = Math.max(S.h, H); S.c.width = S.w; S.c.height = S.h; }
    if (this.bufS !== S || this.upData !== this.data) {
      if (this.bufS === S && this.buf) gl.deleteBuffer(this.buf);
      this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferData(gl.ARRAY_BUFFER, this.data instanceof Float32Array ? this.data : new Float32Array(this.data), gl.STATIC_DRAW);
      this.bufS = S; this.upData = this.data;
    } else gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.vertexAttribPointer(a.pos, 2, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(a.in, 1, gl.FLOAT, false, 20, 8);
    gl.vertexAttribPointer(a.t, 1, gl.FLOAT, false, 20, 12); gl.vertexAttribPointer(a.ph, 1, gl.FLOAT, false, 20, 16);
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.u_res, this.w, this.h); gl.uniform2f(u.u_mouse, this.mouse[0], this.mouse[1]);
    gl.uniform1f(u.u_time, time / 1000); gl.uniform1f(u.u_map, this.map); gl.uniform1f(u.u_dpr, this.dpr); gl.uniform1f(u.u_fade, this.fade);
    gl.uniform3fv(u.u_base, o.base); gl.uniform3fv(u.u_blue, o.blue); gl.uniform3fv(u.u_teal, o.teal);
    gl.uniform1f(u.u_baseA, o.baseA); gl.uniform1f(u.u_mapA, o.mapA);
    gl.drawArrays(gl.POINTS, 0, this.n);
    // the viewport sits at the bottom-left of the shared buffer, which is the bottom of its image
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.drawImage(S.c, 0, S.h - H, W, H, 0, 0, W, H);
  }

  destroy(): void {
    window.removeEventListener("pointermove", this.onMove); window.removeEventListener("pointerleave", this.onLeave); window.removeEventListener("resize", this.onResize);
    if (this.buf && this.bufS && this.bufS === DG && DG.gl) DG.gl.deleteBuffer(this.buf);
    this.buf = null;
  }
}
