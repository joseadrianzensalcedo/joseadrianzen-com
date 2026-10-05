/* Motor de movimiento de joseadrianzen.com. Un solo archivo para todas las páginas: cada parte revisa si su elemento existe.

   HILO CONDUCTOR. Una sola idea: todo se revela como una imagen que termina de cargar.
   Lo que entra pasa de ruido a nitidez (fotos de píxeles gruesos a nítidas, letras que llegan en desorden y se asientan,
   caracteres que se descifran, foco que se ajusta). Lo que tocas se vuelve píxel por un instante.
   Curvas de la casa: expo.out para entrar, power3 para responder (medidas en Hervé Baillargeon). Duraciones 0,9 s, 1,3 s y 1,6 s.

   Marcas en el HTML que este archivo entiende:
   data-letras="gigante|titulo|eco"  título que entra letra por letra
   data-lineas                       texto que sube línea por línea desde su máscara
   data-aparece                      rótulo que aparece corrido
   data-cascada                      sus hijos suben en cascada
   data-descifra                     texto que se descifra como contador
   data-pix                          figura con foto que entra en píxeles y se pixela bajo el cursor o el dedo
   data-cursor="Ver"                 lo que dice el cursor al pasar
   data-armar                        logo con letras que se arma al cargar */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';
import { granoGLSL, uniformesGrano } from './grano.js';

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

/* 2. Menú superior: se esconde al bajar, vuelve al subir y toma fondo al dejar la cabecera. */
const nav = $('.nav');
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
  const y = s.scroll(), lim = Math.min(innerHeight * 0.8, 500);
  nav.classList.toggle('solido', y > lim);
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
const acc = $$('.hero-acc, .pausa');
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

/* 6. El plano de cabecera respira (luego será el corte en bucle). Pausa visible, WCAG 2.2.2. */
const pausa = $('.pausa');
const respira = R || !fondo ? null : gsap.to(fondo, { xPercent: -1.2, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });
let franjaQuieta = () => {};
if (pausa) {
  if (!respira) pausa.hidden = true;
  pausa.addEventListener('click', () => {
    const p = respira.paused(); respira.paused(!p); franjaQuieta(!p);
    pausa.textContent = p ? T.pausa : T.seguir; pausa.setAttribute('aria-pressed', String(!p));
  });
}

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
  f.setAttribute('id', id); f.setAttribute('x', '-5%'); f.setAttribute('y', '-5%'); f.setAttribute('width', '110%'); f.setAttribute('height', '110%');
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
function gastar(el, poner) {
  if (!el._partes) return; (el._relojes || []).forEach(clearTimeout);
  el._relojes = el._partes.map((c, i) => setTimeout(() => {
    // Las letras del nombre de la película no se gastan con el filtro: cambian a AWAKENNING STEEL, como en la portada.
    if (c.closest('.titulo-pelicula')) { c.classList.toggle('acero', poner); return; }
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
function anchoNatural(el) {
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
  $$('.gigante, .eco-titulo, .eco-t').forEach((el) => {
    el.style.fontSize = '';
    for (let i = 0; i < 3; i++) {
      const sobra = anchoNatural(el) / el.clientWidth;
      if (sobra <= 1.005) break;
      el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) / sobra) * 0.98 + 'px';
    }
  });
}
const fuentesListas = document.fonts?.ready ?? Promise.resolve();
fuentesListas.then(ajustarGigantes);
document.fonts?.addEventListener?.('loadingdone', ajustarGigantes);
let tAjuste, anchoPrevio = innerWidth;
addEventListener('resize', () => { if (innerWidth === anchoPrevio) return; anchoPrevio = innerWidth; clearTimeout(tAjuste); tAjuste = setTimeout(ajustarGigantes, 150); });
if (!R) {
  const listo = fuentesListas;
  listo.then(() => {
    /* En árabe, hindi y tailandés las letras se unen o llevan signos encima. Partirlas letra por letra las rompe,
       así que ahí el título se arma palabra por palabra. En los demás idiomas se envuelven también las palabras: sin eso,
       una palabra larga ("poussière", "Zwischen") se partía a media palabra en la línea de abajo. */
    const POR_PALABRA = /^(ar|hi|th)/.test(document.documentElement.lang);
    $$('[data-letras]').forEach((el) => {
      const E = ESTILOS[el.dataset.letras] || ESTILOS.titulo;
      SplitText.create(el, { type: 'lines,words' + (POR_PALABRA ? '' : ',chars'), mask: 'lines', linesClass: 'linea', wordsClass: 'pal-t', autoSplit: true, onSplit: (s) => {
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
      const pelicula = el.classList.contains('titulo-pelicula');
      const cambiar = (poner) => {
        if (!pelicula) return gastar(el, poner);
        if (!el._partes) return; (el._relojes || []).forEach(clearTimeout);
        el._relojes = el._partes.map((c) => setTimeout(() => c.classList.toggle('acero', poner), gsap.utils.random(0, 320)));
      };
      if (FINO) { el.addEventListener('pointerenter', () => cambiar(true)); el.addEventListener('pointerleave', () => cambiar(false)); }
      else el.addEventListener('touchstart', () => { cambiar(true); clearTimeout(el._vuelta); el._vuelta = setTimeout(() => cambiar(false), 1400); }, { passive: true });
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
  $$('[data-cascada]').forEach((el) => gsap.fromTo(el.children, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: SALE, stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

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
    const FUERA = '.nav,.menu-capa,button,input,select,textarea,label,[data-armar],.rp,.reproductor,.pausa,[data-letras],script,style';
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
      else t.addEventListener('touchstart', () => { cambiar(true); clearTimeout(t._vuelta); t._vuelta = setTimeout(() => cambiar(false), 1400); }, { passive: true });
    });
  });
}

/* 8. Fotos con grano. Peras y manzanas: la foto entra cubierta de grano grueso de película antigua y se limpia en 1,3 s,
      como una copia que se revela. Después, por donde pasa el mouse, el dedo o el lápiz, el grano vuelve y se va solo.
      El grano es una simulación de la película de verdad (ver grano.js): granitos de plata redondos, de tamaños
      distintos, repartidos al azar según lo oscuro de cada punto de la foto. Por eso en lo claro salen granos oscuros
      sueltos, en lo oscuro salen huecos claros, y en los tonos medios hay más grano.
      Técnico: un contexto WebGL por foto, creado solo cuando la foto está cerca de la pantalla y liberado al alejarse
      (los navegadores permiten pocos contextos a la vez). La simulación es pesada, así que no se calcula en cada cuadro:
      se calculan 4 versiones del grano de la foto (3 en el teléfono), por partes, sin trabar la página, y se guardan en la
      tarjeta gráfica. Al mostrar se pasa de una a otra 24 veces por segundo, como el grano que cambia en cada fotograma.
      28 puntos de estela con caída gaussiana deciden dónde se ve. Sin WebGL, la foto se abre como un obturador. */
const PIX_VS = 'attribute vec2 p;varying vec2 u;void main(){u=p*.5+.5;gl_Position=vec4(p,0,1);}';
const NP = 28, VERSIONES = FINO ? 4 : 3, FOTO_GL = 'uniform sampler2D t;uniform vec2 cov,op;';
const fotoGLSL = 'vec3 foto(vec2 q){vec2 c=(q-.5)*cov+op;c.y=1.-c.y;return texture2D(t,c).rgb;}';
// La versión guardada lleva la diferencia del grano en el canal rojo: 0,5 es sin cambio.
const PIX_GRANO = granoGLSL({ muestras: FINO ? 8 : 6, cabecera: FOTO_GL + fotoGLSL, tono: 'vec3 tono(vec2 q){return foto(q/px);}', salida: 'vec4 salida(float d,float a){return vec4(.5+.5*d,0.,0.,1.);}' });
const PIX_FS = 'precision highp float;varying vec2 u;uniform sampler2D g;uniform vec2 px;uniform vec3 pt[' + NP + '];uniform float fz,ue,hay,tope;' + FOTO_GL + fotoGLSL +
  'float est(vec2 q){float k=0.;float asp=px.x/px.y;for(int i=0;i<' + NP + ';i++){vec2 d=(q-pt[i].xy)*vec2(asp,1.);k+=pt[i].z*exp(-dot(d,d)/.010);}return k;}' +
  'void main(){vec3 col=foto(u);' +
  // Sin estela (ue casi 0) no se recorren los 28 puntos: la foto entra solo con el nivel fz.
  'float k=fz;if(ue>.01)k=max(est(u),fz);' +
  'if(k>.01&&hay>.5)col=clamp(col+(texture2D(g,u).r*2.-1.)*min(k,1.)*tope,0.,1.);' +
  'gl_FragColor=vec4(col,1.);}';

function crearPix(fig) {
  const img = $('img', fig); let cv = $('canvas.pix', fig);
  if (!cv) { cv = document.createElement('canvas'); cv.className = 'pix'; cv.setAttribute('aria-hidden', 'true'); ($('.encuadre', fig) || fig).appendChild(cv); }
  const gl = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false }); if (!gl) return null;
  const sh = (tp, src) => { const x = gl.createShader(tp); gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const programa = (fs) => { const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, PIX_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr); return pr; };
  const pr = programa(PIX_FS), prG = programa(PIX_GRANO);
  /* Peras y manzanas: armar el efecto toma un momento. El navegador lo arma por detrás (KHR_parallel_shader_compile)
     y la foto lo usa recién cuando está listo, sin congelar la página. */
  const par = gl.getExtension('KHR_parallel_shader_compile');
  let enlazado = false, fallo = false, alEnlazar = null;
  const terminar = () => {
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS) || !gl.getProgramParameter(prG, gl.LINK_STATUS)) { fallo = true; return; }
    enlazado = true; preparar(); alEnlazar && alEnlazar();
  };
  const esperar = () => { if (gl.isContextLost()) return; if (gl.getProgramParameter(pr, par.COMPLETION_STATUS_KHR) && gl.getProgramParameter(prG, par.COMPLETION_STATUS_KHR)) terminar(); else requestAnimationFrame(esperar); };
  let U = {}, UG = {}, tx, escala = 1;
  const capas = []; let listas = 0, gen = null;
  function preparar() {
    const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx); filtros(gl.LINEAR);
    const L = (q, n) => gl.getUniformLocation(q, n);
    ['px', 'cov', 'op', 'pt', 'fz', 'ue', 'hay', 'tope', 't', 'g'].forEach((n) => { U[n] = L(pr, n); });
    ['px', 'cov', 'op', 't', 'sem', 'gm', 'gs', 'ger2', 'grmax', 'xi'].forEach((n) => { UG[n] = L(prG, n); });
    gl.useProgram(prG); gl.uniform1i(UG.t, 0);
    gl.useProgram(pr); gl.uniform1i(U.t, 0); gl.uniform1i(U.g, 1); gl.uniform1f(U.tope, FINO ? 0.8 : 0.6);
    if (img.complete && img.naturalWidth) cargar(); else img.addEventListener('load', cargar, { once: true });
  }
  function filtros(f) {
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, f));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, gl.CLAMP_TO_EDGE));
  }
  /* Las versiones del grano se calculan por franjas de unos 90 mil píxeles por cuadro de pantalla: así nunca se traba. */
  function generar() {
    gen = null; if (gl.isContextLost() || listas >= VERSIONES) return;
    const c = capas[listas], W = cv.width, H = cv.height, alto = Math.max(8, Math.floor(90000 / W));
    gl.useProgram(prG); gl.bindFramebuffer(gl.FRAMEBUFFER, c.fb); gl.viewport(0, 0, W, H); gl.enable(gl.SCISSOR_TEST);
    if (c.y === 0) { const q = uniformesGrano(escala, listas * 7 + 3, { muestras: FINO ? 8 : 6 });
      gl.uniform1f(UG.sem, q.sem); gl.uniform1f(UG.gm, q.gm); gl.uniform1f(UG.gs, q.gs); gl.uniform1f(UG.ger2, q.ger2); gl.uniform1f(UG.grmax, q.grmax); gl.uniform2fv(UG.xi, q.xi); }
    gl.scissor(0, c.y, W, alto); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); c.y += alto;
    gl.disable(gl.SCISSOR_TEST); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.useProgram(pr);
    if (c.y >= H) { listas++; if (listas === 1) { gl.uniform1f(U.hay, 1); alPrimera && alPrimera(); alPrimera = null; } }
    if (listas < VERSIONES) gen = requestAnimationFrame(generar);
  }
  let alPrimera = null;
  const pts = new Float32Array(NP * 3); let cab = 0, cargada = false, activo = false;
  const m = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, dentro: false };
  const medir = () => {
    const w = cv.clientWidth, h = cv.clientHeight; escala = Math.min(devicePixelRatio || 1, 1.5); if (!w || !h) return;
    const W = Math.round(w * escala), H = Math.round(h * escala); if (W === cv.width && H === cv.height && capas.length) return;
    cv.width = W; cv.height = H; gl.viewport(0, 0, W, H);
    const ai = img.naturalWidth / img.naturalHeight, ac = w / h, sw = ac > ai ? 1 : ac / ai, shh = ac > ai ? ai / ac : 1;
    const op = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
    const ox = isNaN(op[0]) ? 0.5 : op[0], oy = isNaN(op[1]) ? 0.5 : op[1];
    for (const q of [[pr, U], [prG, UG]]) { gl.useProgram(q[0]); gl.uniform2f(q[1].px, W, H); gl.uniform2f(q[1].cov, sw, shh); gl.uniform2f(q[1].op, ox * (1 - sw) + sw / 2, oy * (1 - shh) + shh / 2); }
    gl.useProgram(pr);
    // Las versiones del grano se rehacen al tamaño nuevo.
    if (gen) cancelAnimationFrame(gen); listas = 0; gl.uniform1f(U.hay, 0);
    for (const c of capas) { gl.deleteFramebuffer(c.fb); gl.deleteTexture(c.tx); } capas.length = 0;
    gl.activeTexture(gl.TEXTURE1);
    for (let i = 0; i < VERSIONES; i++) {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); filtros(gl.NEAREST);
      const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      capas.push({ tx: t, fb, y: 0 });
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.activeTexture(gl.TEXTURE0);
    gen = requestAnimationFrame(generar);
  };
  const dibujar = () => {
    let e = 0; for (let i = 2; i < pts.length; i += 3) e += pts[i];
    if (listas) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, capas[Math.floor(performance.now() / (1000 / 24)) % listas].tx); gl.activeTexture(gl.TEXTURE0); }
    gl.uniform1f(U.ue, e); gl.uniform3fv(U.pt, pts); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const cargar = () => { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); cargada = true; gl.useProgram(pr); medir(); };
  if (par) requestAnimationFrame(esperar); else terminar();
  if (fallo) return null;
  const alRedimensionar = () => cargada && medir(); addEventListener('resize', alRedimensionar);
  function paso() {
    const dx = m.x - m.sx, dy = m.y - m.sy; m.sx += dx * 0.35; m.sy += dy * 0.35;
    const vel = Math.min(1, Math.hypot(dx, dy) * 9);
    if (m.dentro && vel > 0.03) { pts[cab * 3] = m.sx; pts[cab * 3 + 1] = m.sy; pts[cab * 3 + 2] = (0.25 + vel * 0.75) * (FINO ? 1 : 0.4); cab = (cab + 1) % NP; }
    let vida = 0; for (let i = 0; i < NP; i++) { pts[i * 3 + 2] *= 0.93; vida += pts[i * 3 + 2]; }
    dibujar();
    if (!m.dentro && vida < 0.02) { activo = false; gsap.ticker.remove(paso); gsap.to(cv, { opacity: 0, duration: 0.2 }); }
  }
  return {
    // Lista cuando está armada, la foto cargada y la primera versión del grano calculada.
    listo: () => enlazado && cargada && listas > 0,
    cuandoListo(f) {
      const tras = () => (listas > 0 ? f() : (alPrimera = f));
      const conFoto = () => (cargada ? tras() : img.addEventListener('load', () => requestAnimationFrame(tras), { once: true }));
      if (enlazado) conFoto(); else alEnlazar = conFoto;
    },
    fz(v) { if (!cargada) return; gl.uniform1f(U.fz, v); dibujar(); cv.style.opacity = v > 0 ? 1 : 0; },
    punto(x, y, golpe) {
      if (!cargada) return; const r = cv.getBoundingClientRect(); m.x = (x - r.left) / r.width; m.y = 1 - (y - r.top) / r.height;
      if (!m.dentro) { m.sx = m.x; m.sy = m.y; } m.dentro = true;
      if (golpe) { pts[cab * 3] = m.x; pts[cab * 3 + 1] = m.y; pts[cab * 3 + 2] = 1.6; cab = (cab + 1) % NP; }
      if (!activo) { activo = true; dibujar(); gsap.ticker.add(paso); gsap.to(cv, { opacity: 1, duration: 0.25 }); }
    },
    fuera() { m.dentro = false; },
    liberar() { gsap.ticker.remove(paso); if (gen) cancelAnimationFrame(gen); removeEventListener('resize', alRedimensionar); gl.getExtension('WEBGL_lose_context')?.loseContext(); cv.remove(); },
  };
}
const figuras = $$('[data-pix]');
const cola = []; let colaActiva = false;
function encolar(f) {
  if (f._pix || f._enCola) return; f._enCola = true; cola.push(f);
  if (!colaActiva) { colaActiva = true; requestAnimationFrame(atender); }
}
function atender() {
  const f = cola.shift();
  if (f) { f._enCola = false; if (!f._pix) f._pix = crearPix(f); }
  if (cola.length) setTimeout(() => requestAnimationFrame(atender), 60); else colaActiva = false;
}
if (!R && figuras.length) {
  const vistas = new IntersectionObserver((es) => es.forEach((e) => {
    const f = e.target;
    if (e.isIntersecting && !f._pix) encolar(f);
    else if (!e.isIntersecting && f._pix && f._revelada) { f._pix.liberar(); f._pix = null; }
  }), { rootMargin: '300px 0px' });
  figuras.forEach((f) => {
    vistas.observe(f);
    const enc = $('.encuadre', f) || $('img', f);
    ScrollTrigger.create({ trigger: f, start: 'top 88%', once: true, onEnter: () => {
      gsap.fromTo(enc, { scale: 1.2 }, { scale: 1, duration: 2.2, ease: SALE });
      const pixelada = (p) => {
        const n = { v: 1 }; p.fz(1); gsap.set(f, { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.to(n, { v: 0, duration: 1.3, ease: 'power2.in', onUpdate: () => p.fz(n.v), onComplete: () => { p.fz(0); f._revelada = true; } });
      };
      const obturador = () => gsap.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', onComplete: () => { f._revelada = true; } });
      if (!f._pix) { encolar(f); }
      const p = f._pix;
      if (p && p.listo()) pixelada(p);
      else {
        // Si el efecto no está listo, se espera un poco (máximo 0,7 s). Si no llega, la foto entra como obturador.
        gsap.set(f, { clipPath: 'inset(100% 0% 0% 0%)' });
        let hecho = false;
        const plan = setTimeout(() => { if (!hecho) { hecho = true; obturador(); } }, 700);
        const intentar = () => { const q = f._pix; if (!q) return requestAnimationFrame(() => !hecho && intentar());
          q.cuandoListo(() => { if (hecho) return; hecho = true; clearTimeout(plan); pixelada(q); }); };
        intentar();
      }
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

/* 14. Cursor propio: punto y aro que lo sigue con retardo. Regla de la web: solo el círculo propio, sin flecha.
       Crece sobre enlaces y fotos y dice qué hace cada cosa. */
if (FINO && !R) {
  html.classList.add('con-cursor');
  const cur = $('.cursor'), aro = $('.aro', cur), pun = $('.punto', cur), etq = $('b', cur);
  const q = (el, p, d, e) => gsap.quickTo(el, p, { duration: d, ease: e });
  const ax = q(aro, 'x', 0.55, 'power3'), ay = q(aro, 'y', 0.55, 'power3'), px = q(pun, 'x', 0.08), py = q(pun, 'y', 0.08), bx = q(etq, 'x', 0.55, 'power3'), by = q(etq, 'y', 0.55, 'power3');
  gsap.set([aro, pun, etq], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
  addEventListener('pointermove', (e) => { ax(e.clientX); ay(e.clientY); px(e.clientX); py(e.clientY); bx(e.clientX); by(e.clientY); gsap.to(cur, { opacity: 1, duration: 0.3, overwrite: 'auto' }); });
  document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.3 }));
  addEventListener('pointerdown', () => gsap.to(aro, { scale: '-=0.25', duration: 0.2, ease: ENTRA }));
  addEventListener('pointerup', () => gsap.to(aro, { scale: aro._s || 1, duration: 0.5, ease: 'elastic.out(1,0.5)' }));
  const estado = (s, txt) => { aro._s = s; gsap.to(aro, { scale: s, duration: 0.6, ease: SALE, overwrite: 'auto' });
    gsap.to(pun, { scale: txt ? 0 : 1, duration: 0.3, overwrite: 'auto' }); if (txt) etq.textContent = txt; gsap.to(etq, { opacity: txt ? 1 : 0, duration: 0.3, overwrite: 'auto' });
    aro.classList.toggle('lleno', !!txt); };
  document.addEventListener('pointerover', (e) => {
    const c = e.target.closest?.('[data-cursor]'); if (c) { estado(2.2, c.dataset.cursor); return; }
    if (e.target.closest?.('a, button, [role=button], input, label')) estado(1.7); else estado(1);
  });
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

/* 17. Grano en toda la página. Donde está el mouse, el dedo o el lápiz, la página se vuelve un círculo de grano de
       película antigua, igual que sobre las fotos, y se apaga en cuanto el cursor se queda quieto o se va. No deja estela.
       Es la misma simulación de las fotos (grano.js): se lee el color real de lo que hay debajo (la foto, la letra, el logo
       o el fondo) y con eso se reparten los granos de plata. Sobre negro salen huecos claros, sobre blanco granos oscuros,
       y el dibujo del grano cambia 24 veces por segundo.
       Técnico: una sola capa WebGL fija sobre la página. El color de debajo se lee en una rejilla de 6 px alrededor del
       cursor (con memoria de medio segundo para no volver a leer lo mismo) y se sube como una textura chica. El shader
       calcula el grano solo dentro del cuadrado del círculo. */
const PX = (() => {
  const cv = document.createElement('canvas'); cv.className = 'estela'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
  /* La capa entrega el color ya multiplicado por su transparencia (premultipliedAlpha true, el modo por defecto).
     Safari en iPhone y iPad no respeta bien el otro modo: pintaba de blanco pleno lo que debía verse apenas, y el
     círculo salía como un disco blanco con borde duro (4 oct 2026, captura de Jose). */
  const gl = R ? null : cv.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  let W = 0, H = 0, K = 1;
  const G = FINO ? 6 : 8, memoria = new Map(); // rejilla de color: ver tonos()
  const datos = new WeakMap();
  const rgb = (s) => { const m = String(s).match(/[\d.]+/g); if (!m || m.length < 3) return null; const a = m.length > 3 ? +m[3] : 1; return a < 0.1 ? null : [+m[0], +m[1], +m[2]]; };
  function deImagen(img, x, y) {
    if (!img) return null; let d = datos.get(img);
    if (!d) { if (!img.complete || !img.naturalWidth) return null; const w = Math.min(320, img.naturalWidth), h = Math.round(w * img.naturalHeight / img.naturalWidth);
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
      try { d = { w, h, px: g.getImageData(0, 0, w, h).data }; } catch (e) { d = { err: 1 }; } datos.set(img, d); }
    if (d.err) return null;
    const r = img.getBoundingClientRect(), ai = img.naturalWidth / img.naturalHeight, ar = r.width / r.height;
    const op = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
    const sw = ar > ai ? 1 : ar / ai, sh = ar > ai ? ai / ar : 1;
    const u = (isNaN(op[0]) ? 0.5 : op[0]) * (1 - sw) + Math.min(1, Math.max(0, (x - r.left) / r.width)) * sw;
    const v = (isNaN(op[1]) ? 0.5 : op[1]) * (1 - sh) + Math.min(1, Math.max(0, (y - r.top) / r.height)) * sh;
    const i = (Math.min(d.h - 1, Math.floor(v * d.h)) * d.w + Math.min(d.w - 1, Math.floor(u * d.w))) * 4;
    return [d.px[i], d.px[i + 1], d.px[i + 2]];
  }
  const fondoDe = (el) => { while (el && el.nodeType === 1) { const c = rgb(getComputedStyle(el).backgroundColor); if (c) return c; el = el.parentElement; } return [12, 11, 10]; };
  function letra(x, y) {
    let n, o;
    if (document.caretRangeFromPoint) { const rg = document.caretRangeFromPoint(x, y); if (!rg) return null; n = rg.startContainer; o = rg.startOffset; }
    else if (document.caretPositionFromPoint) { const cp = document.caretPositionFromPoint(x, y); if (!cp) return null; n = cp.offsetNode; o = cp.offset; }
    if (!n || n.nodeType !== 3) return null;
    const r2 = document.createRange();
    for (let k = o - 1; k <= o; k++) { if (k < 0 || k >= n.length || !n.data[k].trim()) continue; r2.setStart(n, k); r2.setEnd(n, k + 1);
      const b = r2.getBoundingClientRect(); if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
        /* Una letra no llena su caja: en texto chico la tinta tapa cerca de un tercio, en los títulos grandes más.
           Se mezcla el color de la letra con el fondo en esa proporción, así el grano no dibuja bloques. */
        const e = n.parentElement, cs = getComputedStyle(e), t = rgb(cs.color); if (!t) return null;
        const f = fondoDe(e), k = parseFloat(cs.fontSize) > 40 ? 0.7 : 0.4;
        return [f[0] + (t[0] - f[0]) * k, f[1] + (t[1] - f[1]) * k, f[2] + (t[2] - f[2]) * k]; } }
    return null;
  }
  const heroImg = hero && $('.fondo', hero);
  function color(x, y) {
    const el = document.elementFromPoint(x, y); if (!el) return [12, 11, 10];
    if (el.tagName === 'IMG') return deImagen(el, x, y) || fondoDe(el);
    const trazo = el.closest?.('path, rect'); if (trazo) { const f = rgb(getComputedStyle(trazo).fill); if (f) return f; }
    const t = letra(x, y); if (t) return t;
    if (heroImg && el.closest?.('.hero') && !el.closest('.btn, .pausa, .nav')) {
      const c = deImagen(heroImg, x, y);
      if (c) { const r = hero.getBoundingClientRect(), p = (y - r.top) / r.height, a = p < 0.24 ? 0.55 * (1 - p / 0.24) : p > 0.48 ? 0.88 * (p - 0.48) / 0.52 : 0;
        return [c[0] * (1 - a) + 12 * a, c[1] * (1 - a) + 11 * a, c[2] * (1 - a) + 10 * a]; }
    }
    return fondoDe(el);
  }
  if (!gl) return { pixelar: (el, f) => f() };
  const MUESTRAS = FINO ? 6 : 5;
  const fs = granoGLSL({ muestras: MUESTRAS, cabecera: 'uniform sampler2D t;uniform vec4 caja;uniform vec3 cen;uniform float modo,alto,k;',
    // q viene en píxeles de pantalla con y hacia arriba. La textura de tono va en píxeles CSS con y hacia abajo.
    /* Sobre negro, el tono se sube un poco antes de simular el grano: con tanta plata cubriendo casi todo, el grano real deja
       muy pocos huecos claros y no se notaba. */
    tono: 'vec3 tono(vec2 q){vec2 c=vec2(q.x/k,alto-q.y/k);vec3 r=texture2D(t,(c-caja.xy)/caja.zw).rgb;float l=dot(r,vec3(.2126,.7152,.0722));return r+.24*pow(1.-l,5.);}',
    // Círculo: denso al centro y se apaga de a poco hasta cero justo en el borde (curva (1 − r²)³), así no queda
    // contorno marcado y el grano se funde con el fondo. Bloque (al tocar un enlace): parejo en toda la caja.
    mascara: 'float mascara(vec2 P){vec2 c=vec2(P.x/k,alto-P.y/k);if(modo>.5){vec2 d=(c-caja.xy)/caja.zw;return (d.x<0.||d.y<0.||d.x>1.||d.y>1.)?0.:cen.z;}' +
      'vec2 d=c-cen.xy;float r=dot(d,d)/(' + (FINO ? 84 : 64) + '.*' + (FINO ? 84 : 64) + '.);if(r>=1.)return 0.;float s=1.-r;return cen.z*s*s*s;}',
    // El grano se pone encima de la página sin taparla: blanco donde aclara, negro donde oscurece. La letra sigue nítida.
    /* Sobre fondo oscuro el grano real casi no se ve: quedan pocos huecos claros entre tanta plata. Por eso se
       refuerza según qué tan oscuro es el fondo (cerca de 4 veces sobre negro, casi nada sobre claro). */
    conBrillo: true,
    salida: 'vec4 salida(float d,float a,float b){float g=1.+3.*pow(1.-b,3.);float k=min(1.,abs(d)*a*g);return d>0.?vec4(k,k,k,k):vec4(0.,0.,0.,k);}' });
  const sh = (tp, src) => { const x = gl.createShader(tp); gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, PIX_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
  const par = gl.getExtension('KHR_parallel_shader_compile'); let listo = false;
  const U = {};
  const armar = () => {
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, gl.CLAMP_TO_EDGE));
    ['px', 'sem', 'gm', 'gs', 'ger2', 'grmax', 'xi', 'caja', 'cen', 'modo', 'alto', 'k', 't'].forEach((n) => { U[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1i(U.t, 0); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); listo = true; medir();
  };
  const esperar = () => { if (gl.getProgramParameter(pr, par.COMPLETION_STATUS_KHR)) armar(); else requestAnimationFrame(esperar); };
  function medir() {
    K = Math.min(devicePixelRatio || 1, FINO ? 2 : 1.5); W = innerWidth; H = innerHeight; cv.width = Math.round(W * K); cv.height = Math.round(H * K);
    memoria.clear(); if (!listo) return; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.px, cv.width, cv.height); gl.uniform1f(U.alto, H); gl.uniform1f(U.k, K);
  }
  medir(); addEventListener('resize', medir);
  if (par) requestAnimationFrame(esperar); else armar();

  /* Rejilla de color. Cada celda de 6 px de la página (en coordenadas del documento, para que el scroll no la mueva)
     guarda su color medio segundo. */
  /* Leer el color de la página es lo que más cuesta. Por cuadro se leen como mucho LEER celdas nuevas, el resto toma
     por un momento el color que hay bajo el cursor y se completa en los cuadros siguientes. Así el círculo sale en el
     mismo cuadro en que se mueve el dedo y no un rato después. */
  const LEER = FINO ? 90 : 50;
  function tonos(x0, y0, x1, y1, paso = G, cx, cy) {
    const sx = paso === G ? scrollX : 0, sy = paso === G ? scrollY : 0, ahora = performance.now();
    let leidas = 0, base = null;
    const i0 = Math.floor((x0 + sx) / paso), j0 = Math.floor((y0 + sy) / paso), i1 = Math.ceil((x1 + sx) / paso), j1 = Math.ceil((y1 + sy) / paso);
    const w = i1 - i0, h = j1 - j0, d = new Uint8Array(w * h * 3);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = (i0 + i + 0.5) * paso - sx, Y = (j0 + j + 0.5) * paso - sy; let c;
      if (paso === G) { const key = (i0 + i) + ',' + (j0 + j), m = memoria.get(key); if (m && ahora - m.t < 1500) c = m.c; else if (leidas >= LEER && cx !== undefined) c = base || (base = color(cx, cy)); else { leidas++; c = color(Math.min(W - 1, Math.max(0, X)), Math.min(H - 1, Math.max(0, Y))); memoria.set(key, { c, t: ahora }); } }
      else c = color(Math.min(W - 1, Math.max(0, X)), Math.min(H - 1, Math.max(0, Y)));
      const o = (j * w + i) * 3; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2];
    }
    if (memoria.size > 6000) memoria.clear();
    return { d, w, h, x: i0 * paso - sx, y: j0 * paso - sy, paso };
  }
  function subir(T) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, T.w, T.h, 0, gl.RGB, gl.UNSIGNED_BYTE, T.d); gl.uniform4f(U.caja, T.x, T.y, T.w * T.paso, T.h * T.paso); }
  function grano(cuadro, tam) {
    const q = uniformesGrano(K * tam, cuadro, { muestras: MUESTRAS });
    gl.uniform1f(U.sem, q.sem); gl.uniform1f(U.gm, q.gm); gl.uniform1f(U.gs, q.gs); gl.uniform1f(U.ger2, q.ger2); gl.uniform1f(U.grmax, q.grmax); gl.uniform2fv(U.xi, q.xi);
  }
  function pintar(x0, y0, x1, y1) { // solo el cuadrado que hace falta, en píxeles de la capa (y hacia arriba)
    const a = Math.max(0, Math.floor(x0 * K)), b = Math.max(0, Math.floor((H - y1) * K)), c = Math.min(cv.width, Math.ceil(x1 * K)), d = Math.min(cv.height, Math.ceil((H - y0) * K));
    if (c <= a || d <= b) return; gl.enable(gl.SCISSOR_TEST); gl.scissor(a, b, c - a, d - b); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disable(gl.SCISSOR_TEST);
  }

  /* El círculo. vis es cuánto se ve (0 a 1): sube rápido cuando el cursor se mueve y baja en un cuarto de segundo
     cuando se detiene. Se dibuja otra vez si el cursor se movió o si cambió el cuadro (24 por segundo). */
  const RAD = FINO ? 84 : 64, TOPE = FINO ? 0.85 : 0.55;
  const ojo = { x: 0, y: 0, vis: 0, meta: 0, ult: 0, px: -1, py: -1, cuadro: -1, dib: 0 };
  let vivo = false, bloque = null;
  function arrancar() { if (!vivo) { vivo = true; gsap.ticker.add(paso); } }
  function paso(t, dt) {
    const f = Math.min(3, dt / 16.7), cuadro = Math.floor(t * 24);
    if (performance.now() - ojo.ult > 70) ojo.meta = 0;
    ojo.vis = ojo.meta > ojo.vis ? ojo.vis + (ojo.meta - ojo.vis) * Math.min(1, 0.5 * f) : Math.max(ojo.meta, ojo.vis - 0.07 * f);
    if (!listo) return;
    if (ojo.vis <= 0.003 && !bloque) { parar(); return; }
    const cambio = Math.abs(ojo.x - ojo.px) + Math.abs(ojo.y - ojo.py) > 0.5 || cuadro !== ojo.cuadro || bloque || Math.abs(ojo.vis - ojo.dib) > 0.06;
    if (!cambio) return;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (ojo.vis > 0.003) {
      const x0 = ojo.x - RAD, y0 = ojo.y - RAD, x1 = ojo.x + RAD, y1 = ojo.y + RAD;
      subir(tonos(x0 - G, y0 - G, x1 + G, y1 + G, G, Math.min(W - 1, Math.max(0, ojo.x)), Math.min(H - 1, Math.max(0, ojo.y)))); grano(cuadro, 1);
      gl.uniform1f(U.modo, 0); gl.uniform3f(U.cen, ojo.x, ojo.y, ojo.vis * TOPE); pintar(x0, y0, x1, y1);
    }
    if (bloque) {
      if (bloque.a <= 0) bloque = null;
      else { subir(bloque.T); grano(cuadro, bloque.tam); gl.uniform1f(U.modo, 1); gl.uniform3f(U.cen, 0, 0, bloque.a); pintar(bloque.T.x, bloque.T.y, bloque.T.x + bloque.T.w * bloque.T.paso, bloque.T.y + bloque.T.h * bloque.T.paso); }
    }
    ojo.px = ojo.x; ojo.py = ojo.y; ojo.cuadro = cuadro; ojo.dib = ojo.vis;
  }
  function parar() { vivo = false; gsap.ticker.remove(paso); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
  function trazo(x, y, f) { ojo.x = x; ojo.y = y; ojo.meta = Math.max(ojo.meta * 0.6, f); ojo.ult = performance.now(); arrancar(); }

  /* Al tocar un enlace, lo que tocaste se deshace en grano: primero fino, después más grueso, y recién ahí se va. */
  function pixelar(el, alTerminar) {
    const r = el.getBoundingClientRect(), x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(W, r.right), y1 = Math.min(H, r.bottom);
    if (!listo || x1 - x0 < 2 || y1 - y0 < 2) { alTerminar(); return; }
    const paso = Math.max(4, Math.min(10, Math.sqrt((x1 - x0) * (y1 - y0) / 1600)));
    bloque = { a: 1, tam: 1, T: tonos(x0, y0, x1, y1, paso) }; arrancar();
    const B = bloque;
    gsap.timeline({ onComplete: () => gsap.to(B, { a: 0, duration: 0.18, ease: 'power2.out' }) })
      .add(() => { B.tam = 1.8; }, 0.07).add(() => { B.tam = 3; }, 0.15).add(alTerminar, 0.24);
  }

  let figAct = null;
  const figEn = (x, y) => figuras.find((f) => { if (!f._pix?.punto) return false; const r = f.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }) || null;
  /* Sobre la barra de arriba y los controles del video el grano estorba: ahí no se dibuja. */
  const ZONA_QUIETA = '.nav,.menu-capa,.sel-idioma,.rp,.rp-opciones,.pausa,button,input';
  const apagar = () => { ojo.meta = 0; };
  function mover(x, y, f, golpe) { const en = document.elementFromPoint(x, y);
    if (en?.closest?.(ZONA_QUIETA)) { apagar(); if (figAct) { figAct._pix?.fuera(); figAct = null; } return; }
    const fg = figEn(x, y);
    if (fg !== figAct) { figAct?._pix?.fuera(); figAct = fg; }
    if (fg) { apagar(); fg._pix.punto(x, y, golpe); return; } trazo(x, y, f); }
  const soltarTodo = () => { figAct?._pix?.fuera(); figAct = null; apagar(); };
  addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return;
    const v = Math.min(1, Math.hypot(e.movementX || 0, e.movementY || 0) / 18);
    if (!figEn(e.clientX, e.clientY) && v < 0.08) { if (figAct) { figAct._pix?.fuera(); figAct = null; } return; }
    mover(e.clientX, e.clientY, 0.35 + v * 0.65, false); }, { passive: true });
  // Con el dedo el círculo es más chico y más suave, para no estorbar al navegar.
  addEventListener('touchstart', (e) => { const t = e.touches[0]; mover(t.clientX, t.clientY, 0.6, false); }, { passive: true });
  addEventListener('touchmove', (e) => { const t = e.touches[0]; mover(t.clientX, t.clientY, 0.6, false); }, { passive: true });
  /* Al soltar el dedo el círculo se borra en el acto. Si no, en iPhone y iPad la página sigue deslizándose y el círculo
     se queda pintado donde estaba el dedo, que ya es otro lugar de la página. */
  const borrar = () => { soltarTodo(); ojo.vis = 0; if (vivo) parar(); };
  let dedo = false;
  addEventListener('touchstart', () => { dedo = true; }, { passive: true, capture: true });
  addEventListener('touchend', () => { dedo = false; borrar(); }, { passive: true }); addEventListener('touchcancel', () => { dedo = false; borrar(); }, { passive: true });
  addEventListener('scroll', () => { if (!dedo && ojo.vis > 0 && matchMedia('(pointer: coarse)').matches) borrar(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', soltarTodo);
  return { pixelar };
})();

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

/* 19. Al tocar algo que lleva a otro lado, ese elemento se deshace en grano un cuarto de segundo y recién ahí se va al destino.
       Dentro de la misma página el viaje es con scroll suave. Los enlaces externos, de correo o con descarga no se tocan. */
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0 || a.target === '_blank' || a.hasAttribute('download')) return;
  if (a._sinClic) { e.preventDefault(); return; }
  const href = a.getAttribute('href');
  const correo = /^(mailto|tel):/i.test(href);
  if (!correo && /^https?:/i.test(href) && a.host !== location.host) return;
  e.preventDefault();
  const enMenu = !!a.closest('.menu-capa'), mismaPagina = a.pathname === location.pathname && a.hash;
  PX.pixelar(a.closest('.fila') || a, () => {
    if (correo) { location.href = href; return; }
    if (enMenu && mismaPagina) menu(false);
    if (mismaPagina) {
      const ir = () => { if (lenis) lenis.scrollTo(a.hash, { offset: -60, duration: 1.4 }); else document.querySelector(a.hash)?.scrollIntoView({ behavior: R ? 'auto' : 'smooth' }); };
      enMenu ? setTimeout(ir, 650) : ir();
    } else if (a.href !== location.href) location.href = a.href;
    else if (enMenu) menu(false);
  });
});

addEventListener('load', () => ScrollTrigger.refresh());
addEventListener('pageshow', (e) => { if (e.persisted) { html.classList.remove('menu-abierto'); if (capa) capa.hidden = true; } });

/* 19. Laureles del inicio: la fila de los cuatro mide lo mismo que la primera línea del título ("ENTRE POLVO").
       Peras y manzanas: se mide el ancho real de esas dos palabras y se calcula el alto de los laureles para que,
       puestos uno al lado del otro con su separación, sumen ese ancho. Solo se cambia el alto, el ancho de cada laurel
       sale de su propia proporción, así nunca se deforman. Si algo falla, queda el tamaño fijo del CSS. */
(() => {
  const fila = $('.hero-peli .laureles');
  if (!fila || !$('.hero-peli .titulo-pelicula')) return;
  function ajustar() {
    // El título se parte en letras al animarse: se busca la primera línea cada vez.
    const linea = $('.hero-peli .titulo-pelicula span'); if (!linea) return;
    // La proporción sale del ancho y alto escritos en la etiqueta, así no hay que esperar a que la imagen baje.
    const ims = [...fila.querySelectorAll('img')], pr = (i) => (+i.getAttribute('width') / +i.getAttribute('height')) || (i.naturalWidth / i.naturalHeight);
    if (!ims.length || ims.some((i) => !(pr(i) > 0))) return;
    const r = document.createRange(); r.selectNodeContents(linea);
    const ancho = r.getBoundingClientRect().width; if (!ancho) return;
    const gap = parseFloat(getComputedStyle(fila).columnGap) || 0;
    const prop = ims.reduce((s, i) => s + pr(i), 0);
    const alto = (ancho - gap * (ims.length - 1)) / prop;
    if (alto > 20 && alto < 200) fila.style.setProperty('--lau', alto.toFixed(1) + 'px');
  }
  const todo = () => requestAnimationFrame(ajustar);
  (document.fonts?.ready || Promise.resolve()).then(todo);
  fila.querySelectorAll('img').forEach((i) => i.complete || i.addEventListener('load', todo, { once: true }));
  addEventListener('load', todo); addEventListener('resize', todo); setTimeout(todo, 1800);
})();

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
