try{

/* ==========================================================================
   RETREATS & WORKSHOPS (.rw) - scroll reveal, offerings tab switcher with
   autoplay, executive card tilt, scroll-driven timeline, location spotlight.
   Plain JS, no libraries. Everything is scoped to section.rw.
   ========================================================================== */
(function () {
  'use strict';
  var sections = document.querySelectorAll('section.rw');
  if (!sections.length) return;
  document.documentElement.classList.add('rw-js');

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Reveal on scroll (stagger index = position among revealing siblings) */
  var rv = $$('section.rw .rw-rv');
  rv.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('rw-rv'); });
    el.style.setProperty('--rw-i', Math.min(sibs.indexOf(el), 6));
  });
  if (!hasIO || still()) {
    rv.forEach(function (el) { el.classList.add('rw-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('rw-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ---- 1. Why a retreat: pointer parallax + glow ------------------------ */
  var why = $('.rw-why-media');
  if (why) {
    var frame = $('.rw-why-frame', why);
    why.addEventListener('pointermove', function (e) {
      if (!mqFine.matches || still()) return;
      var r = frame.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      frame.style.setProperty('--ry', ((x - .5) * 7).toFixed(2) + 'deg');
      frame.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg');
      why.style.setProperty('--px', ((x - .5) * -16).toFixed(1) + 'px');
      why.style.setProperty('--py', ((y - .5) * -12).toFixed(1) + 'px');
      frame.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      frame.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    why.addEventListener('pointerleave', function () {
      ['--rx', '--ry', '--mx', '--my'].forEach(function (p) { frame.style.removeProperty(p); });
      why.style.removeProperty('--px'); why.style.removeProperty('--py');
    });
  }

  /* ---- 2. Offerings: tabs + stacked panels + autoplay -------------------- */
  var off = $('section.rw-off');
  if (off) (function () {
    var ui = $('.rw-off-ui', off), stage = $('.rw-off-stage', off);
    var panels = $$('.rw-off-panel', stage), n = panels.length;
    if (n < 2) return;
    function pad(k) { return (k < 10 ? '0' : '') + k; }

    var list = document.createElement('div');
    list.className = 'rw-off-tabs';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Types of retreats and workshops');
    var ind = document.createElement('span'); ind.className = 'rw-off-ind'; ind.setAttribute('aria-hidden', 'true');
    list.appendChild(ind);

    var tabs = panels.map(function (p, i) {
      var h = $('h3', p), ic = $('.rw-off-ic i', p);
      p.id = 'rw-off-p' + (i + 1);
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'rw-off-t' + (i + 1));
      p.setAttribute('tabindex', '0');
      $('.rw-off-ic', p).setAttribute('aria-hidden', 'true');
      var idx = document.createElement('span'); idx.className = 'rw-off-idx'; idx.setAttribute('aria-hidden', 'true');
      idx.textContent = pad(i + 1) + ' / ' + pad(n);
      p.insertBefore(idx, h);
      var ghost = document.createElement('span'); ghost.className = 'rw-off-ghost'; ghost.setAttribute('aria-hidden', 'true');
      ghost.textContent = pad(i + 1); p.appendChild(ghost);

      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rw-off-tab'; b.id = 'rw-off-t' + (i + 1);
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', p.id);
      b.innerHTML = '<span class="rw-off-ti" aria-hidden="true"><i class="' + (ic ? ic.className : 'fa-solid fa-circle') + '"></i></span>' +
        '<span class="rw-off-tt">' + h.innerHTML + '</span>' +
        '<span class="rw-off-tn" aria-hidden="true">' + pad(i + 1) + '</span>' +
        '<span class="rw-off-prog" aria-hidden="true"></span>';
      list.appendChild(b);
      return b;
    });
    ui.insertBefore(list, stage);

    var nav = document.createElement('div'); nav.className = 'rw-off-nav';
    nav.innerHTML = '<button type="button" class="rw-off-btn" data-dir="-1" aria-label="Previous offering"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>' +
      '<button type="button" class="rw-off-btn" data-dir="1" aria-label="Next offering"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>';
    stage.appendChild(nav);

    var cur = 0;
    function place() {
      var t = tabs[cur];
      ind.style.width = t.offsetWidth + 'px';
      ind.style.height = t.offsetHeight + 'px';
      ind.style.transform = 'translate(' + t.offsetLeft + 'px,' + t.offsetTop + 'px)';
    }
    function select(i, focus) {
      cur = (i + n) % n;
      tabs.forEach(function (t, k) {
        var on = k === cur;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[k].classList.toggle('rw-on', on);
        if (on) { panels[k].removeAttribute('inert'); panels[k].removeAttribute('aria-hidden'); }
        else { panels[k].setAttribute('inert', ''); panels[k].setAttribute('aria-hidden', 'true'); }
      });
      place();
      if (focus) tabs[cur].focus();
    }
    function stopAuto() { off.classList.remove('rw-off-auto'); }

    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { stopAuto(); select(k); });
    });
    list.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); stopAuto(); select(cur + d, true); return; }
      if (e.key === 'Home') { e.preventDefault(); stopAuto(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); stopAuto(); select(n - 1, true); }
    });
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('.rw-off-btn'); if (!b) return;
      stopAuto(); select(cur + (+b.getAttribute('data-dir')));
    });

    /* swipe on the stage (touch) */
    var sx = null, sy = null;
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { stopAuto(); select(cur + (dx < 0 ? 1 : -1)); }
    }, { passive: true });

    /* spotlight follows the pointer */
    stage.addEventListener('pointermove', function (e) {
      if (!mqFine.matches) return;
      var p = panels[cur], r = p.getBoundingClientRect();
      p.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      p.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });

    /* autoplay: only while visible, paused on hover/focus, ends on first interaction */
    if (!still() && hasIO) {
      var visible = false, hover = false, focusIn = false;
      function sync() { off.classList.toggle('rw-off-paused', !visible || hover || focusIn || document.hidden); }
      off.classList.add('rw-off-auto');
      sync();
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: 0.45 }).observe(ui);
      ui.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; sync(); } });
      ui.addEventListener('pointerleave', function () { hover = false; sync(); });
      ui.addEventListener('focusin', function () { focusIn = true; sync(); });
      ui.addEventListener('focusout', function (e) { if (!ui.contains(e.relatedTarget)) { focusIn = false; sync(); } });
      document.addEventListener('visibilitychange', sync);
      list.addEventListener('animationend', function (e) {
        if (!e.target.classList.contains('rw-off-prog') || !off.classList.contains('rw-off-auto')) return;
        select(cur + 1);
      });
    }

    select(0);
    var rT;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      list.classList.add('rw-noanim'); place();
      rT = setTimeout(function () { list.classList.remove('rw-noanim'); }, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener('load', place);
  })();

  /* ---- 3. Executive cards: tilt + spotlight, staggered rhythm icons ------ */
  $$('.rw-ex-card').forEach(function (card) {
    $$('.rw-ex-rh > span', card).forEach(function (s, k) { s.style.setProperty('--rw-k', k); });
    card.addEventListener('pointermove', function (e) {
      if (!mqFine.matches || still()) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('rw-tilting');
      card.style.setProperty('--ry', ((x - .5) * 5).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((.5 - y) * 4).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('rw-tilting');
      ['--rx', '--ry'].forEach(function (p) { card.style.removeProperty(p); });
    });
  });

  /* ---- 4. Timeline: scroll-driven fill, nodes light in sequence ---------- */
  var tl = $('.rw-arc-tl');
  if (tl) (function () {
    var steps = $$('.rw-arc-step', tl), nodes = steps.map(function (s) { return $('.rw-arc-node', s); });
    var track = $('.rw-arc-track', tl), fill = $('.rw-arc-fill', tl);
    var n = steps.length, vertical = false, ticking = false;

    function layout() {
      var base = tl.getBoundingClientRect();
      var a = nodes[0].getBoundingClientRect(), b = nodes[n - 1].getBoundingClientRect();
      var ax = a.left + a.width / 2 - base.left, ay = a.top + a.height / 2 - base.top;
      var bx = b.left + b.width / 2 - base.left, by = b.top + b.height / 2 - base.top;
      vertical = Math.abs(by - ay) > Math.abs(bx - ax);
      tl.classList.toggle('rw-arc-v', vertical);
      track.style.left = (ax - (vertical ? 1 : 0)) + 'px';
      track.style.top = (ay - (vertical ? 0 : 1)) + 'px';
      track.style.right = 'auto';
      track.style.width = vertical ? '2px' : (bx - ax) + 'px';
      track.style.height = vertical ? (by - ay) + 'px' : '2px';
    }
    function update() {
      ticking = false;
      var vh = window.innerHeight, p;
      if (still()) p = 1;
      else if (vertical) {
        var a = nodes[0].getBoundingClientRect(), b = nodes[n - 1].getBoundingClientRect();
        var ay = a.top + a.height / 2, by = b.top + b.height / 2;
        p = clamp((vh * .62 - ay) / Math.max(1, by - ay), 0, 1);
      } else {
        var t = tl.getBoundingClientRect().top;
        p = clamp((vh * .82 - t) / (vh * .42), 0, 1);
      }
      fill.style.setProperty('--rw-p', p.toFixed(4));
      var last = -1;
      steps.forEach(function (s, i) {
        var lit = p > 0.001 && p >= i / (n - 1) - 0.02;
        s.classList.toggle('rw-lit', lit);
        if (lit) last = i;
      });
      steps.forEach(function (s, i) { s.classList.toggle('rw-cur', i === last); });
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    steps.forEach(function (s) {
      s.addEventListener('pointerenter', function () { s.classList.add('rw-hov'); });
      s.addEventListener('pointerleave', function () { s.classList.remove('rw-hov'); });
    });
    layout(); update();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { layout(); req(); });
    window.addEventListener('load', function () { layout(); req(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); req(); });
  })();

  /* ---- 5. Locations: badge on the photo follows the highlighted row ------ */
  var loc = $('section.rw-loc');
  if (loc) (function () {
    var items = $$('.rw-loc-item', loc), media = $('.rw-loc-media', loc), frame = $('.rw-loc-frame', loc);
    var img = $('img', frame), n = items.length;
    if (!n || !media) return;
    var badge = document.createElement('div'); badge.className = 'rw-loc-badge'; badge.setAttribute('aria-hidden', 'true');
    var slidesH = '', dotsH = '';
    items.forEach(function (it) {
      var ic = $('.rw-loc-ic i', it), st = $('strong', it);
      slidesH += '<span class="rw-loc-bs"><i class="' + (ic ? ic.className : '') + '"></i><span>' + (st ? st.textContent : '') + '</span></span>';
      dotsH += '<i></i>';
    });
    badge.innerHTML = '<span class="rw-loc-slides">' + slidesH + '</span><span class="rw-loc-dots">' + dotsH + '</span>';
    media.appendChild(badge);
    var slides = $$('.rw-loc-bs', badge), dots = $$('.rw-loc-dots i', badge);

    var cur = 0;
    function set(i) {
      cur = (i + n) % n;
      items.forEach(function (it, k) { it.classList.toggle('rw-on', k === cur); });
      slides.forEach(function (s, k) { s.classList.toggle('rw-on', k === cur); });
      dots.forEach(function (d, k) { d.classList.toggle('rw-on', k === cur); });
    }
    set(0);
    var hovering = false, visible = false, timer = null;
    items.forEach(function (it, k) {
      it.addEventListener('pointerenter', function () { hovering = true; set(k); });
      it.addEventListener('click', function () { set(k); });
    });
    $('.rw-loc-list', loc).addEventListener('pointerleave', function () { hovering = false; });
    if (!still() && hasIO) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(loc);
      timer = setInterval(function () { if (visible && !hovering && !document.hidden) set(cur + 1); }, 3000);
    }

    /* gentle scroll parallax on the portrait */
    if (!still()) {
      var tk = false;
      var par = function () {
        tk = false;
        var r = frame.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var t = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
        img.style.setProperty('--rw-sy', (t * -22).toFixed(1) + 'px');
      };
      window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(par); } }, { passive: true });
      par();
    }
  })();
})();

}catch(e){console.warn('page script', e);}