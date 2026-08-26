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

  /* ── reveal al hacer scroll ── */
  var rvAll = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (reduce) {
    rvAll.forEach(function(el){ el.classList.add('in'); });
  } else {
    var pend = rvAll.slice();
    rvAll.forEach(function(el, i){
      if (!el.classList.contains('rv--flash')) el.style.transitionDelay = ((i % 3) * 80) + 'ms';
    });
    function reveal(){
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var fin = (window.scrollY + vh) >= (document.documentElement.scrollHeight - 4);
      for (var i = pend.length - 1; i >= 0; i--) {
        var r = pend[i].getBoundingClientRect();
        if (fin || r.top < vh * 0.96) { pend[i].classList.add('in'); pend.splice(i, 1); }
      }
      if (!pend.length) {
        window.removeEventListener('scroll', reveal);
        window.removeEventListener('resize', reveal);
      }
    }
    window.addEventListener('scroll', reveal, {passive:true});
    window.addEventListener('resize', reveal, {passive:true});
    reveal();
    setTimeout(reveal, 300);
    setTimeout(reveal, 1200);
    window.addEventListener('load', reveal);
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
