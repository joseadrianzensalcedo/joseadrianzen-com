"""Textura de desgaste tipo chapa estriada gastada, v2 (hecha desde cero, no copia la fuente).
Modelo físico simple: la letra se imprimió sobre una chapa de acero estriada. La chapa tiene lentejas en relieve
(curvas, con puntas) en una red en diamante, alternando la inclinación a ±45°. Donde la chapa está gastada la tinta
no agarra en las lentejas, y si el gasto es fuerte la falta de tinta se estira por la punta de la lenteja hasta la
vecina y forma cadenas en zigzag que dejan islas de tinta. Encima, astillas angulosas de pintura saltada.
Salida: PNG de 1 bit con transparencia (transparente = hueco), que se repite sin costuras."""
import numpy as np, sys, json
from PIL import Image
P = dict(semilla=7, T=1024, CAP=256, celdas=60, L=0.42, W=0.11, curva=0.35, vis0=0.35, vis1=1.0, ancho0=0.45, ancho1=1.5,
         estira=1.2, gasto_esc=0.8, contraste=1.5, sesgo=0.0, tuerce=0.12, onda=0.08, aspero=0.35,
         astilla=0.0, astilla_tam=0.03, cadena=0.6, rotura=0.0, polvo=0.0, polvo_tam=0.006, SS=2)
for kv in sys.argv[2:]: k, v = kv.split('='); P[k] = float(v)
rng = np.random.default_rng(int(P['semilla']))
SS = int(P.get('SS', 2)); T = int(P['T']); N = T * SS; CAP = P['CAP'] * SS; C = int(P['celdas']); a = N / C

def ruido(esc, oct_=1):
    f2 = np.fft.fftfreq(N)[:, None]**2 + np.fft.fftfreq(N)[None, :]**2; tot = np.zeros((N, N))
    for o in range(oct_):
        s = esc / 2**o; z = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((N, N))) * np.exp(-f2 * (np.pi * s)**2)))
        tot += z / z.std() * 0.5**o
    return tot / tot.std()          # media 0, desvío 1

y0, x0 = np.mgrid[0:N, 0:N].astype(np.float32)
x = x0 + ruido(P['onda'] * CAP) * P['tuerce'] * a; y = y0 + ruido(P['onda'] * CAP) * P['tuerce'] * a
gasto = 1 / (1 + np.exp(-(ruido(P['gasto_esc'] * CAP, 3) * P['contraste'] + P['sesgo'])))   # 0 limpio, 1 gastado
medio = ruido(0.04 * CAP, 2); aspero = ruido(0.008 * CAP, 1)
tabla = rng.random(1 << 20)

hueco_l = np.zeros((N, N), bool)
# se miran las lentejas de los 3×3 vecinos de cada subred, así una lenteja estirada puede pasar a la celda de al lado
for off, sg in ((0.0, 1.0), (0.5, -1.0)):
    bx = np.floor(x / a - off); by = np.floor(y / a - off)
    for di in (-1, 0, 1, 2):
        for dj in (-1, 0, 1, 2):
            ix = bx + di; iy = by + dj
            cx = (ix + off) * a; cy = (iy + off) * a
            dx = x - cx; dy = y - cy
            if np.all(np.abs(dx) > 3 * a): continue
            idn = (np.mod(ix, C).astype(np.int64) * 7919 + np.mod(iy, C).astype(np.int64) * 104729 + int(sg > 0) * 3) % (1 << 20)
            r1 = tabla[idn]; r2 = tabla[(idn * 31 + 17) % (1 << 20)]; r3 = tabla[(idn * 57 + 5) % (1 << 20)]
            c = np.sqrt(0.5); u = (dx + sg * dy) * c; v = (-sg * dx + dy) * c
            g = gasto
            L = P['L'] * a * (0.8 + 0.4 * r2) * (1 + P['estira'] * g)          # más gasto, lenteja más larga
            W = P['W'] * a * (0.75 + 0.5 * r3)
            v = v - P['curva'] * W * (u / L)**2 * 2                             # curva: lenteja como coma
            t = np.clip(1 - np.abs(u / L), 0, None)
            ancho = W * t**0.7 * (P['ancho0'] + P['ancho1'] * g)
            dentro = np.abs(v) < ancho * (1 + (medio * 0.35 + aspero * P['aspero']))
            visible = r1 < (P['vis0'] + (P['vis1'] - P['vis0']) * g)
            hueco_l |= dentro & visible & (t > 0)
if P['rotura'] > 0:   # la lenteja no sale entera: se corta en pedazos
    hueco_l &= ruido(0.012 * CAP, 1) > (P['rotura'] * 2 - 1) * 1.2
hueco = hueco_l
if P['polvo'] > 0:   # polvo anguloso solo donde está gastado (no en lo limpio, así no parece perdigón)
    pv = ruido(P['polvo_tam'] * CAP, 1) + ruido(P['polvo_tam'] * 0.5 * CAP, 1) * 0.6
    hueco |= (pv > 2.6 - 2.0 * P['polvo'] * gasto)
if P['astilla'] > 0:   # astillas: bordes de celdas de Voronoi muy finas no, pedazos angulosos de pintura saltada
    pts = rng.random((int(P['astilla']), 2)) * N
    from scipy.spatial import cKDTree
    gx = np.stack([x0.ravel(), y0.ravel()], 1)
    tree = cKDTree(np.concatenate([pts + [ox, oy] for ox in (-N, 0, N) for oy in (-N, 0, N)]))
    d, idx = tree.query(gx, k=1); idx = idx % len(pts)
    sel = rng.random(len(pts)) < 0.5
    hueco |= (sel[idx].reshape(N, N) & (gasto > 0.6) & (ruido(P['astilla_tam'] * CAP, 1) > 0.8))
alfa = (~hueco).astype(np.float32)
img = Image.fromarray((alfa * 255).astype(np.uint8)).resize((T, T), Image.LANCZOS).point(lambda q: 255 if q > 127 else 0)
p = Image.new('P', (T, T)); p.putpalette([0, 0, 0, 0, 0, 0]); p.paste(img.point(lambda q: 1 if q else 0))
p.save(sys.argv[1], optimize=True, transparency=0, bits=1)
print(json.dumps({'hueco_textura': round(float(hueco.mean()), 3)}))
