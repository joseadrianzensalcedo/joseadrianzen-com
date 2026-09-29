# Lote 20: Interactivo narrativo

El visitante hace algo: elige, arrastra, avanza capítulos. Referencias: familia 'ludico'.

Construye estos cinco prototipos, cada uno en su carpeta `protos/NN-slug/`:

## 96-capitulos · Capítulos · peso media
Scrollytelling: el fotograma queda fijo y el texto avanza por encima en tarjetas, capítulo 1 la mina, capítulo 2 la casa de ECO, capítulo 3 el director. GSAP ScrollTrigger con pin. Tipografía Newsreader.

## 97-claqueta · Claqueta · peso media
Interfaz de claqueta: escena y toma como navegación (ESCENA 1 TOMA 1 = documental), la claqueta se cierra (GSAP) al cambiar de sección, con un chasquido opcional por Web Audio que solo suena si el visitante lo activa. Tipografía Permanent Marker solo en la claqueta, Chivo para el resto.

## 98-elige · Elige tu entrada · peso ligera
La portada ofrece dos puertas: la mina (documental) o la casa (ECO). Según la elección, el orden y la paleta de la página cambian (ocre o azul verdoso) con una clase en body. Tipografía Bricolage Grotesque.

## 99-sala-de-montaje · Sala de montaje · peso media
Línea de tiempo de edición como navegación: pistas (video, audio, títulos), clips con miniaturas, cabezal que se arrastra (GSAP Draggable) y mueve la página. Tipografía Geist Mono y Geist. Gris de software de edición.

## 100-juego-de-luz · Juego de luz · peso media
La progresión de luz de ECO (5 fotogramas) como control: un deslizador cambia la luz de toda la página, de ámbar a azul, incluidas las fotos (filter) y el fondo (GSAP para interpolar). Tipografía Playfair Display y Public Sans.
