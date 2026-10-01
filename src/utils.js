// Ayudas comunes: rutas con base e idioma, y fechas legibles en cada idioma.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const ruta = (p = '', lang = 'es') => {
  const pref = lang && lang !== 'es' ? '/' + lang : '';
  const limpio = String(p).replace(/^\/+|\/+$/g, '');
  if (/\.\w+$/.test(limpio)) return BASE + '/' + limpio;
  return BASE + pref + '/' + (limpio ? limpio + '/' : '');
};
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
export const fechaLegible = (iso, lang = 'es') => {
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'es') return `${d} de ${MESES[m - 1]} de ${y}`;
  try { return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d)); } catch (e) { return iso; }
};
export const minutos = (art) => Math.max(1, Math.round(art.cuerpo.join(' ').split(/\s+/).length / 220));
export const PROTOTIPO = import.meta.env.PROTOTIPO === 'true' || process.env.PROTOTIPO === 'true';
