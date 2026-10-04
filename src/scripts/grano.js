/* Grano de película simulado como en la película de verdad.

   Peras y manzanas. Una foto en película son millones de granitos de plata regados al azar. Cada granito es redondo y
   de su propio tamaño. Donde la imagen es oscura cayeron muchos granos, y donde es clara cayeron pocos. Lo que vemos es,
   en cada punto, qué parte está tapada por plata y qué parte no. Por eso en lo blanco se ven granos sueltos y oscuros,
   en lo negro se ven los huecos claros entre granos, y en los tonos medios se ve más grano que en ningún otro lado.

   Modelo: "Realistic Film Grain Rendering", A. Newson, N. Faraj, B. Galerne y J. Delon, Image Processing On Line,
   2017 (https://www.ipol.im/pub/art/2017/192/article_lr.pdf, consultado el 1 de octubre de 2026). Es el modelo booleano
   no homogéneo:
   1. Los centros de los granos caen al azar (proceso de Poisson) con una densidad λ que depende del tono en ese punto.
   2. Cada grano es un disco con radio al azar de distribución log normal (casi todos chicos, pocos grandes).
   3. La densidad se elige para que la parte tapada sea igual a lo oscuro del punto:
        tapado = 1 − e^(−λ·π·E[r²])   ⇒   λ = −ln(1 − oscuro) / (π·E[r²])
   4. El ojo y la lente no ven puntos sino una mancha chica: cada píxel promedia N puntos repartidos con una campana
      de Gauss (Monte Carlo). El resultado es la parte de luz que pasa: 1 − tapado.
   pintarGrano (en la CPU) hace el cálculo por canal, como en la película en color, que tiene una capa por color. En la
   tarjeta gráfica se simula una sola capa, la del brillo: con granos de este tamaño, tres capas sueltas se ven como
   confeti de colores, y lo que se busca es el grano de una copia vieja. Lo que sale es la diferencia entre el grano y
   el tono de debajo, que se suma igual en los tres colores: no cambia el color, solo pone grano.
   Cada cuadro (24 por segundo) usa otra semilla: el grano cambia como cambia de un fotograma al siguiente. */

/* Tamaño del grano en píxeles de pantalla (CSS). "Grano grueso de película antigua": medio píxel y medio de radio. */
export const GRANO = { radio: 1.35, dispersion: 0.4, filtro: 0.8, muestras: 6 };

const DOS_PI = Math.PI * 2;
// Parámetros de la log normal: si ln(r) ~ Normal(m, s), el radio medio es μ cuando m = ln μ − s²/2, y E[r²] = μ²·e^(s²).
export function parametros(radio = GRANO.radio, s = GRANO.dispersion) {
  const m = Math.log(radio) - (s * s) / 2, er2 = radio * radio * Math.exp(s * s);
  const rmax = Math.min(radio * Math.exp(2.4 * s), radio * 3); // el percentil 99 de la log normal, con tope
  return { m, s, er2, rmax, celda: rmax };
}

/* Generador de números al azar con semilla (mulberry32): la misma celda y el mismo cuadro dan los mismos granos. */
function azar(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mezclaSemilla = (x, y, c, cuadro) => (Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ Math.imul(c + 1, 83492791) ^ Math.imul(cuadro + 7, 2654435761)) >>> 0;
function gauss(r) { const u = Math.max(1e-7, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(DOS_PI * v); }
function poisson(lambda, r) { // Knuth: suficiente para λ chico (aquí nunca pasa de ~8 por celda)
  const L = Math.exp(-lambda); let k = 0, p = r(); while (p > L && k < 40) { k++; p *= r(); } return k;
}

/* Dibuja el grano de un rectángulo de pantalla en un ImageData.
   colorEn(x, y) da el color [r, g, b] (0 a 255) que hay debajo en ese punto. pesoEn(x, y) da cuánto se ve el grano
   ahí (0 a 1), por ejemplo un círculo alrededor del cursor. Devuelve el ImageData listo para pintar. */
export function pintarGrano(ctx, x0, y0, w, h, colorEn, pesoEn, cuadro, opciones = {}) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h)); x0 = Math.round(x0); y0 = Math.round(y0);
  const P = parametros(opciones.radio, opciones.dispersion), N = opciones.muestras || GRANO.muestras, filtro = opciones.filtro || GRANO.filtro;
  const D = P.celda;
  // 1. El tono de cada celda, una sola vez (leer el color de la página es lo que más cuesta).
  const cx0 = Math.floor((x0 - D) / D), cy0 = Math.floor((y0 - D) / D), cx1 = Math.floor((x0 + w + D) / D), cy1 = Math.floor((y0 + h + D) / D);
  const cw = cx1 - cx0 + 1, ch = cy1 - cy0 + 1;
  const tono = new Float32Array(cw * ch * 3), paso = Math.max(1, Math.round((opciones.muestreo || 9) / D));
  for (let j = 0; j < ch; j += paso) for (let i = 0; i < cw; i += paso) {
    const c = colorEn((cx0 + i + 0.5) * D, (cy0 + j + 0.5) * D);
    for (let jj = j; jj < Math.min(ch, j + paso); jj++) for (let ii = i; ii < Math.min(cw, i + paso); ii++) { const o = (jj * cw + ii) * 3; tono[o] = c[0] / 255; tono[o + 1] = c[1] / 255; tono[o + 2] = c[2] / 255; }
  }
  // 2. Los granos de cada celda y canal: posición y radio. Plata = 1 − tono.
  const granos = new Array(cw * ch * 3);
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) for (let c = 0; c < 3; c++) {
    const o = (j * cw + i) * 3 + c, oscuro = Math.min(0.985, Math.max(0.004, 1 - tono[o]));
    const lambda = -Math.log(1 - oscuro) / (Math.PI * P.er2), r = azar(mezclaSemilla(cx0 + i, cy0 + j, c, cuadro));
    const n = poisson(lambda * D * D, r), g = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const rad = Math.min(P.rmax, Math.exp(P.m + P.s * gauss(r))); g[k * 3] = (cx0 + i + r()) * D; g[k * 3 + 1] = (cy0 + j + r()) * D; g[k * 3 + 2] = rad * rad; }
    granos[o] = g;
  }
  // 3. Cada píxel: N puntos repartidos con una campana de Gauss (los mismos desvíos para todos los píxeles, como en Newson).
  //    Cuenta cuántos caen sobre un grano.
  const img = ctx.createImageData(w, h), d = img.data, rnd = azar(mezclaSemilla(x0, y0, 9, cuadro));
  const desv = new Float32Array(N * 2); for (let s = 0; s < N; s++) { desv[s * 2] = gauss(rnd) * filtro; desv[s * 2 + 1] = gauss(rnd) * filtro; }
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const X = x0 + px + 0.5, Y = y0 + py + 0.5, peso = pesoEn(X, Y), o4 = (py * w + px) * 4;
    if (peso <= 0.003) { d[o4 + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) {
      let tapados = 0;
      for (let s = 0; s < N; s++) {
        const qx = X + desv[s * 2], qy = Y + desv[s * 2 + 1];
        const ci = Math.floor(qx / D) - cx0, cj = Math.floor(qy / D) - cy0; let tapa = false;
        for (let dj = -1; dj <= 1 && !tapa; dj++) for (let di = -1; di <= 1 && !tapa; di++) {
          const ii = ci + di, jj = cj + dj; if (ii < 0 || jj < 0 || ii >= cw || jj >= ch) continue;
          const g = granos[(jj * cw + ii) * 3 + c];
          for (let k = 0; k < g.length; k += 3) { const ex = qx - g[k], ey = qy - g[k + 1]; if (ex * ex + ey * ey < g[k + 2]) { tapa = true; break; } }
        }
        if (tapa) tapados++;
      }
      d[o4 + c] = Math.round(255 * (1 - tapados / N));
    }
    d[o4 + 3] = Math.round(255 * Math.min(1, peso));
  }
  return img;
}

/* El mismo modelo en la tarjeta gráfica (WebGL 1). Sirve para las fotos y para el círculo de grano de la página.
   Quien lo usa da dos piezas en GLSL:
   tono(q)     el color que hay debajo del punto q (en píxeles de la imagen, y hacia arriba), de 0 a 1 por canal.
   mascara(P)  cuánto se ve el grano en el píxel P (de 0 a 1). Fuera de la máscara no se calcula nada.
   Uniformes: px (tamaño en píxeles), sem (semilla del cuadro), gm y gs (log normal), ger2 (E[r²]), grmax (radio máximo
   y lado de la celda), xi (los N desvíos del filtro de Gauss, iguales para todos los píxeles del cuadro, como en Newson). */
export function granoGLSL({ muestras = 8, tono, mascara = 'float mascara(vec2 P){return 1.;}', salida, cabecera = '', conBrillo = false }) {
  const M = muestras | 0;
  return 'precision highp float;varying vec2 u;uniform vec2 px;uniform float sem,gm,gs,ger2,grmax;uniform vec2 xi[' + M + '];' + cabecera + tono + mascara + salida +
    'float h(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}' +
    'float brillo(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}' +
    // Una celda: sortea sus granos (Poisson por el método de Knuth) y dice si alguno tapa el punto q.
    'float celda(vec2 q,vec2 c,float t){float D=grmax;float os=clamp(1.-t,.004,.985);' +
    'float L=exp(log(1.-os)*D*D/(3.14159265*ger2));float p=1.;float sd=dot(c,vec2(1.31,7.17))+sem;' +
    'for(int k=0;k<22;k++){float fk=float(k);p*=h(vec3(c,sd+fk*3.1));if(p<=L)break;' +
    'vec2 g=(c+vec2(h(vec3(c,sd+fk*5.3+1.)),h(vec3(c,sd+fk*7.7+2.))))*D;' +
    'float r=min(grmax,exp(gm+gs*sqrt(-2.*log(max(h(vec3(c,sd+fk*9.1+3.)),1e-6)))*cos(6.2831853*h(vec3(c,sd+fk*11.3+4.)))));' +
    'vec2 e=q-g;if(dot(e,e)<r*r)return 1.;}return 0.;}' +
    // El punto q, mirando su celda y las ocho vecinas (ningún grano pasa de una celda de radio).
    'float cubre(vec2 q){float D=grmax;vec2 c0=floor(q/D);' +
    'for(int dj=-1;dj<=1;dj++)for(int di=-1;di<=1;di++){vec2 c=c0+vec2(float(di),float(dj));' +
    'if(celda(q,c,brillo(tono((c+.5)*D)))>.5)return 1.;}return 0.;}' +
    'void main(){vec2 P=u*px;float a=mascara(P);if(a<.003){gl_FragColor=vec4(0.);return;}float o=0.;' +
    'for(int s=0;s<' + M + ';s++)o+=cubre(P+xi[s]);' +
    // d: cuánto más claro (positivo) o más oscuro (negativo) deja el grano a ese píxel.
    'float bt=brillo(tono(P));gl_FragColor=salida(1.-o/' + M + '.-bt,a' + (conBrillo ? ',bt' : '') + ');}';
}

/* Los números que el shader necesita para un tamaño de grano dado (escala = píxeles de pantalla por píxel CSS). */
export function uniformesGrano(escala = 1, cuadro = 0, opciones = {}) {
  const P = parametros((opciones.radio || GRANO.radio) * escala, opciones.dispersion || GRANO.dispersion);
  const N = opciones.muestras || 8, f = (opciones.filtro || GRANO.filtro) * escala, r = azar(mezclaSemilla(cuadro, 11, 5, cuadro));
  const xi = new Float32Array(N * 2); for (let s = 0; s < N; s++) { xi[s * 2] = gauss(r) * f; xi[s * 2 + 1] = gauss(r) * f; }
  return { gm: P.m, gs: P.s, ger2: P.er2, grmax: P.rmax, sem: (cuadro * 37.17) % 997, xi };
}
