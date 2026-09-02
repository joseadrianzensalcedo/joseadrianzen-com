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
correo/               piel y configuracion del webmail propio (no lo compila Astro)
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

## Correo propio

La pestaña **Correo** ya no sale a `mail.hostinger.com`: apunta a
`joseadrianzen.com/correo`, un Roundcube instalado en el mismo hosting y
vestido con la piel del sitio. El buzon es el mismo de siempre; lo unico que
cambia es la cara. Hostinger no se ve por ningun lado.

```
correo/INSTALAR.md          como montarlo en el hosting (se hace una sola vez)
correo/config/              plantilla de config.inc.php: IMAP, SMTP, seguridad
correo/htaccess-anadir.txt  el bloque de CSP que hay que añadir alli
correo/skins/adrianzen/     la piel: hereda de Elastic y repinta encima
```

Astro **no** toca esta carpeta: no esta en `public/`, asi que no entra en
`dist/`. Se sube al hosting a mano, aparte del sitio, y solo cuando cambie.

La piel lleva **sus propias fuentes** en `skins/adrianzen/fonts/` (las mismas
tres del sitio, ~320 KB). Al principio enlazaba a `/assets/fuentes.css` del
sitio y daba 404, porque lo que hay desplegado en produccion es todavia la
version anterior a Astro. Con las fuentes dentro, el correo se ve igual pase
lo que pase con el despliegue del sitio.

Cuatro cosas que hay que respetar al tocar la piel:

1. Dentro de `skins/adrianzen/` los nombres `ui.js` y `styles/styles.css`
   estan prohibidos. Roundcube busca cada fichero primero en nuestra piel y
   luego en Elastic, asi que uno con ese nombre no se suma al de Elastic:
   lo sustituye, y la interfaz se cae entera. Por eso los nuestros se llaman
   `adrianzen.js` y `styles/adrianzen.css`.
2. `skins/elastic/` no se edita nunca. La siguiente actualizacion se llevaria
   los cambios por delante.
3. El modo oscuro de Elastic va forzado desde `layout.html`
   (`<html class="dark-mode">`) y la paleta se repinta encima. Elastic compila
   LESS a colores literales, no usa variables CSS: por eso el repintado va
   selector por selector y no hay un sitio donde cambiarlo todo de golpe.
4. En `layout.html` la hoja de Elastic se pide como **`styles.min.css`**, no
   como `styles.css`. Elastic escribe `styles.css` en su propia plantilla y a
   ella le funciona; a una piel que la hereda, no. Roundcube decide en que
   piel esta el fichero (`get_skin_file`) **antes** de cambiar al `.min`
   (`file_mod`), y ese cambio lo hace contra `base_path`, que en una piel
   heredada somos nosotros. Como `styles.css` a secas no existe en el paquete,
   la busqueda falla y la hoja de 122 KB no se carga: la interfaz sale en
   carne viva. Se detecta en un segundo: si el `<link>` del HTML sale **sin
   `?s=`**, el fichero no se encontro.

La direccion vive en `src/data/sitio.js` (`correoUrl`) y va absoluta a
proposito: en staging el sitio se sirve bajo `/joseadrianzen-com/` en GitHub
Pages, donde no hay PHP ni buzon, asi que ahi el enlace tiene que salir
igualmente a produccion.

Roundcube tiene acceso al correo: **las actualizaciones de seguridad se
ponen**. El procedimiento (`bin/installto.sh`, que respeta configuracion y
piel) esta en `correo/INSTALAR.md`.

## Publicar

Automatico: cada push a `main` dispara `.github/workflows/deploy.yml`, que
compila y sube `dist/` a `public_html/` en Hostinger por FTP. Requiere los
secrets del repositorio `HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME` y
`HOSTINGER_FTP_PASSWORD` (Settings → Secrets and variables → Actions).

Manual (si el workflow no esta configurado o hay que subir algo fuera de
`main`):

1. `npm run build`
2. Copiar el contenido de `dist/` a `public_html/` en Hostinger.

Antes de reemplazar `index.html`, renombrar el actual a `index-vN.html.bak`
(hay v1-v8) para conservar el historial. El `.htaccess` se versiona igual
(`htaccess-vN.bak`). El despliegue automatico no hace este renombrado: si se
quiere conservar el historial de versiones, sigue siendo manual.

## Pendientes

- Falta el id de Vimeo del documental completo: `#vp` reproduce hoy el id
  1056105326 (trailer). Cuando exista el segundo id, se reactiva el encadenado
  trailer → documental en `assets/site.js`.
- Blog: la portada está lista; los artículos se publican tras revisión por correo.
