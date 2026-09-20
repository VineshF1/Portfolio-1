/**
 * Boot sequence: preloader → motion intro → WebGL field when eligible.
 * Every subsystem returns a cleanup; pagehide runs all of them.
 */
import { initMotion } from './motion';
import { initSignalField } from './signal-field';
import { runPreloader } from './preloader';

function boot(): void {
  const cleanups: Array<() => void> = [];
  const run = (label: string, fn: () => void) => {
    try {
      fn();
    } catch (error) {
      console.error(`[portfolio] ${label} failed`, error);
    }
  };

  let startIntro: () => void = () => {};
  run('motion', () => {
    const motion = initMotion();
    cleanups.push(motion.cleanup);
    startIntro = motion.startIntro;
  });

  const hero = document.querySelector<HTMLElement>('[data-hero]');

  /* The WebGL field boots only after the preloader hands off — importing
     Three.js + compiling shaders on the main thread would stutter the boot
     animation if both raced. */
  const startField = () => {
    if (!hero) return;
    run('signal-field', () => {
      const cleanup = initSignalField(hero);
      // null = reduced motion or WebGL unavailable → static poster grid
      if (cleanup) cleanups.push(cleanup);
      else hero.classList.add('is-poster');
    });
  };

  run('preloader', () => {
    let kicked = false;
    const kick = () => {
      if (kicked) return;
      kicked = true;
      startIntro();

      /* Defer the WebGL boot to the first idle window: the intro's opening
         frames get the whole main thread, Three.js moves in afterwards. */
      const idle = window.requestIdleCallback?.bind(window);
      if (idle) idle(startField, { timeout: 1500 });
      else window.setTimeout(startField, 900);
    };

    try {
      const stop = runPreloader(kick);
      cleanups.push(stop);
      /* Last resort: if the loader never completes, un-hide the page anyway. */
      window.setTimeout(kick, 5000);
    } catch (error) {
      document.querySelector('[data-preloader]')?.remove();
      console.error('[portfolio] preloader failed', error);
      kick();
    }
  });

  window.addEventListener(
    'pagehide',
    () => {
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          /* best effort */
        }
      });
      cleanups.length = 0;
    },
    { once: true },
  );
}

boot();
