"""Mide la textura como se ve en la página: Bebas 140 px, pantalla x2, varias letras y varias tiradas."""
import asyncio, sys, random, json, numpy as np, warnings; warnings.filterwarnings('ignore')
from PIL import Image
from playwright.async_api import async_playwright
from metricas import metricas
texs = sys.argv[1:]
TXT = 'CONTADO DESDE ADENTRO TITAN PELICULAS'
def fila(tex, seed):
    random.seed(seed)
    if tex is None: return '<div class="b">' + ''.join(f'<span style="display:inline-block">{c}</span>' if c != ' ' else ' ' for c in TXT) + '</div>'
    return '<div class="b">' + ''.join(f'<span class="g" style="--mx:{random.random()*2.8:.2f}em;--my:{random.random()*2.8:.2f}em;-webkit-mask-image:url({tex});mask-image:url({tex})">{c}</span>' if c != ' ' else ' ' for c in TXT) + '</div>'
html = '<meta charset=utf-8><style>@font-face{font-family:B;src:url(b.woff2)}body{margin:0;background:#fff;color:#000;padding:0 10px}.b{font:140px/1.15 B;white-space:nowrap;height:161px}.g{display:inline-block;mask-size:2.8em 2.8em;-webkit-mask-size:2.8em 2.8em;mask-position:var(--mx) var(--my);-webkit-mask-position:var(--mx) var(--my)}</style>'
html += fila(None, 0) + ''.join(fila(t, s) for t in texs for s in (1, 2, 3))
open('sitio_med.html', 'w').write(html)
async def m():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 2600, 'height': 161 * (1 + 3 * len(texs))}, device_scale_factor=2)
        await pg.goto('http://localhost:4450/sitio_med.html'); await pg.wait_for_timeout(1200); await pg.screenshot(path='sitio_med.png'); await b.close()
asyncio.run(m())
im = np.array(Image.open('sitio_med.png').convert('L')) < 110; H = 322
R = im[:H]; cap = 140 * 0.7 * 2
for i, t in enumerate(texs):
    ms = [metricas(R, im[H * (1 + 3 * i + k):H * (2 + 3 * i + k)], cap) for k in range(3)]
    prom = {k: round(float(np.mean([m[k] for m in ms])), 3) for k in ms[0]}
    print(t, json.dumps(prom))
