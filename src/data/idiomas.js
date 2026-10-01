// Idiomas del sitio. El español es el original y vive en la raíz. Los demás van bajo /codigo/.
// Elegidos por alcance en cada región (Américas, Europa, Asia, Medio Oriente, África y Oceanía) y por el circuito de festivales.
// El quechua y el aimara van por ser lenguas originarias del Perú, donde se filmó Entre polvo y sueños (aimara pedido por Jose el 30 set 2026).
// Todas las traducciones, salvo el español, son de Claude y necesitan revisión de un hablante nativo antes de publicarse.
export const IDIOMAS = [
  { c: 'es', n: 'Español', og: 'es_PE', dir: 'ltr', region: 'América y España' },
  { c: 'en', n: 'English', og: 'en_US', dir: 'ltr', region: 'América, Europa, Oceanía' },
  { c: 'pt', n: 'Português', og: 'pt_BR', dir: 'ltr', region: 'Brasil y Portugal' },
  { c: 'fr', n: 'Français', og: 'fr_FR', dir: 'ltr', region: 'Europa, Canadá, África' },
  { c: 'it', n: 'Italiano', og: 'it_IT', dir: 'ltr', region: 'Europa' },
  { c: 'de', n: 'Deutsch', og: 'de_DE', dir: 'ltr', region: 'Europa' },
  { c: 'nl', n: 'Nederlands', og: 'nl_NL', dir: 'ltr', region: 'Europa' },
  { c: 'pl', n: 'Polski', og: 'pl_PL', dir: 'ltr', region: 'Europa' },
  { c: 'ru', n: 'Русский', og: 'ru_RU', dir: 'ltr', region: 'Europa y Asia' },
  { c: 'uk', n: 'Українська', og: 'uk_UA', dir: 'ltr', region: 'Europa' },
  { c: 'tr', n: 'Türkçe', og: 'tr_TR', dir: 'ltr', region: 'Europa y Asia' },
  { c: 'ar', n: 'العربية', og: 'ar_AR', dir: 'rtl', region: 'Medio Oriente y África' },
  { c: 'hi', n: 'हिन्दी', og: 'hi_IN', dir: 'ltr', region: 'Asia' },
  { c: 'zh', n: '中文', og: 'zh_CN', dir: 'ltr', region: 'Asia' },
  { c: 'ja', n: '日本語', og: 'ja_JP', dir: 'ltr', region: 'Asia' },
  { c: 'ko', n: '한국어', og: 'ko_KR', dir: 'ltr', region: 'Asia' },
  { c: 'id', n: 'Bahasa Indonesia', og: 'id_ID', dir: 'ltr', region: 'Asia y Oceanía' },
  { c: 'vi', n: 'Tiếng Việt', og: 'vi_VN', dir: 'ltr', region: 'Asia' },
  { c: 'th', n: 'ไทย', og: 'th_TH', dir: 'ltr', region: 'Asia' },
  { c: 'fil', n: 'Filipino', og: 'fil_PH', dir: 'ltr', region: 'Asia y Oceanía' },
  { c: 'sw', n: 'Kiswahili', og: 'sw_KE', dir: 'ltr', region: 'África' },
  { c: 'qu', n: 'Runasimi', og: 'qu_PE', dir: 'ltr', region: 'Andes' },
  { c: 'ay', n: 'Aymar aru', og: 'ay_BO', dir: 'ltr', region: 'Andes' },
];
export const CODIGOS = IDIOMAS.map((i) => i.c);
export const OTROS = CODIGOS.filter((c) => c !== 'es');
export const idioma = (c) => IDIOMAS.find((i) => i.c === c) || IDIOMAS[0];
