/* Correo — los detalles del sitio dentro de Roundcube.
   Solo el cursor propio. El grano es CSS puro y ya viene puesto desde
   layout.html, no necesita nada aqui.

   Se carga DESPUES de ui.js de Elastic y con otro nombre: si se llamara
   ui.js, Roundcube resolveria "/ui.js" contra esta piel y el de Elastic
   nunca se cargaria. */
(function () {
  'use strict';

  // Roundcube usa iframes para el mensaje y para redactar. El cursor se
  // dibuja solo en el documento de arriba; si no, saldrian dos.
  if (window.self !== window.top) return;

  var cur = document.getElementById('cur');
  if (!cur) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.matchMedia('(hover:hover)').matches) {
    cur.remove();
    return;
  }

  var cx = 0, cy = 0, tx = 0, ty = 0, raf = null;

  function loop() {
    cx += (tx - cx) * 0.22;
    cy += (ty - cy) * 0.22;
    cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    cur.classList.add('on');
    if (!raf) loop();
  }, { passive: true });

  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    cur.classList.toggle('big', !!t.closest('a,button,.btn,#taskmenu a,.listing li,#messagelist tr'));
  });

  // Al salir de la ventana el circulo se apaga; al entrar en un iframe
  // tambien, porque ahi dentro manda el cursor real.
  document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
  window.addEventListener('blur', function () { cur.classList.remove('on'); });
})();
