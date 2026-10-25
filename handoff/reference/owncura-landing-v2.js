/* OwnCura landing helpers: US map dot field (WebGL), smooth scroll, cursor, easing. Loaded from <helmet>. */
(function () {
  const OC = window.OC = window.OC || {};

  OC.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  OC.lerp = (a, b, t) => a + (b - a) * t;
  OC.range = (p, a, b) => OC.clamp((p - a) / (b - a), 0, 1);
  OC.smooth = t => t * t * (3 - 2 * t);
  OC.expoOut = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  OC.quintOut = t => 1 - Math.pow(1 - t, 5);
  OC.inOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Lower 48 outline (lon, lat), clockwise. Lake Michigan cut out as a hole.
  OC.US = [[-124.73,48.39],[-122.75,49.0],[-95.16,49.0],[-95.15,49.38],[-94.8,49.32],[-94.6,48.72],[-93.4,48.6],[-92.5,48.45],[-91.0,48.2],[-89.6,48.0],[-90.6,47.6],[-91.6,47.05],[-92.1,46.78],[-91.0,46.62],[-90.4,46.6],[-89.3,46.9],[-88.4,47.2],[-87.9,47.45],[-88.3,46.9],[-87.4,46.55],[-86.6,46.42],[-85.9,46.7],[-85.0,46.75],[-84.35,46.5],[-83.6,46.1],[-82.5,45.35],[-82.15,44.5],[-82.4,43.0],[-82.5,42.6],[-83.1,42.1],[-82.7,41.7],[-81.5,42.0],[-80.5,42.3],[-79.05,43.1],[-78.0,43.6],[-76.8,43.62],[-76.2,44.1],[-75.3,44.9],[-74.7,45.0],[-71.5,45.0],[-71.3,45.3],[-70.9,45.3],[-70.3,46.0],[-70.0,46.7],[-69.2,47.45],[-68.3,47.35],[-67.8,47.1],[-67.8,45.7],[-67.4,45.2],[-67.0,44.8],[-68.2,44.4],[-69.0,44.1],[-70.2,43.7],[-70.6,43.1],[-70.8,42.7],[-70.6,42.6],[-71.0,42.3],[-70.5,41.8],[-70.0,42.05],[-70.0,41.7],[-70.7,41.6],[-71.4,41.5],[-72.0,41.3],[-73.2,41.1],[-74.0,40.6],[-74.0,40.3],[-74.1,39.8],[-74.4,39.35],[-74.9,38.95],[-75.3,39.3],[-75.1,38.8],[-75.1,38.4],[-75.0,38.0],[-75.6,37.6],[-75.95,37.1],[-76.0,36.8],[-75.7,36.2],[-75.5,35.25],[-76.5,34.6],[-77.95,33.85],[-78.9,33.6],[-79.9,32.75],[-81.0,32.0],[-81.4,31.2],[-81.4,30.4],[-81.0,29.2],[-80.6,28.4],[-80.05,26.8],[-80.15,25.75],[-80.4,25.2],[-81.0,24.9],[-81.8,24.55],[-81.1,25.15],[-81.8,26.1],[-82.3,26.9],[-82.7,27.7],[-82.8,28.6],[-83.1,29.1],[-83.6,29.8],[-84.2,30.05],[-85.0,29.65],[-85.7,30.15],[-86.5,30.4],[-87.2,30.35],[-88.0,30.4],[-88.9,30.4],[-89.5,30.15],[-89.2,29.5],[-89.0,29.15],[-89.4,29.0],[-90.1,29.1],[-90.9,29.05],[-91.4,29.5],[-92.0,29.6],[-93.3,29.75],[-93.85,29.7],[-94.8,29.3],[-95.8,28.6],[-96.5,28.3],[-97.3,27.7],[-97.4,26.5],[-97.15,25.95],[-97.8,26.05],[-98.5,26.2],[-99.1,26.4],[-99.5,27.5],[-100.0,28.0],[-100.5,28.7],[-101.4,29.75],[-102.3,29.9],[-102.7,29.7],[-103.1,28.98],[-103.8,29.3],[-104.5,29.6],[-105.0,30.6],[-106.4,31.75],[-108.2,31.78],[-108.2,31.33],[-111.07,31.33],[-114.8,32.5],[-114.7,32.72],[-117.12,32.53],[-117.25,32.75],[-117.4,33.2],[-118.4,33.75],[-118.8,34.0],[-120.5,34.45],[-120.65,35.0],[-121.3,35.7],[-121.9,36.6],[-122.0,36.95],[-122.5,37.75],[-123.0,38.0],[-123.7,38.9],[-124.0,40.0],[-124.4,40.45],[-124.1,41.1],[-124.2,41.8],[-124.55,42.85],[-124.1,43.4],[-124.0,44.5],[-123.95,45.5],[-124.0,46.25],[-124.1,47.0],[-124.7,47.9]];
  OC.LAKE = [[-87.9,41.7],[-87.5,41.7],[-86.8,41.8],[-86.3,42.2],[-86.5,43.5],[-86.4,44.1],[-85.6,45.2],[-84.9,45.8],[-85.5,46.0],[-86.9,45.9],[-87.6,45.1],[-87.9,44.6],[-87.7,43.9],[-87.9,43.0],[-87.8,42.4]];

  // Albers conic equal-area (d3.geoAlbers defaults). Returns [x, y] with y up.
  OC.albers = (function () {
    const d = Math.PI / 180, p1 = 29.5 * d, p2 = 45.5 * d, l0 = -96 * d, f0 = 23 * d;
    const n = (Math.sin(p1) + Math.sin(p2)) / 2;
    const C = Math.cos(p1) * Math.cos(p1) + 2 * n * Math.sin(p1);
    const r0 = Math.sqrt(C - 2 * n * Math.sin(f0)) / n;
    return function (lon, lat) {
      const r = Math.sqrt(C - 2 * n * Math.sin(lat * d)) / n, th = n * (lon * d - l0);
      return [r * Math.sin(th), r0 - r * Math.cos(th)];
    };
  })();

  OC.inPoly = function (x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

  // Projected polygons scaled into a box {x, y, w, h} (screen coords, y down).
  OC.usInBox = function (box) {
    const proj = OC.US.map(p => OC.albers(p[0], p[1]));
    const lake = OC.LAKE.map(p => OC.albers(p[0], p[1]));
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    proj.forEach(p => { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    const s = Math.min(box.w / (maxX - minX), box.h / (maxY - minY));
    const w = (maxX - minX) * s, h = (maxY - minY) * s;
    const ox = box.x + (box.w - w) / 2, oy = box.y + (box.h - h) / 2;
    const map = p => [ox + (p[0] - minX) * s, oy + (maxY - p[1]) * s];
    return { outer: proj.map(map), lake: lake.map(map), x: ox, y: oy, w, h };
  };

  // Dot field: faint grid everywhere, the dots inside the US coloured with the Independence OS gradient.
  // Every field on a page shares one WebGL context: each keeps its own buffer, draws into the shared canvas and copies the result into its own canvas.
  // Browsers drop the oldest contexts past about 16, and the landing page holds more surfaces than that; dropped ones went blank.
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
  let DG = null;
  const dotGL = () => {
    if (DG) return DG;
    const c = document.createElement('canvas'); c.width = c.height = 2;
    const gl = c.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false });
    if (!gl) return (DG = { gl: null });
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram();
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, DOT_VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, DOT_FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn('OC dot field: shader link failed', gl.getProgramInfoLog(pr)); return (DG = { gl: null }); }
    gl.useProgram(pr); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const u = {}; ['u_res', 'u_mouse', 'u_time', 'u_map', 'u_dpr', 'u_fade', 'u_base', 'u_blue', 'u_teal', 'u_baseA', 'u_mapA'].forEach(k => u[k] = gl.getUniformLocation(pr, k));
    const a = { pos: gl.getAttribLocation(pr, 'a_pos'), in: gl.getAttribLocation(pr, 'a_in'), t: gl.getAttribLocation(pr, 'a_t'), ph: gl.getAttribLocation(pr, 'a_ph') };
    [a.pos, a.in, a.t, a.ph].forEach(l => gl.enableVertexAttribArray(l));
    // a lost context is rebuilt on the next draw; every field re-uploads its buffer into the new one
    c.addEventListener('webglcontextlost', e => { e.preventDefault(); DG = null; });
    return (DG = { c, gl, u, a, w: 2, h: 2 });
  };
  OC.DotField = class {
    constructor(canvas, opts) {
      this.c = canvas;
      this.o = Object.assign({ spacing: 15, base: [0.78, 0.79, 0.77], baseA: 0.75, blue: [0.18, 0.42, 0.72], teal: [0.20, 0.70, 0.65], mapA: 0.7, mapW: 0.66, cx: 0.5, cy: 0.55 }, opts || {});
      this.fade = 1; this.map = 0; this.mouse = [-9999, -9999]; this.n = 0;
      this.onMove = e => { const r = this.c.getBoundingClientRect(); this.mouse = [e.clientX - r.left, e.clientY - r.top]; };
      this.onLeave = () => { this.mouse = [-9999, -9999]; };
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('pointerleave', this.onLeave);
      this.onResize = () => this.resize();
      window.addEventListener('resize', this.onResize);
      this.init();
      this.resize();
    }
    // the field's own canvas is a plain 2D one; subclasses that build their own points only have to set this.data and this.n in resize()
    init() { this.g2 = this.c.getContext('2d'); }
    resize() {
      const dpr = this.dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = this.w = this.c.clientWidth || 1, h = this.h = this.c.clientHeight || 1;
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      const o = this.o, s = o.spacing;
      const mw = w * o.mapW, mh = mw * 0.62;
      const box = { x: w * o.cx - mw / 2, y: h * o.cy - mh / 2, w: mw, h: mh };
      const us = this.us = OC.usInBox(box);
      const cols = Math.ceil(w / s) + 2, rows = Math.ceil(h / s) + 2, data = [];
      let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * s + (rnd() - 0.5) * 2.2, y = j * s + (rnd() - 0.5) * 2.2;
        const inside = OC.inPoly(x, y, us.outer) && !OC.inPoly(x, y, us.lake) ? 1 : 0;
        data.push(x, y, inside, OC.clamp((x - us.x) / us.w, 0, 1), rnd());
      }
      this.n = data.length / 5;
      this.data = data;
    }
    render(time) {
      const o = this.o, cw = this.c.clientWidth, ch = this.c.clientHeight;
      if (cw > 1 && ch > 1 && (cw !== this.w || ch !== this.h)) this.resize();
      if (this.w <= 1 || this.h <= 1) return;
      const g = this.g2; if (!g || !this.data) return;
      const S = dotGL();
      if (!S.gl) {
        g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.clearRect(0, 0, this.w, this.h);
        for (let i = 0; i < this.data.length; i += 5) {
          const inside = this.data[i + 2], t = this.data[i + 3], k = inside * this.map;
          const r = Math.round(255 * OC.lerp(o.base[0], OC.lerp(o.blue[0], o.teal[0], t), k)), gc = Math.round(255 * OC.lerp(o.base[1], OC.lerp(o.blue[1], o.teal[1], t), k)), b = Math.round(255 * OC.lerp(o.base[2], OC.lerp(o.blue[2], o.teal[2], t), k));
          g.fillStyle = `rgba(${r},${gc},${b},${(OC.lerp(o.baseA, o.mapA, k) * this.fade).toFixed(3)})`;
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
    destroy() {
      window.removeEventListener('pointermove', this.onMove); window.removeEventListener('pointerleave', this.onLeave); window.removeEventListener('resize', this.onResize);
      if (this.buf && this.bufS && this.bufS === DG && DG.gl) DG.gl.deleteBuffer(this.buf);
      this.buf = null;
    }
  };

  // Lenis-style smooth scroll on native scroll: wheel is intercepted and lerped, everything else stays native.
  OC.SmoothScroll = class {
    constructor(opts) {
      this.o = Object.assign({ lerp: 0.085, enabled: true }, opts || {});
      this.target = this.current = window.scrollY; this.velocity = 0; this.locked = false; this.prev = window.scrollY;
      this.onWheel = e => {
        if (!this.o.enabled || this.locked || e.ctrlKey) return;
        if (e.target && e.target.closest && e.target.closest('[data-native-scroll]')) return;
        e.preventDefault();
        let d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
        this.target = OC.clamp(this.target + d, 0, this.max());
      };
      this.onScroll = () => { if (Math.abs(window.scrollY - this.current) > 1.5) { this.current = this.target = window.scrollY; } };
      window.addEventListener('wheel', this.onWheel, { passive: false });
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
    max() { return Math.max(0, document.documentElement.scrollHeight - window.innerHeight); }
    scrollTo(y) { this.target = OC.clamp(y, 0, this.max()); if (!this.o.enabled) window.scrollTo(0, this.target); }
    update() {
      if (this.o.enabled) {
        const d = this.target - this.current;
        if (Math.abs(d) > 0.4) { this.current += d * this.o.lerp; window.scrollTo(0, this.current); }
        else if (this.current !== this.target) { this.current = this.target; window.scrollTo(0, this.current); }
      } else { this.current = this.target = window.scrollY; }
      this.velocity = this.current - this.prev; this.prev = this.current;
    }
    destroy() { window.removeEventListener('wheel', this.onWheel); window.removeEventListener('scroll', this.onScroll); }
  };

  // Custom cursor: a dot that grows into a ring over interactive elements and hides over text fields.
  OC.Cursor = class {
    constructor(root, color) {
      this.root = root; this.x = this.tx = window.innerWidth / 2; this.y = this.ty = window.innerHeight / 2; this.mode = 'dot'; this.shown = false;
      const el = this.el = document.createElement('div');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = `position:fixed;left:0;top:0;width:10px;height:10px;border-radius:50%;background:${color || '#14171C'};pointer-events:none;z-index:9999;transform:translate(-50%,-50%);opacity:0;transition:width .35s cubic-bezier(.22,1,.36,1),height .35s cubic-bezier(.22,1,.36,1),background .35s,border .35s,opacity .3s;box-sizing:border-box;will-change:transform;`;
      document.body.appendChild(el);
      root.style.cursor = 'none';
      this.onMove = e => { this.tx = e.clientX; this.ty = e.clientY; if (!this.shown) { this.x = this.tx; this.y = this.ty; this.shown = true; } this.el.style.opacity = this.mode === 'hide' ? '0' : '1'; };
      this.onOver = e => {
        const t = e.target; if (!t || !t.closest) return;
        const txt = t.closest('input:not([type=range]), textarea, select');
        const act = t.closest('a, button, [role=button], input[type=range], label, [data-cursor]');
        this.set(txt ? 'hide' : act ? 'ring' : 'dot');
      };
      this.onLeave = () => { this.el.style.opacity = '0'; };
      window.addEventListener('pointermove', this.onMove, { passive: true });
      document.addEventListener('pointerover', this.onOver, { passive: true });
      document.documentElement.addEventListener('mouseleave', this.onLeave);
      this.color = color || '#14171C';
    }
    set(m) {
      if (m === this.mode) return; this.mode = m; const s = this.el.style;
      if (m === 'hide') { s.opacity = '0'; return; }
      s.opacity = '1';
      if (m === 'ring') { s.width = s.height = '44px'; s.background = 'rgba(46,108,184,0.10)'; s.border = `1.5px solid ${this.color}`; }
      else { s.width = s.height = '10px'; s.background = this.color; s.border = '0 solid transparent'; }
    }
    update() { this.x += (this.tx - this.x) * 0.22; this.y += (this.ty - this.y) * 0.22; this.el.style.transform = `translate(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px) translate(-50%,-50%)`; }
    destroy() { window.removeEventListener('pointermove', this.onMove); document.removeEventListener('pointerover', this.onOver); this.el.remove(); this.root.style.cursor = ''; }
  };
})();
