(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var marcos = document.getElementById('age-marcos');
    if (!marcos) return;
    var cals = (rcmail.env.agenda_calendarios || []).map(function (c) { c.ver = true; return c; });
    var modo = 'AGENDA';
    try { var g = JSON.parse(localStorage.getItem('age-pref') || '{}'); if (g.modo) modo = g.modo; (g.ocultos || []).forEach(function (id) { cals.forEach(function (c) { if (c.id === id) c.ver = false; }); }); } catch (e) {}
    var oscuro = document.documentElement.classList.contains('dark-mode');
    function armar() {
      var vis = cals.filter(function (c) { return c.ver; });
      // Un cuadro por cuenta de Google: cada uno se abre con su propia sesión.
      var grupos = [];
      vis.forEach(function (c) {
        var g = grupos.find(function (x) { return x.cuenta === (c.cuenta || ''); });
        if (!g) { g = { cuenta: c.cuenta || '', cals: [] }; grupos.push(g); }
        g.cals.push(c);
      });
      marcos.textContent = '';
      marcos.style.gridTemplateColumns = 'repeat(' + Math.max(grupos.length, 1) + ',minmax(0,1fr))';
      grupos.forEach(function (g) {
        var p = new URLSearchParams({ ctz: rcmail.env.agenda_zona || 'America/Lima', mode: modo, showTitle: '0', showPrint: '0', showTabs: '0', showCalendars: '0', showTz: '0', wkst: '2', hl: 'es' });
        if (g.cuenta) p.set('authuser', g.cuenta);
        var q = p.toString();
        g.cals.forEach(function (c) { q += '&src=' + encodeURIComponent(c.id) + (c.color ? '&color=' + encodeURIComponent(c.color) : ''); });
        var f = document.createElement('iframe');
        f.title = 'Agenda ' + g.cals.map(function (c) { return c.nombre || c.id; }).join(' y ');
        f.referrerPolicy = 'no-referrer';
        f.src = 'https://calendar.google.com/calendar/embed?' + q;
        var fig = document.createElement('div'); fig.className = 'age-cuadro';
        if (grupos.length > 1) { var r = document.createElement('span'); r.className = 'age-rotulo'; r.textContent = g.cals.map(function (c) { return c.nombre || c.id; }).join(' y '); r.style.borderColor = g.cals[0].color || ''; fig.appendChild(r); }
        fig.appendChild(f); marcos.appendChild(fig);
      });
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
