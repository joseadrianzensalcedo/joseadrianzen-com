/* Motor de movimiento de joseadrianzen.com. Un solo archivo para todas las páginas: cada parte revisa si su elemento existe.

   HILO CONDUCTOR. Entradas suaves de fotos, letras que llegan en desorden y se asientan,
   caracteres que se descifran y foco que se ajusta. Las fotos conservan su textura original.
   Curvas de la casa: expo.out para entrar, power3 para responder (medidas en Hervé Baillargeon). Duraciones 0,9 s, 1,3 s y 1,6 s.

   Marcas en el HTML que este archivo entiende:
   data-letras="gigante|titulo|eco"  título que entra letra por letra
   data-lineas                       texto que sube línea por línea desde su máscara
   data-aparece                      rótulo que aparece corrido
   data-cascada                      sus hijos suben en cascada
   data-descifra                     texto que se descifra como contador
   data-revela-foto                  figura con foto que entra con un encuadre suave
   data-cursor="Ver"                 lo que dice el cursor al pasar
   data-armar                        logo con letras que se arma al cargar */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

window.__mov = true;
gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);
const R = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINO = matchMedia('(hover: hover) and (pointer: fine)').matches;
const html = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const SALE = 'expo.out', ENTRA = 'power3.out';
const T = JSON.parse($('#textos-mov')?.textContent || '{}');
if (R) html.classList.remove('mov', 'intro');

/* 1. Scroll suave con Lenis, en el mismo reloj que GSAP. */
let lenis = null;
if (!R) {
  lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.85 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* 2. Menú superior: se esconde al bajar y vuelve al subir. */
const nav = $('.nav');
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
  const y = s.scroll(), lim = Math.min(innerHeight * 0.8, 500);
  nav.classList.toggle('solido', y > 24);
  nav.classList.toggle('oculto', s.direction === 1 && y > lim && !html.classList.contains('menu-abierto'));
} });

/* 3. Logos que se arman: cada letra llega desde un punto distinto, girada y a otra escala, parpadea como señal y se asienta.
      Las rayas se trazan desde el centro y la línea de código entra en fila. El dibujo final es el logo exacto, letras completas. */
function armar(svg) {
  const al = gsap.utils.random, L = $$('.l', svg), D = $$('.d', svg), Rr = $$('.r', svg);
  return gsap.timeline()
    .set(svg, { visibility: 'visible' })
    .fromTo(Rr, { scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0)
    .fromTo(L, { xPercent: () => al(-260, 260), yPercent: () => al(-170, 170), rotate: () => al(-40, 40), scale: () => al(0.3, 1.8), transformOrigin: '50% 50%' },
      { xPercent: 0, yPercent: 0, rotate: 0, scale: 1, duration: 1.4, ease: SALE, stagger: { each: 0.055, from: 'random' } }, 0.1)
    .fromTo(L, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'steps(5)', stagger: { each: 0.055, from: 'random' } }, 0.1)
    .to(L, { fill: '#dbac76', duration: 0.18, stagger: 0.035, yoyo: true, repeat: 1, ease: 'none' }, 1.35)
    .fromTo(D, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.6, ease: ENTRA, stagger: 0.07 }, 1.0);
}
function ola(svg) {
  const L = $$('.l', svg); if (!L.length || svg._ola) return; svg._ola = 1;
  gsap.timeline({ onComplete: () => { svg._ola = 0; } })
    .to(L, { yPercent: -22, duration: 0.28, ease: 'power2.out', stagger: 0.035 })
    .to(L, { yPercent: 0, duration: 0.55, ease: 'bounce.out', stagger: 0.035 }, 0.28);
}
if (!R) $$('.nav-logo svg, [data-armar]').forEach((svg) => {
  svg.parentNode.addEventListener('pointerenter', () => ola(svg));
  svg.parentNode.addEventListener('touchstart', () => ola(svg), { passive: true });
});

/* 4. Cabecera. En la portada, la primera visita de la sesión tiene la entrada tipo Hervé (medida cuadro a cuadro):
      el nombre se arma sobre negro, se abre una rendija vertical en 1 s, pausa de 0,15 s y se abre en horizontal en 1 s. */
const hero = $('.hero'), fondo = hero && $('.fondo', hero), logoArmar = $$('[data-armar]');
const acc = $$('.hero-acc');
if (!R && hero && html.classList.contains('intro') && logoArmar[0]) {
  if (lenis) lenis.stop();
  const c = {}; ['arriba', 'abajo', 'izq', 'der'].forEach((k) => { const d = document.createElement('div'); d.className = 'cortina ' + k; hero.appendChild(d); c[k] = d; });
  html.classList.remove('intro');
  const saltar = document.createElement('button'); saltar.type = 'button'; saltar.className = 'saltar'; saltar.textContent = T.saltarIntro || 'Saltar intro'; hero.appendChild(saltar);
  const fin = () => { Object.values(c).forEach((d) => d.remove()); saltar.remove(); if (lenis) lenis.start(); try { sessionStorage.setItem('ja-intro', '1'); } catch (e) {} };
  const tl = gsap.timeline({ onComplete: fin });
  tl.set(fondo, { scale: 1.28 }, 0)
    .add(armar(logoArmar[0]), 0.3)
    .addLabel('abre', 1.9)
    .to(c.arriba, { yPercent: -100, duration: 1, ease: 'power2.out' }, 'abre')
    .to(c.abajo, { yPercent: 100, duration: 1, ease: 'power2.out' }, 'abre')
    .to(c.izq, { xPercent: -100, duration: 1, ease: ENTRA }, 'abre+=1.15')
    .to(c.der, { xPercent: 100, duration: 1, ease: ENTRA }, 'abre+=1.15')
    .to(fondo, { scale: 1, duration: 2.6, ease: SALE }, 'abre')
    .fromTo([nav, '.tc'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: ENTRA }, 'abre+=1.6')
    .fromTo(acc, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, ease: ENTRA, stagger: 0.08 }, 'abre+=1.68');
  saltar.addEventListener('click', () => tl.progress(1));
  addEventListener('keydown', function k(ev) { if (ev.key === 'Escape') { tl.progress(1); removeEventListener('keydown', k); } });
} else if (!R) {
  html.classList.remove('intro');
  logoArmar.forEach((svg) => armar(svg).delay(0.15));
  if (fondo) gsap.fromTo(fondo, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: SALE });
  gsap.fromTo([nav, '.tc'], { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: ENTRA, delay: 0.3 });
  if (acc.length) gsap.fromTo(acc, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, ease: ENTRA, stagger: 0.08, delay: 0.35 });
}

/* 5. Al bajar, la foto de cabecera va más lento (paralaje) y el pie de la cabecera se aleja. */
if (!R && hero && fondo) {
  gsap.to(fondo, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 } });
  gsap.to('.hero-pie', { yPercent: -18, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: '35% top', end: 'bottom top', scrub: 0.8 } });
}

/* La franja de festivales conserva su propio control de movimiento. */
let franjaQuieta = () => {};

/* 7. Textos. Cada línea sube desde detrás de su máscara, así nada se pisa. Los títulos entran letra por letra en desorden,
      con parpadeo en pasos.
      Con el cursor o el dedo encima, las letras se gastan una por una, como el título de la película en AWAKENNING
      STEEL (pedido de Jose, 1 oct 2026, en vez del reflejo de luz).
      Cómo es ese desgaste, mirado de cerca: la letra está estampada sobre una chapa de acero estriada. Se ven granos
      finos en forma de lenteja con puntas, inclinados a 45 grados hacia un lado y hacia el otro, en una red en diamante.
      Donde la chapa está limpia salen pocas lentejas, finas y rotas. Donde está gastada se agrandan, se juntan y dejan
      parches blancos de borde quebrado con islas de tinta. Los bordes de la letra quedan apenas mordidos.
      Técnico: una textura propia (public/texturas/desgaste.png, hecha con herramientas/textura-desgaste.py, sin copiar
      nada de la fuente) que se usa como máscara: donde la textura es transparente, la letra tiene un hueco. Se repite
      cada 2,8 em, así escala con el tamaño de la letra, y cada letra toma un pedazo distinto. Un filtro SVG chico mueve
      el borde 1 % del tamaño de la letra para que no quede liso. Historia (1 oct 2026): 24 % fue "demasiado exagerado",
      10 % con puntos pareció "escopeta", y solo tajos pareció "una reja". La versión actual no se ajustó a ojo: se
      midió STEEL contra AWAKENNING (hueco 22 %, tamaño, alargamiento, solidez e inclinación de cada hueco, cuánto
      cambia el gasto de zona a zona y qué tan ordenada se ve la red) y una búsqueda de parámetros
      (herramientas/desgaste-busca.py) dejó la textura con las mismas medidas (herramientas/desgaste-metricas.py).
      Se descartaron dos caminos: tajos sueltos en red perfecta ("una reja") y lentejas curvas todas iguales (escamas).
      La versión final copia también otro rasgo de STEEL: el gasto corre en bandas a lo ancho, como raspado.
      Intensidad: un poco menos que STEEL (en la página, Bebas a 140 px: 16 % de hueco; la versión idéntica a STEEL
      da 20 %), porque Jose vio "exagerado" el desgaste completo. Para volver a la intensidad exacta de STEEL basta
      generar con sesgo=-0.8 vis0=0.5 (herramientas/textura-desgaste.py).
      Parámetros en herramientas/desgaste-parametros.txt (SS=1). */
const bordes = new Map();
const svgBordes = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svgBordes.setAttribute('aria-hidden', 'true'); svgBordes.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
document.body.appendChild(svgBordes);
function filtroBorde(fs) {
  // un filtro por tamaño de letra (redondeado), porque el filtro trabaja en píxeles y no en em
  const t = Math.max(12, Math.round(fs / 8) * 8); if (bordes.has(t)) return bordes.get(t);
  const id = 'borde-' + t, f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  f.setAttribute('id', id); f.setAttribute('x', '-25%'); f.setAttribute('y', '-40%'); f.setAttribute('width', '150%'); f.setAttribute('height', '180%');
  f.innerHTML = '<feTurbulence type="fractalNoise" baseFrequency="' + (1 / (0.035 * t)).toFixed(4) + '" numOctaves="2" seed="' + (t % 97) + '" result="r"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="r" scale="' + (0.012 * t).toFixed(2) + '" xChannelSelector="R" yChannelSelector="G"/>';
  svgBordes.appendChild(f); const url = 'url(#' + id + ')'; bordes.set(t, url); return url;
}
// La textura y la letra AWAKENNING STEEL se piden al abrir la página (sin mostrarse), así la primera pasada del cursor
// ya las tiene. Sin esto, la primera vez el título cambiaba a medias: el navegador baja la letra recién cuando se usa.
addEventListener('load', () => { if ($('.titulo-pelicula')) document.fonts?.load?.('40px "Awakenning Steel"'); const d = document.createElement('div'); d.className = 'gastada precarga'; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); });
function ponerGasto(c, poner, sinBorde) {
  if (poner) {
    if (!c.style.getPropertyValue('--mx')) { c.style.setProperty('--mx', (Math.random() * 2.8).toFixed(2) + 'em'); c.style.setProperty('--my', (Math.random() * 2.8).toFixed(2) + 'em'); }
    c.classList.add('gastada'); if (!sinBorde) c.style.filter = filtroBorde(parseFloat(getComputedStyle(c).fontSize) || 16);
  } else { c.classList.remove('gastada'); c.style.filter = ''; }
}
/* El nombre de la película va siempre en su letra, AWAKENNING, en títulos y rótulos (no dentro de textos largos como la
   sinopsis o la biografía). Si el elemento es solo el nombre, toma la letra entero. Si el nombre está dentro de un rótulo,
   se envuelve esa parte. Pedido de Jose, 1 oct 2026. */
/* El nombre de la película en el idioma de la página, más las formas en español e inglés que quedan en textos sueltos. */
const TIT = (() => { try { return JSON.parse(document.documentElement.dataset.titulo || '{}'); } catch (e) { return {}; } })();
const FORMAS = [...new Set([TIT.real, 'Entre polvo y sueños', 'Between Dust and Dreams', 'Dust and Dreams'].filter(Boolean))].sort((a, b) => b.length - a.length);
const NOMBRES_PELI = new RegExp('(' + FORMAS.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')).join('|') + ')', 'i'), LARGO = 90;
// En árabe, hindi y tailandés el nombre se dibuja por palabras enteras: el texto visible cambia y el real queda como etiqueta.
const dibujar = (el, texto) => { if (TIT.dib && texto.replace(/\s+/g, ' ').toLowerCase() === (TIT.real || '').toLowerCase()) { el.setAttribute('aria-label', TIT.real); el.textContent = TIT.pintado; } else el.textContent = texto; };
// Si el navegador no logra cargar la letra del título (en árabe, hindi y tailandés cada palabra es un carácter propio y sin la letra
// salen cuadros), se vuelve al texto real con la letra normal. Pasó en Safari del iPhone (5 oct 2026).
const volverAlTexto = () => {
  document.documentElement.classList.add('titulo-sin-letra');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (/[\uE000-\uF8FF]/.test(n.data)) n.data = n.data.replace(/[\uE000-\uF8FF]/g, (c) => TIT.mapa?.[c] || c);
  if (typeof ajustarGigantes === 'function') ajustarGigantes();
};
const letraTitulo = (TIT.dib && document.fonts?.load)
  ? document.fonts.load('100px "Titulo ' + document.documentElement.lang.slice(0, 2) + '"', TIT.pintado).then((f) => { if (!f.length) volverAlTexto(); }).catch(volverAlTexto)
  : Promise.resolve();
const textoCorto = (el) => { const b = el.closest('p,li,h1,h2,h3,h4,h5,h6,div,figcaption,blockquote') || el; return b.textContent.trim().length <= LARGO; };
(() => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), nodos = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) if (NOMBRES_PELI.test(n.data)) nodos.push(n);
  nodos.forEach((n) => {
    const el = n.parentElement; if (!el || el.closest('script,style,title,.titulo-pelicula,[aria-hidden="true"],.nav,.menu-capa') || !textoCorto(el)) return;
    const solo = n.data.trim().replace(/\s+/g, ' ');
    if (el.childNodes.length === 1 && NOMBRES_PELI.test(solo) && solo.replace(NOMBRES_PELI, '') === '') { el.classList.add('titulo-pelicula'); dibujar(el, solo); return; }
    const partes = n.data.split(NOMBRES_PELI), f = document.createDocumentFragment();
    partes.forEach((t, i) => { if (!t) return; if (i % 2) { const sp = document.createElement('span'); sp.className = 'titulo-pelicula'; dibujar(sp, t); f.appendChild(sp); } else f.appendChild(document.createTextNode(t)); });
    n.replaceWith(f);
  });
})();
/* En el teléfono el efecto no puede ser el mismo que con el mouse: un dedo tapa muchas letras a la vez y casi siempre está
   moviendo la página. Reglas (pedido de Jose, 5 oct 2026, "los efectos son exagerados"): solo se activa si el dedo se queda
   quieto 140 ms (si se mueve más de 8 px es scroll y no pasa nada), toca solo la mitad de las letras y dura 0,8 s. */
const toque = (el, cambiar) => {
  let x0 = 0, y0 = 0;
  el.addEventListener('touchstart', (e) => {
    const p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; clearTimeout(el._espera);
    el._espera = setTimeout(() => { cambiar(true); clearTimeout(el._vuelta); el._vuelta = setTimeout(() => cambiar(false), 800); }, 140);
  }, { passive: true });
  el.addEventListener('touchmove', (e) => { const p = e.touches[0]; if (Math.hypot(p.clientX - x0, p.clientY - y0) > 8) clearTimeout(el._espera); }, { passive: true });
  el.addEventListener('touchend', () => clearTimeout(el._espera), { passive: true });
  el.addEventListener('touchcancel', () => clearTimeout(el._espera), { passive: true });
};
const alcanza = (poner) => !poner || FINO || Math.random() < 0.5;
function gastar(el, poner) {
  if (!el._partes) return; (el._relojes || []).forEach(clearTimeout);
  el._relojes = el._partes.map((c, i) => setTimeout(() => {
    if (!alcanza(poner)) return;
    // Las letras del nombre de la película no se gastan con el filtro: cambian a AWAKENNING STEEL, como en la portada.
    if (c.closest('.titulo-pelicula,.titulo-documental')) { c.classList.toggle('acero', poner); return; }
    ponerGasto(c, poner);
  }, gsap.utils.random(0, 320)));
}
const ESTILOS = {
  gigante: { desde: { yPercent: 115, rotate: 7, transformOrigin: '0% 100%' }, hasta: { yPercent: 0, rotate: 0, duration: 1.5, ease: SALE }, esc: 0.03, pasos: true },
  titulo: { desde: { yPercent: () => gsap.utils.random(-60, 60) }, hasta: { yPercent: 0, duration: 1.3, ease: SALE }, esc: 0.035, pasos: true },
  eco: { desde: { scale: 1.1, opacity: 0, filter: 'blur(10px)', transformOrigin: '50% 60%' }, hasta: { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: SALE }, esc: 0.16, pasos: false },
};
/* Títulos gigantes que no caben. En español "adentro" entra justo, pero en ruso o polaco la palabra más larga
   puede tener el doble de letras. Si el título es más ancho que su caja, se achica lo necesario y nada más. */
// Se mide una copia sin animación: las letras en movimiento no alteran el tamaño de premios ni títulos.
function medirLineasTitulo(el) {
  if (!el?.dataset.lineasTitulo) return null;
  const lineas = JSON.parse(el.dataset.lineasTitulo), cs = getComputedStyle(el);
  const muestra = document.createElement('span');
  muestra.setAttribute('aria-hidden', 'true');
  Object.assign(muestra.style, {
    position: 'fixed', visibility: 'hidden', pointerEvents: 'none', whiteSpace: 'pre',
    width: 'max-content', maxWidth: 'none', left: '0', top: '0',
    fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle, fontStretch: cs.fontStretch, letterSpacing: cs.letterSpacing,
    textTransform: cs.textTransform, direction: cs.direction,
  });
  document.body.appendChild(muestra);
  const anchos = lineas.map((linea) => { muestra.textContent = linea; return muestra.getBoundingClientRect().width; });
  muestra.remove();
  return anchos;
}
function anchoNatural(el) {
  const lineasTitulo = medirLineasTitulo(el);
  if (lineasTitulo) return Math.max(...lineasTitulo);
  // Mide las letras mismas (cada nodo de texto), no las cajas que las envuelven, así sirve antes y después de partirlas.
  const caja = el.getBoundingClientRect(), rtl = getComputedStyle(el).direction === 'rtl'; let m = 0;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const r = document.createRange();
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!n.textContent.trim()) continue;
    r.selectNodeContents(n); const t = r.getBoundingClientRect();
    m = Math.max(m, rtl ? caja.right - t.left : t.right - caja.left);
  }
  return m;
}
function ajustarGigantes() {
  const bloquePeli = $('.hero-izq');
  bloquePeli?.style.removeProperty('--ancho-titulo');
  $$('.gigante, .eco-titulo, .eco-t').forEach((el) => {
    el.style.fontSize = '';
    for (let i = 0; i < 3; i++) {
      const sobra = anchoNatural(el) / el.clientWidth;
      if (sobra <= 1.005) break;
      el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) / sobra) * 0.98 + 'px';
    }
  });
  const tituloPeli = bloquePeli && $('[data-lineas-titulo]', bloquePeli);
  const primeraLinea = medirLineasTitulo(tituloPeli)?.[0];
  if (primeraLinea > 0) bloquePeli.style.setProperty('--ancho-titulo', Math.min(primeraLinea, tituloPeli.clientWidth) + 'px');
}
const fuentesListas = document.fonts?.ready ?? Promise.resolve();
fuentesListas.then(ajustarGigantes);
document.fonts?.addEventListener?.('loadingdone', ajustarGigantes);
let tAjuste, anchoPrevio = innerWidth;
addEventListener('resize', () => { if (innerWidth === anchoPrevio) return; anchoPrevio = innerWidth; clearTimeout(tAjuste); tAjuste = setTimeout(ajustarGigantes, 150); });
if (!R) {
  const listo = Promise.all([fuentesListas, letraTitulo]);
  listo.then(() => {
    /* En árabe, hindi y tailandés las letras se unen o llevan signos encima. Partirlas letra por letra las rompe,
       así que ahí el título se arma palabra por palabra. En los demás idiomas se envuelven también las palabras: sin eso,
       una palabra larga ("poussière", "Zwischen") se partía a media palabra en la línea de abajo. */
    const POR_PALABRA = /^(ar|hi|th)/.test(document.documentElement.lang);
    $$('[data-letras]').forEach((el) => {
      const E = ESTILOS[el.dataset.letras] || ESTILOS.titulo;
      SplitText.create(el, { type: 'lines,words' + (POR_PALABRA ? '' : ',chars'), mask: 'lines', linesClass: 'linea', wordsClass: 'pal-t', charsClass: 'car', aria: el.hasAttribute('aria-label') ? 'none' : 'auto', autoSplit: true, onSplit: (s) => {
        const partes = POR_PALABRA ? s.words : s.chars;
        gsap.set(el, { visibility: 'visible' }); el._partes = partes;
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
          .fromTo(partes, E.desde, { ...E.hasta, stagger: { each: E.esc, from: 'random' } }, 0);
        if (E.pasos) tl.fromTo(partes, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'steps(4)', stagger: { each: E.esc, from: 'random' } }, 0);
        return tl;
      } });
      /* Título de la película: con el cursor encima, las letras pasan de AWAKENNING a AWAKENNING STEEL una por una, en
         desorden y en un tercio de segundo, y vuelven igual al salir. Las dos letras miden lo mismo, así nada se mueve.
         Los demás títulos se gastan con el filtro de arriba, con el mismo ritmo. */
      const pelicula = el.matches('.titulo-pelicula,.titulo-documental');
      const cambiar = (poner) => {
        if (!pelicula) return gastar(el, poner);
        if (!el._partes) return; (el._relojes || []).forEach(clearTimeout);
        el._relojes = el._partes.map((c) => setTimeout(() => { if (alcanza(poner)) c.classList.toggle('acero', poner); }, gsap.utils.random(0, 320)));
      };
      if (FINO) { el.addEventListener('pointerenter', () => cambiar(true)); el.addEventListener('pointerleave', () => cambiar(false)); }
      else toque(el, cambiar);
    });
    $$('[data-lineas]').forEach((el) => {
      /* En pantallas táctiles el texto sale con un fundido simple. La división en líneas con máscara dejaba párrafos y títulos
         invisibles en Safari del iPhone, así que ahí no se usa. */
      if (!FINO) { gsap.fromTo(el, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: SALE, scrollTrigger: { trigger: el, start: 'top 94%', once: true } }); return; }
      SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'linea', autoSplit: true, aria: 'none', onSplit: (s) => {
        gsap.set(el, { visibility: 'visible' });
        return gsap.fromTo(s.lines, { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: SALE, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      } });
    });
    ScrollTrigger.refresh();
  });
  $$('[data-aparece]').forEach((el) => gsap.fromTo(el, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 1.1, ease: ENTRA, scrollTrigger: { trigger: el, start: 'top 94%', once: true } }));
  $$('[data-cascada]').forEach((el) => gsap.fromTo(el.children, { y: el.matches('.hero-peli .laureles') ? 16 : 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: SALE, stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

  /* Premios que se descifran letra por letra, como un contador que busca su valor. */
  const SIG = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  $$('[data-descifra]').forEach((el, i) => {
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => {
      const final = el.textContent, p = { v: 0 };
      if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block'; el.style.minWidth = el.getBoundingClientRect().width + 'px'; el.setAttribute('aria-label', final);
      gsap.to(p, { v: 1, duration: 1.2, delay: 0.15 + (i % 4) * 0.15, ease: 'power1.inOut', onUpdate: () => {
        const n = Math.floor(p.v * final.length); let s = final.slice(0, n);
        for (let j = n; j < final.length; j++) s += final[j] === ' ' ? ' ' : SIG[Math.floor(Math.random() * SIG.length)];
        el.textContent = s;
      }, onComplete: () => { el.textContent = final; } });
    } });
  });

  /* Todo lo que no es texto largo también se gasta con el cursor o el dedo: títulos, rótulos de sección, premios, la
     franja de festivales, datos de la película. Se reconocen por su letra (Bebas, AWAKENNING o la de máquina en
     mayúsculas) y por ser cortos. No se tocan la barra de arriba, el menú, los botones ni el logo, cuyas letras van
     siempre completas. Las letras se separan recién la primera vez que pasas encima. */
  fuentesListas.then(() => {
    const FUERA = '.nav,.menu-capa,button,input,select,textarea,label,[data-armar],.rp,.reproductor,[data-letras],script,style';
    const vistos = new Set();
    const directo = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
    $$('main *, footer *').forEach((el) => {
      if (!directo(el) || el.closest(FUERA)) return;
      const cs = getComputedStyle(el), f = cs.fontFamily;
      const pantalla = /Bebas|Awakenning|Oswald/i.test(f) || (/Plex Mono/i.test(f) && cs.textTransform === 'uppercase');
      if (!pantalla || (!textoCorto(el) && !el.closest('.franja'))) return;
      // Se toma el bloque corto más grande que lo contiene (así "02 PELÍCULAS" se gasta junto).
      let t = el; while (t.parentElement && t.parentElement.matches('span,b,em,strong,a,i,small') && textoCorto(t.parentElement) && !t.parentElement.closest(FUERA)) t = t.parentElement;
      const enc = t.closest('.enc'); if (enc && textoCorto(enc)) t = enc; // el rótulo de sección ("02 PELÍCULAS") se gasta entero
      vistos.add(t.closest('.franja') || t); // la franja se gasta entera: su texto corre y es muy largo para partirlo
    });
    [...vistos].filter((t) => ![...vistos].some((o) => o !== t && o.contains(t))).forEach((t) => {
      const larga = t.textContent.trim().length > 60 || t.closest('.franja') || t.hasAttribute('data-lineas');
      const partir = () => {
        if (larga) return;
        if (t._partes && t._partes.every((c) => c.isConnected)) return;
        if (t._split) t._split.revert();
        t._split = SplitText.create(t, { type: 'chars', tag: 'g-l', charsClass: 'letra-g' }); t._partes = t._split.chars;
      };
      const cambiar = (poner) => {
        if (larga) { ponerGasto(t.matches(".franja") ? $("p", t) : t, poner, true); return; } // la franja es muy ancha para el filtro de borde
        partir(); gastar(t, poner);
      };
      if (FINO) { t.addEventListener('pointerenter', () => cambiar(true)); t.addEventListener('pointerleave', () => cambiar(false)); }
      else toque(t, cambiar);
    });
  });
}

/* 8. Fotos: entrada de encuadre y paralaje, sin capas de textura animada. */
if (!R) {
  $$('[data-revela-foto]').forEach((f) => {
    const enc = $('.encuadre', f) || $('img', f);
    ScrollTrigger.create({ trigger: f, start: 'top 88%', once: true, onEnter: () => {
      gsap.fromTo(enc, { scale: 1.2 }, { scale: 1, duration: 2.2, ease: SALE });
      gsap.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' });
    } });
  });
  $$('[data-paralaje]').forEach((f) => gsap.to($('.encuadre', f) || $('img', f), { yPercent: 6, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
}

/* 8b. Cuadros que cambian solos (fotogramas y rodaje del documental). Cada cuadro corta a su siguiente imagen cada
       2,4 s, desfasado de los demás para que no cambien todos a la vez. Solo corre mientras se ve en pantalla. */
$$('[data-rotativo]').forEach((r) => {
  if (R) return;
  const cuadros = $$('.rot-cuadro', r).filter((c) => c.children.length > 1); let reloj = 0;
  const pasar = (c) => { const imgs = [...c.children], i = imgs.findIndex((x) => x.classList.contains('on')); imgs[i].classList.remove('on'); imgs[(i + 1) % imgs.length].classList.add('on'); };
  let turno = 0;
  const latir = () => { if (!cuadros.length) return; pasar(cuadros[turno % cuadros.length]); turno += 1 + (Math.random() < 0.3 ? 1 : 0); };
  new IntersectionObserver((e) => { clearInterval(reloj); if (e[0].isIntersecting) reloj = setInterval(latir, 600); }).observe(r);
  // Las imágenes que esperan su turno se cargan cuando el cuadro aparece, no al abrir la página.
  r.querySelectorAll('img').forEach((im) => { im.loading = 'lazy'; });
});

/* 9. Franja de festivales: corre sola y acelera con la velocidad del scroll. Se detiene con el cursor o el botón. */
const franja = $('.franja p'), fbtn = $('.franja-ctl button');
if (franja && fbtn) {
  let fx = 0, quieta = R, sobre = false, vel = 0;
  franjaQuieta = (q) => { quieta = q; fbtn.textContent = q ? T.mover : T.detener; fbtn.setAttribute('aria-pressed', String(q)); };
  fbtn.addEventListener('click', () => franjaQuieta(!quieta));
  franja.parentNode.addEventListener('pointerenter', () => { sobre = true; });
  franja.parentNode.addEventListener('pointerleave', () => { sobre = false; });
  if (R) fbtn.hidden = true;
  gsap.ticker.add((t, dt) => {
    if (quieta) return;
    const objetivo = sobre ? 0 : 0.55 + Math.min(6, Math.abs(lenis ? lenis.velocity : 0) * 0.35);
    vel += (objetivo - vel) * 0.08; fx -= vel * (dt / 16.7); const w = franja.scrollWidth / 2; if (-fx >= w) fx += w;
    gsap.set(franja, { x: fx });
  });
}

/* 10. Hoja de fotos: corre sola, en bucle, de derecha a izquierda, para que las fotos se vayan descubriendo.
       Con el dedo o el mouse se agarra y se lleva a donde se quiera. Al soltar sigue con la inercia y vuelve poco a poco
       a su marcha. Con el mouse encima se detiene. Fuera de pantalla no gasta nada. Con movimiento reducido no corre sola.
       Técnico: las fotos se repiten (copias ocultas a lectores de pantalla) hasta cubrir la pantalla y la posición se envuelve
       sobre el ancho de un juego completo, así nunca hay un borde. El gesto es de pointer events con touch-action pan-y:
       el scroll vertical de la página sigue funcionando sobre la hoja. */
const hoja = $('.hoja'), carril = $('.carril');
if (hoja && carril) {
  const originales = $$('figure', hoja);
  const copiar = () => { $$('figure[data-copia]', hoja).forEach((f) => f.remove()); const w = (hoja.scrollWidth + 14) || 1, veces = Math.max(1, Math.ceil(innerWidth * 1.2 / w)); for (let v = 0; v < veces; v++) originales.forEach((f) => { const c = f.cloneNode(true); c.setAttribute('data-copia', ''); c.setAttribute('aria-hidden', 'true'); $$('img', c).forEach((i) => { i.alt = ''; i.removeAttribute('id'); }); hoja.appendChild(c); }); };
  if (R) {
    Draggable.create(hoja, { type: 'x', bounds: carril, edgeResistance: 0.85, dragResistance: 0.05, zIndexBoost: false });
  } else {
    copiar();
    let ciclo = 1, x = 0, vel = 0, agarrada = false, encima = false, visible = true, id = null, ux = 0, ut = 0;
    const medir = () => { const c = $('figure[data-copia]', hoja); ciclo = c ? c.offsetLeft - originales[0].offsetLeft : 1; };
    medir(); addEventListener('load', medir); addEventListener('resize', () => { copiar(); medir(); todas = $$('figure', hoja); });
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '80px' }).observe(hoja);
    const CRUCERO = -(FINO ? 46 : 38); // px por segundo, hacia la izquierda
    hoja.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') encima = true; });
    hoja.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') encima = false; });
    hoja.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; id = e.pointerId; agarrada = true; ux = e.clientX; ut = performance.now(); vel = 0; hoja.classList.add('agarrada'); try { hoja.setPointerCapture(id); } catch (er) {} });
    hoja.addEventListener('pointermove', (e) => { if (!agarrada || e.pointerId !== id) return; const t = performance.now(), dx = e.clientX - ux, dt = Math.max(1, t - ut);
      x += dx; vel += ((dx / dt) * 1000 - vel) * 0.35; ux = e.clientX; ut = t; });
    const soltar = (e) => { if (e.pointerId !== id) return; agarrada = false; id = null; hoja.classList.remove('agarrada'); if (performance.now() - ut > 120) vel = 0; vel = gsap.utils.clamp(-2600, 2600, vel); };
    hoja.addEventListener('pointerup', soltar); hoja.addEventListener('pointercancel', soltar); hoja.addEventListener('lostpointercapture', soltar);
    let todas = $$('figure', hoja), sk = 0;
    gsap.ticker.add((t, dt) => {
      if (!visible) return;
      const s = Math.min(dt, 50) / 1000;
      if (!agarrada) { const meta = encima ? 0 : CRUCERO; vel += (meta - vel) * (1 - Math.exp(-s * (encima ? 5 : 1.6))); x += vel * s; }
      x = gsap.utils.wrap(-ciclo, 0, x);
      let skw = 0; if (lenis) { const tope = FINO ? 5 : 2.5; skw = gsap.utils.clamp(-tope, tope, -lenis.velocity * 0.18); }
      sk += (skw - sk) * 0.1;
      gsap.set(hoja, { x });
      if (Math.abs(sk) > 0.01 || skw) gsap.set(todas, { skewY: sk });
    });
  }
}

/* 11. Botón principal magnético: sigue al cursor unos pocos píxeles. */
if (FINO && !R) $$('.btn').forEach((b) => {
  const qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'elastic.out(1,0.4)' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'elastic.out(1,0.4)' });
  b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.25); qy((e.clientY - r.top - r.height / 2) * 0.35); });
  b.addEventListener('pointerleave', () => { qx(0); qy(0); });
});

/* 12. ECO: un fotograma encendido a la vez, de clave alta a clave baja. Con scroll en escritorio, con el dedo en el carrusel. */
$$('.luz').forEach((luzEl) => {
  const luces = $$('figure', luzEl), encender = (i) => luces.forEach((f, k) => f.classList.toggle('on', k === i));
  if (R) { luces.forEach((f) => f.classList.add('on')); return; }
  encender(0);
  if (!FINO && luzEl.scrollWidth > luzEl.clientWidth + 4) luzEl.addEventListener('scroll', () => {
    const c = luzEl.scrollLeft + luzEl.clientWidth / 2; let mejor = 0, d = 1e9;
    luces.forEach((f, k) => { const x = Math.abs(f.offsetLeft + f.offsetWidth / 2 - c); if (x < d) { d = x; mejor = k; } }); encender(mejor);
  }, { passive: true });
  else ScrollTrigger.create({ trigger: luzEl, start: 'top 80%', end: 'bottom 30%', onUpdate: (s) => encender(Math.min(luces.length - 1, Math.floor(s.progress * luces.length))) });
  gsap.fromTo(luces, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: SALE, stagger: 0.08, scrollTrigger: { trigger: luzEl, start: 'top 92%', once: true } });
});

/* 13. Blog. Con mouse o lápiz, la imagen del artículo aparece junto al puntero con bordes esfumados.
       Con el dedo, presión larga: la imagen aparece sobre el dedo, sigue de fila en fila y se va al soltar. */
const flota = $('.flota'), filas = $$('.fila[data-img]');
if (!R && flota && filas.length) {
  const fxq = gsap.quickTo(flota, 'x', { duration: 0.75, ease: 'power3' }), fyq = gsap.quickTo(flota, 'y', { duration: 0.75, ease: 'power3' }),
    frq = gsap.quickTo(flota, 'rotate', { duration: 0.9, ease: 'power3' });
  /* El centrado va con GSAP: la propiedad CSS translate la borra GSAP al animar y la imagen quedaba más abajo del cursor,
     tapada por el aviso de cookies o fuera de la pantalla. */
  gsap.set(flota, { xPercent: -50, yPercent: -58 });
  /* Si la imagen es vertical (el afiche) se muestra entera, con su propia forma, nunca recortada. */
  const ajustar = () => flota.classList.toggle('vert', flota.naturalHeight > flota.naturalWidth * 1.05);
  flota.addEventListener('load', ajustar);
  /* El borde esfumado se dibuja desde JS y no con una variable CSS animada dentro de la máscara: Safari no repinta la máscara
     cuando cambia la variable y la imagen se quedaba casi transparente. */
  const vi = { v: 0 };
  const mascara = () => { if (!FINO) return; if (flota.classList.contains('vert')) { flota.style.webkitMaskImage = ''; flota.style.maskImage = ''; return; }
    const m = 'radial-gradient(closest-side,#000 ' + vi.v.toFixed(1) + '%,transparent ' + (vi.v + 38).toFixed(1) + '%)'; flota.style.webkitMaskImage = m; flota.style.maskImage = m; };
  mascara();
  flota.addEventListener('load', mascara);
  let ux = 0, actual = null, presion = null, reloj = 0, t0 = null;
  /* Con el dedo la imagen sale casi al tocar (90 ms). Antes pedía una presión larga y quieta de 260 ms: en el iPhone, apenas el dedo
     se movía un poco, la página empezaba a deslizarse y la imagen nunca aparecía. Un deslizar normal (más de 8 px) sigue siendo scroll. */
  const TOQUE = 90;
  /* Se bajan las imágenes de antemano: la primera vez la caja medía cero hasta que la foto llegaba y la imagen no se veía. */
  filas.forEach((f) => { const i = new Image(); i.decoding = 'async'; i.src = f.dataset.img; });
  /* En el teléfono la miniatura sube bastante por encima del dedo (la mano tapa todo lo que está debajo)
     y no se sale por los costados. */
  const arriba = (y) => y - (flota.offsetHeight * 0.42 + 64);
  const dentro = (x) => { const m = flota.offsetWidth / 2 + 12; return Math.min(innerWidth - m, Math.max(m, x)); };
  const mostrar = (a, x, y) => {
    /* La imagen se cambia en el acto. Antes se esperaba a que terminara un fundido, pero la animación siguiente
       cancelaba ese fundido y la imagen nueva nunca llegaba: quedaba pegada la del primer artículo. */
    const primera = !actual;
    if (primera) { gsap.set(flota, { x, y }); flota.src = a.dataset.img; }
    else if (actual !== a) { flota.src = a.dataset.img; gsap.set(flota, { opacity: 0.35 }); }
    actual = a; gsap.to(vi, { v: 62, duration: primera ? 0.9 : 0.5, ease: SALE, overwrite: 'auto', onUpdate: mascara }); gsap.to(flota, { opacity: 1, scale: 1, ...(FINO ? { filter: 'blur(0px)' } : {}), duration: primera ? 0.9 : 0.5, ease: SALE, overwrite: 'auto' });
  };
  const ocultar = () => { actual = null; gsap.to(vi, { v: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto', onUpdate: mascara }); gsap.to(flota, { opacity: 0, scale: 0.92, ...(FINO ? { filter: 'blur(6px)' } : {}), duration: 0.6, ease: 'power3.out', overwrite: 'auto' }); };
  const seguir = (x, y) => { fxq(x); fyq(y); frq(gsap.utils.clamp(-7, 7, (x - ux) * 0.6)); ux = x; };
  const limpiar = () => $$('.fila.presionada').forEach((x) => x.classList.remove('presionada'));
  const soltar = () => { clearTimeout(reloj); clearTimeout(finScroll); esperaScroll = false; if (!presion) return; const a = presion; presion = null; ocultar(); limpiar(); a._sinClic = true; setTimeout(() => { a._sinClic = false; }, 400); };
  /* Al empezar el scroll, iOS puede avisar con touchcancel aunque el dedo siga abajo: la imagen se queda hasta que el scroll se detiene. */
  let esperaScroll = false, finScroll = 0;
  const cancelado = () => { clearTimeout(reloj); if (!presion) return; esperaScroll = true; clearTimeout(finScroll); finScroll = setTimeout(soltar, 450); };
  addEventListener('scroll', () => { if (!esperaScroll) return; clearTimeout(finScroll); finScroll = setTimeout(soltar, 450); }, { passive: true });
  filas.forEach((a) => {
    a.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') mostrar(a, e.clientX, e.clientY); });
    a.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; if (!e.relatedTarget?.closest?.('.fila')) ocultar(); });
    a.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') seguir(e.clientX, e.clientY); });
    a.addEventListener('touchstart', (e) => { const t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY };
      clearTimeout(reloj); reloj = setTimeout(() => { presion = a; mostrar(a, dentro(t0.x), arriba(t0.y)); a.classList.add('presionada'); try { navigator.vibrate?.(8); } catch (er) {} }, TOQUE); }, { passive: true });
    /* El dedo puede seguir deslizando la página con la imagen puesta: no se bloquea el scroll. La imagen sigue al dedo,
       cambia según la fila que tenga debajo y se va cuando el dedo sale de la lista o se levanta. */
    a.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (!presion) return;
      const f = document.elementFromPoint(t.clientX, t.clientY)?.closest?.('.fila[data-img]');
      if (!f) { if (actual) ocultar(); limpiar(); return; }
      seguir(dentro(t.clientX), arriba(t.clientY));
      if (f !== actual) { limpiar(); f.classList.add('presionada'); mostrar(f, dentro(t.clientX), arriba(t.clientY)); }
      else if (!a.classList.contains('presionada') && !f.classList.contains('presionada')) f.classList.add('presionada'); }, { passive: true });
    a.addEventListener('touchend', soltar); a.addEventListener('touchcancel', cancelado);
    a.addEventListener('contextmenu', (e) => { if (matchMedia('(pointer: coarse)').matches) e.preventDefault(); });
  });
  gsap.ticker.add(() => { if (actual && Math.abs(gsap.getProperty(flota, 'rotation')) > 0.05) frq(0); });
}

/* 15. Código de tiempo de película abajo a la izquierda: el avance de la página leído sobre los 37:02 de Entre polvo y sueños a 24 cuadros. Es un guiño, no un dato. */
const tc = $('.tc span');
if (hero) { html.classList.add('en-cabecera'); ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom 40%', onToggle: (st) => html.classList.toggle('en-cabecera', st.isActive), onRefresh: (st) => html.classList.toggle('en-cabecera', st.isActive || scrollY < 10) }); }
if (tc) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
  const cuadros = Math.round(s.progress * (37 * 60 + 2) * 24), f = cuadros % 24, seg = Math.floor(cuadros / 24), d = (n) => String(n).padStart(2, '0');
  tc.textContent = '00:' + d(Math.floor(seg / 60)) + ':' + d(seg % 60) + ':' + d(f);
} });

/* 16. Barra de lectura del artículo: avanza como la tira que corre por el proyector. */
const barra = $('.barra-lectura i'), articulo = $('.post-cuerpo');
if (barra && articulo) gsap.fromTo(barra, { scaleX: 0 }, { scaleX: 1, ease: 'none', transformOrigin: '0 50%', scrollTrigger: { trigger: articulo, start: 'top 60%', end: 'bottom 70%', scrub: true } });

/* 18. Menú a pantalla completa. Baja como cortina y los nombres suben uno por uno. Se cierra con el botón, con Escape
       o al elegir una sección. El foco queda dentro mientras está abierto. */
const bMenu = $('.menu'), capa = $('.menu-capa');
let abierto = false, tlM = null;
const lnkM = capa ? $$('a', capa) : [];
function menu(abrir) {
  if (!capa || abrir === abierto) return; abierto = abrir;
  bMenu.setAttribute('aria-expanded', String(abrir)); bMenu.textContent = abrir ? T.cerrar : T.menu;
  nav.classList.remove('oculto'); html.classList.toggle('menu-abierto', abrir);
  tlM?.kill();
  if (abrir) {
    capa.hidden = false; lenis?.stop();
    tlM = gsap.timeline()
      .fromTo(capa, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: R ? 0 : 0.9, ease: 'expo.inOut' })
      .fromTo($$('.mascara > span', capa), { yPercent: 110 }, { yPercent: 0, duration: R ? 0 : 1, ease: SALE, stagger: 0.06 }, R ? 0 : 0.35)
      .fromTo($('.menu-pie', capa), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, R ? 0 : 0.7);
    setTimeout(() => lnkM[0]?.focus({ preventScroll: true }), R ? 0 : 400);
  } else {
    tlM = gsap.timeline({ onComplete: () => { capa.hidden = true; lenis?.start(); } })
      .to($$('.mascara > span', capa), { yPercent: -110, duration: R ? 0 : 0.45, ease: 'power3.in', stagger: 0.03 })
      .to(capa, { clipPath: 'inset(100% 0% 0% 0%)', duration: R ? 0 : 0.8, ease: 'expo.inOut' }, R ? 0 : 0.2);
    bMenu.focus({ preventScroll: true });
  }
}
if (bMenu && capa) {
  bMenu.setAttribute('aria-controls', 'menu'); bMenu.setAttribute('aria-expanded', 'false');
  bMenu.addEventListener('click', () => menu(!abierto));
  addEventListener('keydown', (e) => {
    if (!abierto) return;
    if (e.key === 'Escape') { menu(false); return; }
    if (e.key === 'Tab') { const foc = [...lnkM, bMenu], i = foc.indexOf(document.activeElement); e.preventDefault(); foc[(i + (e.shiftKey ? -1 : 1) + foc.length) % foc.length].focus(); }
  });
}

/* 19. Navegación directa; dentro de la misma página se conserva el scroll suave. */
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0 || a.target === '_blank' || a.hasAttribute('download')) return;
  if (a._sinClic) { e.preventDefault(); return; }
  const href = a.getAttribute('href');
  const correo = /^(mailto|tel):/i.test(href);
  if (!correo && /^https?:/i.test(href) && a.host !== location.host) return;
  e.preventDefault();
  const enMenu = !!a.closest('.menu-capa'), mismaPagina = a.pathname === location.pathname && a.hash;
  if (correo) { location.href = href; return; }
  if (enMenu && mismaPagina) menu(false);
  if (mismaPagina) {
    const ir = () => { if (lenis) lenis.scrollTo(a.hash, { offset: -60, duration: 1.4 }); else document.querySelector(a.hash)?.scrollIntoView({ behavior: R ? 'auto' : 'smooth' }); };
    enMenu ? setTimeout(ir, 650) : ir();
  } else if (a.href !== location.href) location.href = a.href;
  else if (enMenu) menu(false);
});

addEventListener('load', () => ScrollTrigger.refresh());
addEventListener('pageshow', (e) => { if (e.persisted) { html.classList.remove('menu-abierto'); if (capa) capa.hidden = true; } });

/* Red de seguridad: si por cualquier motivo un título no llegó a revelarse (la división en líneas no corrió), a los 5 s queda visible. */
setTimeout(() => { $$('[data-lineas],[data-letras]').forEach((el) => { if (getComputedStyle(el).visibility === 'hidden' && !el.children.length) el.style.visibility = 'visible'; }); }, 5000);

/* 20. Modo de diagnóstico: solo si la dirección lleva ?depura. Muestra en una caja sobre la página los errores de JavaScript
       y qué pasa con la imagen del blog al tocar. Sirve para ver en el teléfono lo que no se puede ver desde la computadora. */
if (location.search.includes('depura')) {
  const caja = document.createElement('pre'); caja.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;margin:0;padding:8px;max-height:40vh;overflow:auto;background:#000c;color:#9f9;font:11px/1.35 monospace;white-space:pre-wrap;pointer-events:none';
  document.body.appendChild(caja); const lineas = [];
  const dec = (t) => { lineas.push(t); if (lineas.length > 14) lineas.shift(); caja.textContent = lineas.join('\n'); };
  addEventListener('error', (e) => dec('ERROR ' + e.message + ' ' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  addEventListener('unhandledrejection', (e) => dec('PROMESA ' + (e.reason && e.reason.message || e.reason)));
  const f = $('.flota'); dec('listo. flota=' + !!f + ' hoja=' + !!$('.hoja') + ' lineasSinDividir=' + $$('[data-lineas]').filter((x) => !x.children.length).length);
  ['touchstart', 'touchend', 'touchcancel'].forEach((n) => addEventListener(n, (e) => { setTimeout(() => { const r = f ? f.getBoundingClientRect() : null, s = f ? getComputedStyle(f) : null;
    dec(n + ' en ' + (e.target.closest?.('.fila') ? 'fila' : e.target.tagName) + (f ? ' | op ' + (+s.opacity).toFixed(2) + ' ' + (f.naturalWidth || 0) + 'px ' + (f.complete ? 'cargada' : 'sin cargar') + ' caja ' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' mask ' + (s.webkitMaskImage || s.maskImage || '').slice(0, 30) : '')); }, 400); }, { passive: true, capture: true }));
  setInterval(() => dec('lineas ocultas ' + $$('[data-lineas]').filter((x) => getComputedStyle(x).visibility === 'hidden').length), 4000);
}
