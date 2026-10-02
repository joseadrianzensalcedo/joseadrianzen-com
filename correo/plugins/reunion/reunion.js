/* Arma las direcciones de Meet y Calendar. No manda nada a ningún servidor propio. */
(function () {
  function cuenta() { var c = rcmail.env.reunion_cuenta; return c ? 'authuser=' + encodeURIComponent(c) : ''; }
  function abrir(u) { var w = window.open(u, '_blank'); if (w) w.opener = null; else location.href = u; }
  var dos = function (n) { return String(n).padStart(2, '0'); };

  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('reu-programar');
    if (!f) return;
    var q = cuenta();
    document.getElementById('reu-meet').href = 'https://meet.google.com/' + (q ? '?' + q : '');
    document.getElementById('reu-agenda').href = 'https://calendar.google.com/calendar/r/agenda' + (q ? '?' + q : '');
    document.getElementById('reu-ya').addEventListener('click', function () { abrir('https://meet.google.com/new' + (q ? '?' + q : '')); });

    document.getElementById('reu-unirse').addEventListener('submit', function (e) {
      e.preventDefault();
      var m = String(this.codigo.value).trim().match(/([a-z]{3}-?[a-z]{4}-?[a-z]{3})\s*$/i);
      if (!m) { this.codigo.setCustomValidity('Ese código no parece de Meet (son 10 letras, como abc-defg-hij).'); this.codigo.reportValidity(); return; }
      this.codigo.setCustomValidity('');
      var c = m[1].toLowerCase().replace(/-/g, ''); c = c.slice(0, 3) + '-' + c.slice(3, 7) + '-' + c.slice(7);
      abrir('https://meet.google.com/' + c + (q ? '?' + q : ''));
    });
    document.querySelector('#reu-unirse input').addEventListener('input', function () { this.setCustomValidity(''); });

    // Valores de partida: hoy, la próxima media hora, tu zona.
    var ahora = new Date(); ahora.setMinutes(ahora.getMinutes() < 30 ? 30 : 60, 0, 0);
    f.dia.value = ahora.getFullYear() + '-' + dos(ahora.getMonth() + 1) + '-' + dos(ahora.getDate());
    f.hora.value = dos(ahora.getHours()) + ':' + dos(ahora.getMinutes());
    f.zona.value = rcmail.env.reunion_zona || 'America/Lima';

    // Invitados: chips con correo; sugiere de tus contactos.
    var invitados = [], chips = document.getElementById('reu-chips'), ent = document.getElementById('reu-invitado'), contactos = [];
    fetch('?_task=reunion&_action=contactos', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (l) {
      contactos = l; var dl = document.getElementById('reu-contactos');
      l.forEach(function (c) { var o = document.createElement('option'); o.value = c.e; o.label = c.n ? c.n + ' <' + c.e + '>' : c.e; dl.appendChild(o); });
    }).catch(function () {});
    function pintar() {
      chips.querySelectorAll('.reu-chip').forEach(function (x) { x.remove(); });
      invitados.forEach(function (c, i) {
        var b = document.createElement('span'); b.className = 'reu-chip';
        var nom = (contactos.find(function (x) { return x.e.toLowerCase() === c; }) || {}).n;
        b.textContent = nom ? nom + ' · ' + c : c;
        var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Quitar ' + c);
        x.onclick = function () { invitados.splice(i, 1); pintar(); };
        b.appendChild(x); chips.insertBefore(b, ent);
      });
    }
    function agregar() {
      String(ent.value).split(/[,;\s]+/).forEach(function (v) {
        var m = v.match(/[^\s<>"]+@[^\s<>"]+\.[a-z]{2,}/i);
        if (m && invitados.indexOf(m[0].toLowerCase()) < 0) invitados.push(m[0].toLowerCase());
      });
      ent.value = ''; pintar();
    }
    ent.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab' && ent.value) { e.preventDefault(); agregar(); } else if (e.key === 'Backspace' && !ent.value && invitados.length) { invitados.pop(); pintar(); } });
    ent.addEventListener('change', function () { if (/@/.test(ent.value)) agregar(); });
    ent.addEventListener('blur', function () { if (ent.value) agregar(); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (ent.value) agregar();
      var d = f.dia.value.split('-').map(Number), h = f.hora.value.split(':').map(Number);
      // Hora de pared en la zona elegida: se suma la duración sin pasar por la zona del navegador.
      var ini = new Date(Date.UTC(d[0], d[1] - 1, d[2], h[0], h[1])), fin = new Date(ini.getTime() + Number(f.dura.value) * 60000);
      var fmt = function (t) { return t.getUTCFullYear() + dos(t.getUTCMonth() + 1) + dos(t.getUTCDate()) + 'T' + dos(t.getUTCHours()) + dos(t.getUTCMinutes()) + '00'; };
      var p = new URLSearchParams({ action: 'TEMPLATE', text: f.titulo.value.trim(), dates: fmt(ini) + '/' + fmt(fin), ctz: f.zona.value.trim() });
      if (f.detalle.value.trim()) p.set('details', f.detalle.value.trim());
      if (f.lugar.value.trim()) p.set('location', f.lugar.value.trim());
      if (invitados.length) p.set('add', invitados.join(','));
      if (f.repite.value) p.set('recur', 'RRULE:FREQ=' + f.repite.value);
      if (rcmail.env.reunion_cuenta) p.set('authuser', rcmail.env.reunion_cuenta);
      abrir('https://calendar.google.com/calendar/render?' + p.toString());
      document.getElementById('reu-aviso').textContent = 'Listo: revisa la pestaña de Google Calendar y dale a Guardar.';
    });
  });
})();
