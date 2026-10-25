/* Checks the ported WebGL helpers against v5's, pixel by pixel.
   The living gradient (lib/gl/mesh-gradient.ts vs handoff/reference/owncura-gradient.js) and the dotted field (lib/gl/dot-field.ts vs owncura-landing-v2.js)
   are drawn side by side in one Chrome page, with the same options, sizes, device pixel ratios and frame times, and their pixels are compared.
   Run: node tools/compare/helpers.mjs */
import { build } from "esbuild";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const ref = path.join(root, "handoff/reference");

const bundle = await build({
  entryPoints: [path.join(here, "helpers-entry.ts")],
  bundle: true, write: false, format: "iife", target: "es2020", logLevel: "silent",
});
const ported = bundle.outputFiles[0].text;

const SIZES = [[1280, 720], [1920, 1080], [600, 300], [340, 340]];
const DPRS = [1, 2];
const TIMES = [0, 1234.5, 98765];
// the gradients the page draws, with their v5 options
const GRADIENTS = {
  hero: { intensity: 0.8, scale: 2.2, speed: 1.2, resolution: 0.5, seed: 7, colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"] },
  four: { intensity: 1, scale: 1.6, speed: 1, resolution: 0.5, seed: 11, colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#E9E2D3"] },
  dome: { intensity: 0.9, scale: 1.3, speed: 0.8, resolution: 0.45, seed: 3, base: "#F8F8F6", colors: ["#2E6CB8", "#34B3A5", "#BFD9F0", "#6FC3DF"] },
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
let worst = 0;
for (const dpr of DPRS) {
  const ctx = await browser.newContext({ viewport: { width: 2000, height: 1200 }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  page.on("console", (m) => { if ((m.type() === "warning" || m.type() === "error") && !/willReadFrequently/.test(m.text())) console.log("[page]", m.text()); });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#F8F8F6"><div id="stage"></div></body></html>`);
  await page.addScriptTag({ path: path.join(ref, "owncura-landing-v2.js") });
  await page.addScriptTag({ path: path.join(ref, "owncura-gradient.js") });
  await page.addScriptTag({ content: ported });
  const out = await page.evaluate(async ({ SIZES, TIMES, GRADIENTS }) => {
    const stage = document.getElementById("stage");
    const mk = (w, h) => { const c = document.createElement("canvas"); c.style.cssText = `display:block;width:${w}px;height:${h}px`; stage.appendChild(c); return c; };
    const pixels = (c) => c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const diff = (a, b) => { if (a.length !== b.length) return { maxDiff: 999, meanDiff: 999, n: a.length, m: b.length }; let mx = 0, sum = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d > mx) mx = d; sum += d; } return { maxDiff: mx, meanDiff: sum / a.length, n: a.length / 4 }; };
    const rows = [];
    const webgl = !!document.createElement("canvas").getContext("webgl");
    for (const [w, h] of SIZES) {
      for (const [name, o] of Object.entries(GRADIENTS)) {
        const a = mk(w, h), b = mk(w, h);
        const ga = new window.OC.MeshGradient(a, o), gb = new window.OCX.MeshGradient(b, o);
        for (const t of TIMES) { ga.render(t); gb.render(t); rows.push({ helper: "MeshGradient " + name, w, h, t, backing: a.width + "x" + a.height + " vs " + b.width + "x" + b.height, ...diff(pixels(a), pixels(b)) }); }
        a.remove(); b.remove();
      }
      {
        const a = mk(w, h), b = mk(w, h);
        const da = new window.OC.DotField(a), db = new window.OCX.DotField(b);
        for (const fade of [1, 0.4]) { da.fade = fade; db.fade = fade; for (const t of TIMES) { da.render(t); db.render(t); rows.push({ helper: "DotField fade " + fade, w, h, t, backing: a.width + "x" + a.height + " vs " + b.width + "x" + b.height, ...diff(pixels(a), pixels(b)) }); } }
        da.destroy(); db.destroy(); a.remove(); b.remove();
      }
    }
    return { webgl, rows };
  }, { SIZES, TIMES, GRADIENTS });
  for (const r of out.rows) { r.dpr = dpr; r.webgl = out.webgl; results.push(r); worst = Math.max(worst, r.maxDiff); }
  await ctx.close();
}
await browser.close();

const byHelper = {};
for (const r of results) { const k = `${r.helper} @${r.dpr}x`; byHelper[k] = byHelper[k] || { cases: 0, maxDiff: 0, meanDiff: 0, backing: new Set() }; const b = byHelper[k]; b.cases++; b.maxDiff = Math.max(b.maxDiff, r.maxDiff); b.meanDiff = Math.max(b.meanDiff, r.meanDiff); b.backing.add(r.backing.split(" vs ")[0] === r.backing.split(" vs ")[1] ? "same" : r.backing); }
console.log(`WebGL in Chrome: ${results[0]?.webgl}`);
console.log("helper                               cases  max |Δ| (0–255)  mean |Δ|   backing store");
for (const [k, b] of Object.entries(byHelper)) console.log(`${k.padEnd(36)} ${String(b.cases).padStart(5)}  ${String(b.maxDiff).padStart(15)}  ${b.meanDiff.toFixed(4).padStart(8)}   ${[...b.backing].join(", ")}`);
console.log(`\nWorst difference over ${results.length} cases: ${worst} (0 means pixel-identical).`);
if (!results[0]?.webgl) { console.log("Chrome had no WebGL: only the 2D fallbacks were compared, so this run proves nothing about the shaders."); process.exit(2); }
process.exit(worst === 0 ? 0 : 1);
