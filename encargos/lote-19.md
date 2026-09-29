# Lote 19: Fluido premium ligero

La prioridad de Jose: que entrar se sienta premium y suave, y que pese poco. Referencias: familia 'fluido' (Hervé Baillargeon, Siena Film, Studio Dumbar).

Construye estos cinco prototipos, cada uno en su carpeta `protos/NN-slug/`:

## 91-lenis-puro · Lenis puro · peso media
Lenis para el scroll con inercia, GSAP solo para tres reveals, tipografía grande en Inter Tight, nada de WebGL, HTML de menos de 70 kB. Negro cálido y blanco. Cada imagen entra con una máscara que se abre.

## 92-transiciones-nativas · Transiciones nativas · peso ligera
Multipágina (index, documental, eco, fotografia, director, contacto como páginas dentro de la carpeta) con View Transitions API cross-document (@view-transition{navigation:auto}) y fundidos entre páginas sin JS. Tipografía Manrope. Gris muy oscuro.

## 93-solo-css · Solo CSS · peso ligera
Cero JavaScript salvo el reproductor: reveals con animation-timeline: view(), barra de progreso con scroll(), navegación con :target. Tipografía Bricolage Grotesque. Crema y negro.

## 94-respiracion · Respiración · peso ligera
Todo respira: easing lento (cubic-bezier suave), fundidos de 900 ms, nada brusco, tipografía fina (Figtree 300) muy grande, mucho aire, fondo gris cálido casi blanco. Un solo acento: el naranja del casco de las mineras.

## 95-un-solo-scroll · Un solo scroll · peso ligera
Una sola columna larga con cabeceras pegajosas que se apilan (position sticky) y cambian de color por sección, indicador de progreso arriba, IntersectionObserver para marcar la sección activa. Tipografía Schibsted Grotesk. Negro y crema.
