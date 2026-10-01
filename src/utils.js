// Ayudas comunes: rutas con base e idioma, y fechas legibles.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const ruta = (p = '', lang = 'es') => {
  const pref = lang === 'en' ? '/en' : '';
  const limpio = String(p).replace(/^\/+|\/+$/g, '');
  return BASE + pref + '/' + (limpio ? limpio + '/' : '');
};
export const rutaOtroIdioma = (p, lang) => ruta(p, lang === 'en' ? 'es' : 'en');
const MESES = { es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] };
export const fechaLegible = (iso, lang = 'es') => { const [y, m, d] = iso.split('-').map(Number);
  return lang === 'en' ? `${MESES.en[m - 1]} ${d}, ${y}` : `${d} de ${MESES.es[m - 1]} de ${y}`; };
export const minutos = (art) => Math.max(1, Math.round(art.cuerpo.join(' ').split(/\s+/).length / 220));
export const PROTOTIPO = import.meta.env.PROTOTIPO === 'true' || process.env.PROTOTIPO === 'true';
