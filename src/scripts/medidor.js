/* Medidor de visitas. Peras y manzanas: anota lo que pasa en la página (qué se abre, cuánto rato, qué parte
 * del documental, qué fotos se ven) y lo manda en tandas chicas a /v/, que lo guarda en el servidor del sitio.
 * Nada sale a Google ni a otra empresa. La IP no viaja en los datos y el servidor no la guarda.
 *
 * Sin aceptar el aviso: se mide la visita, pero no se reconoce a la persona otro día.
 * Aceptando: se le da un identificador fijo y se la reconoce cuando vuelva.
 * Jose no se mide: su navegador queda marcado al abrir el panel del correo, o entrando con #no-medir.
 *
 * Solo corre en joseadrianzen.com. En la vista previa y en el desarrollo no manda nada.
 */
const HOST = /(^|\.)joseadrianzen\.com$/i;
const DESTINO = '/v/';
const INACTIVA = 30 * 60 * 1000;   // 30 minutos sin moverse cierran la visita
const BALDE = 5;                    // el documental se cuenta en tramos de 5 segundos

const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
};
const id = () => {
  const b = new Uint8Array(15);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_');
};

if (location.hash === '#no-medir') { ls.set('ja-no-medir', '1'); history.replaceState(null, '', location.pathname + location.search); }
const activo = (HOST.test(location.hostname) || document.documentElement.dataset.medidor === 'prueba') && ls.get('ja-no-medir') !== '1';

/* ── aviso de consentimiento (se muestra igual aunque no se mida, para que se vea en la vista previa) ── */
const aviso = document.getElementById('aviso-medidor');
let consent = ls.get('ja-ok') === '1' ? 1 : ls.get('ja-ok') === '0' ? 0 : null;
if (aviso && consent === null && ls.get('ja-no-medir') !== '1') aviso.hidden = false;

if (activo) iniciar();
else if (aviso) aviso.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ok]');
  if (!b) return;
  ls.set('ja-ok', b.dataset.ok);
  aviso.hidden = true;
});

function iniciar() {
  /* visita: una por pestaña, se cierra tras 30 minutos quieta */
  const ahora = Date.now();
  let v = null;
  try { v = JSON.parse(ss.get('ja-v') || 'null'); } catch (e) {}
  const nueva = !v || ahora - v.u > INACTIVA;
  if (nueva) v = { s: id(), u: ahora };
  const tocar = () => { v.u = Date.now(); ss.set('ja-v', JSON.stringify(v)); };
  tocar();

  const q = new URLSearchParams(location.search);
  let de = (q.get('de') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24) || null;
  if (de && consent === 1) ls.set('ja-de', de);
  if (!de && consent === 1) de = ls.get('ja-de');
  const pagina = location.pathname;

  const cola = [];
  let meta = {
    ref: document.referrer && !HOST.test(new URL(document.referrer).hostname) ? document.referrer : null,
    us: q.get('utm_source'), um: q.get('utm_medium'), uc: q.get('utm_campaign'), de,
    id: navigator.language, zh: Intl.DateTimeFormat().resolvedOptions().timeZone,
    pa: screen.width + 'x' + screen.height, lp: document.documentElement.lang, en: pagina,
  };
  const anota = (tipo, dato) => { cola.push([Date.now(), tipo, pagina, dato || null]); tocar(); if (cola.length >= 60) enviar(); };
  function enviar(final) {
    if (!cola.length && !meta) return;
    const p = { s: v.s, c: consent, e: cola.splice(0, 300) };
    if (consent === 1) p.p = ls.get('ja-p');
    if (meta) { p.m = meta; meta = null; }
    const cuerpo = JSON.stringify(p);
    if (final && navigator.sendBeacon) navigator.sendBeacon(DESTINO, new Blob([cuerpo], { type: 'text/plain' }));
    else fetch(DESTINO, { method: 'POST', body: cuerpo, keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  }
  setInterval(() => { if (cola.length) enviar(); }, 10000);

  /* página */
  anota('pag', { t: document.title, w: innerWidth, nueva: nueva ? 1 : 0 });

  /* tiempo con la página a la vista y hasta dónde bajó */
  let vista = document.visibilityState === 'visible' ? Date.now() : 0, acum = 0, hondo = 0;
  const secT = {};
  const medirScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    hondo = Math.max(hondo, h > 0 ? Math.round(scrollY / h * 100) : 100);
  };
  addEventListener('scroll', medirScroll, { passive: true });
  medirScroll();
  let cerrado = false;   // pagehide y visibilitychange llegan juntos al salir: se cuenta una sola vez
  function cerrarTramo() {
    if (cerrado) return;
    cerrado = true;
    if (vista) { acum += Date.now() - vista; vista = 0; }
    corteSecciones();
    const seg = Math.round(acum / 1000);
    acum = 0;
    if (seg > 0 || Object.keys(secT).length) anota('sal', { seg, scroll: hondo, secs: Object.assign({}, secT) });
    for (const k in secT) delete secT[k];
    vtrSoltar();
    enviar(true);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') cerrarTramo();
    else { cerrado = false; vista = Date.now(); enVista.forEach((_, el) => enVista.set(el, vista)); tocar(); }
  });
  addEventListener('pagehide', () => { if (document.visibilityState !== 'hidden') cerrarTramo(); });

  /* secciones: cuánto rato estuvo cada una en pantalla (al menos la mitad a la vista) */
  const nombreSec = (el, i) => el.id || el.getAttribute('aria-label') || (el.querySelector('h1,h2,h3,.cod')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50) || ((el.className.split(' ')[0] || 'seccion') + ' ' + (i + 1));
  const secs = [...document.querySelectorAll('main > section, main > article, main > div > section, footer.pie')];
  const enVista = new Map(), vistas = new Set();
  function corteSecciones() {
    const t = Date.now();
    enVista.forEach((t0, el) => { secT[el.dataset.medSec] = (secT[el.dataset.medSec] || 0) + Math.round((t - t0) / 1000); enVista.set(el, t); });
  }
  secs.forEach((el, i) => { el.dataset.medSec = nombreSec(el, i); });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    // la mitad de la sección o la mitad de la pantalla, lo que se cumpla primero (las secciones altas nunca entran a la mitad)
    const lleno = e.intersectionRatio >= 0.5 || e.intersectionRect.height >= innerHeight * 0.5;
    const el = e.target, n = el.dataset.medSec;
    if (lleno && document.visibilityState === 'visible') {
      if (!enVista.has(el)) enVista.set(el, Date.now());
      if (!vistas.has(n)) { vistas.add(n); anota('sec', { id: n }); }
    } else if (enVista.has(el)) {
      secT[n] = (secT[n] || 0) + Math.round((Date.now() - enVista.get(el)) / 1000);
      enVista.delete(el);
    }
  }), { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
  secs.forEach((el) => io.observe(el));

  /* fotos: vista cuando estuvo al menos un segundo con el 60 % en pantalla */
  const fotoNombre = (f) => {
    const img = f.querySelector('img');
    const src = img && (img.currentSrc || img.src) || '';
    // /_astro/bts-doc-1.Qt1Tqk1v_Z2abc.webp -> bts-doc-1 (Astro le pega una huella al nombre)
    const archivo = src.split('?')[0].split('/').pop() || '';
    return { n: archivo.split('.')[0].slice(0, 80), alt: (img?.alt || '').slice(0, 120) };
  };
  const vistasF = new Set(), relojF = new Map();
  const ioF = new IntersectionObserver((es) => es.forEach((e) => {
    const f = e.target;
    if (e.isIntersecting && e.intersectionRatio >= 0.6) {
      if (!relojF.has(f) && !vistasF.has(f)) relojF.set(f, setTimeout(() => { vistasF.add(f); relojF.delete(f); anota('foto', fotoNombre(f)); }, 1000));
    } else if (relojF.has(f)) { clearTimeout(relojF.get(f)); relojF.delete(f); }
  }), { threshold: [0, 0.6] });
  document.querySelectorAll('figure.foto, .galeria img, [data-foto]').forEach((f) => ioF.observe(f));

  /* clics: enlaces, botones y fotos */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a, button, figure.foto, [data-foto]');
    if (!a || a.closest('#aviso-medidor')) return;
    if (a.tagName === 'A') anota('clic', { h: a.getAttribute('href'), x: (a.textContent || '').trim().slice(0, 80) });
    else if (a.tagName === 'BUTTON') anota('clic', { b: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 80) });
    else anota('clic', Object.assign({ foto: 1 }, fotoNombre(a)));
  }, true);

  /* documental: el reproductor avisa con un evento "medida" */
  let vtr = null;   // tramos vistos: {f, i, d, b:Set}
  function vtrSoltar() {
    if (vtr && vtr.b.size) { anota('vtr', { f: vtr.f, i: vtr.i, d: vtr.d, b: [...vtr.b].sort((a, b) => a - b) }); vtr.b.clear(); }
  }
  document.addEventListener('medida', (e) => {
    const d = e.detail || {};
    if (d.a === 't') {
      if (!vtr || vtr.f !== d.f || vtr.i !== d.i) { vtrSoltar(); vtr = { f: d.f, i: d.i, d: Math.round(d.d || 0), b: new Set() }; }
      if (d.d) vtr.d = Math.round(d.d);
      vtr.b.add(Math.floor((d.s || 0) / BALDE));
      if (vtr.b.size >= 120) vtrSoltar();   // cada 10 minutos de video, una fila
      return;
    }
    if (d.a === 'pausa' || d.a === 'fin' || d.a === 'salto' || d.a === 'fuente' || d.a === 'idioma') vtrSoltar();
    const r = {};
    for (const k in d) if (d[k] !== undefined && d[k] !== null) r[k] = typeof d[k] === 'number' ? Math.round(d[k] * 10) / 10 : d[k];
    anota('vid', r);
  });

  /* aviso */
  if (aviso) aviso.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ok]');
    if (!b) return;
    consent = b.dataset.ok === '1' ? 1 : 0;
    ls.set('ja-ok', String(consent));
    if (consent === 1) { if (!ls.get('ja-p')) ls.set('ja-p', id()); if (de) ls.set('ja-de', de); }
    aviso.hidden = true;
    anota('con', { si: consent });
    enviar();
  });
  if (consent === 1 && !ls.get('ja-p')) ls.set('ja-p', id());

  enviar();
}
