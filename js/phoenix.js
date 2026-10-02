/* Scroll-driven phoenix sequence; the interactive entry lives in entry.js. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const dismissIntro = () => window.MB_DISMISS_ENTRY?.();

  const section = document.getElementById('inicio');
  const canvas = document.getElementById('phoenix-canvas');
  const ctx = canvas?.getContext('2d');
  if (!section || !ctx) return;
  const captions = [...section.querySelectorAll('[data-scene]')];
  const frames = new Map();
  const pending = new Set();
  const failed = new Set();
  let target = motion.matches ? 79 : 0;
  let drawn = -1;
  let raf = 0;
  let width = 0;
  let height = 0;
  let activeScene = -1;
  let started = false;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  const path = i => `assets/frames-hd/frame${String(i + 1).padStart(3, '0')}.webp`;
  function pump() {
    // Load a small window around the scroll position; bound decoded HD memory.
    const order = motion.matches ? [79] : [target, ...Array.from({ length: 80 }, (_, i) => i).filter(i => Math.abs(i - target) <= 5)
      .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))];
    for (const i of order) {
      if (pending.size >= 3) break;
      if (frames.has(i) || pending.has(i) || failed.has(i)) continue;
      pending.add(i);
      const img = new Image();
      img.decoding = 'async';
      img.onload = async () => {
        try { await img.decode(); } catch { /* onload already succeeded. */ }
        frames.set(i, img);
        if (frames.size > 18) {
          const farthest = [...frames.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
          frames.delete(farthest);
        }
        pending.delete(i);
        schedule();
        setTimeout(pump, 40);
      };
      img.onerror = () => { pending.delete(i); failed.add(i); setTimeout(pump, 40); };
      img.src = path(i);
    }
  }
  function render() {
    raf = 0;
    const rect = section.getBoundingClientRect();
    const stage = canvas.getBoundingClientRect();
    const progress = motion.matches ? 1 : Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - stage.height)));
    const next = Math.round(progress * 79);
    if (next !== target) { target = next; pump(); }
    const scene = progress < .32 ? 0 : progress < .65 ? 1 : 2;
    if (scene !== activeScene) {
      activeScene = scene;
      captions.forEach((el, i) => {
        el.classList.toggle('is-active', i === scene);
        el.setAttribute('aria-hidden', String(i !== scene));
        el.inert = i !== scene;
      });
    }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(stage.width * dpr), h = Math.round(stage.height * dpr);
    if (width !== w || height !== h) {
      width = canvas.width = w;
      height = canvas.height = h;
      drawn = -1;
    }
    let index = target;
    if (!frames.has(index)) {
      index = motion.matches ? -1 : [...frames.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
    }
    const img = frames.get(index);
    if (img && index !== drawn && width && height) {
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
      drawn = index;
    }
    if (!started) { started = true; pump(); }
  }
  function configure() {
    section.classList.toggle('is-sequenced', !motion.matches);
    window.removeEventListener('scroll', schedule);
    if (!motion.matches) window.addEventListener('scroll', schedule, { passive: true });
    else dismissIntro();
    drawn = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    schedule();
  }
  motion.addEventListener('change', configure);
  window.addEventListener('resize', schedule, { passive: true });
  configure();
})();
