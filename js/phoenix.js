/* Intro and scroll sequence: no CDN dependencies. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'mb-phoenix-intro';
  let dismissIntro = () => {};
  let seen = false;
  try { seen = sessionStorage.getItem(key) === '1'; } catch { /* Storage is optional. */ }
  if (!motion.matches && !seen) {
    const overlay = document.createElement('div');
    overlay.className = 'phoenix-intro';
    overlay.setAttribute('data-lenis-prevent', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'MB AI SOLUTIONS');
    overlay.innerHTML = `
      <div class="intro-universe" aria-hidden="true">
        <i class="intro-aurora intro-aurora--a"></i><i class="intro-aurora intro-aurora--b"></i>
        <div class="intro-grid"></div><div class="intro-orbit"></div><div class="intro-orbit intro-orbit--second"></div>
        <svg class="intro-streams" viewBox="0 0 1600 900" preserveAspectRatio="none">
          <path d="M-100 720C300 800 140 80 800 450S1300 150 1700 100"/>
          <path d="M-100 180C380 0 200 780 800 450S1300 850 1700 660"/>
          <path d="M-100 740C300 820 160 100 800 470S1300 170 1700 120"/>
        </svg>
        <div class="intro-stars">${Array.from({ length: 22 }, (_, i) => `<i style="--x:${(i * 37 + 7) % 100}%;--y:${(i * 23 + 13) % 100}%;--delay:${-i * .7}s;--hue:${i % 3 === 0 ? 35 : i % 3 === 1 ? 172 : 280}"></i>`).join('')}</div>
      </div>
      <aside class="intro-panel intro-panel--left" aria-hidden="true">
        <img class="intro-emblem" src="assets/logo-fenix-fullcolor-transparente.png" alt="" width="1254" height="1254">
        <span class="intro-kicker">MB AI SOLUTIONS</span>
        <div class="intro-module">
          <svg viewBox="0 0 120 100"><path d="M60 18V8M52 8h16"/><rect x="22" y="22" width="76" height="56" rx="20"/><circle class="intro-eye" cx="44" cy="46" r="5"/><circle class="intro-eye" cx="76" cy="46" r="5"/><path d="M44 62h32M12 40v20m96-20v20M42 88h36"/></svg>
          <span>Agentes IA</span><small>Conversaciones que conectan</small>
          <div class="intro-signal"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </aside>
      <div class="intro-cinema"><video autoplay muted playsinline preload="none" aria-hidden="true"></video></div>
      <aside class="intro-panel intro-panel--right" aria-hidden="true">
        <div class="intro-module intro-module--flow">
          <svg viewBox="0 0 120 100"><path class="intro-flow" d="M32 24h56v52H32V24M60 24v52"/><rect x="18" y="10" width="28" height="28" rx="8"/><rect x="74" y="10" width="28" height="28" rx="8"/><rect x="46" y="62" width="28" height="28" rx="8"/><circle cx="88" cy="76" r="8"/></svg>
          <span>Automatizaciones</span><small>Procesos conectados, 24/7</small>
        </div>
        <div class="intro-module intro-module--data">
          <svg viewBox="0 0 120 100"><path d="M18 16v68h88M30 62l22-18 20 10 30-32"/><path class="intro-flow" d="M30 74V62m22 12V44m20 30V54m30 20V22"/><circle cx="52" cy="44" r="4"/><circle cx="102" cy="22" r="4"/></svg>
          <span>Negocios inteligentes</span><small>Datos que se vuelven decisiones</small>
        </div>
      </aside>
      <div class="intro-caption" aria-hidden="true"><span>EL SIGUIENTE CAPÍTULO DE TU NEGOCIO</span><strong>Una nueva realidad empieza aquí.</strong></div>
      <button class="btn btn--primary phoenix-intro__skip" type="button">Entrar →</button>`;
    const video = overlay.querySelector('video');
    const button = overlay.querySelector('button');
    const previousFocus = document.activeElement;
    const siblings = [...document.body.children].filter(el => !['SCRIPT', 'STYLE'].includes(el.tagName));
    const inertBefore = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    document.body.append(overlay);
    document.documentElement.classList.add('intro-playing');
    button.focus({ preventScroll: true });
    let closed = false;
    let removal;
    const remove = () => {
      clearTimeout(removal);
      overlay.remove();
      video.removeAttribute('src');
      video.load();
    };
    const onKey = e => {
      if (e.key === 'Escape') dismissIntro();
      if (e.key === 'Tab') { e.preventDefault(); button.focus(); }
    };
    dismissIntro = () => {
      if (closed) return;
      closed = true;
      clearTimeout(deadline);
      video.pause();
      overlay.classList.add('is-closing');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.inert = true;
      siblings.forEach((el, i) => { el.inert = inertBefore[i]; });
      document.documentElement.classList.remove('intro-playing');
      document.removeEventListener('keydown', onKey);
      if (previousFocus && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
      else document.querySelector('.brand')?.focus({ preventScroll: true });
      try { sessionStorage.setItem(key, '1'); } catch { /* Continue without storage. */ }
      overlay.addEventListener('transitionend', remove, { once: true });
      removal = setTimeout(remove, motion.matches ? 0 : 800);
    };
    // Begin fading at 11.2 s; removal is guaranteed by 12 s.
    const deadline = setTimeout(dismissIntro, 11200);
    document.addEventListener('keydown', onKey);
    button.addEventListener('click', dismissIntro);
    video.addEventListener('ended', dismissIntro, { once: true });
    video.addEventListener('error', dismissIntro, { once: true });
    video.muted = true;
    // Give the underlying page a paint before requesting the video.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (closed) return;
      video.src = 'assets/intro-fenix-web.mp4';
      video.play()?.catch(dismissIntro);
    }));
  }

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
