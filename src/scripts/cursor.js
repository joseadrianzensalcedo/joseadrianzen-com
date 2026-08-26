/* Cursor propio: solo en escritorio y si no se pide menos movimiento. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = document.getElementById('cur'), cx=0, cy=0, tx=0, ty=0, raf;
  if (!cur || reduce || !window.matchMedia('(hover:hover)').matches) return;
  function loop(){
    cx += (tx-cx)*0.22; cy += (ty-cy)*0.22;
    cur.style.transform = 'translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';
    raf = requestAnimationFrame(loop);
  }
  window.addEventListener('mousemove', function(e){
    tx = e.clientX; ty = e.clientY; cur.classList.add('on');
    if (!raf) loop();
  }, {passive:true});
})();
