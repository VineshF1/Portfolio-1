// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
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

