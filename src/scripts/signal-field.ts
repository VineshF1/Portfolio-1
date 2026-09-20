/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SIGNAL FIELD — the hero's authored GLSL topography.
 *
 * One responsibility: a calm contour field that brightens and bends toward
 * the pointer. It is the site's only WebGL surface.
 *
 * Discipline:
 * - DPR capped (1.25 fine / 1.0 coarse) — soft contours hide the difference
 * - Adaptive governor: full display rate, steps to 60 then 30 by measurement,
 *   and drops the extra domain-warp pass when pinned at 30fps
 * - Pointer input is throttled by design (target/lerp, no per-frame allocs)
 * - Three.js is dynamically imported so the initial bundle stays lean
 * - Everything (geometry, material, renderer, observers, listeners, RAF) is
 *   disposed on cleanup; context loss falls back to the static poster grid
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Cleanup = () => void;

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_quality;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = m * p;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * u_res) / min(u_res.x, u_res.y);
  vec2 p = uv * 1.75;
  float t = u_time * 0.055;

  // Domain-warped field, reduced on low-power devices
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = q;
  if (u_quality > 0.5) {
    r = vec2(
      fbm(p + 2.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(p + 2.0 * q + vec2(8.3, 2.8) - 0.12 * t)
    );
  }
  float f = fbm(p + 2.4 * r);

  // Pointer influence: lift the field so contours bend toward the pointer
  float pd = length(uv - u_pointer);
  float lift = exp(-pd * 3.2);
  f += lift * 0.22;

  // Topographic contour lines
  float bands = abs(fract(f * 13.0 + 0.5) - 0.5);
  float line = smoothstep(0.055, 0.0, bands);

  // Instrument palette: warm black base, phosphor contours
  vec3 base = mix(vec3(0.030, 0.030, 0.024), vec3(0.085, 0.085, 0.072), f * 0.9);
  vec3 accent = vec3(0.353, 0.851, 0.902);
  vec3 col = base + line * accent * (0.10 + 0.5 * lift);
  col += accent * lift * 0.045;

  // Vignette + dither (kills banding on large dark fields)
  col *= 1.0 - 0.5 * dot(uv, uv);
  col += (hash(frag + fract(u_time)) - 0.5) * 0.014;

  gl_FragColor = vec4(col, 1.0);
}
`;

type ThreeModule = typeof import('three');

/** Boot-time cache — the chunk is fetched at most once per page. */
let warm: Promise<ThreeModule> | null = null;

/** Motion allowed AND a usable WebGL context: the field's only hard blockers. */
function supported(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // Capability probe on a scratch canvas — never touches the real one
  const probe = document.createElement('canvas');
  return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
}

/**
 * Pull the Three.js chunk in while the boot screen still owns the screen.
 * Module evaluation is the last cost that can be moved off the intro's
 * timeline; the renderer itself (context creation + shader compile) is still
 * built later, once the hero has finished landing. Returns null when the field
 * can never run — reduced motion or no WebGL — so nothing is fetched for a hero
 * that is going to be a poster anyway.
 */
export function warmSignalField(): Promise<ThreeModule> | null {
  if (!supported()) return null;
  warm ??= import('three');
  /* The failure path is handled at boot time (static poster fallback). This
     no-op keeps a failed fetch from surfacing as an unhandled rejection while
     the boot screen is still running — the caller still sees the rejection and
     falls back to the poster grid. */
  warm.catch(() => {});
  return warm;
}

export function initSignalField(
  host: HTMLElement,
  preloaded: Promise<ThreeModule> | null = null,
): Cleanup | null {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas[data-signal]');
  if (!canvas) return null;
  if (!supported()) return null;

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // Fragment cost is (DPR^2) — every extra pixel is 20 noise evals. 1.25 keeps
  // the contours crisp while halving GPU load vs 1.75 on integrated GPUs
  // (a saturated GPU stalls the compositor and drags down ALL page motion).
  const DPR_CAP = coarse ? 1.0 : 1.25;

  // Weak-CPU gate: skip the two extra fbm passes (5 → 3 per pixel)
  const weakCPU = (navigator.hardwareConcurrency ?? 8) <= 4;
  // Full domain warp only on capable hardware (5 FBM passes/px),
  // cheaper field (3/px) on weak CPUs and touch GPUs.
  const quality = !coarse && !weakCPU ? 1 : 0;

  // Reveal the canvas once the first real frame has been rendered — the CSS
  // ships it at opacity 0 so there is never a flash of an unpainted canvas.
  let faded = false;
  const fadeIn = () => {
    if (faded) return;
    faded = true;
    canvas.style.transition = 'opacity 1.2s ease';
    canvas.style.opacity = '1';
  };

  let disposed = false;
  let running = false;
  let rafId = 0;
  let inView = true;
  let visible = !document.hidden;
  let last = 0;

  // Filled by the dynamic import below — always null-checked before use,
  // never with `!` assertions, so strict TS stays quiet and teardown races
  // can never dereference a disposed object.
  let renderer: import('three').WebGLRenderer | null = null;
  let scene: import('three').Scene | null = null;
  let camera: import('three').OrthographicCamera | null = null;
  let geometry: import('three').PlaneGeometry | null = null;
  let material: import('three').ShaderMaterial | null = null;

  // Pointer state — target + lerped value, no per-frame allocation
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let drift = 0;

  // Cached host geometry — refreshed on resize, never per pointer event
  // (a per-event getBoundingClientRect is a forced layout on every mousemove).
  const hostBox = { w: 1, h: 1, docTop: 0, docLeft: 0 };
  const measureHost = () => {
    const r = host.getBoundingClientRect();
    hostBox.w = r.width || 1;
    hostBox.h = r.height || 1;
    hostBox.docTop = r.top + window.scrollY;
    hostBox.docLeft = r.left + window.scrollX;
  };

  const setRunning = (next: boolean) => {
    const want = next && renderer !== null && !disposed;
    if (want === running) return;
    running = want;
    if (running) {
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  // Adaptive render-rate governor — render at the display's full rate
  // (60Hz → 60fps, 120Hz → 120fps), stepping down only if the GPU can't
  // hold it: uncapped → 60 → 30. Measured on rendered-frame deltas.
  let capMs = 0;
  let frameSum = 0;
  let frameCount = 0;

  const loop = (now: number) => {
    if (!renderer || !scene || !camera || !material || disposed) {
      running = false;
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(loop);

    const rawDelta = now - last;
    if (capMs && rawDelta < capMs) return;

    const dt = Math.min(rawDelta / 1000, 0.05);
    last = now;

    if (coarse) {
      // Gentle autonomous drift for touch devices
      drift += dt;
      pointer.tx = Math.sin(drift * 0.35) * 0.4;
      pointer.ty = Math.cos(drift * 0.22) * 0.3;
    }

    material.uniforms['u_time'].value += dt;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    material.uniforms['u_pointer'].value.set(pointer.x, pointer.y);

    renderer.render(scene, camera);
    fadeIn();

    // Governor: sample rendered-frame spacing, step down when missing budget
    frameSum += rawDelta;
    frameCount += 1;
    if (frameCount >= 45) {
      const avg = frameSum / frameCount;
      frameSum = 0;
      frameCount = 0;
      if (avg > 22) {
        if (capMs === 0) capMs = 1000 / 60;
        else if (capMs < 33) capMs = 1000 / 30;
      }
    }
  };

  const resize = () => {
    if (!renderer || !material) return;
    measureHost();
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const dpr = renderer.getPixelRatio();
    material.uniforms['u_res'].value.set(w * dpr, h * dpr);
  };

  const onPointerMove = (event: PointerEvent) => {
    // Cached geometry + scroll offset — zero forced layouts per event
    const left = hostBox.docLeft - window.scrollX;
    const top = hostBox.docTop - window.scrollY;
    if (!hostBox.w || !hostBox.h) return;
    pointer.tx = ((event.clientX - left) / hostBox.w) * 2 - 1;
    pointer.ty = -(((event.clientY - top) / hostBox.h) * 2 - 1);
  };

  const onVisibility = () => {
    visible = !document.hidden;
    setRunning(inView && visible);
  };

  const onIntersection: IntersectionObserverCallback = (entries) => {
    inView = entries[0]?.isIntersecting ?? true;
    setRunning(inView && visible);
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    setRunning(false);
    host.classList.add('is-poster');
  };

  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(onIntersection, { threshold: 0.02 });

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    setRunning(false);
    ro.disconnect();
    io.disconnect();
    host.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    geometry?.dispose();
    material?.dispose();
    // renderer.dispose() releases GL resources; never forceContextLoss here —
    // that would fire webglcontextlost after listeners are already removed.
    renderer?.dispose();
    renderer = null;
    scene = null;
    camera = null;
    geometry = null;
    material = null;
  };

  const bind = () => {
    ro.observe(host);
    io.observe(host);
    if (!coarse) host.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);
    window.addEventListener('pagehide', dispose, { once: true });
  };

  const poster = () => {
    host.classList.add('is-poster');
    dispose();
  };

  (preloaded ?? warm ?? import('three'))
    .then((THREE) => {
      if (disposed) return;
      let created: import('three').WebGLRenderer;
      try {
        created = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        });
      } catch {
        poster();
        return;
      }
      renderer = created;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          u_res: { value: new THREE.Vector2(1, 1) },
          u_time: { value: 0 },
          u_pointer: { value: new THREE.Vector2(0, 0) },
          u_quality: { value: quality },
        },
      });
      geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      resize();
      bind();
      setRunning(true);
    })
    .catch(() => poster());

  return dispose;
}
