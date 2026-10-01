"""Búsqueda de parámetros: la textura sobre la letra regular debe medir como STEEL."""
import numpy as np, subprocess, json, random, sys, warnings
warnings.filterwarnings('ignore')
from PIL import Image
from metricas import metricas
im = np.array(Image.open('cmp3.png').convert('L')) < 128
R, S = im[:720], im[1440:2160]; CAP = 488
obj = metricas(R, S, CAP)
col = R.any(0); LETRAS = []; i = 0
while i < len(col):
    if col[i]:
        j = i
        while j < len(col) and col[j]: j += 1
        LETRAS.append((max(0, i - 2), min(len(col), j + 2))); i = j
    else: i += 1
CLAVES = ['orden','hueco','n_por_cap2','area_p50','area_p90','elong_p50','solidez_p50','ang_diag','dens_p10','dens_p50','dens_p90','perim_area']
PESO = dict(orden=5.0, dens_p10=1.5, dens_p90=1.5)
def puntaje(m):
    s = 0
    for k in CLAVES:
        a, b = float(m[k]), float(obj[k])
        if k == 'orden': s += PESO[k] * ((a - b) / 0.03)**2
        else: s += PESO.get(k, 1) * np.log((a + 1e-3) / (b + 1e-3))**2
    return s
def evaluar(p):
    args = ['python3', 'textura2.py', 'busca.png', 'SS=1'] + [f'{k}={v}' for k, v in p.items()]
    subprocess.run(args, capture_output=True, check=True)
    t = np.array(Image.open('busca.png').convert('RGBA'))[:, :, 3] > 127   # opaco = tinta
    tam = int(round(3.25 * 600))
    t = np.array(Image.fromarray(t.astype(np.uint8) * 255).resize((tam, tam), Image.NEAREST)) > 127
    reps = (R.shape[0] // tam + 2, R.shape[1] // tam + 2)
    grande = np.tile(t, reps); big = np.zeros_like(R)
    rr = random.Random(5)
    for (c0, c1) in LETRAS:   # cada letra con su propio pedazo de textura, como en la página
        oy, ox = rr.randrange(tam), rr.randrange(tam)
        big[:, c0:c1] = grande[oy:oy + R.shape[0], ox:ox + (c1 - c0)]
    m = metricas(R, R & big, CAP)
    return puntaje(m), m
RANGO = dict(vis0=(0.4, 0.95), ancho0=(0.3, 0.9), ancho1=(1.0, 3.5), rotura=(0.0, 0.08), polvo=(0.0, 0.2), contraste=(1.0, 3.0),
             gasto_esc=(0.5, 1.4), sesgo=(-1.5, 0.5), L=(0.25, 0.38), W=(0.08, 0.14), curva=(0.2, 0.9), aspero=(0.05, 0.25), tuerce=(0.05, 0.3))
mejor = dict(vis0=0.6, ancho0=0.55, ancho1=2.2, rotura=0.03, polvo=0.1, contraste=1.6, gasto_esc=1.0, sesgo=-0.5, L=0.33, W=0.11, curva=0.5, aspero=0.15, tuerce=0.15)
base = dict(celdas=72, onda=0.08, estira=0.0)
pm, mm = evaluar({**base, **mejor}); print('inicio', round(pm, 3), json.dumps({k: float(v) for k, v in mm.items()}), flush=True)
random.seed(int(sys.argv[1]) if len(sys.argv) > 1 else 1)
paso = 0.25
for it in range(int(sys.argv[2]) if len(sys.argv) > 2 else 40):
    cand = dict(mejor)
    for k in random.sample(list(RANGO), 3):
        lo, hi = RANGO[k]; cand[k] = round(min(hi, max(lo, cand[k] + random.gauss(0, paso * (hi - lo)))), 3)
    pc, mc = evaluar({**base, **cand})
    if pc < pm: mejor, pm, mm = cand, pc, mc; print(it, 'MEJOR', round(pm, 3), json.dumps(mejor), flush=True)
    if it % 10 == 9: paso *= 0.8
print('FINAL', round(pm, 3), json.dumps(mejor)); print('medidas', json.dumps({k: float(v) for k, v in mm.items()}))
print('STEEL ', json.dumps({k: float(v) for k, v in obj.items()}))
