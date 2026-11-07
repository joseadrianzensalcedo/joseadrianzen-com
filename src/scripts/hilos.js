import { createThreads } from './threads-hannah.js';

const conPuntero = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
const marco = document.querySelector('.hilos-marco');
const paneles = [...document.querySelectorAll('.grano.papel, .menu-capa.grano')];
const superficies = [marco, ...paneles];
const origen = document.createElement('canvas');
const capas = new Map();
const estado = { width: 0, height: 0, time: 0, pointer: { x: 0, y: 0 }, presence: 0 };
const objetivo = { x: 0, y: 0, presencia: 0 };

let motor;
let fotograma = 0;
let ultimo = -Infinity;

function mostrarFondoEstatico() {
  cancelAnimationFrame(fotograma);
  fotograma = 0;
  for (const [seccion, { lienzo }] of capas) {
    seccion.removeAttribute('data-hilos');
    lienzo.remove();
  }
  capas.clear();
  alDesplazar();
}

function crearCapa(seccion) {
  const lienzo = document.createElement('canvas');
  const contexto = lienzo.getContext('2d');
  if (!contexto) return null;
  lienzo.className = 'hilos-lienzo';
  lienzo.setAttribute('aria-hidden', 'true');
  seccion.append(lienzo);
  const color = getComputedStyle(seccion).getPropertyValue('--hilo-color').trim();
  const capa = { lienzo, contexto, color };
  capas.set(seccion, capa);
  return capa;
}

function dibujar(ahora) {
  fotograma = 0;
  if (!conPuntero.matches || document.hidden || motor === null) return;

  if (ahora - ultimo < 32) {
    solicitarDibujo();
    return;
  }
  ultimo = ahora;

  motor ??= createThreads(origen);
  if (!motor) {
    motor = null;
    return;
  }

  const ancho = innerWidth;
  const alto = innerHeight;
  const escala = Math.min(devicePixelRatio || 1, 1.25, 1600 / Math.max(ancho, alto));
  if (estado.width !== ancho || estado.height !== alto || origen.width !== Math.round(ancho * escala)) {
    estado.width = ancho;
    estado.height = alto;
    origen.width = Math.round(ancho * escala);
    origen.height = Math.round(alto * escala);
    motor.resize(ancho);
  }

  estado.pointer.x += (objetivo.x - estado.pointer.x) * .28;
  estado.pointer.y += (objetivo.y - estado.pointer.y) * .28;
  estado.presence += (objetivo.presencia - estado.presence) * .28;
  motor.render(estado);

  // Todas las capas recortan el mismo fotograma. Las secciones largas solo
  // reservan memoria para su franja visible.
  const visibles = superficies.map(seccion => [seccion, seccion.getBoundingClientRect()]);
  for (const [seccion, rect] of visibles) {
    const arriba = Math.max(0, rect.top);
    const abajo = Math.min(alto, rect.bottom);
    const altoVisible = abajo - arriba;
    if (!rect.width || altoVisible <= 0) continue;

    const capa = capas.get(seccion) ?? crearCapa(seccion);
    if (!capa) continue;
    const { lienzo, contexto, color } = capa;
    const anchoCapa = Math.max(1, Math.round(rect.width * escala));
    const altoCapa = Math.max(1, Math.round(altoVisible * escala));
    lienzo.style.top = `${arriba - rect.top}px`;
    lienzo.style.height = `${altoVisible}px`;
    if (lienzo.width !== anchoCapa) lienzo.width = anchoCapa;
    if (lienzo.height !== altoCapa) lienzo.height = altoCapa;
    contexto.clearRect(0, 0, anchoCapa, altoCapa);
    contexto.drawImage(origen, -rect.left * escala, -arriba * escala, ancho * escala, alto * escala);
    contexto.globalCompositeOperation = 'source-in';
    contexto.fillStyle = color;
    contexto.fillRect(0, 0, anchoCapa, altoCapa);
    contexto.globalCompositeOperation = 'source-over';
    seccion.setAttribute('data-hilos', '');
  }

  // Cuando el puntero se estabiliza, se detiene el dibujo.
  if (Math.abs(objetivo.presencia - estado.presence) > .004 ||
      (objetivo.presencia && Math.hypot(objetivo.x - estado.pointer.x, objetivo.y - estado.pointer.y) > .5)) {
    solicitarDibujo();
  }
}

function solicitarDibujo() {
  if (!fotograma && conPuntero.matches && !document.hidden && motor !== null) {
    fotograma = requestAnimationFrame(dibujar);
  }
}

// El SVG repite un ciclo completo de los mismos trazos. Se alinea respecto
// al documento para que también continúe entre paneles en modo estático.
function alinearPaneles() {
  for (const panel of paneles) {
    const desplazamiento = panel.matches('.menu-capa') ? 0 : scrollY;
    const inicio = panel.getBoundingClientRect().top + desplazamiento;
    panel.style.setProperty('--hilo-fase', `${-inicio}px`);
  }
}

function alDesplazar() {
  if (!marco.hasAttribute('data-hilos')) {
    marco.style.setProperty('--hilo-fase', `${-scrollY}px`);
  }
  solicitarDibujo();
}

if (marco) {
  const retirarPuntero = () => {
    if (!objetivo.presencia) return;
    objetivo.presencia = 0;
    solicitarDibujo();
  };

  window.addEventListener('pointermove', evento => {
    if (!conPuntero.matches || evento.pointerType === 'touch') return;
    objetivo.x = evento.clientX;
    objetivo.y = evento.clientY;
    if (!objetivo.presencia && estado.presence < .01) {
      estado.pointer.x = objetivo.x;
      estado.pointer.y = objetivo.y;
    }
    objetivo.presencia = 1;
    solicitarDibujo();
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', retirarPuntero);
  window.addEventListener('blur', retirarPuntero);
  window.addEventListener('scroll', alDesplazar, { passive: true });
  const observarPaneles = new ResizeObserver(() => {
    alinearPaneles();
    alDesplazar();
  });
  for (const superficie of superficies) observarPaneles.observe(superficie);
  observarPaneles.observe(document.querySelector('main'));
  document.addEventListener('visibilitychange', solicitarDibujo);
  conPuntero.addEventListener('change', () => {
    if (conPuntero.matches) solicitarDibujo();
    else {
      objetivo.presencia = 0;
      estado.presence = 0;
      mostrarFondoEstatico();
    }
  });
  origen.addEventListener('webglcontextlost', () => {
    motor = null;
    mostrarFondoEstatico();
  });
  solicitarDibujo();
}
