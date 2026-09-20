/**
 * Boot sequence: preloader → motion intro → WebGL field when eligible.
 * Every subsystem returns a cleanup; pagehide runs all of them.
 */
import { initMotion } from './motion';
import { initSignalField, warmSignalField } from './signal-field';
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

  /* The intro reports completion through a callback, so the WebGL boot can be
     chained to its last frame instead of racing it. */
  let startIntro: (onDone?: () => void) => void = () => {};
  run('motion', () => {
    const motion = initMotion();
    cleanups.push(motion.cleanup);
    startIntro = motion.startIntro;
  });

  const hero = document.querySelector<HTMLElement>('[data-hero]');

  /* Fetch + evaluate the Three.js chunk NOW, while the boot screen is up: the
     module is the one boot cost that can hide behind the preloader. Its
     renderer is still built later (see kick) — context creation and shader
     compilation block the main thread for a few hundred ms, and landing that
     on a running intro is exactly what made the reveal stutter.
     null = the field can never run (reduced motion / no WebGL). */
  const fieldModule = warmSignalField();

  let fieldStarted = false;
  const startField = () => {
    if (fieldStarted || !hero) return;
    fieldStarted = true;
    run('signal-field', () => {
      const cleanup = initSignalField(hero, fieldModule);
      // null = reduced motion or WebGL unavailable → static poster grid
      if (cleanup) cleanups.push(cleanup);
      else hero.classList.add('is-poster');
    });
  };

  /* null = the field can never run (reduced motion / no WebGL): settle the
     poster state now instead of waiting on the intro's callback. */
  if (!fieldModule) startField();

  run('preloader', () => {
    let kicked = false;
    const kick = () => {
      if (kicked) return;
      kicked = true;
      /* The field boot is the intro's completion callback: the renderer is
         created once the hero has landed, when nothing else is animating, so
         no intro frame has to compete with it (see startField above). */
      startIntro(startField);

      /* Safety net — a killed timeline or a reduced-motion switch mid-flight
         must never leave the hero without its field. */
      window.setTimeout(startField, 4000);
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
