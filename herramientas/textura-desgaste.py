"""Textura de desgaste tipo chapa de acero gastada, hecha desde cero (no se copia nada de la fuente).
Patrón: chapa estriada (granos en forma de lenteja a ±45° en una red en diamante), gastada por zonas.
Sale una imagen con transparencia: opaco = la letra se ve, transparente = hueco. Se repite sin costuras."""
import numpy as np, sys
from PIL import Image
rng = np.random.default_rng(int(sys.argv[2]) if len(sys.argv) > 2 else 7)
T = 1024; SS = 2; N = T * SS            # lado de la imagen, sobremuestreo para bordes limpios
CAP = 256 * SS                           # una altura de mayúscula en píxeles
CELDAS = 60; a = N / CELDAS              # red de la chapa: 0,06 de la altura de mayúscula
P = dict(L=0.44, W=0.10, gasto=0.55, parche=0.95, rotura=0.55, polvo=0.955, vis0=0.35, contraste=1.6, isla=0.55, tuerce=0.35, onda=0.08, punta=0.8, aspero=0.45)
for kv in sys.argv[3:]: k, v = kv.split('='); P[k] = float(v)

def ruido(escala_px, octavas=1):
    """Ruido periódico suave (sale del espectro), media 0,5, de tamaño de grumo escala_px."""
    f = np.fft.fftfreq(N)[:, None]**2 + np.fft.fftfreq(N)[None, :]**2
    tot = np.zeros((N, N))
    for o in range(octavas):
        s = escala_px / (2**o)
        filtro = np.exp(-f * (np.pi * s)**2)
        z = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((N, N))) * filtro))
        tot += z / z.std() * (0.5**o)
    tot = tot / tot.std()
    return 0.5 + 0.5 * np.tanh(tot * 0.8)

y, x = np.mgrid[0:N, 0:N].astype(np.float32)
# la chapa no es perfecta: se tuerce un poco, así las lentejas salen chuecas y de bordes ondulados
wx = ruido(P["onda"] * CAP, 1); wy = ruido(P["onda"] * CAP, 1)
x = x + (wx - 0.5) * 2 * P['tuerce'] * a; y = y + (wy - 0.5) * 2 * P['tuerce'] * a
# punto de la red más cercano (dos subredes: esquinas y centros)
best = None
for off, signo in ((0.0, 1.0), (0.5, -1.0)):
    ix = np.floor(x / a - off + 0.5); iy = np.floor(y / a - off + 0.5)
    cx = (ix + off) * a; cy = (iy + off) * a
    dx, dy = x - cx, y - cy; d2 = dx*dx + dy*dy
    # un número al azar fijo por lenteja (la red se repite cada CELDAS)
    idn = (np.mod(ix, CELDAS) * 131 + np.mod(iy, CELDAS) * 7919 + (signo > 0) * 31337).astype(np.int64)
    if best is None: best = [d2, dx, dy, np.full_like(d2, signo), idn]
    else:
        m = d2 < best[0]
        for i, v in enumerate((d2, dx, dy, np.full_like(d2, signo), idn)): best[i] = np.where(m, v, best[i])
_, dx, dy, sg, idn = best
tabla = rng.random(200000); azar1 = tabla[idn % 200000]; azar2 = tabla[(idn * 7 + 13) % 200000]
c = np.sqrt(0.5)
u = (dx + sg * dy) * c; v = (-sg * dx + dy) * c       # ejes de la lenteja, girada ±45°
L = P['L'] * a * (0.75 + 0.5 * azar2); W = P['W'] * a * (0.7 + 0.6 * azar2)
perfil = np.clip(1 - np.abs(u / L), 0, None)**P['punta']   # puntas afiladas, no óvalos
f = np.abs(v) / (W * perfil + 1e-3)                    # < 1 dentro de la lenteja
f = np.where(perfil > 0, f, 9.0)
aspero = ruido(0.007 * CAP, 1)
f = f + (aspero - 0.5) * 2 * P['aspero']                # borde dentado, no liso

gasto = ruido(0.9 * CAP, 3)                             # zonas gastadas y zonas limpias
gasto = np.clip((gasto - 0.5) * P.get('contraste', 1.6) + 0.5, 0, 1)
medio = ruido(0.05 * CAP, 2)                            # rompe las lentejas y los bordes de los parches
fino = ruido(0.012 * CAP, 1)

# 1. lentejas: chicas y rotas en lo limpio, más grandes en lo gastado
# cada lenteja aparece o no según su número al azar: en lo limpio aparecen pocas, en lo gastado casi todas
aparece = azar1 < (P['vis0'] + (1 - P['vis0']) * gasto)
umbral = 0.35 + 1.1 * gasto * P['gasto']
lenteja = aparece & ((f + (medio - 0.5) * 2.2 * P['rotura']) < umbral)
# 2. parches grandes donde el gasto es fuerte, con forma que sigue la chapa
cerca = np.clip(1 - np.minimum(f, 3) / 3, 0, 1)
# en lo muy gastado quedan islas de tinta (el ruido fino deja pedazos sueltos, no se borra todo)
grumo = ruido(0.03 * CAP, 2)
parche = (gasto + 0.22 * cerca + 0.30 * (medio - 0.5) + P['isla'] * (grumo - 0.5)) > P['parche']
# 3. polvo fino en todos lados
polvo = fino > P['polvo']
hueco = lenteja | parche | polvo
alfa = (~hueco).astype(np.float32)
img = Image.fromarray((alfa * 255).astype(np.uint8)).resize((T, T), Image.LANCZOS)
rgba = Image.merge('RGBA', [Image.new('L', (T, T), 0)] * 3 + [img])
rgba.save(sys.argv[1]); print('hueco', round(float(hueco.mean()), 3))
