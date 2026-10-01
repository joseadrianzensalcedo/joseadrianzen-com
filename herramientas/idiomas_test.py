import asyncio, json, sys, subprocess, time
from playwright.async_api import async_playwright
P = '/tmp/claude-0/-home-claude/8a76512e-820e-57e8-bf42-1d3dad88e208/scratchpad/'
LANGS = ['es','en','pt','fr','it','de','nl','pl','ru','uk','tr','ar','hi','zh','ja','ko','id','vi','th','fil','sw','qu','ay']
PAGS = ['', 'entre-polvo-y-suenos/', 'eco/', 'fotografia/', 'sobre-mi/', 'blog/', 'contacto/']
DISP = {'movil': {'viewport': {'width': 390, 'height': 844}, 'device_scale_factor': 2, 'is_mobile': True, 'has_touch': True},
        'tableta': {'viewport': {'width': 820, 'height': 1180}, 'is_mobile': True, 'has_touch': True},
        'escritorio': {'viewport': {'width': 1440, 'height': 900}}}
MEDIR = '''(()=>{
 const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.opacity!=='0'};
 const els=[...document.querySelectorAll('main h1,main h2,main h3,main p,main li,main a,main b,main dt,main dd,main figcaption,main button,.nav a,.nav summary,.pie a')]
   .filter(e=>vis(e)&&!e.closest('[hidden],.menu-capa,.franja,.cinta,details:not([open]) ul'));
 const leaf=els.filter(e=>!els.some(o=>o!==e&&e.contains(o)));
 const out=[];
 for(let i=0;i<leaf.length;i++)for(let j=i+1;j<leaf.length;j++){const a=leaf[i],b=leaf[j];
   const r=a.getBoundingClientRect(),s=b.getBoundingClientRect();
   const w=Math.min(r.right,s.right)-Math.max(r.left,s.left),h=Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top);
   if(w>3&&h>3){const n=x=>x.tagName.toLowerCase()+'.'+[...x.classList].join('.')+'('+(x.closest('[class]')?.className||'')+')';out.push(n(a)+' x '+n(b))}}
 const anchos=[];for(const e of leaf){const r=e.getBoundingClientRect();if(r.right>innerWidth+1||r.left<-1)anchos.push(e.tagName+'.'+e.className+' '+Math.round(r.left)+'..'+Math.round(r.right))}
 const cortes=[];for(const e of document.querySelectorAll('main h1,main h2,.titulo,.gigante')){if(e.scrollWidth>e.clientWidth+2)cortes.push(e.tagName+'.'+e.className+' '+e.scrollWidth+'>'+e.clientWidth)}
 return {choques:[...new Set(out)],fuera:anchos,cortes,desborde:document.documentElement.scrollWidth-innerWidth,dir:document.documentElement.dir}
})()'''

async def una(b, lang, pag, disp, cfg, res, fotos):
    ctx = await b.new_context(**cfg, reduced_motion='reduce')
    pg = await ctx.new_page(); err = []
    pg.on('pageerror', lambda x: err.append(str(x)))
    pre = '' if lang == 'es' else lang + '/'
    if pag.startswith('blog/') or pag == 'blog/': pass
    url = f'http://localhost:4400/{pre}{pag}'
    r = await pg.goto(url)
    await pg.wait_for_timeout(900)
    alto = await pg.evaluate('document.documentElement.scrollHeight'); H = cfg['viewport']['height']
    acc = {'choques': set(), 'fuera': set(), 'cortes': set(), 'desborde': 0}
    y = 0
    while True:
        m = await pg.evaluate(MEDIR)
        for k in ('choques', 'fuera', 'cortes'): acc[k].update(m[k])
        acc['desborde'] = max(acc['desborde'], m['desborde'])
        if y >= alto - H: break
        y += int(H * 0.85); await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(120)
    if (lang, pag, disp) in fotos:
        await pg.evaluate('scrollTo(0,0)'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{P}f11i/{lang}_{pag.strip("/") or "portada"}_{disp}.png')
    res.append({'lang': lang, 'pag': pag, 'disp': disp, 'estado': r.status, 'err': err, 'desborde': acc['desborde'],
                'choques': sorted(acc['choques']), 'fuera': sorted(acc['fuera']), 'cortes': sorted(acc['cortes'])})
    await ctx.close()

async def main():
    import os; os.makedirs(P + 'f11i', exist_ok=True)
    srv = subprocess.Popen(['python3', '-m', 'http.server', '4400', '-d', P + 'rediseno/dist'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    fotos = {(l, p, d) for l in ['zh', 'ja', 'ko', 'ar', 'hi', 'th', 'ru', 'vi', 'de', 'ay'] for p in ['', 'sobre-mi/'] for d in ['movil', 'escritorio']}
    res = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch()
            tareas = [(l, pg, d, c) for l in LANGS for pg in PAGS for d, c in DISP.items()]
            sem = asyncio.Semaphore(6)
            async def go(t):
                async with sem:
                    try: await una(b, *t, res, fotos)
                    except Exception as e: res.append({'lang': t[0], 'pag': t[1], 'disp': t[2], 'fallo': str(e)[:200]})
            await asyncio.gather(*[go(t) for t in tareas])
            await b.close()
    finally:
        srv.terminate()
    json.dump(res, open(P + 'f11i/resultado.json', 'w'), ensure_ascii=False, indent=1)
    base = {(r['pag'], r['disp']): set(r.get('choques', [])) for r in res if r['lang'] == 'es'}
    malos = 0
    for r in sorted(res, key=lambda r: (r['lang'], r['pag'], r['disp'])):
        nuevos = sorted(set(r.get('choques', [])) - base.get((r['pag'], r['disp']), set()))
        if r.get('fallo') or r.get('err') or r.get('desborde', 0) > 0 or nuevos or r.get('fuera') or r.get('cortes'):
            malos += 1
            print(json.dumps({**{k: r.get(k) for k in ('lang', 'pag', 'disp', 'fallo', 'err', 'desborde', 'fuera', 'cortes')}, 'choques_nuevos': nuevos[:6]}, ensure_ascii=False))
    print('casos', len(res), 'con algo', malos)
    print('choques base es', {k: len(v) for k, v in base.items()})
asyncio.run(main())
