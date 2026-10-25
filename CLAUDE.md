# OwnCura website: instructions for Claude Code

Put this file at the root of the repository `jeshwanthshivasai/iOS-OwnCura_Website`, next to the `handoff/` folder.

1. Read `handoff/README.md` in full before any work. It is the brief. `handoff/DECISIONS.md` lists what the designer has decided; add to it, never rewrite it.
2. The design is `handoff/reference/index.html` (OwnCura Landing Page v5). Serve it with `npx serve handoff/reference` and keep it open beside your build. Every word, colour, typeface, size, timing and movement comes from it. Match it exactly. Do not redesign, simplify or "improve" anything, and change only what the designer asks for.
3. Stack: Next.js (App Router, TypeScript), deployed on Vercel. Big screens only: laptops, desktops and TVs. Do not build phone or tablet layouts.
4. Work one section at a time, in the order in README › Build order. For each section: compare against v5 at the seven screen sizes in README › Screens, push a branch, give the designer the Vercel preview link, and wait for his approval before starting the next.
5. When something is unclear, or this brief and v5 disagree, ask. Don't guess. Never invent words, sections or features.
6. Log every decision and change in `handoff/DECISIONS.md` with the date and the time in IST.
7. The repository is public. No secrets, keys or internal notes in it.
8. Keep the map credit (OpenFreeMap, OpenMapTiles, OpenStreetMap) on the globe. The data licence requires it.
