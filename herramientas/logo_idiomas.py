"""Logo de Jose Adrianzen en otros alfabetos.

Peras y manzanas: el logo es el nombre entre dos rayas finas con una línea de código abajo. En ruso, chino o árabe
el nombre se escribe con otras letras, así que cambiamos solo el nombre. Las rayas, la línea de código y el tamaño del
logo quedan idénticos al original, para que encaje en el mismo lugar de cada página.

Técnico: el texto se arma con HarfBuzz (une las letras árabes, ordena los signos del hindi y del tailandés) y cada
grupo de letras se dibuja como contorno con fontTools. Cada grupo queda como un <path class="l"> para que la animación
de armado del nombre siga funcionando. El nombre se escala de forma pareja (nunca se deforma) para ocupar la misma
banda de alto que el nombre original y nunca más ancho que él.
"""
import io, re, json, sys, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont, TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib.instancer import instantiateVariableFont

S = '/tmp/claude-0/-home-claude/8a76512e-820e-57e8-bf42-1d3dad88e208/scratchpad/'
FS = S + 'fs/node_modules/'
LOGOS = S + 'rediseno/src/assets/logos/'
CJK = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'

def var(ruta, **ejes):
    f = TTFont(ruta)
    if 'fvar' in f and ejes:
        lim = {a.axisTag: (a.minValue, a.maxValue) for a in f['fvar'].axes}
        f = instantiateVariableFont(f, {t: max(lim[t][0], min(lim[t][1], v)) for t, v in ejes.items() if t in lim})
    f.flavor = None
    return f

def ttc(i):
    return TTCollection(CJK)[i]

# Nombre por idioma: la misma forma que usan los textos traducidos del sitio (apellido con s, como se pronuncia en el Perú).
NOMBRES = {
    'ru': ('ХОСЕ АДРИАНСЕН', lambda: var(FS + '@fontsource-variable/oswald/files/oswald-cyrillic-wght-normal.woff2', wght=600), 0.04),
    'uk': ('ХОСЕ АДРІАНСЕН', lambda: var(FS + '@fontsource-variable/oswald/files/oswald-cyrillic-wght-normal.woff2', wght=600), 0.04),
    'zh': ('何塞·阿德里安森', lambda: ttc(2), 0.06),
    'ja': ('ホセ・アドリアンセン', lambda: ttc(0), 0.04),
    'ko': ('호세 아드리안센', lambda: ttc(1), 0.06),
    'ar': ('خوسيه أدريانسن', lambda: var(FS + '@fontsource-variable/noto-sans-arabic/files/noto-sans-arabic-arabic-standard-normal.woff2', wdth=75, wght=700), 0.0),
    'hi': ('होसे अद्रियानसेन', lambda: var(FS + '@fontsource/teko/files/teko-devanagari-600-normal.woff2'), 0.0),
    'th': ('โฆเซ อาเดรียนเซน', lambda: var(FS + '@fontsource-variable/noto-sans-thai/files/noto-sans-thai-thai-standard-normal.woff2', wdth=75, wght=700), 0.02),
}

def bytes_de(f):
    b = io.BytesIO(); f.save(b); return b.getvalue()

def formar(f, texto, track):
    """Devuelve una lista de grupos [(d_svg en unidades de fuente, y hacia arriba)] y el ancho total."""
    face = hb.Face(bytes_de(f)); font = hb.Font(face)
    buf = hb.Buffer(); buf.add_str(texto); buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    upm = f['head'].unitsPerEm; gs = f.getGlyphSet(); orden = f.getGlyphOrder()
    x = 0; grupos = {}; claves = []
    rtl = buf.direction == 'rtl'
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        nombre = orden[info.codepoint]
        cl = info.cluster
        if cl not in grupos: grupos[cl] = []; claves.append(cl)
        grupos[cl].append((nombre, x + pos.x_offset, pos.y_offset))
        x += pos.x_advance + (0 if texto[cl] == ' ' else track * upm)
    return [(grupos[k]) for k in claves], gs, upm

def contorno(gs, items, esc, dx, dy):
    pen = SVGPathPen(gs)
    for nombre, gx, gy in items:
        tp = TransformPen(pen, (esc, 0, 0, -esc, dx + gx * esc, dy - gy * esc))
        gs[nombre].draw(tp)
    return pen.getCommands()

def caja_items(gs, items):
    bp = BoundsPen(gs); xs = []
    for nombre, gx, gy in items:
        b = BoundsPen(gs); gs[nombre].draw(b)
        if b.bounds: xs.append((b.bounds[0] + gx, b.bounds[1] + gy, b.bounds[2] + gx, b.bounds[3] + gy))
    if not xs: return None
    return min(a[0] for a in xs), min(a[1] for a in xs), max(a[2] for a in xs), max(a[3] for a in xs)

def banda_original(svg):
    """Caja del nombre latino: lo que ocupa JOSE ADRIANZEN en el logo original (lector de trazos de letras.py)."""
    sys.path.insert(0, S + 'portada'); from letras import caja
    cs = [caja(d) for d in re.findall(r'<path class="l" d="([^"]+)"', svg)]
    return min(c[0] for c in cs), min(c[1] for c in cs), max(c[2] for c in cs), max(c[3] for c in cs)

def armar(lang, base_svg):
    texto, cargar, track = NOMBRES[lang]
    f = cargar()
    grupos, gs, upm = formar(f, texto, track)
    cajas = [caja_items(gs, g) for g in grupos]
    validas = [c for c in cajas if c]
    x0 = min(c[0] for c in validas); y0 = min(c[1] for c in validas); x1 = max(c[2] for c in validas); y1 = max(c[3] for c in validas)
    bx0, by0, bx1, by1 = banda_original(base_svg)
    alto_banda = by1 - by0; ancho_banda = bx1 - bx0
    # Escala pareja: que la tinta ocupe el alto del nombre original. Si queda más ancho que el original, se achica.
    # Árabe, hindi y tailandés tienen signos arriba y abajo, su tinta puede pasar un poco la banda.
    extra = {'ar': 1.25, 'hi': 1.22, 'th': 1.3}.get(lang, 1.0)
    esc = alto_banda * extra / (y1 - y0)
    if (x1 - x0) * esc > ancho_banda: esc = ancho_banda / (x1 - x0)
    cx = (bx0 + bx1) / 2; cy = (by0 + by1) / 2
    dx = cx - (x0 + x1) / 2 * esc
    dy = cy + (y0 + y1) / 2 * esc
    paths = []
    for g, c in zip(grupos, cajas):
        if not c: continue
        d = contorno(gs, g, esc, dx, dy)
        if d: paths.append(f'<path class="l" d="{d}"/>')
    nuevo = '<g class="nom">' + ''.join(paths) + '</g>'
    out = re.sub(r'<g class="nom">.*?</g>', lambda m: nuevo, base_svg, count=1, flags=re.S)
    return out, len(paths), esc

def nom_plano(svg):
    """Para pie.svg y similares, donde el nombre es un solo trazo sin letras separadas."""
    return svg

if __name__ == '__main__':
    variantes = [v[:-4] for v in os.listdir(LOGOS) if v.endswith('.svg') and '-' not in v[:-4] or v in ('sobre-mi.svg',)]
    variantes = [v for v in variantes if v in ('portada', 'documental', 'sobre-mi', 'fotografia', 'blog', 'contacto', 'nav')]
    rep = {}
    for lang in NOMBRES:
        for v in variantes:
            base = open(LOGOS + v + '.svg').read()
            out, n, esc = armar(lang, base)
            open(LOGOS + f'{v}.{lang}.svg', 'w').write(out)
            rep[f'{v}.{lang}'] = n
    print(json.dumps(rep, ensure_ascii=False))
