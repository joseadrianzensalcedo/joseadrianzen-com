import { createThreads } from './threads-hannah.js';

const conPuntero = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
const superficies = [...document.querySelectorAll('.grano')];
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

  const visibles = superficies.filter(seccion => {
    const rect = seccion.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight;
  });
  if (!visibles.length) return;
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

  for (const seccion of visibles) {
    const capa = capas.get(seccion) ?? crearCapa(seccion);
    if (!capa) continue;
    const { lienzo, contexto, color } = capa;
    const rect = lienzo.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= alto) continue;
    const escalaCapa = Math.min(escala, 1600 / Math.max(rect.width, rect.height));
    const anchoCapa = Math.round(rect.width * escalaCapa);
    const altoCapa = Math.round(rect.height * escalaCapa);
    if (!anchoCapa || !altoCapa) continue;
    if (lienzo.width !== anchoCapa) lienzo.width = anchoCapa;
    if (lienzo.height !== altoCapa) lienzo.height = altoCapa;
    contexto.clearRect(0, 0, anchoCapa, altoCapa);
    contexto.drawImage(origen, -rect.left * escalaCapa, -rect.top * escalaCapa, ancho * escalaCapa, alto * escalaCapa);
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

if (superficies.length) {
  const retirarPuntero = () => {
    if (!objetivo.presencia) return;
    objetivo.presencia = 0;
    solicitarDibujo();
  };

  window.addEventListener('pointermove', evento => {
    if (!conPuntero.matches || evento.pointerType === 'touch') return;
    if (!evento.target.closest?.('.grano')) {
      retirarPuntero();
      return;
    }
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
  window.addEventListener('scroll', solicitarDibujo, { passive: true });
  window.addEventListener('resize', solicitarDibujo, { passive: true });
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
