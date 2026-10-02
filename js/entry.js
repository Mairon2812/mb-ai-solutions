/* Interactive phoenix portal. CSS animation only, no video or external library. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'home') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const english = window.MB_LANG === 'en';
  const t = (es, en) => english ? en : es;
  const key = 'mb-portal-entry-v2';
  const goals = {
    agent: {
      label: t('Atender a mis clientes', 'Help my customers'),
      title: t('Una consulta. Una respuesta. Un siguiente paso.', 'An inquiry. An answer. A next step.'),
      from: t('Mensajes esperando respuesta', 'Messages waiting for a reply'),
      to: t('Tu agente responde y organiza las solicitudes.', 'Your agent replies and organizes requests.'),
      steps: [t('Cliente pregunta', 'Customer asks'), t('IA consulta tu información', 'AI checks your information'), t('Tu equipo recibe la solicitud', 'Your team receives the request')],
      route: 'soluciones.html#mb-ai-agent'
    },
    automation: {
      label: t('Quitarme tareas repetitivas', 'Remove repetitive tasks'),
      title: t('Menos copiar y pegar. Más avanzar.', 'Less copying and pasting. More progress.'),
      from: t('Datos que se copian a mano', 'Data copied by hand'),
      to: t('Un flujo registra la información y avisa a tu equipo.', 'A workflow records information and notifies your team.'),
      steps: [t('Llega una solicitud', 'A request arrives'), t('El flujo organiza los datos', 'The workflow organizes data'), t('Tu equipo recibe un aviso', 'Your team gets notified')],
      route: 'soluciones.html#servicios'
    },
    development: {
      label: t('Conectar mis herramientas', 'Connect my tools'),
      title: t('Tu información deja de vivir en islas.', 'Your information stops living in silos.'),
      from: t('Herramientas desconectadas', 'Disconnected tools'),
      to: t('Tus sistemas comparten información según el alcance.', 'Your systems share information based on the agreed scope.'),
      steps: [t('Una fuente de información', 'A source of information'), t('Integración entre herramientas', 'Connected tools'), t('Tu operación sincronizada', 'Synchronized operations')],
      route: 'soluciones.html#servicios'
    }
  };
  let selected = 'agent';
  let saved;
  try { saved = sessionStorage.getItem('mb-entry-goal'); } catch { /* Optional storage. */ }
  if (goals[saved]) selected = saved;
  const params = new URLSearchParams(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem(key) === '1'; } catch { /* Entry stays usable without storage. */ }
  // Direct links should take visitors straight to the content they requested.
  if (seen || location.hash || params.has('sector')) return;

  const overlay = document.createElement('div');
  overlay.className = 'phoenix-intro dimension-entry';
  overlay.setAttribute('data-lenis-prevent', '');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'entry-title');
  overlay.setAttribute('aria-describedby', 'entry-description');
  overlay.innerHTML = `
    <div class="dimension-atmosphere" aria-hidden="true"></div>
    <header class="dimension-top">
      <img src="assets/logo-fenix-fullcolor-transparente.png" alt="MB AI SOLUTIONS" width="1254" height="1254">
      <button class="dimension-skip" type="button">${t('Ir directamente a la web', 'Go straight to the website')} <span aria-hidden="true">↗</span></button>
    </header>
    <div class="dimension-layout">
      <div class="dimension-copy">
        <p class="dimension-eyebrow">${t('Una nueva forma de trabajar', 'A new way to work')}</p>
        <h1 id="entry-title">${t('Tu negocio tiene otra dimensión.', 'Your business has another dimension.')}</h1>
        <p id="entry-description">${t('Menos trabajo manual. Más espacio para crecer. Descubre qué puede hacer la IA por tu operación.', 'Less manual work. More room to grow. Discover what AI can do for your operations.')}</p>
        <fieldset class="dimension-choices"><legend>${t('¿Qué te gustaría dejar de hacer a mano?', 'What would you like to stop doing by hand?')}</legend>
          ${Object.entries(goals).map(([id, goal]) => `<button class="dimension-choice" data-goal="${id}" type="button" aria-pressed="${id === selected}"><span class="dimension-choice__mark" aria-hidden="true"></span>${goal.label}</button>`).join('')}
        </fieldset>
        <button class="btn btn--primary dimension-enter" type="button">${t('Entrar con el fénix', 'Enter with the phoenix')} <span aria-hidden="true">↗</span></button>
        <p class="dimension-footnote">${t('Elige una opción y entra con el fénix.', 'Choose an option and enter with the phoenix.')}</p>
      </div>
      <div class="dimension-visual">
        <div class="dimension-portal" aria-hidden="true">
          <div class="dimension-portal__city"></div><div class="dimension-portal__depth"></div>
          <div class="dimension-ring dimension-ring--outer"></div><div class="dimension-ring dimension-ring--middle"></div><div class="dimension-ring dimension-ring--inner"></div>
          <div class="dimension-orbit dimension-orbit--a"></div><div class="dimension-orbit dimension-orbit--b"></div>
          <div class="dimension-radials">${Array.from({ length: 20 }, (_, i) => `<i style="--ray:${i * 18}deg;--delay:${-(i % 5) * .3}s"></i>`).join('')}</div>
          <div class="dimension-bird"><div class="dimension-bird__rig">
            <img class="dimension-bird__left" src="assets/fenix-vuelo-transparente.png" alt="" width="1254" height="1254">
            <img class="dimension-bird__right" src="assets/fenix-vuelo-transparente.png" alt="" width="1254" height="1254">
            <img class="dimension-bird__tail" src="assets/fenix-vuelo-transparente.png" alt="" width="1254" height="1254">
            <img class="dimension-bird__body" src="assets/fenix-vuelo-transparente.png" alt="" width="1254" height="1254">
          </div></div>
          <span class="dimension-orbit-dot"></span>
        </div>
        <div class="dimension-demo" aria-live="polite" aria-atomic="true">
          <div class="dimension-demo__before"><span class="dimension-state-dot" aria-hidden="true"></span><span id="entry-before"></span></div>
          <h2 id="entry-demo-title"></h2>
          <ol class="dimension-flow" id="entry-flow"></ol>
          <p id="entry-after"></p>
          <small>${t('Ejemplo de aplicación. Lo adaptamos a tu negocio en el diagnóstico.', 'Illustrative application. We tailor it to your business during the consultation.')}</small>
        </div>
      </div>
    </div>
    <div class="dimension-crossing" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
    <p class="dimension-status" role="status" aria-live="polite"></p>`;

  const siblings = [...document.body.children].filter(el => !['SCRIPT', 'STYLE'].includes(el.tagName));
  const inertBefore = siblings.map(el => el.inert);
  const previousFocus = document.activeElement;
  siblings.forEach(el => { el.inert = true; });
  document.body.append(overlay);
  document.documentElement.classList.add('intro-playing');
  const start = overlay.querySelector('.dimension-enter');
  const skip = overlay.querySelector('.dimension-skip');
  const choices = [...overlay.querySelectorAll('[data-goal]')];
  let closed = false;
  let entering = false;
  let deadline;
  let removal;

  function choose(id) {
    selected = id;
    const goal = goals[id];
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.goal === id)));
    overlay.dataset.goal = id;
    overlay.querySelector('#entry-before').textContent = goal.from;
    overlay.querySelector('#entry-demo-title').textContent = goal.title;
    overlay.querySelector('#entry-after').textContent = goal.to;
    overlay.querySelector('#entry-flow').replaceChildren(...goal.steps.map(step => {
      const li = document.createElement('li'); li.textContent = step; return li;
    }));
  }
  choices.forEach(button => button.addEventListener('click', () => { if (!entering) choose(button.dataset.goal); }));
  choose(selected);

  function remove() { clearTimeout(removal); overlay.remove(); }
  function close(entered = false) {
    if (closed) return;
    closed = true;
    clearTimeout(deadline);
    overlay.classList.add('is-closing');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    siblings.forEach((el, i) => { el.inert = inertBefore[i]; });
    document.documentElement.classList.remove('intro-playing');
    document.removeEventListener('keydown', onKey);
    reduced.removeEventListener('change', onMotion);
    try { sessionStorage.setItem(key, '1'); } catch { /* No storage required. */ }
    if (entered) {
      try { sessionStorage.setItem('mb-entry-goal', selected); } catch { /* No storage required. */ }
      const destination = document.getElementById('problemas');
      const intro = destination?.querySelector('.agency-overview__intro');
      if (intro) {
        const followup = document.createElement('div');
        followup.className = 'dimension-followup';
        const label = document.createElement('p');
        label.textContent = t('Tu siguiente paso: ', 'Your next step: ') + goals[selected].label.toLowerCase();
        const link = document.createElement('a');
        const [path, hash] = goals[selected].route.split('#');
        link.href = `${path}?lang=${english ? 'en' : 'es'}#${hash}`;
        link.className = 'agency-text-link';
        link.textContent = t('Ver mi solución', 'Explore my solution') + ' ↗';
        followup.append(label, link); intro.prepend(followup);
      }
      destination?.scrollIntoView({ behavior: 'instant', block: 'start' });
      const title = destination?.querySelector('h2');
      if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
    } else if (previousFocus && previousFocus !== document.body && !previousFocus.inert) {
      previousFocus.focus({ preventScroll: true });
    } else document.querySelector('.brand')?.focus({ preventScroll: true });
    removal = setTimeout(remove, reduced.matches ? 0 : 450);
  }
  function enter() {
    if (closed || entering) return;
    if (reduced.matches) { close(true); return; }
    entering = true;
    overlay.classList.add('is-entering');
    overlay.scrollTop = 0;
    choices.forEach(button => { button.disabled = true; });
    start.disabled = true;
    skip.focus({ preventScroll: true });
    overlay.querySelector('.dimension-status').textContent = t('Abriendo una nueva dimensión para tu negocio…', 'Opening a new dimension for your business…');
    // A fixed deadline guarantees entry even if an image or animation fails.
    deadline = setTimeout(() => close(true), 1800);
  }
  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); close(false); }
    if (event.key === 'Tab') {
      const buttons = [...overlay.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  function onMotion() { if (reduced.matches && entering) close(true); }
  document.addEventListener('keydown', onKey);
  reduced.addEventListener('change', onMotion);
  skip.addEventListener('click', () => close(false));
  start.addEventListener('click', enter);
  window.MB_DISMISS_ENTRY = () => close(entering);
  choices.find(button => button.dataset.goal === selected)?.focus({ preventScroll: true });
})();
