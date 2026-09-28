/* ==========================================================================
   Idioma y moneda por región — MB AI SOLUTIONS
   - Español + COP por defecto (Colombia y resto del mundo).
   - Inglés + USD cuando el visitante está en Estados Unidos (zona horaria).
   - ?lang=en | ?lang=es fuerza un idioma y se recuerda; el botón ES/EN
     del menú también permite cambiarlo.
   Se ejecuta ANTES que main.js/console.js/guide.js (scripts diferidos en
   orden), así las animaciones ya trabajan sobre el texto traducido.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 1. Detectar idioma ---------- */
  const KEY = 'mb-lang';
  const US_TZ = /^(America\/(New_York|Detroit|Chicago|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)|Pacific\/Honolulu)$/;

  const params = new URLSearchParams(location.search);
  let lang = params.get('lang');
  if (lang === 'en' || lang === 'es') {
    try { localStorage.setItem(KEY, lang); } catch { /* sin storage */ }
  } else {
    try { lang = localStorage.getItem(KEY); } catch { lang = null; }
    if (lang !== 'en' && lang !== 'es') {
      let tz = '';
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* sin Intl */ }
      lang = US_TZ.test(tz) ? 'en' : 'es';
    }
  }

  /* ---------- 2. Precios USD (referencia EE. UU.) ----------
     Base: COP ÷ ~4.000 × ~1,5 (ajuste de mercado) × 1,2 (impuestos incluidos), redondeado.
     Para cambiar un precio en inglés, edita solo esta tabla y EN abajo. */
  const PRICE = {
    '$900.000': '$419', '$2.500.000': '$1,139', '$5.000.000+': '$2,279+', '$1.800.000': '$839',
    '$3.000.000': '$1,379', '$500.000': '$239', '$400.000': '$179', '$150.000': '$69',
    '$1.000.000': '$479', '$1.500.000': '$719', '$2.000.000': '$899',
    '$200.000': '$95', '$350.000': '$169', '$600.000': '$275',
  };

  /* ---------- 3. Traducciones (clave = texto en español, normalizado) ---------- */
  const EN = {
    // Navegación y hero
    'Saltar al contenido': 'Skip to content',
    'Servicios': 'Services',
    'Precios': 'Pricing',
    'Cómo trabajamos': 'How we work',
    'Solicitar diagnóstico': 'Request a diagnosis',
    'Inteligencia Artificial para negocios — Yopal, Casanare': 'AI for businesses — based in Colombia, serving the U.S.',
    'Transformamos negocios con': 'Transforming businesses with',
    'Inteligencia Artificial': 'Artificial Intelligence',
    'Diseñamos e implementamos agentes inteligentes, automatizaciones, integraciones y soluciones digitales adaptadas a las necesidades de cada negocio.': 'We design and implement AI agents, automations, integrations and digital solutions tailored to each business.',
    'Ver soluciones': 'See solutions',
    // Marquee
    'Hecho para negocios como el tuyo': 'Built for businesses like yours',
    'Restaurantes': 'Restaurants', 'Boutiques': 'Boutiques', 'Ferreterías': 'Hardware stores', 'Barberías': 'Barbershops',
    'Salones de belleza': 'Beauty salons', 'Inmobiliarias': 'Real estate', 'Tiendas': 'Retail stores', 'Negocios de servicios': 'Service businesses',
    // Problemas
    'El problema': 'The problem',
    '¿Cuánto tiempo pierde tu negocio haciendo tareas que': 'How much time does your business lose on tasks that',
    'podrían automatizarse?': 'could be automated?',
    'Responder las mismas preguntas todos los días': 'Answering the same questions every day',
    'Revisar inventarios manualmente': 'Checking inventory by hand',
    'Registrar clientes uno por uno': 'Logging customers one by one',
    'Copiar información entre herramientas': 'Copying data between tools',
    'Gestionar pedidos a mano': 'Managing orders manually',
    'Responder mensajes fuera del horario': 'Replying to messages after hours',
    'Preparar reportes manualmente': 'Building reports manually',
    'Buscar información constantemente': 'Constantly searching for information',
    'Convertimos procesos repetitivos en': 'We turn repetitive processes into',
    'flujos digitales e inteligentes.': 'smart digital workflows.',
    'Quiero automatizar mi negocio': 'I want to automate my business',
    'Quiero automatizar mi negocio →': 'I want to automate my business →',
    // MB AI AGENT
    'Producto principal': 'Main product',
    'Agentes inteligentes personalizados para empresas.': 'Custom AI agents for businesses.',
    'Un agente inteligente personalizado para tu negocio que puede atender consultas, responder preguntas frecuentes, consultar información, capturar clientes, apoyar procesos comerciales y automatizar tareas repetitivas.': 'A custom AI agent for your business that can handle inquiries, answer FAQs, look up information, capture leads, support your sales process and automate repetitive tasks.',
    'Posibles aplicaciones': 'Possible uses',
    'Atención al cliente': 'Customer service', 'Preguntas frecuentes': 'FAQs', 'Información de productos': 'Product information',
    'Disponibilidad': 'Availability', 'Catálogos': 'Catalogs', 'Recepción de solicitudes': 'Request intake', 'Pedidos': 'Orders',
    'Captura de clientes': 'Lead capture', 'Clasificación de conversaciones': 'Conversation routing', 'Seguimiento': 'Follow-up',
    'Transferencia a asesores humanos': 'Handoff to human agents', 'Atención fuera del horario comercial': 'After-hours support',
    'Las funcionalidades se definen según las necesidades y el alcance de cada negocio.': 'Features are defined based on each business’s needs and scope.',
    'Desde': 'From',
    'COP': 'USD',
    'Rango orientativo: $900.000 – $2.500.000 COP · Implementaciones avanzadas: $2.500.000 – $5.000.000+ COP': 'Typical range: $419 – $1,139 USD · Advanced implementations: $1,139 – $2,279+ USD',
    'Probar la demo del agente': 'Try the agent demo',
    'en línea': 'online',
    'Hola, ¿tienen la camisa negra en talla M?': 'Hi, do you have the black shirt in size M?',
    '¡Hola! Sí, está disponible en talla M. Cuesta $89.000. ¿Quieres que un asesor te confirme el pedido?': 'Hi! Yes, it’s available in size M. It’s $29. Would you like a team member to confirm your order?',
    'Sí, porfa. ¿Hacen envíos en Yopal?': 'Yes, please. Do you ship to my area?',
    'Claro. Ya dejé tu solicitud registrada y un asesor te escribe para coordinar el envío. ✦': 'Sure. I’ve logged your request and a team member will message you to arrange shipping. ✦',
    'Ejemplo ilustrativo · boutique': 'Illustrative example · boutique',
    // Servicios
    'Servicios complementarios': 'Complementary services',
    'Todo lo que tu negocio necesita': 'Everything your business needs',
    'alrededor de la IA': 'around AI',
    'Capacidades que complementan a MB AI AGENT o funcionan por separado, según lo que necesite tu operación.': 'Capabilities that complement MB AI AGENT or work on their own, depending on what your operation needs.',
    'Automatización de procesos': 'Process automation',
    'Conectamos las herramientas que ya utiliza tu negocio para reducir tareas repetitivas y mejorar sus procesos.': 'We connect the tools your business already uses to cut repetitive work and improve your processes.',
    'Formularios': 'Forms', 'Correo': 'Email', 'Notificaciones': 'Notifications', 'Reportes': 'Reports', 'Flujos internos': 'Internal workflows',
    '$500.000 COP': '$239 USD',
    'Digitalización de negocios': 'Business digitalization',
    'Convertimos procesos manuales y desorganizados en sistemas digitales fáciles de administrar.': 'We turn manual, messy processes into digital systems that are easy to manage.',
    'Inventario': 'Inventory', 'Clientes': 'Customers', 'Ventas': 'Sales', 'Bases de datos': 'Databases', 'Dashboards básicos': 'Basic dashboards',
    'Hojas': 'Sheets', 'Pagos': 'Payments',
    'Integraciones y conexiones': 'Integrations',
    'Conectamos las herramientas y plataformas de tu negocio para que la información fluya automáticamente.': 'We connect your business tools and platforms so information flows automatically.',
    'IA': 'AI', 'Herramientas empresariales': 'Business tools', 'Sistemas existentes': 'Existing systems',
    '$400.000 COP': '$179 USD',
    'Idea': 'Idea', 'Sistema': 'System',
    'Desarrollo de soluciones digitales': 'Custom digital solutions',
    'Cuando una empresa necesita una solución tecnológica propia, desarrollamos sistemas personalizados que se integran con sus procesos y automatizaciones.': 'When a business needs its own technology, we build custom systems that plug into its processes and automations.',
    'Ver precios orientativos': 'See reference prices',
    'Landing page': 'Landing page', 'desde $500.000': 'from $239',
    'Web empresarial': 'Business website', 'desde $1.000.000': 'from $479',
    'Catálogo / e-commerce': 'Catalog / e-commerce', 'desde $1.500.000': 'from $719',
    'Dashboard / sistema': 'Dashboard / system', 'desde $2.000.000': 'from $899',
    'Aplicación o sistema personalizado': 'Custom app or system', 'desde $3.000.000': 'from $1,379',
    'Diagnóstico inicial gratuito': 'Free initial diagnosis',
    'Consultoría e implementación de IA': 'AI consulting & implementation',
    'Analizamos los procesos de tu negocio e identificamos oportunidades donde la Inteligencia Artificial y la automatización pueden generar mejoras reales.': 'We analyze your business processes and find where AI and automation can drive real improvements.',
    'Diagnóstico': 'Diagnosis', 'Estrategia': 'Strategy', 'Selección de herramientas': 'Tool selection', 'Implementación': 'Implementation',
    'Capacitación': 'Training', 'Documentación': 'Documentation',
    'Diagnóstico desde': 'Diagnosis from',
    '$150.000 COP': '$69 USD',
    'Diagnóstico inicial gratuito sujeto a disponibilidad.': 'Free initial diagnosis, subject to availability.',
    'Soporte y optimización': 'Support & optimization',
    'Mantenimiento, ajustes y mejoras para que tus agentes y automatizaciones sigan funcionando bien con el tiempo.': 'Maintenance, tweaks and improvements so your agents and automations keep running well over time.',
    '$200.000 COP/mes': '$95 USD/mo',
    'Ver planes MB AI CARE': 'See MB AI CARE plans',
    // Sectores
    'Sectores': 'Industries',
    'Soluciones para negocios': 'Solutions for businesses',
    'como el tuyo': 'like yours',
    'Empezamos en Yopal, Casanare, con soluciones adaptadas a cada tipo de operación.': 'Solutions adapted to each type of operation — delivered remotely to U.S. businesses.',
    'Pedidos, consultas, menú, horarios y atención.': 'Orders, questions, menu, hours and service.',
    'Productos, tallas, colores, precios y disponibilidad.': 'Products, sizes, colors, prices and availability.',
    'Catálogos, referencias, disponibilidad y solicitudes.': 'Catalogs, part numbers, availability and requests.',
    'Barberías y salones': 'Barbershops & salons',
    'Citas, servicios, horarios y recordatorios.': 'Appointments, services, hours and reminders.',
    'Captación y clasificación de prospectos.': 'Lead capture and qualification.',
    'Otros negocios': 'Other businesses',
    'Soluciones adaptadas a cada operación.': 'Solutions tailored to each operation.',
    // Proceso
    '¿Cómo trabajamos?': 'How do we work?',
    'Del diagnóstico': 'From diagnosis',
    'al funcionamiento': 'to go-live',
    'Implementaciones normalmente de 1 a 4 semanas, dependiendo del alcance, la complejidad y las integraciones requeridas. El plazo definitivo se establece después del diagnóstico.': 'Implementations usually take 1 to 4 weeks, depending on scope, complexity and required integrations. The final timeline is set after the diagnosis.',
    'Entendemos cómo funciona actualmente tu negocio.': 'We learn how your business works today.',
    'Diseño': 'Design',
    'Identificamos qué procesos podemos digitalizar o automatizar.': 'We identify which processes we can digitize or automate.',
    'Construimos y configuramos la solución.': 'We build and configure the solution.',
    'Pruebas': 'Testing',
    'Validamos los flujos antes de ponerlos en funcionamiento.': 'We validate every workflow before it goes live.',
    'Enseñamos a tu equipo cómo utilizar el sistema.': 'We teach your team how to use the system.',
    'Soporte': 'Support',
    'Acompañamos la evolución de la solución.': 'We support the solution as it evolves.',
    // Precios
    'Paquetes y precios': 'Packages & pricing',
    'Precios claros,': 'Clear pricing,',
    'según tu alcance': 'based on your scope',
    'Referencias para el mercado de Yopal. El precio final depende del alcance, la complejidad, las herramientas y las integraciones requeridas.': 'Reference prices for the U.S. market, in USD, taxes included. The final price depends on scope, complexity, tools and required integrations.',
    'Para negocios que están comenzando.': 'For businesses just getting started.',
    'Puede incluir:': 'May include:',
    'Digitalización básica': 'Basic digitalization', 'Automatización sencilla': 'Simple automation', 'Agente IA básico': 'Basic AI agent',
    'Integración inicial': 'Initial integration', 'Más completo': 'Most complete',
    'Para empresas que necesitan una solución más completa.': 'For companies that need a more complete solution.',
    'Agente IA': 'AI agent', 'Automatizaciones': 'Automations', 'Base de información': 'Knowledge base', 'Gestión de clientes': 'Customer management',
    'Integraciones': 'Integrations', 'Flujos comerciales': 'Sales workflows',
    'Para soluciones personalizadas.': 'For custom solutions.',
    'Agentes avanzados': 'Advanced agents', 'Múltiples automatizaciones': 'Multiple automations', 'Conexión con otros sistemas': 'Connections to other systems',
    'Sistemas personalizados': 'Custom systems', 'Aplicaciones': 'Applications', 'Integraciones avanzadas': 'Advanced integrations',
    'Soporte recurrente': 'Ongoing support',
    'Mantenimiento y optimización mensual para que tu solución siga funcionando y mejorando.': 'Monthly maintenance and optimization so your solution keeps running and improving.',
    'Según el plan, incluye distintos niveles de:': 'Depending on the plan, includes different levels of:',
    'Mantenimiento': 'Maintenance', 'Ajustes': 'Adjustments', 'Actualización de información': 'Content updates', 'Optimización': 'Optimization',
    'Ajustes de agentes': 'Agent tuning', 'Mantenimiento de automatizaciones': 'Automation maintenance', 'Revisión periódica': 'Periodic reviews',
    'Soporte técnico': 'Technical support',
    'Los detalles exactos dependen del plan contratado.': 'Exact details depend on the plan you choose.',
    'COP/mes': 'USD/mo',
    'Hablar con MB AI SOLUTIONS': 'Talk to MB AI SOLUTIONS',
    'Plazos:': 'Timelines:',
    'implementaciones normalmente de 1 a 4 semanas, dependiendo del alcance, la complejidad y las integraciones requeridas. El plazo definitivo se establece después del diagnóstico.': 'implementations usually take 1 to 4 weeks, depending on scope, complexity and required integrations. The final timeline is set after the diagnosis.',
    'Servicios de terceros:': 'Third-party services:',
    'pueden generar costos adicionales según el proveedor y el nivel de uso (proveedores de IA, WhatsApp/Meta, hosting, dominios, automatizadores y servicios en la nube). Se cobran por separado.': 'may add costs depending on the provider and usage (AI providers, WhatsApp/Meta, hosting, domains, automation platforms and cloud services). They are billed separately.',
    // Por qué
    'Por qué MB AI SOLUTIONS': 'Why MB AI SOLUTIONS',
    'Un equipo pequeño, experto y': 'A small, expert and',
    'rápido': 'fast team',
    'Trato directo con el fundador': 'Work directly with the founder',
    'Sin intermediarios ni burocracia de agencia grande.': 'No middlemen, no big-agency red tape.',
    'Implementación ágil': 'Fast implementation',
    'Normalmente de 1 a 4 semanas, según el alcance. Primero una versión que funcione.': 'Usually 1 to 4 weeks, depending on scope. A working version first.',
    'Hablamos tu idioma': 'We speak your language',
    'Resultados de negocio, no jerga técnica.': 'Business results, not tech jargon.',
    'Precios pensados para pymes': 'Pricing built for small businesses',
    'Referencias claras desde el inicio, adaptadas al mercado de Yopal.': 'Clear reference prices from day one.',
    // Consola
    'Pruébalo tú mismo': 'Try it yourself',
    'Un equipo pequeño.': 'A small team.',
    'Resultados de otro nivel.': 'Next-level results.',
    'Somos pocos, expertos y rápidos — y esto es una muestra de lo que construimos en semanas, no en meses. Tócalo, pregúntale, ponlo a prueba.': 'We’re small, expert and fast — and this is a sample of what we build in weeks, not months. Tap it, ask it, put it to the test.',
    'Asistente con IA real (Google Gemini): responde solo sobre MB AI SOLUTIONS y puede equivocarse. No compartas datos personales. Las preguntas sugeridas tienen respuestas preparadas.': 'Real AI assistant (Google Gemini): it only talks about MB AI SOLUTIONS and can make mistakes. Don’t share personal data. Suggested questions have prepared answers.',
    'Quiero uno así en mi negocio': 'I want one for my business',
    'EN LÍNEA': 'ONLINE', 'IA REAL': 'REAL AI', 'NODO: YOPAL': 'NODE: YOPAL',
    'Hola, soy el asistente de MB AI SOLUTIONS. Elige una pregunta o escríbeme la tuya.': 'Hi, I’m the MB AI SOLUTIONS assistant. Pick a question or type your own.',
    '✦ Esta IA es real: pruébala': '✦ This AI is real: try it',
    'Diseña un plan de IA para mi negocio': 'Design an AI plan for my business',
    '¿Qué harías por mi restaurante?': 'What would you do for my restaurant?',
    '¿Atiendes de noche?': 'Do you work at night?',
    '¿Cuánto cuesta?': 'How much does it cost?',
    '¿Necesito saber de tecnología?': 'Do I need to be tech-savvy?',
    'Escríbele al asistente': 'Message the assistant',
    // CTA y footer
    'Siguiente paso': 'Next step',
    '¿Hablamos de': 'Shall we talk about',
    'tu negocio?': 'your business?',
    'Cuéntanos cómo funciona hoy tu negocio y te mostramos qué se puede automatizar, cuánto costaría y en cuánto tiempo.': 'Tell us how your business runs today and we’ll show you what can be automated, how much it would cost and how long it would take.',
    'Respuesta directa del fundador · Yopal, Casanare': 'Direct reply from the founder · Based in Colombia',
    'Inteligencia Artificial.': 'Artificial Intelligence.',
    'Ayudamos a negocios a automatizar y digitalizar su operación mediante IA, integraciones y desarrollo tecnológico.': 'We help businesses automate and digitize their operations with AI, integrations and custom technology.',
    'Empresa': 'Company', 'Por qué nosotros': 'Why us', 'Prueba nuestra IA': 'Try our AI', 'Propuesta de negocio': 'Business proposal',
    'Contacto': 'Contact',
    'Yopal, Casanare, Colombia': 'Yopal, Colombia · Serving the U.S. remotely',
    '© 2026 MB AI SOLUTIONS · Todos los derechos reservados': '© 2026 MB AI SOLUTIONS · All rights reserved',
    'Desarrollo con AI': 'Built with AI',
    '✦ Prueba nuestra IA': '✦ Try our AI',
    '¿Hablamos?': 'Let’s talk?',
    // Atributos
    'MB AI SOLUTIONS, ir al inicio': 'MB AI SOLUTIONS, go to top',
    'Abrir menú': 'Open menu', 'Cerrar menú': 'Close menu', 'Principal': 'Main',
    'Bajar a la siguiente sección': 'Scroll to next section',
    'Nichos que atendemos': 'Industries we serve',
    'Espacio de trabajo de MB AI SOLUTIONS con el logo del colibrí iluminado en la pared': 'MB AI SOLUTIONS workspace with the illuminated hummingbird logo on the wall',
    'Conversación con el asistente': 'Conversation with the assistant',
    'Preguntas sugeridas': 'Suggested questions',
    'Escríbele al asistente…': 'Message the assistant…',
    'Enviar pregunta': 'Send question',
    'MB AI SOLUTIONS, volver al inicio': 'MB AI SOLUTIONS, back to top',
    'Volver arriba': 'Back to top',
    'Prueba nuestra IA: ir a la consola del asistente': 'Try our AI: go to the assistant console',
    'Escríbenos por WhatsApp': 'Message us on WhatsApp',
    'Pie de página': 'Footer',
    // Textos generados por JS (console.js / guide.js)
    'TÚ': 'YOU', 'ANALIZANDO…': 'ANALYZING…', 'RESPONDIENDO': 'RESPONDING', 'DISEÑANDO PLAN…': 'DESIGNING PLAN…', 'PLAN IA': 'AI PLAN',
    'Con MB AI AGENT atendería a tus clientes mientras tú cocinas: muestro el menú y los horarios, recibo pedidos y le paso a tu equipo lo que necesite una persona. Las funciones exactas las definimos contigo en el diagnóstico.': 'With MB AI AGENT I’d serve your customers while you cook: I share the menu and hours, take orders and pass anything that needs a person to your team. We define the exact features with you in the diagnosis.',
    'Sí. No duermo ni tomo vacaciones: respondo a las 3 de la mañana igual que a las 3 de la tarde. Si algo necesita a una persona, lo dejo anotado para que tu equipo lo vea al llegar.': 'Yes. I don’t sleep or take vacations: I answer at 3 a.m. just like at 3 p.m. If something needs a person, I log it so your team sees it when they come in.',
    'MB AI AGENT arranca desde $900.000 COP y las automatizaciones desde $500.000 COP. El precio final depende del alcance y las integraciones; en el diagnóstico te damos el valor exacto y el plazo, normalmente de 1 a 4 semanas.': 'MB AI AGENT starts from $419 USD and automations from $239 USD. The final price depends on scope and integrations; in the diagnosis we give you the exact price and timeline, usually 1 to 4 weeks.',
    'Para nada. Si sabes usar WhatsApp, ya sabes usarme. Nosotros instalamos, conectamos y probamos todo contigo. Tú solo nos cuentas cómo funciona tu negocio.': 'Not at all. If you can use WhatsApp, you can use me. We install, connect and test everything with you. You just tell us how your business works.',
    'Buena pregunta. Esta es solo una demostración, así que no tengo esa respuesta aquí. Escríbenos por WhatsApp y te respondemos de verdad, con tu caso.': 'Good question. This is just a demo, so I don’t have that answer here. Message us on WhatsApp and we’ll give you a real answer for your case.',
    'Ej: panadería, clínica dental, taller de motos…': 'E.g. bakery, dental clinic, auto repair shop…',
    'Esta es una idea base; en el diagnóstico gratuito la ajustamos a tu negocio.': 'Here’s a starting point; we’ll tailor it to your business in the free diagnosis.',
    'Atención 24/7 en WhatsApp': '24/7 WhatsApp support',
    'Un asistente responde preguntas frecuentes y toma pedidos o citas, incluso de noche.': 'An assistant answers FAQs and takes orders or bookings, even at night.',
    'Recordatorios automáticos': 'Automatic reminders',
    'Tus clientes reciben avisos de citas, pagos o pedidos sin que tengas que escribir uno por uno.': 'Customers get appointment, payment or order reminders without you writing each one.',
    'Seguimiento a clientes': 'Customer follow-up',
    'Mensajes de seguimiento después de cada compra o visita para que vuelvan.': 'Follow-up messages after each purchase or visit so they come back.',
    'Quiero este plan para mi negocio →': 'I want this plan for my business →',
    '¡Con gusto! Cuéntame qué negocio tienes y te armo un primer plan con 3 ideas. Por ejemplo: panadería, clínica dental o taller de motos.': 'Happy to! Tell me what kind of business you have and I’ll put together a first plan with 3 ideas. For example: bakery, dental clinic or auto repair shop.',
    'Tengo una panadería, ¿qué harías por mí?': 'I own a bakery, what would you do for me?',
    '¿Puedes agendar citas en mi clínica?': 'Can you book appointments for my clinic?',
    '¿Cómo me ayudas a no perder clientes?': 'How can you help me stop losing customers?',
    'Tengo un gimnasio, ¿qué automatizarías?': 'I run a gym, what would you automate?',
    '✦ ¡Pruébala! Pregúntale lo que quieras': '✦ Try it! Ask it anything',
    'Pruébala: escribe tu pregunta a la IA': 'Try it: type your question to the AI',
  };

  // Mensajes de WhatsApp (clave = texto en español del parámetro ?text=)
  const WA = {
    'Hola MB AI SOLUTIONS, quiero solicitar un diagnóstico para mi negocio.': 'Hi MB AI SOLUTIONS, I’d like to request a diagnosis for my business.',
    'Hola MB AI SOLUTIONS, quiero automatizar mi negocio.': 'Hi MB AI SOLUTIONS, I want to automate my business.',
    'Hola MB AI SOLUTIONS, me interesa MB AI AGENT para mi negocio. Quiero solicitar un diagnóstico.': 'Hi MB AI SOLUTIONS, I’m interested in MB AI AGENT for my business. I’d like to request a diagnosis.',
    'Hola MB AI SOLUTIONS, me interesa el paquete START. Quiero solicitar un diagnóstico.': 'Hi MB AI SOLUTIONS, I’m interested in the START package. I’d like to request a diagnosis.',
    'Hola MB AI SOLUTIONS, me interesa el paquete BUSINESS. Quiero solicitar un diagnóstico.': 'Hi MB AI SOLUTIONS, I’m interested in the BUSINESS package. I’d like to request a diagnosis.',
    'Hola MB AI SOLUTIONS, me interesa el paquete CUSTOM. Quiero solicitar un diagnóstico.': 'Hi MB AI SOLUTIONS, I’m interested in the CUSTOM package. I’d like to request a diagnosis.',
    'Hola MB AI SOLUTIONS, quiero información sobre los planes MB AI CARE.': 'Hi MB AI SOLUTIONS, I’d like information about the MB AI CARE plans.',
    'Hola, probé la consola de su web y quiero un asistente así para mi negocio.': 'Hi, I tried the console on your website and I want an assistant like that for my business.',
  };

  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const t = (s) => {
    if (lang !== 'en' || typeof s !== 'string') return s;
    const k = norm(s);
    return EN[k] ?? PRICE[k] ?? s;
  };

  // API global para console.js, guide.js y main.js
  window.MB_LANG = lang;
  window.MB_T = t;
  document.documentElement.lang = lang === 'en' ? 'en' : 'es-CO';

  /* ---------- 4. Aplicar traducción a la página ---------- */
  if (lang === 'en') {
    document.title = 'MB AI SOLUTIONS — AI agents & automation for businesses';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'MB AI SOLUTIONS helps businesses automate and digitize their operations with AI agents, automations, integrations and custom development. Prices in USD. Request a diagnosis.';

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && /^(SCRIPT|STYLE)$/.test(n.parentElement.tagName)
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const missing = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const raw = n.nodeValue;
      const k = norm(raw);
      if (!k) continue;
      const tr = EN[k] ?? PRICE[k];
      if (tr !== undefined) {
        // conserva el espacio inicial/final original
        const lead = /^\s/.test(raw) ? ' ' : '';
        const trail = /\s$/.test(raw) ? ' ' : '';
        n.nodeValue = lead + tr + trail;
      } else if (/[a-záéíóúñ¿¡]/i.test(k) && !/^(MB AI|MB·IA|WhatsApp|Google|CRM|START|BUSINESS|CUSTOM|BASIC|PRO|CARE|AGENT|Boutiques|Landing page|Google Sheets|Dashboards|Idea)/.test(k)) {
        missing.push(k);
      }
    }
    ['aria-label', 'placeholder', 'alt', 'title'].forEach((a) => {
      document.querySelectorAll(`[${a}]`).forEach((el) => {
        const v = el.getAttribute(a);
        if (EN[norm(v)]) el.setAttribute(a, EN[norm(v)]);
      });
    });
    document.querySelectorAll('a[href*="wa.me/"]').forEach((a) => {
      const [base, query = ''] = a.href.split('?');
      const msg = new URLSearchParams(query).get('text');
      // encodeURIComponent: espacios como %20 (con '+' WhatsApp muestra signos más)
      if (msg && WA[msg]) a.href = `${base}?text=${encodeURIComponent(WA[msg])}`;
    });
    if (missing.length && params.has('i18n-debug')) console.warn('[i18n] Sin traducir:', missing);
  }

  /* ---------- 5. Botón ES / EN ---------- */
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    const other = lang === 'en' ? 'es' : 'en';
    btn.textContent = other.toUpperCase();
    btn.setAttribute('aria-label', lang === 'en' ? 'Ver la página en español' : 'View this page in English');
    btn.setAttribute('lang', other);
    btn.addEventListener('click', () => {
      const url = new URL(location.href);
      url.searchParams.set('lang', other);
      location.href = url.toString();
    });
  });
})();
