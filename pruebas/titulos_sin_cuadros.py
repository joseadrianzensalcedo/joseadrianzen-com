# Chequeo permanente C195. En árabe, hindi y tailandés cada palabra del título es un carácter propio (zona privada de Unicode).
# Si ese carácter queda fuera de un elemento con la letra del título, el navegador dibuja un cuadro. Recorre las páginas y falla
# si encuentra alguno. Además revisa que todas las letras generadas tengan la tabla de nombres completa (Safari la exige).
# Uso: python3 -m http.server 4463 -d dist &   python3 pruebas/titulos_sin_cuadros.py
import asyncio, subprocess, sys
from playwright.async_api import async_playwright
RUTAS = ['/', '/entre-polvo-y-suenos/', '/sobre-mi/', '/blog/', '/eco/', '/contacto/', '/fotografia/']
async def main():
    mal = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); c = await b.new_context(**p.devices['iPhone 15']); await c.add_init_script("try{sessionStorage.setItem('ja-intro','1')}catch(e){}")
        pg = await c.new_page()
        for lang in ('ar', 'hi', 'th'):
            for r in RUTAS:
                await pg.goto(f'http://localhost:4463/{lang}{r}', wait_until='load'); await pg.wait_for_timeout(1200)
                n = await pg.evaluate("""()=>{let k=0;const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode()){if(/[\\uE000-\\uF8FF]/.test(n.data)&&!n.parentElement.closest('.titulo-pelicula'))k++}return k}""")
                if n: mal.append((lang, r, n))
        await b.close()
    r = subprocess.run([sys.executable, 'herramientas/fuentes_nombres.py', '--revisa'], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[-1])
    if r.returncode: mal.append(('nombres', r.stdout))
    print('PASA' if not mal else f'FALLA {mal}'); sys.exit(1 if mal else 0)
asyncio.run(main())
