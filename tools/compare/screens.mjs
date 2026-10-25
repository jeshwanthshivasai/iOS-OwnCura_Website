/* Side-by-side screenshots of v5 and the build (README › Build order, step 2 of each section).
   Both pages are opened at the seven screen sizes and at 1920 × 1080 at device pixel ratio 2, scrolled to the same positions, and shot.
   Positions: every 5% through a section's scroll length when --section names its wrapper (for example "[data-stage-wrap]"), else the top of the page.
   Run (with `npm run reference` on 3001 and `npm run dev` on 3000):
     node tools/compare/screens.mjs --name setup
     node tools/compare/screens.mjs --name hero --section "[data-stage-wrap]" --skip-intro
   v5 plays its intro on every load, so from step 2 on pass --skip-intro, or the two pages are shot at different moments of it.
   The percent labels are offsets through the wrapper's pinned length; for [data-s4-wrap] and [data-h-wrap] v5's own progress differs a little (the 04 → 05 hold and the close's rest), but both pages are shot at identical offsets.
   Options: --ref URL (default http://localhost:3001), --build URL (default http://localhost:3000), --out DIR (default compare-out/<name>),
            --step N (percent, default 5), --from N --to N (percent, default 0 and 100), --hold N (viewport heights at the end that are not the section's own progress; 04 has 3), --tail N (only the last N viewport heights: 04 → 05 is --tail 3), --sizes 1280x720,1920x1080@2, --skip-intro (press "Skip intro" on both pages first). */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith("--") ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true] : null).filter(Boolean));
const REF = args.ref || "http://localhost:3001";
const BUILD = args.build || "http://localhost:3000";
const NAME = args.name || "page";
const OUT = args.out || path.join("compare-out", NAME);
const STEP = Number(args.step || 5);
const FROM = Number(args.from || 0), TO = Number(args.to == null ? 100 : args.to);
const SECTION = typeof args.section === "string" ? args.section : null;
const SKIP = !!args["skip-intro"];
const TAIL = Number(args.tail || 0); // only the last N viewport heights of the wrapper (04 → 05 is the last 3 of 04)
const HOLD = Number(args.hold || 0); // viewport heights at the end of the wrapper that are not part of its own progress (04: 3, its 04 → 05 hold)
const SIZES = (typeof args.sizes === "string" ? args.sizes : "1280x720,1366x768,1440x900,1536x864,1920x1080,2560x1440,3840x2160,1920x1080@2")
  .split(",").map((s) => { const m = s.match(/^(\d+)x(\d+)(?:@(\d+))?$/); return { w: +m[1], h: +m[2], dpr: m[3] ? +m[3] : 1, label: s }; });

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(url, size) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  if (SKIP) {
    const skip = page.getByRole("button", { name: /skip intro/i });
    // v5's skip reveals the earth with a 3 s entrance (revealEarth: top 24vh → 36vh, globeEntering held 3.5 s); wait it out so both pages are at rest
    if (await skip.count()) { await skip.first().click({ timeout: 5000 }).catch(() => {}); await sleep(3600); }
  }
  return { ctx, page };
}

// the scroll positions, measured on the page itself: the wrapper's top and its pinned length
async function positions(page, vh) {
  if (!SECTION) return [{ pct: 0, y: 0 }];
  // --tail counts back from the end of the whole pinned length (the hold included), so --tail 3 is 04 → 05 whether or not --hold is given
  const span = await page.evaluate(([sel, hold, tail]) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(), full = r.height - window.innerHeight, len = full - window.innerHeight * hold, top = r.top + window.scrollY; return tail ? { top: top + full - window.innerHeight * tail, len: window.innerHeight * tail } : { top, len }; }, [SECTION, HOLD, TAIL]);
  if (!span) throw new Error(`${SECTION} not found`);
  const out = [];
  for (let pct = FROM; pct <= TO; pct += STEP) out.push({ pct, y: Math.round(span.top + (span.len * pct) / 100) });
  return out;
}

const index = [];
for (const size of SIZES) {
  const dir = path.join(OUT, size.label); fs.mkdirSync(dir, { recursive: true });
  const a = await open(REF, size), b = await open(BUILD, size);
  const posA = await positions(a.page, size.h), posB = await positions(b.page, size.h);
  for (let i = 0; i < posA.length; i++) {
    const pa = posA[i], pb = posB[i] || posA[i];
    for (const [p, y] of [[a.page, pa.y], [b.page, pb.y]]) { await p.evaluate((yy) => window.scrollTo(0, yy), y); }
    await sleep(700);
    const tag = String(pa.pct).padStart(3, "0");
    const fa = path.join(dir, `${tag}-ref.png`), fb = path.join(dir, `${tag}-build.png`);
    await a.page.screenshot({ path: fa }); await b.page.screenshot({ path: fb });
    index.push({ size: size.label, pct: pa.pct, yRef: pa.y, yBuild: pb.y, ref: path.relative(OUT, fa), build: path.relative(OUT, fb) });
    process.stdout.write(`${size.label} ${tag}%  ref y=${pa.y}  build y=${pb.y}\n`);
  }
  await a.ctx.close(); await b.ctx.close();
}
await browser.close();

// a contact sheet: v5 on the left, the build on the right
const rows = index.map((r) => `<tr><th>${r.size}<br>${r.pct}%<br><small>y ${r.yRef} · ${r.yBuild}</small></th><td><img src="${r.ref}"></td><td><img src="${r.build}"></td></tr>`).join("\n");
fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html><meta charset="utf-8"><title>${NAME}: v5 and the build</title>
<style>body{font:13px/1.4 system-ui;margin:16px;background:#fff;color:#111}table{border-collapse:collapse}th{text-align:left;vertical-align:top;padding:6px 10px;white-space:nowrap;font-weight:500}td{padding:4px}img{width:46vw;max-width:900px;display:block;border:1px solid #ddd}</style>
<h1>${NAME}</h1><p>Left: v5 (${REF}). Right: the build (${BUILD}).</p><table>${rows}</table>`);
console.log(`\n${index.length} pairs in ${OUT}/index.html`);
