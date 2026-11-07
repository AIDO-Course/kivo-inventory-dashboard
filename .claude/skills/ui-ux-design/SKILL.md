---
name: ui-ux-design
description: Design direction and UI/UX rules for building distinctive, polished frontends — static sites, landing pages and dashboards. Use whenever the user asks to design, build, style, restyle, redesign, polish, review or critique a page, dashboard, component, layout, color palette, typography, motion, chart or data table, or says the UI "looks generic", "looks AI-made" or "needs to look better". Covers art direction, anti-"AI slop" rules, typography, color, layout, motion, dashboards and data display, UX states, copywriting, accessibility and a pre-delivery checklist.
---

# UI/UX Design

Act as the design lead at a studio known for giving every client a distinct visual identity. The client has already rejected proposals that felt templated. Make deliberate, opinionated choices for *this* brief, and keep quality high on the basics (accessibility, responsiveness, states) without announcing it.

Scope: visual design, UI/UX and styling of static apps and dashboards. Engineering architecture, testing and backend concerns are out of scope.

---

## 1. Process (always follow)

### Step 1 — Understand the brief
Extract or infer, and if the brief is vague, propose and confirm:
- **Subject**: what the product is, in concrete terms. Its industry, materials and vocabulary are where distinctive choices come from (a toy for kids ≠ a dashboard for financial analysts).
- **Audience** and the page's **primary job** (inform, convert, monitor, compare, act).
- **Tone**: one specific aesthetic direction (e.g. editorial, industrial, technical/IDE, warm organic, Swiss, brutalist, luxurious-restrained). Never "modern and clean" — that is not a direction.
- **Constraints**: stack (default: HTML + CSS/Tailwind), light/dark, density, existing brand.
- **Differentiation**: the one thing someone will remember.

If a brief, brand or design system pins down a direction, follow it exactly — the brief always wins. In redesigns, preserve the existing identity unless told otherwise.

### Step 2 — Write a compact design plan before coding
- **Color**: 4–6 named hex values with roles (ground / surface / ink / muted / accent / secondary accent).
- **Type**: typefaces and their roles (display / body / mono), plus the scale.
- **Layout**: a one-sentence concept + a quick ASCII wireframe. State alignment (left / center / mixed).
- **Motion**: one orchestrated moment + interaction feedback.
- **Principles**: 2–3 lines on what makes this page unique.
- **Three dials** (set each low/medium/high to fit the brief): design variance, motion intensity, visual density. Dashboards: usually low variance, low motion, high density. Landing pages: higher variance and motion, lower density.

### Step 3 — Review the plan against the brief
Ask: "Would I produce this same plan for any similar prompt?" If any part is a default rather than a choice, revise it and say what changed and why. Check it against the AI-tells list (§2).

### Step 4 — Build
Follow the revised plan. Use real content from the brief; write realistic copy when none is given (§9).

### Step 5 — Critique and polish
Screenshot and look, if the environment allows. Check every item in §11. Apply Chanel's rule: before leaving the house, remove one accessory. Spend boldness in one place — one memorable element, everything around it quiet and disciplined.

---

## 2. Anti-"AI slop": defaults to avoid

These appear regardless of subject, which is why they read as generated. Each is acceptable only if the brief explicitly asks for it or it is clearly the best choice for this subject.

**Typography**
- Inter, Roboto, Arial, Open Sans, Lato, Poppins, Montserrat, Raleway, Outfit, Space Grotesk, or system-default stacks as the primary font. (Inter Tight is a different family and is fine.)
- Uniform, timid hierarchy (64 → 32 → 18 → 14) with default tracking and line-height everywhere.
- Accenting a single word in a headline with italic, bold or a different color.
- Tracked-out ALL-CAPS eyebrow labels above every heading; unnecessary labels above content.
- Centered multi-line paragraphs.

**Color**
- Purple/indigo/violet gradients on white; purple-to-blue gradients; indigo as primary with no reason.
- The SaaS starter kit: white background + one accent + gray text.
- Warm cream (`#F4F1EA`) + high-contrast serif + terracotta accent (`#D97757`).
- Near-black + a single neon/acid-green or vermilion accent ("developer portfolio" look).
- Gradients on buttons and cards for decoration; opacity used instead of real color choices.

**Layout & components**
- Hero → 3-column icon-feature grid → testimonials → CTA → footer.
- Headline + subheadline + two side-by-side buttons as the whole hero; a big number + small label + gradient accent hero.
- Content chopped into identical rounded cards, one radius on everything, the same `rgba(0,0,0,.1)` shadow under each.
- Everything centered and boxed in one max-width container; perfectly symmetrical equal grids.
- Broadsheet layout with hairline rules and zero radius used as a default rather than a choice.
- Numbered markers (01 / 02 / 03) when the content is not actually a sequence.
- Template chrome: "A · B · C" meta strings, "WORD — fragment" labels, `→` appended to every link and button, mono for every small data label.

**Motion & decoration**
- Fade-and-slide-up on every section; identical transitions everywhere; hover that only scales or adds a shadow.
- Blob shapes, floating circles/triangles, generic gradient meshes, stock-photo grids.
- Emojis as icons; generic icon + heading + paragraph cards.

**Variety rule**: across generations, vary light and dark themes, fonts and aesthetics. Do not converge on a favorite.

---

## 3. Typography

Typography carries the personality of the page. Use type as an active design element, not a neutral container.

- **Families**: one or two. If two, make them clearly distinct (display + mono, serif + geometric sans, or one variable family across extreme weights). Load from Google Fonts (or a CDN like Fontshare). State the choice before coding.
- **Font starting points by mood** (pick to fit the subject, not out of habit):
  - Editorial / luxury: Fraunces, Playfair Display, Cormorant Garamond, DM Serif Display, Instrument Serif, Crimson Pro, Newsreader
  - Startup / product: Clash Display, Satoshi, Cabinet Grotesk, General Sans, Bricolage Grotesque
  - Technical / data: IBM Plex Sans/Mono, JetBrains Mono, Fira Code, Source Sans 3, Geist / Geist Mono
  - Neutral refined body: Source Serif, IBM Plex Sans, Public Sans, Manrope
- **Contrast**: weight extremes (200–300 against 800–900, not 400 against 600). Size jumps of 3x+ for display moments.
- **Scale**: a clear, intentional type scale; use `clamp()` for fluid sizing. Display headlines can reach 6–8vw on marketing pages.
- **Tracking**: −0.02em to −0.06em on large headlines; slightly positive tracking on small caps or labels if used.
- **Line-height**: body 1.5–1.75 (serif body a bit more); headlines 0.9–1.15.
- **Measure**: body lines 45–75 characters (never above ~80). `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- **Body size**: ≥16px; never below 12px for any text, including on dashboards.
- **Numbers**: `font-variant-numeric: tabular-nums` for tables, KPIs, prices and anything that updates or aligns.
- **Case**: sentence case for headings and buttons. ALL-CAPS only as a deliberate, sparing choice.

---

## 4. Color & theme

- **Define everything as CSS variables / semantic tokens** (`--bg`, `--surface`, `--ink`, `--muted`, `--border`, `--accent`, `--accent-ink`, status colors). Never scatter raw hex values through components.
- **Dominant + sharp accent**: commit to one dominant mood and one intentional accent. Timid, evenly distributed palettes look weak. Color used sparingly hits harder.
- **Start from neutrals**: add color only where it earns its place. Prefer tinted neutrals and off-whites (`#FAFAF8`, `#F5F3EF`, `#1A1A1A`, `#121212`) over pure `#FFF` / `#000`, but do not default to the cream/terracotta combo.
- **Inspiration sources**: IDE themes (VS Code, JetBrains, Solarized, Nord, Gruvbox), Swiss graphic design, editorial print, the subject's own industry and culture.
- **Industry fit**: finance/legal → conservative (navy, charcoal, forest) and structured; luxury → extreme restraint; food → warm, muted earth tones; tech/data → systematic, light or dark, no purple-gradient cliché; aerospace/auto → deep darks, restrained metallic accents.
- **Dark mode done right**: layered surfaces (bg → surface → raised) with subtle warm or cool tints, not just white on gray. Reduce saturation of accents on dark backgrounds. Test both modes.
- **Light-mode contrast traps**: body text near `#0F172A`; muted text no lighter than `#475569`; borders visible (`gray-200`-ish, not `white/10`); glass/translucent panels at ≥80% opacity.
- **Status colors**: success / warning / danger / info, each paired with an icon or label — never color alone.
- **Atmosphere** (marketing pages): layered radial/linear gradients, subtle grain/noise (SVG filter), faint geometric grids, layered transparency. Keep dashboards calmer: flat surfaces with subtle borders.

---

## 5. Layout & spatial composition

- **Visual structure is information**: borders, dividers, numbering, labels and outlines must encode something about the content, not decorate it.
- **Grid**: a 4/8px spacing scale, used consistently. One container max-width across the site.
- **Hierarchy through** scale, contrast, weight and space — not through more boxes.
- **Marketing / landing pages**:
  - Open with the most characteristic thing in the subject's world (an image, a live demo, an interactive moment, a bold typographic statement), chosen deliberately.
  - Prefer composition with intent: asymmetric splits (60/40, 70/30), overlap, elements crossing section boundaries, full-bleed moments followed by narrow columns, grid-breaking elements, generous negative space (≥ 6–8rem between sections).
  - Pick **one structural concept** per page and name it before coding, e.g.: Index Manuscript (one long editorial column), Sticky Horizontal Diorama, Two-Pane Permanent Split, Slide Sequence (snap scrolling), Staged Object (one subject + marginalia), Pinned Narrative (scrollytelling centerpiece), Sidebar + Column, Chapter Gates (tonal zones), Ledger / Registry (tabular rows), Collage / Grid-Breaker, Product UI Slate, Dashboard Tile Grid. Don't mix two concepts; don't reuse the last one.
  - Navigation need not be a default top bar: consider sidebar nav, an inline centered wordmark, a bottom command bar (⌘K style), or no nav for single-subject pages.
- **Fixed / floating elements**: offset floating navbars from edges; never let content hide behind a fixed header.
- **Responsive**: verify at 375, 768, 1024 and 1440px. No horizontal scroll on mobile. Use container queries for components that live in varying widths.
- **CSS hygiene**: watch selector specificity so section padding/margins don't cancel each other; define a z-index scale (e.g. 10 / 20 / 30 / 50).

---

## 6. Dashboards & data display

Dashboards are read and used repeatedly, so clarity, density and scan speed beat novelty. Express personality through type, color and detail, not through unusual structure.

- **Information hierarchy**: the most important numbers first (top-left in LTR, top-right in RTL). Group by the user's question, not by data source. One primary view per screen.
- **KPI tiles**: value large and tabular; label small and plain; comparison (Δ vs. period) with direction icon + color + sign; optional sparkline. Avoid the generic "big number + gradient" tile on every card; vary emphasis by importance.
- **Density**: compact but breathable (rows ~36–44px, 12–16px cell padding). Offer comfortable/compact if lists are long.
- **Surfaces**: prefer subtle borders or background steps over heavy shadows. Vary radius by hierarchy, not one radius for everything.
- **Charts**:
  - Match chart to data: trend → line/area; comparison → bar (horizontal for long labels); part-to-whole → stacked bar or a single donut with ≤5 slices; distribution → histogram; correlation → scatter. Avoid 3D charts and pie charts with many slices.
  - Remove chart junk: light or no gridlines, no heavy borders, direct labels instead of legends where possible.
  - Use one categorical palette across the whole dashboard, consistent per series; sequential palette for magnitude; diverging for above/below a midpoint. Ensure palettes are accessible and distinguishable in both themes.
  - Axis labels and units always; format numbers (1.2K, 3.4M, %, currency) consistently. Start bar axes at zero.
  - Tooltips on hover/focus with exact values; provide a table alternative for key charts.
- **Tables**:
  - Right-align numbers, left-align text; tabular figures; sticky header; zebra or hover row highlight (not both heavy).
  - Sortable columns indicate sort state; truncate long text with full value on hover/title.
  - Filters and search visible above the table; show active filters and a clear-all.
- **States** (every widget): loading skeleton matching the final shape, empty state with a next action, error state with retry, partial data shown rather than hidden.
- **Freshness**: show "last updated" time and units/periods clearly.

---

## 7. Motion & interaction

- **Motion with purpose**: non-user-triggered motion only to draw attention. One orchestrated moment (a page-load sequence with staggered `animation-delay`, or one reveal) beats scattered effects.
- **Feedback motion is welcome**: opening, expanding, confirming — show what changed.
- **Timing**: micro-interactions 150–300ms; larger transitions up to ~400–500ms; never sluggish (>500ms) for UI feedback. Fast entrance + slower settle feels alive.
- **Easing**: avoid linear for UI. Good curves: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth out), `cubic-bezier(0.33, 1, 0.68, 1)` (elegant ease-out), `cubic-bezier(0.77, 0, 0.175, 1)` (snappy in-out).
- **Performance**: animate only `transform` and `opacity`; never width/height/top/left.
- **Hover**: color, border or opacity changes that don't shift layout; no scale transforms that push neighbors.
- **Tactile feel**: buttons respond on press (`:active`), not only on release; moving elements stay interruptible; dragged items follow the pointer.
- **Tools**: CSS first. CSS scroll-driven animations (`animation-timeline: view()`) for simple reveals. Motion (React) or GSAP/ScrollTrigger only for complex sequences, pinning or scroll-linked storytelling; scope selectors and clean up on unmount.
- **Scroll**: enhance scrolling, never hijack it. Keep native scroll speed. Keep effects simpler on mobile.
- **Reduced motion**: always respect `prefers-reduced-motion` with a static or fade-only alternative.
- **Dashboards**: minimal motion — subtle number transitions, skeleton shimmer, panel open/close. No decorative entrance animations on data.

---

## 8. Components & UX patterns

- **Interactive states for every control**: default, hover, active/pressed, focus-visible, disabled, loading. `cursor: pointer` on everything clickable.
- **Touch targets**: ≥44×44px (48px on Android-style UIs) with ≥8px between targets.
- **Buttons**: one clear primary action per view; disable and show a loading indicator during async actions; label says exactly what happens.
- **Forms**: visible labels (placeholder is not a label); group with fieldset/legend; inline validation near the field, on blur not on every keystroke; preserve input on error.
- **Feedback within ~100ms** for every interaction.
- **Loading**: show loading only when there is no data yet; skeletons for known shapes, spinners for unknown/short inline actions; reserve space to avoid layout shift.
- **Errors**: hierarchy by severity — inline (field) → toast (recoverable) → banner (page-level, partial data) → full screen (unrecoverable). Never fail silently.
- **Empty states**: every list/collection has one, with context and a next action ("No results — try different filters").
- **Progressive disclosure**: summary → details → advanced. Hide complexity until it's needed.
- **Forgiveness**: prevent errors (constraints, confirmations for destructive actions) and allow recovery (undo over confirm dialogs where possible).
- **Direct manipulation**: inline editing over separate forms; drag-and-drop where it is natural (with a keyboard alternative).
- **Icons**: one consistent SVG set (Lucide, Heroicons, Phosphor, Tabler) at consistent sizes; official brand logos (Simple Icons). Never emojis as UI icons. Use icons sparingly — overuse is an AI tell. Icon-only buttons need `aria-label`.
- **Component APIs (if using React)**: prefer explicit variants and composition (`<Alert variant="destructive">`, compound components) over piles of boolean props. With shadcn/ui, compose existing primitives and theme them through semantic tokens rather than hand-rolling fragile markup — then restyle so it doesn't look like stock shadcn.

---

## 9. Copywriting in the UI

Words are design content, not decoration.

- Write from the user's perspective, in their vocabulary: "Manage notifications", not "Webhook config".
- Be specific and plain rather than clever or salesy. Describe what something is or does.
- Active voice. CTAs state the outcome: "Save changes", "Export CSV", not "Submit" / "Click here".
- Keep an action's name consistent through the flow: "Publish" → toast "Published".
- Errors explain what happened and how to fix it, in the interface's voice; no apologies, never vague.
- Empty screens invite action.
- Sentence case, no filler, one job per text element. Use realistic content, not lorem ipsum.
- Descriptive link text ("View pricing details"), never "read more" alone.

---

## 10. Accessibility (non-negotiable quality floor)

- **Contrast (WCAG AA)**: 4.5:1 normal text; 3:1 large text (≥18px or ≥14px bold); 3:1 UI components, focus rings and meaningful graphics/chart lines.
- **Never color alone**: pair with icons, text, patterns or position (status, errors, links, chart series).
- **Keyboard**: everything operable by keyboard; logical tab order matching visual order; visible `:focus-visible` styles (never remove outlines without a replacement); no keyboard traps; skip-to-content link.
- **Semantics**: `<button>` for actions, `<a>` for navigation, landmarks (`header`, `nav`, `main`, `aside`, `footer`), one `<h1>` and logical heading levels, real `<table>` for tabular data, lists as lists.
- **Labels**: every input labeled; icon-only buttons have `aria-label`; meaningful images have alt text, decorative images `alt=""`.
- **ARIA**: prefer native elements; ARIA roles must match behavior; use live regions for async updates (toasts, refreshed data).
- **Page**: `lang` on `<html>` (and `dir="rtl"` for RTL languages — mirror layout using logical properties like `margin-inline-start`); `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- **Motion**: respect `prefers-reduced-motion`; no auto-advancing content without controls.
- **Zoom**: layout survives 200% zoom and text resize.

---

## 11. Craft details & performance of the visible layer

- Style `::selection` to match the brand; style scrollbars subtly where appropriate.
- Considered radius system: sharp for editorial/technical, specific radii by hierarchy — not `8px` on everything.
- Subtle grain/noise or texture where it fits the aesthetic.
- Optional for marketing pages: scroll progress indicator, custom cursor, magnetic buttons — only if they suit the concept.
- Fonts: preload the critical font, `font-display: swap`, limit families/weights.
- Images: modern formats (WebP/AVIF), explicit width/height to prevent layout shift, `loading="lazy"` below the fold.
- Targets: LCP < 2.5s, CLS < 0.1, interactions feel instant.

---

## 12. Pre-delivery checklist

**Direction**
- [ ] The design plan was written and checked against the brief; no part is a generic default.
- [ ] Nothing from the §2 AI-tells list appears unless it was asked for or deliberately chosen.
- [ ] Boldness spent in one place; one decorative element removed in the final pass.

**Visual**
- [ ] Distinctive fonts, clear scale, tight display tracking, readable body (≥16px, 45–75ch).
- [ ] All colors come from tokens; one dominant mood + one accent; both themes checked if supported.
- [ ] Consistent spacing scale, container width, radius system and icon set; no emoji icons.

**Interaction & states**
- [ ] Hover / active / focus-visible / disabled / loading states on every control; `cursor: pointer`.
- [ ] Hover effects don't shift layout; transitions 150–300ms on transform/opacity.
- [ ] Loading, empty and error states exist for every data area; async buttons disable.
- [ ] `prefers-reduced-motion` respected.

**Dashboards**
- [ ] Chart types match the data; axes, units and number formats consistent; tabular figures.
- [ ] Series colors consistent and accessible; key charts have a table or tooltip alternative.
- [ ] "Last updated" and filter state visible.

**Layout & accessibility**
- [ ] Works at 375 / 768 / 1024 / 1440px; no horizontal scroll; nothing hidden behind fixed elements.
- [ ] Contrast meets AA in every theme; color is never the only signal.
- [ ] Semantic HTML, labels, alt text, keyboard navigation and visible focus verified.
- [ ] Copy is specific, active, sentence case; CTAs say what happens.
