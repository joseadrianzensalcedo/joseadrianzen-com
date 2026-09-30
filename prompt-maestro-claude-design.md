# Prompt maestro para Claude Design · joseadrianzen.com

Copia todo lo que está debajo de la línea y pégalo en Claude Design.

---

## Tu papel

Eres el director de arte y el diseñador de interacción de un estudio que gana premios en Awwwards, The FWA y CSS Design Awards. Vas a diseñar la nueva web de un director de cine peruano. Quiero una web que se sienta como entrar a una sala de cine: premium, suave al moverse y liviana al cargar. Nada de plantilla. Cada decisión tiene que salir de su cine.

## El cliente

Jose Adrianzen (se escribe así, SIN tilde en Jose ni en Adrianzen, siempre, también en textos alternativos y metadatos). Director y productor de cine. Vive en Lima, Perú. Tiene dos obras:

1. **Entre polvo y sueños** (documental, 2025). Tres años de rodaje con mujeres mineras del Perú. Premiado en festivales de cuatro continentes. Se puede ver completo en la web.
2. **ECO** (cortometraje, thriller psicológico, 2023). Aún sin estrenar. No se puede ver ni enlazar en ningún lado, solo fotogramas, reparto y rodaje.

Además tiene fotografía propia (puerto del Callao, mar, Barcelona, París), una bio, un blog con artículos y contacto.

Sitio actual: https://joseadrianzen.com (Astro estático, alojado en Hostinger). El nuevo diseño se va a construir sobre el mismo código, así que diseña pensando en HTML y CSS reales, no en algo que solo existe en una lámina.

## La idea central

**"Hasta el último rincón."** Sale de su propia frase: "Hay que llegar hasta el último rincón para visibilizarlas". La web hace eso con quien la visita. Todo empieza en los bordes de la pantalla (su nombre repetido en las cuatro orillas) y el cursor es la mirada que entra en cada rincón. Sobre el reel rompe la imagen en mosaico, sobre una obra la abre y la etiqueta dice qué va a pasar. Cada sección lleva al visitante un poco más adentro, de la portada a la mina, de la mina a la casa de ECO, de la casa al director. El cine de Jose es ir a donde nadie mira, y la web se recorre igual.

En la carga, la línea fina del monograma "JA" recorre los cuatro bordes de la pantalla antes de soltar el nombre, como quien revisa cada rincón antes de entrar. Tres referencias mandan, las demás suman detalles.

### Referencia 1, la que más le gusta: Hervé Baillargeon

https://hervebaillargeon.com (Awwwards Site of the Day, hecha por Locomotive, carga en menos de un segundo con 4 scripts y 8 recursos, medida el 28 set 2026).

Lo que hay que tomar, observado en vivo el 29 set 2026:
- **Entrada tipográfica.** Fondo papel color hueso. El nombre aparece en letras gigantes, condensadas y negras, que se construyen una por una desde bloques rectos que crecen (primero dos barras, luego la H completa, luego E, R, V, É), cada letra desfasada en altura como si cayeran en su sitio.
- **El nombre en los cuatro bordes.** Mientras carga, el nombre aparece chico en mono arriba, abajo, a la izquierda y a la derecha, con las letras revueltas que se ordenan (efecto de texto que se descifra: "EHRÉV" pasa a "HERVÉ").
- **Las letras se dispersan.** Al bajar, las letras gigantes se separan por la página y entre ellas aparecen videos del reel en marcos rectos, sin bordes redondeados.
- **Navegación mínima fija.** "WORKS +" a la izquierda y "+ INFO" a la derecha, a media altura. Un monograma "HB" arriba al centro. Rótulos en mono pequeño, como "RÉALISATEUR".
- **Scroll con inercia suave** (Lenis) y videos grandes centrados con barras negras cuando el formato lo pide.

Traducción para Jose: el papel hueso es su tema claro, el negro con oro es su tema oscuro. El nombre "JOSE ADRIANZEN" se construye letra por letra al entrar y se repite descifrándose en los cuatro bordes. Monograma "JA". Navegación fija "Obras +" a la izquierda y "+ Info" a la derecha.

### Referencia 2, el cursor: Chris Macari

https://chrismacarifilms.com (observado en vivo el 29 set 2026).

- Detrás de todo hay un reel a pantalla completa que corre en un canvas WebGL.
- **Al mover el cursor, la imagen se pixela en un rastro de mosaico** que sigue al mouse y se deshace detrás, como si el cursor rompiera el fotograma en bloques. Es la firma de la web.
- Una etiqueta de texto diminuta en mayúsculas ("UNMUTE") sigue al cursor, y al hacer clic se activa el sonido.
- Nombre gigante en rojo arriba a todo el ancho (Druk Wide) y la navegación en una fila de mayúsculas pequeñas que se tiñen de rojo al pasar.

Traducción para Jose: en la portada, un reel mudo en bucle con sus fotogramas del documental y de ECO (solo fotos fijas de ECO, nunca video). El cursor lo pixela en mosaico, que es como se ve el polvo de la mina. La etiqueta que sigue al cursor dice "Sonido" sobre el reel, "Ver" sobre una obra y "Abrir" sobre una foto.

### Referencia 3, el cursor y el reel: First Frame

https://firstframe.fr (productora de París, observada el 29 set 2026. La animación de entrada no terminó de cargar en la prueba, así que esto describe lo que se pudo ver en el código y en pantalla).

- **Carga con un monograma "FF" que viaja sobre una línea fina** de progreso a lo ancho de la pantalla.
- Un canvas WebGL con seis videos en bucle de proyectos. Contador "01 / 06".
- **La etiqueta del cursor está separada letra por letra** ("P L A Y") para animarla por letras al aparecer, y un enlace "DISCOVER".
- Frase grande: "Every story starts with a first frame". Tipografía grotesca (HK Requisite) con mono para datos (IBM Plex Mono).

Traducción para Jose: la carga es "JA" montado sobre una línea de progreso que parece la barra de una moviola. La etiqueta del cursor entra letra por letra. El reel de portada lleva contador "01 / 06".

### Otras referencias que suman, todas revisadas en el atlas del 28 set 2026

| Web | Qué tomar |
|---|---|
| https://oliverlaxe.com | Una portada que es un solo video en bucle, sin un script. El techo de ligereza |
| https://siena.film | Scroll con Lenis, sobrio y liviano (37 recursos, 2,2 s) |
| https://alitwotimes.com | Director de El Cairo, ritmo de reel, ligera |
| https://www.adambricker.com | La ficha técnica como diseño, "2.39:1 · 24 fps · ISO 1600" visible |
| http://edoardosmerilli.com | Pared 3D de fotogramas que se recorre, sobre negro |
| https://artefakt.mov | Partículas y revelado de imagen por píxeles, como grano digital |
| https://josh-goldsmith.com | Índice de obras con vista previa en vivo al pasar el cursor |
| https://taotajima.jp | Transiciones con shader entre un video y el siguiente, lista numerada de obras |
| https://partizan.com | Lista de directores que sigue al mouse, cambio entre grilla y lista |
| https://www.perfectdays-movie.jp | Web de película de autor que se lee con scroll y sonido |
| https://remizek.org | Video que arranca al pasar el cursor sobre una obra |
| https://grit.pictures | Collage con bordes rasgados y grano, lo analógico bien hecho |
| https://dennissnellenberg.com | Portafolio fluido con muy poco peso (19 recursos) |
| https://studiodumbar.com | Lenis y GSAP en 13 recursos |
| https://gaspar-noe.com | Referencia de siempre de Jose. Ojo, es un sitio de fans, no el oficial |

De los 100 prototipos que ya se hicieron con su contenido (galería en https://prototipos-web-production.up.railway.app/), estas ideas vale la pena rescatar:
- **12 Sala oscura**: las luces de sala se apagan y una pantalla 2.39:1 se enciende como proyector.
- **21 Polvo**: los premios leídos como la franja de laureles de un afiche, no como tabla.
- **59 Peso variable**: el nombre pasa de trazo fino a grueso con el scroll.
- **94 Respiración**: fundidos de 900 ms y el naranja del casco de las mineras como único acento.
- **92 Transiciones nativas**: fundido entre páginas hecho por el navegador, sin JavaScript.
- **100 Juego de luz**: la progresión de luz de ECO (de ámbar a azul) como control que cambia la página.
- **86 Mapa de festivales**: rutas desde Lima a cada festival.

## Sistema visual

**Dos temas, los dos obligatorios** (claro y oscuro, en web y móvil, con botón para cambiar):
- **Oscuro (el principal):** negro `#050505`, negro 2 `#0c0b0a`, blanco hueso `#f2efe9`, humo `#8a837a`, línea `#232019`, oro `#c9a55c`, polvo `#d68a2e`. Son los colores actuales del sitio y se quedan.
- **Claro (el de Hervé):** papel hueso cerca de `#ebe5d9` como fondo, tinta `#0c0b0a`, el oro y el polvo más oscuros para que pasen contraste (cerca de `#8a6726` y `#9a5a12`).
- Un solo acento vivo en toda la web: el naranja del casco de las mineras (sale del afiche). Nada de violetas, nada de degradados de moda.

**Tipografía.** Hoy el sitio usa Anton (títulos), Archivo (texto) y Special Elite (máquina de escribir para fichas y etiquetas). Propón una grotesca condensada muy pesada para el nombre gigante (en la línea de Anton o Druk, que es lo que usan Hervé y Macari), una grotesca sobria para leer y una mono para datos técnicos. Special Elite puede quedar solo en detalles de ficha. Máximo tres familias. Las letras nunca se montan entre sí: las tildes y la Ñ necesitan interlineado de 1,05 como mínimo en los títulos.

**Firmas que Jose ya tiene y quiere conservar:**
- Cursor propio en círculo. **La flecha del sistema nunca se ve** en escritorio. En táctiles no hay cursor.
- **El destello** al aparecer títulos (su efecto favorito).
- Contorno cromático sutil en el nombre y los títulos (un corrimiento naranja y azulado de 1 px).
- Grano de película mate fijo sobre toda la página.
- Un parpadeo muy leve de la página cada 9 a 18 segundos, que **nunca** toca imágenes ni videos.
- Los efectos no pueden ser todos iguales. Uno orquestado por sección, no diez a la vez.

## Reglas que no se negocian

1. **Ninguna imagen se deforma ni se recorta.** Nunca se cortan cabezas. Cada foto se muestra completa en su proporción real (las medidas están abajo). Si hace falta llenar la pantalla, van barras del color de fondo.
2. **ECO no se ve.** Nada de tráiler, ni enlace, ni botón de play. Solo el sello "Aún sin estrenar", fotogramas, reparto y rodaje.
3. **El documental sí se ve completo** en la web, con reproductor propio. Nada de "próximamente". El tráiler va antes que el documental. El reproductor es Vimeo (id actual 1056105326) pero **sin nada de Vimeo a la vista**: ni logo, ni controles de Vimeo, ni línea de tiempo de Vimeo. Póster propio y controles propios (reproducir, avance, sonido, pantalla completa).
4. **En la portada solo va** "Jose Adrianzen" y "Director · Productor", más la navegación.
5. Las fotos de rodaje de ECO van **sin pie de foto** visible. El reparto sí lleva nombres.
6. Nada de guion largo ni guion medio en ningún texto (se usa coma, punto o paréntesis). Nada de punto y coma. Nada de mayúsculas al estilo inglés en títulos ("Sobre el director", no "Sobre El Director").
7. No mencionar "casa de los ochenta".
8. Responsive de 360 px a 1920 px sin scroll horizontal. El móvil no es el escritorio apilado: diséñalo vertical de verdad.
9. Accesible: foco visible, textos alternativos, y si el visitante pide menos movimiento se apagan intro, cursor, parpadeo y animaciones.

## Presupuesto de peso (liviana pero premium)

- La primera pantalla carga en menos de 2 s en 4G. Meta de JavaScript propio: menos de 30 kB. Fuentes: menos de 60 kB en total, solo latín con tildes y Ñ.
- **El WebGL solo vive en la portada** (el mosaico del cursor sobre el reel). Se pausa cuando no está en pantalla y tiene respaldo sin WebGL (el reel en video simple).
- El reproductor de Vimeo se carga recién al tocar "Ver el documental". Antes, solo un póster liviano.

Piezas técnicas recomendadas (todas de código abierto, revisadas en GitHub el 28 set 2026):
- `withastro/astro`, el sitio sigue en Astro.
- `darkroomengineering/lenis`, scroll con inercia.
- `greensock/GSAP` con ScrollTrigger y SplitText, para armar el nombre letra por letra y los revelados.
- `oframe/ogl`, WebGL mínimo para el mosaico del cursor, en vez de Three.js entero.
- `mattdesl/glsl-film-grain`, grano de película por shader si hace falta.
- `luwes/lite-vimeo-embed` y `vimeo/player.js`, Vimeo sin cargar de entrada y con controles propios.
- View Transitions del navegador, para el fundido entre páginas sin JavaScript.
- `fontsource/fontsource`, las fuentes alojadas en el propio sitio.
- Lighthouse CI (`treosh/lighthouse-ci-action`), un tope de peso que frena el despliegue si se pasa.

## Estructura y cada sección

### 0. Carga (máximo 1,5 s, solo la primera visita)
Monograma "JA" montado sobre una línea fina de progreso (idea de First Frame) que recorre los cuatro bordes de la pantalla, uno por uno. Donde pasa la línea aparece el nombre chico descifrándose en ese borde. Cuando cierra el recorrido, arranca la portada.

### 1. Portada
- El nombre "JOSE ADRIANZEN" gigante, que se arma letra por letra desde bloques rectos (idea de Hervé), con el destello al terminar.
- El nombre chico en mono en los cuatro bordes, que se descifra.
- Debajo, "Director · Productor".
- Detrás, el reel mudo de fotogramas en bucle con el mosaico del cursor (idea de Macari). La etiqueta del cursor dice "Sonido" letra por letra.
- Navegación fija "Obras +" a la izquierda y "+ Info" a la derecha. El menú completo abre desde ahí.
- Al bajar, las letras del nombre se dispersan y dejan ver las obras entre ellas.

### 2. Entre polvo y sueños (la pieza central, el doble de peso que el resto)
- Rótulo "Documental · 2025" en mono.
- Título grande.
- Reproductor propio 16:9 con el póster `doc-mineras-b` y el botón "Ver el documental". La etiqueta del cursor dice "Ver".
- Frase de golpe, sinopsis y ficha corta (textos abajo).
- Ficha técnica completa como la de Adam Bricker, con la estética de una ficha de sala.
- El afiche completo (880 × 1244, sin recortar).
- **Premios como laureles de afiche** (4) y **selecciones oficiales** (11) con ciudad y país. Pueden leerse como las rutas de un mapa desde Lima (idea del prototipo 86).
- Fotogramas (6) y rodaje (8) en tiras o grillas deliberadas, no en columnas con bases desiguales.

### 3. ECO (el tono cambia, más oscuro y más frío)
- Rótulo "Cortometraje · Thriller psicológico · 2023".
- Sello "Aún sin estrenar" y el aviso.
- Portada de ECO (`eco-portada`), golpe, sinopsis y ficha corta.
- Equipo (9 filas).
- Reparto con personaje y actor (4).
- La progresión de luz (5 fotogramas chicos de 258 px, **nunca ampliados más de 2 veces**) como tratamiento propio. Puede ser el control que lleva la sección de ámbar a azul (idea del prototipo 100).
- Rodaje (13 fotos verticales chicas, sin pie de foto).

### 4. Fotografía
Las 7 fotos con visor ampliado propio (flechas, tecla Esc, sin recortes). Crédito @jadrianzens. La etiqueta del cursor dice "Abrir".

### 5. Sobre el director
Retrato, bio de 4 párrafos, 4 datos, cita grande y el muro "En cámara y fuera de ella" (6 fotos) en una grilla deliberada.

### 6. Blog
Dos artículos con imagen al mismo ancho que la columna de texto.

### 7. Contacto y pie
Las 4 vías. "Lima · Perú". Pie con derechos, dominio, blog y correo.

### Transiciones
Entre secciones, nada de líneas de 1 px repetidas. Usa algo de cine: un corte a negro, una cortinilla de luz, el cambio de rollo. Entre páginas (blog, artículo), fundido encadenado con View Transitions.

## Textos finales (ya revisados, úsalos tal cual)

**Portada**
Jose Adrianzen
Director · Productor

**Entre polvo y sueños**
Documental · 2025
Ellas no solo buscan mineral.
Pasé tres años filmando en los socavones y las pampas del Perú, junto a un grupo de mujeres mineras. No son mineras informales y nada más. Quieren formalizarse, que las reconozcan y darle una vida mejor a los suyos.
La película tiende un puente entre ellas y el mundo. Es una historia de lucha filmada a pie de mina, para que su voz llegue lejos.
Perú · Documental · Digital 2K · Español · Subtítulos en francés, inglés y turco
Botón: Ver el documental

Ficha
Dirección · Jose Adrianzen
Guion · Jose Adrianzen
Producción general · Jose Adrianzen y Solidaridad
Producido por · Bálu · Solidaridad
País · Perú
Formato · Digital 2K
Idioma · Español
Subtítulos · Francés, inglés y turco

Premios
- Mejor documental · TITAN International Film Festival · Sídney, Australia · 3.ª edición · 2025
- Mejor guion · 13.º Noida International Film Festival · Noida, India · 2026
- Best of Festival · Docuvision International Film Festival · Lewes, Delaware, EE. UU. · 2026
- Mención especial · 13.º Noida International Film Festival · Noida, India · 2026

Selecciones oficiales
- 21.º International Labour Film Festival · Türkiye · 2026
- The Workers Unite Film Festival · Nueva York, EE. UU. · 2025
- London Vision Film Festival · Londres, Reino Unido · 2025
- LISBIFF Lisboa Indie Film Festival · Lisboa, Portugal · 2025
- Cine Invisible "Film Sozialak" · Bilbao, España · 2026
- FIMMER · Festival Internacional de Mediometrajes (sección oficial) · Manzanares El Real, España · 2025
- ImoIFF Creatives International Film Festival · Imo, Nigeria · 2025
- Cinego Shorts · Shorts on the Move · Karachi, Pakistán
- Film Hour · Bodhak Studio · India
- Cinematic Luxe Indie Showcase · Winter Fest 26 · Cincinnati, EE. UU.
- 20.ª Muestra Cine + Video Indígena · Chile · 2026

**ECO**
Cortometraje · Thriller psicológico · 2023
Sello: Aún sin estrenar
ECO está en circuito de festivales y todavía no se estrena, así que por ahora no se puede ver en línea. Pronto va a estar aquí.
Una casa. Un secreto.
César es un psiquiatra respetado que esconde una doble vida detrás de su consulta y de su matrimonio. Cuando Victoria, su joven paciente y amante, se atreve a contar la verdad, ese equilibrio frágil se rompe. Entre espejos, secretos y sospechas, la esposa a la que todos creen frágil resulta ser la más lúcida.
Perú · 2023 · 13 min 12 s · Digital 6K · Español

Equipo
Dirección · Jose Adrianzen
Guion · Jose Adrianzen y Matilde Carrión
Producción · Jose Adrianzen
Fotografía · Fabricio Raciti
Arte · Gonzalo Veratudela
Dir. de actores · Aníbal Lozano
Montaje · Jose Adrianzen
Sonido · Casko Pérez
Música · Augusto Madueño

Reparto
César · Cristian Esquivel
Cristina · Fiorella Luna
Victoria · Yamile Caparó
La madre · Motta

**Fotografía**
Bitácora visual
Lo que veo cuando no estoy filmando. Más en @jadrianzens.

**Sobre el director**
Desde chico me movieron dos cosas, el cine y la política. Quería ser presidente, así que estudié derecho para entender cómo funcionan las leyes y el Estado. La vida me llevó por otro camino y en el cine encontré una forma más poderosa de cambiar algo y de contar las historias que merecen escucharse.
La curiosidad me llevó a recorrer casi todo el Perú, buena parte de Sudamérica y varios rincones del mundo. Esos viajes me enseñaron a mirar vidas muy distintas a la mía y me dejaron una certeza. El cine puede cambiar la realidad de una comunidad. Por eso me dediqué por completo a hacer cine.
Tengo estudios de cine y de actuación. También quería aportar desde la gestión, en producción, financiamiento y distribución, y por eso decidí estudiar ingeniería empresarial.
En los últimos años trabajé con varias ONG contando historias que suelen quedar en el olvido. Terminé de rodar el cortometraje ECO, que hoy recorre festivales. Pero el proyecto que marcó mi camino es Entre polvo y sueños, tres años de mi vida para darles voz a las mujeres mineras del Perú y reivindicar su lucha.

Datos
Base · Lima, Perú
Formación · Cine y actuación
Gestión · Ingeniería empresarial
Antes · TV, publicidad y ONG

Cita
"Siempre he creído que las personas valen mucho y que, si es necesario, hay que llegar hasta el último rincón para visibilizarlas."
Jose Adrianzen

Muro: En cámara y fuera de ella

**Blog** (Notas sobre cine)
- Nadie financia un documental que nunca le propusiste · https://joseadrianzen.com/blog/como-financiar-un-documental/ · imagen: afiche
- La inteligencia artificial no sabe dónde poner la cámara · https://joseadrianzen.com/blog/la-ia-no-sabe-donde-poner-la-camara/ · imagen: bts-doc-1

**Contacto**
Proyectos, festivales y colaboraciones
Escríbeme si tienes una historia, un festival o una idea para hacer juntos.
Correo · yo@joseadrianzen.com
WhatsApp · +51 984 323 201 (https://wa.me/51984323201)
Instagram · @jadrianzens (https://www.instagram.com/jadrianzens/)
LinkedIn · /in/joseadrianzens (https://www.linkedin.com/in/joseadrianzens/)
Lima · Perú

**Pie**
© 2026 Jose Adrianzen · Todos los derechos reservados · joseadrianzen.com · Blog · Correo (https://joseadrianzen.com/correo/)

## Imágenes (todas en https://joseadrianzen.com/assets/NOMBRE.webp)

Úsalas con su proporción exacta. Ancho × alto:

| Archivo | Medida | Qué es |
|---|---|---|
| afiche | 880 × 1244 | Afiche del documental, minera partiendo piedra, laureles arriba |
| doc-titulo | 1280 × 689 | Título del documental sobre negro |
| doc-tunel-b | 1200 × 649 | Mineras caminan dentro del socavón con cascos y linternas |
| doc-mineras-b | 1200 × 649 | Tres mineras almuerzan sobre la roca (póster del reproductor) |
| doc-noche-b | 1200 × 649 | Minera con casco rojo llena sacos de noche |
| doc-casco-b | 1200 × 649 | Retrato de minera con casco naranja |
| doc-entrevista-b | 1200 × 649 | Mujer entrevistada en su vivienda |
| bts-doc-1 a bts-doc-8 | ~997 × 560 | Rodaje del documental (Jose dirigiendo, cámara, dron, niños mirando el monitor) |
| eco-portada | 1200 × 675 | Fotograma de ECO, figura baja la escalera de una casa antigua |
| eco-silla | 705 × 405 | Silla vacía en penumbra |
| eco-luz-1 a eco-luz-5 | ~256 × 150 | Progresión de luz de una escena |
| eco-cesar | 650 × 377 | César (Cristian Esquivel) |
| eco-cristina, eco-victoria, eco-madre | 641 × 404 | Cristina, Victoria, La madre |
| eco-bts-set, -cama, -yamile, -cristian-jose, -cristian, -setcompleto, -luces, -ensayo, -claqueta3, -tomas, -descanso | 349 a 465 × 620 | Rodaje de ECO, verticales |
| eco-bts-locacion | 1102 × 620 | La sala vacía antes de vestir el set |
| eco-bts-reparto | 786 × 620 | Jose con Matilde Carrión y el reparto |
| fot-puerto | 1200 × 748 | Grúas del Callao bajo cielo naranja |
| fot-mar | 1200 × 695 | Mar abierto con barcos al amanecer |
| fot-barco | 1200 × 748 | Barco pesquero sobre mar naranja |
| fot-gaviota | 631 × 635 | Proa, gaviota y remolcador |
| fot-muelle | 1000 × 747 | Muelle sobre mar turquesa |
| fot-barcelona | 698 × 862 | Fachadas con balcones en Barcelona |
| fot-louvre | 1000 × 748 | Pirámide del Louvre |
| jose-retrato-b | 1182 × 1186 | Jose sentado junto a una escalera, suéter naranja |
| jose-escenario | 938 × 626 | Jose con micrófono en una presentación |
| jose-calavera | 1000 × 560 | Jose actuando con calavera y vela |
| jose-teatro | 828 × 758 | Jose en escena |
| jose-shipibo | 1000 × 669 | Jose con músicos shipibo, blanco y negro |
| jose-taxi | 1000 × 665 | Jose en un taxi frente a un mural, blanco y negro |
| jose-naipes | 1000 × 561 | Claqueta sobre una mesa de juego |
| og.jpg | 1200 × 630 | Imagen para redes |

## Qué quiero que entregues

1. **Portada** en escritorio (1440) y móvil (390), en tema oscuro y claro, con la secuencia de entrada dibujada en 4 cuadros (carga, letras armándose, nombre completo con destello, letras dispersándose al bajar).
2. **Cada sección** en escritorio y móvil, en tema oscuro. La sección del documental y la de ECO también en tema claro.
3. **Especificación del cursor**: estados (reposo, sobre reel, sobre obra, sobre foto, sobre enlace, sobre botón), tamaño, retardo, etiqueta letra por letra y el mosaico.
4. **Especificación de movimiento**: curvas, duraciones y qué se anima en cada sección. Un momento fuerte por sección.
5. **Sistema**: colores con sus nombres para los dos temas, escala tipográfica, espaciados y grilla.
6. Una nota corta de qué parte del diseño pesa más y cómo se mantiene bajo el presupuesto.

Antes de dibujar, escribe en cinco líneas la idea, la paleta, la tipografía, la grilla y el movimiento. Si algo de este pedido choca con las reglas que no se negocian, ganan las reglas.
