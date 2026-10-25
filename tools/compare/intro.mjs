/* Side-by-side screenshots of v5's intro and the build's, frame for frame.
   The intro is driven by time, so both pages run under Playwright's fake clock: it is paused before the page loads, stepped to each moment in 16 ms frames, and shot.
   The same fake time on both sides also puts the living gradient and the dotted field at the same frame; the two pages' frame grids can be out of phase by under 16 ms. (CSS transitions, such as the globe's 3 s rise after 8.25 s, run on the real clock and are not aligned by this.)
   Run (with `npm run reference` on 3001 and the app on 3000):
     node tools/compare/intro.mjs --name intro
   Options: --ref URL, --build URL, --out DIR (default compare-out/<name>), --sizes 1280x720,1920x1080@2 (default: the README's seven screens and 1920 × 1080 at DPR 2), --times 0.5,1.2,... (seconds). */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith("--") ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true] : null).filter(Boolean));
const REF = args.ref || "http://localhost:3001";
const BUILD = args.build || "http://localhost:3000";
const NAME = args.name || "intro";
const OUT = args.out || path.join("compare-out", NAME);
const SIZES = (typeof args.sizes === "string" ? args.sizes : "1280x720,1366x768,1440x900,1536x864,1920x1080,2560x1440,3840x2160,1920x1080@2").split(",").map((s) => { const m = s.match(/^(\d+)x(\d+)(?:@(\d+))?$/); return { w: +m[1], h: +m[2], dpr: m[3] ? +m[3] : 1, label: s }; });
// A 0.2–1.7, a beat, B 2.6–3.9, C 4.4–6.8, D 7.2–8.7, E 8.0–9.5, the end at 9.6
const TIMES = (typeof args.times === "string" ? args.times : "0.4,1.0,1.7,2.2,3.0,3.9,4.8,5.65,6.5,7.0,7.6,8.2,8.7,9.2,9.7,10.5").split(",").map(Number).sort((x, y) => x - y);

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const T0 = new Date("2026-10-25T09:00:00Z");

async function open(url, size) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(new Date(T0.getTime() + 1));
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  // step frames until the intro has started (its Skip intro button is up), then it is at t ≈ 0
  const skip = page.getByRole("button", { name: /skip intro/i });
  const started = async () => (await skip.count()) > 0 && (await skip.first().isVisible());
  let n = 0, ok = false;
  while (!(ok = await started()) && n++ < 400) await page.clock.runFor(16);
  if (!ok) console.warn(`${url}: the intro did not start`);
  return { ctx, page, at: 0 };
}
async function advance(p, seconds) {
  const ms = Math.round(seconds * 1000) - p.at;
  if (ms > 0) await page_runFor(p.page, ms);
  p.at += Math.max(0, ms);
}
async function page_runFor(page, ms) { let left = ms; while (left > 0) { const step = Math.min(left, 1000); await page.clock.runFor(step); left -= step; } }

const index = [];
for (const size of SIZES) {
  const dir = path.join(OUT, size.label); fs.mkdirSync(dir, { recursive: true });
  const a = await open(REF, size), b = await open(BUILD, size);
  for (const t of TIMES) {
    await advance(a, t); await advance(b, t);
    const tag = t.toFixed(2).padStart(5, "0") + "s";
    const fa = path.join(dir, `${tag}-ref.png`), fb = path.join(dir, `${tag}-build.png`);
    await a.page.screenshot({ path: fa }); await b.page.screenshot({ path: fb });
    index.push({ size: size.label, t, ref: path.relative(OUT, fa), build: path.relative(OUT, fb) });
    process.stdout.write(`${size.label} t=${t}s\n`);
  }
  await a.ctx.close(); await b.ctx.close();
}
await browser.close();
const rows = index.map((r) => `<tr><th>${r.size}<br>t = ${r.t}s</th><td><img src="${r.ref}"></td><td><img src="${r.build}"></td></tr>`).join("\n");
fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html><meta charset="utf-8"><title>${NAME}: v5 and the build</title>
<style>body{font:13px/1.4 system-ui;margin:16px;background:#fff;color:#111}table{border-collapse:collapse}th{text-align:left;vertical-align:top;padding:6px 10px;white-space:nowrap;font-weight:500}td{padding:4px}img{width:46vw;max-width:900px;display:block;border:1px solid #ddd}</style>
<h1>${NAME}</h1><p>Left: v5 (${REF}). Right: the build (${BUILD}). Both under one fake clock, stepped in 16 ms frames.</p><table>${rows}</table>`);
console.log(`\n${index.length} pairs in ${OUT}/index.html`);
