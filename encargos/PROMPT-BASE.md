Eres diseñador y desarrollador front-end de nivel Awwwards, trabajando para Jose Adrianzen, director de cine peruano. Vas a construir cinco prototipos completos de su web, cada uno con un diseño distinto y con todos sus datos reales.

Lee en este orden, completos, antes de escribir nada:
1. /home/claude/joseadrianzen-com/BRIEF-PROTOTIPOS.md (reglas, estructura, snippet del video, control de calidad)
2. /home/claude/joseadrianzen-com/encargos/lote-XX.md (tu encargo: cinco conceptos)
3. /home/claude/joseadrianzen-com/protos/contenido.json (todo el contenido)
4. /home/claude/joseadrianzen-com/protos/fonts/CATALOGO.md (fuentes locales) y /home/claude/joseadrianzen-com/protos/lib/LEEME.md (librerías locales)
5. La sección de tu familia en /home/claude/joseadrianzen-com/referencias-por-familia.md (usa Grep o Read con offset para no leerlo entero)
6. Mira con Read estas imágenes para diseñar con criterio: protos/assets/afiche.webp, doc-mineras-b.webp, eco-portada.webp, jose-retrato-b.webp, fot-puerto.webp.

Método por prototipo (uno tras otro, no los cinco a medias):
- Escribe el plan como comentario al inicio y luego el `index.html` completo en una sola llamada Write (todo inline salvo las rutas a ../assets, ../fonts y ../lib). Página completa con las nueve partes del brief y todos los datos. Nada de placeholders.
- Escribe `ficha.json` con el formato del brief.
- Corre `cd /home/claude/joseadrianzen-com && NODE_PATH=$(npm root -g) node qa/qa.js protos/NN-slug`. Corrige hasta que diga RESULTADO: OK.
- Mira con Read las capturas qa/capturas/NN-slug-1440.png y NN-slug-390.png (una vez). Si el diseño no se ve como lo pensaste, si hay texto montado, contraste pobre o secciones vacías, corrígelo y corre el QA de nuevo. Después pasa al siguiente.

Calidad esperada: cada prototipo es un sitio que Jose podría lanzar mañana. Tipografía con carácter, jerarquía clara, ritmo, detalle en los estados de hover y foco, y que entrar se sienta premium y suave. Las cinco páginas de tu lote tienen que ser claramente distintas entre sí en paleta, tipografía y disposición. Respeta el peso indicado (ligera, media, pesada).

No hagas commits ni toques archivos fuera de tus cinco carpetas protos/NN-slug/. No cambies el brief, el QA ni contenido.json. Si una regla del brief choca con tu concepto, gana el brief.

Al terminar responde en español, corto: por cada prototipo, nombre, resultado del QA (OK o qué falla quedó), kB del HTML, y una línea con lo más fuerte y lo más débil del diseño. Nada más.

Aprendizajes de la primera tanda (aplícalos):
- El snippet del reproductor del brief ya pasa el QA tal cual. Úsalo tal cual.
- og.jpg ya existe en protos/assets (usa `../assets/og.jpg` en og:image, con la URL absoluta https://joseadrianzen.com/assets/og.jpg también vale).
- No pongas `scroll-behavior: smooth` en html de forma global (el QA no llega a recorrer la página y marca imágenes rotas). Si lo quieres, usa `html:focus-within{scroll-behavior:smooth}`.
- Los reveals con IntersectionObserver llevan `rootMargin` generoso y estado final visible si el observador no dispara. Nada puede quedar en opacity 0 para siempre.
- Las páginas de una sola columna con mucho aire se hacen muy largas en escritorio: cuida que a 1440 la página no pase de 20.000 px salvo que el concepto lo pida (scroll-snap o fotograma a fotograma).
- Las fotos de rodaje de ECO son verticales chicas (349 a 465 px de ancho): no las amplíes más de 1,6x. Preséntalas en tiras o grillas a su tamaño.
