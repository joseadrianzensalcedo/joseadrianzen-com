# Fotografía el título del documental (portada y página de la película) y el de ECO en cada idioma. Uso: python3 pruebas/titulos.py [ancho]
import asyncio, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0, 'herramientas')
import titulos_datos as TD
W = int(sys.argv[1]) if len(sys.argv) > 1 else 1280
H = 852 if W < 500 else 800
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/tit'
async def main():
    import os; os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        kw = p.devices['iPhone 15'] if W < 500 else {'viewport': {'width': W, 'height': H}}
        c = await b.new_context(**kw); await c.add_init_script("try{sessionStorage.setItem('ja-intro','1')}catch(e){}")
        res = {}
        for lang in sorted(TD.DOC):
            pre = '' if lang == 'es' else '/' + lang
            pg = await c.new_page()
            for nombre, url, sel in (('portada', pre + '/', '.hero-peli .titulo-pelicula'), ('peli', pre + '/entre-polvo-y-suenos/', '.titulo-fijo .titulo-pelicula'), ('eco', pre + '/eco/', '.eco-titulo')):
                await pg.goto('http://localhost:4463' + (url if url != '' else '/'), wait_until='load'); await pg.wait_for_timeout(5500)
                el = await pg.query_selector(sel)
                if not el: res[f'{lang}-{nombre}'] = 'NO HAY'; continue
                info = await pg.evaluate("(s)=>{const e=document.querySelector(s);const r=e.getBoundingClientRect();return {sw:e.scrollWidth,cw:e.clientWidth,w:r.width,h:r.height,txt:e.textContent.trim().slice(0,40),font:getComputedStyle(e).fontFamily.slice(0,60),vw:innerWidth,right:r.right,left:r.left}}", sel)
                res[f'{lang}-{nombre}'] = info
                box = await el.bounding_box()
                await pg.screenshot(path=f'{OUT}/{lang}-{nombre}.png', clip={'x': 0, 'y': max(0, box['y'] - 30), 'width': W, 'height': min(H, box['height'] + 60)})
            await pg.close()
        json.dump(res, open(f'{OUT}/info.json', 'w'), ensure_ascii=False, indent=1)
        mal = {k: v for k, v in res.items() if isinstance(v, str) or v['right'] > v['vw'] + 2 or v['left'] < -2}
        print('fuera de pantalla o sin elemento:', json.dumps(mal, ensure_ascii=False)[:1500])
        await b.close()
asyncio.run(main())
