// Textos de la interfaz. El español y el inglés están escritos aquí. Los demás idiomas salen de data/traducciones/<código>.json,
// un diccionario "frase en español" → "frase traducida". Si una frase no está traducida, se muestra en inglés.
import fs from 'node:fs';
const DIC = {};
const archivos = import.meta.glob('./traducciones/*.json', { eager: true, import: 'default' });
for (const [ruta, d] of Object.entries(archivos)) DIC[ruta.split('/').pop().replace('.json', '')] = d;

const BASE = {
  es: {
    nav: [['entre-polvo-y-suenos', 'Películas'], ['fotografia', 'Fotografía'], ['sobre-mi', 'Sobre mí'], ['blog', 'Blog'], ['contacto', 'Contacto']],
    menu: 'Menú', cerrar: 'Cerrar', saltar: 'Saltar al contenido', saltarIntro: 'Saltar intro', idioma: 'Idioma',
    pausa: '❚❚ Pausa', seguir: '▶ Seguir', detener: '❚❚ Detener', mover: '▶ Mover',
    verDoc: '▶ Ver Entre polvo y sueños', verPelicula: '▶ Ver la película', conocerEco: 'Conocer ECO',
    peliculas: 'Películas', fotografia: 'Fotografía', blog: 'Blog', laIdea: 'La idea', sobreMi: 'Sobre mí', contacto: 'Contacto',
    premios: 'Premios', selecciones: 'Selecciones oficiales', sinopsis: 'Sinopsis y ficha', rodaje: 'Rodaje', reparto: 'Reparto',
    siguiente: 'Siguiente película', sala: 'Sala', trailer: 'Tráiler', documental: 'Documental',
    hoja: 'arrastra la hoja', verTodas: 'Ver todas las fotos', unaPorSemana: 'un artículo por semana',
    pista: 'Mantén el dedo sobre un artículo para ver su imagen', leer: 'min de lectura', volverBlog: '← Blog',
    claves: 'De clave alta a clave baja', clavesSub: 'la luz de la película, cuadro por cuadro', claveAlta: 'clave alta', claveBaja: 'clave baja',
    trayectoria: 'Trayectoria', formacion: 'Formación', prensa: 'Para prensa y festivales', dossier: 'Dossier en PDF', fotosAlta: 'Fotos en alta', proximamente: 'pronto',
    escribeme: 'Escríbeme', publicoContacto: 'Festivales · productores · prensa', correoWeb: 'Correo web',
    filtros: [['todo', 'Todo'], ['viajes', 'Viajes'], ['retratos', 'Retratos'], ['rodajes', 'Rodajes']],
    pieBase: ['Lima, Perú', 'Sin Google ni publicidad'], cursor: { ver: 'Ver', arrastra: 'Arrastra', leer: 'Leer' },
    borrador: 'Borrador en revisión, no se publica sin el OK de Jose',
    noEncontrada: 'Esta página no existe', volverInicio: 'Volver al inicio',
    soloEs: 'Los artículos están escritos en español.', aviso: 'Traducción hecha con ayuda de inteligencia artificial, pendiente de revisión por un hablante nativo.',
    rolDoc: 'Un documental de Jose Adrianzen', rolEco: 'Un cortometraje de Jose Adrianzen',
    idiomas: [['es', 'Español'], ['en', 'English'], ['fr', 'Français'], ['tr', 'Türkçe']],
  },
  en: {
    nav: [['entre-polvo-y-suenos', 'Films'], ['fotografia', 'Photography'], ['sobre-mi', 'About'], ['blog', 'Blog'], ['contacto', 'Contact']],
    menu: 'Menu', cerrar: 'Close', saltar: 'Skip to content', saltarIntro: 'Skip intro', idioma: 'Language',
    pausa: '❚❚ Pause', seguir: '▶ Play', detener: '❚❚ Stop', mover: '▶ Move',
    verDoc: '▶ Watch Between Dust and Dreams', verPelicula: '▶ Watch the film', conocerEco: 'About Echo',
    peliculas: 'Films', fotografia: 'Photography', blog: 'Blog', laIdea: 'The idea', sobreMi: 'About', contacto: 'Contact',
    premios: 'Awards', selecciones: 'Official selections', sinopsis: 'Synopsis and credits', rodaje: 'On set', reparto: 'Cast',
    siguiente: 'Next film', sala: 'Screen', trailer: 'Trailer', documental: 'Documentary',
    hoja: 'drag the contact sheet', verTodas: 'See all photos', unaPorSemana: 'one article a week',
    pista: 'Hold your finger on an article to see its image', leer: 'min read', volverBlog: '← Blog',
    claves: 'From high key to low key', clavesSub: 'the light of the film, frame by frame', claveAlta: 'high key', claveBaja: 'low key',
    trayectoria: 'Path', formacion: 'Training', prensa: 'For press and festivals', dossier: 'Press kit PDF', fotosAlta: 'High resolution photos', proximamente: 'soon',
    escribeme: 'Write to me', publicoContacto: 'Festivals · producers · press', correoWeb: 'Webmail',
    filtros: [['todo', 'All'], ['viajes', 'Travel'], ['retratos', 'Portraits'], ['rodajes', 'On set']],
    pieBase: ['Lima, Peru', 'No Google, no ads'], cursor: { ver: 'View', arrastra: 'Drag', leer: 'Read' },
    borrador: 'Draft under review, not published without Jose’s OK',
    noEncontrada: 'This page does not exist', volverInicio: 'Back home',
    soloEs: 'Articles are written in Spanish.', aviso: 'Translation made with the help of artificial intelligence, pending review by a native speaker.',
    rolDoc: 'A documentary by Jose Adrianzen', rolEco: 'A short film by Jose Adrianzen',
    idiomas: [['es', 'Español'], ['en', 'English'], ['fr', 'Français'], ['tr', 'Türkçe']],
  },
};
// claves que nunca se traducen (rutas, códigos)
const FIJAS = new Set(['idiomas']);

const COLECTAR = process.env.COLECTAR === 'true';
const vistos = new Map();
function anota(es, en) { if (COLECTAR && typeof es === 'string' && es.trim() && !vistos.has(es)) { vistos.set(es, en ?? es); fs.writeFileSync('fuente-traduccion.json', JSON.stringify(Object.fromEntries(vistos), null, 1)); } }

function traducir(es, en, lang) {
  anota(es, en);
  if (lang === 'es') return es;
  if (lang === 'en') return en ?? es;
  const d = DIC[lang]; return (d && d[es]) || en || es;
}
function recorrer(es, en, lang, clave) {
  if (Array.isArray(es)) return es.map((v, i) => (clave === 'nav' || clave === 'filtros') ? [v[0], traducir(v[1], en?.[i]?.[1], lang)] : recorrer(v, en?.[i], lang));
  if (es && typeof es === 'object') return Object.fromEntries(Object.entries(es).map(([k, v]) => [k, FIJAS.has(k) ? v : recorrer(v, en?.[k], lang, k)]));
  if (typeof es === 'string') return traducir(es, en, lang);
  return es;
}
const cache = {};
export const t = (lang = 'es') => (cache[lang] ??= { lang, ...recorrer(BASE.es, BASE.en, lang) });
export function tr(v, lang = 'es') {
  if (v == null || typeof v !== 'object' || Array.isArray(v)) return v;
  if (v[lang] !== undefined && (lang === 'es' || lang === 'en')) { if (lang === 'es') anota(v.es, v.en); return v[lang]; }
  if (Array.isArray(v.es)) return v.es.map((s, i) => traducir(s, v.en?.[i], lang));
  return traducir(v.es, v.en, lang);
}
