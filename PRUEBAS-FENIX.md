# Identidad fénix: prueba local

Actualizado: 2 de octubre de 2026. Esta lista describe comprobaciones manuales pendientes de ejecutar al publicar; no es un certificado de pruebas realizadas.

Desde la raíz del proyecto, ejecuta:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre http://localhost:8000/. No requiere npm ni compilación.

1. En una pestaña nueva, comprueba la intro, el botón **Entrar →** y la salida al terminar el video. También se puede saltar con Escape.
2. Recarga: la intro solo aparece una vez por sesión. Para repetirla, ejecuta `sessionStorage.removeItem('mb-phoenix-intro')` en la consola y recarga.
3. Desplázate por el hero: deben aparecer «Todo negocio puede renacer», «El fénix emerge» y el eslogan con el CTA al WhatsApp **573025289834**. Comprueba también el recorrido inverso.
4. En DevTools, prueba un móvil vertical y horizontal. El canvas recorta el frame para cubrir la pantalla; verifica el menú y el CTA.
5. En Rendering, activa `prefers-reduced-motion: reduce`: no hay intro ni recorrido de 300vh; aparece el frame final y el CTA.
6. Bloquea `*intro-fenix-web.mp4*` en Network y repite la intro: debe cerrarse ante el error. Para probar una reproducción detenida, pausa el video desde la consola: `document.querySelector('.phoenix-intro video').pause()`. El overlay desaparece antes de 12 segundos desde su creación.
7. Bloquea los CDN: el hero, la intro y el menú deben seguir funcionando. Sin JavaScript, se conserva una imagen, el eslogan y el CTA, sin overlay.

## Recursos y publicación

El logo principal es `assets/logo-fenix-turquesa-transparente.png`, proporcionado por el usuario, de 1600 × 1600 píxeles y con canal alfa real. Se conserva como variante turquesa. El logo principal actual es `assets/logo-fenix-fullcolor-transparente.png` (1254 × 1254), utilizado en navbar, hero, tarjetas, avatar, footer, favicon e icono de Apple. Sustituye al WebP provisional; no se aplican modos de mezcla.

El video y los 80 frames se copiaron desde la carpeta de originales a `assets/intro-fenix-web.mp4` y `assets/frames/`. Las rutas del sitio son relativas y compatibles con un subdirectorio de GitHub Pages. Incluye estos recursos nuevos en el commit; los originales no son necesarios para ejecutar el sitio.

Se conservan los archivos anteriores. El hero ahora utiliza `assets/frames-hd/frame001.webp` … `frame080.webp`, extraídos del MP4 a su resolución nativa de 1280 × 720 y calidad WebP 92. Se cargan por proximidad al scroll, con tres solicitudes simultáneas y un máximo de 18 imágenes decodificadas en caché. Los frames originales de 768 × 432 no se eliminan.

El vuelo original se recuperó en `phoenixFlight()` dentro de `js/main.js`, con el PNG del fénix: despega al salir de la secuencia cinematográfica, sigue el scroll entre secciones con inclinación, flotación, aleteo y estela, y aterriza en el CTA final. Comprueba el recorrido hacia abajo y hacia arriba, en escritorio y móvil. Con movimiento reducido se oculta el vuelo.

El personaje del vuelo ahora utiliza `assets/fenix-vuelo-transparente.png`: una ilustración generada a partir del estilo del logo full color, sin letras y con transparencia real. Cuatro capas visuales del mismo recurso permiten articular ambas alas y la cola. El aleteo y las chispas turquesa/ámbar reaccionan a la velocidad del scroll, con oscilación de trayectoria, inclinación en curvas y cambio de orientación. El ticker pausa esa actualización si la página está oculta, el personaje sale de su recorrido o se activa movimiento reducido. Los logos de marca se conservan.

La intro presenta el video completo sin recortarlo ni ampliar su caja más allá de 1280 × 720 píxeles CSS; en pantallas verticales aparecen márgenes navy. El hero conserva el recorte de pantalla completa solicitado. La extracción nativa mejora la resolución de los frames, pero no añade detalle al video: para mayor nitidez en pantallas grandes hace falta un original de mayor resolución. El MP4 no se ha recomprimido.

La intro y la secuencia viven en `js/phoenix.js` y `css/phoenix.css`, sin librerías adicionales. Las animaciones restantes mantienen las dependencias existentes.

## Marco multicolor de la intro

`css/intro-universe.css` añade auroras turquesa, azul, violeta y ámbar, circuitos, partículas, un borde luminoso y tarjetas animadas de agentes IA, automatizaciones y datos. El marco está fuera del video y no modifica el MP4. En móvil las tarjetas pasan debajo y el logo arriba; en horizontal compacto se simplifica para dejar espacio al video y al botón Entrar. No añade librerías.

`assets/logo-fenix-fullcolor-transparente.png` es una edición con fondo transparente del full color original, conservado en `assets/logo-fenix-v2-fullcolor.webp`. Se usa en el marco; el mismo logo multicolor se utiliza ahora en la navegación y el resto del sitio; la variante turquesa se conserva como recurso.

Para ver el marco otra vez, borra `mb-phoenix-intro` de sessionStorage y recarga. Comprueba escritorio, móvil vertical y horizontal, el botón Entrar y Escape. Con movimiento reducido se omite la intro como antes.

## Idioma y precios

Comprueba `?lang=es` y `?lang=en`, el selector CO/US en escritorio y móvil, la persistencia al recargar, precios COP/USD y mensajes de WhatsApp. En inglés, START debe mostrar $419, BUSINESS $839 y CUSTOM $1,379 USD. Los precios son referencias fijas, no cotizaciones de divisas en vivo.

## Web de agencia

- Visita Inicio, Soluciones, La agencia y Contacto en escritorio y móvil. Comprueba la página activa y los enlaces del pie.
- Cambia el sector en el explorador; verifica el flujo y que la selección llegue a Contacto.
- Completa el formulario, prepara la consulta, edítala y comprueba la vista previa y el enlace a WhatsApp. No se envía automáticamente.
- Abre el menú móvil con teclado, recorre sus enlaces con Tab y ciérralo con Escape.
- Abre las preguntas frecuentes y prueba ambos idiomas. Verifica START $900.000 COP / $419 USD.
- Bloquea los CDN: menú, explorador, formulario y preguntas frecuentes deben seguir funcionando.

### Verificación realizada el 2 de octubre de 2026

Revisión en Edge: las cuatro páginas en escritorio (1440 × 1000) y móvil (390 × 844), sin desbordamiento horizontal. Se comprobaron español/inglés, precios COP/USD, selección de sector, transferencia al formulario, vista previa y edición, preguntas frecuentes y recorrido circular del menú con Tab/Shift+Tab y cierre con Escape. Se probaron las interacciones con los CDN bloqueados y movimiento reducido; la consola conservó su respuesta preparada de precios con movimiento normal. Se revisaron capturas y se corrigió la proporción del logo de la agencia. Estructura HTML, IDs únicos, enlaces locales, anclas, sintaxis JavaScript y sitemap validados. Estas comprobaciones locales no verifican la disponibilidad remota de Gemini ni el despliegue de GitHub Pages.
