"""Genera las letras del título del documental (estilo AWAKENNING) para cada idioma.
Uso: python3 herramientas/letras_titulo.py [idioma ...]
Salida: public/fuentes/titulo/<idioma>.woff2 y <idioma>-acero.woff2 (la versión STEEL, la del cursor),
        src/data/titulo-letras.json (qué idiomas traen letras propias y las palabras dibujadas enteras).
Peras y manzanas: AWAKENNING solo trae letras latinas. Donde falta una letra la dibujamos con el mismo peso y el
mismo desgaste. Si la letra existe igual en AWAKENNING (la A rusa es la A latina), se usa la de AWAKENNING.
En árabe, hindi y tailandés las letras cambian según sus vecinas, así que se dibuja la palabra entera."""
import sys, os, json, unicodedata, math
import numpy as np
from fontTools.ttLib import TTFont, TTCollection
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont
import uharfbuzz as hb
from letras_lib import *
import titulos_datos as TD

RAIZ = S + 'rediseno/'
FS = S + 'fs/node_modules/'
CJK = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
SAL = RAIZ + 'public/fuentes/'

def var(ruta, **ej):
    f = TTFont(ruta)
    if 'fvar' in f:
        lim = {a.axisTag: (a.minValue, a.maxValue) for a in f['fvar'].axes}
        f = instantiateVariableFont(f, {t: max(lim[t][0], min(lim[t][1], v)) for t, v in ej.items() if t in lim})
    f.flavor = None; return f

def donante(lang):
    """(fuente, escala x, escala y, desplazamiento y) para llevar la letra donante al peso y altura de AWAKENNING."""
    if lang in ('ru', 'uk'): return Fuente(var(FS + '@fontsource-variable/oswald/files/oswald-cyrillic-wght-normal.woff2', wght=700)), 0.82, 1.037, 0
    if lang == 'zh': return Fuente(TTCollection(CJK)[2]), 0.92, 0.92, -40
    if lang == 'ja': return Fuente(TTCollection(CJK)[0]), 0.92, 0.92, -40
    if lang == 'ko': return Fuente(TTCollection(CJK)[1]), 0.92, 0.92, -40
    if lang == 'ar': return Fuente(var(FS + '@fontsource-variable/noto-sans-arabic/files/noto-sans-arabic-arabic-standard-normal.woff2', wdth=75, wght=900)), 1.15, 1.15, 0
    if lang == 'hi': return Fuente(var(FS + '@fontsource/teko/files/teko-devanagari-700-normal.woff2')), 1.05, 1.05, 0
    if lang == 'th': return Fuente(var(FS + '@fontsource-variable/noto-sans-thai/files/noto-sans-thai-thai-standard-normal.woff2', wdth=75, wght=900)), 1.1, 1.1, 0
    raise KeyError(lang)

# Letras cirílicas que ya existen idénticas en AWAKENNING (se usa la de AWAKENNING, no una copia)
HOMOGLIFOS = {'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'І': 'I', 'Ї': 'Idieresis'}
MARCAS = {0x301: 'acute', 0x300: 'grave', 0x308: 'dieresis', 0x304: 'macron', 0x327: 'cedilla', 0x302: 'Acircumflex', 0x303: 'Atilde', 0x30C: 'Scaron'}  # los tres últimos: se saca el signo de esa letra

class Latinas:
    """Construye letras latinas que faltan a partir de letras y signos de AWAKENNING y de signos nuevos."""
    def __init__(self, modo):
        self.modo = modo; self.A = Fuente(AW['base' if modo == 'base' else 'acero']); self.sem = 11
        g = self.A.f['glyf']   # los signos circunflejo, tilde y caron no tienen nombre propio: se leen de Â, Ã y Š
        self.signos = {m: [c.glyphName for c in g[n].components if c.glyphName not in ('A', 'S')][0] for m, n in ((0x302, 'Acircumflex'), (0x303, 'Atilde'), (0x30C, 'Scaron'))}
    def caja(self, nombre):
        from fontTools.pens.boundsPen import BoundsPen
        p = BoundsPen(self.A.gs); self.A.gs[nombre].draw(p); return p.bounds
    def aw(self, nombre, dx=0, dy=0, sx=1, sy=1): return self.A.ops(nombre, (sx, 0, 0, sy, dx, dy))
    def nuevo(self, pts_o_ops):
        self.sem += 1
        ops = pts_o_ops if isinstance(pts_o_ops, list) and pts_o_ops and isinstance(pts_o_ops[0], tuple) and isinstance(pts_o_ops[0][0], str) else poligono(pts_o_ops)
        return glifo_de_ops(ops, self.sem, self.modo, 0.7)
    def apostrofo(self): return self.nuevo([(0, 0), (70, 0), (55, -150), (15, -150)]) if False else self.nuevo([(-34, 840), (36, 840), (22, 690), (-10, 690)])
    def letra(self, ch):
        """ops de la mayúscula (o signo) ch construida. Devuelve (ops, avance) o None si no se sabe armar."""
        if ch == "'": return self.nuevo([(2, 845), (80, 845), (62, 680), (18, 680)]), 100.0
        d = unicodedata.normalize('NFD', ch.upper()); base = d[0]; marcas = [ord(c) for c in d[1:]]
        if base == 'Đ': base = 'Ð'
        if base == 'İ': base = 'I'; marcas = [0x307]
        n = self.A.cm.get(ord(base)); 
        if n is None: return None
        x0, y0, x1, y1 = self.caja(n); adv = self.A.adv(n); cx = (x0 + x1) / 2
        ops = list(self.A.ops(n)); horn = 0x31B in marcas
        marcas = [m for m in marcas if m != 0x31B]
        piezas = []
        altos = [m for m in marcas if m not in (0x323, 0x327, 0x328)]
        for i, m in enumerate(marcas):
            if m in MARCAS:
                nm = self.signos.get(m) or MARCAS[m]; bx0, by0, bx1, by1 = self.caja(nm); mcx = (bx0 + bx1) / 2
                if nm == 'cedilla': ops += self.A.ops(nm, (1, 0, 0, 1, x1 - bx1 - 5, 0))  # cedilla: bajo la letra, hacia la derecha
                elif len(altos) == 2 and m == altos[0]: ops += self.A.ops(nm, (0.9, 0, 0, 0.9, cx - mcx * 0.9 - 30, 860 * 0.1))
                elif len(altos) == 2 and m == altos[1]: ops += self.A.ops(nm, (0.9, 0, 0, 0.9, cx - mcx * 0.9 + 52, 860 * 0.1 + 128))
                else: ops += self.A.ops(nm, (1, 0, 0, 1, cx - mcx + (4 if base in 'TY' else 0), (n == 'Ntilde') and 0 or 0))
            elif m == 0x307:  # punto arriba: el punto medio de AWAKENNING, subido
                bx0, by0, bx1, by1 = self.caja('periodcentered'); ops += self.A.ops('periodcentered', (1, 0, 0, 1, cx - (bx0 + bx1) / 2, 874 - by0))
            elif m == 0x323:  # punto abajo
                bx0, by0, bx1, by1 = self.caja('periodcentered'); ops += self.A.ops('periodcentered', (1, 0, 0, 1, cx - (bx0 + bx1) / 2, -120 - by0))
            elif m == 0x328:  # ogonek: el gancho de la cedilla, bajo el extremo derecho
                bx0, by0, bx1, by1 = self.caja('cedilla'); ops += self.A.ops('cedilla', (1, 0, 0, 1, x1 - bx1 + 2, 0))
            elif m == 0x306:  # breve: media luna nueva
                ops += self.nuevo(media_luna(cx, 858, 95, 118, 52))
            else: return None
        if horn:  # cuerno (ơ, ư): trazo corto hacia arriba y afuera, nuevo
            ops += self.nuevo([(x1 - 95, 600), (x1 - 20, 640), (x1 + 52, 735), (x1 + 76, 880), (x1 + 8, 880), (x1 - 8, 790), (x1 - 55, 735), (x1 - 100, 700)])
        return ops, adv

def poligono(pts):
    r = RecordingPen(); r.moveTo(pts[0])
    for p in pts[1:]: r.lineTo(p)
    r.closePath(); return r.value

def media_luna(cx, y, ancho, alto, grueso):
    """Arco hacia arriba (breve) como polígono: parte exterior menos parte interior."""
    pts = []
    for t in np.linspace(math.pi, 0, 18): pts.append((cx + ancho * math.cos(t), y + alto * (1 - math.sin(t))))
    for t in np.linspace(0, math.pi, 18): pts.append((cx + (ancho - grueso) * math.cos(t), y + alto * 0.35 + (alto - grueso * 0.9) * (1 - math.sin(t))))
    # el arco queda como una U invertida: abierta por abajo
    pts = [(p[0], y + alto - (p[1] - y)) for p in pts]
    return poligono(pts)

def glifo_desde_ops(ops, adv):
    pen = TTGlyphPen(None); ops_replay(ops, pen); return pen.glyph(), adv

def ops_replay(ops, pen):
    r = RecordingPen(); r.value = ops; r.replay(pen)

def construir(lang, modo, log=print):
    """Devuelve (TTFont, info) con las letras del título de `lang` que AWAKENNING no trae."""
    LANG_ACTUAL[0] = lang
    textos = TD.DOC[lang].replace('|', ' ')
    glifos = {}; cmap = {}; info = {'palabras': {}}
    L = Latinas(modo)
    chars = sorted({c for c in textos.upper() if not c.isspace()})
    if lang in TD.PALABRAS:
        D, sx, sy, dy = donante(lang)
        face = hb.Face(D.f.__class__ and _bytes(D.f)); hfont = hb.Font(face)
        palabras = sorted({p for p in textos.split()})
        for i, pal in enumerate(palabras):
            ops, adv = palabra_ops(D, hfont, pal, sx, sy, dy)
            gl = glifo_de_ops_bloque(ops, 100 + i, modo)
            cp = 0xE000 + i; nombre = f'pua{cp:X}'
            glifos[nombre] = (_glifo(gl), adv); cmap[cp] = nombre; info['palabras'][pal] = chr(cp)
            log(lang, modo, 'palabra', pal, f'U+{cp:X}')
    else:
        tienen = set()
        for ch in chars:
            u = ch; n_aw = L.A.cm.get(ord(ch))
            if n_aw is not None and lang not in TD.OTRO_ALFABETO: continue   # ya viene en AWAKENNING
            if lang in TD.OTRO_ALFABETO:
                if u in HOMOGLIFOS:
                    n = HOMOGLIFOS[u]; ops = L.A.ops(n); adv = L.A.adv(n)
                else:
                    D, sx, sy, dy = donante(lang); n = D.cm.get(ord(u))
                    if n is None: log('FALTA en donante', lang, ch); continue
                    ops = D.ops(n, (sx, 0, 0, sy, 0, dy)); adv = D.adv(n) * sx
                    if not ops: glifos[f'u{ord(ch):X}'] = (TTGlyphPen(None).glyph(), adv); cmap[ord(ch)] = f'u{ord(ch):X}'; continue
                    ops = quita_vacios(ops)
                    gl = glifo_de_ops_bloque(ops, ord(u), modo); ops = gl; 
                glifos[f'u{ord(u):X}'] = (_glifo(ops), adv)
            else:
                r = L.letra(ch)
                if r is None: log('no sé armar', lang, ch); continue
                ops, adv = r; glifos[f'u{ord(u):X}'] = (_glifo(ops), adv)
            for c in {u, u.lower()}: cmap[ord(c)] = f'u{ord(u):X}'
            log(lang, modo, 'letra', ch)
    if not glifos: return None, info
    glifos['space'] = (TTGlyphPen(None).glyph(), L.A.adv('space')); cmap[0x20] = 'space'
    glifos['.notdef'] = (TTGlyphPen(None).glyph(), 500)
    orden = ['.notdef', 'space'] + [n for n in glifos if n not in ('.notdef', 'space')]
    fb = FontBuilder(1000, isTTF=True); fb.setupGlyphOrder(orden)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf({n: glifos[n][0] for n in orden})
    fb.setupHorizontalMetrics({n: (int(round(glifos[n][1])), int(getattr(glifos[n][0], 'xMin', 0) or 0)) for n in orden})
    fb.setupHorizontalHeader(ascent=750, descent=-250)
    nombre = f'Titulo {lang}' + (' acero' if modo == 'acero' else '')
    fb.setupNameTable({'familyName': nombre, 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=750, sTypoDescender=-250, usWinAscent=1100, usWinDescent=400); fb.setupPost()
    return fb.font, info

def _glifo(ops):
    pen = TTGlyphPen(None); ops_replay(ops, pen); return pen.glyph()
def _bytes(f):
    import io; b = io.BytesIO(); f.save(b); return b.getvalue()
def quita_vacios(ops): return ops
FUERZA = {'hi': 0.5, 'ar': 0.8, 'th': 0.8}   # el desgaste se suaviza donde un trazo fino (la barra del hindi) se rompería
LANG_ACTUAL = ['']
def glifo_de_ops_bloque(ops, sem, modo):
    return glifo_de_ops(ops, sem, modo, FUERZA.get(LANG_ACTUAL[0], 1.0))
def palabra_ops(D, hfont, pal, sx, sy, dy):
    buf = hb.Buffer(); buf.add_str(pal); buf.guess_segment_properties(); hb.shape(hfont, buf, {'kern': True, 'liga': True})
    orden = D.f.getGlyphOrder(); x = 0.0; ops = []
    glifos = list(zip(buf.glyph_infos, buf.glyph_positions))
    for info, pos in glifos:
        n = orden[info.codepoint]
        ops += D.ops(n, (sx, 0, 0, sy, (x + pos.x_offset) * sx, pos.y_offset * sy + dy))
        x += pos.x_advance
    return ops, x * sx

def guardar(font, ruta):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    font.flavor = 'woff2'; font.save(ruta); font.flavor = None

if __name__ == '__main__':
    langs = sys.argv[1:] or sorted(TD.DOC)
    info_total = json.load(open(RAIZ + 'src/data/titulo-letras.json')) if os.path.exists(RAIZ + 'src/data/titulo-letras.json') else {}
    for lang in langs:
        for modo in ('base', 'acero'):
            f, info = construir(lang, modo)
            if f is None: continue
            guardar(f, SAL + TD.carpeta(lang) + f'/{lang}{"-acero" if modo == "acero" else ""}.woff2')
        info_total[lang] = {'fuente': os.path.exists(SAL + TD.carpeta(lang) + f'/{lang}.woff2'), 'palabras': info['palabras']}
    json.dump(info_total, open(RAIZ + 'src/data/titulo-letras.json', 'w'), ensure_ascii=False, indent=1)
