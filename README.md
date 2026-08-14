# Inkfinity Studio & Academy

Cinematic, gold-and-black Vite + React SPA for a premium tattoo studio and
academy. Pure frontend — no backend, no database. Safe to deploy as a static
site.

## Required images

Drop these into `/public` before building (the app references them directly):

| File | Used for |
|---|---|
| `public/hero-bg.jpg` | Full-screen hero background |
| `public/try-on-body.jpg` | Smart Try-On canvas base layer |
| `public/academy-vibe.jpg` | Academy section background |
| `public/tattoo-1.jpg` | Portfolio grid, slot 1 |
| `public/tattoo-2.jpg` | Portfolio grid, slot 2 |
| `public/tattoo-3.jpg` | Portfolio grid, slot 3 |

If any file is missing, the browser will just show a broken image in that
one spot — nothing else breaks.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Outputs a static `dist/` folder.

## Deploying on Render

1. Push this repo to GitHub.
2. On Render: **New → Static Site**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. No environment variables or backend service needed.

## Stack

- Vite + React 18
- Tailwind CSS (custom `ink`/`gold` design tokens in `tailwind.config.js`)
- Framer Motion for scroll reveals and micro-interactions
- lucide-react for icons

## Notes

- The "Enhance & Apply" try-on effect is pure CSS (`mix-blend-mode: multiply`
  + `contrast`/`saturate` filters) — no image processing backend.
- The UPI payment and EMI authentication flows are mocked with local React
  state and `setTimeout` — wire up a real payment gateway when ready.
- Six of the nine portfolio images are Unsplash placeholders; swap the URLs
  in `src/components/Portfolio.jsx` for real studio work.
