# XSEED Education Homepage — Design Package
Creative Director's Loop deliverable, Phase 5 of the 10K Websites build. Every line of copy below ships verbatim into the build.

## 0. Producer summary

- **Tier:** Tier 3, choreographed. The video is designed for the page, and one coded interactive moment carries the site's whole idea.
- **What's already paid for:** the hero's starting frame and two of the below-fold images already exist in the project folder (`bg-xseedmethod-2.png`, `bg-xseedmethod-1b.png`, `hero-classroom.png`, `unafraid_child.png`, the logo). Zero credits needed to launch v1.
- **What v1 ships without:** the scrub hero video. `bg-xseedmethod-2.png` becomes the composed static hero (a designed layout, not a fallback apology, per the skill's own standard) with a slow CSS Ken-Burns drift and scroll-linked parallax, so the site is complete, fast, and beautiful today.
- **What v2 adds, once Higgsfield credits are funded (account is at 0 now):** the scroll-scrubbed hero video, generated from `bg-xseedmethod-2.png` as the literal start frame. Cost at that point: about 2 credits to confirm the frame (already have it, so 0), about 10 to 55 credits for the 6-second video depending on model, preflighted and approved before anything is spent. Nothing else in this package changes when the video is added; the static hero's CSS layer simply gets replaced by the scrub-hero JavaScript.
- **Mobile decision:** static hero by default, per the skill's own standard (composed poster, no scrub). Since v1 has no video at all yet, this is automatic.
- **Existing assets used as-is, no regeneration:** the logo, `hero-classroom.png` (real classroom, "AIM" on the chalkboard, the "THE 5 As" poster on the wall), `unafraid_child.png` (the "unafraid" motif), `bg-xseedmethod-1b.png` (the labeled five-stage schoolyard shot, becomes the Method reveal's key visual).

## 1. The brand premise

One real XSEED idea drives the whole page: **doing is how understanding happens.** Not "we teach a method," but "you just did the method, without being told you were doing it." Every section, the one interactive moment, and the closing line serve this. XSEED's own language backs it exactly: "from rote to learning, from telling to teaching."

## 2. The palette as CSS tokens

Sampled from the schoolyard photography's own grade: low golden-hour sun, warm dirt track, cool morning sky, deep indigo dusk for contrast passages. This is the subject's own material world, not a stock AI look, so committing to it is earned rather than a default reach.

```css
:root{
  --canvas:#FBF4E8;        /* warm ivory, tinted toward the golden-hour grade, never pure white */
  --canvas-dusk:#171522;   /* deep indigo-black for the founder and method-reveal passages */
  --panel:#FFFFFF;         /* cards, raised surfaces */
  --accent:#E4572E;        /* XSEED red-orange, from the wordmark and the sunrise itself */
  --accent-hover:#C74521;
  --accent-muted:#E4572E26; /* accent at whisper level: borders, glows, particles */
  --gold:#D9A441;          /* secondary accent, the low sun and dirt track */
  --text-secondary:#5B5646;
  --text-primary:#221F1A;
  --text-on-dusk:#F4EFE3;
}
```

## 3. The type trio

- **Display:** Fraunces (variable, optical size high). A warm editorial serif with real character, humanist and slightly imperfect, echoing chalk-and-paper rather than a screen-native sans. Weights: 340 (light, for large settle moments) and 620 (semibold, for headlines).
- **Body:** Public Sans, weights 400 and 500. Quiet, legible, unmistakably a body face next to Fraunces.
- **Mono:** IBM Plex Mono, weight 500, for stage labels ("AIM," "ACTION"...), the nav's small caps, and HUD-style readouts.

## 4. The hero band map (v1, static hero; v2 adds scroll-scrub on the same bands)

Hero height: 100vh in v1 (static, composed image, no pinned scroll region yet). When the video ships in v2, this becomes a 400vh pinned scrub region and these same captions become scroll-driven bands.

| Band | Moment | Copy (verbatim) | Entrance |
|---|---|---|---|
| 1 | Load | "Every Child Can Learn Better." | Word-by-word rise, one-time load ramp |
| 2 | Load +0.4s | "When learning moves from knowing to doing." | Blur-to-sharp, settles after band 1 |
| 3 | Load +0.8s | "Grow an idea" + a small downward chevron | Drift-down, loops at whisper level |

v2 note: once the scrub video exists, bands 1 to 3 spread across the pinned region's first 60vh, each with its own scroll range, per the standard band-pacing rules in the engineering list below.

## 5. The static-hero copy block

Headline: **Every Child Can Learn Better.**
Subline: **When learning moves from knowing to doing.**
CTA: **See the XSEED Method →** (anchors to section 03)

Composed over `bg-xseedmethod-2.png`: the image's own generous sky (upper third) holds the headline; the subline and CTA sit lower-left, clear of the children and the target circle on the right. Local scrim only behind the text zone, not across the whole frame, since the photo's exposure is already gentle there.

## 6. The below-fold outline

**02 — Experience XSEED (the signature section).** Kicker: "Don't read about the XSEED Method. Experience it." The one interactive moment lives here (see section 7). Built on `bg-xseedmethod-1b.png` as the section's establishing image: the five stage labels already visible in the photo (Aim, Action, Analysis, Application, Assessment pinned over each child) are echoed, not duplicated, by the interactive component below it.

**03 — The Reveal.** Large type, lots of breathing room, `--canvas-dusk` background. "Aim · Action · Analysis · Application · Assessment" assembles letter by letter (scatter entrance, echoing the interactive moment just completed), then: **"A better way to learn."**

**04 — Real Classroom.** Kicker: "Now see it happen in a classroom." Full-bleed `hero-classroom.png`: a real teacher, "AIM" on the chalkboard, hands raised, the "THE 5 As" poster on the wall already in frame. Caption overlay, chip-scrim style: "The teacher establishes a clear learning outcome." No video in v1; this is a single powerful still. (v2 note: if a real classroom video is ever supplied by XSEED, this is where chaptered video replaces the still, per the skill's Phase 2 branch for real assets.)

**05 — Founder.** `--canvas-dusk` background, `unafraid_child.png` cropped as a soft-focus background layer at low opacity (the child's gaze motif, echoing "Unafraid Independent Thinking Children"). Quote, large: **"Children don't need more information. They need a better way to learn."** Byline: **Ashish Rajpal, Founder, XSEED Education.** Circular audio control, built and wired now, muted/disabled state with the label "Audio coming soon" until a real recording is supplied (per your answer: design now, add real audio later). No fake waveform pretending to play.

**06 — Proof.** Minimal numbers, no card grid: **1,000,000+** children learning the XSEED way, every hour. **10,000+** hours of instructional resources. **350+** team members. Sourced from XSEED's own published figures, not invented.

**07 — Final.** `unafraid_child.png`, full crop this time, looking toward camera. **"Build thinkers. Not memorizers."** CTA: **Explore XSEED →**

**Nav:** logo left (the speech-bubble mark), five small mono-caps links right (Method, Classroom, Founder, Proof, Contact), last one the accent CTA.

**Footer:** XSEED wordmark, "Foundation for Life," contact mailto, no fictional-brand disclosure needed (this is the real XSEED).

**Form / contact:** a mailto link ("Talk to us about XSEED") for now, since this is a lead-gen site for a real business with a real inbox; upgrade to a form service only if XSEED wants submissions tracked, decide with the user before deploy.

## 7. The one interactive moment: "Walk the Method"

Lives in section 02, mirrors the brand's own idea (doing, not being told). Five stops laid out horizontally, echoing the physical course already visible in `bg-xseedmethod-1b.png`: a small marker (styled like the photo's cones) sits at AIM. The visitor clicks or drags it forward, one stop at a time:

1. **AIM** — "Where are we going?" Clicking reveals one simple written goal.
2. **ACTION** — "Try it." Clicking swaps in a one-line "what a child does here."
3. **ANALYSIS** — "What happened?" A short question with a one-tap answer.
4. **APPLICATION** — "Now solve it differently." One line of transfer.
5. **ASSESSMENT** — the marker reaches the target circle (echoing the photo's actual target), and the five words assemble into "That is the XSEED Method."

Mechanics: progress bar fills as the marker advances (not a hold-and-release; a click-through walk fits "simplified 5-step" better than a press-and-hold). Releasing or going back eases the marker back, never snaps. Reduced motion shows all five stops already resolved. This is the site's whole boldness budget for interactivity, per your call to keep it to one simplified interaction; everything else on the page stays quiet so this reads as the signature moment.

## 8. The vector layer plan

- A single hand-drawn SVG line, styled after the logo's own sketchy speech-bubble strokes, self-draws once beneath the "Walk the Method" course as the visitor progresses, literally connecting AIM to ASSESSMENT.
- Whisper-level dust/light particles over the hero image only, 60-second cycle, paused off-screen and under reduced motion.
- One fixed background environment layer (a soft warm-to-indigo gradient wash) behind sections 03 and 05, so the dusk passages read as one continuous place rather than two separate dark sections.

## 9. The engineering list (build inherits this in full)

Semantic landmarks and skip link; `ch`-sized text on text elements only; real contrast (4.5:1 body, 3:1 large text); `:focus-visible` in the accent; 44px touch targets under `(pointer:coarse)`; `overflow-x:clip` on html and body; reduced motion honored live in both directions; one living element per section at whisper level with negative animation delays; entrances prefixed with container class and stagger delays retired correctly; inline SVG favicon of the XSEED mark; real title, meta description, `theme-color`; `og:image`/`og:url` patched at deploy with the `<!-- DEPLOY STEP -->` comment. When the v2 scrub video is added: Blob fetch with loading ring, dt-normalized lerp, gated seeks, delta-gated DOM writes, the four-layer legibility system, the five static-hero gates live in CSS and JS, complete-without-video.

## 10. The copy gate line

Every viewer-facing line above ships verbatim. Before anyone sees the build: grep for em dashes and the stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), zero on both, plus the body-copy sweep for softer AI tells. The deliberate device here ("Aim · Action · Analysis · Application · Assessment" as a designed assembly) is craft, not a tell, and stays.
