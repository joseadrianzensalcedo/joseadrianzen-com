# Recorre las páginas con el servidor local en el puerto 4463 y lista textos que se montan unos sobre otros. Uso: python3 pruebas/solapes.py 393
import asyncio, sys, json
from playwright.async_api import async_playwright
W=int(sys.argv[1]) if len(sys.argv)>1 else 393
H=852 if W<500 else 800
JS="""()=>{
const vis=(e)=>{for(let x=e;x&&x!==document.documentElement;x=x.parentElement){const s=getComputedStyle(x);if(s.visibility==='hidden'||s.display==='none'||+s.opacity<0.4)return false}return true};
const bloque=(n)=>{let e=n.parentElement;while(e&&getComputedStyle(e).display.startsWith('inline'))e=e.parentElement;return e};
const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){const t=n.textContent.trim();if(!t)continue;const b=bloque(n);if(!b||b.closest('script,style,noscript,.aviso-medidor,.flota,.menu-capa,.cursor,#visor,[hidden]'))continue;if(!vis(b))continue;
const r=document.createRange();r.selectNodeContents(n);for(const q of r.getClientRects()){if(q.width<4||q.height<4)continue;if(q.bottom<0||q.top>innerHeight||q.right<0||q.left>innerWidth)continue;
// recorte por padres con overflow hidden
let rec=false;for(let x=b;x&&x!==document.body;x=x.parentElement){const s=getComputedStyle(x);if(/hidden|clip/.test(s.overflow+s.overflowX+s.overflowY)){const p=x.getBoundingClientRect();if(q.bottom<p.top+1||q.top>p.bottom-1||q.right<p.left+1||q.left>p.right-1){rec=true;break}}}
if(rec)continue;
out.push({t:t.slice(0,28),b,x:q.left,y:q.top,w:q.width,h:q.height,nav:!!b.closest('.nav')})}}
const nav=document.querySelector('.nav');const nb=getComputedStyle(nav).backgroundColor;const am=/rgba\\((\\d+), (\\d+), (\\d+), ([\\d.]+)\\)/.exec(nb);const solido=am?+am[4]>0.8:(nb!=='rgba(0, 0, 0, 0)');
const res=[];for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],c=out[j];if(a.b===c.b||a.b.contains(c.b)||c.b.contains(a.b))continue;
const ix=Math.min(a.x+a.w,c.x+c.w)-Math.max(a.x,c.x),iy=Math.min(a.y+a.h,c.y+c.h)-Math.max(a.y,c.y);if(ix<=2||iy<=2)continue;const ar=ix*iy;if(ar<0.2*Math.min(a.w*a.h,c.w*c.h))continue;
if(solido&&(a.nav!==c.nav)){const o=a.nav?c:a;const nr=nav.getBoundingClientRect();if(o.y+o.h<=nr.bottom+1)continue}
res.push([a.t,c.t,Math.round(a.y),a.nav||c.nav?'NAV':''])}
return {solido,res}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        kw=p.devices['iPhone 15'] if W<500 else {'viewport':{'width':W,'height':H}}
        c=await b.new_context(**kw); pg=await c.new_page()
        urls=['/','/entre-polvo-y-suenos/','/eco/','/fotografia/','/sobre-mi/','/contacto/','/blog/']
        for u in urls:
            await pg.goto('http://localhost:4463'+u,wait_until='load'); await pg.wait_for_timeout(2500)
            await pg.evaluate("document.querySelectorAll('.aviso-medidor').forEach(e=>e.remove())")
            h=await pg.evaluate("document.documentElement.scrollHeight"); y=0; vistos=set(); n=0
            while y<h:
                await pg.evaluate(f"scrollTo(0,{y})"); await pg.wait_for_timeout(1300)
                r=await pg.evaluate(JS)
                for it in r['res']:
                    k=(it[0],it[1])
                    if k in vistos: continue
                    vistos.add(k); print(u,'y',y,'nav' if it[3] else '',repr(it[0]),'x',repr(it[1])); n+=1
                y+=int(H*0.6)
            print(u,'->',n,'solapes')
        await b.close()
asyncio.run(main())
