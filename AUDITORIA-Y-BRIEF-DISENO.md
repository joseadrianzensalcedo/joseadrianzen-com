# joseadrianzen.com: auditoría y brief de diseño (v2)

Documento de entrega para una segunda mirada de diseño (Claude Design).
Sitio en producción: **https://joseadrianzen.com** · Repo: github.com/joseadrianzensalcedo/joseadrianzen-com
Fecha: 26 de agosto de 2026 · Fuente: los archivos de este mismo paquete.

---

## 1. Qué es

Sitio personal de **Jose Adrianzen**, director de cine peruano. Una sola página
estática en español, más una portada de blog. Su trabajo: mostrar dos obras, la
fotografía del director, quién es y cómo contactarlo: a programadores de
festivales, productores y prensa.

Referencia estética pedida por el cliente: **gaspar-noe.com** (fondo negro,
tipografía enorme, grano de película, efectos secos). Nadie llega aquí a
"convertir": llega a ver el trabajo.

## 2. Cómo está armado (v2: reestructurado)

```
index.html        estructura y contenido (21 KB)
assets/site.css   estilos: tokens → base → efectos → nav/portada → secciones → responsive (21 KB)
assets/site.js    intro, cursor, barra de progreso, reveal, visor, reproductor propio, parpadeo (8 KB)
assets/*.webp     54 imágenes (~2 MB en total)
blog/index.html   portada del blog (artículos semanales, aún sin posts)
.htaccess         CSP + HSTS + nosniff + Permissions-Policy + compresión + caché
robots.txt · sitemap.xml · JSON-LD (Person + 2 Movies) · Open Graph
```

Sin framework ni build a propósito: para una página así, HTML/CSS/JS planos
cargan más rápido, se editan desde el hosting y no envejecen. (Se evaluaron
Astro, Next y Flutter Web; ninguno aporta aquí.)

## 3. Inventario de contenido

| Sección | Contenido |
|---|---|
| **Portada** | Nombre a pantalla completa con destello, "Director · Productor" |
| **Entre polvo y sueños** (documental, 2025, 2K) | Reproductor propio (el documental se ve directo, sin nada de Vimeo), sinopsis, ficha (subtítulos FR/EN/TR), afiche, 4 premios y 11 selecciones con ciudad y país, fotogramas y rodaje |
| **ECO** (cortometraje, 2023, 6K) | Sello "Aún sin estrenar" (no se puede ver), sinopsis, ficha (guion: Matilde Carrión), reparto con nombres, tiras de rodaje sin pies de foto |
| **Fotografía** | 7 fotos con visor ampliado |
| **El director** | Retrato mejorado (2×), bio en primera persona, cita ("…visibilizarlas"), 6 fotos |
| **Contacto** | Correo, WhatsApp, Instagram, LinkedIn |
| **Blog** | Portada lista; primer artículo enviado a revisión del cliente |

## 4. Sistema de diseño

Tokens: `--negro #050505 · --blanco #f2efe9 · --polvo #d68a2e · --oro #c9a55c ·
--humo #8a837a · --linea #232019`. El acento sale del polvo del documental.

Tipografía: **Anton** (títulos), **Archivo** 300/400/500 (texto), **Special
Elite** (máquina de escribir: epígrafes, fichas, controles). Contorno cromático
permanente en portada y títulos (`text-shadow` naranja/azulado), más intenso en hover.

Efectos, deliberadamente variados: `rv--flash` (destello: el favorito del
cliente, portada y títulos), `rv--wipe` (cortinilla), `rv--zoom`, `rv--left`,
`rv--suave` (solo el reproductor). Grano de película fijo, cursor propio
(círculo; la flecha del sistema nunca se ve), parpadeo periódico de toda la
página cada 9–18 s que **jamás** toca imágenes ni videos, fondo con viñeta
casi invisible y bordes de imagen que se encienden al pasar el mouse.

## 5. Decisiones que hay que respetar (pedidos del cliente)

1. "Jose Adrianzen" **sin tilde**, siempre.
2. Ninguna imagen deformada ni cabezas recortadas (hubo dos bugs; hay script de QA que lo vigila).
3. **Nada de Vimeo visible**: controles propios, `dnt=1`, botón transparente sobre el iframe.
4. La flecha del cursor nunca aparece; solo el círculo.
5. ECO no se puede ver (sin estrenar); el documental completo sí, sin "próximamente".
6. No mencionar "casa de los ochenta". Documental 2K, ECO 6K.
7. Efectos variados, no uniformes; el destello manda.
8. Ligero: WebP externo, ~2 MB de imágenes en total.

## 6. Estado técnico verificado (hoy)

Chromium headless a 360/390/414/768/1024/1280/1440/1920 px:
sin scroll horizontal, **0 de 54 imágenes deformadas**, 0 errores de JS,
alturas 8.100–9.400 px. Accesibilidad: `alt` en todo, foco visible, `Esc`
cierra el visor, `prefers-reduced-motion` apaga animaciones, cursor e intro.

Seguridad en vivo: CSP estricta, HSTS, nosniff, X-Frame-Options,
Permissions-Policy, sin listado de directorios. **Lección aprendida**: el SDK
de Vimeo hace un fetch a `vimeo.com/api/oembed.json`, así que `connect-src`
debe incluir `https://vimeo.com` o el reproductor muere en silencio.

## 7. Dónde puede aportar una segunda mirada de diseño

1. **Jerarquía entre obras.** El documental (premios, afiche, dos tiras) y
   Fotografía pesan distinto pero ocupan el mismo tipo de espacio.
2. **Cinco tiras horizontales** se repiten como patrón; la progresión de luz
   de ECO es conceptualmente otra cosa y merecería tratamiento propio.
3. **Los muros de fotos usan `columns`**, que deja bases desiguales; un grid
   deliberado compondría mejor.
4. **Once selecciones en tabla** se leen administrativas; los laureles del
   afiche dicen lo mismo con más fuerza.
5. **Transiciones entre secciones**: un `<hr>` de 1 px repetido cinco veces;
   cabe algo más cinematográfico.
6. **Móvil** funciona pero es el escritorio apilado; el formato vertical da
   para más.
7. El blog está vacío de diseño de posts: falta la plantilla del artículo
   individual (misma estética, lectura larga).

## 8. Pendientes de contenido (no son de diseño)

- Id de Vimeo del **documental completo** (`data-vimeo-doc` vacío; hoy el
  player reproduce el id 1056105326). Con ese id se reactiva el encadenado
  trailer → documental en `site.js`.
- El buzón **yo@joseadrianzen.com** quedó en pausa por decisión del cliente
  (prueba gratuita de Hostinger pendiente de aceptar).
- Sinopsis oficial del documental (la actual se redactó a partir del trailer).
- Primer artículo del blog: enviado al cliente por correo; se publica con su OK.
