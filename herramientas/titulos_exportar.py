"""Pasa los títulos por idioma al sitio: datos (titulos.json), fuentes (titulo-letras.css) y textos traducidos.
Uso: python3 herramientas/titulos_exportar.py
Es repetible: si ya se aplicó, no cambia nada más."""
import json, re, os
import titulos_datos as TD
from letras_lib import S
R = S + 'rediseno/'
datos = {'sinEspacio': TD.SIN_ESPACIO, 'doc': TD.DOC, 'eco': TD.ECO, 'oficial': TD.OFICIAL, 'nombre': TD.NOMBRE, 'palabras': TD.PALABRAS, 'otro': TD.OTRO_ALFABETO}
json.dump(datos, open(R + 'src/data/titulos.json', 'w'), ensure_ascii=False, indent=1)

# fuentes: una @font-face por idioma que trae letras propias
info = json.load(open(R + 'src/data/titulo-letras.json'))
css = ['/* Generado por herramientas/titulos_exportar.py. No se edita a mano. Letras del título del documental por idioma. */']
for lang, d in sorted(info.items()):
    if not d.get('fuente'): continue
    css.append(f"@font-face{{font-family:'Titulo {lang}';src:url('/fuentes/{TD.carpeta(lang)}/{lang}.woff2') format('woff2');font-display:swap}}")
    css.append(f"@font-face{{font-family:'Titulo {lang} acero';src:url('/fuentes/{TD.carpeta(lang)}/{lang}-acero.woff2') format('woff2');font-display:swap}}")
    css.append(f":root:lang({lang}) .titulo-pelicula{{font-family:'Awakenning','Titulo {lang}',var(--disp)!important}}")
    css.append(f":root:lang({lang}) .titulo-pelicula .acero{{font-family:'Awakenning Steel','Titulo {lang} acero','Awakenning','Titulo {lang}',var(--disp)}}")
for l in ('ar', 'hi', 'th', 'zh', 'ja', 'ko'):
    css.append(f"@font-face{{font-family:'Eco {l}';src:url('/fuentes/titulo/eco-{l}.woff2') format('woff2');font-display:swap}}")
open(R + 'src/styles/titulo-letras.css', 'w').write('\n'.join(css) + '\n')

# textos traducidos
def doc(l): return TD.DOC[l].replace('|', '' if l in TD.SIN_ESPACIO else ' ')
cambios = {}
for fn in sorted(os.listdir(R + 'src/data/traducciones')):
    if not fn.endswith('.json'): continue
    lang = fn[:-5]; ruta = R + 'src/data/traducciones/' + fn; d = json.load(open(ruta)); n = 0
    for k, v in d.items():
        if not isinstance(v, str): continue
        nv = v.replace('Entre polvo y sueños', doc(lang)) if lang != 'es' else v
        nv = re.sub(r'\bECO\b', TD.ECO[lang], nv)
        if lang in TD.NOMBRE: nv = nv.replace('Jose Adrianzen', TD.NOMBRE[lang])
        if nv != v: d[k] = nv; n += 1
    json.dump(d, open(ruta, 'w'), ensure_ascii=False, indent=1); cambios[lang] = n
print(cambios)
