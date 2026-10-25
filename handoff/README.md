# Handoff: the OwnCura website

## Overview
OwnCura's website is one long page. It is a scroll story for doctors in the United States who own a medical practice, told in seven parts followed by a close and a footer:

1. how a practice is sold today
2. why doctors sell
3. the four options OwnCura offers
4. what OwnCura owns and runs
5. what the doctor's practice is worth, as a range
6. the closing line, "Own what happens next."
7. a short note for doctors who don't own a practice yet

The page is to be rebuilt in Next.js and published on Vercel from this repository.

## About the design files
`handoff/reference/index.html` is the design. It is v5 of the page, built in HTML as a prototype in a "design component" format:
- the markup has inline styles;
- one logic class sits at the bottom of the file (`class Component`), with a helper class `S4Ctl` above it for section 04;
- `support.js` runs it.

Treat it as the complete specification of the words, the look and the motion, not as code to ship. Recreate it in Next.js as proper components. Where this README and v5 differ, v5 wins; tell the designer about the difference.

To open the design, run `npx serve handoff/reference` and open the address it prints. It needs the internet, because `support.js` loads React from unpkg.com and the page loads Google Fonts.

The code is well commented. Before porting a section, read its comments in v5. They state the intent of every movement, and quotes in this README come from them.

## Fidelity
The design is high fidelity: the words, colours, type, layout and motion are final. Match it exactly at every screen size below, through every scroll position. If something can't be matched, show the designer before choosing another way.

## Screens
The page is for big screens only: laptops, desktops and TVs. There is no phone or tablet layout (the designer's decision, 23 Oct 2026).

Check every section at these sizes:
- 1280 × 720
- 1366 × 768
- 1440 × 900
- 1536 × 864
- 1920 × 1080
- 2560 × 1440
- 3840 × 2160
- 1920 × 1080 at device pixel ratio 2, which is how many TVs and 4K monitors run

Most sizes in v5 are in `vh`, `vw` or `clamp()`, or are computed from the window at runtime and written into CSS variables. For example: `--yTF`, `--cTF`, `--nF`, the hero lines at `line1Size` / `line2Size` in `vh`, and section 06's frame at 1920 × 958 scaled to fit. So the page scales with the screen. Port those fit functions as they are. Don't replace them with fixed sizes.

A few sizes are fixed in `px` (for example 15px, 16px, 18px, 52px and 72px). If any of them looks too small at 2560 or 3840 wide, show the designer before changing it.

What a phone sees is not decided yet (Open items, 1).

## The page, top to bottom
All scroll lengths below are with motion on. With `prefers-reduced-motion` set, v5 shortens two of them (see Accessibility).

### The intro
Plays on load, with a "Skip intro" button. Code: `runIntro`, `introAt`, `finishIntro`, `drawObject`.
- **A** (0.2–1.7 s): a soft cloud of the gradient condenses and sharpens into a square cross, then holds a beat.
- **B** (2.6–3.9 s): the cross's two halves slide apart and land as an H.
- **C** (4.4–6.8 s): the H becomes two figures. It parts a little, heads rise above the uprights, the two shake hands, and they become one H again.
- **D** (7.2–8.7 s): the H grows into the hero's frame.
- **E**: the hero arrives inside the frame: line one, line two on the crossbar, the earth, the nav.

`drawObject` draws every state from one set of numbers: `k` scales the plus, `m` swaps the halves into the H, `part` / `reach` / `hk` make the two figures, and `f` grows the H into the frame.

### 01 Hero and 02 How a practice is sold today
One pinned stage, `[data-stage-wrap]`, 900vh. Code: `tick`, `s2ApexY`, `fitGlobe`, `stageY`.
- **The hero:** the title in two lines inside the H frame.
  - "The ownership infrastructure for" is `[data-line1]`, in Schibsted Grotesk 600 at 10.2vh, set 60.5vh from the bottom.
  - "American healthcare practices." is `[data-line2]`, on the crossbar, at 9.4vh, in the h1's own face.
  - Around them: the dotted field, and the earth rising from the bottom.
- **Hero to 02:** the hero text goes out (0–0.10 of the stage). The frame shrinks from both sides back to the resting H (0.03–0.24), and the earth grows a little with it. The globe then grows about its horizon until the arc runs off both edges.
- **02:** the H becomes the two figures again. Six step cards pop up one after another, each born at the centre between the two figures, and each pushes the figures further apart. After the sixth card the figures leave the screen.
- **Exit from 02:** the row of cards rises and settles under the section title, then the closing line appears under the row. The globe never moves for the row.
- **Card layout:** the numeral is 0.62 × the card's width, with the text column to its right. The title gets the largest size that fits in two lines, and the same size is used on all six cards. The description gets the largest size at which its column ends level with the numeral. The numerals are the designer's shapes, from `assets/numerals/numerals.js`.

### 03 Why doctors sell
Pinned, `[data-s3-wrap]`, 740vh. The three reasons (Retirement, Liquidity, Administration) travel along the arc one at a time. Each one enters low on the left, rides the line to the top, holds, rides down to the right, and leaves before the next one enters. The third stops at the top. In the finale, all three ride back along the line and settle at equal intervals. The stage then releases into the priced line and the quote.

### 03 → 04
One continuous move over the last 320vh of 03. Code: `t34`, `placeWords`.
1. The reasons, heading and quote fade.
2. A dome rises, its lit edge moving at about the speed of the scroll.
3. The 4 is revealed with "Your" and "Options" either side of it. There is one gap on every side, measured on the letters' ink: "Your" sits that gap in from the left and the top, and "Options" the same gap in from the right and the bottom.

### 04 Your four options
`[data-s4-wrap]`, 1060vh. Code: class `S4Ctl`, `p4`.
- The 4 moves to the left edge at full height (`numeralEdge`: flush to the edge) and changes number, 1 → 2 → 3 → 4, as the options pass.
- Beside it the four options come one at a time, each with its diagram, title and description, along with the Get a valuation button. The order never changes: Keep it, Grow it, Bring in a partner, Hand it over.
- After the fourth option, all four show together in a grid beside the 4.
- The 4 is filled with the living gradient.

### 04 → 05
An extra 300vh hold at the end of 04. Code: `t45`, `t45Path`, setting A. The cards fade, and the 4 grows about its stem until its gradient fills the screen. The gradient then pulls back into 05's square. Meanwhile 05 rises under the veil, pins at t 0.45, and its own timeline waits 165vh.

### 05 What we own and run, 06 See what your practice is worth, and the close
One stage, `[data-h-wrap]`, 1005vh, pulled up 265vh under the end of 04.
- **05:** a gradient square, with a larger, left-aligned title over the statement. The statement fills word by word. The figures are Hundreds · practices, Most states, Thousands · physicians, Millions · visits, Over a decade, Dozens · last year.
- **05 → 06** (setting A): 05's square grows into a full-bleed living gradient, and 06 takes 05's place underneath. The field then bends first and sinks, its edges falling ahead of the centre, until it rests as the dome: 06's globe.
- **06:** "the H measures the practice". The designer's frame at 1920 × 958 is scaled to fit and centred.
  - The doctor fills in a sentence. As the range tightens, the H's uprights close in and the figures ride them.
  - The sentence spans the range: its longer line runs from the low figure's left edge to the high figure's right edge.
  - The specialty list opens under the word. It closes on a pick, on a click outside, or on Escape.
  - The note sits in the H's lower counter while it fits between the uprights, and steps under the H when they close in.
  - Code: `calc`, `setSpecOpen`, `pickSpec`.
- **"Not an owner yet?":** a panel centred on the dome's button, its foot 14px above the button.
- **The close:** the same H grows into the hero's frame. The uprights run out to the screen edges, and the crossbar becomes the band holding "Own what happens next." The stage holds that line at rest for 80vh (at q 0.912) before the footer comes in.

### The footer
Code: `layoutFoot`, `initFootDots`.
- The closing line dissolves into the band as the footer comes in.
- The description, the "Not an owner yet?" card and the links come up in the H's upper counter. Every + becomes an H (setting 7a).
- The dotted name appears in the lower counter.
- The small print reads "© 2026 OwnCura", then "An Independence OS company ↗", which links to independenceos.ai.

### The nav
Setting: hero nav, glass bar. Code: `setNav`, `scrollTo`.
- It sits inside the frame in the hero and in the close.
- It runs edge to edge on glass through 02–03 and 05–06.
- It is gone from the start of 03 → 04 until 05.
- `heroLinks` is off, so v5 hides `[data-hero-links]`: the nav's links and its Get a valuation button. The links live in the footer.

## Settings fixed at build
v5 has 51 switches. Build only the value each one is set to; v5 keeps the other options as the record. Code behind a switch that is off is not built.

| Switch | Value |
|---|---|
| typePair | A · Instrument Serif + IBM Plex Sans |
| line1Font / line2Font | Schibsted Grotesk / Page default |
| line1Size / line2Size / line1Lift | 10.2 / 9.4 / 60.5 (vh) |
| heroTitle | on |
| heroDescription | **off** (the description stays in the page's meta description) |
| heroNav / heroLinks | on / **off** |
| heroFrame / dotField / earth | on / on / on |
| usMap (flat US map in the dot field) | **off** |
| heroGradient / gradientSpeed / gradientScale / warmTint | 0.8 / 1.2 / 2.2 / on |
| intro | play |
| smoothScroll / cursor | on / **off** |
| navMode | Hero nav · glass bar |
| usStyle | fill |
| globeTop / globeStartTop / globeHalo | 36 / 24 / 0 |
| globeZoom / haloGlow / haloStrength / haloHeight | 3.7 / on / 0.8 / 60 |
| sphereOpacity / exitGrow / exitDrop | 0.2 / 1.05 / 5 |
| dottedLand | **off** |
| t45 (04 → 05) | A · Into the 4, out of the square |
| t56 (05 → 06) | A · The square zooms into the globe |
| numeralEdge / fourFill / fourStrength | Flush to the edge / Living gradient / 1 |
| gridDiagrams | As designed |
| s5Title / s5Square / s5TitleStyle | on / on / A · Fills with the statement (the square title overrides the other two while it is on) |
| s5Ledger | **off** |
| dots02 to dots06 | all on |
| s6Square | on |
| footerLinks | 7a · Every + becomes an H |

## Design tokens
**Colours**, checked in v5:

| Colour | Use |
|---|---|
| `#F8F8F6` | Page background (html, body) |
| `#14171C` | Ink: the hero title and the main text colour (about 300 uses) |
| `#2E6CB8` | Brand blue: link hover, text selection (with white text), focus ring |
| `#34B3A5` | Brand teal |
| `#2E6CB8`, `#34B3A5`, `#BFD9F0`, `#E9E2D3` | The living gradient's four colours (warm tint on) |
| `#5A5F66` | Footer small print |

Also used (see v5 for where): `#3F444B`, `#C9CCC7`, `#ECEDEA` (the globe's sky and horizon), `#8A8F96`, `#E2E4E0`, `#E6E8E4`, `#F3F4F1`, `#6FC3DF`, `#FFFFFF`. Ink and white also appear at low opacity, such as `rgba(20,23,28,0.08)` and `rgba(255,255,255,0.5)`.

**Type**
- Schibsted Grotesk (weights 400, 500, 600) is the main face, used in about 110 places.
- Instrument Serif (400) is the display face, as `--fd`.
- IBM Plex Sans (400, 500, 600) is the body variable, as `--fb`.
- IBM Plex Mono (400, 500) is for small labels, as `--fm`: the menu's links and numbers 01–05, "Skip intro", and 05's figure labels.
- Common letter-spacing: -0.01em, -0.02em, -0.025em, -0.03em, -0.035em, -0.04em. The mono labels above use 0.14em.
- Sizes:
  - The headings of 02, 03 and 05 use `clamp(1.75rem, 3vw, 3.25rem)`.
  - 03's three reasons use `clamp(1.75rem, 3.4vw, 3.25rem)`.
  - 05's square title uses `clamp(2rem, 5vw, 6rem)`.

**The Get a valuation button** (as in 04):
- At rest: background ink `#14171C`, text `#F8F8F6`, Schibsted Grotesk 600 at 0.9375rem, letter-spacing -0.01em, height 2.75rem, padding 0 1.3rem.
- On hover: the brand gradient (`linear-gradient(100deg, #2E6CB8, #34B3A5)`) sweeps in from the left over .55s `cubic-bezier(.22,1,.36,1)`, and the text turns `#FFFFFF`.

**Motion**
- The main easing is `cubic-bezier(.22,1,.36,1)`. One more, `cubic-bezier(.87,0,.13,1)`, is used for a few moves.
- Scroll motion is tied to the scroll position, not to time.

**Corners**: 0, 50%, 999px, 1rem and 1.5rem. The nav button's corner changes with the nav's state (`nav.ctaRadius`).

## Assets and licences
| File | What it is | Licence |
|---|---|---|
| `globe/maplibre-gl.js` and `.css` | MapLibre GL JS 5.6.0. In Next, use `npm i maplibre-gl@5.6.0`. | BSD-3-Clause |
| `globe/owncura-tiles.js` | OpenFreeMap's "dark" style and planet tiles for zooms 0–3, packed so the globe needs no tile server (about 0.8 MB) | Data © OpenStreetMap contributors (ODbL), OpenMapTiles schema. The map credit must stay visible; v5 adds MapLibre's compact attribution control. |
| `globe/owncura-globe-page.js` | The globe: the page calls `OC_GLOBE_START()` | — |
| `globe/us-state-lines.js` | US state borders, from Natural Earth 50m | Public domain |
| `owncura-earth-dots.js` | Land dots for the earth, from Natural Earth 110m on a 1.25° grid | Public domain |
| `owncura-gradient.js` | The living gradient (WebGL). Every gradient on the page draws through one shared WebGL context, because browsers keep only about 16 live contexts. | — |
| `owncura-landing-v2.js` | US map dot field (WebGL), smooth scroll, cursor, easing | — |
| `assets/numerals/numerals.js` | The designer's six step numerals as SVG path data | — |
| Logo | An O with a C joined to it, and the word OwnCura. SVG inline in v5's header. | — |
| Fonts | Google Fonts | OFL |

## Next.js: recommended structure
- **Rendering:** use the App Router with TypeScript. `app/page.tsx` renders every word as server HTML. Client components are used only where something moves.
- **Motion engine:** keep v5's model. One `requestAnimationFrame` loop (`tick`) reads the scroll and writes styles straight to elements, which it finds by their `data-` attributes. Port it as a client module (for example `lib/motion/`), attached after mount.
  - Keep v5's `data-` attributes so the ported code finds the same elements.
  - Don't put per-frame values into React state: re-rendering every frame drops frames.
- **Scripts:** port the helper scripts as ES modules. Keep v5's own smooth scroll; don't swap in a library unless the designer approves after comparing the feel.
- **The globe:** MapLibre plus the tiles is about 1.7 MB. Start loading it with a dynamic import as soon as the page opens; the intro runs about 9 seconds. v5 keeps the globe hidden until its tiles are in, then fades it in.
- **Fonts:** use `next/font/google` with only the four faces above. v5's font link also loads Space Grotesk, Newsreader, Bricolage Grotesque and Instrument Sans, but only for options that are off, so drop them.
- **React:** install it from npm. v5 loads it from unpkg.
- **Styles:** CSS Modules, with the tokens as CSS variables in the global stylesheet. No UI library.

## SEO and accessibility
- **Title:** "OwnCura — The ownership infrastructure for American healthcare practices".
- **Description:** "OwnCura owns and operates medical practices across the United States. Keep yours, grow it, bring in a partner, or hand it over. See what it is worth, free."
- **Headings:** one h1 (the hero title), and an h2 for each section heading.
- **Words in the HTML:** every word is in the server HTML. The intro and the reveals may hide text only with CSS that applies once JavaScript is running, so search engines and screen readers still get it all.
- **Reduced motion:** v5 reads `prefers-reduced-motion`. With it set, 04 → 05 is off, 04 is 760vh instead of 1060vh, and the 05-to-close stage is 840vh instead of 1005vh, with no pull-up. Keep all of that.
- **Focus:** a 2px `#2E6CB8` outline, offset 3px.
- **Keyboard:** the nav, 06's fill-in fields and the specialty list must all work from the keyboard. Escape closes the list.

## Performance
- Hold 60 fps on a mid-range laptop. Profile each section before asking for its review.
- Keep the gradients on one WebGL context, as `owncura-gradient.js` does.
- Pause loops for sections that are off screen.

## Build order
One section at a time (the designer's call, 23 Oct 2026):
1. Setup: the Next app, fonts, tokens, the motion engine, smooth scroll and the WebGL helpers
2. Nav, intro and hero
3. 02
4. 03
5. 03 → 04
6. 04
7. 04 → 05
8. 05
9. 05 → 06 and 06
10. The close and "Not an owner yet?"
11. The footer

For each section:
1. Build it.
2. Compare it with v5 side by side. Take Playwright screenshots of both at the seven sizes, at the same scroll positions, every 5% through the section's scroll length.
3. Push a branch and give the designer the Vercel preview link.
4. Wait for his approval, then merge to `main` and start the next section.

## Publishing on Vercel (for the designer)
1. Sign in at vercel.com with GitHub.
2. Choose Add New, then Project, and import `iOS-OwnCura_Website`.
3. Vercel detects Next.js. Press Deploy.
4. From then on, every push to `main` updates the live site, and every other branch gets its own preview link.
5. When there is a domain, add it under the project's Settings › Domains.

## Copy rules, for any new words later
- **Words:** copy every word from v5 as it is.
- **Voice:** plain and declarative, in sentence case with full stops. "OwnCura" at the top of the page, "we" lower down.
- **Valuations:** never shown as a single number. Always a range from "comparable transactions we have reviewed", never from "our AI model".
- **Banned words:** empower, unlock, transform, seamless, frictionless, effortless, AI-powered, intelligent, smart, journey, ecosystem, solutions, we understand, trusted, leading, premier, best-in-class, predatory, vultures, private equity, just, simply, easy, Book a demo, Get started, Learn more.

## Open items (ask the designer; don't decide)
1. What a phone or tablet shows. No layout is designed for them.
2. 06's figures come from an illustrative formula (`calc` in v5). Confirm with OwnCura before the site is public.
3. The forms don't send anything yet (decided 23 Oct 2026). When they should, the designer will say where to.
4. The words in the nav and the footer differ: "Who we are" and "Who we are?", "Contact" and "Contact Us". Keep them as in v5 unless told otherwise.
5. This repository is public. If it should be private, Vercel works with private repositories too.
6. The domain.

## Files
- `handoff/reference/index.html`: the design (v5), with the 10 files it loads beside it.
- `handoff/design-rules/distinctive-web-experiences.md`: the designer's rules for building websites, for any new work after the rebuild.
- `handoff/DECISIONS.md`: the decision log.
- `CLAUDE.md`, at the repository root: the short version of this brief.
