---
name: xseed-project-theme
description: Create additional XSEED Education pages for this marketing website using index.html as the design source. Apply the project's warm cream palette, crimson accents, Inter and Fraunces typography, shared navigation and footer, and editorial scroll storytelling.
---

# XSEED project theme

Build further screens for the current XSEED Education marketing website. Use the MASTEREDGE brief as the model for a complete page specification and flowing editorial storytelling; use this project's `index.html` for the actual brand, visual tokens, components, assets, and behavior.

## Source of truth

Resolve the project root from this file's location: `../../`. Read `index.html` before implementing a screen, especially its `:root` tokens, typography, `.nav`, `.btn`, `.footer`, responsive rules, and animation initialization. If the homepage changes, prefer its current implementation over stale values below.

The user supplies the new page's filename, message, and content. Produce a complete standalone HTML page with inline CSS and JavaScript and existing local assets. Preserve the homepage unless changing it is part of the request. External font and GSAP references are allowed; the page is not required to work fully offline.

## Homepage design system — carry over

### Stack

- Semantic HTML, inline vanilla CSS and JavaScript.
- Google Fonts: Inter, Fraunces, Playfair Display, IBM Plex Mono; reuse the homepage font URL and load additional weights only when used.
- GSAP 3.12.5 and matching ScrollTrigger for scroll-linked effects.
- IntersectionObserver and `.reveal.is-in` for the homepage's standard entry transitions.
- Native smooth scrolling, with reduced-motion support. Tailwind and Lenis are not dependencies of the current homepage; add them only if requested.

### Colors

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#f8f3ea` | Main warm cream canvas |
| `--canvas-2` | `#f2eadf` | Warmer secondary surface |
| `--canvas-3` | `#fffdf8` | Light editorial surface |
| `--ink` | `#1f1a16` | Headings and main text |
| `--ink-soft` | `#655c51` | Supporting copy |
| `--ink-faint` | `#9f9387` | Quiet metadata |
| `--brand` | `#b3283a` | Crimson accents and primary actions |
| Button hover | `#971f31` | Primary hover |
| `--brand-2` | `#dd8263` | Secondary warm accent |
| `--gold` | `#d7ab58` | Restrained highlights |
| `--dusk` | `#1a1721` | Dark media sections |
| `--dusk-soft` | `#bdb6ac` | Copy on dark sections |
| `--line` | `rgba(31,26,22,.08)` | Fine separators |
| `--panel` | `rgba(255,255,255,.78)` | Translucent panels |
| Footer | `#fbf7f0` | Shared footer surface |

### Typography

- Body and UI: Inter; body copy around 16px, leading 1.72, `--ink-soft`.
- Default section headings: Fraunces 500, tracking `-.03em`; typically `clamp(2rem,4vw,3.6rem)`, leading 1.06.
- Hero heading: Inter 700, `clamp(3.1rem,7vw,6.2rem)`, leading 1.08; stacked sentence-case lines with crimson key words.
- Small component titles: Inter 700–800.
- Eyebrows: IBM Plex Mono 500, `.76rem`, uppercase, tracking `.09em`, crimson, with a 26px fine leading rule.
- Preserve the existing font hierarchy. Playfair is available in the homepage font import but is not a replacement for Fraunces section headings.
- Accent only the words that carry meaning; keep body text free of decorative typography.

### Layout and surfaces

- `.wrap`: `min(1240px, calc(100% - 40px))`, centered.
- Hero/header outer widths: up to 1450px; use the homepage's respective gutter rules.
- Section padding: `clamp(72px,9vw,132px)` vertically; 56px on small mobile.
- Editorial introductions centered at 760–900px maximum; reading copy stays comfortably narrow.
- Media/editorial grids: approximately 1.05fr / .95fr, with purposeful asymmetry where the story benefits.
- Panel radii: 22px and 28px; large CTA media panel: 34px.
- Main shadow: `0 30px 80px -40px rgba(34,24,18,.28)`.
- Soft shadow: `0 16px 40px -28px rgba(34,24,18,.22)`.
- Prefer subtle cream gradients, fine rules, translucent white panels, and generous open space.

### Header

Reuse `.nav`, `.nav__inner`, `.nav__brand`, `.nav__links`, and the mobile menu from `index.html`.

- Logo: `assets/xseed-blackline-logo.png`; accessible name: XSEED Education.
- Desktop navigation height: 188px initially, 98px after scrolling; logo: 10rem initially, 5rem after scrolling.
- At 860px and below: navigation 88px / 74px; logo 4.25rem / 3.5rem.
- After 24px scroll, `.is-solid` adds a translucent cream surface, 18px backdrop blur, and subtle bottom border.
- Navigation labels: Why XSEED, Products, About Us.
- On secondary pages, link these to `index.html#why`, `index.html#impact`, and `index.html#footer`; logo links to `index.html`.
- Keep the mobile menu operable by keyboard, synchronize `aria-expanded`, and prevent closed menu links from receiving focus.

### Buttons

Reuse `.btn` and `.btn--soft`: Inter 600, min-height 48px, padding `.95rem 1.45rem`, fully rounded, with a 10px icon/text gap.

Primary: crimson fill and white text. Hover: darker crimson, translateY(-2px), soft crimson shadow. Secondary: transparent, crimson text, thin crimson-tinted border.

### Footer

Reuse the homepage footer's appearance and content: cream surface, XSEED logo and description, Why XSEED / Programs / Company / Real Stories / Stay Updated columns, thin base rule, copyright, privacy and terms text.

Convert homepage fragment links to `index.html#...` on secondary pages. Keep `mailto:hello@xseededucation.com` as the existing contact destination. The existing subscription form opens an email client; do not describe it as a connected subscription service or invent successful submission states. Keep legal text noninteractive until real destinations are supplied.

## Page composition — continuous storytelling

Translate the new content into a natural sequence: opening promise, belief or problem, approach, supporting explanation or evidence, and a clear next step. Use the MASTEREDGE brief's variety of layouts without copying its brand or making its eight-section sequence mandatory.

- Opening: cinematic classroom/child media, readable stacked headline, short supporting message, meaningful action.
- Belief: spacious centered editorial statement with minimal decoration.
- Approach: asymmetric text and visual or principles; sticky behavior only where sufficient scrolling space exists.
- Optional pause: brief dusk-colored statement when the story changes direction.
- Product or method details: alternate visual/content layouts, using actual assets or clearly illustrative mockups.
- Support/evidence: open columns or restrained existing panel patterns; use only supplied claims and testimonials.
- Closing: large rounded media CTA in the homepage style, followed by the shared footer.

Avoid arbitrary “Part One / Part Two” dividers, repetitive numbered marketing components, or giving every section the same card layout. Numbering is appropriate for the XSEED Method's actual five-step teaching sequence.

## Content and imagery

The brand story centers on children becoming curious, capable, independent thinkers. When explaining the XSEED Method, preserve its sequence: Aim → Action → Analysis → Application → Assessment.

Inspect `assets/` and existing homepage usage. Available references include `assets/classroom.jpg`, `assets/method-course.jpg`, `assets/sunlit-classroom.png`, `assets/unafraid-child.jpg`, founder imagery, and `Children_learning_robotics.mp4`. Use assets according to their actual content; give meaningful images alt text and decorative images empty alt text. Resolve paths relative to the new file, not a presumed deployment directory.

Use autoplay only for muted, inline decorative video; provide a poster. Respect reduced motion and keep foreground copy legible over footage. Do not import MASTEREDGE logos, contact information, claims, or product names into an XSEED page unless the user requests that content.

## Motion and responsive behavior

- Standard reveals: opacity 0, translateY(28px) → resting state; `.85s` with `cubic-bezier(.22,.68,.2,1)`; IntersectionObserver threshold .18, reveal once.
- GSAP media entry: restrained 40px vertical movement, opacity reveal, approximately 1s, `power3.out`.
- Media parallax: subtle scale 1.06–1.08 and scrub .8–.9 when appropriate. Avoid competing animation systems on the same transform.
- Optional staggered statements may build line by line, but do not force animated word splitting onto all headings.
- Content remains readable when JavaScript or an external library fails. Disable parallax, smooth scrolling, and entry transforms for reduced motion.
- Preserve responsive intent at 1080px, 860px, and 640px. Stack editorial columns, release sticky content, reduce gutters, and keep text and controls within the viewport.

## Delivery checks

Verify semantic headings, unique IDs, existing asset paths, working destinations, JavaScript syntax, desktop/mobile layouts, menu focus behavior, reduced motion, and no horizontal overflow. Use browser visual checks when available and explicitly state when they could not be completed.

Deliver the requested HTML filename and a short account of what changed and what was verified. Do not add a new framework, change other pages, install global skills, or publish the site solely to create another project screen.
