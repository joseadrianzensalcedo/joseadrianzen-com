// Control de calidad de un prototipo. Uso: NODE_PATH=$(npm root -g) node qa/qa.js protos/NN-slug [--sin-capturas]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const carpeta = path.resolve(process.argv[2] || '');
const sinCapturas = process.argv.includes('--sin-capturas');
const raiz = path.resolve(__dirname, '..');
const html = path.join(carpeta, 'index.html');
if (!fs.existsSync(html)) { console.log('FALLA: no existe ' + html); process.exit(1); }
const slug = path.basename(carpeta);
const dirCap = path.join(raiz, 'qa', 'capturas');
const dirInf = path.join(raiz, 'qa', 'informes');
fs.mkdirSync(dirCap, { recursive: true });
fs.mkdirSync(dirInf, { recursive: true });

const fuente = fs.readFileSync(html, 'utf8');
const problemas = [];
const avisos = [];
const datos = { slug, bytes_html: Buffer.byteLength(fuente) };

// 1. textos prohibidos en el archivo completo
for (const [re, nombre] of [[/—/, 'guion largo (—)'], [/–/, 'guion medio (–)'], [/José\b/, 'José con tilde'], [/Adrianzén/, 'Adrianzén con tilde'], [/casa de los ochenta/i, 'casa de los ochenta'], [/lorem ipsum/i, 'lorem ipsum']]) {
  if (re.test(fuente)) problemas.push('texto prohibido: ' + nombre);
}
if (!/<html[^>]*lang="es/i.test(fuente)) problemas.push('falta lang="es" en <html>');
if (!/<title>[^<]{5,}<\/title>/i.test(fuente)) problemas.push('falta <title>');
if (!/name="description"/i.test(fuente)) problemas.push('falta meta description');
if (!/prefers-reduced-motion/.test(fuente)) avisos.push('no menciona prefers-reduced-motion');
if (!/data-vimeo="1056105326"/.test(fuente)) problemas.push('falta el reproductor del documental (data-vimeo="1056105326")');
if (/drive\.google|eco[^"']*\.mp4|vimeo\.com\/video\/(?!1056105326|['"+])/i.test(fuente)) problemas.push('hay un enlace de video que no corresponde (ECO no se puede ver)');

// 2. recursos externos
const externos = [...fuente.matchAll(/<(?:script|link)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g)].map(m => m[1]);
datos.externos = externos;
datos.libs = [...new Set([...fuente.matchAll(/\.\.\/lib\/([\w./-]+)/g)].map(m => m[1]))];
datos.fuentes = [...new Set([...fuente.matchAll(/\.\.\/fonts\/([\w-]+)\.css/g)].map(m => m[1]))];
for (const u of externos) problemas.push('recurso externo (prohibido, usar ../lib o ../fonts): ' + u);
const refsLib = [...fuente.matchAll(/\.\.\/(lib|fonts)\/([\w./-]+)/g)].map(m => m[1] + '/' + m[2]);
for (const r of new Set(refsLib)) { if (!fs.existsSync(path.join(raiz, 'protos', r))) problemas.push('no existe protos/' + r); }
if (/googletagmanager|google-analytics|gtag\(|hotjar|facebook\.net|plausible|umami/i.test(fuente)) problemas.push('hay un rastreador');

// 3. imágenes locales referenciadas existen
const refs = new Set([...fuente.matchAll(/\.\.\/assets\/([\w.-]+\.(?:webp|jpg|png|woff2|svg))/g)].map(m => m[1]));
let bytesImg = 0;
for (const r of refs) {
  const p = path.join(raiz, 'protos', 'assets', r);
  if (!fs.existsSync(p)) problemas.push('no existe assets/' + r); else if (!r.endsWith('.woff2')) bytesImg += fs.statSync(p).size;
}
datos.imagenes_referenciadas = refs.size;
datos.bytes_imagenes_locales = bytesImg;

const requeridos = ['Jose Adrianzen', 'Director · Productor', 'Entre polvo y sueños', 'ECO', 'Aún sin estrenar', 'yo@joseadrianzen.com', '+51 984 323 201', '@jadrianzens', 'Matilde Carrión', 'TITAN International Film Festival', 'Noida', 'Docuvision', 'LISBIFF', 'visibilizarlas', 'Fiorella Luna', 'Yamile Caparó', 'Cristian Esquivel', 'Nadie financia un documental', 'no sabe dónde poner la cámara', 'Fabricio Raciti', 'Augusto Madueño', 'Solidaridad', 'Digital 2K', 'Digital 6K', 'Francés, inglés y turco', 'Muestra Cine + Video Indígena', 'En cámara y fuera de ella', 'ingeniería empresarial', 'Lima · Perú', 'Ver el documental'];

const http = require('http');
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };
const raizProtos = path.join(raiz, 'protos');
const servidor = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raizProtos, p);
  if (!f.startsWith(raizProtos) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => servidor.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + servidor.address().port + '/' + slug + '/';
  const browser = await chromium.launch();
  const anchos = [360, 390, 768, 1024, 1440, 1920];
  const errores = [];
  let textoPagina = '';
  for (const w of anchos) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    page.on('pageerror', e => errores.push(w + 'px: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errores.push(w + 'px consola: ' + m.text()); });
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    // recorrer la página para disparar reveals
    const altoTotal = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < altoTotal; y += 600) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const desborde = Math.max(de.scrollWidth, document.body.scrollWidth) - window.innerWidth;
      const imgs = [...document.images].map(im => {
        const cs = getComputedStyle(im);
        const rc = im.getBoundingClientRect();
        return { src: (im.getAttribute('src') || '').split('/').pop(), ok: im.complete && im.naturalWidth > 0, nw: im.naturalWidth, nh: im.naturalHeight, w: rc.width, h: rc.height, fit: cs.objectFit, alt: im.getAttribute('alt'), visible: rc.width > 0 && rc.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' };
      });
      const fondosCover = [...document.querySelectorAll('*')].filter(el => { const cs = getComputedStyle(el); return cs.backgroundImage.includes('assets/') && cs.backgroundSize === 'cover'; }).length;
      return { desborde, alto: de.scrollHeight, imgs, fondosCover, texto: document.body.innerText, titulo: document.title };
    });
    if (r.desborde > 2) problemas.push(`desborde horizontal de ${r.desborde}px a ${w}px`);
    if (r.alto > 40000) avisos.push(`página muy alta a ${w}px: ${r.alto}px`);
    if (r.fondosCover > 0) problemas.push(`${r.fondosCover} elementos con background-size cover sobre una foto a ${w}px (recorta)`);
    for (const im of r.imgs) {
      if (!im.ok) { problemas.push(`imagen rota a ${w}px: ${im.src}`); continue; }
      if (im.alt === null || im.alt === undefined) problemas.push('imagen sin alt: ' + im.src);
      if (!im.visible) continue;
      const ra = im.nw / im.nh, rb = im.w / im.h;
      if (im.fit === 'cover' && Math.abs(ra - rb) / ra > 0.03) problemas.push(`imagen recortada (object-fit cover) a ${w}px: ${im.src} (${im.nw}x${im.nh} en caja ${Math.round(im.w)}x${Math.round(im.h)})`);
      if ((im.fit === 'fill' || im.fit === 'none') && Math.abs(ra - rb) / ra > 0.03) problemas.push(`imagen deformada a ${w}px: ${im.src} (${im.nw}x${im.nh} mostrada ${Math.round(im.w)}x${Math.round(im.h)})`);
      if (im.w > im.nw * 2.05 && im.nw < 700) avisos.push(`imagen ampliada más de 2x a ${w}px: ${im.src}`);
    }
    if (w === 1440) {
      textoPagina = r.texto;
      datos.titulo = r.titulo;
      datos.alto_1440 = r.alto;
      datos.imagenes_en_dom = r.imgs.length;
    }
    if (!sinCapturas && (w === 1440 || w === 390)) {
      await page.screenshot({ path: path.join(dirCap, `${slug}-${w}.png`) });
      if (w === 1440) {
        const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 0.5 });
        const p2 = await ctx2.newPage();
        await p2.goto(base, { waitUntil: 'load' });
        await p2.waitForTimeout(800);
        const at = await p2.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < at; y += 700) { await p2.evaluate(v => window.scrollTo(0, v), y); await p2.waitForTimeout(40); }
        await p2.evaluate(() => window.scrollTo(0, 0));
        await p2.waitForTimeout(400);
        await p2.screenshot({ path: path.join(dirCap, `${slug}-completa.png`), fullPage: true });
        await ctx2.close();
      }
    }
    await ctx.close();
  }
  await browser.close();
  servidor.close();
  for (const s of requeridos) if (!textoPagina.includes(s)) problemas.push('falta en el texto visible: "' + s + '"');
  if (/;\s/.test(textoPagina.replace(/&[a-z]+;/g, ''))) avisos.push('hay punto y coma en el texto visible');
  const err = [...new Set(errores)].filter(e => !/net::ERR_|ERR_NAME_NOT_RESOLVED|Failed to load resource|favicon/i.test(e));
  for (const e of err.slice(0, 8)) problemas.push('error de JS: ' + e);
  if (errores.some(e => /net::ERR_|Failed to load resource/.test(e))) avisos.push('hubo recursos externos que no cargaron en el contenedor (normal sin red, revisar en vivo)');

  datos.problemas = problemas; datos.avisos = avisos; datos.ok = problemas.length === 0;
  fs.writeFileSync(path.join(dirInf, slug + '.json'), JSON.stringify(datos, null, 1));
  console.log(`\n== ${slug} ==`);
  console.log(`html ${Math.round(datos.bytes_html / 1024)} kB · imágenes locales ${Math.round(bytesImg / 1024)} kB (${refs.size} archivos) · externos ${externos.length} · alto 1440: ${datos.alto_1440}px`);
  for (const p of problemas) console.log('FALLA: ' + p);
  for (const a of avisos) console.log('aviso: ' + a);
  console.log(problemas.length ? `RESULTADO: ${problemas.length} fallas` : 'RESULTADO: OK');
  process.exit(problemas.length ? 1 : 0);
})();
