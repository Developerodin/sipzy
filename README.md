# Sipzy Showcase Website

A responsive, single-page brand website for Sipzy. This is a showcase experience only—there are no prices, carts, checkout flows or ecommerce dependencies.

## Included

- Scroll-scrubbed 12-second Higgsfield/Seedance hero video
- 8% and 16% product range switcher
- All 12 Sipzy flavour mockups
- Brand story, strength comparison, serving ritual and contact sections
- Responsive desktop, tablet and mobile layouts
- Reduced-motion accessibility fallback

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Before launch

1. Replace `hello@sipzy.in` in `index.html` if Sipzy uses another business email.
2. Add confirmed social links if required.
3. Confirm all flavour descriptions and regulatory wording with the brand/legal team.
4. Upload the complete folder to any static host such as Netlify, Vercel, Cloudflare Pages or standard cPanel hosting.

## Structure

- `index.html` — page content and semantic structure
- `styles.css` — complete visual system and responsive layouts
- `app.js` — scroll video, range switcher and reveal interactions
- `assets/video/` — scroll hero film
- `assets/products-webp/` — optimized product imagery

