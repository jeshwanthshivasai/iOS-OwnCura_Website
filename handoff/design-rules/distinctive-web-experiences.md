# Distinctive web experiences — design skill (all-in-one)

Attach this single file to a Claude Design project. Follow the four gates in order. The sections after the main instructions are the reference material the instructions point to.

---


# Distinctive web experiences

You are the creative director at a studio whose sites get shortlisted on Awwwards. The client has rejected generic work before and is paying for a point of view. This skill sits on top of the `frontend-design` skill (typography, palette, copy, the list of AI tells): apply that skill's rules as a baseline, then add what it does not cover — **a narrative structure, a motif, an art-direction system and a motion system with actual numbers**. Those four are the difference between "clean" and "alive".

## Why designs come out generic

Generic output has no *decision* in it. The layout is the average of every landing page: hero with headline-left/image-right, a logo strip, three feature cards, testimonials, CTA, footer, each section fading up. Nothing on the page could only belong to this brand. Character comes from three commitments made **before** any layout is drawn:

1. **One idea** the whole page argues, stated in a sentence.
2. **One motif** — a shape, object, mark, material or colour logic — that appears in the hero and returns in at least three later chapters so the page reads as one story.
3. **One hero device** — the single memorable thing (a WebGL object, a full-bleed film, a typographic reveal, a pinned stage) — and quiet discipline everywhere else.

If you cannot write those three lines, stop and write them. Do not design until you can.

## Process — four gates, in order

### Gate 1 · Concept card (write it before anything visual)

```
Subject:        what the product/brand actually is, and for whom
Idea:           the one sentence the page argues
Motif:          the recurring visual idea and where it comes from (logo geometry, the product's material, the subject's world)
Hero device:    the one memorable thing, and why it is the right form for this subject
Tone:           three adjectives that could not describe a competitor
Art direction:  photography/render/illustration treatment (e.g. "grainy B&W, one accent"; "duotone in brand colour"; "flat vector, no photos")
Palette:        surfaces as chapters — 3–5 background colours the page moves through, plus one accent
Type:           one or two faces, roles, the display size at 1440/1920
```

Check it against the subject: every line should be something a competitor's page would *not* say. If a line would fit any company in the category, it is a default, not a choice — replace it.

### Gate 2 · Storyboard (chapters, not sections)

List the page as chapters. For each: name, its job in the argument, layout in one line or an ASCII sketch, the scroll device, and the transition into the next chapter. Use the template and the catalogue of devices in `section: narrative-storyboard`. Rules that keep it a story:

- Spend the pinned/scrubbed devices on the two or three beats that matter. Everything else scrolls natively.
- Chaptering is done by background colour, media, or a curtain — not by identical padding and dividers.
- The motif must appear in the hero and return in at least three chapters, doing a job each time (mask, overlay, marker, progress, closing statement).
- The last chapter is a closing statement (a giant wordmark, a single line, a full-bleed image), not "Get in touch" in a card.

### Gate 3 · Systems (tokens with numbers)

Write the motion system before writing motion, using `section: motion-system`: one easing family, three durations, one stagger, one text-reveal construction, the scrub/trigger split, the hover language, cursor and scroll decisions. Write the type and layout tokens from `section: typography-layout`. Pick the stack and performance rules from `section: stack`. In Claude Design, state these as rules in the design system; in code, put them in one tokens file and import them everywhere.

### Gate 4 · Review gate (before delivering anything)

Run `section: anti-generic-checklist` against the output. It is a list of things that make a page read as generated. Fix every hit. Then remove one element — the Chanel rule. If nothing on the page is a risk, it is not finished.

## Hard rules (and why)

- **One bold move.** One place spends the boldness; the rest is quiet. Five effects read as noise; one, carried through, reads as intent.
- **No fade-and-slide-up on every section.** It is the single strongest "generated" tell. Motion is a system with two kinds: scrubbed (tied to scroll position: pins, tracks, fills, colour swaps) and triggered (content arrival, hover, click). Decide per chapter.
- **Display type at display size.** Headlines 72–140 px at 1920 (≈4–7 vw), tracking −1 to −3 px, line-height 0.9–1.1. A 40 px "headline" with a 16 px paragraph under it is a blog post.
- **Type carries personality.** One or two faces, chosen for this subject. Weight contrast inside a line, a display face for one role only, real numerals — not a bold accent word in a brand colour.
- **Surfaces, not cards.** Content lives on the page surface, in chapters of colour. Rounded identical cards with the same grey shadow are the SaaS kit — only use cards where the content is genuinely a set of equal, comparable items.
- **Structure encodes information.** Hairlines, numbering, eyebrows and grids appear only where they say something true (a real sequence, a real grid of equals). Decorative structure is clutter.
- **Media as a system.** All photography or renders share one treatment (grain, duotone, crop ratio, B&W + one accent). Mixed stock imagery is the fastest way to lose character.
- **Copy is design.** Headlines that could be swapped between competitors are a design failure. Write from the subject's world; short, specific, no "Empowering / Seamless / Innovative".
- **Restraint on the chrome.** No `→` glued to every link, no tracked-out caps eyebrow on every heading, no middle-dot meta strings, no gradient washes as decoration, no default 8 px radius on everything.
- **Quality floor is silent.** Responsive to 390 px, visible focus states, `prefers-reduced-motion` honoured (scrubbed devices become static states), 60 fps: transform/opacity only, no layout animation, lazy media.

## What to output

**When the target is Claude Design (visual, no motion runtime):** deliver the Concept card, the Storyboard, and the design system tokens as text, then the screens. Describe motion per chapter in the storyboard so the code hand-off is exact. Mark which chapters are pinned/scrubbed. Do not fake motion with static "animated" decorations.

**When the target is code:** deliver the tokens file, a section-per-chapter structure, and the motion system as one GSAP/ScrollTrigger (or equivalent) setup with the numbers from the tokens — never inline magic numbers per section. Full stack guidance is in `section: stack`.

**Always** name what the one bold move is and what you deliberately kept quiet. A client reviewing the work should be able to see the decisions.

## Worked examples

`section: example-concepts` holds three concept cards and storyboards reverse-engineered from shortlisted sites (a finance firm, a venture studio, an AI product). Read one before Gate 1 the first time you use this skill, to calibrate how specific a concept has to be.

## Reference files

- `section: narrative-storyboard` — chapter template, hero devices, motif patterns, transitions
- `section: motion-system` — easing, durations, staggers, text reveals, scroll devices with numbers, hover language, smooth-scroll and cursor decisions
- `section: typography-layout` — scales, tracking, grids, art direction, colour-as-chapters
- `section: anti-generic-checklist` — the review gate
- `section: stack` — GSAP, ScrollTrigger, Lenis, WebGL, Lottie/Rive, maps; performance rules; what to hand off from Claude Design to code
- `section: example-concepts` — three calibrated concept cards



---

# Narrative storyboard

A landing page is read top to bottom once. Treat it as a short film: an opening image, an argument in chapters, a closing statement. The storyboard is written before layout so that the scroll devices are spent on the beats that carry the argument.

## Storyboard template

```
Chapter N · <name>
Job:         what this beat proves or sets up in the argument
Layout:      one line or an ASCII sketch (columns, full-bleed, pinned stage, list, grid)
Content:     headline (real copy), sub-copy, media, data
Scroll:      native | pinned stage (what changes inside, over how many screens) | scrubbed (what property follows scroll) | triggered reveal (what enters, from where)
Motif:       how the motif appears here (or "absent" — allowed, but not for more than two chapters in a row)
Transition:  hard cut | colour change | curtain (next chapter slides over a fixed one) | overlap | fade | media edge
Surface:     background colour / media for this chapter
```

Write 6–10 chapters. Fewer is usually better than more.

## Opening image (the hero)

Open with the most characteristic thing in the subject's world, in the form that suits it. Pick **one** hero device and commit:

| Device | When it is right | Examples from shortlisted sites |
|---|---|---|
| Full-bleed film with the headline over it | The subject has a world worth showing (place, people, material) | dusk lake with birds (venture studio); drone film of a farm (agri-tech); B&W city with a translucent brand panel (law firm) |
| Real-time 3D object that responds to scroll | The brand has a form (logo geometry, product) that can become an object | glass prism rotating and changing colour while headline states cycle (investment bank) |
| Typographic hero (huge wordmark or headline as the image) | The name or the sentence is the brand | wordmark at viewport width over film (agri-tech); 136 px two-line statement (law firm) |
| Looping abstract system (canvas/video of shapes) | Abstract or technical subject | morphing wireframe ring (AI hiring); geometric shapes assembling (policy institute) |
| Inset media card with the nav floating over it | Product/software with a real-world setting | rounded drone photo with a soil-grid overlay (agri-tech SaaS) |
| Explanatory animation of the product's core idea | The product is a process (data → result) | tiles assembling into an identity card (fintech) |

Avoid the default hero: headline left, screenshot right, two buttons, logo strip. Use it only when the brief pins it.

## Motif patterns

The motif is the thread. It should come from the subject or the mark, not from decoration.

- **Logo geometry as object**: the mark's shape becomes the hero object, the section markers, a mask, a watermark in the footer.
- **A drawn overlay**: pitch lines over sports photos; a soil grid of translucent squares over farm imagery; a wireframe mesh behind a product deck.
- **A material or treatment**: grainy B&W with a single accent; duotone in the brand colour; hand-drawn single-line figures.
- **A colour code per chapter**: each chapter owns a surface colour that means something (night → day; three mindsets = navy/green/black).
- **The sky/horizon**: a page-long gradient from dusk to daylight; a globe horizon with stars that returns whenever the camera pulls back.
- **A recurring object at different scales**: one prism → five prisms → a grid of prisms with one lit.

Placement rule: hero → returns in ≥3 chapters → closing statement. Each return should *do* something (mark progress, mask an image, frame a quote), not just appear.

## Chapter types worth using

- **Pinned stage**: the section pins for 2–4 screens while text states cross-fade and an object or image changes. Use for the core message, not for feature lists.
- **Horizontal track**: vertical scroll drives a horizontal row (founders, case studies). One per page.
- **Chapter colour swap**: a pinned block cycles three states with a background colour per state and a 01/02/03 progress strip.
- **Stacking deck**: cards slide up over the previous one (audiences, products); the previous card's header stays visible.
- **Scrubbed text fill**: a statement whose words fill from grey to the text colour, or de-blur, as it passes the viewport centre.
- **Sticky title + scrolling items**: a headline stays while cards or steps scroll past it (cheap, always reads well).
- **Curtain**: the hero is `position: fixed` and the page slides over it.
- **Marquee**: logos or words in a continuous loop — fine once, never twice.
- **Closing statement**: the wordmark at viewport width; a single line on full-bleed media; the motif at its largest.

## Transitions

Prefer chaptering by *surface*: white → grey → navy → black tells the reader where they are. Hard cuts are fine when the surface changes. Use fades and overlaps only when two chapters genuinely share content. Curtains and colour swaps are the strong moves; use each once.

## Copy in the storyboard

Write the real headline for every chapter in the storyboard. Placeholder copy hides weak structure. Headlines are specific to the subject's world ("Playing the game is one thing" for a firm that backs founders like athletes; "Build what deserves to leave the ground" for a venture studio with a flight motif), short, sentence case unless the brand is caps, and never interchangeable with a competitor's.



---

# Motion system

Motion on a distinctive site is a *system*: a handful of rules applied everywhere, so the page feels like one hand made it. Write the rules first, then apply them. Numbers below are measured from shortlisted sites and are safe defaults; deviate on purpose, not by accident.

## 1. Two kinds of motion — decide per chapter

| Kind | Tied to | Use for | Easing |
|---|---|---|---|
| **Scrubbed** | scroll position (reverses when scrolling back) | pins, horizontal tracks, colour fills, object rotation/colour, deck stacking, progress strips, hero overlay darkening | `none` / linear — the scroll *is* the easing; optional `scrub: 0.3–1` for a soft lag |
| **Triggered** | an event (enter viewport, hover, click, load) | content arrival, menus, accordions, popups, card flips, page load | one ease-out family |

A page needs both. Scrubbed motion gives spatial, physical feel; triggered motion gives arrival and response. All-triggered pages feel like a slideshow; all-scrubbed pages feel like a scrollbar.

## 2. The rules to write down

```
Easing family:     power4.out / expo.out for entrances (fast start, long settle); power2.inOut for state changes; none for scrub
Durations:         fast 0.3–0.5 s (hover, icon, menu), medium 0.8–1.2 s (content entrance, card), slow 2–3 s (hero settle, chapter change)
Stagger:           40–100 ms between siblings; 0.05–0.1 s per word for word fills
Text reveal:       ONE construction for the whole site — lines with a mask, OR words, OR characters; reveal direction stays constant
Pin length:        2–4 screens per pinned stage; no more than three pinned stages per page
Hover language:    ONE treatment per element type (button, link, card, image); see §5
Smooth scroll:     Lenis on (lerp ≈ 0.1, ~1 s settle) when the page has spatial devices; native when it doesn't
Cursor:            default, or a custom cursor that does something (label on hover, drag hint) — never a decorative dot
Reduced motion:    scrubbed devices become their final static state; triggered reveals become instant
```

## 3. Entrances (triggered)

- Trigger at "top 75–85%" of the viewport so content is already in when the eye reaches it.
- y offset 24–48 px, opacity 0→1, optional scale 0.98→1. Duration 0.8–1.2 s, ease-out. Stagger 60–100 ms for siblings.
- **Do not apply this to every section.** Choose: entrances for 2–3 content-heavy chapters; the rest arrive with the scroll. The "everything fades up" page is the most recognisable generated pattern.
- Hairlines can draw to full width (1.5–2 s) as a row enters — a strong, cheap accent.

## 4. Text reveals

- **Lines with a mask** (each line in an overflow-hidden wrapper, translateY 100%→0, stagger 80–120 ms, ease-out, ~0.8 s): the most editorial. Use for headlines.
- **Characters, typed left→right** with a soft trailing fade (~0.7 s for a 3-line headline): good once, in the hero.
- **Word fill on scroll** (words start at 30–40 % opacity or a grey, fill to full as the block crosses the viewport centre; scrubbed): for a manifesto statement.
- **Word de-blur on scroll** (blur 8px→0, scrubbed): for a "fragments to clarity" message.
- **Line-by-line colour fill** (grey → white as each line passes centre, scrub 1): quieter than words.

One construction per site. Mixing them reads as sampled.

## 5. Hover language (pick one per element type)

- Buttons: colour inversion (fill ↔ outline), or label roll (text slides up and a duplicate slides in, 0.4 s), or arrow nudge (+4–6 px). Not all three.
- Links: colour to accent, or underline drawing from left (0.3 s). Weight bump only with a variable font.
- Cards: image scale 1.03–1.05 inside an overflow-hidden frame, 0.6 s; or a colour tint; not a lift-with-shadow.
- Images: reveal a caption, or a subtle parallax toward the cursor (±4–8 px).
- Menu icon: a drawn morph (hamburger → ×), 0.3–0.5 s, Lottie or CSS.
- Logo: an animated mark on hover is a strong signature if the mark has parts to move.

## 6. Scroll devices — with numbers

**Pinned stage** — `pin: true`, `scrub: true`, `end: "+=200%…+=300%"`. Inside: 2–3 text states cross-fading (each visible for a third of the pin), an object rotating/scaling/changing colour along the same scrub. Fade text over 0.25 of the state window.

**Horizontal track** — pin the section, translate the row by `-(rowWidth - viewportWidth)` with scrub, `end: "+=" + (rowWidth - viewportWidth)`. Include the headline in the track so it exits left with the cards.

**Chapter colour swap** — pinned block, three states; `backgroundColor` tweened between states with scrub; a 01/02/03 strip with a hairline that fills.

**Stacking deck** — each card's trigger from "top bottom" to "top top", scrub true; cards are `position: sticky` in CSS or translated with GSAP; previous card's header stays visible (offset each by ~48–64 px).

**Scrubbed hero exit** — background overlay darkens or the hero scales 1→0.92 over the first 15 % of scroll, then the next chapter slides over the fixed hero (curtain).

**Sticky title** — `position: sticky; top: 15vh` on the title column; the items column scrolls natively. No JS.

**Marquee** — CSS `translateX` keyframes, 25–40 s per loop, duplicated content, edge-faded with a mask. Pause on hover.

## 7. Page load / intro

- Prefer none: the page composed and usable at 0.3 s, with one deliberate reveal (a headline construction, an object settling, film already playing).
- If a preloader exists it must be the motif (a brand-shaped counter, a mark drawing) and under 2.5 s, and it should replay only once per session.
- Never a generic percentage counter or a spinner.

## 8. Camera-style choreography (3D, maps, globes)

When there is a camera (Three.js, Mapbox/MapLibre globe, Spline): one settle move on entry (2–3 s, ease), state moves of 0.9–1.2 s on click, a "return" move of ~2 s with an arc (zoom out → pan → settle). Pitch/tilt is set once and kept; it is what reveals horizons and depth. Cursor influence: ±3–6° bearing/pitch, lerped at 0.05–0.08 per frame, returning to rest on leave.

## 9. Performance rules that motion depends on

- Animate `transform` and `opacity` only. Never `top/left/width/height/margin`.
- Pin with GSAP's pin (it handles the spacer) or CSS sticky; never JS-set `position: fixed` on scroll.
- `will-change: transform` only on the element currently moving.
- Image sequences (canvas, 60–120 frames, ≤ 1600 px wide, WebP) for scrubbed "video" — real `<video>` cannot be scrubbed reliably.
- Split text once, after fonts load (`document.fonts.ready`), and re-split on resize.
- Kill and rebuild ScrollTriggers on resize/route change; `ScrollTrigger.refresh()` after images load.
- Test at 390 px: drop pinned stages or shorten them to 1.5 screens; horizontal tracks become swipe carousels.



---

# Typography, layout, art direction

## Type

**Choose for the subject.** A finance firm that backs founders like athletes used one geometric grotesque (Satoshi) at 85–110 px; a law firm used a variable grotesque (Fustat) at 136 px with a light humanist body; a venture studio used a soft, slightly condensed grotesque (Stack Sans) at weight 200; an AI product used a narrow geometric display (Darker Grotesque) with Inter for body; a clinical AI company set every heading in JetBrains Mono at weight 100. Each is a decision you can defend from the subject. Inter/Roboto/Poppins for everything is not.

**Scale at 1920 (scale down ~0.75 at 1440, ~0.45 at 390):**

| Role | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| Hero display | 80–140 px (4–7 vw) | one committed weight: 200/300 light *or* 600/700 heavy | 0.9–1.1 | −1 to −3 px |
| Chapter title | 48–90 px | same face | 1.0–1.15 | −0.5 to −2 px |
| Statement / manifesto | 36–48 px | light or regular | 1.2–1.4 | 0 |
| Card / item title | 24–40 px | medium | 1.1–1.2 | 0 |
| Body | 16–20 px (24 px in a hero) | regular / light | 1.4–1.5 | 0 |
| Eyebrow / meta | 12–14 px | medium | 1 | +0.5 to +1 px if caps |

**Devices that add character (use one or two, not all):**
- Weight contrast inside one line (light + bold, same face, same size).
- A phrase inside an outlined capsule or a translucent panel.
- A condensed caps face for one role only (section titles) against a regular face for everything else.
- Numbers as a system — 01/02/03 — only when the content is a real sequence; large stat figures with hairlines between them.
- Curly braces, arrows or a mark used typographically — once, as a signature.
- The wordmark at viewport width as an image (open and/or close the page with it).

**Tells to avoid:** one accent word in the brand colour; caps eyebrow over every heading; three fonts; 40 px "headlines"; centred everything.

## Layout

- **Show or feel the grid.** Hairline columns that persist across chapters; a 12-column grid with generous outer margins (8–10 % of viewport at desktop); or an inset "card" of media with the page margin around it.
- **Asymmetry with intent.** Headline bottom-left over media, copy top-right; a 25/50/25 split with the object in the middle; a sticky title column against a scrolling column.
- **Full-bleed vs inset.** Decide per chapter: full-bleed film/photo for atmosphere; inset rounded media for product. Don't alternate randomly.
- **Whitespace is a material.** Pinned stages need air around the object; statements need 40–50 % of the viewport empty.
- **Radius is a system.** 0 (editorial, institutional), or pills + one card radius (product), or very large radii (40–60 px) as the identity. Not 8 px on everything.

## Art direction

Pick one treatment and apply it to all media:

- Grainy black-and-white photography with one accent colour (accent bars, lit objects, markers).
- Duotone in the brand colour (a translucent brand panel over film; brand-tinted photo).
- Renders of one object family (glass, metal, a brand geometry) on flat surfaces with a single soft shadow.
- Flat vector shapes derived from the logo, in the two brand colours.
- Real product UI in a rounded frame, floated over a photo, with the UI matching the site's palette.

No mixed stock photography. No illustrations from three styles. If the brief has no imagery, a typographic or abstract-system direction is stronger than placeholder photos.

## Colour as chapters

Define 3–5 surface colours the page moves through, one accent, and a text pair per surface. Examples that worked:

- white → light grey → navy/green/black chapters → black → photo → light grey → navy (finance)
- night navy → royal blue → sky → cream → peach → orange, one continuous gradient (venture studio, "dusk to sunrise")
- near-white with lavender panels and one violet accent (fintech) — light, calm, one hue
- charcoal alternating with a lighter charcoal, one neon accent, one white band for partners (law)

Rules: the accent has one meaning (interactive/active/highlight); dark surfaces use greys with a slight hue, not pure #000/#111 unless the brand is stark; contrast ≥ 4.5:1 for body, ≥ 3:1 for display; the "space" behind 3D or globe scenes is the page surface colour, so objects float on the page rather than in a box.

## Chrome (nav, footer)

- Nav is a decision: fixed solid bar; transparent → solid on scroll; hide on down / return on up (with blur); a floating pill; a left rail; or a nav that only appears after the hero. Choose the one that suits the hero device.
- Menus are moments: a half-width panel with the motif's lines; a full-screen three-column overlay whose contents fade in after the panel; a pill that expands into a card.
- Footer closes the story: the wordmark at full width, a giant translucent mark, a single line — plus the links. A three-column link grid alone is a missed chapter.



---

# Review gate — signs of a generic page

Run this before delivering. Each "yes" is a fix, not a note. The list extends the tells in the `frontend-design` skill (cream + serif + terracotta; near-black + acid green; broadsheet hairlines; the SaaS card kit; tracked caps eyebrows, middle dots, `→` on links, #111 "black", monospace data labels) — those apply too.

## Concept

- [ ] Could the hero headline be pasted onto a competitor's site without anyone noticing?
- [ ] Is there a motif, and does it appear in the hero **and** in at least three later chapters?
- [ ] Is there exactly one hero device? (Zero = generic; more than one = noise.)
- [ ] Can you name the one bold move and what was kept quiet around it?
- [ ] Does the page end on a closing statement, or on a CTA card?

## Structure

- [ ] Hero left/right split with two buttons and a logo strip underneath — was that a choice for this brief?
- [ ] Three identical feature cards in a row — is the content really three equal peers?
- [ ] Same padding, same divider, same layout rhythm on every section (no chaptering by surface or media)?
- [ ] Testimonial carousel + FAQ accordion + CTA banner as the default second half?
- [ ] Numbered markers (01/02/03) on content that isn't a sequence?
- [ ] Centred everything?

## Type

- [ ] Display type under 64 px at 1920?
- [ ] More than two typefaces, or the default sans (Inter/Roboto/Poppins/Arial) for everything with no reason from the subject?
- [ ] One accent word in the brand colour as the only typographic idea?
- [ ] Caps eyebrow above every heading?
- [ ] Headline line-height ≥ 1.2, tracking 0 — i.e. body settings used for display?

## Surface and colour

- [ ] Rounded cards with the same 8–12 px radius and the same soft grey shadow everywhere?
- [ ] Gradient washes / blurred colour blobs used as decoration behind content?
- [ ] Pure #000 or tinted #0B0B0B/#111 black with one neon accent, without the brief asking for it?
- [ ] More than one accent colour with no rule for when each is used?
- [ ] Mixed stock photos, or illustrations in more than one style?

## Motion

- [ ] Fade-and-slide-up on every section? (Strongest tell. Replace with a decided mix of scrubbed devices and 2–3 triggered entrances.)
- [ ] Hover lift-with-shadow on every card?
- [ ] More than one text-reveal construction on the page?
- [ ] Any motion that isn't in the written motion system (a one-off easing, a random duration)?
- [ ] A pinned stage that lasts more than four screens, or more than three pinned stages?
- [ ] A preloader that is a spinner or a percentage counter?
- [ ] Does anything animate `width/height/top/left`?
- [ ] Does the page survive `prefers-reduced-motion` and 390 px?

## Copy

- [ ] "Empowering", "Seamless", "Innovative", "Next-generation", "Unlock", "Elevate", "Supercharge" anywhere?
- [ ] A headline stating the category instead of the idea ("The all-in-one platform for X")?
- [ ] Button text that doesn't say what happens ("Submit", "Learn more" everywhere)?

## Final

- [ ] Removed one element? (If you can't find one to remove, look harder — there is always a decoration.)
- [ ] Written down, in one sentence each: the idea, the motif, the bold move.



---

# Stack and hand-off

## What shortlisted sites actually run (seen, not guessed)

- **GSAP 3 + ScrollTrigger** on nearly all of them; **SplitText / SplitType** for text reveals. This is the motion engine. Webflow's native interactions are used for menus, tabs, dropdowns and simple reveals; GSAP does the pins, scrubs and choreography.
- **Lenis** for weighted smooth scroll when the page has spatial devices (pins, tracks, decks). Note: many sites load it and never initialise it — if it's on, it should be felt (lerp ≈ 0.1, ~1 s settle).
- **Three.js / WebGL** for hero objects (a glass prism with an HDR environment map; wireframe rings), **Spline** or **Rive** where a designer owns the asset, **Lottie** for icons, hamburger morphs and small illustrations, **p5.js** for generative backgrounds, **canvas image sequences** for scrubbed or looping product "video".
- **Mapbox GL / MapLibre GL** (globe projection + fog/sky) for location stories.
- **Swiper** for carousels, **Finsweet Attributes** for accordions/CMS in Webflow.
- `<video>` autoplay/loop for atmosphere heroes; dropbox/CDN hosted; two crops (desktop/mobile).

Platforms: Webflow is the most common, with a custom JS bundle (Vite) for the choreography. Framer, Next.js and hand-built sites use the same libraries.

## Minimal setup that produces the feel

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

```js
gsap.registerPlugin(ScrollTrigger);

// tokens — one place
const M = { ease: 'power4.out', fast: 0.4, med: 1, slow: 2.5, stagger: 0.08 };

// smooth scroll (only if the page has spatial devices)
const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);

// headline: lines with a mask, once, after fonts load
document.fonts.ready.then(() => {
  const split = new SplitType('.hero h1', { types: 'lines' });
  split.lines.forEach(l => { const w = document.createElement('div'); w.style.overflow = 'hidden'; l.parentNode.insertBefore(w, l); w.appendChild(l); });
  gsap.from(split.lines, { yPercent: 100, duration: M.med, ease: M.ease, stagger: M.stagger });
});

// one pinned stage
gsap.timeline({ scrollTrigger: { trigger: '.stage', pin: true, scrub: true, end: '+=250%' } })
  .to('.stage .state-1', { opacity: 0 }, 0.3)
  .to('.stage .state-2', { opacity: 1 }, 0.35)
  .to('.stage .object', { rotation: 180, scale: 1.6 }, 0);

// entrances — only on chosen chapters
gsap.utils.toArray('[data-reveal]').forEach(el =>
  gsap.from(el, { y: 32, opacity: 0, duration: M.med, ease: M.ease,
    scrollTrigger: { trigger: el, start: 'top 80%', once: true } }));

// reduced motion
if (matchMedia('(prefers-reduced-motion: reduce)').matches) { ScrollTrigger.getAll().forEach(t => t.kill(true)); gsap.globalTimeline.progress(1); }
```

## Performance rules

- Transform/opacity only; `will-change` on the moving element only; no layout animation.
- Images: AVIF/WebP, sized per breakpoint, lazy below the fold; hero media ≤ 1.5 MB; video muted/loop/playsinline with a poster.
- WebGL: one canvas, cap pixel ratio at 2, pause when off-screen (`IntersectionObserver`), dispose on route change.
- Split text after `document.fonts.ready`; refresh ScrollTrigger after images load and on resize (debounced).
- Fonts: two files max, `font-display: swap`, preloaded.
- 390 px: shorten or drop pins, tracks → swipe, keep the hero device if it survives (a WebGL object usually does; a 4-screen pin usually doesn't).
- Accessibility floor: focus states, reduced motion, alt text, contrast, keyboard-reachable menus.

## Claude Design vs code — who does what

**Claude Design** produces layout, type, colour, components, copy, screens and a design-system doc. It does not run GSAP/ScrollTrigger, Lenis, WebGL or map tiles in its preview. Use it for Gates 1–3 and the visual design of every chapter, and write the motion per chapter *as text* in the storyboard.

**Code (Claude Code, a developer, or a provided HTML file)** owns the motion system, pins, 3D/maps and performance. Hand over: the storyboard with motion per chapter, the tokens (type, colour, spacing, radius, motion numbers), the assets, and any pre-built components (e.g. a globe or 3D hero as a self-contained HTML file to embed unchanged).

When a working component is supplied (a file that already implements a hero device), the rule is: **use it unchanged, build around it**. Do not re-implement it, replace it with an image, or restyle its internals.



---

# Worked concept cards

Three pages reverse-engineered from live shortlisted sites (September 2026). Use them to calibrate: notice how every line comes from the subject, and how few devices each page uses.

---

## 1 · Investment bank that backs founders ("playing the game")

```
Subject:        an Indian investment bank for growth-stage founders
Idea:           playing the game is one thing; winning is creating real value — founders as athletes, the bank as the team behind them
Motif:          football-pitch line drawing (centre circle, halfway line, penalty box) over grainy B&W sports photography; the logo's glass prism as the recurring object
Hero device:    a real-time WebGL glass prism that rotates, grows and turns green while three headline states cross-fade in a 3.5-screen pinned stage
Tone:           competitive, disciplined, quietly premium
Art direction:  grainy B&W photography (climbers, stadium, athlete) with one neon green accent; prism renders on flat surfaces
Palette:        white → light grey → navy / neon green / black chapters → black → navy footer; accent #00FF7F
Type:           Satoshi Variable only; display 85–110 px / 700 / −1.5 px; caps eyebrows and buttons; 01–04 numbering for real sequences
```

Storyboard (10 chapters): preloader = corner flags on navy (2.5 s, replays) → pinned prism hero with word-by-word fill → pinned horizontal founder track (cards flip on "+") → deals accordion → five prisms, one lit per value → pinned "mindset" chapters with a background colour per state and a 01/02/03 progress strip → stats on black beside a lone prism → services over a stadium photo with pitch lines → a grid of 27 prisms with one lit ("we step in") → logo marquee → "Game plan? Win." over an athlete's face → footer that is the wordmark at viewport width. Motion system: GSAP `expo`/`power4`/`power2.out`, scrubbed for everything spatial, 0.4–1 s triggered, native scroll, no cursor. Menu: half-width navy panel with the pitch lines.

Bold move: the prism stage. Kept quiet: all typography is one face at three sizes; cards have no hover motion.

---

## 2 · Venture studio ("leave the ground")

```
Subject:        an India-first venture studio that co-builds startups
Idea:           we don't just fund you, we fly with you from idea to scale
Motif:          flight — birds in the hero film, gull cut-outs on cards, the winged logo mark, copy ("leave the ground", "soar", "tailwinds", "take flight"); a page-long sky gradient from dusk to daylight to sunset
Hero device:    full-bleed dusk film of a flock crossing a lake, with a 3-line light headline typed in character by character
Tone:           calm, optimistic, airborne
Art direction:  film + cut-out birds on cream cards; translucent glass cards on navy; orange dash above every eyebrow
Palette:        one gradient: #08192F → #1C4F8C → #7FB3D5 → #F5E9DC → #F2B27A → #E96A0B; accent #F47A1F; cream text #FFF4EB
Type:           Stack Sans Headline 200/300 + Stack Sans Text 300; display 80 px / −2.4 px; caps eyebrows
```

Storyboard: hero film → challenge bento on translucent cards → sticky "Together we soar" title with cards scrolling past → pinned horizontal row of four cream cards with gulls → OS accordion → three tall photo cards → founder → CTA card with a pale sky → orange footer with a giant translucent mark. Nav hides on scroll-down and returns as blurred navy glass. Motion: `power2.out`, 1 s, stagger by delay; one scrubbed track; Lenis on.

Bold move: the sky gradient as the chaptering device — nothing on the page has a background of its own. Kept quiet: entrances are all the same rise/fade.

---

## 3 · Identity-intelligence product ("fragments to full context")

```
Subject:        a data product that resolves fragmented identity data for banks and pension funds
Idea:           the data you have is fragmented; we resolve it into full context
Motif:          the grid and the card — a field of identity tiles, a faint cell grid with icons dropped into cells, a wireframe mesh, a perspective floor; blur → clarity
Hero device:    a looping video of tiles assembling into an identity card
Tone:           precise, calm, resolved
Art direction:  near-white surfaces, lavender line drawings, violet second lines on every headline, soft 3D renders on grid floors
Palette:        #F2F5F9 / #F6F8FB / white; violet #7B6CF6; lavender #E8E9FF
Type:           Inter; h1 56 px / 700 / −1.68 px; eyebrow in a bordered tag; curly braces as a typographic ornament
```

Storyboard: hero video → four "half-page" statements whose trailing words de-blur as they pass (scrubbed) → three feature cards → pinned five-step deck with a progress bar and a 01–05 rail → testimonial slider → contact panel on a lavender perspective grid. Motion: `power4.out`, 1–2 s content tweens, scrub for de-blur and deck travel; native scroll.

Bold move: the de-blurring statements. Kept quiet: nothing else moves except the deck.

---

What the three share: one idea in one sentence; a motif drawn from the mark or the subject and used 4–6 times; one hero device; a motion system with three or four rules; typography from one or two faces at real display sizes; surfaces (not cards) doing the chaptering. What none of them do: fade-up on every section, three identical feature cards, a caps eyebrow on every heading, a gradient blob behind the hero, a CTA banner as the ending.
