# Librerías locales (sin CDN)

Cargar solo desde aquí, por ruta relativa desde el prototipo (`../lib/...`).

Globales (script clásico):
- `../lib/gsap.min.js` (+ `ScrollTrigger.min.js`, `SplitText.min.js`, `Flip.min.js`, `Draggable.min.js`, `Observer.min.js`, `ScrollToPlugin.min.js`). GSAP 3.13. Registrar: `gsap.registerPlugin(ScrollTrigger)`.
- `../lib/lenis.min.js` + `../lib/lenis.css`. Lenis 1.3. Uso: `const lenis = new Lenis({autoRaf:true})`.
- `../lib/split-type.min.js`. `new SplitType('.titulo', {types:'chars'})`.

Módulos ES (script type="module" con importmap):
```html
<script type="importmap">{"imports":{"three":"../lib/three/three.module.min.js","three/addons/":"../lib/three/addons/"}}</script>
<script type="module">
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
</script>
```
Three 0.169. Addons disponibles: postprocessing, shaders, controls, utils, objects, geometries.

OGL (WebGL mínimo, ES module): `import { Renderer, Program, Mesh, Triangle, Texture } from '../lib/ogl/index.js';`
