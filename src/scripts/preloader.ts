/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PRELOADER — brief branded boot screen before the hero intro.
 * - Word "Vinesh" letters rise in fast, a counter runs 000 → 100 in parallel.
 * - Letters exit, the panel wipes up, and startIntro() fires.
 * - Total runtime ≈ 1s. The WebGL field boots AFTER this hands off so the
 *   Three.js import + shader compile never compete with the boot animation.
 * - Reduced motion: removed instantly. No-JS: hidden by `.no-js .preloader`.
 * - A watchdog guarantees the page unlocks even if a tween throws.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import gsap from 'gsap';

/* Wait for webfonts (max 250ms) so the intro measures with final metrics. */
function whenFontsSettled(fn: () => void): void {
  let ran = false;
  const go = () => {
    if (ran) return;
    ran = true;
    fn();
  };
  document.fonts?.ready.then(go).catch(go);
  window.setTimeout(go, 160);
}

export function runPreloader(onDone: () => void): () => void {
  const root = document.querySelector<HTMLElement>('[data-preloader]');
  if (!root) {
    onDone();
    return () => {};
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    root.remove();
    onDone();
    return () => {};
  }

  const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-preloader-name] span'));
  const count = root.querySelector<HTMLElement>('[data-preloader-count]');
  const counter = { v: 0 };
  let shown = -1;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    root.remove();
    whenFontsSettled(onDone);
  };

  /* Safety net: never trap the visitor behind a broken boot screen. */
  const watchdog = window.setTimeout(finish, 3500);

  const tl = gsap.timeline({ onComplete: () => { window.clearTimeout(watchdog); finish(); } });

  tl.set(root, { autoAlpha: 1 })
    .from(
      letters,
      { yPercent: 130, duration: 0.5, stagger: 0.035, ease: 'power3.out' },
      0.05,
    )
    .to(
      counter,
      {
        v: 100,
        duration: 0.72,
        ease: 'power1.inOut',
        onUpdate: () => {
          const n = Math.round(counter.v);
          if (count && n !== shown) {
            shown = n;
            count.textContent = String(n).padStart(3, '0');
          }
        },
      },
      0.05,
    )
    .to(letters, { yPercent: -130, duration: 0.38, stagger: 0.03, ease: 'power2.in' }, '+=0.08')
    .to(count, { autoAlpha: 0, duration: 0.2 }, '<')
    .to(root, { yPercent: -100, duration: 0.55, ease: 'power3.inOut' }, '-=0.1');

  return () => {
    window.clearTimeout(watchdog);
    tl.kill();
    finish();
  };
}
