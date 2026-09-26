/* ==========================================================================
   Consola IA estilo JARVIS — demostración ilustrativa (sin IA real)
   Independiente de GSAP: funciona aunque falle el CDN o con reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.getElementById('consola-ia');
  if (!root) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel) => root.querySelector(sel);
  const log = $('#console-log');
  const state = $('#console-state');
  const clock = $('#console-clock');
  const form = $('#console-form');
  const input = $('#console-input');
  const send = $('.console__send');
  const chips = [...root.querySelectorAll('.console__chip')];
  const cta = $('#console-cta');
  const canvas = $('#console-wave');

  // Respuestas predefinidas (máx. 280 caracteres, sin precios ni tecnicismos)
  const RESPUESTAS_CONSOLA = {
    restaurante: {
      claves: ['restaurante', 'comida', 'pedido', 'menu', 'mesa', 'domicilio', 'cocina'],
      texto: 'Atendería a tus clientes por WhatsApp mientras tú cocinas: les muestro el menú, tomo los pedidos, reservo mesas y aviso cuando el pedido está listo. Tú solo revisas lo que va entrando.',
    },
    noche: {
      claves: ['noche', 'madrugada', 'horario', '24', 'domingo', 'festivo', 'duermes', 'dormir'],
      texto: 'Sí. No duermo ni tomo vacaciones: respondo a las 3 de la mañana igual que a las 3 de la tarde. Si algo necesita a una persona, lo dejo anotado para que tu equipo lo vea al llegar.',
    },
    costo: {
      claves: ['cuesta', 'precio', 'valor', 'costo', 'cobran', 'cuanto', 'tarifa', 'pagar'],
      texto: 'Depende de tu negocio y de lo que quieras automatizar, por eso no te doy un número al aire. Empezamos con un diagnóstico gratuito y ahí te mostramos el plan y el precio exacto, sin letra pequeña.',
    },
    tecnologia: {
      claves: ['tecnolog', 'saber', 'dificil', 'complicado', 'aprender', 'programar', 'computador'],
      texto: 'Para nada. Si sabes usar WhatsApp, ya sabes usarme. Nosotros instalamos, conectamos y probamos todo contigo. Tú solo nos cuentas cómo funciona tu negocio.',
    },
  };
  const RESPUESTA_GENERICA = 'Buena pregunta. Esta es solo una demostración, así que no tengo esa respuesta aquí. Escríbenos por WhatsApp y te respondemos de verdad, con tu caso.';

  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const findAnswer = (q) => {
    const n = normalize(q);
    const hit = Object.values(RESPUESTAS_CONSOLA).find((r) => r.claves.some((k) => n.includes(k)));
    return hit ? hit.texto : RESPUESTA_GENERICA;
  };

  /* --- Reloj en vivo --- */
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };
  tick();
  setInterval(tick, 1000);

  /* --- Visualizador de onda circular (canvas 2D) --- */
  const ctx = canvas.getContext('2d');
  const BARS = 72;
  const phases = Array.from({ length: BARS }, () => Math.random() * Math.PI * 2);
  let energy = 0;          // 0 = reposo, 1 = hablando
  let energyTarget = 0;
  let size = 0;
  let running = false;
  let rafId = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (t) => {
    const c = size / 2;
    ctx.clearRect(0, 0, size, size);
    const pulse = reduced ? 0 : Math.sin(t / 900) * 0.5 + 0.5;

    // Anillos concéntricos
    [0.26, 0.36, 0.47].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(c, c, size * r * (1 + (i === 0 ? pulse * 0.04 + energy * 0.06 : 0)), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.18 + (i === 0 ? pulse * 0.25 + energy * 0.4 : 0.12)})`;
      ctx.lineWidth = i === 0 ? 2 : 1;
      ctx.stroke();
    });

    // Arco giratorio (radar)
    if (!reduced) {
      const a = t / 1400;
      ctx.beginPath();
      ctx.arc(c, c, size * 0.47, a, a + 0.9);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Barras radiales
    const r0 = size * 0.29;
    for (let i = 0; i < BARS; i++) {
      const ang = (i / BARS) * Math.PI * 2 - Math.PI / 2;
      const idle = 0.05 + pulse * 0.03 + Math.sin(t / 700 + phases[i]) * 0.012;
      const talk = energy * (0.05 + Math.abs(Math.sin(t / 90 + phases[i] * 3)) * 0.12);
      const len = size * (reduced ? 0.05 : idle + talk);
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(c + cos * r0, c + sin * r0);
      ctx.lineTo(c + cos * (r0 + len), c + sin * (r0 + len));
      ctx.strokeStyle = i % 6 === 0 ? 'rgba(224, 255, 255, 0.95)' : `rgba(0, 229, 255, ${0.45 + energy * 0.4})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Núcleo
    const g = ctx.createRadialGradient(c, c, 0, c, c, size * 0.22);
    g.addColorStop(0, `rgba(0, 229, 255, ${0.22 + energy * 0.25 + pulse * 0.08})`);
    g.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  };

  const loop = (t) => {
    energy += (energyTarget - energy) * 0.12;
    draw(t);
    rafId = requestAnimationFrame(loop);
  };
  const start = () => { if (!running && !reduced) { running = true; rafId = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(rafId); };

  resize();
  draw(0);
  window.addEventListener('resize', () => { resize(); if (!running) draw(performance.now()); });

  // Solo anima cuando la consola está en pantalla
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 }).observe(canvas);
  } else {
    start();
  }

  /* --- Diálogo --- */
  let busy = false;
  let firstDone = false;

  const setBusy = (on) => {
    busy = on;
    // aria-disabled (no disabled) para que el foco del teclado no se pierda
    [...chips, send].forEach((b) => b.setAttribute('aria-disabled', String(on)));
  };

  const addLine = (who, cls) => {
    const p = document.createElement('p');
    p.className = `console__line ${cls}`;
    p.innerHTML = `<span class="console__who">${who} ›</span> `;
    log.appendChild(p);
    return p;
  };
  const scrollLog = () => { log.scrollTop = log.scrollHeight; };

  const typeAnswer = (text) => new Promise((resolve) => {
    const line = addLine('MB·IA', 'console__line--ai');
    // Texto completo para lectores de pantalla; la animación es solo visual
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    line.append(sr, vis);

    if (reduced) {
      vis.textContent = text;
      scrollLog();
      resolve();
      return;
    }
    const caret = document.createElement('span');
    caret.className = 'console__caret';
    line.appendChild(caret);
    energyTarget = 1;
    state.textContent = 'RESPONDIENDO';
    let i = 0;
    const step = () => {
      i += 1 + (Math.random() < 0.3 ? 1 : 0);
      vis.textContent = text.slice(0, i);
      scrollLog();
      if (i < text.length) {
        setTimeout(step, 18 + Math.random() * 22);
      } else {
        caret.remove();
        energyTarget = 0;
        resolve();
      }
    };
    step();
  });

  const ask = async (question, answer) => {
    if (busy || !question.trim()) return;
    setBusy(true);
    const u = addLine('TÚ', 'console__line--user');
    u.appendChild(document.createTextNode(question.trim()));
    scrollLog();

    state.textContent = 'ANALIZANDO…';
    energyTarget = reduced ? 0 : 0.6;
    await new Promise((r) => setTimeout(r, 600));

    await typeAnswer(answer || findAnswer(question));
    state.textContent = 'EN LÍNEA';
    setBusy(false);

    if (!firstDone) {
      firstDone = true;
      cta.hidden = false;
      if (!reduced && window.gsap) {
        gsap.fromTo(cta, { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)' });
      }
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => ask(chip.textContent, RESPUESTAS_CONSOLA[chip.dataset.key].texto));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = '';
    ask(q);
  });
})();
