/* ==========================================================================
   MB AI SOLUTIONS — main.js
   Stack: GSAP 3.13 (ScrollTrigger, MotionPathPlugin) + Lenis + tsParticles
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  root.setAttribute('data-boot', '');
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motionOK = root.classList.contains('motion-ok') && hasGsap;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = () => window.innerWidth < 768;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  let closeNav = () => {};

  // Sin GSAP (CDN caído) o con reduced-motion: todo visible y estático
  if (!hasGsap) {
    root.classList.remove('motion-ok');
    root.classList.add('is-ready');
    initNav(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  /* ------------------------------------------------------------------------
     1. Smooth scroll — Lenis sincronizado con el ticker de GSAP
     ------------------------------------------------------------------------ */
  let lenis = null;
  if (motionOK && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // bloqueado mientras corre el preloader
  }

  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -$('#header').offsetHeight + 1, duration: 1.4 });
    else target.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
  };

  // Anclas internas
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      scrollToTarget(target);
      history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------------------------
     2. Navegación (menú móvil accesible)
     ------------------------------------------------------------------------ */
  function initNav(lenisRef) {
    const toggle = $('#nav-toggle');
    const nav = $('#nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      nav.classList.toggle('is-open', open);
      if (lenisRef) open ? lenisRef.stop() : lenisRef.start();
      if (open) $('.nav__link', nav)?.focus();
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    closeNav = () => { if (nav.classList.contains('is-open')) setOpen(false); };
  }
  initNav(lenis);

  // Header con fondo al hacer scroll
  // (sin 'end': con end 'max' la clase se quitaba al tocar el final de la página)
  const header = $('#header');
  ScrollTrigger.create({
    start: 'top -40',
    onEnter: () => header.classList.add('is-scrolled'),
    onLeaveBack: () => header.classList.remove('is-scrolled'),
  });

  /* ------------------------------------------------------------------------
     3. Split de títulos por palabras (accesible: aria-label en el título)
     ------------------------------------------------------------------------ */
  function splitWords(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const wrap = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'word';
          w.setAttribute('aria-hidden', 'true');
          w.innerHTML = `<span class="word__inner">${part}</span>`;
          frag.appendChild(w);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        [...node.childNodes].forEach(wrap);
      }
    };
    [...el.childNodes].forEach(wrap);
    return $$('.word__inner', el);
  }

  /* ------------------------------------------------------------------------
     4. Preloader — progreso real (fuentes + imágenes críticas)
     ------------------------------------------------------------------------ */
  function runPreloader() {
    const fill = $('#preloader-fill');
    const pre = $('#preloader');
    const tasks = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      ...['.preloader__logo', '.colibri__img'].map((s) => {
        const img = $(s);
        return img && !img.complete ? img.decode().catch(() => {}) : Promise.resolve();
      }),
    ];
    let done = 0;
    const progress = { v: 0 };
    const bump = () => {
      done++;
      gsap.to(progress, {
        v: done / tasks.length, duration: 0.4, ease: 'power2.out',
        onUpdate: () => gsap.set(fill, { scaleX: progress.v }),
      });
    };
    tasks.forEach((p) => p.then(bump));

    const minTime = new Promise((r) => setTimeout(r, motionOK ? 700 : 0));
    const maxTime = new Promise((r) => setTimeout(r, 2500));
    const ready = Promise.race([Promise.all([...tasks, minTime]), maxTime]);

    return ready.then(() => new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => { root.classList.add('is-ready'); resolve(); },
      });
      tl.to(fill, { scaleX: 1, duration: 0.3, ease: 'power2.out' })
        .to('.preloader__inner', { opacity: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, '+=0.1')
        .to(pre, { yPercent: -100, duration: motionOK ? 0.8 : 0.01, ease: 'expo.inOut' }, '-=0.1');
    }));
  }

  /* ------------------------------------------------------------------------
     5. Hero — intro, parallax y streams
     ------------------------------------------------------------------------ */
  // Todos los títulos [data-split] se dividen; el del hero se anima en la intro
  const splits = motionOK ? $$('[data-split]').map((el) => ({ el, words: splitWords(el) })) : [];
  const heroWords = splits.length ? splits[0].words : [];

  function heroIntro() {
    if (!motionOK) return;
    gsap.set(heroWords, { yPercent: 110 });
    gsap.set('.stream', { opacity: 0, x: -60 });

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.9, startAt: { y: 16 } })
      .to(heroWords, {
        yPercent: 0, duration: 1.1, stagger: 0.06,
        onComplete: () => $('[data-split]').classList.add('is-revealed'), // libera el glow del recorte
      }, '-=0.6')
      .to('.hero__sub', { opacity: 1, y: 0, duration: 1, startAt: { y: 20 } }, '-=0.75')
      .to('.hero__ctas', { opacity: 1, y: 0, duration: 1, startAt: { y: 20 } }, '-=0.8')
      .to('.stream', { opacity: 1, x: 0, duration: 2.2, stagger: 0.15, ease: 'power3.out' }, 0.2)
      .to('.colibri', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.5)
      .fromTo('.colibri__img', { x: 120, y: -40, rotation: -12, scale: 0.8 },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, 0.5);

    // Deriva continua y sutil de las estelas de luz
    gsap.to('.stream', {
      x: 40, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 1.3 },
    });
  }

  function heroParallax() {
    if (!motionOK) return;
    $$('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.parallax),
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    gsap.to('[data-parallax-content]', {
      y: () => (isMobile() ? 40 : 90),
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  }

  /* ------------------------------------------------------------------------
     6. Partículas de luz en canvas (estela del colibrí y del cursor)
        Ligero: un sprite pre-renderizado + composición aditiva.
     ------------------------------------------------------------------------ */
  function makeSprite(inner, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.25, outer);
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    return c;
  }

  function createFx(canvas, { max = 200, anchorToPage = false } = {}) {
    const ctx = canvas.getContext('2d');
    const sprites = [
      makeSprite('rgba(255,255,255,1)', 'rgba(0,229,255,0.85)'),
      makeSprite('rgba(210,255,255,1)', 'rgba(0,131,143,0.8)'),
      makeSprite('rgba(255,255,255,1)', 'rgba(224,224,224,0.6)'),
    ];
    const parts = [];
    let dpr = 1;
    let lastScroll = window.scrollY;
    let dirty = false;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const emit = (x, y, n, o = {}) => {
      for (let i = 0; i < n; i++) {
        if (parts.length >= max) parts.shift();
        const a = Math.random() * Math.PI * 2;
        const sp = (o.speed ?? 30) * (0.3 + Math.random());
        parts.push({
          x: x + (Math.random() - 0.5) * (o.jitter ?? 6),
          y: y + (Math.random() - 0.5) * (o.jitter ?? 6),
          vx: Math.cos(a) * sp + (o.vx ?? 0),
          vy: Math.sin(a) * sp + (o.vy ?? 0),
          life: 0,
          ttl: (o.life ?? 0.9) * (0.6 + Math.random() * 0.8),
          size: (o.size ?? 3) * (0.5 + Math.random()),
          sprite: sprites[Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2],
          drag: o.drag ?? 0.94,
          lift: o.lift ?? -8,
        });
      }
    };

    const step = (dt) => {
      const sy = window.scrollY;
      const dScroll = sy - lastScroll;
      lastScroll = sy;
      if (!parts.length) {
        if (dirty) { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; }
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.ttl) { parts.splice(i, 1); continue; }
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.lift * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt - (anchorToPage ? dScroll : 0);
        const k = 1 - p.life / p.ttl;
        const s = p.size * (0.4 + k * 0.9) * 4;
        ctx.globalAlpha = k * k;
        ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      dirty = true;
    };

    return { emit, step };
  }

  /* ------------------------------------------------------------------------
     7. Colibrí — vuelo por toda la página (MotionPath + ScrollTrigger scrub)
        Despega del hero, zigzaguea entre secciones dejando estela de luz,
        mira hacia donde vuela, se inclina en las curvas y aterriza en el CTA.
     ------------------------------------------------------------------------ */
  function colibriFlight() {
    if (!motionOK) return;
    const bird = $('#colibri');
    const flip = $('.colibri__flip');
    const img = $('.colibri__img');
    const startPerch = $('#colibri-perch');
    const endPerch = $('#colibri-end');
    const cta = $('.cta');
    const trailCanvas = $('#fx-trail');
    if (!bird || !startPerch || !endPerch || !cta) return;

    const ASPECT = 707 / 900;
    const fx = trailCanvas ? createFx(trailCanvas, { max: isMobile() ? 70 : 220, anchorToPage: true }) : null;

    // Recorrido: fracciones del área libre del viewport (x, y)
    const WAYPOINTS = {
      desktop: [[0.92, 0.62], [0.06, 0.28], [0.95, 0.18], [0.04, 0.66], [0.9, 0.72], [0.12, 0.22], [0.78, 0.5]],
      mobile: [[1, 0.5], [0.55, 0.2], [1, 0.7], [0.6, 0.35]],
    };

    const state = { raw: null, baseW: 0, sMid: 0.5, sEnd: 1, endScroll: 1 };
    const prog = { p: 0 };

    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = isMobile();
      const sy = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - vh;
      const header = $('#header').offsetHeight;

      const sr = startPerch.getBoundingClientRect();
      state.baseW = sr.width;
      bird.style.width = `${sr.width}px`;
      const bh = sr.width * ASPECT;
      state.sMid = Math.min(1, (mobile ? 96 : 180) / sr.width);

      const cr = cta.getBoundingClientRect();
      state.endScroll = Math.max(vh * 0.5, Math.min(maxScroll, cr.top + sy + cr.height / 2 - vh / 2));
      const er = endPerch.getBoundingClientRect();
      state.sEnd = er.width / sr.width;

      const bw = sr.width * state.sMid;
      const bhm = bh * state.sMid;
      const minX = 12;
      const maxX = vw - bw - 12;
      const minY = header + 8;
      const maxY = vh - bhm - 24;
      Object.assign(state, { minX, maxX, minY, maxY });

      const pts = [{ x: sr.left, y: sr.top + sy }];
      (mobile ? WAYPOINTS.mobile : WAYPOINTS.desktop).forEach(([fxp, fyp]) => {
        pts.push({ x: minX + fxp * (maxX - minX), y: minY + fyp * (maxY - minY) });
      });
      pts.push({ x: er.left, y: er.top + sy - state.endScroll });

      state.raw = MotionPathPlugin.arrayToRawPath(pts, { curviness: 1.1 });
      MotionPathPlugin.cacheRawPathMeasurements(state.raw);
    };
    compute();
    ScrollTrigger.addEventListener('refreshInit', compute);

    gsap.to(prog, {
      p: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: () => state.endScroll, scrub: 1.2, invalidateOnRefresh: true },
    });

    // Vuelo estacionario del <img>: flotación, balanceo y aleteo
    gsap.to(img, { y: '-=12', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.1 });
    gsap.to(img, { rotation: 3, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.1 });
    const flap = gsap.to(img, { scaleY: 0.96, duration: 0.09, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    const tiltTo = gsap.quickTo(flip, 'rotation', { duration: 0.5, ease: 'power3.out' });
    gsap.set(bird, { transformOrigin: '0 0' });
    const setX = gsap.quickSetter(bird, 'x', 'px');
    const setY = gsap.quickSetter(bird, 'y', 'px');
    const setSX = gsap.quickSetter(bird, 'scaleX');
    const setSY = gsap.quickSetter(bird, 'scaleY');
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = gsap.parseEase('power2.inOut');
    let lastX = null;
    let lastY = null;
    let vx = 0;
    let vy = 0;
    let facing = 1;

    gsap.ticker.add((time, deltaMs) => {
      const dt = Math.min(deltaMs / 1000, 0.05);
      const p = prog.p;
      const pos = MotionPathPlugin.getPositionOnPath(state.raw, gsap.utils.clamp(0, 1, p), false);
      const landedOffset = Math.max(0, window.scrollY - state.endScroll);
      let x = pos.x;
      let y = pos.y - landedOffset;
      // En pleno vuelo, nunca salir de pantalla ni meterse bajo el header
      if (p > 0.12 && p < 0.88) {
        x = gsap.utils.clamp(state.minX, state.maxX, x);
        y = gsap.utils.clamp(state.minY, state.maxY, y);
      }
      const s = p < 0.1 ? lerp(1, state.sMid, ease(p / 0.1))
        : p > 0.9 ? lerp(state.sMid, state.sEnd, ease((p - 0.9) / 0.1))
        : state.sMid;

      setX(x);
      setY(y);
      setSX(s);
      setSY(s);

      // Velocidad sobre la ruta (el scroll tras aterrizar no cuenta como vuelo)
      if (lastX !== null) {
        vx = vx * 0.82 + (pos.x - lastX) * 0.18;
        vy = vy * 0.82 + (pos.y - lastY) * 0.18;
      }
      lastX = pos.x;
      lastY = pos.y;

      // Mira hacia donde vuela (y posado en hero o CTA, siempre mira a la derecha)
      const speedNow = Math.hypot(vx, vy);
      if ((p < 0.02 || p > 0.98) && speedNow < 0.3 && facing === -1) { vx = 1; }
      if (vx < -0.8 && facing === 1) { facing = -1; gsap.to(flip, { scaleX: -1, duration: 0.35, ease: 'power2.out' }); }
      else if (vx > 0.8 && facing === -1) { facing = 1; gsap.to(flip, { scaleX: 1, duration: 0.35, ease: 'power2.out' }); }

      // Inclinación en las curvas y aleteo según velocidad
      tiltTo(gsap.utils.clamp(-28, 28, vy * 2.4 * facing));
      const speed = Math.hypot(vx, vy);
      flap.timeScale(1 + Math.min(speed * 0.25, 2.5));

      // Estela de luz desde la cola
      if (fx) {
        const w = state.baseW * s;
        const h = w * ASPECT;
        const tx = x + (facing === 1 ? 0.12 : 0.88) * w;
        const ty = y + 0.78 * h;
        const n = Math.min(isMobile() ? 2 : 5, Math.floor(speed * 0.35)) + (Math.random() < 0.25 ? 1 : 0);
        if (n > 0 && bird.style.opacity !== '0') {
          fx.emit(tx, ty, n, { speed: 18, vx: -vx * 8, vy: -vy * 8, life: 1.1, size: 2.6, lift: -6, jitter: 10 });
        }
        fx.step(dt);
      }
    });
  }

  /* ------------------------------------------------------------------------
     8. Cursor de luz — punto, anillo con inercia, halo y polvo de estrellas
     ------------------------------------------------------------------------ */
  function cursorFx() {
    if (!motionOK || !finePointer) return;
    root.classList.add('custom-cursor');
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    const halo = $('#cursor-halo');
    const fx = createFx($('#fx-cursor'), { max: 140 });

    const dotX = gsap.quickSetter(dot, 'x', 'px');
    const dotY = gsap.quickSetter(dot, 'y', 'px');
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
    const haloX = gsap.quickTo(halo, 'x', { duration: 0.8, ease: 'power3.out' });
    const haloY = gsap.quickTo(halo, 'y', { duration: 0.8, ease: 'power3.out' });

    let shown = false;
    let px = null;
    let py = null;
    const show = (on) => {
      shown = on;
      gsap.to([dot, ring, halo], { opacity: on ? 1 : 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) show(true);
      const { clientX: x, clientY: y } = e;
      dotX(x); dotY(y);
      ringX(x); ringY(y);
      haloX(x); haloY(y);
      if (px !== null) {
        const dist = Math.hypot(x - px, y - py);
        const n = Math.min(4, Math.floor(dist / 14));
        if (n) fx.emit(x, y, n, { speed: 14, vx: (px - x) * 2, vy: (py - y) * 2, life: 0.7, size: 1.8, lift: 10, jitter: 4 });
      }
      px = x;
      py = y;
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => { show(false); px = null; });

    // Se expande sobre elementos interactivos
    const hoverSel = 'a, button, [data-card], .reason';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(hoverSel)) {
        ring.classList.add('is-hover');
        gsap.to(ring, { scale: 1.9, duration: 0.4, ease: 'power3.out' });
        gsap.to(dot, { scale: 0.5, duration: 0.3 });
      }
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(hoverSel) && !e.relatedTarget?.closest?.(hoverSel)) {
        ring.classList.remove('is-hover');
        gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power3.out' });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    });

    // Clic: pulso + explosión de chispas
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      gsap.fromTo(ring, { scale: 0.7 }, { scale: ring.classList.contains('is-hover') ? 1.9 : 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      fx.emit(e.clientX, e.clientY, 18, { speed: 160, life: 0.8, size: 2.4, drag: 0.9, lift: 30, jitter: 2 });
    });

    gsap.ticker.add((t, deltaMs) => fx.step(Math.min(deltaMs / 1000, 0.05)));
  }

  /* ------------------------------------------------------------------------
     9. Botones magnéticos (solo puntero fino)
     ------------------------------------------------------------------------ */
  function magnetic() {
    if (!motionOK || !finePointer) return;
    $$('.magnetic').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.38);
      });
      btn.addEventListener('pointerleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ------------------------------------------------------------------------
     10. Divisores de luz
     ------------------------------------------------------------------------ */
  function dividers() {
    if (!motionOK) return;
    $$('.light-divider').forEach((d) => {
      gsap.from(d, {
        scaleX: 0, opacity: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: d, start: 'top 90%', once: true },
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. Reveals por sección: títulos por palabras, bloques y tarjetas
     ------------------------------------------------------------------------ */
  function sectionReveals() {
    if (!motionOK) return;

    splits.slice(1).forEach(({ el, words }) => {
      gsap.set(words, { yPercent: 110 });
      gsap.to(words, {
        yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onComplete: () => el.classList.add('is-revealed'),
      });
    });

    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
      }),
    });

    ScrollTrigger.batch('[data-reason]', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => {
        gsap.fromTo(els, { opacity: 0, x: 40 }, {
          opacity: 1, x: 0, duration: 1, ease: 'expo.out', stagger: 0.12,
        });
        gsap.fromTo(els.map((el) => $('.reason__icon', el)), { scale: 0, rotation: -90 }, {
          scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(2)', stagger: 0.12, delay: 0.1,
        });
      },
    });
  }

  /* ------------------------------------------------------------------------
     Tarjetas de servicios — identidad colibrí
     Caída con estela → aterrizaje con chispas y barrido de luz →
     borde de luz girando + escena animada en bucle (solo en pantalla)
     ------------------------------------------------------------------------ */
  const rand = gsap.utils.random;

  function buildCardFx(card) {
    const sparks = document.createElement('span');
    sparks.className = 'card__sparks';
    sparks.setAttribute('aria-hidden', 'true');
    const burstN = isMobile() ? 10 : 16;
    const moteN = isMobile() ? 3 : 6;
    for (let i = 0; i < burstN; i++) sparks.insertAdjacentHTML('beforeend', '<i class="spark"></i>');
    for (let i = 0; i < moteN; i++) sparks.insertAdjacentHTML('beforeend', '<i class="spark spark--mote"></i>');
    const trail = document.createElement('span');
    trail.className = 'card__trail';
    trail.setAttribute('aria-hidden', 'true');
    card.append(sparks, trail);
  }

  function burst(card) {
    $$('.spark:not(.spark--mote)', card).forEach((s) => {
      gsap.fromTo(s, { x: 0, y: 0, opacity: 1, scale: rand(0.6, 1.4) }, {
        x: rand(-170, 170),
        y: rand(-80, 60),
        opacity: 0,
        scale: 0,
        duration: rand(0.7, 1.4),
        ease: 'power3.out',
      });
    });
  }

  function motes(card) {
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    return $$('.spark--mote', card).map((m) => gsap.fromTo(m,
      { x: () => rand(-w / 2 + 20, w / 2 - 20), y: () => rand(h * 0.6, h), opacity: 0 },
      {
        y: () => `-=${rand(80, 160)}`,
        keyframes: { opacity: [0, 0.9, 0] },
        duration: rand(3, 5),
        ease: 'sine.inOut',
        repeat: -1,
        repeatRefresh: true,
        delay: rand(0, 3),
      }));
  }

  // Escenas SVG en bucle (solo transform/opacity)
  const scenes = {
    chat(svg) {
      const [b1, b2, b3] = ['.s-b1', '.s-b2', '.s-b3'].map((s) => $(s, svg));
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tl.set([b1, b2, b3], { opacity: 0 })
        .fromTo(b1, { opacity: 0, y: 10, scale: 0.9, transformOrigin: '0% 100%' }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' })
        .fromTo(b3, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 }, '+=0.2')
        .to($$('.s-dot', svg), { y: -4, duration: 0.22, stagger: 0.1, yoyo: true, repeat: 5, ease: 'sine.inOut' })
        .to(b3, { opacity: 0, duration: 0.25 })
        .fromTo(b2, { opacity: 0, y: 10, scale: 0.9, transformOrigin: '100% 100%' }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.05')
        .to([b1, b2], { opacity: 0, duration: 0.4 }, '+=1.8');
      const hand = gsap.to($('.s-clock .s-stroke', svg), { rotation: 360, svgOrigin: '262 110', duration: 4, ease: 'none', repeat: -1 });
      return [tl, hand];
    },
    gears(svg) {
      const a = gsap.to($('.s-gear--a', svg), { rotation: 360, svgOrigin: '70 76', duration: 6, ease: 'none', repeat: -1 });
      const b = gsap.to($('.s-gear--b', svg), { rotation: -360, svgOrigin: '118 42', duration: 3.6, ease: 'none', repeat: -1 });
      const checks = $$('.s-check', svg);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
      tl.set(checks, { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
      checks.forEach((c) => tl.to(c, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, '+=0.55'));
      tl.to(checks, { opacity: 0, duration: 0.4 }, '+=1.2');
      return [a, b, tl];
    },
    network(svg) {
      const pulses = $$('.s-pulse', svg).map((p, i) => gsap.to(p, {
        motionPath: { path: $(`#net-p${i + 1}`, svg) },
        duration: 1.6, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.4, delay: i * 0.45,
      }));
      const core = gsap.to($('.s-core-glow', svg), { scale: 1.5, opacity: 0, svgOrigin: '150 70', duration: 1.2, ease: 'power2.out', repeat: -1 });
      const nodes = gsap.to($$('.s-node .s-ring', svg), { opacity: 0.4, duration: 0.8, stagger: 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return [...pulses, core, nodes];
    },
    search(svg) {
      const typed = $('.s-typed', svg);
      const caret = $('.s-caret', svg);
      const rows = $$('.s-row', svg);
      const blink = gsap.to(caret, { opacity: 0, duration: 0.4, repeat: -1, yoyo: true, ease: 'steps(1)' });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      tl.set(rows, { opacity: 0, x: -12 })
        .fromTo(typed, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.2, ease: 'steps(14)' })
        .fromTo(caret, { x: -152 }, { x: 0, duration: 1.2, ease: 'steps(14)' }, '<')
        .to(rows, { opacity: 1, x: 0, duration: 0.45, stagger: 0.18, ease: 'power3.out' }, '+=0.2')
        .fromTo($$('.s-spark', svg), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: 180, duration: 0.8, stagger: 0.18 }, '<')
        .to([...rows, typed], { opacity: 0, duration: 0.4 }, '+=1.6')
        .set(typed, { opacity: 1, scaleX: 0 });
      return [blink, tl];
    },
    layers(svg) {
      const layers = $$('.s-layer', svg);
      const float = gsap.to(layers, { y: (i) => -3 - i * 5, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.18 });
      const chip = gsap.to($('.s-float', svg), { y: -6, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      const glow = gsap.to($('.s-layer--top', svg), { opacity: 0.65, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return [float, chip, glow];
    },
    scan(svg) {
      const lens = $('.s-lens', svg);
      gsap.set(lens, { x: 53, y: 58 });
      const move = gsap.to(lens, { x: 229, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      const bars = gsap.to($$('.s-bar:not(.s-bar--hot)', svg), {
        scaleY: () => rand(0.55, 1.1), transformOrigin: '50% 100%',
        duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true, stagger: 0.15,
      });
      const hot = gsap.to($('.s-bar--hot', svg), { opacity: 0.6, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return [move, bars, hot];
    },
  };

  function buildScene(card) {
    const master = gsap.timeline({ paused: true });
    const svg = $('.scene', card);
    const make = svg && scenes[svg.dataset.scene];
    if (make) make(svg).forEach((a) => master.add(a, 0));
    motes(card).forEach((a) => master.add(a, 0));
    const bird = $('.card__bird', card);
    if (bird) {
      master.add(gsap.to(bird, { y: -8, rotation: -4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }), 0);
      master.add(gsap.to(bird, { scaleY: 0.96, duration: 0.09, yoyo: true, repeat: -1, ease: 'sine.inOut' }), 0);
    }
    return master;
  }

  function serviceCards() {
    if (!motionOK) return;
    const cards = $$('[data-card]');

    cards.forEach((card) => {
      buildCardFx(card);
      const scene = buildScene(card);
      card._scene = scene;
      // Solo anima lo que está en pantalla
      ScrollTrigger.create({
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (!card._landed) return;
          card.classList.toggle('is-live', self.isActive);
          self.isActive ? scene.play() : scene.pause();
        },
      });
    });

    const fall = (card, delay) => {
      const trail = $('.card__trail', card);
      const scan = $('.card__scan', card);
      const tl = gsap.timeline({ delay });
      tl.set(card, { opacity: 0, y: -240, rotation: rand(-7, 7), scale: 0.92 })
        .set(trail, { opacity: 0, scaleY: 0.2 })
        .to(card, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0)
        .to(trail, { opacity: 1, scaleY: 1, duration: 0.35, ease: 'power2.out' }, 0)
        .to(card, { y: 0, rotation: 0, scale: 1, duration: 1.05, ease: 'back.out(1.5)' }, 0)
        .to(trail, { opacity: 0, scaleY: 0, duration: 0.5, ease: 'power2.in' }, 0.3)
        .add(() => burst(card), 0.42)
        .fromTo(scan, { opacity: 1, yPercent: -100 }, { opacity: 0, yPercent: 260, duration: 1.1, ease: 'power2.out' }, 0.42)
        .add(() => {
          card._landed = true;
          card.classList.add('is-live');
          card._scene.play();
        }, 0.6);
    };

    ScrollTrigger.batch(cards, {
      start: 'top 92%',
      once: true,
      onEnter: (els) => els.forEach((card, i) => fall(card, i * 0.16)),
    });

    // Inclinación 3D + foco de luz (solo puntero fino)
    if (!finePointer) return;
    cards.forEach((card) => {
      const spot = $('.card__spot', card);
      const sx = gsap.quickTo(spot, 'x', { duration: 0.35, ease: 'power3.out' });
      const sy = gsap.quickTo(spot, 'y', { duration: 0.35, ease: 'power3.out' });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointerenter', (e) => {
        const r = card.getBoundingClientRect();
        gsap.set(spot, { x: e.clientX - r.left, y: e.clientY - r.top });
      });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        sx(e.clientX - r.left);
        sy(e.clientY - r.top);
        ry((px - 0.5) * 12);
        rx((0.5 - py) * 10);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ------------------------------------------------------------------------
     Proceso — línea de progreso con cometa + pasos que se encienden
     ------------------------------------------------------------------------ */
  function processSteps() {
    if (!motionOK) return;
    const wrap = $('[data-steps]');
    if (!wrap) return;
    const rail = $('.steps__rail', wrap);
    const trig = { trigger: wrap, start: 'top 60%', end: 'bottom 60%', scrub: 0.6 };

    gsap.to('.steps__progress', { scaleY: 1, ease: 'none', scrollTrigger: trig });
    gsap.to('.steps__comet', {
      y: () => rail.offsetHeight,
      ease: 'none',
      scrollTrigger: {
        ...trig,
        invalidateOnRefresh: true,
        onToggle: (self) => gsap.to('.steps__comet', { opacity: self.isActive ? 1 : 0, duration: 0.3 }),
      },
    });

    $$('[data-step]').forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 60%',
        onEnter: () => step.classList.add('is-active'),
        onLeaveBack: () => step.classList.remove('is-active'),
      });
      gsap.fromTo(step, { opacity: 0, x: 40 }, {
        opacity: 1, x: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
      });
    });
  }

  /* ------------------------------------------------------------------------
     Por qué — parallax de la imagen
     ------------------------------------------------------------------------ */
  function whyMedia() {
    if (!motionOK) return;
    gsap.fromTo('.why__img', { yPercent: -6 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: '.why__media', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  /* ------------------------------------------------------------------------
     12. Marquee infinito — reacciona a la velocidad y dirección del scroll
     ------------------------------------------------------------------------ */
  function marquee() {
    if (!motionOK) return;
    const track = $('.marquee__track');
    const group = $('.marquee__group', track);
    if (!track || !group) return;
    for (let i = 0; i < 2; i++) track.appendChild(group.cloneNode(true));

    const loop = gsap.to(track, {
      x: () => -group.offsetWidth,
      duration: () => group.offsetWidth / (isMobile() ? 45 : 70), // px por segundo
      ease: 'none',
      repeat: -1,
    });
    loop.totalTime(loop.duration() * 100); // margen para correr en reversa sin tocar el inicio

    let dir = 1;
    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) < 20) return;
        dir = v > 0 ? 1 : -1;
        const boost = gsap.utils.clamp(1, 5, Math.abs(v) / 300);
        gsap.timeline()
          .to(loop, { timeScale: boost * dir, duration: 0.2, overwrite: true })
          .to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' });
      },
    });
  }

  /* ------------------------------------------------------------------------
     CTA final — halo que respira, anillos de pulso y chispas en órbita
     ------------------------------------------------------------------------ */
  function finalCta() {
    if (!motionOK) return;
    const cta = $('.cta');
    if (!cta) return;
    const loop = gsap.timeline({ paused: true });

    loop.add(gsap.to('.cta__glow', { scale: 1.12, opacity: 0.75, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }), 0);
    $$('.cta__ring', cta).forEach((ring, i) => {
      loop.add(gsap.fromTo(ring, { scale: 1, opacity: 0.8 }, {
        scale: 1.35, opacity: 0, duration: 2.4, ease: 'power2.out', repeat: -1, delay: i * 1.2,
      }), 0);
    });
    loop.add(gsap.to('.cta__streams .stream', { x: 40, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 1.5 }), 0);

    // Órbita elíptica alrededor del botón (MotionPath con coordenadas relativas)
    const orbit = $('.cta__orbit', cta);
    const sparks = $$('i', orbit);
    const buildOrbit = () => {
      const a = orbit.offsetWidth / 2;
      const b = orbit.offsetHeight / 2;
      return `M${-a},0 A${a},${b} 0 1,1 ${a},0 A${a},${b} 0 1,1 ${-a},0`;
    };
    sparks.forEach((s, i) => {
      gsap.set(s, { opacity: 1 - i * 0.25 });
      loop.add(gsap.to(s, {
        motionPath: { path: buildOrbit(), start: i / sparks.length, end: i / sparks.length + 1 },
        duration: 7, ease: 'none', repeat: -1,
      }), 0);
    });

    ScrollTrigger.create({
      trigger: cta,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    });
  }

  /* ------------------------------------------------------------------------
     Botón flotante de WhatsApp — entrada y "saludo" periódico
     ------------------------------------------------------------------------ */
  function waFloat() {
    const btn = $('#wa-float');
    if (!btn || !motionOK) return;
    gsap.fromTo(btn, { opacity: 0, scale: 0, rotation: -120 }, {
      opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(2)', delay: 1.2,
    });
    gsap.timeline({ repeat: -1, repeatDelay: 7, delay: 6 })
      .to(btn, { keyframes: { rotation: [0, -14, 12, -8, 5, 0] }, duration: 0.8, ease: 'power1.inOut' });
  }

  /* ------------------------------------------------------------------------
     13. Partículas ambientales — tsParticles cargado en diferido
     ------------------------------------------------------------------------ */
  const TSP_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/slim@3.9.1/tsparticles.slim.bundle.min.js';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function ambientParticles() {
    if (!motionOK) return;
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 400));
    idle(async () => {
      try {
        await loadScript(TSP_URL);
        const mobile = isMobile();
        await tsParticles.load({
          id: 'ambient',
          options: {
            fullScreen: { enable: false },
            fpsLimit: 60,
            detectRetina: true,
            background: { color: 'transparent' },
            particles: {
              number: { value: mobile ? 28 : 70, density: { enable: true } },
              color: { value: ['#00E5FF', '#00838F', '#E0E0E0'] },
              opacity: { value: { min: 0.25, max: 0.85 }, animation: { enable: true, speed: 0.6 } },
              size: { value: { min: 0.8, max: 2.8 } },
              links: {
                enable: !mobile, distance: 140, color: '#00E5FF', opacity: 0.12, width: 1,
              },
              move: { enable: true, speed: 0.35, direction: 'none', outModes: { default: 'out' } },
            },
            interactivity: {
              events: { onHover: { enable: finePointer, mode: 'grab' }, resize: { enable: true } },
              modes: { grab: { distance: 160, links: { opacity: 0.25 } } },
            },
          },
        });
        gsap.from('#ambient', { opacity: 0, duration: 2, ease: 'power2.out' });
      } catch (err) {
        // Sin partículas no pasa nada: la página sigue completa
      }
    });
  }

  /* ------------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------------ */
  runPreloader().then(() => {
    lenis?.start();
    heroIntro();
    heroParallax();
    colibriFlight();
    magnetic();
    cursorFx();
    dividers();
    marquee();
    sectionReveals();
    serviceCards();
    processSteps();
    whyMedia();
    finalCta();
    waFloat();
    ambientParticles();
    ScrollTrigger.refresh();
  });
})();
