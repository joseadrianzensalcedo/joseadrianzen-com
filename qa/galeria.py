#!/usr/bin/env python3
"""Arma protos/index.html (galería de los 100 prototipos) y las miniaturas desde las capturas del QA."""
import json, os, html
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(R, 'protos')
CAP = os.path.join(R, 'qa', 'capturas')
MIN = os.path.join(P, '_galeria')
os.makedirs(MIN, exist_ok=True)
lotes = json.load(open(os.path.join(R, 'conceptos.json')))

items = []
for l in lotes:
    for c in l['conceptos']:
        slug = f"{c['n']:02d}-{c['slug']}"
        d = os.path.join(P, slug)
        inf = os.path.join(R, 'qa', 'informes', slug + '.json')
        ok = os.path.exists(os.path.join(d, 'index.html')) and os.path.exists(inf) and json.load(open(inf)).get('ok')
        ficha = {}
        if os.path.exists(os.path.join(d, 'ficha.json')):
            try: ficha = json.load(open(os.path.join(d, 'ficha.json')))
            except Exception: pass
        mini = None
        for suf, w in (('1440', 720), ('390', 300)):
            src = os.path.join(CAP, f'{slug}-{suf}.png')
            if ok and os.path.exists(src):
                dst = os.path.join(MIN, f'{slug}-{suf}.webp')
                if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
                    im = Image.open(src).convert('RGB'); im.thumbnail((w, 10000)); im.save(dst, 'WEBP', quality=72)
                if suf == '1440': mini = f'_galeria/{slug}-1440.webp'
        kb = round(json.load(open(inf))['bytes_html'] / 1024) if os.path.exists(inf) else None
        items.append({'n': c['n'], 'slug': slug, 'nombre': c['nombre'], 'familia': l['familia'], 'peso': c['peso'],
                      'concepto': ficha.get('concepto') or c['brief'], 'listo': bool(ok), 'mini': mini,
                      'tipos': ficha.get('tipografias', []), 'paleta': ficha.get('paleta', [])[:6], 'kb': kb})

listos = sum(i['listo'] for i in items)
familias = [l['familia'] for l in lotes]
e = html.escape

cards = []
for i in items:
    pal = ''.join(f'<i style="background:{e(c)}"></i>' for c in i['paleta'] if isinstance(c, str) and c.startswith('#'))
    img = f'<img src="{i["mini"]}" alt="Portada del prototipo {e(i["nombre"])}" width="720" height="450" loading="lazy" decoding="async">' if i['mini'] else '<div class="vacio">En construcción</div>'
    tag = 'a' if i['listo'] else 'div'
    href = f' href="{i["slug"]}/" target="_blank" rel="noopener"' if i['listo'] else ''
    cards.append(f'''<{tag} class="card{'' if i['listo'] else ' pend'}" data-fam="{e(i['familia'])}" data-peso="{i['peso']}"{href}>
<div class="shot">{img}</div>
<div class="info"><span class="n">{i['n']:03d}</span><h3>{e(i['nombre'])}</h3>
<p class="fam">{e(i['familia'])} · <b class="p-{i['peso']}">{i['peso']}</b>{f" · {i['kb']} kB" if i['kb'] else ''}</p>
<p class="con">{e(i['concepto'])}</p>
<div class="meta"><span class="pal">{pal}</span><span class="tip">{e(' + '.join(i['tipos'][:2]))}</span></div></div></{tag}>''')

chips = ''.join(f'<button type="button" class="chip" data-f="{e(f)}" aria-pressed="false">{e(f)}</button>' for f in familias)
page = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jose Adrianzen · 100 prototipos web</title>
<meta name="description" content="Cien propuestas de diseño para joseadrianzen.com, con el contenido real del sitio.">
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23050505'/%3E%3Ctext x='32' y='46' font-size='40' text-anchor='middle' fill='%23c9a55c' font-family='Impact'%3EJ%3C/text%3E%3C/svg%3E">
<style>
@font-face{{font-family:'Anton';src:url('assets/fonts/anton-400-latin.woff2') format('woff2');font-display:swap}}
@font-face{{font-family:'Archivo';src:url('assets/fonts/archivo-400-latin.woff2') format('woff2');font-weight:400;font-display:swap}}
@font-face{{font-family:'Archivo';src:url('assets/fonts/archivo-500-latin.woff2') format('woff2');font-weight:500;font-display:swap}}
@font-face{{font-family:'Special Elite';src:url('assets/fonts/special-elite-400-latin.woff2') format('woff2');font-display:swap}}
:root{{--fondo:#050505;--f2:#0c0b0a;--tinta:#f2efe9;--humo:#8a837a;--linea:#232019;--oro:#c9a55c;--polvo:#d68a2e;color-scheme:dark}}
@media (prefers-color-scheme:light){{:root:not([data-theme=dark]){{--fondo:#f2efe9;--f2:#e8e3da;--tinta:#0c0b0a;--humo:#5f584f;--linea:#d3ccc0;--oro:#8a6726;--polvo:#9a5a12;color-scheme:light}}}}
:root[data-theme=light]{{--fondo:#f2efe9;--f2:#e8e3da;--tinta:#0c0b0a;--humo:#5f584f;--linea:#d3ccc0;--oro:#8a6726;--polvo:#9a5a12;color-scheme:light}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--fondo);color:var(--tinta);font:15px/1.55 'Archivo',Arial,sans-serif}}
.w{{max-width:1440px;margin:0 auto;padding-inline:clamp(16px,4vw,48px);padding-block:0 80px}}
.top{{display:flex;justify-content:space-between;align-items:center;padding-block:18px;border-bottom:1px solid var(--linea);font-family:'Special Elite',monospace;font-size:13px;color:var(--humo);gap:12px}}
.top button{{background:none;border:1px solid var(--linea);color:var(--tinta);font:inherit;padding:6px 12px;border-radius:999px;cursor:pointer}}
h1{{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(48px,9vw,140px);line-height:.95;margin:48px 0 16px}}
h1 span{{color:var(--oro)}}
.lede{{max-width:64ch;font-size:17px;margin:0 0 8px}}
.sello{{font-family:'Special Elite',monospace;color:var(--humo);font-size:13px;margin-bottom:28px}}
.filtros{{display:flex;flex-wrap:wrap;gap:8px;position:sticky;top:0;background:var(--fondo);padding-block:12px;z-index:3;border-bottom:1px solid var(--linea)}}
.chip{{border:1px solid var(--linea);background:none;color:var(--tinta);font:500 13px 'Archivo',sans-serif;padding:6px 12px;border-radius:999px;cursor:pointer}}
.chip[aria-pressed=true]{{background:var(--oro);border-color:var(--oro);color:var(--fondo)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:28px 22px;margin-top:26px}}
.card{{display:block;text-decoration:none;color:inherit}}
.shot{{aspect-ratio:1440/900;background:var(--f2);border:1px solid var(--linea);overflow:hidden}}
.shot img{{width:100%;height:100%;object-fit:contain;display:block;transition:transform .5s cubic-bezier(.2,.7,.2,1)}}
.card:hover .shot img,.card:focus-visible .shot img{{transform:scale(1.03)}}
.card:focus-visible{{outline:2px solid var(--oro);outline-offset:4px}}
.vacio{{height:100%;display:grid;place-items:center;font-family:'Special Elite',monospace;color:var(--humo)}}
.pend{{opacity:.5}}
.info{{padding-top:12px}}
.n{{font-family:'Special Elite',monospace;color:var(--polvo);font-size:12px}}
h3{{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:26px;line-height:1.1;margin:2px 0 4px}}
.card:hover h3{{color:var(--oro)}}
.fam{{margin:0;font-size:13px;color:var(--humo)}}
.p-ligera{{color:#8fb07a}}.p-media{{color:var(--polvo)}}.p-pesada{{color:#c46a5a}}
.con{{margin:6px 0 8px;font-size:14px}}
.meta{{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:12px;color:var(--humo)}}
.pal{{display:flex}}.pal i{{width:14px;height:14px;border-radius:50%;border:1px solid var(--linea);margin-right:-4px}}
@media (prefers-reduced-motion:reduce){{.shot img{{transition:none}}}}
</style></head><body><div class="w">
<div class="top"><span>joseadrianzen.com · prototipos</span><button id="tema" type="button">Cambiar tema</button></div>
<h1>100 webs para <span>Jose Adrianzen</span></h1>
<p class="lede">Cien propuestas de diseño con todo el contenido real del sitio: el documental, ECO, la fotografía, el director, el blog y el contacto. Cada una es una web completa. Ábrelas, recórrelas en el celular y quédate con las que te muevan.</p>
<p class="sello">{listos} de 100 listas · ligera, media o pesada según su carga · pasan un control automático de imágenes, textos y desbordes</p>
<div class="filtros"><button type="button" class="chip" data-f="" aria-pressed="true">Todas</button>{chips}
<button type="button" class="chip" data-p="ligera" aria-pressed="false">Solo ligeras</button></div>
<div class="grid">{''.join(cards)}</div></div>
<script>
(function(){{var r=document.documentElement;var t=null;try{{t=localStorage.getItem('tema')}}catch(e){{}}if(t)r.dataset.theme=t;
document.getElementById('tema').onclick=function(){{var osc=r.dataset.theme?r.dataset.theme==='dark':!matchMedia('(prefers-color-scheme: light)').matches;r.dataset.theme=osc?'light':'dark';try{{localStorage.setItem('tema',r.dataset.theme)}}catch(e){{}}}};
var fam='',peso='';var cs=[].slice.call(document.querySelectorAll('.card'));
function pinta(){{cs.forEach(function(c){{c.hidden=(fam&&c.dataset.fam!==fam)||(peso&&c.dataset.peso!==peso)}})}}
document.querySelectorAll('.chip').forEach(function(b){{b.onclick=function(){{if(b.dataset.p!==undefined){{peso=peso?'':'ligera';b.setAttribute('aria-pressed',!!peso)}}else{{fam=b.dataset.f;document.querySelectorAll('.chip[data-f]').forEach(function(x){{x.setAttribute('aria-pressed',x===b)}})}}pinta()}}}});}})();
</script></body></html>'''
open(os.path.join(P, 'index.html'), 'w').write(page)
print(f'galería: {listos} listas de {len(items)}')
