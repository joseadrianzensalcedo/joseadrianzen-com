# joseadrianzen.com

Sitio personal de **Jose Adrianzen**, director de cine: Lima, Perú.
En producción: https://joseadrianzen.com (Hostinger, plan Business).

## Que hay aqui

Sitio en español construido con **Astro** en modo estatico: el build genera
HTML plano, sin JavaScript de framework en el navegador. Se sube a Hostinger
igual que antes, pero ahora el contenido repetido (premios, selecciones,
fichas, tiras de fotos) vive en un solo archivo de datos y las secciones son
componentes reutilizables.

```
astro.config.mjs      configuracion; base distinta para staging y produccion
src/data/sitio.js     premios, selecciones, fichas, tiras: editar AQUI
src/layouts/Base.astro  head, meta, OG, JSON-LD, noindex de staging
src/components/       Nav, Hero, Documental, Eco, Fotografia, Director,
                      Contacto, Footer + reutilizables (Tira, Muro, Ficha)
src/pages/index.astro portada
src/pages/blog/       portada del blog
src/styles/site.css   hoja de estilos: tokens -> base -> efectos -> secciones
src/scripts/site.js   comportamiento: intro, cursor, reveal, visor, reproductor
public/assets/        59 imagenes optimizadas (~2 MB)
public/.htaccess      seguridad (CSP, HSTS, nosniff) + compresion + cache
dist/                 lo que se sube al hosting (generado, no se versiona)
```

## Comandos

```
npm run dev      servidor local en http://localhost:4321 con recarga automatica
npm run build    genera dist/ para produccion
npm run preview  sirve dist/ tal como quedara publicado
```

## Ramas y staging

- `staging`: donde se trabaja. Cada push publica una vista previa en GitHub
  Pages (workflow `.github/workflows/staging.yml`), con `noindex` para que
  Google no la indexe.
- `main`: produccion. Solo se fusiona lo aprobado en staging.

## Decisiones que hay que respetar

1. "Jose Adrianzen" va **sin tilde**, siempre.
2. Ninguna imagen se deforma ni se recorta una cabeza. Las tiras usan altura
   fija con ancho automático; `img` global lleva `height:auto`.
3. **Vimeo no se ve por ningún lado**: controles propios, `dnt=1`, un botón
   transparente (`.escudo`) cubre el iframe.
4. La flecha del cursor **nunca** aparece en escritorio; solo el círculo propio.
5. ECO no se puede ver (aún sin estrenar): solo fotogramas y el sello.
6. El documental completo sí se ve, directo en la página.
7. Documental en **2K**; ECO en **6K**. Subtítulos del documental: francés,
   inglés y turco.
8. Los efectos no son todos iguales: destello (`rv--flash`) en portada y
   títulos, cortinilla, zoom, entrada lateral y fundido largo según el elemento.
9. Parpadeo periódico de toda la página (clase `tic` en `body`) que **nunca**
   toca imágenes ni videos.

## Seguridad (.htaccess)

CSP estricta con una lista corta de orígenes. Ojo con esto: el SDK de Vimeo
hace un fetch a `https://vimeo.com/api/oembed.json` al crear el reproductor,
así que `connect-src` **debe** incluir `https://vimeo.com` además de
`player.vimeo.com`: sin eso el reproductor muere en silencio. También van
HSTS, `nosniff`, `X-Frame-Options`, `Permissions-Policy` y `-Indexes`.

## Publicar

1. `npm run build`
2. Copiar el contenido de `dist/` a `public_html/` en Hostinger.

Antes de reemplazar `index.html`, renombrar el actual a `index-vN.html.bak`
(hay v1-v8) para conservar el historial. El `.htaccess` se versiona igual
(`htaccess-vN.bak`).

## Pendientes

- Falta el id de Vimeo del documental completo: `#vp` reproduce hoy el id
  1056105326 (trailer). Cuando exista el segundo id, se reactiva el encadenado
  trailer → documental en `assets/site.js`.
- Blog: la portada está lista; los artículos se publican tras revisión por correo.
