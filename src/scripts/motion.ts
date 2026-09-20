/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTION SYSTEM
 * - GSAP is the primary animation system; ScrollTrigger handles scroll scenes.
 * - Lenis is the SOLE smooth-scroll engine, driven by the gsap ticker.
 * - Under `prefers-reduced-motion: reduce`: no Lenis, no timelines — final
 *   states render immediately and the page stays fully usable.
 * - Everything created here is torn down in the returned cleanup.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export type Cleanup = () => void;

export function initMotion(): { cleanup: Cleanup; startIntro: (onDone?: () => void) => void } {
  const cleanups: Cleanup[] = [];
  const on = (target: EventTarget, type: string, fn: EventListener) => {
    target.addEventListener(type, fn);
    cleanups.push(() => target.removeEventListener(type, fn));
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Utilities that run regardless of motion preference ─────────────────── */

  const menu = initMenu();
  initCopy();
  cleanups.push(initRail());

  /* Intro state: a layout refresh that lands on top of a running timeline
     shows up as a hitch, so font-driven refreshes are queued to its last frame. */
  let introRunning = false;
  let refreshQueued = false;

  /* Reduced motion: settle into final states, skip every timeline. */
  if (reduce.matches) {
    settle();
    document.querySelector('[data-preloader]')?.remove();
    return { cleanup: () => cleanups.forEach((fn) => fn()), startIntro: () => {} };
  }

  /* ── Lenis: the one smooth-scroll engine ─────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  cleanups.push(() => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  });

  /* Lock smooth scroll while the menu overlay is open. */
  const lockScroll = () => lenis.stop();
  const unlockScroll = () => lenis.start();
  document.addEventListener('menu:open', lockScroll);
  document.addEventListener('menu:close', unlockScroll);
  cleanups.push(() => {
    document.removeEventListener('menu:open', lockScroll);
    document.removeEventListener('menu:close', unlockScroll);
  });

  /* Anchor navigation through Lenis (native behaviour stays for no-JS). */
  const onAnchorClick = (event: MouseEvent) => {
    const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    if (menu.isOpen()) menu.close();
    lenis.scrollTo(target as HTMLElement, { offset: -64 });
  };
  on(document, 'click', onAnchorClick as EventListener);

  /* ── Intro: instrument power-on, fired after the preloader hands off ────────
     All targets start hidden via CSS (html.js, motion-allowed) — these are
     .to() tweens revealing that state, so no flash can ever occur between
     loader removal and intro start. */
  const startIntro = (onDone?: () => void) => {
    introRunning = true;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Set the roll-back start offset before revealing (words are still
    // untransformed, so measurements are exact).
    const words = gsap.utils.toArray<HTMLElement>('[data-intro="h1"] .wi');
    gsap.set(words, {
      x: (_i: number, el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return window.innerWidth / 2 - (r.left + r.width / 2);
      },
    });

    tl.fromTo(
      '[data-nav]',
      { y: -10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5 },
      0,
    )
      .fromTo(
        '[data-intro="eyebrow"]',
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
        0.08,
      )
      .to(
        words,
        {
          x: 0,
          autoAlpha: 1,
          duration: 1.05,
          stagger: 0.06,
          ease: 'power3.out',
        },
        0.16,
      )
      .fromTo(
        '[data-intro="lede"]',
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 },
        0.55,
      )
      .fromTo(
        '[data-intro="cta"]',
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
        0.68,
      )
      .fromTo(
        '[data-signal]',
        { autoAlpha: 0 },
        { autoAlpha: 0.92, duration: 1.6, ease: 'power2.inOut' },
        0.3,
      )
      .fromTo(
        '[data-intro="meta"]',
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
        0.82,
      );

    // Release the promoted layers once the roll-back lands, then hand the
    // stage over (the WebGL boot rides on this callback).
    tl.eventCallback('onComplete', () => {
      document
        .querySelectorAll<HTMLElement>('.hero-h1 .wi')
        .forEach((el) => (el.style.willChange = 'auto'));
      introRunning = false;
      /* A late webfont refresh queued behind the intro lands here — over a
         still hero instead of under a moving one. */
      if (refreshQueued) {
        refreshQueued = false;
        ScrollTrigger.refresh();
      }
      onDone?.();
    });

    return tl;
  };

  buildScrollScenes();

  // Measurements can shift once webfonts finish loading. If they land while the
  // intro is still on screen the refresh is queued for its last frame — a
  // relayout mid-timeline reads as a hitch (fonts are preloaded, so this is
  // only the slow-connection path).
  document.fonts?.ready.then(() => {
    if (introRunning) refreshQueued = true;
    else ScrollTrigger.refresh();
  });

  /* If the user switches to reduced motion mid-session, degrade one-way. */
  const onReduceChange = () => {
    if (!reduce.matches) return;
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.killTweensOf('*');
    settle();
  };
  reduce.addEventListener?.('change', onReduceChange);
  cleanups.push(() => reduce.removeEventListener?.('change', onReduceChange));

  return {
    cleanup: () => cleanups.forEach((fn) => fn()),
    startIntro,
  };
}

/* Render final states instantly (used by the reduced-motion paths). */
function settle(): void {
  document.querySelectorAll<HTMLElement>('[data-xp-line]').forEach((el) => {
    el.style.transform = 'scaleY(1)';
  });
  /* Clear any half-finished intro inline styles; the CSS hidden state no
     longer applies because the media query has flipped to reduce. */
  gsap.set(['.hero-h1 .wi', '[data-nav]', '[data-intro]'], {
    clearProps: 'transform,opacity,visibility',
  });
}

/* ── Scroll choreography (motion-allowed path only) ─────────────────────────── */
function buildScrollScenes(): void {
  // Headings: word-by-word, restrained stagger; the accessible name stays
  // intact (the .sr-only span carries it; only aria-hidden words animate).
  // Reversible — scrolling back up rewinds, scrolling down replays.
  document.querySelectorAll<HTMLElement>('[data-split-head]').forEach((head) => {
    gsap.from(head.querySelectorAll('.wi'), {
      yPercent: 118,
      duration: 0.9,
      stagger: 0.06,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: head,
        start: 'top 86%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Rules draw in
  document.querySelectorAll<HTMLElement>('[data-rule]').forEach((rule) => {
    gsap.from(rule, {
      scaleX: 0,
      duration: 1,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: rule,
        start: 'top 92%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Supporting copy, rows, plates
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 26,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
        onEnter: () => el.classList.add('is-passed'),
      },
    });
  });

  // Experience progress hairline — the single justified scrubbed sequence.
  // Skipped while the Experience section is hidden (no targets in the DOM);
  // it re-arms automatically the moment the section is un-commented.
  if (document.querySelector('.xp-list')) {
    gsap.fromTo(
      '[data-xp-line]',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.xp-list',
          start: 'top 72%',
          end: 'bottom 58%',
          scrub: true,
        },
      },
    );
  }
}

/* ── Mobile menu: accessible disclosure with focus wrap ─────────────────────── */
function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !menu || !closeBtn) return { isOpen: () => false, close: () => {} };

  let open = false;
  let lastFocus: HTMLElement | null = null;

  const focusables = () =>
    Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openMenu = () => {
    open = true;
    lastFocus = document.activeElement as HTMLElement | null;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    document.dispatchEvent(new CustomEvent('menu:open'));
    focusables()[0]?.focus();
    document.addEventListener('keydown', onKey as EventListener);
  };

  const close = () => {
    if (!open) return;
    open = false;
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open');
    document.dispatchEvent(new CustomEvent('menu:close'));
    document.removeEventListener('keydown', onKey as EventListener);
    const el = menu;
    window.setTimeout(() => {
      if (!open) el.hidden = true;
    }, 400);
    (lastFocus ?? btn).focus();
  };

  btn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', close);

  return { isOpen: () => open, close };
}

/* ── Copy email with honest state feedback ──────────────────────────────────── */
function initCopy() {
  const btn = document.querySelector<HTMLButtonElement>('[data-copy]');
  const status = document.querySelector<HTMLElement>('[data-copy-status]');
  if (!btn) return;
  const value = btn.getAttribute('data-copy') || '';

  let timer = 0;
  btn.addEventListener('click', () => {
    const done = () => {
      btn.classList.add('is-copied');
      if (status) status.textContent = 'Email address copied to clipboard';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        btn.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, 2400);
    };

    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } catch {
        if (status) status.textContent = 'Copy failed — select the address manually';
      }
      ta.remove();
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => fallback());
    } else {
      fallback();
    }
  });
}

/* ── Section-progress rail ───────────────────────────────────────────────────── */
type RailTarget = { id: string; el: HTMLElement; link: HTMLAnchorElement };

/**
 * Positional scroll-spy. The active entry is the LAST section whose top has
 * crossed 45% of the viewport — the same line the previous observer band sat
 * on, but measured from live rects every scroll so that regions no entry owns
 * (the hero / `#top`) actively CLEAR the rail. The old IntersectionObserver only
 * ever turned entries on, so a boot-time layout shift or a restored scroll
 * position could leave `Approach` lit while you were still in the hero.
 */
function initRail(): Cleanup {
  const targets: RailTarget[] = [];
  document.querySelectorAll<HTMLAnchorElement>('.rail [data-rail-link]').forEach((link) => {
    const id = (link.getAttribute('data-rail-link') || '').replace(/^#/, '');
    const el = id ? document.getElementById(id) : null;
    if (el) targets.push({ id, el, link });
  });
  if (!targets.length) return () => {};

  let frame = 0;
  let active = '';

  const measure = () => {
    frame = 0;
    const line = window.innerHeight * 0.45;
    let next = '';
    targets.forEach((t) => {
      if (t.el.getBoundingClientRect().top <= line) next = t.id;
    });
    if (next === active) return;
    active = next;
    targets.forEach((t) => t.link.classList.toggle('is-active', t.id === active));
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(measure);
  };

  measure();

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  /* One re-measure after the boot layout settles — fonts land, the WebGL canvas
     mounts and the intro runs, all after the first measurement above. */
  window.addEventListener('load', schedule, { once: true });
  document.fonts?.ready.then(schedule).catch(() => {});

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('load', schedule);
  };
}
