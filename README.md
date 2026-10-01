# joseadrianzen.com, rediseño 2026

Sitio personal de Jose Adrianzen, director y productor de cine. Lima, Perú.
Rama `rediseno-2026`. Producción sigue en `main` y no se toca sin autorización de Jose en el momento.

## Cómo está armado

Astro 7 en modo estático. El build genera HTML plano, CSS y un solo archivo de movimiento.

```
src/data/sitio.js      textos, premios, selecciones, fichas, fotos. Se edita aquí, no en las páginas
src/data/blog.js       artículos (estado publicado o revision)
src/data/textos.js     textos de la interfaz en español e inglés
src/layouts/Base.astro plantilla común (cabecera, menú, pie, cursor, estela, SEO, JSON-LD)
src/vistas/            las siete páginas, cada una recibe el idioma
src/pages/             rutas en español y bajo /en/ en inglés
src/scripts/movimiento.js  motor de movimiento de todas las páginas (GSAP 3.13, Lenis 1.3)
src/components/        Foto, Logo, Nav, MenuCapa, Pie, Enc, Reproductor
src/assets/            fotos y logos con cada letra separada
```

## Comandos

```
npm install
npm run dev         ver en local
npm run build       build de producción
npm run prototipo   build de prototipo (muestra borradores del blog y bloquea buscadores)
```

## Reglas que el código respeta

- ECO no se puede ver ni se enlaza hasta su estreno.
- Las fotos nunca se deforman (object-fit cover con punto de interés).
- Las letras del logo siempre completas.
- Movimiento reducido: si el sistema lo pide, todo queda quieto y visible.
- Sin rastreadores ni cookies.
