/* ==========================================================================
   Mariposa Morpho — guía hacia la consola IA
   1. Botón flotante (esquina inferior izquierda) que revolotea tras el hero.
   2. Entrada: cuando la consola aparece, una Morpho vuela hacia la cámara
      (casi sale de la pantalla), arrastra un letrero y se posa en la esquina
      de la consola invitando a usarla.
   3. Deja de insistir cuando el visitante ya usó la IA.
   ========================================================================== */
(() => {
  'use strict';

  const guide = document.getElementById('ai-guide');
  const consoleBlock = document.getElementById('consola-ia');
  const consoleBox = consoleBlock && consoleBlock.querySelector('.console');
  if (!guide || !consoleBox) return;

  const root = document.documentElement;
  const T = window.MB_T || ((x) => x);
  const motionOK = root.classList.contains('motion-ok') && !!window.gsap;
  const heroEnd = document.getElementById('problemas');
  const input = document.getElementById('console-input');
  const planBtn = document.getElementById('console-plan');

  /* --- SVG de la Morpho azul (ids únicos por instancia) --- */
  let uid = 0;
  const morphoSVG = (cls = '') => {
    const id = `mo${++uid}`;
    const wing = `
      <path class="mo-fore" fill="url(#${id}-f)" d="M60 44 C 50 16, 24 3, 8 11 C 1 15, 3 30, 10 40 C 18 50, 40 51, 60 48 Z"/>
      <path class="mo-hind" fill="url(#${id}-h)" d="M60 50 C 44 52, 20 58, 16 72 C 13 86, 33 95, 46 85 C 54 77, 58 63, 60 54 Z"/>
      <path class="mo-sheen" d="M58 44 C 48 22, 30 12, 16 14 C 26 22, 40 34, 58 44 Z"/>
      <g class="mo-dots"><circle cx="9" cy="15" r="1.3"/><circle cx="5" cy="24" r="1.3"/><circle cx="6" cy="32" r="1.2"/><circle cx="11" cy="39" r="1.2"/><circle cx="17" cy="77" r="1.2"/><circle cx="20" cy="86" r="1.3"/><circle cx="29" cy="91" r="1.3"/><circle cx="39" cy="89" r="1.2"/></g>`;
    return `<svg class="morpho ${cls}" viewBox="0 0 120 100" aria-hidden="true">
      <defs>
        <radialGradient id="${id}-f" cx="0.95" cy="0.85" r="1">
          <stop offset="0" stop-color="#0b1f7a"/><stop offset=".25" stop-color="#1e4dff"/>
          <stop offset=".55" stop-color="#2f9bff"/><stop offset=".78" stop-color="#00E5FF"/>
          <stop offset=".9" stop-color="#0c2a8a"/><stop offset="1" stop-color="#050b24"/>
        </radialGradient>
        <radialGradient id="${id}-h" cx="0.95" cy="0.1" r="1">
          <stop offset="0" stop-color="#0b1f7a"/><stop offset=".35" stop-color="#1f5bff"/>
          <stop offset=".62" stop-color="#28b8ff"/><stop offset=".85" stop-color="#0c2a8a"/>
          <stop offset="1" stop-color="#050b24"/>
        </radialGradient>
      </defs>
      <g class="mo-wing mo-wing--l">${wing}</g>
      <g class="mo-wing mo-wing--r" transform="matrix(-1 0 0 1 120 0)">${wing}</g>
      <ellipse class="mo-body" cx="60" cy="50" rx="2.8" ry="17"/>
      <path class="mo-antenna" d="M59 35 C 55 24, 50 19, 45 17 M61 35 C 65 24, 70 19, 75 17"/>
      <circle class="mo-tip" cx="45" cy="17" r="1.7"/><circle class="mo-tip" cx="75" cy="17" r="1.7"/>
    </svg>`;
  };

  const flap = (svg, speed = 0.15) => {
    if (!motionOK) return null;
    const wings = svg.querySelectorAll('.mo-wing--l');
    const wingsR = svg.querySelectorAll('.mo-wing--r');
    const sheen = svg.querySelectorAll('.mo-sheen');
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: speed, ease: 'sine.inOut' } });
    tl.to(wings, { scaleX: 0.22, svgOrigin: '60 50' }, 0)
      .to(wingsR, { scaleX: 0.22, svgOrigin: '60 50' }, 0)
      .to(sheen, { opacity: 0.55 }, 0);
    return tl;
  };

  /* ======================================================================
     1. Botón flotante
     ====================================================================== */
  const guideBody = guide.querySelector('.guide__body');
  guideBody.innerHTML = morphoSVG('guide__svg');
  const guideFlap = flap(guideBody.querySelector('svg'));
  const tip = guide.querySelector('.guide__tip');

  let pastHero = false;
  let consoleVisible = false;
  let used = false;
  let flying = false;
  try { used = sessionStorage.getItem('mb-ai-used') === '1'; } catch { /* sin storage */ }

  const shouldShow = () => pastHero && !consoleVisible && !used && !flying;
  guide.setAttribute('tabindex', '-1');

  let tipTimer = 0;
  function showTip(delay = 0) {
    if (!motionOK) return;
    clearTimeout(tipTimer);
    gsap.killTweensOf(tip);
    gsap.timeline({ delay })
      .fromTo(tip, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' })
      .to(tip, { opacity: 0, duration: 0.4 }, '+=3.2');
    tipTimer = setTimeout(() => { if (guide.classList.contains('is-on')) showTip(); }, 11000);
  }

  const setVisible = (on) => {
    if (guide.classList.contains('is-on') === on) return;
    guide.classList.toggle('is-on', on);
    guide.setAttribute('tabindex', on ? '0' : '-1');
    if (!motionOK) return;
    if (on) {
      gsap.fromTo(guide, { opacity: 0, x: -120, y: 40, rotation: -25 }, {
        opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.4, ease: 'power3.out',
      });
      showTip(1.6);
    } else {
      gsap.to(guide, { opacity: 0, duration: 0.3 });
    }
  };
  const refresh = () => setVisible(shouldShow());

  if (motionOK) {
    gsap.to(guideBody, {
      x: () => gsap.utils.random(-26, 26),
      y: () => gsap.utils.random(-22, 14),
      rotation: () => gsap.utils.random(-14, 14),
      duration: () => gsap.utils.random(1.2, 2),
      ease: 'sine.inOut',
      repeat: -1,
      repeatRefresh: true,
    });
  }

  guide.addEventListener('click', () => {
    if (!motionOK) {
      setTimeout(() => planBtn?.focus({ preventScroll: true }), 300);
      return;
    }
    flying = true;
    gsap.timeline({
      onComplete: () => {
        gsap.set(guide, { x: 0, y: 0, scale: 1, rotation: 0 });
        flying = false;
        planBtn?.focus({ preventScroll: true });
        refresh();
      },
    })
      .to(tip, { opacity: 0, duration: 0.2 }, 0)
      .to(guide, { y: -window.innerHeight * 0.5, x: window.innerWidth * 0.3, rotation: 25, opacity: 0, duration: 0.9, ease: 'power2.in' }, 0);
  });

  /* ======================================================================
     2. Morpho posada en la consola con su letrero
     ====================================================================== */
  const perch = document.createElement('div');
  perch.className = 'morpho-perch';
  perch.innerHTML = `
    <button type="button" class="morpho-sign" aria-label="${T('Pruébala: escribe tu pregunta a la IA')}">
      <span class="morpho-sign__string" aria-hidden="true"></span>
      <span class="morpho-sign__board">${T('✦ ¡Pruébala! Pregúntale lo que quieras')}</span>
    </button>
    <span class="morpho-perch__bug" aria-hidden="true">${morphoSVG('morpho--perch')}</span>`;
  // Se posa sobre el botón del plan: justo donde el visitante debe actuar
  (planBtn?.parentElement || consoleBox).appendChild(perch);
  const perchBug = perch.querySelector('.morpho-perch__bug');
  const sign = perch.querySelector('.morpho-sign');
  const board = perch.querySelector('.morpho-sign__board');
  let perchFlap = null;

  sign.addEventListener('click', () => {
    (input || planBtn)?.focus({ preventScroll: true });
    retire();
  });

  const perchIdle = () => {
    if (!motionOK) return;
    perchFlap = flap(perchBug.querySelector('svg'), 0.45);
    gsap.to(perchBug, { rotation: -6, y: -3, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(board, { rotation: 1.5, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '100% 0%' });
  };

  function retire() {
    if (perch.classList.contains('is-gone')) return;
    perch.classList.add('is-gone');
    if (!motionOK) return;
    gsap.to(board, { scaleX: 0, opacity: 0, duration: 0.4, ease: 'power2.in', transformOrigin: '100% 50%' });
    gsap.to(perchBug, {
      x: 140, y: -160, rotation: 30, scale: 0.6, opacity: 0, duration: 1.1, ease: 'power2.in', delay: 0.2,
      onComplete: () => perchFlap?.kill(),
    });
  }

  /* ======================================================================
     3. Entrada: vuela hacia la cámara y se posa arrastrando el letrero
     ====================================================================== */
  const flyer = document.createElement('div');
  flyer.className = 'morpho-fly';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.innerHTML = `<span class="morpho-fly__banner">${T('✦ ¡Pruébala! Pregúntale lo que quieras')}</span>${morphoSVG('morpho--fly')}`;
  document.body.appendChild(flyer);
  const flyerSvg = flyer.querySelector('svg');
  const flyerBanner = flyer.querySelector('.morpho-fly__banner');
  let entered = false;

  const land = () => {
    perch.classList.add('is-on');
    perchIdle();
  };

  const entrance = () => {
    if (entered) return;
    entered = true;
    if (!motionOK || used) { land(); return; }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const size = flyer.offsetWidth;
    const target = perchBug.getBoundingClientRect();
    const endX = target.left + target.width / 2 - size / 2;
    const endY = target.top + target.height / 2 - size / 2;
    const endScale = target.width / size;
    const fFlap = flap(flyerSvg, 0.09);

    const small = vw < 768;
    flyerBanner.classList.toggle('is-below', small);   // en móvil el letrero cuelga debajo
    gsap.set(flyer, { x: vw + 60, y: vh * 0.75, scale: 0.5, rotation: -20, opacity: 1 });
    gsap.set(flyerBanner, { scaleX: 0, opacity: 0, xPercent: small ? -50 : 0 });
    const close = small
      ? { x: vw / 2 - size / 2, y: vh * 0.28, scale: Math.min(3, (vw * 0.8) / size) }
      : { x: vw * 0.42, y: vh * 0.3, scale: Math.min(7, (vw * 0.9) / size) };

    gsap.timeline({
      onComplete: () => {
        fFlap?.kill();
        gsap.set(flyer, { opacity: 0 });
        land();
      },
    })
      // entra desde la derecha y se acerca a la cámara (casi sale de la pantalla)
      .to(flyer, {
        motionPath: { path: [{ x: vw * 0.7, y: vh * 0.45 }, { x: close.x, y: close.y }], curviness: 1.2 },
        scale: close.scale, rotation: small ? 4 : 12, duration: 1.5, ease: 'power2.inOut',
      })
      .to(flyerBanner, { scaleX: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.6)
      // pausa frente al visitante: el letrero se lee en grande
      .to(flyer, { y: '-=18', rotation: 6, duration: 0.9, ease: 'sine.inOut' })
      // se aleja y se posa en la esquina de la consola
      .to(flyer, {
        motionPath: { path: [{ x: vw * 0.2, y: vh * 0.2 }, { x: endX, y: endY }], curviness: 1.3 },
        scale: endScale, rotation: 0, duration: 1.4, ease: 'power3.inOut',
      })
      .to(flyerBanner, { opacity: 0, duration: 0.3 }, '-=0.35');
  };

  /* ======================================================================
     Observadores
     ====================================================================== */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      pastHero = e.isIntersecting || e.boundingClientRect.top < 0;
      refresh();
    }).observe(heroEnd || consoleBlock);

    new IntersectionObserver(([e]) => {
      consoleVisible = e.isIntersecting;
      refresh();
    }, { threshold: 0.25 }).observe(consoleBlock);

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) entrance();
    }, { threshold: 0.55 }).observe(consoleBox);
  } else {
    land();
  }

  // Cuando el visitante ya usó la IA, la mariposa deja de insistir
  consoleBlock.addEventListener('click', (e) => {
    if (!e.target.closest('.console__chip, .console__plan, .console__send, .console__input')) return;
    used = true;
    try { sessionStorage.setItem('mb-ai-used', '1'); } catch { /* sin storage */ }
    retire();
    refresh();
  });
  input?.addEventListener('focus', () => { if (entered) retire(); });

  void guideFlap;
})();
