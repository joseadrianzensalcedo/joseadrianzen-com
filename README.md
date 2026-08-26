# joseadrianzen.com

Sitio personal de **Jose Adrianzen**, director de cine — Lima, Perú.
En producción: https://joseadrianzen.com (Hostinger, plan Business).

## Qué hay aquí

Sitio estático en español, sin framework y sin proceso de build. Se decidió así
a propósito: para un sitio de una página con 54 imágenes y un reproductor,
HTML + CSS + JS planos cargan más rápido que cualquier framework, se pueden
editar desde el administrador de archivos del hosting y no dependen de nada
que se pueda romper en dos años. (Se evaluaron Astro, Next y Flutter Web:
todos agregan peso o toolchain sin aportar nada a una página como esta.)

```
index.html        estructura y contenido (una sola página)
assets/site.css   hoja de estilos — tokens → base → efectos → secciones → responsive
assets/site.js    comportamiento — intro, cursor, reveal, visor, reproductor, parpadeo
assets/*.webp     54 imágenes optimizadas (~2 MB en total)
blog/index.html   portada del blog (artículos semanales)
.htaccess         seguridad (CSP, HSTS, nosniff) + compresión + caché
robots.txt        indexación
sitemap.xml       mapa del sitio
```

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
`player.vimeo.com` — sin eso el reproductor muere en silencio. También van
HSTS, `nosniff`, `X-Frame-Options`, `Permissions-Policy` y `-Indexes`.

## Publicar

Copiar los archivos a `public_html/` en Hostinger. Antes de reemplazar
`index.html`, renombrar el actual a `index-vN.html.bak` (hay v1–v8) para
conservar el historial. El `.htaccess` del hosting se versiona igual
(`htaccess-vN.bak`).

## Pendientes

- Falta el id de Vimeo del documental completo: `#vp` reproduce hoy el id
  1056105326 (trailer). Cuando exista el segundo id, se reactiva el encadenado
  trailer → documental en `assets/site.js`.
- Blog: la portada está lista; los artículos se publican tras revisión por correo.
