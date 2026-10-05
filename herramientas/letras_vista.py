"""Hoja de prueba: dibuja el título de cada idioma con AWAKENNING + las letras nuevas, para mirarlo antes de publicar."""
import sys, json, io, os
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
from letras_lib import S, AW
import titulos_datos as TD
RAIZ = S + 'rediseno/'; SAL = RAIZ + 'public/fuentes/'
INFO = json.load(open(RAIZ + 'src/data/titulo-letras.json'))
def cargar(ruta):
    f = TTFont(ruta); f.flavor = None; return f
def trazar(lang, modo, alto=280):
    base = cargar(AW['base' if modo == 'base' else 'acero']); extra_ruta = SAL + TD.carpeta(lang) + f'/{lang}{"-acero" if modo == "acero" else ""}.woff2'
    extra = cargar(extra_ruta) if os.path.exists(extra_ruta) else None
    lineas = TD.DOC[lang].split('|'); salidas = []
    for ln in lineas:
        ln = ln.upper() if lang not in TD.PALABRAS else ln
        pal = INFO[lang]['palabras'] if lang in TD.PALABRAS else None
        if pal: ln = ' '.join(pal.get(p, p) for p in TD.DOC[lang].split('|')[lineas.index(ln)].split())
        cs = []
        for ch in ln:
            cp = ord(ch)
            if extra and cp in extra.getBestCmap(): cs.append((extra, extra.getBestCmap()[cp]))
            elif cp in base.getBestCmap(): cs.append((base, base.getBestCmap()[cp]))
            else: cs.append((None, None))
        W = int(sum((f['hmtx'][n][0] if f else 300) for f, n in cs) * 0.2) + 40
        im = Image.new('L', (max(W, 100), alto), 255); d = ImageDraw.Draw(im); x = 20
        from fontTools.pens.recordingPen import RecordingPen
        for f, n in cs:
            if f is None: x += 60; continue
            gs = f.getGlyphSet(); rec = RecordingPen(); gs[n].draw(rec)
            polys = []; cur = []
            from letras_lib import _flat
            from fontTools.pens.recordingPen import DecomposingRecordingPen
            rec = DecomposingRecordingPen(gs); gs[n].draw(rec)
            cs2 = _flat(rec.value, 8)
            # relleno por regla par-impar con XOR
            m = Image.new('1', im.size, 0)
            for c in cs2:
                t = Image.new('1', im.size, 0); ImageDraw.Draw(t).polygon([(x + p[0] * 0.2, alto - 60 - p[1] * 0.2) for p in c], fill=1)
                from PIL import ImageChops
                m = ImageChops.logical_xor(m, t)
            im.paste(0, mask=m.convert('L'))
            x += int(f['hmtx'][n][0] * 0.2)
        salidas.append(im)
    W = max(i.width for i in salidas); H = sum(i.height for i in salidas)
    out = Image.new('L', (W, H), 255); y = 0
    for i in salidas: out.paste(i, (0, y)); y += i.height
    return out
if __name__ == '__main__':
    langs = sys.argv[2:] or sorted(TD.DOC); modo = sys.argv[1]
    hojas = [trazar(l, modo) for l in langs]
    W = max(h.width for h in hojas) + 120; H = sum(h.height for h in hojas)
    out = Image.new('L', (W, H), 255); y = 0; d = ImageDraw.Draw(out)
    for l, h in zip(langs, hojas): out.paste(h, (120, y)); d.text((10, y + 10), l, fill=0); y += h.height
    out.save(S + f'letras/hoja_{modo}.png'); print(out.size)
