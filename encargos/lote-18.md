# Lote 18: Perú y el mundo

El documental viajó a 15 festivales en 4 continentes desde Lima. Mapas, husos, sellos, postales.

Construye estos cinco prototipos, cada uno en su carpeta `protos/NN-slug/`:

## 86-mapa · Mapa de festivales · peso media
Mapa del mundo en SVG simplificado (dibujado con paths propios, sin librería de mapas) con Lima al centro y líneas hacia los 15 festivales que se dibujan con GSAP DrawSVG simulado con stroke-dashoffset. Cada punto abre la ficha del festival. Tipografía Geist.

## 87-husos-horarios · Husos horarios · peso media
Relojes de aeropuerto para Lima, Sídney, Noida, Nueva York, Londres, Lisboa, Bilbao, Lagos, Karachi, Cincinnati, Santiago, con hora real (JS propio). Tablero de salidas con letras que giran (GSAP) para los premios. Tipografía Tourney.

## 88-pasaporte · Pasaporte · peso ligera
Un pasaporte con sellos de cada festival (SVG circular con ciudad y fecha, rotados), páginas con marca de agua, tipografía Roboto Flex y una mono. Verde pasaporte y tinta.

## 89-de-lima-al-mundo · De Lima al mundo · peso ligera
Línea de tiempo vertical del recorrido del documental por ciudades y fechas (2025 a 2026), con la línea que se dibuja al bajar (animation-timeline en CSS). Tipografía Hanken Grotesk. Blanco y azul.

## 90-postales · Postales · peso ligera
Cada festival es una postal (frente con fotograma completo, dorso con datos) que se voltea al pasar el cursor o tocar. Sobres y estampillas en CSS. Tipografía Caveat solo para la 'escritura' y Lora para el resto.
