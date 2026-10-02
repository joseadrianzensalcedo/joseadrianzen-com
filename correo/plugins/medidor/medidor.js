/* Panel del medidor. Pide los datos al plugin y los dibuja: tablas y gráficos simples en SVG, sin librerías. */
(function () {
  var cuerpo, dias = 30, vista = 'resumen';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var num = function (n) { return (Math.round(n || 0)).toLocaleString('es-PE'); };
  var pct = function (a, b) { return b ? Math.round(a / b * 100) + ' %' : '0 %'; };
  var mmss = function (s) { s = Math.max(0, Math.round(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
  var fecha = function (ms) { return new Date(+ms).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  var hora = function (ms) { return new Date(+ms).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
  var dato = function (k, v, nota) { return '<div class="med-dato"><b>' + v + '</b><span>' + esc(k) + '</span>' + (nota ? '<em>' + esc(nota) + '</em>' : '') + '</div>'; };

  function pedir(v, extra) {
    var u = '?_task=medidor&_action=datos&_vista=' + v + '&_dias=' + dias + (extra || '');
    return fetch(u, { credentials: 'same-origin', headers: { 'X-Roundcube-Request': rcmail.env.request_token } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function tabla(filas, cols) {
    if (!filas || !filas.length) return '<p class="med-vacio">Todavía no hay datos en este periodo.</p>';
    var max = {};
    cols.forEach(function (c) { if (c.barra) max[c.k] = Math.max.apply(null, filas.map(function (f) { return +f[c.k] || 0; })) || 1; });
    return '<div class="med-tabla"><table><thead><tr>' + cols.map(function (c) { return '<th' + (c.n ? ' class="n"' : '') + '>' + esc(c.t) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + filas.map(function (f) {
        return '<tr' + (f._id ? ' data-id="' + esc(f._id) + '"' : '') + '>' + cols.map(function (c) {
          var v = c.f ? c.f(f[c.k], f) : esc(f[c.k]);
          if (c.barra) v = '<span class="med-barra" style="--p:' + Math.round((+f[c.k] || 0) / max[c.k] * 100) + '%"></span>' + v;
          return '<td' + (c.n ? ' class="n"' : '') + '>' + v + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  // Gráfico de barras verticales (por día, por hora, por minuto).
  function barras(valores, etiquetas, alto, titulo) {
    var n = valores.length; if (!n) return '';
    var max = Math.max.apply(null, valores) || 1, an = Math.max(6, Math.min(28, Math.floor(720 / n))), W = n * an, H = alto || 120;
    var r = '<figure class="med-graf"><figcaption>' + esc(titulo) + '</figcaption><div class="med-svg"><svg style="width:' + (W + 40) + 'px" viewBox="0 0 ' + (W + 40) + ' ' + (H + 26) + '" role="img" aria-label="' + esc(titulo) + '">';
    r += '<text x="0" y="10" class="eje">' + num(max) + '</text><line x1="36" x2="' + (W + 38) + '" y1="' + H + '" y2="' + H + '" class="base"/>';
    valores.forEach(function (v, i) {
      var h = Math.round(v / max * (H - 14));
      r += '<rect x="' + (38 + i * an) + '" y="' + (H - h) + '" width="' + (an - 2) + '" height="' + h + '"><title>' + esc(etiquetas[i]) + ': ' + num(v) + '</title></rect>';
      var paso = Math.ceil(n / 12);
      if (i % paso === 0) r += '<text x="' + (38 + i * an) + '" y="' + (H + 16) + '" class="eje">' + esc(etiquetas[i]) + '</text>';
    });
    return r + '</svg></div></figure>';
  }

  // Curva de retención: de cada 5 segundos del video, qué parte de las visitas lo vio.
  function curva(r, titulo) {
    var c = r.curva, n = c.length; if (!n || !r.visitas) return '';
    var W = 720, H = 160, total = r.visitas, x = function (i) { return 36 + i / Math.max(1, n - 1) * W; }, y = function (v) { return 8 + (1 - v / total) * (H - 8); };
    var d = c.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var s = '<figure class="med-graf"><figcaption>' + esc(titulo) + '</figcaption><div class="med-svg"><svg style="width:' + (W + 50) + 'px" viewBox="0 0 ' + (W + 50) + ' ' + (H + 28) + '" role="img" aria-label="' + esc(titulo) + '">';
    [0, .25, .5, .75, 1].forEach(function (p) { s += '<line x1="36" x2="' + (W + 36) + '" y1="' + y(total * p) + '" y2="' + y(total * p) + '" class="guia"/><text x="0" y="' + (y(total * p) + 4) + '" class="eje">' + Math.round(p * 100) + '%</text>'; });
    s += '<path d="' + d + ' L' + x(n - 1) + ' ' + H + ' L36 ' + H + 'Z" class="area"/><path d="' + d + '" class="linea"/>';
    var dur = r.duracion || n * 5, pasoMin = dur > 1200 ? 5 : 1;
    for (var m = 0; m * 60 <= dur; m += pasoMin) s += '<text x="' + x(m * 12) + '" y="' + (H + 18) + '" class="eje">' + m + ' min</text>';
    c.forEach(function (v, i) { s += '<rect x="' + (x(i) - 2) + '" y="0" width="4" height="' + H + '" class="toque"><title>' + mmss(i * 5) + ': ' + v + ' de ' + total + ' (' + pct(v, total) + ')</title></rect>'; });
    return s + '</svg></div></figure>';
  }

  var V = {};

  V.resumen = function (d) {
    var b = d.base, doc = d.documental;
    var h = '<div class="med-datos">' +
      dato('visitas', num(b.visitas)) + dato('personas distintas', num(b.visitantes), 'sin aviso aceptado, una persona cuenta como nueva cada día') +
      dato('reconocidas', num(b.reconocidos), num(d.volvieron) + ' volvieron más de una vez') +
      dato('tiempo promedio a la vista', mmss(b.segundos_promedio)) + dato('páginas por visita', (b.paginas_promedio || 0).toFixed(1)) +
      dato('se fueron enseguida', pct(b.rebote, b.visitas), 'una página y menos de 10 s') +
      dato('pusieron el documental', num(doc.vieron), pct(doc.vieron, b.visitas) + ' de las visitas') +
      dato('lo terminaron', num(doc.terminaron), pct(doc.terminaron, doc.vieron) + ' de quienes lo pusieron') +
      dato('vieron el tráiler', num(doc.trailer)) +
      dato('aceptaron el aviso', num(b.aceptaron), num(b.rechazaron) + ' dijeron que no') + '</div>';
    h += barras(d.dias.map(function (x) { return +x.visitas; }), d.dias.map(function (x) { return x.dia.slice(5); }), 120, 'Visitas por día (hora de Lima)');
    var hs = new Array(24).fill(0); d.horas.forEach(function (x) { hs[x.hora] = +x.n; });
    h += barras(hs, hs.map(function (_, i) { return i + 'h'; }), 100, 'A qué hora entran (hora de Lima)');
    h += '<p class="med-nota">Robots y programas automáticos descartados en este periodo: ' + num(d.robots) + '.</p>';
    return h;
  };

  V.procedencia = function (d) {
    var c = [{ k: 'k', t: '' }, { k: 'n', t: 'Visitas', n: 1, barra: 1 }, { k: 'personas', t: 'Personas', n: 1 }, { k: 'seg', t: 'Tiempo prom.', n: 1, f: mmss }];
    var bloque = function (t, filas, col) { var cc = c.slice(); cc[0] = { k: 'k', t: col || t }; return '<section><h3>' + esc(t) + '</h3>' + tabla(filas, cc) + '</section>'; };
    return '<div class="med-rejilla">' + bloque('Países', d.paises, 'País') + bloque('Ciudades', d.lugares, 'Ciudad, región, país') +
      bloque('De dónde llegaron', d.referencias, 'Sitio') + bloque('Red o empresa que da internet', d.redes, 'Red') +
      bloque('Aparato', d.dispositivos) + bloque('Sistema', d.sistemas) + bloque('Navegador', d.navegadores) +
      bloque('Idioma del navegador', d.idiomas) + bloque('Zona horaria', d.zonas) + bloque('Pantalla', d.pantallas, 'Ancho x alto') +
      bloque('Campañas (utm)', d.campanas, 'Fuente / medio / campaña') + '</div>';
  };

  V.paginas = function (d) {
    return '<section><h3>Páginas</h3>' + tabla(d.paginas, [{ k: 'k', t: 'Página' }, { k: 'vistas', t: 'Vistas', n: 1, barra: 1 }, { k: 'visitas', t: 'Visitas', n: 1 },
      { k: 'seg', t: 'Tiempo prom.', n: 1, f: function (v, f) { return mmss(v / Math.max(1, f.vistas)); } }, { k: 'scroll_prom', t: 'Bajaron (prom.)', n: 1, f: function (v) { return v == null ? '' : Math.round(v) + ' %'; } }]) + '</section>' +
      '<section><h3>Por dónde entraron</h3>' + tabla(d.entradas, [{ k: 'k', t: 'Primera página' }, { k: 'n', t: 'Visitas', n: 1, barra: 1 }, { k: 'seg', t: 'Tiempo prom.', n: 1, f: mmss }]) + '</section>' +
      '<section><h3>Secciones</h3><p class="med-nota">Vista: la sección ocupó la mitad de la pantalla. El tiempo suma todas las visitas.</p>' +
      tabla(d.secciones, [{ k: 'k', t: 'Página · sección' }, { k: 'vistas', t: 'Vistas', n: 1, barra: 1 }, { k: 'seg', t: 'Tiempo total', n: 1, f: mmss }]) + '</section>' +
      '<section><h3>Clics</h3>' + tabla(d.clics, [{ k: 'k', t: 'Enlace o botón' }, { k: 'texto', t: 'Texto' }, { k: 'n', t: 'Clics', n: 1, barra: 1 }, { k: 'visitas', t: 'Visitas', n: 1 }]) + '</section>';
  };

  var NOMBRES = { abre: 'abrió el reproductor', play: 'reproducir', pausa: 'pausa', fin: 'llegó al final', salto: 'adelantó o regresó', fuente: 'cambió documental o tráiler', idioma: 'cambió subtítulos', mudo: 'quitó el sonido', sonido: 'puso el sonido', pantalla: 'pantalla completa', 'sale-pantalla': 'salió de pantalla completa', error: 'error del video' };
  V.documental = function (d) {
    var h = '';
    ['documental', 'trailer'].forEach(function (f) {
      var r = d.retencion[f]; if (!r) return;
      var t = f === 'documental' ? 'Documental' : 'Tráiler';
      h += '<section><h3>' + t + '</h3><div class="med-datos">' + dato('visitas que lo vieron', num(r.visitas)) + dato('tiempo visto promedio', mmss(d.visto_promedio[f])) + dato('duración', mmss(r.duracion)) + '</div>';
      h += curva(r, 'Qué parte del ' + t.toLowerCase() + ' vio la gente (de cada 5 segundos, cuántos lo vieron)');
      var ab = d.abandono[f] || {}, mins = Math.ceil((r.duracion || 60) / 60), av = [], ae = [], pv = [];
      for (var m = 0; m < mins; m++) { av.push(ab[m] || 0); ae.push(m + ' min'); pv.push((d.pausas[f] || {})[m] || 0); }
      h += barras(av, ae, 100, 'Dónde dejaron de ver (último minuto visto)');
      h += barras(pv, ae, 100, 'Dónde pausaron (minuto)');
      var sl = d.saltos[f] || [];
      if (sl.length) h += '<details><summary>Saltos (' + sl.length + ')</summary><p class="med-nota">' + sl.map(function (s) { return mmss(s[0]) + ' → ' + mmss(s[1]); }).join(', ') + '</p></details>';
      h += '</section>';
    });
    h += '<section><h3>Acciones en el reproductor</h3>' + tabla(d.acciones, [{ k: 'fuente', t: 'Video' }, { k: 'accion', t: 'Acción', f: function (v) { return esc(NOMBRES[v] || v); } }, { k: 'n', t: 'Veces', n: 1, barra: 1 }, { k: 'visitas', t: 'Visitas', n: 1 }]) + '</section>';
    h += '<section><h3>Idioma de subtítulos con el que lo pusieron</h3>' + tabla(d.idiomas, [{ k: 'fuente', t: 'Video' }, { k: 'idioma', t: 'Subtítulos' }, { k: 'visitas', t: 'Visitas', n: 1, barra: 1 }]) + '</section>';
    return h || '<p class="med-vacio">Nadie ha puesto el documental en este periodo.</p>';
  };

  V.fotos = function (d) {
    return '<section><h3>Fotos vistas</h3><p class="med-nota">Vista: al menos un segundo con el 60 % de la foto en pantalla.</p>' +
      tabla(d.vistas, [{ k: 'foto', t: 'Foto' }, { k: 'alt', t: 'Descripción' }, { k: 'pagina', t: 'Página' }, { k: 'n', t: 'Vistas', n: 1, barra: 1 }, { k: 'visitas', t: 'Visitas', n: 1 }]) + '</section>' +
      '<section><h3>Fotos en las que hicieron clic</h3>' + tabla(d.clics, [{ k: 'foto', t: 'Foto' }, { k: 'n', t: 'Clics', n: 1, barra: 1 }]) + '</section>';
  };

  V.visitas = function (d) {
    d.forEach(function (f) { f._id = f.id; });
    return '<p class="med-nota">Haz clic en una visita para ver todo lo que hizo, en orden.</p>' + tabla(d, [
      { k: 'inicio', t: 'Cuándo', f: fecha },
      { k: 'visitante', t: 'Quién', f: function (v, f) { return f.enlace_nombre ? '<b class="med-nombre">' + esc(f.enlace_nombre) + '</b>' : v.charAt(0) === 'p' ? 'Reconocida' + (f.veces > 1 ? ' · ' + f.veces + ' visitas' : '') : 'Anónima'; } },
      { k: 'ciudad', t: 'Desde', f: function (v, f) { return esc([v, f.region, f.pais].filter(Boolean).join(', ')) + (f.red ? '<small>' + esc(f.red) + '</small>' : ''); } },
      { k: 'dispositivo', t: 'Aparato', f: function (v, f) { return esc(v) + '<small>' + esc(f.sistema + ' · ' + f.navegador) + '</small>'; } },
      { k: 'referencia', t: 'Llegó de', f: function (v, f) { return esc(v || 'Directo') + (f.campana ? '<small>' + esc(f.campana) + '</small>' : ''); } },
      { k: 'paginas', t: 'Páginas', n: 1 }, { k: 'segundos', t: 'Tiempo', n: 1, f: mmss },
      { k: 'doc', t: 'Documental', f: function (v) { return v ? (v.fin ? 'Completo' : 'Hasta ' + mmss(v.hasta)) + '<small>vio ' + mmss(v.visto) + (v.pausas ? ' · ' + v.pausas + ' pausas' : '') + '</small>' : ''; } },
    ]);
  };

  var TIPOS = { pag: 'Abrió', sal: 'Salió o cambió de pestaña', sec: 'Vio la sección', foto: 'Vio la foto', clic: 'Clic', vid: 'Video', vtr: 'Vio tramos', con: 'Aviso' };
  function detalle(id) {
    pedir('visita', '&_id=' + encodeURIComponent(id)).then(function (d) {
      var v = d.visita, h = '<button type="button" class="med-volver">← Volver a la lista</button>';
      h += '<div class="med-datos med-detalle">' + dato('cuándo', fecha(v.inicio)) + dato('quién', esc(v.enlace_nombre || (v.visitante.charAt(0) === 'p' ? 'Reconocida' : 'Anónima'))) +
        dato('desde', esc([v.ciudad, v.region, v.pais].filter(Boolean).join(', ') || 'Sin dato'), v.red) + dato('aparato', esc(v.dispositivo), v.sistema + ' · ' + v.navegador + ' · ' + (v.pantalla || '')) +
        dato('idioma', esc(v.idioma || ''), v.zona_horaria) + dato('llegó de', esc(v.referencia || 'Directo'), v.campana) + dato('tiempo a la vista', mmss(v.segundos)) + '</div>';
      h += '<ol class="med-linea">' + d.eventos.map(function (e) {
        var x = e.dato || {}, t = TIPOS[e.tipo] || e.tipo, s = '';
        if (e.tipo === 'pag') s = x.t || e.pagina;
        else if (e.tipo === 'sal') s = mmss(x.seg) + ' a la vista, bajó hasta ' + x.scroll + ' %';
        else if (e.tipo === 'sec') s = x.id;
        else if (e.tipo === 'foto') s = x.alt || x.n;
        else if (e.tipo === 'clic') s = x.x || x.h || x.b || x.n;
        else if (e.tipo === 'vid') { t = x.f === 'trailer' ? 'Tráiler' : 'Documental'; s = (NOMBRES[x.a] || x.a) + (x.a === 'salto' ? ' de ' + mmss(x.de) + ' a ' + mmss(x.a2) : x.s != null ? ' en ' + mmss(x.s) : '') + (x.i ? ' · subtítulos ' + x.i : ''); }
        else if (e.tipo === 'vtr') s = (x.f === 'trailer' ? 'tráiler ' : 'documental ') + tramos(x.b);
        else if (e.tipo === 'con') s = x.si ? 'aceptó que lo reconozcan' : 'no aceptó';
        return '<li><time>' + hora(e.t) + '</time><b>' + esc(t) + '</b> ' + esc(s) + (e.tipo === 'pag' ? ' <small>' + esc(e.pagina) + '</small>' : '') + '</li>';
      }).join('') + '</ol>';
      if (d.otras.length) h += '<section><h3>Otras visitas de esta persona</h3>' + d.otras.map(function (o) { return '<button type="button" class="med-otra" data-id="' + esc(o.id) + '">' + fecha(o.inicio) + ' · ' + mmss(o.segundos) + '</button>'; }).join(' ') + '</section>';
      cuerpo.innerHTML = h;
    });
  }
  function tramos(b) {
    if (!b || !b.length) return '';
    var r = [], a = b[0], p = b[0];
    for (var i = 1; i <= b.length; i++) { if (b[i] === p + 1) { p = b[i]; continue; } r.push(mmss(a * 5) + ' a ' + mmss((p + 1) * 5)); a = p = b[i]; }
    return r.join(', ');
  }

  V.enlaces = function (d) {
    var base = 'https://joseadrianzen.com/?de=';
    var h = '<section><h3>Enlaces con nombre</h3><p class="med-nota">Para saber quién es quién. Creas un enlace por persona (un programador de festival, una productora) y se lo mandas. Cuando entre por ahí, su visita sale con su nombre. Si acepta el aviso, sus visitas siguientes también.</p>' +
      '<form class="med-form"><label>Nombre<input name="nombre" required maxlength="120" placeholder="María, programadora de Docs Lima"></label>' +
      '<label>Código<input name="codigo" required pattern="[a-z0-9-]{3,24}" maxlength="24" placeholder="maria-docs"></label>' +
      '<label>Nota<input name="nota" maxlength="300"></label><button type="submit">Crear enlace</button><output></output></form>';
    h += tabla(d.map(function (e) { return Object.assign({}, e, { url: base + e.codigo }); }), [
      { k: 'nombre', t: 'Nombre', f: function (v, e) { return '<b>' + esc(v) + '</b>' + (e.nota ? '<small>' + esc(e.nota) + '</small>' : ''); } },
      { k: 'url', t: 'Enlace', f: function (v) { return '<code>' + esc(v) + '</code> <button type="button" class="med-copiar" data-url="' + esc(v) + '">Copiar</button>'; } },
      { k: 'visitas', t: 'Visitas', n: 1 }, { k: 'ultima', t: 'Última', f: function (v) { return v ? fecha(v) : 'Aún no entra'; } },
      { k: 'segundos', t: 'Tiempo total', n: 1, f: mmss },
      { k: 'codigo', t: '', f: function (v) { return '<button type="button" class="med-borrar" data-codigo="' + esc(v) + '">Borrar</button>'; } },
    ]) + '</section>';
    return h;
  };

  function enviarEnlace(datos) {
    datos._token = rcmail.env.request_token;
    return fetch('?_task=medidor&_action=enlace', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(datos) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.status); return j; }); });
  }

  function mostrar() {
    cuerpo.innerHTML = '<p class="med-vacio">Cargando…</p>';
    pedir(vista).then(function (d) { cuerpo.innerHTML = V[vista](d); })
      .catch(function (e) { cuerpo.innerHTML = '<p class="med-vacio">No se pudo leer el medidor (' + esc(e.message) + ').</p>'; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    cuerpo = document.getElementById('med-cuerpo');
    if (!cuerpo) return;
    try { localStorage.setItem('ja-no-medir', '1'); } catch (e) {}
    try { var g = JSON.parse(localStorage.getItem('med-panel') || '{}'); if (V[g.vista]) vista = g.vista; if (g.dias) dias = g.dias; } catch (e) {}
    var sel = document.getElementById('med-dias'); sel.value = String(dias);
    var marcar = function () { document.querySelectorAll('.med-pestanas button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.vista === vista); }); try { localStorage.setItem('med-panel', JSON.stringify({ vista: vista, dias: dias })); } catch (e) {} };
    document.querySelector('.med-pestanas').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; vista = b.dataset.vista; marcar(); mostrar(); });
    sel.addEventListener('change', function () { dias = +sel.value; marcar(); mostrar(); });
    cuerpo.addEventListener('click', function (e) {
      var fila = e.target.closest('tr[data-id], .med-otra');
      if (fila && vista === 'visitas') return detalle(fila.dataset.id);
      if (e.target.closest('.med-volver')) return mostrar();
      var c = e.target.closest('.med-copiar');
      if (c) { (navigator.clipboard ? navigator.clipboard.writeText(c.dataset.url) : Promise.reject()).then(function () { c.textContent = 'Copiado'; }, function () { c.textContent = 'Selecciónalo'; }); return; }
      var br = e.target.closest('.med-borrar');
      if (br) {
        if (br.dataset.seguro !== '1') { br.dataset.seguro = '1'; br.textContent = '¿Seguro? Clic otra vez'; return; }
        enviarEnlace({ codigo: br.dataset.codigo, borrar: '1' }).then(function (d) { cuerpo.innerHTML = V.enlaces(d); });
      }
    });
    cuerpo.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, o = f.querySelector('output');
      enviarEnlace({ nombre: f.nombre.value, codigo: f.codigo.value.toLowerCase(), nota: f.nota.value })
        .then(function (d) { cuerpo.innerHTML = V.enlaces(d); }, function (err) { o.textContent = err.message; });
    });
    marcar(); mostrar();
  });
})();
