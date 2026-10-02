# Fénix y entrada interactiva: verificación local

Actualizado: 2 de octubre de 2026.

## Abrir la web

Desde la raíz del proyecto:

```powershell
python -m http.server 5510 --bind 127.0.0.1
```

Abre `http://localhost:5510/?lang=es` en una pestaña nueva. La experiencia no requiere npm ni compilación.

## Portal de entrada

1. La entrada presenta una pregunta, tres objetivos y el botón **Entrar con el fénix**. El fénix aletea en el portal; el texto explica beneficios operativos concretos.
2. Cambia cada objetivo: deben actualizarse el título, las tres etapas y el resultado del ejemplo. Son aplicaciones ilustrativas, no automatizaciones ejecutadas en el negocio del visitante.
3. Activa el portal: las opciones se deshabilitan, aparece el estado de apertura y el fénix vuela durante el túnel. En 1,8 segundos comienza el cierre y aparece la presentación de la agencia con el siguiente paso correspondiente. La transición no depende de descargar un video.
4. Usa **Ir directamente a la web** o Escape, incluso durante el túnel. La página debe recuperar el foco y quedar utilizable.
5. Recarga: no se repite en la misma sesión. Para probarlo de nuevo, ejecuta `sessionStorage.removeItem('mb-portal-entry-v2')` y recarga sin fragmento en la URL.
6. Repite con `?lang=en`: toda la entrada, los ejemplos y el siguiente paso deben estar en inglés.
7. Activa `prefers-reduced-motion: reduce`: puedes elegir un objetivo, pero la entrada ocurre sin vuelo ni túnel animado. Cambiar esta preferencia durante el túnel debe terminar la transición.
8. Prueba teclado: Tab y Shift+Tab permanecen entre los controles del diálogo; Escape cierra. El contenido de fondo queda inactivo solo mientras la entrada está abierta.
9. Bloquea los CDN y las imágenes del portal: la elección, los controles y la entrada deben continuar funcionando. Comprueba también con almacenamiento de sesión bloqueado.
10. Los enlaces con fragmento, como `#consola-ia` y las antiguas rutas `#precios` o `#servicios`, acceden a su contenido sin presentar el portal.

## Hero y recursos de marca

El logo principal es `assets/logo-fenix-fullcolor-transparente.png` (1254 × 1254). La variante turquesa se conserva. El portal y el vuelo de la web utilizan `assets/fenix-vuelo-transparente.png`, articulado en alas, cuerpo y cola con capas CSS. No se modificaron los logos ni la paleta.

El hero conserva los 80 frames de `assets/frames-hd/`, extraídos a 1280 × 720. Se cargan por proximidad al scroll, con tres solicitudes simultáneas y un máximo de 18 imágenes decodificadas en caché. Comprueba el recorrido hacia arriba y abajo, en móvil vertical y horizontal. Con movimiento reducido se muestra el frame final.

El video `assets/intro-fenix-web.mp4` y los frames anteriores se conservan como recursos históricos. La nueva entrada no solicita ni reproduce ese video. `js/entry.js` y `css/intro-universe.css` controlan el portal; `js/phoenix.js` conserva la secuencia del hero sin nuevas dependencias.

## Web de agencia

- Visita Inicio, Soluciones, La agencia y Contacto en escritorio y móvil. Comprueba la página activa y los enlaces del pie.
- Cambia el sector en el explorador; verifica el flujo y que la selección llegue a Contacto.
- Completa el formulario, prepara la consulta, edítala y comprueba la vista previa y el enlace a WhatsApp. No se envía automáticamente.
- Abre el menú móvil con teclado, recorre sus enlaces con Tab y ciérralo con Escape.
- Abre las preguntas frecuentes y prueba ambos idiomas. Verifica START $900.000 COP / $419 USD.
- Bloquea los CDN: menú, explorador, formulario y preguntas frecuentes deben seguir funcionando.

Las pruebas locales no verifican la disponibilidad remota de Gemini ni el despliegue de GitHub Pages.

## Verificación realizada

Se revisaron capturas de escritorio (1440 × 900 y 1366 × 768), móvil (390 × 844) y horizontal (844 × 390). El botón de entrada queda visible sin desplazamiento en las tres vistas verticales/escritorio comprobadas. Se verificaron selección de objetivo, transición, llegada contextual, persistencia por sesión, inglés, movimiento reducido, Tab/Shift+Tab, Escape durante el vuelo, imágenes fallidas, almacenamiento bloqueado y enlaces directos. Las interacciones funcionan con los CDN bloqueados, sin errores de JavaScript. La entrada no solicita ningún MP4. Sintaxis JavaScript y diferencias de Git comprobadas.
