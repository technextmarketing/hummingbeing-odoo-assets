try{

/* ==========================================================================
   ISABELLE (.is-x-*) - reveal, count-up, portrait tilt, story rail, credentials
   tabs, journey map, scroll-scrubbed quote and card spotlights. No libraries.
   ========================================================================== */
(function () {
  'use strict';
  var secs = [].slice.call(document.querySelectorAll('section.is-x-sec'));
  if (!secs.length) return;
  document.documentElement.classList.add('is-x-js');

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Reveal (staggered per batch) ------------------------------------- */
  var revealIO = hasIO ? new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
    batch.forEach(function (e, i) {
      var el = e.target;
      el.style.setProperty('--is-x-d', Math.min(i, 6) * 90 + 'ms');
      el.classList.add('is-x-in');
      setTimeout(function () { el.style.removeProperty('--is-x-d'); }, 1800);
      revealIO.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('.is-x-rv').forEach(function (el) { if (revealIO) revealIO.observe(el); else el.classList.add('is-x-in'); });

  /* ---- Count-up (only numbers already printed on the page) --------------- */
  var nums = $$('[data-is-x-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-is-x-count'), 10);
    if (still() || isNaN(target)) { el.textContent = target; return; }
    var t0 = null, dur = 1600;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (hasIO && !still()) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { el.textContent = '0'; countIO.observe(el); });
  }

  /* ---- Portrait tilt + parallax (fine pointers only) --------------------- */
  $$('[data-is-x-tilt]').forEach(function (fig) {
    var frame = $('.is-x-portrait-frame', fig), raf = 0, ev = null;
    if (!frame) return;
    fig.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !mqFine.matches || still()) return;
      ev = e; if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = fig.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5;
        fig.classList.add('is-x-tilting');
        frame.style.setProperty('--is-x-ry', (px * 7).toFixed(2) + 'deg');
        frame.style.setProperty('--is-x-rx', (-py * 7).toFixed(2) + 'deg');
        frame.style.setProperty('--is-x-px', (-px * 14).toFixed(1) + 'px');
        frame.style.setProperty('--is-x-py', (-py * 14).toFixed(1) + 'px');
        fig.style.setProperty('--is-x-fx', (px * 16).toFixed(1) + 'px');
        fig.style.setProperty('--is-x-fy', (py * 16).toFixed(1) + 'px');
      });
    });
    fig.addEventListener('pointerleave', function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      fig.classList.remove('is-x-tilting');
      ['--is-x-rx', '--is-x-ry', '--is-x-px', '--is-x-py'].forEach(function (p) { frame.style.removeProperty(p); });
      fig.style.removeProperty('--is-x-fx'); fig.style.removeProperty('--is-x-fy');
    });
  });

  /* ---- Pointer spotlight (credential stage + path cards) ----------------- */
  $$('[data-is-x-glow]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || still()) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--is-x-mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--is-x-my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });

  /* ---- Credentials: tabs with roving focus + arrows ---------------------- */
  (function () {
    var box = $('.is-x-cx'); if (!box) return;
    var tabs = $$('.is-x-cx-tab', box), panels = $$('.is-x-cx-panel', box);
    var curEl = $('[data-is-x-cur]', box), prog = $('[data-is-x-prog]', box), stage = $('.is-x-cx-stage', box);
    var list = $('.is-x-cx-list', box), cur = 0;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function select(i, focus) {
      i = (i + tabs.length) % tabs.length; cur = i;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[j].classList.toggle('is-x-cur', on);
        panels[j].setAttribute('aria-hidden', on ? 'false' : 'true');
        panels[j].tabIndex = on ? 0 : -1;
      });
      if (curEl) curEl.textContent = pad(i + 1);
      if (prog) prog.style.setProperty('--is-x-s', ((i + 1) / tabs.length).toFixed(4));
      if (focus) tabs[i].focus({ preventScroll: true });
      if (list && list.scrollWidth > list.clientWidth + 1) {
        var t = tabs[i], left = t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2;
        try { list.scrollTo({ left: left, behavior: still() ? 'auto' : 'smooth' }); } catch (err) { list.scrollLeft = left; }
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = i + 1;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = i - 1;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = tabs.length - 1;
        if (j === null) return;
        e.preventDefault(); select(j, true);
      });
    });
    $$('[data-is-x-step]', box).forEach(function (b) {
      b.addEventListener('click', function () { select(cur + parseInt(b.getAttribute('data-is-x-step'), 10), false); });
    });
    // swipe on the stage (touch)
    var sx = null, sy = 0;
    if (stage) {
      stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; });
      stage.addEventListener('pointerup', function (e) {
        if (sx === null) return;
        var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) select(cur + (dx < 0 ? 1 : -1), false);
      });
      stage.addEventListener('pointercancel', function () { sx = null; });
    }
    select(0, false);
  })();

  /* ---- Journey map: place buttons <-> pins ------------------------------- */
  (function () {
    var map = $('[data-is-x-map]'); if (!map) return;
    var btns = $$('.is-x-place', map), pins = $$('.is-x-pin', map), arcs = $$('.is-x-arcs path', map);
    var canvas = $('.is-x-map-canvas', map);
    var cap = $('.is-x-map-cap', map), k = $('[data-is-x-k]', map), t = $('[data-is-x-t]', map), l = $('[data-is-x-l]', map);
    arcs.forEach(function (a, i) { a.style.setProperty('--is-x-d', 300 + i * 220 + 'ms'); });
    function show(id, announce) {
      map.setAttribute('data-is-x-on', id);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-place') === id ? 'true' : 'false'); });
      pins.forEach(function (p) {
        var pid = p.getAttribute('data-pin');
        p.classList.toggle('is-x-hot', pid === id);
      });
      arcs.forEach(function (a) { a.classList.toggle('is-x-hot', a.getAttribute('data-arc') === id); });
      var b = btns.filter(function (x) { return x.getAttribute('data-place') === id; })[0];
      if (!b || !announce) return;
      // phones: the map pans inside its frame, so bring the chosen pin to the middle
      var pin = pins.filter(function (p) { return p.getAttribute('data-pin') === id; })[0];
      if (canvas && canvas.scrollWidth > canvas.clientWidth + 1) {
        var left = id === 'more' ? (canvas.scrollWidth - canvas.clientWidth) * 0.6 : null;
        if (pin) { var pr = pin.getBoundingClientRect(), cr = canvas.getBoundingClientRect(); left = canvas.scrollLeft + (pr.left + pr.width / 2 - cr.left) - canvas.clientWidth / 2; }
        if (left !== null) { try { canvas.scrollTo({ left: left, behavior: still() ? 'auto' : 'smooth' }); } catch (err) { canvas.scrollLeft = left; } }
      }
      k.textContent = b.getAttribute('data-k');
      t.textContent = b.textContent.trim();
      l.textContent = b.getAttribute('data-line');
      cap.classList.remove('is-x-swap'); void cap.offsetWidth; if (!still()) cap.classList.add('is-x-swap');
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-place'), true); });
      b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && mqFine.matches) show(b.getAttribute('data-place'), true); });
    });
    show('jp', false);
    if (canvas && canvas.scrollWidth > canvas.clientWidth + 1) {
      var jp = pins.filter(function (p) { return p.getAttribute('data-pin') === 'jp'; })[0];
      if (jp) { var jr = jp.getBoundingClientRect(), jc = canvas.getBoundingClientRect(); canvas.scrollLeft = canvas.scrollLeft + (jr.left + jr.width / 2 - jc.left) - canvas.clientWidth / 2; }
      else canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
    }
  })();

  /* ---- Scroll-linked: story rail + quote word scrub ---------------------- */
  var rail = $('[data-is-x-rail]'), fill = rail && $('.is-x-rail-fill', rail), chaps = rail ? $$('[data-is-x-chap]', rail) : [];
  var quote = $('[data-is-x-words]'), words = [];
  if (quote) {
    // wrap each word in a span without touching markup semantics (em stays)
    var walker = document.createTreeWalker(quote, NodeFilter.SHOW_TEXT, null, false), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span'); s.className = 'is-x-w'; s.textContent = p; frag.appendChild(s); words.push(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight || 800;
    if (fill) {
      var r = rail.getBoundingClientRect();
      var p = still() ? 1 : clamp((vh * 0.62 - r.top) / Math.max(1, r.height), 0, 1);
      fill.style.setProperty('--is-x-p', p.toFixed(4));
      chaps.forEach(function (c) { var cr = c.getBoundingClientRect(); c.classList.toggle('is-x-lit', still() || cr.top < vh * 0.62); });
    }
    if (words.length) {
      var qr = quote.getBoundingClientRect();
      if (still()) { words.forEach(function (w) { w.style.removeProperty('--is-x-o'); }); }
      else if (qr.bottom > -50 && qr.top < vh + 50) {
        // progress 0 when the quote top hits 85% of the viewport; fully lit by the time it is centred
        var start = vh * 0.85, end = vh * 0.6;
        var prog = clamp((start - qr.top) / Math.max(1, (start - end) + qr.height * 0.6), 0, 1);
        var lit = prog * (words.length + 4);
        words.forEach(function (w, i) { w.style.setProperty('--is-x-o', (0.2 + 0.8 * clamp(lit - i, 0, 1)).toFixed(3)); });
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', onScroll);
  update();
})();

}catch(e){console.warn('page script', e);}