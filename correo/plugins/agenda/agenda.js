(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var marco = document.getElementById('age-marco');
    if (!marco) return;
    var cals = (rcmail.env.agenda_calendarios || []).map(function (c) { c.ver = true; return c; });
    var modo = 'AGENDA';
    try { var g = JSON.parse(localStorage.getItem('age-pref') || '{}'); if (g.modo) modo = g.modo; (g.ocultos || []).forEach(function (id) { cals.forEach(function (c) { if (c.id === id) c.ver = false; }); }); } catch (e) {}
    var oscuro = document.documentElement.classList.contains('dark-mode');
    function armar() {
      var p = new URLSearchParams({ ctz: rcmail.env.agenda_zona || 'America/Lima', mode: modo, showTitle: '0', showPrint: '0', showTabs: '0', showCalendars: '0', showTz: '0', wkst: '2', hl: 'es' });
      var vis = cals.filter(function (c) { return c.ver; });
      if (vis[0] && vis[0].cuenta) p.set('authuser', vis[0].cuenta);
      var q = p.toString();
      vis.forEach(function (c) { q += '&src=' + encodeURIComponent(c.id) + (c.color ? '&color=' + encodeURIComponent(c.color) : ''); });
      marco.src = 'https://calendar.google.com/calendar/embed?' + q;
      document.querySelectorAll('.age-modos button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.modo === modo); });
      document.getElementById('age-abrir').href = 'https://calendar.google.com/calendar/r' + (vis[0] && vis[0].cuenta ? '?authuser=' + encodeURIComponent(vis[0].cuenta) : '');
      try { localStorage.setItem('age-pref', JSON.stringify({ modo: modo, ocultos: cals.filter(function (c) { return !c.ver; }).map(function (c) { return c.id; }) })); } catch (e) {}
    }
    var caja = document.getElementById('age-cals');
    if (cals.length > 1) cals.forEach(function (c) {
      var l = document.createElement('label'); var i = document.createElement('input'); i.type = 'checkbox'; i.checked = c.ver;
      i.onchange = function () { c.ver = i.checked; armar(); };
      var s = document.createElement('span'); s.style.background = c.color || '#888';
      l.appendChild(i); l.appendChild(s); l.appendChild(document.createTextNode(c.nombre || c.id)); caja.appendChild(l);
    });
    document.querySelector('.age-modos').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { modo = b.dataset.modo; armar(); } });
    armar();
  });
})();
