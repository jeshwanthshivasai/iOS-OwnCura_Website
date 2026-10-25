/* The earth, as in v5: the delivered globe (handoff/reference/globe/owncura-globe-page.js, "Page build of owncura-globe.js") run under the page's own hooks (v5's Component: preLight, globeHold, applyUsStyle, lightenGlobe, labLayers, buildBands).
   The map comes from the packed style and tiles (public/globe), OpenFreeMap's "dark" style and planet tiles for zooms 0–3, so it needs no tile server. The data licence requires the map credit: MapLibre's compact attribution control stays.
   The globe and its halo stay hidden until the light palette, the states and the bands are on and the tiles are in, then fade in together (no black sphere, no states arriving one by one). */
import type { Map as MapLibreMap, StyleSpecification, LayerSpecification } from "maplibre-gl";
import type { Feature, FeatureCollection, LineString, MultiPolygon, Polygon, Position } from "geojson";
import { GLOBE_HALO, GLOBE_ZOOM, HALO_HEIGHT, HALO_STRENGTH, SPHERE_OPACITY } from "../settings";

type MapLibre = typeof import("maplibre-gl");
type Outline = FeatureCollection<LineString, { mx: number; my: number }>;

/* ======= SETTINGS (the globe file's) ======= */
const CAMERA = {
  center: [-98.5, 31.5] as [number, number], // south of the US centroid → country sits upper-middle after the tilt
  zoomStart: 2.75, // flat, top-down
  zoomHome: GLOBE_ZOOM, // settled overview (v5 sets the file's 3.5 to the Tweak's 3.7 before the globe starts)
  pitch: 50, // settled tilt
  entryDuration: 3000, // ms; default easing = CSS "ease"
};
const OUTLINE = {
  angle: 25, // gradient direction in degrees: 0 = west→east, 90 = south→north
  width: 1.6, // stroke width, px
  glow: true, // soft glow under the stroke
  fillOpacity: 0.06, // faint brand fill inside the USA (0 = none)
};
// the page's palette for the sphere: the file sets a dark sky and black fog after its style loads; these run on the same events, after it, and keep the sphere light
const SKY = { "sky-color": "#ECEDEA", "sky-horizon-blend": 0.02, "horizon-color": "#ECEDEA", "horizon-fog-blend": 0, "fog-color": "#ECEDEA", "fog-ground-blend": 0, "atmosphere-blend": 0 };
const LIGHT: Record<string, Record<string, string>> = { background: { "background-color": "#E2E4E0" }, water: { "fill-color": "#F3F4F1" }, waterway: { "line-color": "#F3F4F1" } };

interface Assets { ml: MapLibre; style: StyleSpecification; tiles: Record<string, string>; usFill: Feature<MultiPolygon | Polygon>; usOutline: Outline; usStates: FeatureCollection }
let assets: Promise<Assets> | null = null;
const json = <T,>(url: string) => fetch(url).then((r) => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json() as Promise<T>; });

/** Fetches MapLibre and the globe's data once. */
export function preload(): Promise<Assets> {
  if (!assets) {
    assets = Promise.all([
      import("maplibre-gl"), json<StyleSpecification>("/globe/tile-style.json"), json<Record<string, string>>("/globe/tiles.json"),
      json<Feature<MultiPolygon | Polygon>>("/globe/us-fill.json"), json<Outline>("/globe/us-outline.json"), json<FeatureCollection>("/globe/us-states.json"),
    ]).then(([ml, style, tiles, usFill, usOutline, usStates]) => ({ ml: (ml as unknown as { default?: MapLibre }).default ?? (ml as unknown as MapLibre), style, tiles, usFill, usOutline, usStates }));
  }
  return assets;
}

// the packed map: the same style and tiles everywhere, no network. Tiles are base64 in the pack; missing ones are empty.
let packInstalled = false;
function installPack(ml: MapLibre, tiles: Record<string, string>): void {
  if (packInstalled || !ml.addProtocol) return;
  packInstalled = true;
  const cache: Record<string, ArrayBuffer> = {};
  ml.addProtocol("ocpack", async (params) => {
    const k = String(params.url).replace(/^ocpack:\/\//, "").replace(/\.pbf$/, "");
    if (!(k in cache)) {
      const s = tiles[k];
      if (s) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); cache[k] = u.buffer; }
      else cache[k] = new ArrayBuffer(0);
    }
    return { data: cache[k].slice(0) };
  });
}

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const dark = (v: unknown) => typeof v === "string" && /^hsl\(0,\s*0%,\s*(1\d|2\d)%\)$/.test(v.replace(/\s+/g, " "));

export class Globe {
  map: MapLibreMap | null = null;
  private shown = false;
  private lightDone = false;
  private bandsBuilt = false;
  private waiting = false;
  private usKey: string | null = null;
  private labKey: string | null = null;
  private haloKey: number | null = null;
  private ro: ResizeObserver | null = null;
  private io: IntersectionObserver | null = null;
  private timers: number[] = [];
  private destroyed = false;
  private A: Assets | null = null;

  /**
   * @param container the #map element
   * @param section the globe section the entrance watches
   * @param halo the brand halo under the horizon
   */
  constructor(private readonly container: HTMLElement, private readonly section: HTMLElement, private readonly halo: HTMLElement | null) {}

  /** Starts the globe once its assets are in (v5 loadGlobe → OC_GLOBE_START). */
  async start(): Promise<void> {
    const A = await preload();
    if (this.destroyed || this.map) return;
    this.A = A;
    const ml = A.ml;
    installPack(ml, A.tiles);
    const style = JSON.parse(JSON.stringify(A.style)) as StyleSpecification;
    const map = new ml.Map({
      container: this.container, style,
      center: CAMERA.center, zoom: CAMERA.zoomStart, pitch: 0, bearing: 0,
      interactive: false, // no drag / wheel / touch
      attributionControl: false,
      canvasContextAttributes: { antialias: true },
    });
    this.map = map;
    this.preLight(map);
    this.hold();
    map.on("idle", () => this.applyUsStyle());
    map.on("styledata", () => this.applyUsStyle());
    map.addControl(new ml.AttributionControl({ compact: true })); // OpenFreeMap / OSM credit is required
    map.on("style.load", () => this.applyLook(map));
    // ENTRY: ≥25% of the section visible → one 3 s ease, pitch 0→50, zoom 2.75→home, centre fixed
    let settled = false;
    this.io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.25 && !settled) {
        map.easeTo({ pitch: CAMERA.pitch, zoom: CAMERA.zoomHome, duration: CAMERA.entryDuration });
        map.once("moveend", () => { settled = true; });
      }
    }), { threshold: 0.25 });
    this.io.observe(this.section);
    if (window.ResizeObserver) { this.ro = new ResizeObserver(() => { try { map.resize(); } catch {} }); this.ro.observe(this.container); }
  }

  resize(): void { if (this.map) { try { this.map.resize(); } catch {} } }

  destroy(): void {
    this.destroyed = true;
    this.timers.forEach((t) => clearTimeout(t)); this.timers = [];
    if (this.io) this.io.disconnect(); if (this.ro) this.ro.disconnect();
    if (this.map) { try { this.map.remove(); } catch {} this.map = null; }
  }

  // ---------- the look the globe file applies after its style loads (dark); the page's hooks keep it light ----------
  private applyLook(map: MapLibreMap): void {
    const A = this.A!;
    map.setProjection({ type: "globe" });
    map.setSky({
      "sky-color": css("--bg"), "sky-horizon-blend": 0.04,
      "horizon-color": "#000000", "horizon-fog-blend": 0.1,
      "fog-color": "#000000", "fog-ground-blend": 0.2,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.5, 4, 0.3, 7, 0],
    });
    const paint = (id: string, prop: string, v: unknown) => { if (map.getLayer(id)) map.setPaintProperty(id, prop, v); };
    paint("background", "background-color", "hsl(0, 0%, 16%)");
    paint("water", "fill-color", "hsl(0, 0%, 10%)");
    paint("waterway", "line-color", "hsl(0, 0%, 10%)");
    ["landuse_park", "landcover_wood", "landuse_residential"].forEach((l) => paint(l, "fill-color", "hsl(0, 0%, 14%)"));
    ["boundary_country_z0-4", "boundary_country_z5-", "boundary_state"].forEach((l) => paint(l, "line-color", "hsl(0, 0%, 26%)"));
    // no labels, no icons
    map.getStyle().layers.filter((l) => l.type === "symbol").forEach((l) => map.setLayoutProperty(l.id, "visibility", "none"));

    // USA: faint fill + gradient stroke (each outline segment carries its midpoint; colour = position along the gradient axis)
    const a = (OUTLINE.angle * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
    const pts = A.usOutline.features.map((f) => f.properties).filter((p) => p.mx > -125 && p.mx < -66 && p.my > 24 && p.my < 50); // contiguous US sets the range
    const proj = (p: { mx: number; my: number }) => p.mx * cos + p.my * sin;
    const lo = Math.min(...pts.map(proj)), hi = Math.max(...pts.map(proj));
    const t = ["/", ["-", ["+", ["*", ["get", "mx"], cos], ["*", ["get", "my"], sin]], lo], hi - lo];
    const grad = ["interpolate", ["linear"], ["max", 0, ["min", 1, t]], 0, css("--brand-from"), 1, css("--brand-to")];

    map.addSource("us-fill", { type: "geojson", data: A.usFill });
    map.addSource("us-outline", { type: "geojson", data: A.usOutline });
    if (OUTLINE.fillOpacity > 0) map.addLayer({ id: "us-fill", type: "fill", source: "us-fill", paint: { "fill-color": css("--brand-from"), "fill-opacity": OUTLINE.fillOpacity } });
    if (OUTLINE.glow) map.addLayer({ id: "us-glow", type: "line", source: "us-outline", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": grad, "line-width": 7, "line-blur": 7, "line-opacity": 0.35 } } as LayerSpecification);
    map.addLayer({ id: "us-line", type: "line", source: "us-outline", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": grad, "line-width": OUTLINE.width, "line-opacity": 0.95 } } as LayerSpecification);
  }

  // ---------- the page's hooks ----------
  // the globe and its halo stay hidden until the palette, the states and the bands are on and the tiles are in
  private hold(): void {
    const mc = this.container, ha = this.halo;
    mc.style.transition = "opacity .4s ease"; mc.style.opacity = "0";
    if (ha) ha.style.visibility = "hidden";
    this.timers.push(window.setTimeout(() => this.show(), 6000));
  }
  private show(): void {
    if (this.shown) return; this.shown = true;
    this.container.style.opacity = "1";
    if (this.halo) this.halo.style.visibility = "visible";
  }
  // before the first frame: whatever dark sky or paint the file sets is turned light on the way in
  private preLight(m: MapLibreMap): void {
    const map = m as unknown as Record<string, unknown>;
    const oSky = m.setSky.bind(m), oPaint = m.setPaintProperty.bind(m);
    map.setSky = (v: Record<string, unknown> | undefined) => { if (v && v.__oc) { const o = { ...v }; delete o.__oc; return oSky(o as never); } return oSky(SKY as never); };
    map.setPaintProperty = (id: string, prop: string, v: unknown, o?: unknown) => {
      const Lp = LIGHT[id];
      if (Lp && Lp[prop] && (dark(v) || v === "#000000")) v = Lp[prop];
      else if (dark(v)) v = "#E6E8E4";
      return oPaint(id, prop, v, o as never);
    };
    const light = () => {
      try { const h = GLOBE_HALO; oSky({ ...SKY, "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, h, 4, h * 0.8, 7, 0] } as never); this.haloKey = h; } catch {}
      Object.keys(LIGHT).forEach((id) => { try { if (m.getLayer(id)) Object.keys(LIGHT[id]).forEach((p) => oPaint(id, p, LIGHT[id][p])); } catch {} });
    };
    light(); m.on("style.load", () => setTimeout(light, 0)); m.on("load", () => setTimeout(light, 0));
  }
  private applyUsStyle(): void {
    const m = this.map; if (!m || !m.getLayer || !m.getLayer("us-line")) return;
    if (!this.lightDone) { this.lightDone = true; try { this.lightenGlobe(m); } catch (e) { console.warn("globe palette", e); } }
    try { this.labLayers(m); } catch (e) { console.warn("lab", e); }
    const halo = GLOBE_HALO;
    if (this.haloKey !== halo) { this.haloKey = halo; try { m.setSky({ __oc: true, "sky-color": "#ECEDEA", "sky-horizon-blend": 0.02, "horizon-color": "#ECEDEA", "horizon-fog-blend": 0, "fog-color": "#ECEDEA", "fog-ground-blend": 0, "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, halo, 4, halo * 0.8, 7, 0] } as never); m.triggerRepaint(); } catch {} }
    if (!this.bandsBuilt) { this.bandsBuilt = true; try { this.buildBands(m); } catch (e) { console.warn("bands", e); } }
    if (!this.shown && !this.waiting && this.bandsBuilt && this.lightDone) {
      this.waiting = true; const t0 = performance.now();
      const poll = () => { if (this.shown || this.destroyed) return; let ok = true; try { ok = !!(m.isStyleLoaded() && m.areTilesLoaded()); } catch {} if (ok || performance.now() - t0 > 2500) requestAnimationFrame(() => requestAnimationFrame(() => this.show())); else setTimeout(poll, 80); };
      setTimeout(poll, 0);
    }
    // the US as a shape (usStyle fill): the gradient bands, white state lines, the glow under them; the stroke is off
    const key = "f"; if (this.usKey === key) return; this.usKey = key;
    try {
      m.setLayoutProperty("us-line", "visibility", "none");
      if (m.getLayer("us-glow")) m.setPaintProperty("us-glow", "line-opacity", 0.5);
      if (m.getLayer("us-fill")) m.setPaintProperty("us-fill", "fill-opacity", 0);
      if (m.getLayer("oc-us-bands")) m.setLayoutProperty("oc-us-bands", "visibility", "visible");
      if (m.getLayer("oc-us-states")) { m.setPaintProperty("oc-us-states", "line-color", "rgba(255,255,255,0.72)"); m.setPaintProperty("oc-us-states", "line-width", 1); }
    } catch {}
  }
  // the globe in the page's palette: land the hero grey, water a shade lighter, borders as ink hairlines (states included), roads off
  private lightenGlobe(m: MapLibreMap): void {
    const land = "#E2E4E0", water = "#F3F4F1", paint = (id: string, p: string, v: unknown) => { if (m.getLayer(id)) { try { m.setPaintProperty(id, p, v); } catch {} } };
    m.getStyle().layers.forEach((l) => {
      if (l.id.startsWith("us-") || l.id.startsWith("oc-")) return;
      if (l.type === "background") paint(l.id, "background-color", land);
      else if (l.type === "fill") paint(l.id, "fill-color", /water/i.test(l.id) ? water : land);
      else if (l.type === "line") {
        if (/boundary/i.test(l.id)) { paint(l.id, "line-color", "rgba(20,23,28,0.4)"); paint(l.id, "line-width", /state/i.test(l.id) ? 0.7 : 1); paint(l.id, "line-opacity", 1); }
        else if (/water/i.test(l.id)) paint(l.id, "line-color", water);
        else paint(l.id, "line-opacity", 0);
      }
    });
  }
  // 1 depth: a brand halo at the horizon (CSS, under the canvas). 2 the sphere body the page grey. (3, the dotted land, is off; 4, the settled zoom, is fixed at CAMERA.zoomHome, which the entrance lands on.)
  private labLayers(m: MapLibreMap): void {
    if (!m.getStyle || !m.getStyle()) return;
    const paint = (id: string, p: string, v: unknown) => { if (m.getLayer(id)) { try { m.setPaintProperty(id, p, v); } catch {} } };
    if (!m.getSource("oc-body")) {
      try {
        const world: Feature<Polygon> = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]] } };
        m.addSource("oc-body", { type: "geojson", data: world });
        const first = (m.getStyle().layers[0] || {}).id;
        m.addLayer({ id: "oc-body", type: "fill", source: "oc-body", paint: { "fill-color": "#E2E4E0", "fill-opacity": 1, "fill-antialias": false } }, first);
      } catch (e) { console.warn("body", e); }
    }
    const dk = [false, true, HALO_STRENGTH, HALO_HEIGHT, SPHERE_OPACITY].join();
    if (this.labKey !== dk) {
      this.labKey = dk;
      m.getStyle().layers.forEach((l) => { if (l.id.startsWith("us-") || l.id.startsWith("oc-")) return; if (l.type === "background") paint(l.id, "background-color", "#E2E4E0"); else if (l.type === "fill") paint(l.id, "fill-color", /water/i.test(l.id) ? "#F3F4F1" : "#E2E4E0"); else if (l.type === "line" && /boundary/i.test(l.id)) paint(l.id, "line-opacity", 1); });
      const h = this.halo; if (h) { h.style.opacity = String(HALO_STRENGTH); h.style.height = HALO_HEIGHT + "vh"; }
      const so = SPHERE_OPACITY; paint("oc-body", "fill-opacity", 1); paint("oc-body", "fill-color", "#E6E8E4");
      m.getStyle().layers.forEach((l) => { if (l.id.startsWith("us-") || l.id.startsWith("oc-")) return; if (l.type === "background") { paint(l.id, "background-opacity", 1); paint(l.id, "background-color", "#E6E8E4"); } else if (l.type === "fill") { const water = /water/i.test(l.id); paint(l.id, "fill-opacity", water ? so : 1); if (!water) paint(l.id, "fill-color", "#E6E8E4"); } });
    }
  }
  // the US filled with the brand gradient as 44 bands across the outline's gradient axis, and its state lines
  private buildBands(m: MapLibreMap): void {
    const A = this.A!;
    const a = (OUTLINE.angle * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a), proj = (p: Position) => p[0] * cos + p[1] * sin;
    const pts = A.usOutline.features.map((f) => f.properties).filter((p) => p.mx > -125 && p.mx < -66 && p.my > 24 && p.my < 50);
    const lo = Math.min(...pts.map((p) => p.mx * cos + p.my * sin)), hi = Math.max(...pts.map((p) => p.mx * cos + p.my * sin));
    const clip = (pts2: Position[], inside: (p: Position) => boolean, inter: (p: Position, q: Position) => Position) => { const out: Position[] = []; for (let i = 0; i < pts2.length; i++) { const P = pts2[i], Q = pts2[(i + 1) % pts2.length], pin = inside(P), qin = inside(Q); if (pin) out.push(P); if (pin !== qin) out.push(inter(P, Q)); } return out; };
    const cut = (P: Position, Q: Position, v: number): Position => { const pp = proj(P), pq = proj(Q), t = (v - pp) / (pq - pp); return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]; };
    const rings: Position[][] = []; const g = A.usFill.geometry;
    (g.type === "MultiPolygon" ? g.coordinates : [g.coordinates]).forEach((poly) => poly.forEach((ring) => rings.push(ring)));
    const N = 44, feats: Feature<Polygon>[] = [], from = [46, 108, 184], to = [52, 179, 165];
    for (let i = -1; i <= N; i++) {
      const p0 = i < 0 ? -1e9 : lo + ((hi - lo) * i) / N, p1 = i >= N ? 1e9 : lo + ((hi - lo) * (i + 1.35)) / N, t = Math.max(0, Math.min(1, (i + 0.5) / N));
      const c = "#" + [0, 1, 2].map((k) => Math.round(from[k] + (to[k] - from[k]) * t).toString(16).padStart(2, "0")).join("");
      rings.forEach((ring) => { let r = clip(ring, (P) => proj(P) >= p0, (P, Q) => cut(P, Q, p0)); if (r.length < 3) return; r = clip(r, (P) => proj(P) <= p1, (P, Q) => cut(P, Q, p1)); if (r.length < 3) return; r.push(r[0]); feats.push({ type: "Feature", properties: { c }, geometry: { type: "Polygon", coordinates: [r] } }); });
    }
    m.addSource("oc-us-bands", { type: "geojson", data: { type: "FeatureCollection", features: feats } });
    if (A.usStates && !m.getSource("oc-us-states")) { m.addSource("oc-us-states", { type: "geojson", data: A.usStates }); m.addLayer({ id: "oc-us-states", type: "line", source: "oc-us-states", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "rgba(20,23,28,0.4)", "line-width": 0.7 } }, m.getLayer("us-glow") ? "us-glow" : "us-line"); }
    const under = ["boundary_state", "boundary_country_z0-4", "boundary_country_z5-", "us-glow", "us-line"].find((id) => m.getLayer(id));
    m.addLayer({ id: "oc-us-bands", type: "fill", source: "oc-us-bands", layout: { visibility: "none" }, paint: { "fill-color": ["get", "c"], "fill-opacity": 1, "fill-antialias": false } }, under);
    // keep the state lines on top of the bands
    if (m.getLayer("oc-us-states")) m.moveLayer("oc-us-states", m.getLayer("us-glow") ? "us-glow" : "us-line");
  }
}
