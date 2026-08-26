// @ts-check
import { defineConfig } from 'astro/config';

// El build de staging va a GitHub Pages, que sirve el sitio bajo /joseadrianzen-com/.
// El de produccion va a la raiz de joseadrianzen.com.
const staging = process.env.STAGING === 'true';

export default defineConfig({
  site: staging
    ? 'https://joseadrianzensalcedo.github.io'
    : 'https://joseadrianzen.com',
  base: staging ? '/joseadrianzen-com' : '/',
  trailingSlash: 'ignore',
  build: {
    // index.html y blog/index.html, igual que hoy en Hostinger
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
