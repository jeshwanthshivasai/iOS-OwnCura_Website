# Decisions

Newest at the bottom. Each entry has the date and the time in IST. Add to this file; never rewrite it.

## 2026-10-23 22:14 IST: the rebuild (the designer, before the handoff)
- Build a real codebase that keeps growing, in Next.js (App Router), published on Vercel from `jeshwanthshivasai/iOS-OwnCura_Website`.
- The design is OwnCura Landing Page v5 (`handoff/reference/index.html`). Match it exactly.
- Build only the value each Tweaks switch is set to now (see README, Settings fixed at build). v5 keeps the other options as the record.
- Big screens only: laptops, desktops and TVs. No phone or tablet layout.
- The forms don't send anything yet. They are for looking only.
- Build one section at a time. Each section gets its own Vercel preview link, and the next section starts only after the designer approves.

## 2026-10-25 13:12 IST: step 1 of the build order, the setup (Claude Code, branch `step-01-setup`)
- The Next app lives at the repository root beside `handoff/`: Next.js 16.4.3 (App Router, TypeScript 5.9.3, Turbopack), React 19.3.1 from npm, CSS Modules with the tokens in `app/globals.css`, no UI library. `app/page.tsx` renders the root alone for now; the sections follow in the build order.
- Fonts come through `next/font/google` and are self-hosted: Instrument Serif 400, IBM Plex Sans 400/500/600, IBM Plex Mono 400/500, Schibsted Grotesk 400/500/600. The four families v5's font link also loaded for options that are off (Space Grotesk, Newsreader, Bricolage Grotesque, Instrument Sans) are dropped, as the README asks. The page names its faces only through the tokens `--fd`, `--fb`, `--fm` (v5's names) and `--fs` for Schibsted Grotesk, and the motion engine reads `--fd` and `--fs` from the computed style for the canvas text measurements v5 makes with literal family names, so the markup never depends on what next/font calls a family.
- v5's `<style>` block is `app/globals.css` as it stands, plus the colour, type and easing tokens from README › Design tokens. v5's runtime also set `html, body { height: 100% }`; that is not carried over (the page scrolls the document, and the sticky stages do not depend on it).
- The motion engine is `lib/motion/engine.ts`: one requestAnimationFrame loop, smooth scroll updated first, then `tick`, with v5's cached lookups, write-once style setter, `prog`, `hq`, `stageY` and `fadeUp`. Sections attach to `tick` in page order as they are built. Smooth scroll is `lib/motion/smooth-scroll.ts`, v5's own (lerp 0.085), on only for a fine pointer with motion allowed. The easing helpers are `lib/motion/math.ts`.
- The WebGL helpers are `lib/gl/mesh-gradient.ts` (the living gradient, one shared context) and `lib/gl/dot-field.ts` (the dotted field, one shared context). `node tools/compare/helpers.mjs` draws them beside v5's in one Chrome page: 120 cases (three gradients and two fades of the field, four sizes, device pixel ratios 1 and 2, three frame times) are pixel-identical.
- Not built, because their switches are off: the custom cursor (`cursor` off) and the flat US map inside the dot field (`usMap` off). The base dot field therefore marks no dot as lit; the lit/position values stay in the shader for the footer's dotted name, which lights its letters through them.
- The values of the switches the code reads as numbers or colours are constants in `lib/settings.ts`, named after the README table.
- `tools/compare/screens.mjs` takes the side-by-side Playwright screenshots the README asks for (the seven sizes and 1920 × 1080 at device pixel ratio 2, every 5% through a section) using the installed Google Chrome; `npm run reference` serves v5 on port 3001. Screenshots land in `compare-out/`, which is not committed.
- `<html lang="en">` is set; v5's `<html>` has no lang attribute. Invisible; it tells screen readers and search engines the page is English.
- Two `.DS_Store` files that had been committed are removed from the repository; `.gitignore` keeps them out.
- There is no Vercel project for the repository yet, so no preview link exists until the designer imports it (README › Publishing on Vercel). Every push to `main` and to the step branches will then get its link.
