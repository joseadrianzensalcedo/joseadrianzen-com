import time, subprocess, sys
from selenium import webdriver
from selenium.webdriver.webkitgtk.options import Options
from selenium.webdriver.webkitgtk.service import Service
P = '/tmp/claude-0/-home-claude/8a76512e-820e-57e8-bf42-1d3dad88e208/scratchpad/'
srv = subprocess.Popen(['python3', '-m', 'http.server', '4411', '-d', P + sys.argv[1]], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
o = Options(); o.binary_location = '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'; o.add_argument('--automation')
d = webdriver.WebKitGTK(options=o, service=Service('/usr/bin/WebKitWebDriver')); d.set_window_size(1440, 900)
MED = '''return (sel=>{const a=document.querySelector(sel[0]),b=document.querySelector(sel[1]);if(!a||!b)return null;%s const r=a.getBoundingClientRect(),s=b.getBoundingClientRect();return [innerWidth,innerHeight,'A',Math.round(r.top),Math.round(r.bottom),Math.round(r.left),Math.round(r.right),'B',Math.round(s.top),Math.round(s.bottom),Math.round(s.left),Math.round(s.right),getComputedStyle(b).position]})(arguments[0])'''
casos = [('entre-polvo-y-suenos/', 'h1.gigante', 'button.pausa'), ('eco/', 'h1.eco-titulo', 'button.pausa'), ('', 'h2.eco-t', '.eco .enc b'), ('', 'h2.titulo', 'p.cod'), ('ar/sobre-mi/', 'p.cita', 'p.cod')]
try:
    for i, (u, a, b) in enumerate(casos):
        d.get('http://localhost:4411/' + u); time.sleep(3)
        print(u, a, b, d.execute_script(MED % "a.scrollIntoView({block:'center'});", [a, b])); time.sleep(2.5)
        print('  luego', d.execute_script(MED % '', [a, b]))
        d.save_screenshot(f'{P}f11w/c{i}.png')
finally:
    d.quit(); srv.terminate()
