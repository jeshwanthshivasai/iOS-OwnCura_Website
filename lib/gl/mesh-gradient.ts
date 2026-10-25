/* OwnCura: living gradient (WebGL), as in v5's owncura-gradient.js. Domain-warped noise blends four colours over the grey base. Original technique, our palette.
   Every gradient on a page shares one WebGL context: each draws into the shared canvas at its own size and copies the result into its own canvas.
   Browsers keep about 16 live WebGL contexts and drop the oldest; the landing page holds more surfaces than that, and the dropped ones went blank (white). */

const VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
const FS = `precision highp float;
uniform vec2 u_res; uniform float u_time; uniform float u_scale; uniform float u_intensity;
uniform vec3 u_c0; uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3; uniform vec3 u_base;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res; uv.x *= u_res.x / u_res.y;
  float t = u_time; vec2 p = uv * u_scale;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.6)), fbm(p + vec2(5.2, 1.3) - t * 0.45));
  vec2 w = p + 1.8 * q + vec2(t * 0.35, -t * 0.2);
  float n1 = fbm(w); float n2 = fbm(w * 1.5 + vec2(3.1, 7.7)); float n3 = fbm(w * 0.8 - vec2(1.9, 4.3));
  vec3 col = mix(u_c0, u_c1, smoothstep(0.3, 0.7, n1));
  col = mix(col, u_c2, smoothstep(0.45, 0.8, n2) * 0.85);
  col = mix(col, u_c3, smoothstep(0.55, 0.9, n3) * 0.75);
  col = mix(u_base, col, u_intensity);
  gl_FragColor = vec4(col, 1.0);
}`;

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const UNIFORMS = ["u_res", "u_time", "u_scale", "u_intensity", "u_c0", "u_c1", "u_c2", "u_c3", "u_base"] as const;
type UniformName = (typeof UNIFORMS)[number];

interface Shared {
  c: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  u: Record<UniformName, WebGLUniformLocation | null>;
  /** The shared buffer grows to the largest surface drawn so far. */
  w: number;
  h: number;
}
type SharedState = Shared | { gl: null };

let G: SharedState | null = null;
const shared = (): SharedState => {
  if (G) return G;
  const c = document.createElement("canvas");
  c.width = c.height = 2;
  const gl = c.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) return (G = { gl: null });
  const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return (G = { gl: null });
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const u = {} as Record<UniformName, WebGLUniformLocation | null>;
  UNIFORMS.forEach((k) => { u[k] = gl.getUniformLocation(pr, k); });
  // a lost context is rebuilt on the next draw; the gradients hold nothing of it
  c.addEventListener("webglcontextlost", (e) => { e.preventDefault(); G = null; });
  return (G = { c, gl, u, w: 2, h: 2 });
};

export interface MeshGradientOptions {
  /** The four colours blended over the base. */
  colors: [string, string, string, string];
  base: string;
  speed: number;
  scale: number;
  /** 0 shows the base alone, 1 the full gradient. */
  intensity: number;
  /** Backing-store pixels per CSS pixel, before the device pixel ratio (held to 1.5). */
  resolution: number;
  /** Offsets the time, so two gradients never show the same frame. */
  seed: number;
}

export class MeshGradient {
  c: HTMLCanvasElement;
  o: MeshGradientOptions;
  private g2: CanvasRenderingContext2D | null;

  constructor(canvas: HTMLCanvasElement, opts?: Partial<MeshGradientOptions>) {
    this.c = canvas;
    this.o = Object.assign({ colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"] as [string, string, string, string], base: "#ECEDEA", speed: 1, scale: 1.4, intensity: 1, resolution: 0.5, seed: 11 }, opts || {});
    this.g2 = canvas.getContext("2d", { alpha: false });
    this.resize();
  }

  resize(): void {
    const r = this.o.resolution * Math.min(1.5, window.devicePixelRatio || 1);
    this.c.width = Math.max(2, Math.round((this.c.clientWidth || 2) * r));
    this.c.height = Math.max(2, Math.round((this.c.clientHeight || 2) * r));
  }

  /** Draws the frame at `ms` (a requestAnimationFrame time) into the canvas. */
  render(ms: number): void {
    const g = this.g2; if (!g) return;
    // made before its canvas had a layout: size it now
    if (this.c.width <= 2 && this.c.clientWidth > 2) this.resize();
    const o = this.o, w = this.c.width, h = this.c.height, t = ms * 0.001 * 0.05 * o.speed + o.seed, S = shared();
    if (!S.gl) {
      // no WebGL: a still linear gradient in the same colours
      const lg = g.createLinearGradient(0, 0, w, h);
      lg.addColorStop(0, o.colors[0]); lg.addColorStop(0.5, o.colors[1]); lg.addColorStop(1, o.colors[2]);
      g.fillStyle = lg; g.fillRect(0, 0, w, h); g.fillStyle = o.base; g.globalAlpha = 1 - o.intensity; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
      return;
    }
    const gl = S.gl, u = S.u, c = o.colors.map(hex), b = hex(o.base);
    if (w > S.w || h > S.h) { S.w = Math.max(S.w, w); S.h = Math.max(S.h, h); S.c.width = S.w; S.c.height = S.h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.u_res, w, h); gl.uniform1f(u.u_time, t); gl.uniform1f(u.u_scale, o.scale); gl.uniform1f(u.u_intensity, o.intensity);
    gl.uniform3fv(u.u_c0, c[0]); gl.uniform3fv(u.u_c1, c[1]); gl.uniform3fv(u.u_c2, c[2]); gl.uniform3fv(u.u_c3, c[3]); gl.uniform3fv(u.u_base, b);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // the viewport sits at the bottom-left of the shared buffer, which is the bottom of its image
    g.drawImage(S.c, 0, S.h - h, w, h, 0, 0, w, h);
  }

  destroy(): void {}
}
