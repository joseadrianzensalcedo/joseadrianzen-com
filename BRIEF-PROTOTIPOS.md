# Brief para construir prototipos de joseadrianzen.com

Léelo completo antes de escribir una línea. Cada prototipo es una web completa, con todos los datos reales de Jose, en un diseño distinto.

## Quién es y qué hay

Jose Adrianzen (sin tilde, siempre), director y productor de cine peruano, Lima. Dos obras: el documental premiado "Entre polvo y sueños" (mujeres mineras del Perú, 2025, 2K) y el cortometraje "ECO" (thriller psicológico, 2023, 6K, aún sin estrenar). Más fotografía propia, bio, blog y contacto.

Todo el contenido está en `protos/contenido.json`. Úsalo tal cual, no inventes ni un dato, ni un premio, ni una fecha. Las imágenes están en `protos/assets/` (WebP) y las fuentes locales en `protos/assets/fonts/`. Puedes mirar las imágenes con Read para diseñar con criterio (afiche.webp, doc-mineras-b.webp, eco-portada.webp, jose-retrato-b.webp son las claves).

## Qué tiene que tener cada prototipo (todas las secciones, siempre)

1. Portada: nombre "Jose Adrianzen" y la línea "Director · Productor". Nada más de texto en la portada, salvo navegación.
2. Documental "Entre polvo y sueños": reproductor (ver snippet), golpe, sinopsis, ficha corta y ficha completa, afiche (880x1244, completo), 4 premios, 11 selecciones con ciudad y país, 6 fotogramas, 8 fotos de rodaje.
3. ECO: sello "Aún sin estrenar" y el aviso, golpe, sinopsis, ficha corta, equipo (9 filas), portada (eco-portada), reparto (4, con nombre de personaje y actor), 13 fotos de rodaje SIN pie de foto visible (el alt sí va), y si te sirve la progresión de luz (5 fotogramas chicos) y eco-silla.
4. Fotografía: las 7 fotos, crédito @jadrianzens, con visor ampliado (lightbox propio, sin librería) o al menos apertura a tamaño completo.
5. El director: retrato o foto de escenario, los 4 párrafos de la bio (con las negritas indicadas), los 4 datos, la cita con su autor, el muro de 6 fotos con el título "En cámara y fuera de ella".
6. Blog: los 2 artículos con título y enlace real a joseadrianzen.com.
7. Contacto: las 4 vías con sus enlaces, "Lima · Perú".
8. Pie: derechos, dominio, enlace al blog y al correo web.
9. `<title>`, meta description, `lang="es"`, favicon inline (un SVG data URI con una J o un círculo), Open Graph básico con og.jpg de assets.

## Reglas que no se negocian (vienen del cliente)

- "Jose Adrianzen" sin tilde. Prohibido "José" y "Adrianzén" en cualquier parte, incluidos alt y title.
- Ninguna imagen se deforma ni se recorta. Nada de `object-fit: cover` sobre fotos de personas ni de fotogramas. Usa el aspecto real (ancho y alto están en contenido.json), `object-fit: contain`, o cajas con `aspect-ratio` igual al de la imagen. Si quieres un fondo a pantalla completa, muestra la imagen completa (letterbox con barras o con el mismo color de fondo) o escálala por ancho y deja que el alto sea el que es. Un fondo con `background-size: cover` solo se permite con una imagen de textura que no tenga personas (no hay ninguna en assets, así que en la práctica no se usa).
- ECO no se puede ver: solo fotogramas, reparto, rodaje y el aviso. Sin enlaces a video de ECO.
- El documental sí se ve: botón "Ver el documental" que carga el reproductor de Vimeo con el id del tráiler (ver snippet). Nada de marca de Vimeo visible: `title=0&byline=0&portrait=0&dnt=1`, y un póster propio encima antes de reproducir.
- Cursor: si haces cursor propio, oculta la flecha del sistema (`cursor: none` en body y en todo lo clickeable) y respeta `prefers-reduced-motion` y pantallas táctiles (`@media (hover: none)` lo apaga). Si no haces cursor propio, deja el cursor normal. Ambas opciones valen.
- Las letras nunca se montan entre sí: `line-height` mínimo 1.05 en títulos con tildes (Ñ, Á), 1.5 en texto.
- Nunca guion largo (—) ni guion medio (–) en ningún texto visible ni en comentarios: usa coma, punto o paréntesis. El punto medio (·) sí se usa. Nada de punto y coma en textos.
- Español de Perú con tildes. Sin mayúsculas al estilo inglés en títulos (se escribe "Sobre el director", no "Sobre El Director").
- No mencionar "casa de los ochenta".
- Responsive de 360 px a 1920 px sin scroll horizontal. Gutter lateral mínimo 16 px en móvil. Foco visible en enlaces y botones. `alt` en todas las imágenes. `prefers-reduced-motion` apaga animaciones.
- Un solo archivo `index.html` con CSS y JS inline (salvo los prototipos que el concepto define como multipágina). Imágenes por ruta relativa `../assets/nombre.webp`. NADA se carga de internet: ni Google Fonts ni CDN (el contenedor no tiene salida a internet y el control de calidad lo marca como falla). Fuentes: las del sitio en `../assets/fonts/` o cualquiera de las 100 familias del catálogo local `protos/fonts/CATALOGO.md` (se cargan con `<link rel="stylesheet" href="../fonts/<slug>.css">`). Librerías: solo las de `protos/lib/` (ver `protos/lib/LEEME.md`): GSAP con sus plugins, Lenis, SplitType, Three.js con addons por importmap, OGL.
- Nada de lorem ipsum ni de texto de relleno. Todo sale de contenido.json.
- Nada de rastreadores, analítica, cookies ni formularios que envíen a algún lado. El contacto son enlaces.

## Clases de peso (cada concepto dice cuál es)

- ligera: sin librerías de JS. Solo CSS, animaciones CSS (incluidas las guiadas por scroll con `animation-timeline` y `@supports`), IntersectionObserver y JS propio de menos de 8 kB. HTML total menor a 90 kB. Máximo 2 familias de fuente. Meta: cargar en menos de 1,5 s en 4G.
- media: puede cargar de `../lib/` GSAP (con ScrollTrigger, SplitText, Flip, Observer) y Lenis. Sin WebGL. Meta: menos de 2,5 s.
- pesada: puede cargar Three.js u OGL de `../lib/` para WebGL. Solo en la sección que lo justifica, con `requestAnimationFrame` que se pausa cuando la sección no está visible, `pixelRatio` tope 1.5, y un respaldo sin WebGL (`@media (prefers-reduced-motion)` y si falla el contexto). Escribe en un comentario al inicio del archivo por qué se justifica el peso.

## Snippet obligatorio del reproductor del documental

Ponlo en la sección del documental, adaptando estilos al concepto pero no el comportamiento:

```html
<div class="vp" data-vimeo="1056105326">
  <button class="vp-poster" type="button" aria-label="Ver el documental Entre polvo y sueños">
    <img src="../assets/doc-mineras-b.webp" alt="Tres mineras almuerzan sobre la roca bajo un cielo de polvo" width="1200" height="649" loading="lazy" decoding="async">
    <span class="vp-lbl">Ver el documental</span>
  </button>
</div>
<script>
document.querySelectorAll('.vp').forEach(function(vp){
  var b=vp.querySelector('.vp-poster');
  b.addEventListener('click',function(){
    var f=document.createElement('iframe');
    f.src='https://player.vimeo.com/video/'+vp.dataset.vimeo+'?autoplay=1&title=0&byline=0&portrait=0&dnt=1&color=c9a55c';
    f.allow='autoplay; fullscreen; picture-in-picture';f.allowFullscreen=true;f.title='Entre polvo y sueños';
    f.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0';
    vp.appendChild(f);b.remove();
  });
});
</script>
```

Con CSS: `.vp{position:relative;aspect-ratio:1200/649;background:#000}` y la imagen del póster completa (`width:100%;height:100%;object-fit:contain`).

## Fuentes locales (CSS listo para pegar si las usas)

```css
@font-face{font-family:'Anton';src:url('../assets/fonts/anton-400-latin.woff2') format('woff2');font-weight:400;font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Archivo';src:url('../assets/fonts/archivo-300-latin.woff2') format('woff2');font-weight:300;font-display:swap}
@font-face{font-family:'Archivo';src:url('../assets/fonts/archivo-400-latin.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Archivo';src:url('../assets/fonts/archivo-500-latin.woff2') format('woff2');font-weight:500;font-display:swap}
@font-face{font-family:'Special Elite';src:url('../assets/fonts/special-elite-400-latin.woff2') format('woff2');font-weight:400;font-display:swap}
```

No estás obligado a usarlas. Cada concepto elige su tipografía del catálogo local (`protos/fonts/CATALOGO.md`, 100 familias: grotescas, serifas, display, condensadas, mono, stencil, pixel). Si el concepto no dice nada, elige tú y que sea distinta a la de los otros prototipos de tu lote. Ojo: en las fuentes del catálogo la ruta del CSS es `../fonts/<slug>.css` y los woff2 los resuelve ese CSS solo.

## Diseño: cómo se juzga

Se juzga como un jurado de Awwwards: idea clara, tipografía con carácter, jerarquía, ritmo, detalle, y que la web se sienta premium y suave al entrar. Cada prototipo tiene que ser reconociblemente distinto de los otros cuatro de tu lote y de la web actual. Nada de plantillas genéricas: nada de tarjetas redondeadas con sombra por todos lados, nada de degradado violeta, nada de Inter por defecto, nada de emojis. El concepto manda la paleta, el tipo, el layout y el movimiento. Un solo momento orquestado (entrada de portada o revelado de una sección) vale más que efectos en todo.

Antes de escribir, anota tu plan como comentario al inicio del archivo:
`<!-- CONCEPTO: ... / PALETA: ... / TIPOGRAFÍA: ... / LAYOUT: ... / MOVIMIENTO: ... / PESO: ligera|media|pesada -->`

## Entrega por prototipo

Carpeta `protos/NN-slug/` (NN y slug los da tu encargo) con:
- `index.html` (y páginas extra solo si el concepto es multipágina).
- `ficha.json` con: `{"n": NN, "slug": "...", "nombre": "...", "familia": "...", "concepto": "dos frases", "paleta": ["#hex", ...], "tipografias": ["..."], "layout": "una frase", "movimiento": "una frase", "peso": "ligera|media|pesada", "librerias": ["..."] , "estilos": ["etiquetas del atlas"], "referencias": ["nombre del atlas que inspiró", ...]}`.

## Control de calidad obligatorio antes de dar por terminado

Corre por cada prototipo:

```
NODE_PATH=$(npm root -g) node /home/claude/joseadrianzen-com/qa/qa.js /home/claude/joseadrianzen-com/protos/NN-slug
```

Revisa que diga OK en todo. Si marca desbordamiento horizontal, imágenes deformadas o recortadas, textos prohibidos, imágenes que no existen o errores de consola, corrígelo y vuelve a correr. No entregues un prototipo con fallos. Abre también las capturas que deja en `qa/capturas/NN-slug-*.png` con Read y mira si el diseño se ve como lo pensaste (a 1440 y a 390). Si algo se ve mal, arréglalo. Una sola mirada por captura, no un bucle.
