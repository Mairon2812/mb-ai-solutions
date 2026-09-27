/* ==========================================================================
   Mariposa guía — invita al visitante a probar la consola IA.
   - Aparece después del hero, revolotea en la esquina inferior izquierda.
   - Al tocarla vuela hacia la consola (el scroll lo hace main.js vía Lenis)
     y deja el foco en el botón del plan.
   - Se esconde mientras la consola está en pantalla y deja de insistir
     cuando el visitante ya usó la IA.
   ========================================================================== */
(() => {
  'use strict';

  const guide = document.getElementById('ai-guide');
  const consoleBlock = document.getElementById('consola-ia');
  if (!guide || !consoleBlock) return;

  const root = document.documentElement;
  const motionOK = root.classList.contains('motion-ok') && !!window.gsap;
  const heroEnd = document.getElementById('problemas');
  const wings = guide.querySelectorAll('.guide__wing');
  const body = guide.querySelector('.guide__body');
  const tip = guide.querySelector('.guide__tip');

  let pastHero = false;
  let consoleVisible = false;
  let used = false;
  let flying = false;
  try { used = sessionStorage.getItem('mb-ai-used') === '1'; } catch { /* sin storage */ }

  const shouldShow = () => pastHero && !consoleVisible && !used && !flying;

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
  guide.setAttribute('tabindex', '-1');

  /* --- Aleteo y revoloteo --- */
  if (motionOK) {
    gsap.to(wings, {
      scaleX: 0.28, svgOrigin: '50 45', duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
    gsap.to(body, {
      x: () => gsap.utils.random(-26, 26),
      y: () => gsap.utils.random(-22, 14),
      rotation: () => gsap.utils.random(-14, 14),
      duration: () => gsap.utils.random(1.2, 2),
      ease: 'sine.inOut',
      repeat: -1,
      repeatRefresh: true,
    });
  }

  /* --- Mensaje periódico --- */
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

  /* --- Clic: vuela hacia la consola --- */
  guide.addEventListener('click', () => {
    if (!motionOK) {
      setTimeout(() => document.getElementById('console-plan')?.focus({ preventScroll: true }), 300);
      return;
    }
    flying = true;
    const from = guide.getBoundingClientRect();
    const tx = window.innerWidth * (window.innerWidth >= 960 ? 0.62 : 0.5) - from.left - from.width / 2;
    const ty = window.innerHeight * 0.3 - from.top - from.height / 2;
    gsap.timeline({
      onComplete: () => {
        gsap.set(guide, { x: 0, y: 0, scale: 1, rotation: 0 });
        flying = false;
        consoleBlock.classList.remove('is-called');
        void consoleBlock.offsetWidth;
        consoleBlock.classList.add('is-called');
        document.getElementById('console-plan')?.focus({ preventScroll: true });
        refresh();
      },
    })
      .to(tip, { opacity: 0, duration: 0.2 }, 0)
      .to(guide, {
        motionPath: { path: [{ x: tx * 0.35, y: ty * 0.1 - 80 }, { x: tx * 0.75, y: ty * 0.8 }, { x: tx, y: ty }], curviness: 1.4 },
        rotation: 20, scale: 1.3, duration: 1.3, ease: 'power2.inOut',
      }, 0)
      .to(guide, { opacity: 0, scale: 0.4, duration: 0.35, ease: 'power2.in' });
  });

  /* --- Cuándo aparece --- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      pastHero = e.isIntersecting || e.boundingClientRect.top < 0;
      refresh();
    }).observe(heroEnd || consoleBlock);
    new IntersectionObserver(([e]) => { consoleVisible = e.isIntersecting; refresh(); }, { threshold: 0.25 })
      .observe(consoleBlock);
  }

  // Cuando el visitante ya usó la IA, la mariposa deja de insistir
  consoleBlock.addEventListener('click', (e) => {
    if (!e.target.closest('button, input')) return;
    used = true;
    try { sessionStorage.setItem('mb-ai-used', '1'); } catch { /* sin storage */ }
    refresh();
  });
})();
