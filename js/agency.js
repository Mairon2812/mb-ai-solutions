/* Navigation and user-driven agency interactions. No CDN dependency. */
(() => {
 'use strict';
 const en=window.MB_LANG==='en', t=(es,eng)=>en?eng:es;
 if(en){
  document.querySelectorAll('[data-en]').forEach(el=>el.textContent=el.dataset.en);
  const names={home:'Home',solutions:'Solutions',agency:'The agency',contact:'Let’s talk'};
  document.querySelectorAll('[data-page].nav__link,[data-page].btn').forEach(el=>el.textContent=names[el.dataset.page]);
  document.querySelectorAll('a[href="index.html#consola-ia"].nav__link').forEach(el=>el.textContent='Try the AI');
  for(const [es,eng] of [['Tipo de negocio','Business type'],['Ruta de navegación','Breadcrumb'],['Secciones de soluciones','Solution sections']]) document.querySelector(`[aria-label="${es}"]`)?.setAttribute('aria-label',eng);
  const titles={solutions:'Solutions',agency:'The agency',contact:'Contact'};
  if(titles[document.body.dataset.page])document.title=`${titles[document.body.dataset.page]} — MB AI SOLUTIONS`;
 }
 document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(!/^(index|soluciones|agencia|contacto)\.html(?:[?#]|$)/.test(raw))return;const url=new URL(raw,location.href);url.searchParams.set('lang',en?'en':'es');a.setAttribute('href',url.pathname.split('/').pop()+url.search+url.hash);});
 const nav=document.getElementById('nav'),toggle=document.getElementById('nav-toggle'),desktop=matchMedia('(min-width:900px)');
 const setNav=(open,restore=false)=>{
  nav?.classList.toggle('is-open',open);document.body.classList.toggle('agency-nav-open',open&&!desktop.matches);toggle?.setAttribute('aria-expanded',String(open));
  toggle?.setAttribute('aria-label',open?t('Cerrar menú','Close menu'):t('Abrir menú','Open menu'));
  if(nav)nav.inert=!open&&!desktop.matches;
  if(open&&nav){nav.getBoundingClientRect();nav.querySelector('a')?.focus();}if(restore)toggle?.focus();
 };
 window.MB_CLOSE_NAV=()=>setNav(false);
 toggle?.addEventListener('click',()=>setNav(toggle.getAttribute('aria-expanded')!=='true'));
 nav?.querySelectorAll('a').forEach(a=>{if(a.dataset.page===document.body.dataset.page)a.setAttribute('aria-current','page');a.addEventListener('click',()=>setNav(false));});
 desktop.addEventListener('change',()=>setNav(false));setNav(false);
 document.addEventListener('keydown',e=>{
  if(!nav?.classList.contains('is-open'))return;
  if(e.key==='Escape'){e.preventDefault();setNav(false,true);}
  if(e.key==='Tab'){
   const all=[toggle,...nav.querySelectorAll('a[href]')].filter(Boolean),i=all.indexOf(document.activeElement);
   if(e.shiftKey&&i<=0){e.preventDefault();all.at(-1).focus();}
   else if(!e.shiftKey&&(i===all.length-1||i<0)){e.preventDefault();toggle.focus();}
  }
 });
 const sectors={
  retail:{title:['Atiende consultas sin perder el hilo.','Handle inquiries without losing track.'],description:['Un agente consulta tu catálogo, responde preguntas y organiza las solicitudes para tu equipo.','An agent checks your catalog, answers questions and organizes requests for your team.'],flow:[['Consulta del cliente','Customer inquiry'],['Información del catálogo','Catalog information'],['Solicitud al asesor','Request to an advisor']]},
  food:{title:['Conecta el menú con la atención.','Connect your menu with customer service.'],description:['Comparte menú y horarios, recibe solicitudes de pedidos y deriva la confirmación a tu equipo.','Share your menu and opening hours, receive order requests and let your team confirm them.'],flow:[['Consulta del menú','Menu inquiry'],['Solicitud de pedido','Order request'],['Confirmación del equipo','Team confirmation']]},
  appointments:{title:['Organiza cada solicitud de cita.','Organize every appointment request.'],description:['Informa servicios y horarios, captura solicitudes de citas y conecta recordatorios según las herramientas de tu negocio.','Share services and opening hours, capture appointment requests and connect reminders based on your business tools.'],flow:[['Servicio elegido','Service selection'],['Solicitud de cita','Appointment request'],['Confirmación y recordatorio','Confirmation and reminder']]},
  property:{title:['Lleva cada consulta al asesor indicado.','Route each inquiry to the right advisor.'],description:['Comparte información de inmuebles, recoge los criterios del interesado y organiza prospectos para el seguimiento comercial.','Share property information, collect buyer preferences and organize leads for sales follow-up.'],flow:[['Consulta del inmueble','Property inquiry'],['Perfil del interesado','Prospect profile'],['Seguimiento del asesor','Advisor follow-up']]}
 };
 const choices=[...document.querySelectorAll('[data-sector]')];
 function choose(key){const sector=sectors[key];if(!sector)return;
  choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sector===key)));
  document.getElementById('sector-title').textContent=t(...sector.title);document.getElementById('sector-description').textContent=t(...sector.description);
  document.getElementById('sector-flow').replaceChildren(...sector.flow.map(copy=>{const li=document.createElement('li');li.textContent=t(...copy);return li;}));
  document.getElementById('sector-link').href=`contacto.html?sector=${key}&lang=${en?'en':'es'}`;
 }
 choices.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.sector)));if(choices.length)choose('retail');
 const form=document.getElementById('project-brief');
 if(form){
  const business=form.elements.business,details=form.elements.details,preview=document.getElementById('brief-preview'),send=document.getElementById('brief-send');
  const sector=new URLSearchParams(location.search).get('sector');if([...form.elements.sector.options].some(o=>o.value===sector))form.elements.sector.value=sector;
  const update=()=>{const n=Number(!!business.value.trim())+Number(details.value.trim().length>=10);document.getElementById('brief-progress').textContent=t(`${n} de 2 campos completos`,`${n} of 2 fields complete`);preview.hidden=true;send.removeAttribute('href');business.setCustomValidity('');details.setCustomValidity('');};
  form.addEventListener('input',update);form.addEventListener('change',update);
  form.addEventListener('submit',e=>{e.preventDefault();business.setCustomValidity(business.value.trim()?'':t('Escribe el nombre de tu negocio.','Enter your business name.'));details.setCustomValidity(details.value.trim().length>=10?'':t('Describe el proceso con al menos 10 caracteres.','Describe the process using at least 10 characters.'));if(!form.reportValidity())return;
   const industry=form.elements.sector.selectedOptions[0].textContent.trim(),goal=form.elements.goal.selectedOptions[0].textContent.trim();
   const message=t('Hola MB AI SOLUTIONS, quiero conversar sobre mi proyecto.','Hi MB AI SOLUTIONS, I’d like to discuss my project.')+`\n\n${t('Negocio','Business')}: ${business.value.trim()}\n${t('Sector','Industry')}: ${industry}\n${t('Necesidad','Need')}: ${goal}\n\n${details.value.trim()}`;
   document.getElementById('brief-message').textContent=message;send.href=`https://wa.me/573025289834?text=${encodeURIComponent(message)}`;preview.hidden=false;preview.focus();
  });
  document.getElementById('brief-edit').addEventListener('click',()=>{preview.hidden=true;business.focus();});update();
 }
 if(document.body.dataset.page==='home'){
  const routes={'#servicios':'soluciones.html#servicios','#precios':'soluciones.html#precios','#mb-ai-agent':'soluciones.html#mb-ai-agent','#proceso':'agencia.html#proceso','#por-que':'agencia.html#por-que','#sectores':'index.html#explorar'};
  if(routes[location.hash]){const [path,hash]=routes[location.hash].split('#');location.replace(`${path}?lang=${en?'en':'es'}#${hash}`);}
 }
})();
