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

/* Selector de cuentas (yo@joseadrianzen.com y Gmail), del plugin ident_switch.
   El plugin solo sabe ubicarse en las pieles larry, classic y elastic, y mira
   el nombre de la piel: con "adrianzen" se queda escondido aunque esta piel
   herede de elastic (se comprobó el 1 de octubre de 2026 con ident_switch 5.0.5).
   Aquí se hace el mismo paso que el plugin hace para elastic. Corre después de
   todos los $(function) para no adelantarse al plugin. */
(function () {
  'use strict';
  if (typeof jQuery === 'undefined' || window.self !== window.top) return;
  jQuery(function ($) {
    setTimeout(function () {
      var $w = $('#ident-switch-wrapper');
      if (!$w.length || !window.rcmail || rcmail.env.skin === 'elastic') return;
      if ($w.closest('.header-title.username').length) return;          // ya ubicado
      if (typeof plugin_switchIdent_addCbElastic !== 'function') return;
      var $sw = $w.find('#plugin-ident_switch-account');
      if (!plugin_switchIdent_addCbElastic($w, $sw)) return;
      $sw.show();
      $sw.find('option').each(function () { $(this).data('orig-text', $(this).text()); });
      if (typeof ident_switch_updateCounts === 'function') {
        rcmail.addEventListener('plugin.ident_switch.update_counts', ident_switch_updateCounts);
        if (rcmail.env.ident_switch_initial_counts) ident_switch_updateCounts(rcmail.env.ident_switch_initial_counts);
      }
      if (typeof ident_switch_onNotify === 'function') rcmail.addEventListener('plugin.ident_switch.notify', ident_switch_onNotify);
    }, 0);
  });
})();
