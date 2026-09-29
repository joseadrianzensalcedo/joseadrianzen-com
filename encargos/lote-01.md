# Lote 1: Apple oscuro

Premium, negro, aire, tipografía grande y limpia, una idea por pantalla. Se juzga por precisión: márgenes, ritmo, transiciones suaves. Referencias del atlas: familia 'apple' en referencias-por-familia.md.

Construye estos cinco prototipos, cada uno en su carpeta `protos/NN-slug/`:

## 01-negro-puro · Negro puro · peso ligera
Fondo #000 exacto, texto blanco, una grotesca fina y grande (Inter Tight o Geist a 300/400). Cada sección ocupa la pantalla con la imagen centrada y completa, texto corto debajo. Aparición por scroll con opacidad y 24 px de desplazamiento, nada más.

## 02-ficha-de-producto · Ficha de producto · peso ligera
Cada obra se presenta como un producto de lanzamiento: lámina gris carbón con degradado apenas visible, imagen grande, titular de tres palabras, y una tabla de 'especificaciones' (formato 2K o 6K, duración, idioma, subtítulos) con líneas finas. Comparativa lado a lado documental y ECO.

## 03-keynote · Keynote · peso ligera
Frases gigantes una por pantalla ('Tres años.', 'Una mina.', 'Ellas.') con scroll-snap, grotesca a 900 en negro sobre negro azulado. Las imágenes entran entre frases a pantalla completa y completas. Navegación mínima arriba a la derecha.

## 04-vidrio · Vidrio · peso media
Paneles translúcidos con backdrop-filter sobre fotogramas completos, navegación flotante en pastilla, tipografía Manrope. Lenis para el scroll. Bordes de 1 px con blanco al 12 %. Todo en tonos de carbón y blanco, acento oro discreto.

## 05-revelado · Revelado · peso media
Sección fija que se revela por scroll (sticky + clip-path o máscara) como las páginas de producto de Apple: el afiche aparece por franjas, los fotogramas se abren desde un punto. GSAP ScrollTrigger con scrub. Tipografía Schibsted Grotesk.
