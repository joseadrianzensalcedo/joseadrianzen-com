# Completa la tabla de nombres de las letras generadas (Titulo <idioma>). Safari (CoreText) rechaza una letra web si le
# faltan el nombre completo (4) o el nombre PostScript (6). Chrome no. Por eso en el iPhone el título salía como cuadros.
# Uso: python3 herramientas/fuentes_nombres.py            (corrige todas las letras de public/fuentes/titulo y awakenning/titulo)
#      python3 herramientas/fuentes_nombres.py --revisa   (solo revisa, devuelve error si falta algo)
import glob, os, re, sys
from fontTools.ttLib import TTFont
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARPETAS = ['public/fuentes/titulo', 'public/fuentes/awakenning/titulo']
def familia_de(ruta):
    b = os.path.basename(ruta)[:-len('.woff2')]
    return b.replace('-acero', '').replace('eco-', '')
def completar(font, familia):
    ps = re.sub(r'[^A-Za-z0-9]', '', familia.title().replace(' ', '')) + '-Regular'
    n = font['name']
    for id_, txt in {0: 'Letras generadas para joseadrianzen.com a partir de AWAKENNING (Billy Argel, uso personal) y fuentes abiertas', 1: familia, 2: 'Regular',
                     3: familia + ' 1.0', 4: familia + ' Regular', 5: 'Version 1.0', 6: ps}.items():
        n.setName(txt, id_, 3, 1, 0x409); n.setName(txt, id_, 1, 0, 0)
    font['head'].macStyle = 0
    return ps
def faltan(font):
    ids = {r.nameID for r in font['name'].names}
    return [i for i in (1, 2, 3, 4, 5, 6) if i not in ids]
if __name__ == '__main__':
    solo = '--revisa' in sys.argv; mal = 0
    for c in CARPETAS:
        for ruta in sorted(glob.glob(os.path.join(RAIZ, c, '*.woff2'))):
            if os.path.basename(ruta).startswith('eco-'): continue
            f = TTFont(ruta); f.flavor = None
            fa = faltan(f)
            if solo:
                if fa: mal += 1; print('FALTA nombre', fa, ruta)
                continue
            if not fa and '--fuerza' not in sys.argv: continue
            fam = 'Titulo ' + familia_de(ruta) + (' acero' if '-acero' in ruta else '')
            ps = completar(f, fam); f.flavor = 'woff2'; f.save(ruta); print('ok', os.path.basename(ruta), ps)
    if solo: print('PASA' if not mal else f'FALLA {mal}'); sys.exit(1 if mal else 0)
