/* ==========================================================================
   Océano cibernético del footer — malla de puntos en perspectiva que ondula
   como agua. Reacciona al puntero con ondas. Canvas 2D, sin librerías.
   Se pausa fuera de pantalla; con reduced-motion se dibuja un solo cuadro.
   ========================================================================== */
(() => {
  'use strict';

  const canvas = document.getElementById('cyber-sea');
  if (!canvas) return;
  const footer = canvas.closest('footer');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0;
  let H = 0;
  let cols = 0;
  let rows = 0;
  let running = false;
  let raf = 0;
  const ripples = [];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = W < 768;
    cols = mobile ? 46 : 92;
    rows = mobile ? 13 : 20;
  };

  // Punto de la malla: u (0..1 a lo ancho), z (0 lejos .. 1 cerca)
  const project = (u, z, t) => {
    const horizon = H * 0.12;
    const baseY = horizon + (H - horizon) * Math.pow(z, 1.5);
    const spread = 0.75 + z * 1.6;                 // perspectiva: lo cercano se abre
    const x = W / 2 + (u - 0.5) * W * spread;
    const amp = H * (0.035 + z * 0.09);
    let wave = Math.sin(u * 9 + t * 0.8 + z * 5) * 0.55
      + Math.sin(u * 17 - t * 1.25 + z * 9) * 0.3
      + Math.sin(u * 4 + t * 0.35) * 0.35;

    // Ondas del puntero
    for (const r of ripples) {
      const age = t - r.t;
      const d = Math.hypot(x - r.x, baseY - r.y);
      wave += Math.sin(d * 0.045 - age * 7) * Math.exp(-d / 160) * Math.exp(-age * 1.1) * 2.2;
    }
    return { x, y: baseY - wave * amp, crest: wave };
  };

  const draw = (ms) => {
    const t = ms / 1000;
    for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t > 4) ripples.splice(i, 1);

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (let r = 0; r < rows; r++) {
      const z = r / (rows - 1);
      const pts = [];
      for (let c = 0; c <= cols; c++) pts.push(project(c / cols, z, t));

      // Línea de la malla (hilo de luz)
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.05 + z * 0.22})`;
      ctx.lineWidth = 0.6 + z * 0.8;
      ctx.stroke();

      // Nodos: más brillantes en las crestas
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const glow = Math.max(0, p.crest) * 0.35;
        const a = Math.min(1, 0.12 + z * 0.55 + glow);
        const s = 0.5 + z * 1.6 + glow * 1.5;
        ctx.fillStyle = glow > 0.28 ? `rgba(224, 255, 255, ${a})` : `rgba(0, 229, 255, ${a})`;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    }

    // Destellos de datos aleatorios
    if (!reduced) {
      for (let k = 0; k < 4; k++) {
        const z = 0.3 + Math.random() * 0.7;
        const p = project(Math.random(), z, t);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + Math.random() * 0.5})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2 + z * 2, 2 + z * 2);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const loop = (ms) => {
    draw(ms);
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!running && !reduced) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  draw(performance.now());
  window.addEventListener('resize', () => { resize(); if (!running) draw(performance.now()); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(canvas);
  } else {
    start();
  }

  // Ondas al mover o tocar sobre el agua
  if (!reduced) {
    let last = 0;
    footer.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - last < 120) return;
      const rect = canvas.getBoundingClientRect();
      if (e.clientY < rect.top - 40 || e.clientY > rect.bottom) return;
      last = now;
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: now / 1000 });
      if (ripples.length > 6) ripples.shift();
    }, { passive: true });
    footer.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: Math.max(0, e.clientY - rect.top), t: performance.now() / 1000 });
    }, { passive: true });
  }
})();
