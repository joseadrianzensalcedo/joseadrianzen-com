// Títulos del documental y de ECO en cada idioma. Los datos viven en titulos.json (lo escribe herramientas/titulos_exportar.py).
// Peras y manzanas: en árabe, hindi y tailandés las letras cambian de forma según sus vecinas, así que el título se dibuja
// por palabras enteras (cada palabra es una letra de la fuente del título) y el texto real va aparte para lectores de pantalla.
import T from './titulos.json';
import L from './titulo-letras.json';

const base = (l) => (T.doc[l] ? l : 'en');
export const docLineas = (lang) => T.doc[base(lang)].split('|');
export const docTexto = (lang) => docLineas(lang).join(T.sinEspacio.includes(lang) ? '' : ' ');
export const ecoTitulo = (lang) => T.eco[T.eco[lang] ? lang : 'en'];
export const tituloOficial = (lang) => T.oficial[lang] || null;
export const nombreEnAlfabeto = (lang) => T.nombre[lang] || 'Jose Adrianzen';
const palabras = (lang) => (L[lang] && L[lang].palabras) || null;
// Líneas listas para pintar. En árabe las palabras van en orden inverso porque el título se pinta de izquierda a derecha.
export const docPintado = (lang) => {
  const p = palabras(lang);
  return docLineas(lang).map((ln) => {
    if (!p) return ln;
    const ws = ln.split(' ').map((w) => p[w] ?? w);
    return (lang === 'ar' ? ws.reverse() : ws).join(' ');
  });
};
export const docDibujado = (lang) => !!palabras(lang);
// Para el motor de movimiento: el texto real y su versión dibujada, para envolver el nombre cuando aparece dentro de un rótulo.
// mapa: de cada letra dibujada a su palabra real, para volver al texto si el navegador no puede cargar la letra del título.
export const docParaMovimiento = (lang) => JSON.stringify({ real: docTexto(lang), pintado: docPintado(lang).join(' '), dib: docDibujado(lang), mapa: Object.fromEntries(Object.entries(palabras(lang) || {}).map(([r, u]) => [u, r])) });
