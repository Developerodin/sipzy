# Sipzy Bottle Asset Catalog & Animation Ideas

Transparent PNG cutouts exported from Figma (file `lb4DpK1ZPlgW6JergGV71Q`). Each asset is a **1254×1254 RGBA** bottle on a fully transparent background (~82–83% transparent pixels, alpha 0 at corners, opaque bottle center). Ready for CSS compositing, canvas layering, or scroll-driven motion.

---

## Inventory

| # | Slug / ID | Display Name | ABV | Bottle Size | Figma Node | File Path |
|---|-----------|--------------|-----|-------------|------------|-----------|
| 01 | `cranberry-affair-8pct-275ml` | Cranberry Affair | 8% | 275 ml | `449:6785` | `assets/bottles/01-cranberry-affair-8pct-275ml.png` |
| 02 | `jamun-shot-8pct-275ml` | Jamun Shot | 8% | 275 ml | `449:6786` | `assets/bottles/02-jamun-shot-8pct-275ml.png` |
| 03 | `mango-mood-8pct-275ml` | Mango Mood | 8% | 275 ml | `449:6788` | `assets/bottles/03-mango-mood-8pct-275ml.png` |
| 04 | `orange-voltage-8pct-275ml` | Orange Voltage | 8% | 275 ml | `449:6790` | `assets/bottles/04-orange-voltage-8pct-275ml.png` |
| 05 | `mojito-drift-8pct-275ml` | Mojito Drift | 8% | 275 ml | `449:6789` | `assets/bottles/05-mojito-drift-8pct-275ml.png` |
| 06 | `lemonade-twist-8pct-275ml` | Lemonade Twist | 8% | 275 ml | `449:6787` | `assets/bottles/06-lemonade-twist-8pct-275ml.png` |
| 07 | `watermelon-wave-8pct-275ml` | Watermelon Wave | 8% | 275 ml | `449:6791` | `assets/bottles/07-watermelon-wave-8pct-275ml.png` |
| 08 | `mojito-heritage-16pct-330ml` | Mojito Heritage | 16% | 330 ml | `449:6796` | `assets/bottles/08-mojito-heritage-16pct-330ml.png` |
| 09 | `cranberry-cellar-16pct-330ml` | Cranberry Cellar | 16% | 330 ml | `449:6793` | `assets/bottles/09-cranberry-cellar-16pct-330ml.png` |
| 10 | `orange-oak-16pct-330ml` | Orange Oak | 16% | 330 ml | `449:6797` | `assets/bottles/10-orange-oak-16pct-330ml.png` |
| 11 | `jamun-cask-16pct-330ml` | Jamun Cask | 16% | 330 ml | `449:6794` | `assets/bottles/11-jamun-cask-16pct-330ml.png` |
| 12 | `mango-mirage-16pct-330ml` | Mango Mirage | 16% | 330 ml | `449:6795` | `assets/bottles/12-mango-mirage-16pct-330ml.png` |

### Asset specs (all 12)

| Property | Value |
|----------|-------|
| Format | PNG |
| Color mode | RGBA (alpha channel present) |
| Dimensions | 1254 × 1254 px |
| Background | Fully transparent (corner alpha = 0) |
| Transparency coverage | ~82–83% of pixels |
| File size | ~470–530 KB each |

### Range groupings

- **8% tier (275 ml):** slugs `01`–`07` — lighter, compact bottles
- **16% tier (330 ml):** slugs `08`–`12` — taller, fuller expressions

### Code-ready identifiers

Use the slug for `data-bottle`, CSS classes, or JS lookups:

```html
<img
  src="assets/bottles/02-jamun-shot-8pct-275ml.png"
  alt="Sipzy Jamun Shot 8% bottle"
  data-bottle="jamun-shot-8pct-275ml"
  data-tier="8"
  loading="lazy"
>
```

```js
const BOTTLES = {
  "jamun-shot-8pct-275ml": { tier: 8, node: "449:6786", file: "02-jamun-shot-8pct-275ml.png" },
  // …
};
```

---

## Animation Ideas Catalog

These PNG cutouts are ideal for layered, composited motion. Because backgrounds are transparent, bottles can float over gradients, video, or particle fields without masking.

### Scroll-driven

| Idea | Description | Fit for Sipzy site |
|------|-------------|-------------------|
| **Scroll-scrub float** | Bottle Y-position and slight rotation tied to scroll progress (like the hero video scrub). | Extend existing scroll-scrub pattern in `app.js` to a product spotlight section. |
| **Parallax range lineup** | 7 or 5 bottles at different `translateZ` depths; foreground bottle moves faster on scroll. | Range switcher section — swap lineup when toggling 8% ↔ 16%. |
| **Sticky product spotlight** | One bottle pins center-screen while copy scrolls beside it; crossfade to next flavour on threshold. | Story / ritual sections with one hero bottle per scroll chapter. |
| **Staggered entrance** | Bottles rise from below with `opacity` + `translateY`, staggered 80–120 ms apart. | Product grid reveal on first viewport entry. |
| **ABV tier compare** | Scroll through 8% lineup, then morph/crossfade to 16% lineup with scale shift (275 ml → 330 ml feel). | Strength comparison section — visual proof of tier difference. |

### Hover & pointer

| Idea | Description | Fit for Sipzy site |
|------|-------------|-------------------|
| **3D-ish tilt via CSS** | `transform: perspective(800px) rotateX() rotateY()` from mouse position. | Product cards — subtle premium feel without WebGL. |
| **Hover spin / sway** | Gentle `rotateZ(±3deg)` oscillation or slow 360° on `:hover`. | Flavour cards in the range grid. |
| **Magnetic cursor follow** | Bottle drifts 8–16 px toward cursor with spring easing. | Hero or featured bottle CTA. |
| **Shadow / ground contact** | Elliptical shadow scales and blurs as bottle “lifts” on hover. | Reinforces physical presence on flat layouts. |

### Transitions & morphs

| Idea | Description | Fit for Sipzy site |
|------|-------------|-------------------|
| **Flavor morph / crossfade** | Crossfade between two bottle PNGs when range switcher changes; optional scale pulse. | Direct upgrade path for `#range-8` / `#range-16` toggle. |
| **Liquid fill illusion** | Clip-path or masked gradient overlay rising inside bottle silhouette. | “Pour” moment in serving ritual section. |
| **Bottle stack / collapse** | Stack all tier bottles, then fan out or collapse into one on interaction. | “Full range” hero or footer flourish. |
| **Glass refraction illusion** | Duplicate bottle layer with `backdrop-filter: blur()` + slight offset behind main PNG. | Premium detail on single featured bottle. |

### Motion libraries & advanced

| Idea | Description | Fit for Sipzy site |
|------|-------------|-------------------|
| **GSAP timelines** | `ScrollTrigger` for scrubbed parallax; `Flip` for layout transitions when range changes. | Drop-in via CDN — no build step required. |
| **Orbit carousel** | Bottles arranged on an elliptical path; active bottle scales up, others recede. | Mobile-friendly flavour picker alternative to grid. |
| **Canvas / WebGL particle trails** | Fruit-colored particles emit from bottle neck on scroll or hover (jamun purple, mango gold, etc.). | Hero or flavour-specific accent — keep particle count modest for perf. |
| **Lottie-style SVG overlays** | Animated mint leaves, citrus slices, or condensation drips as SVG layers over PNG. | Per-flavour micro-animations without re-exporting bottles. |

### Ambient & atmospheric

| Idea | Description | Fit for Sipzy site |
|------|-------------|-------------------|
| **Idle float loop** | `@keyframes` gentle `translateY(±6px)` over 3–4 s, `ease-in-out`. | Any always-visible bottle — respects `prefers-reduced-motion`. |
| **Condensation shimmer** | CSS gradient sweep across bottle using `mix-blend-mode: overlay`. | Cold-serve ritual section. |
| **Tier color wash** | Background gradient shifts to flavour accent when bottle enters viewport. | Tie into existing CSS custom properties (`--jamun`, etc.). |

---

## Suggested Tech Approaches (Static HTML / CSS / JS)

This site has no framework yet. These approaches match the current stack (`index.html`, `styles.css`, `app.js`).

### 1. Pure CSS (zero dependencies)

```css
.bottle-float {
  animation: bottleFloat 3.5s ease-in-out infinite;
  will-change: transform;
}

@keyframes bottleFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

@media (prefers-reduced-motion: reduce) {
  .bottle-float { animation: none; }
}
```

Use `transform` and `opacity` only for GPU-friendly motion. Pair with existing reveal classes in `app.js`.

### 2. Extend existing scroll logic (`app.js`)

The hero already scrubs video on scroll. Mirror that pattern:

```js
function scrubBottle(section, bottleEl) {
  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const progress = 1 - Math.min(1, Math.max(0, rect.top / window.innerHeight));
    bottleEl.style.transform = `translateY(${progress * -40}px) rotate(${progress * 4 - 2}deg)`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
```

### 3. Range switcher bottle swap

When the 8% / 16% toggle fires (existing handler in `app.js`), crossfade bottle lineups:

```js
function swapBottleLineup(tier) {
  document.querySelectorAll("[data-bottle-tier]").forEach(el => {
    el.style.opacity = el.dataset.bottleTier === String(tier) ? "1" : "0";
  });
}
```

Layer two absolutely positioned `<img>` stacks sharing the same frame.

### 4. GSAP via CDN (optional upgrade)

If richer motion is needed without a build step:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```

Good for: scroll-scrubbed parallax lineup, staggered grid entrance, FLIP transitions on range toggle.

### 5. Canvas particle accent (lightweight)

A single `<canvas>` behind the bottle PNG. ~50–80 particles, flavor-colored, low alpha. Pause when off-screen (`IntersectionObserver`) to protect mobile battery.

### 6. Performance checklist

- Serve bottles as PNG for alpha; consider WebP with alpha for production if size matters.
- Use `loading="lazy"` for below-fold bottles (already used elsewhere on site).
- Limit simultaneous animated bottles to 1–3 on mobile.
- Honor `prefers-reduced-motion: reduce` (site already has reduced-motion fallback).

---

## Usage Notes

- **Do not flatten** these PNGs onto opaque backgrounds before animating — transparency is the compositing advantage.
- **8% bottles** share a similar compact silhouette; **16% bottles** are taller — account for ~15% height difference when swapping tiers.
- Existing product imagery lives in `assets/products-webp/`; these Figma cutouts in `assets/bottles/` are higher-fidelity transparent layers for motion/compositing experiments.
- Figma source nodes are listed in the inventory table for re-export if assets need refreshing.

---

*Generated for the Sipzy showcase site — transparent bottle cutouts ready for compositing and scroll-driven motion.*
