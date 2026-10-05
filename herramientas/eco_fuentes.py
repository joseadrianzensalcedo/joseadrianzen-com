"""Letras del título de ECO en los alfabetos que Bebas Neue no trae (árabe, hindi, chino, japonés, coreano, tailandés).
ECO va en Bebas Neue, limpia y condensada, sin desgaste. Para los otros alfabetos se toma una letra de peso negro de la familia
Noto (licencia OFL), condensada donde existe versión condensada, y se deja solo lo que el título necesita (pesa unos pocos KB)."""
import os, sys
from fontTools import subset
from fontTools.ttLib import TTFont, TTCollection
from letras_lib import S
from letras_titulo import var, FS, CJK
import titulos_datos as TD
R = S + 'rediseno/public/fuentes/titulo/'
def fuente(lang):
    if lang == 'zh': return TTCollection(CJK)[2]
    if lang == 'ja': return TTCollection(CJK)[0]
    if lang == 'ko': return TTCollection(CJK)[1]
    if lang == 'ar': return var(FS + '@fontsource-variable/noto-sans-arabic/files/noto-sans-arabic-arabic-standard-normal.woff2', wdth=75, wght=900)
    if lang == 'hi': return var(FS + '@fontsource/teko/files/teko-devanagari-700-normal.woff2')
    if lang == 'th': return var(FS + '@fontsource-variable/noto-sans-thai/files/noto-sans-thai-thai-standard-normal.woff2', wdth=75, wght=900)
os.makedirs(R, exist_ok=True)
for lang in ('ar', 'hi', 'th', 'zh', 'ja', 'ko'):
    f = fuente(lang); op = subset.Options(); op.layout_features = ['*']; op.flavor = 'woff2'; op.name_IDs = ['*']; op.notdef_outline = True
    s = subset.Subsetter(op); s.populate(text=TD.ECO[lang]); s.subset(f)
    f.flavor = 'woff2'; f.save(R + f'eco-{lang}.woff2'); print(lang, os.path.getsize(R + f'eco-{lang}.woff2'))
