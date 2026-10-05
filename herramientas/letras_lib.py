"""Herramientas para crear letras nuevas en el estilo de AWAKENNING (desgaste horneado en el contorno).
Peras y manzanas: dibujamos la letra, le comemos pedacitos como lo haría el uso (puntos, rayas, bordes ásperos),
y volvemos a trazar el contorno de lo que quedó. El resultado es una letra de verdad (vectorial), no una imagen.
Técnico: contorno vectorial, a máscara de bits (1 px por unidad de fuente), desgaste con ruido determinista,
trazado con potrace (potracer), curvas cúbicas a cuadráticas (cu2qu), y glifo TrueType."""
import numpy as np, io
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen, RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import RecordingPen as _RP
from fontTools.pens.cu2quPen import Cu2QuPen
import potrace

S = '/tmp/claude-0/-home-claude/8a76512e-820e-57e8-bf42-1d3dad88e208/scratchpad/'
AW = {'base': S + 'letras/awakenning.ttf', 'acero': S + 'letras/awakenning-steel.ttf'}
TEX = S + 'rediseno/public/texturas/desgaste.png'
ALTO = 840.0  # altura de mayúscula de AWAKENNING

def _flat(ops, n=14):
    """ops de RecordingPen → lista de contornos (listas de (x,y)) con las curvas partidas en segmentos."""
    cs, cur, p0 = [], [], None
    for op, args in ops:
        if op == 'moveTo': cur = [args[0]]; p0 = args[0]
        elif op == 'lineTo': cur.append(args[0])
        elif op == 'qCurveTo':
            pts = list(args); last = cur[-1]
            if pts[-1] is None: raise ValueError('contorno sin punto en curva no soportado')
            offs, end = pts[:-1], pts[-1]
            # puntos fuera de curva consecutivos: puntos en curva implícitos
            segs = []; start = last
            for i, o in enumerate(offs):
                nxt = end if i == len(offs) - 1 else ((o[0] + offs[i + 1][0]) / 2, (o[1] + offs[i + 1][1]) / 2)
                segs.append((start, o, nxt)); start = nxt
            for a, c, b in segs:
                for t in np.linspace(0, 1, n)[1:]:
                    cur.append(((1-t)**2*a[0]+2*(1-t)*t*c[0]+t**2*b[0], (1-t)**2*a[1]+2*(1-t)*t*c[1]+t**2*b[1]))
        elif op == 'curveTo':
            a = cur[-1]; c1, c2, b = args
            for t in np.linspace(0, 1, n)[1:]:
                cur.append(((1-t)**3*a[0]+3*(1-t)**2*t*c1[0]+3*(1-t)*t**2*c2[0]+t**3*b[0], (1-t)**3*a[1]+3*(1-t)**2*t*c1[1]+3*(1-t)*t**2*c2[1]+t**3*b[1]))
        elif op in ('closePath', 'endPath'):
            if len(cur) > 2: cs.append(cur)
            cur = []
    return cs

class Fuente:
    def __init__(self, ruta_o_font):
        self.f = ruta_o_font if isinstance(ruta_o_font, TTFont) else TTFont(ruta_o_font)
        self.gs = self.f.getGlyphSet(); self.cm = self.f.getBestCmap(); self.upm = self.f['head'].unitsPerEm
    def ops(self, nombre, matriz=(1, 0, 0, 1, 0, 0)):
        rec = DecomposingRecordingPen(self.gs); self.gs[nombre].draw(rec)
        out = RecordingPen(); rec.replay(TransformPen(out, matriz)); return out.value
    def adv(self, nombre): return self.f['hmtx'][nombre][0] * 1.0

R = 0.5   # píxeles por unidad de fuente

def ops_a_mascara(ops, pad=60):
    """ops → (máscara bool, ox, oy): píxel (col,fila) = (x - ox, oy - y) en unidades de fuente."""
    cs = _flat(ops)
    xs = [p[0] for c in cs for p in c]; ys = [p[1] for c in cs for p in c]
    x0, x1, y0, y1 = int(np.floor(min(xs))) - pad, int(np.ceil(max(xs))) + pad, int(np.floor(min(ys))) - pad, int(np.ceil(max(ys))) + pad
    W, H = int((x1 - x0) * R), int((y1 - y0) * R); ox, oy = x0, y1
    def area(c): return 0.5 * sum(c[i][0]*c[(i+1) % len(c)][1] - c[(i+1) % len(c)][0]*c[i][1] for i in range(len(c)))
    areas = [area(c) for c in cs]; sgn = np.sign(max(areas, key=abs))  # el contorno más grande es "exterior"
    m = np.zeros((H, W), bool)
    for c, a in sorted(zip(cs, areas), key=lambda t: -abs(t[1])):
        im = Image.new('1', (W, H), 0); ImageDraw.Draw(im).polygon([((p[0] - ox) * R, (oy - p[1]) * R) for p in c], fill=1)
        im = np.array(im, bool)
        m = (m | im) if np.sign(a) == sgn else (m & ~im)
    return m, ox, oy

_tex = None
def _textura():
    global _tex
    if _tex is None:
        t = np.array(Image.open(TEX).convert('RGBA'))[..., 3] > 0   # True = hueco (sin tinta)
        _tex = np.array(Image.fromarray((t * 255).astype('uint8')).resize((int(2800 * R), int(2800 * R)), Image.NEAREST)) > 127
    return _tex

def desgaste(m, semilla, modo='base', fuerza=1.0):
    """Le come pedacitos a la máscara. modo base: polvo, manchas, rayas verticales y borde áspero (como AWAKENNING).
    modo acero: la chapa estriada de la textura que ya usa el sitio al pasar el cursor (como AWAKENNING STEEL)."""
    rng = np.random.default_rng(semilla); H, W = m.shape
    if modo == 'acero':
        t = _textura(); oy, ox = rng.integers(0, int(1800 * R), 2); hueco = t[oy:oy + H, ox:ox + W]
        if hueco.shape != m.shape: hueco = np.pad(hueco, ((0, H - hueco.shape[0]), (0, W - hueco.shape[1])))
        return m & ~hueco
    # borde áspero
    ruido_borde = ndi.gaussian_filter(rng.standard_normal((H, W)), 1.1); ruido_borde /= ruido_borde.std()
    suave = ndi.gaussian_filter(m.astype(float), 0.8)
    m2 = (suave + ruido_borde * 0.16 * fuerza) > 0.5
    # polvo fino
    n1 = ndi.gaussian_filter(rng.standard_normal((H, W)), 0.9); n1 /= n1.std()
    polvo = n1 > (1.85 + (1 - fuerza))
    # manchas medianas
    n2 = ndi.gaussian_filter(rng.standard_normal((H, W)), 3); n2 /= n2.std()
    mancha = (n2 > (1.9 + (1 - fuerza))) & (ndi.gaussian_filter(rng.standard_normal((H, W)), 0.8) > 0.0)
    # rayas verticales
    ray = np.zeros((H, W), bool)
    for _ in range(int(W / 6 * fuerza)):
        x = rng.integers(0, W); y = rng.integers(0, H); L = rng.integers(8, 45); a = 1
        ray[y:y + L, x:x + a] = True
    return m2 & ~(polvo | mancha | ray)

def mascara_a_ops(m, ox, oy, simplifica=0.6):
    """máscara → ops TrueType (cuadráticas) en unidades de fuente, trazadas con potrace."""
    bm = potrace.Bitmap(~m); pl = bm.trace(turdsize=4, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.8)
    pen = _RP(); q = Cu2QuPen(pen, 1.5, reverse_direction=False)
    X = lambda p: (p.x / R + ox, oy - p.y / R)
    for curva in pl:
        q.moveTo(X(curva.start_point))
        for seg in curva.segments:
            if seg.is_corner: q.lineTo(X(seg.c)); q.lineTo(X(seg.end_point))
            else: q.curveTo(X(seg.c1), X(seg.c2), X(seg.end_point))
        q.closePath()
    return pen.value

def glifo_de_ops(ops, semilla, modo, fuerza=1.0, ancho=None):
    """ops de contornos limpios → (glifo TrueType con desgaste, avance)."""
    m, ox, oy = ops_a_mascara(ops)
    m = desgaste(m, semilla, modo, fuerza)
    return mascara_a_ops(m, ox, oy)
