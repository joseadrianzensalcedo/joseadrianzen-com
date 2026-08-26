// Construye rutas respetando el "base" (raiz en produccion, /joseadrianzen-com/ en staging).
const BASE = import.meta.env.BASE_URL;

export function ruta(p = '') {
  return (BASE + '/' + String(p).replace(/^\//, '')).replace(/\/{2,}/g, '/');
}

export function img(nombre) {
  return ruta('assets/' + nombre + '.webp');
}
