/* joseadrianzen.com — comportamiento
   Módulos: intro, cursor, progreso, reveal, visor, reproductor propio (Vimeo sin marca), parpadeo. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── intro ── */
  var intro = document.getElementById('intro');
  if (reduce || sessionStorage.getItem('ja_intro') === '1') {
    if (intro) intro.remove();
  } else {
    document.body.classList.add('locked');
    try { sessionStorage.setItem('ja_intro','1'); } catch(e){}
    setTimeout(function(){
      intro.classList.add('out');
      document.body.classList.remove('locked');
      setTimeout(function(){ intro.remove(); }, 1000);
    }, 2100);
  }

  /* ── cursor ── */
  var cur = document.getElementById('cur'), cx=0, cy=0, tx=0, ty=0, raf;
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY; cur.classList.add('on');
      if (!raf) loop();
    }, {passive:true});
    function loop(){
      cx += (tx-cx)*0.22; cy += (ty-cy)*0.22;
      cur.style.transform = 'translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';
      raf = requestAnimationFrame(loop);
    }
    document.addEventListener('mouseover', function(e){
      cur.classList.toggle('big', !!e.target.closest('a,button,.tira figure,.marco'));
    });
    document.addEventListener('mouseleave', function(){ cur.classList.remove('on'); });
  }

  /* ── barra de progreso ── */
  var prog = document.getElementById('prog');
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ── reveal al hacer scroll: entra y sale, en los dos sentidos ──

     Con umbrales fijos siempre habia un lado brusco. Un elemento solo
     puede encenderse en un punto y apagarse en otro, y para que no
     parpadee el de apagado tiene que quedar por fuera del de encendido.
     Eso obliga a elegir: o enciende tarde (aparece de golpe a media
     pantalla) o se apaga tan afuera que la salida no se ve.

     La salida es mirar el sentido del scroll. Entrada y salida dejan de
     competir porque ocurren en bordes distintos: bajando se entra por
     abajo y se sale por arriba, subiendo al reves. Asi la pieza empieza
     a aparecer ANTES de asomar, y se apaga cuando todavia se la ve.

     Un observador mantiene la lista de piezas cercanas y el calculo fino
     se hace por geometria en cada cuadro, solo sobre esas. Al no depender
     de cruces de umbral, cambiar de sentido a media animacion no rompe
     nada: el estado se recalcula desde la posicion real. */
  var rvAll = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rvAll.forEach(function(el){ el.classList.add('in'); });
  } else {
    var cerca = [], yAnt = window.pageYOffset || 0, bajando = true, pedido = false;

    function alto(){ return window.innerHeight || document.documentElement.clientHeight; }

    function apaga(el, r, vh){
      // Guarda por que lado se fue, para volver a entrar por ahi mismo.
      el.classList.toggle('por-arriba', (r.top + r.height / 2) < vh / 2);
      el.classList.remove('in');
    }

    function pasada(){
      pedido = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y !== yAnt) { bajando = y > yAnt; yAnt = y; }

      var vh = alto();
      /* La banda se corre segun el sentido. El borde de llegada va justo
         en el filo de la pantalla, no antes: adelantarlo un 14% parecia
         mas suave, pero a velocidad de lectura ese tramo se recorre en
         medio segundo y las animaciones, que duran cerca de uno,
         terminaban fuera de cuadro. La pieza entraba ya formada y el
         destello se apagaba sin que nadie lo viera.
         El borde de salida si se mete hacia dentro, para que irse se vea. */
      var bordeArriba = bajando ? vh * 0.12 : -vh * 0.02;
      var bordeAbajo  = bajando ? vh * 1.02 : vh * 0.88;

      // Primero se mide todo y despues se escribe: mezclarlo obliga al
      // navegador a recalcular el layout en cada vuelta.
      var i, medidas = [];
      for (i = 0; i < cerca.length; i++) medidas.push(cerca[i].getBoundingClientRect());
      for (i = 0; i < cerca.length; i++) {
        var r = medidas[i];
        if (r.bottom > bordeArriba && r.top < bordeAbajo) cerca[i].classList.add('in');
        else apaga(cerca[i], r, vh);
      }
    }

    function pide(){
      if (!pedido) { pedido = true; requestAnimationFrame(pasada); }
    }

    var vigia = new IntersectionObserver(function(es){
      es.forEach(function(e){
        var pos = cerca.indexOf(e.target);
        if (e.isIntersecting) {
          if (pos === -1) cerca.push(e.target);
        } else if (pos !== -1) {
          cerca.splice(pos, 1);
          apaga(e.target, e.boundingClientRect, alto());
        }
      });
      pide();
    }, { rootMargin: '45% 0px 45% 0px' });

    rvAll.forEach(function(el){ vigia.observe(el); });
    window.addEventListener('scroll', pide, {passive:true});
    window.addEventListener('resize', pide, {passive:true});
    window.addEventListener('load', pide);
    pide();
  }

  /* ── lightbox ── */
  var visor = document.getElementById('visor'),
      vimg  = document.getElementById('visorImg'),
      close = document.getElementById('cerrarVisor'),
      last  = null;
  document.querySelectorAll('#muro-foto button, #muro-dir button').forEach(function(b){
    b.addEventListener('click', function(){
      var im = b.querySelector('img');
      vimg.src = im.src; vimg.alt = im.alt;
      visor.classList.add('abierto'); last = b; close.focus();
    });
  });
  function cierra(){ visor.classList.remove('abierto'); vimg.src=''; if (last) last.focus(); }
  close.addEventListener('click', cierra);
  visor.addEventListener('click', function(e){ if (e.target === visor) cierra(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && visor.classList.contains('abierto')) cierra();
  });

  /* ── reproductor propio sobre Vimeo (sin marca ni controles ajenos) ── */
  var wrap = document.getElementById('vp');
  if (wrap) {
    var mount = document.getElementById('vmount'),
        play  = document.getElementById('vplay'),
        tog   = document.getElementById('vtoggle'),
        track = document.getElementById('vtrack'),
        fill  = document.getElementById('vfill'),
        elCur = document.getElementById('vcur'),
        elDur = document.getElementById('vdur'),
        mute  = document.getElementById('vmute'),
        fs    = document.getElementById('vfs'),
        p = null, dur = 0, muted = false;

    function fmt(s){
      s = Math.max(0, Math.floor(s || 0));
      return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
    }
    function build(){
      if (typeof Vimeo === 'undefined' || !Vimeo.Player) { wrap.classList.add('err'); return null; }
      var pl = new Vimeo.Player(mount, {
        id: parseInt(wrap.dataset.vimeo,10),
        controls:false, title:false, byline:false, portrait:false,
        dnt:true, responsive:false, playsinline:true, transparent:false, keyboard:false
      });
      pl.on('loaded', function(){ pl.getDuration().then(function(d){ dur=d; elDur.textContent=fmt(d); }); });
      pl.on('timeupdate', function(d){
        fill.style.width = (d.percent*100)+'%';
        elCur.textContent = fmt(d.seconds);
        track.setAttribute('aria-valuenow', Math.round(d.percent*100));
      });
      pl.on('play',  function(){ wrap.classList.add('on'); wrap.classList.remove('paused'); tog.innerHTML='&#10074;&#10074;'; });
      pl.on('pause', function(){ wrap.classList.add('paused');    tog.innerHTML='&#9654;'; });
      pl.on('ended', function(){ wrap.classList.remove('on','paused'); fill.style.width='0%'; });
      pl.on('error', function(){ wrap.classList.add('err'); });
      return pl;
    }
    function ensure(){ if (!p) p = build(); return p; }
    /* precargamos el reproductor al acercarse, para que el clic pueda dar play */
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function(es){
        if (es[0].isIntersecting) { ensure(); io2.disconnect(); }
      }, {rootMargin:'400px'});
      io2.observe(wrap);
    } else {
      window.addEventListener('load', ensure);
    }
    play.addEventListener('click', function(){
      var pl = ensure(); if (!pl) return;
      pl.play()
        .then(function(){ wrap.classList.add('on'); })
        .catch(function(){
          /* el navegador bloqueó el audio: arrancamos en silencio */
          pl.setMuted(true)
            .then(function(){ muted = true; mute.textContent = 'ACTIVAR'; return pl.play(); })
            .then(function(){ wrap.classList.add('on'); })
            .catch(function(){ wrap.classList.add('err'); });
        });
    });
    function alterna(){
      if (!p) return;
      p.getPaused().then(function(pa){ pa ? p.play() : p.pause(); });
    }
    tog.addEventListener('click', alterna);
    var escudo = document.getElementById('vescudo');
    if (escudo) escudo.addEventListener('click', alterna);
    function seekAt(clientX){
      if (!p || !dur) return;
      var r = track.getBoundingClientRect();
      var pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      p.setCurrentTime(pct * dur);
    }
    track.addEventListener('click', function(e){ seekAt(e.clientX); });
    track.addEventListener('keydown', function(e){
      if (!p || !dur) return;
      if (e.key === 'ArrowRight') { p.getCurrentTime().then(function(t){ p.setCurrentTime(Math.min(dur, t+5)); }); }
      if (e.key === 'ArrowLeft')  { p.getCurrentTime().then(function(t){ p.setCurrentTime(Math.max(0, t-5)); }); }
    });
    mute.addEventListener('click', function(){
      if (!p) return;
      muted = !muted; p.setMuted(muted); mute.textContent = muted ? 'ACTIVAR' : 'SONIDO';
    });
    fs.addEventListener('click', function(){
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else if (wrap.requestFullscreen) { wrap.requestFullscreen(); }
    });
  }

  /* ── parpadeo periódico de la página (texto y UI; nunca imágenes ni videos) ── */
  if (!reduce) {
    (function tic(){
      var espera = 9000 + Math.random() * 9000;
      setTimeout(function(){
        document.body.classList.add('tic');
        setTimeout(function(){ document.body.classList.remove('tic'); }, 560);
        tic();
      }, espera);
    })();
  }
})();
