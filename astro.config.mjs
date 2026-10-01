// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// PROTOTIPO=true arma la vista previa: muestra los borradores del blog con su marca y bloquea buscadores.
// STAGING=true sirve el sitio bajo /joseadrianzen-com/ (GitHub Pages). Producción va a la raíz.
const staging = process.env.STAGING === 'true';

export default defineConfig({
  site: staging ? 'https://joseadrianzensalcedo.github.io' : 'https://joseadrianzen.com',
  base: staging ? '/joseadrianzen-com' : '/',
  trailingSlash: 'ignore',
  i18n: { locales: ['es', 'en'], defaultLocale: 'es', routing: { prefixDefaultLocale: false } },
  integrations: [sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es-PE', en: 'en' } } })],
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
});
