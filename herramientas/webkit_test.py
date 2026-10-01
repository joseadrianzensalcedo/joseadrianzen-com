"""Fase 11. Prueba del sitio en el motor WebKit (el mismo motor de Safari), con WebKitGTK y Selenium."""
import json, subprocess, time, sys
from selenium import webdriver
from selenium.webdriver.webkitgtk.options import Options
from selenium.webdriver.webkitgtk.service import Service
P = '/tmp/claude-0/-home-claude/8a76512e-820e-57e8-bf42-1d3dad88e208/scratchpad/'
LANGS = sys.argv[1].split(',') if len(sys.argv) > 1 else ['es', 'en', 'ar', 'zh', 'ru', 'hi', 'ja', 'th', 'de', 'qu']
PAGS = ['', 'entre-polvo-y-suenos/', 'eco/', 'fotografia/', 'sobre-mi/', 'blog/', 'contacto/', 'blog/la-ia-no-sabe-donde-poner-la-camara/']
TAM = [(390, 844), (1440, 900)]
MEDIR = open(P + 'idiomas_test.py').read().split("MEDIR = '''")[1].split("'''")[0]
ESTADO = '''return (()=>{const m=JSON.parse(%s);return {mov:!!window.__mov, lineas:document.querySelectorAll('.linea').length,
 lienzos:document.querySelectorAll('.encuadre canvas').length, encuadres:document.querySelectorAll('.encuadre').length,
 fuentes:document.fonts.status, bebas:document.fonts.check('40px "Bebas Neue"'), news:document.fonts.check('20px Newsreader'),
 dir:document.documentElement.dir, ocultos:[...document.querySelectorAll('[data-letras],[data-lineas],[data-aparece]')].filter(e=>getComputedStyle(e).visibility==='hidden'||getComputedStyle(e).opacity==='0').length,
 ...m}})()'''
srv = subprocess.Popen(['python3', '-m', 'http.server', '4410', '-d', P + 'rediseno/dist'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
res = []
try:
    for w, h in TAM:
        o = Options(); o.binary_location = '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'
        o.add_argument('--automation'); o.add_argument(f'--geometry={w}x{h}')
        d = webdriver.WebKitGTK(options=o, service=Service('/usr/bin/WebKitWebDriver'))
        d.set_window_size(w, h)
        for l in LANGS:
            for pg in PAGS:
                if pg.startswith('blog/la-') and l not in ('es',): continue
                url = f'http://localhost:4410/{"" if l == "es" else l + "/"}{pg}'
                d.get(url); time.sleep(2.2)
                alto = d.execute_script('return document.documentElement.scrollHeight'); vh = d.execute_script('return innerHeight')
                y = 0; agg = None
                while True:
                    r = d.execute_script('return ' + MEDIR)
                    agg = r if agg is None else {**agg, 'choques': sorted(set(agg['choques']) | set(r['choques'])), 'fuera': sorted(set(agg['fuera']) | set(r['fuera'])), 'cortes': sorted(set(agg['cortes']) | set(r['cortes'])), 'desborde': max(agg['desborde'], r['desborde'])}
                    if y >= alto - vh: break
                    y += int(vh * .85); d.execute_script(f'scrollTo(0,{y})'); time.sleep(0.6)
                time.sleep(1.2)
                est = d.execute_script('''return {mov:!!window.__mov, lineas:document.querySelectorAll('.linea').length,
                  lienzos:document.querySelectorAll('.encuadre canvas').length, fuentes:document.fonts.status,
                  bebas:document.fonts.check('40px "Bebas Neue"'), news:document.fonts.check('20px Newsreader'),
                  ocultos:[...document.querySelectorAll('[data-letras],[data-lineas],[data-aparece],[data-cascada]>*')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&(getComputedStyle(e).visibility==='hidden'||+getComputedStyle(e).opacity<0.05)}).length,
                  ua:navigator.userAgent.slice(-40)}''')
                if pg == '' and l in ('es', 'ar', 'zh', 'ru'):
                    d.execute_script('scrollTo(0,0)'); time.sleep(1.5); d.save_screenshot(f'{P}f11w/{l}_{w}.png')
                res.append({'lang': l, 'pag': pg, 'ancho': w, **agg, **est}); print(l, pg or 'portada', w, agg['desborde'], est, flush=True)
        d.quit()
finally:
    srv.terminate()
json.dump(res, open(P + 'f11w/resultado.json', 'w'), ensure_ascii=False, indent=1)
