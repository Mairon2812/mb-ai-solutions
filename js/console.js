/* ==========================================================================
   Consola IA estilo JARVIS
   - Preguntas sugeridas: respuestas preparadas (instantáneas, sin gastar cupo).
   - Texto libre: IA real (Gemini) a través del Worker de Cloudflare.
   - Si la IA no responde o se agota el cupo gratuito: respuestas preparadas.
   Independiente de GSAP: funciona aunque falle el CDN o con reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.getElementById('consola-ia');
  if (!root) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = window.MB_T || ((x) => x);
  const LANG = window.MB_LANG === 'en' ? 'en' : 'es';
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
  const planBtn = $('#console-plan');
  const hint = $('#console-hint');

  // Intermediario seguro (la clave de Gemini vive en Cloudflare, nunca aquí)
  const AI_ENDPOINT = 'https://mb-ai-console.mb-ai-solutions.workers.dev/chat';
  const AI_MAX_PER_VISIT = 8;
  const AI_TIMEOUT_MS = 12000;

  // Respuestas predefinidas (máx. 280 caracteres, sin precios ni tecnicismos)
  const RESPUESTAS_CONSOLA = {
    restaurante: {
      claves: ['restaurante', 'comida', 'pedido', 'menu', 'mesa', 'domicilio', 'cocina', 'restaurant', 'food', 'order'],
      texto: 'Con MB AI AGENT atendería a tus clientes mientras tú cocinas: muestro el menú y los horarios, recibo pedidos y le paso a tu equipo lo que necesite una persona. Las funciones exactas las definimos contigo en el diagnóstico.',
    },
    noche: {
      claves: ['noche', 'madrugada', 'horario', '24', 'domingo', 'festivo', 'duermes', 'dormir', 'night', 'hours', 'weekend', 'sleep'],
      texto: 'Sí. No duermo ni tomo vacaciones: respondo a las 3 de la mañana igual que a las 3 de la tarde. Si algo necesita a una persona, lo dejo anotado para que tu equipo lo vea al llegar.',
    },
    costo: {
      claves: ['cuesta', 'precio', 'valor', 'costo', 'cobran', 'cuanto', 'tarifa', 'pagar', 'cost', 'price', 'pricing', 'how much', 'fee'],
      texto: 'MB AI AGENT arranca desde $900.000 COP y las automatizaciones desde $500.000 COP. El precio final depende del alcance y las integraciones; en el diagnóstico te damos el valor exacto y el plazo, normalmente de 1 a 4 semanas.',
    },
    tecnologia: {
      claves: ['tecnolog', 'saber', 'dificil', 'complicado', 'aprender', 'programar', 'computador', 'tech', 'difficult', 'learn', 'code'],
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
    clock.textContent = new Date().toLocaleTimeString(LANG === 'en' ? 'en-US' : 'es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
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

  /* --- IA real con respaldo --- */
  let aiCount = 0;
  const aiHistory = [];

  const askAI = async (question, mode = 'chat') => {
    if (!AI_ENDPOINT || aiCount >= AI_MAX_PER_VISIT) return null;
    aiCount++;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, mode, lang: LANG, history: mode === 'chat' ? aiHistory.slice(-6) : [] }),
        signal: ctrl.signal,
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (mode === 'plan') return data.plan || null;
      if (!data.reply) return null;
      aiHistory.push({ role: 'user', text: question }, { role: 'model', text: data.reply });
      return data.reply;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  /* --- Diálogo --- */
  let busy = false;
  let firstDone = false;

  const setBusy = (on) => {
    busy = on;
    // aria-disabled (no disabled) para que el foco del teclado no se pierda
    [...chips, send, planBtn].forEach((b) => b.setAttribute('aria-disabled', String(on)));
  };

  const addLine = (who, cls) => {
    const p = document.createElement('p');
    p.className = `console__line ${cls}`;
    p.innerHTML = `<span class="console__who">${who} ›</span> `;
    log.appendChild(p);
    return p;
  };
  const scrollLog = () => { log.scrollTop = log.scrollHeight; };

  const typeAnswer = (raw) => new Promise((resolve) => {
    const text = T(raw);
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
    state.textContent = T('RESPONDIENDO');
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

  const revealCta = () => {
    if (firstDone) return;
    firstDone = true;
    cta.hidden = false;
    if (!reduced && window.gsap) {
      gsap.fromTo(cta, { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)' });
    }
  };

  let mode = 'chat';
  const DEFAULT_PLACEHOLDER = input.placeholder;
  const PLAN_PLACEHOLDER = T('Ej: panadería, clínica dental, taller de motos…');

  const ask = async (question, answer) => {
    if (busy || !question.trim()) return;
    stopAttract();
    setBusy(true);
    const u = addLine(T('TÚ'), 'console__line--user');
    u.appendChild(document.createTextNode(question.trim()));
    scrollLog();

    state.textContent = T('ANALIZANDO…');
    energyTarget = reduced ? 0 : 0.6;
    const [aiReply] = await Promise.all([
      answer ? null : askAI(question.trim()),
      new Promise((r) => setTimeout(r, 600)),
    ]);

    await typeAnswer(answer || aiReply || findAnswer(question));
    state.textContent = T('EN LÍNEA');
    setBusy(false);
    revealCta();
  };

  /* --- Modo plan: la IA diseña 3 ideas para el negocio del visitante --- */
  const FALLBACK_PLAN = {
    intro: 'Esta es una idea base; en el diagnóstico gratuito la ajustamos a tu negocio.',
    ideas: [
      { titulo: 'Atención 24/7 en WhatsApp', detalle: 'Un asistente responde preguntas frecuentes y toma pedidos o citas, incluso de noche.' },
      { titulo: 'Recordatorios automáticos', detalle: 'Tus clientes reciben avisos de citas, pagos o pedidos sin que tengas que escribir uno por uno.' },
      { titulo: 'Seguimiento a clientes', detalle: 'Mensajes de seguimiento después de cada compra o visita para que vuelvan.' },
    ],
  };

  const renderPlan = (business, plan) => {
    const box = document.createElement('div');
    box.className = 'plan';
    box.innerHTML = '<p class="plan__head"><span>' + T('PLAN IA') + '</span><span class="plan__biz"></span></p><ol class="plan__list"></ol>';
    box.querySelector('.plan__biz').textContent = business.toUpperCase().slice(0, 40);
    const list = box.querySelector('.plan__list');
    plan.ideas.forEach((idea, n) => {
      const li = document.createElement('li');
      li.className = 'plan__item';
      li.innerHTML = '<span class="plan__num"></span><div><p class="plan__title"></p><p class="plan__detail"></p></div>';
      li.querySelector('.plan__num').textContent = String(n + 1).padStart(2, '0');
      li.querySelector('.plan__title').textContent = T(idea.titulo);
      li.querySelector('.plan__detail').textContent = T(idea.detalle);
      list.appendChild(li);
    });
    const list3 = plan.ideas.map((x, n) => `${n + 1}) ${T(x.titulo)}`).join(', ');
    const msg = LANG === 'en'
      ? `Hi, I tried the console on your website. I run a ${business} and I'm interested in this plan: ${list3}.`
      : `Hola, probé la consola de su web. Tengo ${business} y me interesa este plan: ${list3}.`;
    const link = document.createElement('a');
    link.className = 'plan__cta';
    link.href = `https://wa.me/573025289834?text=${encodeURIComponent(msg.slice(0, 500))}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = T('Quiero este plan para mi negocio →');
    box.appendChild(link);
    log.appendChild(box);
    scrollLog();

    if (!reduced && window.gsap) {
      gsap.fromTo(box, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo(box.querySelectorAll('.plan__item'), { opacity: 0, x: -16 }, {
        opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.18, delay: 0.15, onUpdate: scrollLog,
      });
      gsap.fromTo(link, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.75 });
    }
  };

  const askPlan = async (business) => {
    if (busy || !business.trim()) return;
    stopAttract();
    setBusy(true);
    const biz = business.trim().slice(0, 80);
    const u = addLine(T('TÚ'), 'console__line--user');
    u.appendChild(document.createTextNode(biz));
    scrollLog();

    state.textContent = T('DISEÑANDO PLAN…');
    energyTarget = reduced ? 0 : 0.85;
    const [plan] = await Promise.all([askAI(biz, 'plan'), new Promise((r) => setTimeout(r, 900))]);
    const final = plan && plan.intro ? plan : FALLBACK_PLAN;

    await typeAnswer(final.intro);
    if (final.ideas && final.ideas.length) {
      renderPlan(biz, final);
      mode = 'chat';
      input.placeholder = DEFAULT_PLACEHOLDER;
      revealCta();
    }
    state.textContent = T('EN LÍNEA');
    setBusy(false);
  };

  planBtn.addEventListener('click', async () => {
    if (busy) return;
    stopAttract();
    setBusy(true);
    const u = addLine(T('TÚ'), 'console__line--user');
    u.appendChild(document.createTextNode(T('Diseña un plan de IA para mi negocio')));
    scrollLog();
    await typeAnswer('¡Con gusto! Cuéntame qué negocio tienes y te armo un primer plan con 3 ideas. Por ejemplo: panadería, clínica dental o taller de motos.');
    mode = 'plan';
    input.placeholder = PLAN_PLACEHOLDER;
    state.textContent = T('EN LÍNEA');
    setBusy(false);
    input.focus({ preventScroll: true });
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.getAttribute('aria-disabled') === 'true') return;
      ask(chip.textContent, RESPUESTAS_CONSOLA[chip.dataset.key].texto);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    const q = input.value;
    input.value = '';
    if (mode === 'plan') askPlan(q);
    else ask(q);
  });

  /* --- Invitación a interactuar: ejemplos que se escriben solos + aviso --- */
  const EXAMPLES = [
    'Tengo una panadería, ¿qué harías por mí?',
    '¿Puedes agendar citas en mi clínica?',
    '¿Cómo me ayudas a no perder clientes?',
    'Tengo un gimnasio, ¿qué automatizarías?',
  ].map(T);
  let attractOn = !reduced;
  let attractTimer = 0;
  function stopAttract() {
    attractOn = false;
    clearTimeout(attractTimer);
    if (mode !== 'plan') input.placeholder = DEFAULT_PLACEHOLDER;
    hint.classList.add('is-gone');
  }
  const typePlaceholder = (ex = 0, i = 0, erasing = false) => {
    if (!attractOn) return;
    const text = EXAMPLES[ex % EXAMPLES.length];
    if (!erasing && i <= text.length) {
      input.placeholder = `${text.slice(0, i)}▍`;
      attractTimer = setTimeout(() => typePlaceholder(ex, i + 1), 45);
    } else if (!erasing) {
      attractTimer = setTimeout(() => typePlaceholder(ex, i, true), 1800);
    } else if (i > 0) {
      input.placeholder = `${text.slice(0, i - 1)}▍`;
      attractTimer = setTimeout(() => typePlaceholder(ex, i - 1, true), 18);
    } else {
      attractTimer = setTimeout(() => typePlaceholder(ex + 1, 0), 350);
    }
  };
  input.addEventListener('focus', stopAttract);
  input.addEventListener('input', stopAttract);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      root.classList.add('is-seen');
      if (attractOn) attractTimer = setTimeout(() => typePlaceholder(), 900);
    }, { threshold: 0.45 });
    io.observe($('.console'));
  } else {
    root.classList.add('is-seen');
  }
})();
