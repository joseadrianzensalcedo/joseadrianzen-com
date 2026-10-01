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
      con parpadeo en pasos, y al final una luz cruza las letras como un reflejo sobre el celuloide. */
function brillo(nodos, dur, esc) {
  nodos = [...nodos]; if (!nodos.length || nodos[0]._brilla) return;
  nodos.forEach((n) => { n._brilla = true; n.style.setProperty('--c', getComputedStyle(n).color); n.classList.add('brillo'); });
  gsap.fromTo(nodos, { '--bx': '88%' }, { '--bx': '12%', duration: dur, ease: 'power2.inOut', stagger: esc,
    onComplete: () => nodos.forEach((n) => { n.classList.remove('brillo'); n._brilla = false; }) });
}
const ESTILOS = {
  gigante: { desde: { yPercent: 115, rotate: 7, transformOrigin: '0% 100%' }, hasta: { yPercent: 0, rotate: 0, duration: 1.5, ease: SALE }, esc: 0.03, pasos: true },
  titulo: { desde: { yPercent: () => gsap.utils.random(-60, 60) }, hasta: { yPercent: 0, duration: 1.3, ease: SALE }, esc: 0.035, pasos: true },
  eco: { desde: { scale: 2.4, opacity: 0, filter: 'blur(14px)', transformOrigin: '50% 60%' }, hasta: { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: SALE }, esc: 0.16, pasos: false },
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
  $$('.gigante').forEach((el) => {
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
       así que ahí el título se arma palabra por palabra. */
    const POR_PALABRA = /^(ar|hi|th)/.test(document.documentElement.lang);
    $$('[data-letras]').forEach((el) => {
      const E = ESTILOS[el.dataset.letras] || ESTILOS.titulo;
      SplitText.create(el, { type: POR_PALABRA ? 'lines,words' : 'lines,chars', mask: 'lines', linesClass: 'linea', autoSplit: true, onSplit: (s) => {
        const partes = POR_PALABRA ? s.words : s.chars;
        gsap.set(el, { visibility: 'visible' }); el._partes = partes;
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
          .fromTo(partes, E.desde, { ...E.hasta, stagger: { each: E.esc, from: 'random' } }, 0);
        if (E.pasos) tl.fromTo(partes, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'steps(4)', stagger: { each: E.esc, from: 'random' } }, 0);
        tl.add(() => brillo(partes, 0.9, 0.035), '-=0.5');
        return tl;
      } });
      if (FINO) el.addEventListener('pointerenter', () => el._partes && brillo(el._partes, 0.9, 0.03));
      /* Título de la película: con el cursor encima, las letras pasan de AWAKENNING a AWAKENNING STEEL una por una, en
         desorden y en un tercio de segundo, y vuelven igual al salir. Las dos letras miden lo mismo, así nada se mueve. */
      if (FINO && el.classList.contains('titulo-pelicula')) {
        let relojes = [];
        const cambiar = (poner) => { if (!el._partes) return; relojes.forEach(clearTimeout);
          relojes = el._partes.map((c) => setTimeout(() => c.classList.toggle('acero', poner), gsap.utils.random(0, 320))); };
        el.addEventListener('pointerenter', () => cambiar(true));
        el.addEventListener('pointerleave', () => cambiar(false));
      }
    });
    $$('[data-lineas]').forEach((el) => {
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
}

/* 8. Fotos con grano. Peras y manzanas: la foto entra cubierta de grano grueso de película antigua y se limpia en 1,3 s,
      como una copia que se revela. Después, por donde pasa el mouse, el dedo o el lápiz, el grano vuelve y se va solo.
      Técnico: un shader WebGL por foto, creado solo cuando la foto está cerca de la pantalla y liberado al alejarse
      (los navegadores permiten pocos contextos WebGL a la vez). 28 puntos de estela con caída gaussiana. El grano se dibuja
      en el shader (ver PIX_FS). Sin WebGL, la foto se abre como un obturador. */
const PIX_VS = 'attribute vec2 p;varying vec2 u;void main(){u=p*.5+.5;gl_Position=vec4(p,0,1);}';
const NP = 28;
/* Grano de película antigua en vez de píxeles. Peras y manzanas: el grano de la película son granitos de plata que se
   amontonan en grumos de formas irregulares, no cuadrados. En película vieja o forzada se ven gruesos, cambian en cada
   cuadro (24 veces por segundo) y se notan más en los tonos medios que en el blanco o el negro puro.
   Técnico: ruido de valor en dos tamaños (grumo grueso y grano fino) sobre gl_FragCoord, con semilla nueva por cuadro.
   Donde el grano es fuerte la imagen pierde contraste y color, como una copia gastada. */
const PIX_FS = 'precision highp float;varying vec2 u;uniform sampler2D t;uniform vec2 px,cov,op;uniform vec3 pt[' + NP + '];uniform float fz,ue,tm;' +
  'vec3 foto(vec2 q){vec2 c=(q-.5)*cov+op;c.y=1.-c.y;return texture2D(t,c).rgb;}' +
  'float est(vec2 q){float k=0.;float asp=px.x/px.y;for(int i=0;i<' + NP + ';i++){vec2 d=(q-pt[i].xy)*vec2(asp,1.);k+=pt[i].z*exp(-dot(d,d)/.010);}return k;}' +
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
  'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}' +
  'void main(){float s=px.y/900.+.4;vec3 col=foto(u);' +
  // Sin estela (ue casi 0) no se recorren los 28 puntos: la foto entra solo con el nivel fz. Así cuesta mucho menos.
  'float k=fz;if(ue>.01)k=max(est(u),fz);' +
  'if(k>.01){vec2 sd=vec2(mod(tm*17.31,97.),mod(tm*9.71,89.));vec2 fc=gl_FragCoord.xy;' +
  'float gg=vn(fc/(3.4*s)+sd)*.62+vn(fc/(1.3*s)+sd*1.7)*.38-.5;' +
  'vec2 mv=vec2(vn(fc/(9.*s)+sd*.3)-.5,vn(fc/(9.*s)+sd*.6+7.)-.5)*.006*k;vec3 c2=foto(u+mv);' +
  'float l=dot(c2,vec3(.299,.587,.114));float am=k*(.35+1.8*l*(1.-l));' +
  'vec3 viejo=mix(c2,vec3(l),.35*k);viejo=mix(viejo,vec3(.5),.18*k);' +
  'col=clamp(viejo+gg*am*vec3(1.,.97,.92),0.,1.);}' +
  'gl_FragColor=vec4(col,1.);}';

function crearPix(fig) {
  const img = $('img', fig); let cv = $('canvas.pix', fig);
  if (!cv) { cv = document.createElement('canvas'); cv.className = 'pix'; cv.setAttribute('aria-hidden', 'true'); ($('.encuadre', fig) || fig).appendChild(cv); }
  const gl = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false }); if (!gl) return null;
  const sh = (tp, src) => { const x = gl.createShader(tp); gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, PIX_VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, PIX_FS)); gl.linkProgram(pr);
  /* Peras y manzanas: armar el efecto de píxeles toma un momento. Antes el navegador se quedaba congelado esperando.
     Ahora lo arma por detrás (KHR_parallel_shader_compile) y la foto lo usa recién cuando está listo. */
  const par = gl.getExtension('KHR_parallel_shader_compile');
  let enlazado = false, fallo = false, alEnlazar = null;
  const terminar = () => {
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { fallo = true; return; }
    enlazado = true; gl.useProgram(pr); preparar(); alEnlazar && alEnlazar();
  };
  const esperar = () => { if (gl.isContextLost()) return; if (gl.getProgramParameter(pr, par.COMPLETION_STATUS_KHR)) terminar(); else requestAnimationFrame(esperar); };
  let uPx, uCov, uOp, uPt, uFz, uUe, uTm, tx;
  function preparar() {
  const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
  [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, gl.LINEAR));
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((q) => gl.texParameteri(gl.TEXTURE_2D, q, gl.CLAMP_TO_EDGE));
  const U = (n) => gl.getUniformLocation(pr, n);
  uPx = U('px'); uCov = U('cov'); uOp = U('op'); uPt = U('pt'); uFz = U('fz'); uUe = U('ue'); uTm = U('tm');
  if (img.complete && img.naturalWidth) cargar(); else img.addEventListener('load', cargar, { once: true });
  }
  const pts = new Float32Array(NP * 3); let cab = 0, cargada = false, activo = false;
  const m = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, dentro: false };
  const medir = () => {
    const w = cv.clientWidth, h = cv.clientHeight, k = Math.min(devicePixelRatio || 1, 1.5); if (!w || !h) return;
    cv.width = Math.round(w * k); cv.height = Math.round(h * k); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uPx, cv.width, cv.height);
    const ai = img.naturalWidth / img.naturalHeight, ac = w / h, sw = ac > ai ? 1 : ac / ai, shh = ac > ai ? ai / ac : 1;
    const op = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
    const ox = isNaN(op[0]) ? 0.5 : op[0], oy = isNaN(op[1]) ? 0.5 : op[1];
    gl.uniform2f(uCov, sw, shh); gl.uniform2f(uOp, ox * (1 - sw) + sw / 2, oy * (1 - shh) + shh / 2);
  };
  const dibujar = () => { let e = 0; for (let i = 2; i < pts.length; i += 3) e += pts[i]; gl.uniform1f(uUe, e); gl.uniform1f(uTm, Math.floor(performance.now() / (1000 / 24)) % 1000); gl.uniform3fv(uPt, pts); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  const cargar = () => { gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); cargada = true; medir(); };
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
    listo: () => enlazado && cargada,
    cuandoListo(f) {
      const tras = () => (cargada ? f() : img.addEventListener('load', () => requestAnimationFrame(f), { once: true }));
      if (enlazado) tras(); else alEnlazar = tras;
    },
    fz(v) { if (!cargada) return; gl.uniform1f(uFz, v); dibujar(); cv.style.opacity = v > 0 ? 1 : 0; },
    punto(x, y, golpe) {
      if (!cargada) return; const r = cv.getBoundingClientRect(); m.x = (x - r.left) / r.width; m.y = 1 - (y - r.top) / r.height;
      if (!m.dentro) { m.sx = m.x; m.sy = m.y; } m.dentro = true;
      if (golpe) { pts[cab * 3] = m.x; pts[cab * 3 + 1] = m.y; pts[cab * 3 + 2] = 1.6; cab = (cab + 1) % NP; }
      if (!activo) { activo = true; dibujar(); gsap.ticker.add(paso); gsap.to(cv, { opacity: 1, duration: 0.25 }); }
    },
    fuera() { m.dentro = false; },
    liberar() { gsap.ticker.remove(paso); removeEventListener('resize', alRedimensionar); gl.getExtension('WEBGL_lose_context')?.loseContext(); cv.remove(); },
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
        // Si el efecto no está listo, se espera un poco (máximo 0,35 s). Si no llega, la foto entra como obturador.
        gsap.set(f, { clipPath: 'inset(100% 0% 0% 0%)' });
        let hecho = false;
        const plan = setTimeout(() => { if (!hecho) { hecho = true; obturador(); } }, 350);
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

/* 10. Hoja de contactos que se arrastra con inercia y límites, y se inclina apenas con la velocidad del scroll. */
const hoja = $('.hoja'), carril = $('.carril');
if (hoja && carril) {
  Draggable.create(hoja, { type: 'x', bounds: carril, edgeResistance: 0.85, dragResistance: 0.05, zIndexBoost: false,
    onPress() { gsap.to(hoja, { scale: 0.985, duration: 0.3, ease: ENTRA }); },
    onRelease() { gsap.to(hoja, { scale: 1, duration: 0.5, ease: ENTRA });
      const d = this.getDirection('velocity'), dx = (d === 'left' ? -1 : d === 'right' ? 1 : 0) * 220;
      gsap.to(hoja, { x: Math.max(this.minX, Math.min(this.maxX, this.x + dx)), duration: 0.9, ease: SALE, onUpdate: this.update.bind(this) }); } });
  if (!R && lenis) { const figs = $$('figure', hoja); let sk = 0;
    gsap.ticker.add(() => { const tope = FINO ? 5 : 2.5, obj = gsap.utils.clamp(-tope, tope, -lenis.velocity * 0.18); sk += (obj - sk) * 0.1; if (Math.abs(sk) > 0.01 || obj) gsap.set(figs, { skewY: sk }); }); }
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
  let ux = 0, actual = null, presion = null, reloj = 0, t0 = null;
  /* En el teléfono la miniatura sube bastante por encima del dedo (la mano tapa todo lo que está debajo)
     y no se sale por los costados. */
  const arriba = (y) => y - (flota.offsetHeight * 0.42 + 64);
  const dentro = (x) => { const m = flota.offsetWidth / 2 + 12; return Math.min(innerWidth - m, Math.max(m, x)); };
  const mostrar = (a, x, y) => {
    if (!actual) { gsap.set(flota, { x, y }); flota.src = a.dataset.img; }
    else if (actual !== a) gsap.to(flota, { opacity: 0.35, duration: 0.12, overwrite: 'auto', onComplete: () => { flota.src = a.dataset.img; gsap.to(flota, { opacity: 1, duration: 0.3 }); } });
    actual = a; gsap.to(flota, { '--vi': 62, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: SALE, overwrite: 'auto' });
  };
  const ocultar = () => { actual = null; gsap.to(flota, { '--vi': 0, opacity: 0, scale: 0.92, filter: 'blur(6px)', duration: 0.6, ease: 'power3.out', overwrite: 'auto' }); };
  const seguir = (x, y) => { fxq(x); fyq(y); frq(gsap.utils.clamp(-7, 7, (x - ux) * 0.6)); ux = x; };
  const limpiar = () => $$('.fila.presionada').forEach((x) => x.classList.remove('presionada'));
  filas.forEach((a) => {
    a.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') mostrar(a, e.clientX, e.clientY); });
    a.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; if (!e.relatedTarget?.closest?.('.fila')) ocultar(); });
    a.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') seguir(e.clientX, e.clientY); });
    a.addEventListener('touchstart', (e) => { const t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY };
      clearTimeout(reloj); reloj = setTimeout(() => { presion = a; mostrar(a, dentro(t0.x), arriba(t0.y)); a.classList.add('presionada'); try { navigator.vibrate?.(8); } catch (er) {} }, 260); }, { passive: true });
    a.addEventListener('touchmove', (e) => { const t = e.touches[0];
      if (!presion) { if (t0 && Math.hypot(t.clientX - t0.x, t.clientY - t0.y) > 10) clearTimeout(reloj); return; }
      e.preventDefault(); seguir(dentro(t.clientX), arriba(t.clientY));
      const f = document.elementFromPoint(t.clientX, t.clientY)?.closest?.('.fila[data-img]');
      if (f && f !== actual) { limpiar(); f.classList.add('presionada'); mostrar(f, dentro(t.clientX), arriba(t.clientY)); } }, { passive: false });
    const soltar = (e) => { clearTimeout(reloj); if (!presion) return; if (e.cancelable) e.preventDefault(); presion = null; ocultar(); limpiar(); a._sinClic = true; setTimeout(() => { a._sinClic = false; }, 400); };
    a.addEventListener('touchend', soltar); a.addEventListener('touchcancel', soltar);
    a.addEventListener('contextmenu', (e) => { if (matchMedia('(pointer: coarse)').matches) e.preventDefault(); });
  });
  gsap.ticker.add(() => { if (actual) frq(0); });
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
       película antigua, igual que sobre las fotos, y se apaga en cuanto el cursor se va. Cada granito toma el color real de lo que tiene debajo (la foto, la letra, el logo o el
       fondo) y cambia 24 veces por segundo. */
const PX = (() => {
  const cv = document.createElement('canvas'); cv.className = 'estela'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
  const cx = cv.getContext('2d'); let W = 0, H = 0;
  const medir = () => { const k = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * k; cv.height = H * k; cx.setTransform(k, 0, 0, k, 0, 0); };
  medir(); addEventListener('resize', medir);
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
      const b = r2.getBoundingClientRect(); if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) return rgb(getComputedStyle(n.parentElement).color); }
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
  const C = FINO ? 10 : 18, celdas = new Map(), bloques = []; let vivo = false, ult = null;
  const encender = (gx, gy, v) => { const k = gx + ',' + gy, c = celdas.get(k); if (!c) celdas.set(k, { x: gx, y: gy, v, b: color(gx * C + C / 2, gy * C + C / 2) }); else c.v = Math.max(c.v, v); };
  /* Grano: cada zona encendida se llena de granitos del color real de lo que hay debajo, unos más claros y otros más
     oscuros, de tamaños distintos y sueltos (no en rejilla). Se sortean de nuevo 24 veces por segundo, como el grano de
     la película, que cambia en cada cuadro. El sorteo depende del cuadro, así entre cuadro y cuadro no tiembla. */
  const az = (a, b, c) => { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); };
  const gris = (b, k) => `rgb(${Math.min(255, b[0] * k) | 0},${Math.min(255, b[1] * k) | 0},${Math.min(255, b[2] * k) | 0})`;
  const GR = FINO ? 18 : 12, TAM = FINO ? [1.2, 3.4] : [1.6, 4.2];
  function granos(x0, y0, lado, b, sem, n) {
    for (let i = 0; i < n; i++) {
      const gx = x0 + (az(sem, i, 1.3) * 1.5 - 0.25) * lado, gy = y0 + (az(sem, i, 2.9) * 1.5 - 0.25) * lado;
      const t = TAM[0] + az(sem, i, 4.1) * az(sem, i, 5.7) * (TAM[1] - TAM[0]), lum = az(sem, i, 6.3);
      // Los granos de plata son oscuros sobre lo claro y claros sobre lo oscuro: así se ve grano y no manchas.
      const brillo = (b[0] + b[1] + b[2]) / 765, k = lum < 0.5 ? 0.35 + lum * 0.7 : 1 + (lum - 0.5) * (brillo < 0.35 ? 2.6 : 0.9);
      cx.fillStyle = gris(b, k); cx.fillRect(gx, gy, t, t * (0.7 + az(sem, i, 7.9) * 0.6));
    }
  }
  /* Un círculo de grano alrededor del cursor, como el de las fotos (pedido de Jose, 1 oct 2026): denso al centro y
     suelto en el borde. Va donde está el cursor y se apaga en un instante, sin dejar estela detrás. */
  const RAD = FINO ? 6 : 5;
  function punto(x, y, f) { const gx = Math.floor(x / C), gy = Math.floor(y / C);
    for (let dx = -RAD; dx <= RAD; dx++) for (let dy = -RAD; dy <= RAD; dy++) { const d = Math.hypot(dx, dy) / RAD; if (d > 1) continue;
      const k = Math.exp(-d * d * 2.6); if (Math.random() < 0.35 + k * 0.65) encender(gx + dx, gy + dy, 0.25 + (0.4 + f * 0.6) * k); } }
  function trazo(x, y, f) { punto(x, y, f); ult = { x, y }; arrancar(); }
  function arrancar() { if (!vivo) { vivo = true; gsap.ticker.add(paso); } }
  function paso(t, dt) { const f = Math.min(3, dt / 16.7); cx.clearRect(0, 0, W, H);
    const cuadro = Math.floor(t * 24);
    celdas.forEach((c, k) => { c.v -= 0.07 * f; if (c.v <= 0) { celdas.delete(k); return; }
      cx.globalAlpha = Math.min(FINO ? 0.85 : 0.4, c.v * 1.9); granos(c.x * C, c.y * C, C, c.b, c.x * 7.13 + c.y * 3.71 + cuadro * 1.37, Math.ceil(GR * Math.min(1, c.v * 1.6))); });
    for (let i = bloques.length - 1; i >= 0; i--) { const B = bloques[i]; if (B.a <= 0) { bloques.splice(i, 1); continue; } cx.globalAlpha = B.a;
      for (const p of B.p) granos(p[0], p[1], B.s, p[2], p[0] * 0.37 + p[1] * 0.91 + cuadro * 2.11, B.n); }
    cx.globalAlpha = 1; if (!celdas.size && !bloques.length) { vivo = false; gsap.ticker.remove(paso); cx.clearRect(0, 0, W, H); } }
  function pixelar(el, alTerminar) {
    const r = el.getBoundingClientRect(), x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(W, r.right), y1 = Math.min(H, r.bottom);
    if (R || x1 - x0 < 2 || y1 - y0 < 2) { alTerminar(); return; }
    // Al tocar, lo que tocaste se deshace en grano: primero fino y denso, después grueso y suelto, y recién ahí se va.
    const s0 = Math.max(5, Math.min(12, Math.sqrt((x1 - x0) * (y1 - y0) / 1400))), B = { a: 1, p: [], s: 0, n: 10 }; bloques.push(B); arrancar();
    const capa = (s, n) => { const p = []; for (let y = y0; y < y1; y += s) for (let x = x0; x < x1; x += s) { const w = Math.min(s, x1 - x), h = Math.min(s, y1 - y); p.push([x, y, color(x + w / 2, y + h / 2)]); } B.s = s; B.p = p; B.n = n; };
    capa(s0, 12);
    gsap.timeline({ onComplete: () => gsap.to(B, { a: 0, duration: 0.18, ease: 'power2.out' }) })
      .add(() => capa(s0 * 1.6, 9), 0.07).add(() => capa(s0 * 2.4, 7), 0.15).add(alTerminar, 0.24);
  }
  let figAct = null;
  const figEn = (x, y) => figuras.find((f) => { if (!f._pix?.punto) return false; const r = f.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }) || null;
  /* Sobre la barra de arriba y los controles del video el rastro estorba: ahí no se dibuja. */
  const ZONA_QUIETA = '.nav,.menu-capa,.sel-idioma,.rp,.rp-opciones,.pausa,button,input';
  function mover(x, y, f, golpe) { const en = document.elementFromPoint(x, y);
    if (en?.closest?.(ZONA_QUIETA)) { ult = null; if (figAct) { figAct._pix?.fuera(); figAct = null; } return; }
    const fg = figEn(x, y);
    if (fg !== figAct) { figAct?._pix?.fuera(); figAct = fg; ult = null; }
    if (fg) { fg._pix.punto(x, y, golpe); return; } trazo(x, y, f); }
  const soltarTodo = () => { figAct?._pix?.fuera(); figAct = null; ult = null; };
  if (!R) {
    addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return;
      const v = Math.min(1, Math.hypot(e.movementX || 0, e.movementY || 0) / 18);
      if (!figEn(e.clientX, e.clientY) && v < 0.08) { ult = { x: e.clientX, y: e.clientY }; if (figAct) { figAct._pix?.fuera(); figAct = null; } return; }
      mover(e.clientX, e.clientY, 0.35 + v * 0.65, false); }, { passive: true });
    // En el dedo la estela es apenas un rastro: menos intensa, más corta y sin golpe, para no confundir al navegar.
    addEventListener('touchstart', (e) => { const t = e.touches[0]; ult = null; mover(t.clientX, t.clientY, 0.25, false); }, { passive: true });
    addEventListener('touchmove', (e) => { const t = e.touches[0]; mover(t.clientX, t.clientY, 0.25, false); }, { passive: true });
    addEventListener('touchend', soltarTodo, { passive: true }); addEventListener('touchcancel', soltarTodo, { passive: true });
    document.documentElement.addEventListener('pointerleave', soltarTodo);
  }
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
