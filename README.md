# Vinesh

A single-page portfolio: warm-black canvas, hairline rules, mono annotations, one phosphor accent, and an authored GLSL "signal topography" field as the hero atmosphere.

## Stack

| Layer         | Choice                                                              |
| ------------- | ------------------------------------------------------------------- |
| Framework     | Astro (static output — deploy anywhere)                             |
| Motion        | GSAP + ScrollTrigger (intro, reveals, one scrubbed timeline)        |
| Smooth scroll | Lenis — the sole engine, driven by the gsap ticker                  |
| WebGL         | Three.js — one fullscreen shader quad (`src/scripts/signal-field.ts`) |
| Icons         | Solar via Iconify (build-time bundled)                              |
| Type          | Space Grotesk + JetBrains Mono (both OFL, self-hosted Fontsource)   |

## Editing content

Everything lives in `src/data/site.ts`. Project images live in `src/assets/work/` (imported via `astro:assets`, optimized to WebP at build).

## Accessibility and motion contract

- `prefers-reduced-motion: reduce` → no Lenis, no timelines; final states render immediately; the shader is replaced by the static grid poster
- No-JS → all content readable, anchors work natively, the shader stays hidden and the backdrop grid carries the hero
- WebGL failure or context loss → same poster fallback; content never depends on the canvas
- Split headings keep an unsplit accessible name (`.sr-only` span); only `aria-hidden` words animate
- Keyboard: skip link, visible focus rings, menu focus wrap + Escape, live region for copy feedback
- Canvas: DPR capped, paused off-screen and when the document is hidden, everything disposed on `pagehide`

## Commands

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Provenance

- Type: Space Grotesk, JetBrains Mono — SIL OFL, via Fontsource
- Icons: Solar set via Iconify (`@iconify-json/solar`, bundled at build)
- Hero atmosphere: original authored work (GLSL field) — no reference assets were traced or reproduced

## Author

**Vinesh**

Built with ❤️