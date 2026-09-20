// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  build: {
    // Single-page site: the stylesheet is small (a few kB gzipped), so inline
    // it. That removes a render-blocking round trip before the first paint AND
    // starts the @font-face downloads with the HTML rather than one RTT later —
    // late fonts re-flow the hero while the intro is measuring it.
    inlineStylesheets: 'always',
  },
  // For GitHub Pages project sites, uncomment and set your values, then rebuild.
  // For Vercel / Netlify at a root domain, leave as-is.
  // site: 'https://<user>.github.io',
  // base: '/<repo-name>',
  integrations: [
    icon({
      // Local Iconify collections only — no network at build or runtime
      include: {
        solar: ['*'],
      },
    }),
  ],
});

