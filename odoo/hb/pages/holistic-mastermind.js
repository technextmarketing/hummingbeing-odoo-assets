try{

/* ==========================================================================
   HOLISTIC MASTERMIND (.hm) - scroll reveal, pillar orbit explorer (tabs),
   scroll-drawn journey path, count-up, pointer tilt and CTA glow.
   Plain JS, no libraries. Everything is scoped to section.hm.
   ========================================================================== */
(function () {
  'use strict';
  if (!document.querySelector('section.hm')) return;
  document.documentElement.classList.add('hm-js');

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Scroll reveal (staggered per batch) ------------------------------- */
  var rvIO = hasIO ? new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
    batch.forEach(function (e, i) {
      var el = e.target;
      if (!el.style.getPropertyValue('--d')) {
        el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms');
        setTimeout(function () { el.style.removeProperty('--d'); }, 1800);
      }
      el.classList.add('hm-is-in');
      rvIO.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('section.hm .hm-rv').forEach(function (el) { if (rvIO) rvIO.observe(el); else el.classList.add('hm-is-in'); });

  /* ---- Once-in-view hooks (highlight sweep, stats) ----------------------- */
  var statNums = $$('.hm-stat-n[data-hm-count]');
  function fmt(el, v) { return v + (el.getAttribute('data-hm-suffix') || ''); }
  function countUp() {
    statNums.forEach(function (el, i) {
      var target = +el.getAttribute('data-hm-count');
      if (still()) { el.textContent = fmt(el, target); return; }
      var t0 = null, dur = 1500, delay = i * 150;
      function step(ts) {
        if (t0 === null) t0 = ts + delay;
        var p = Math.min(1, Math.max(0, (ts - t0) / dur));
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = fmt(el, Math.round(target * e));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var why = $('section.hm-why'), guide = $('section.hm-guide'), stats = $('.hm-stats');
  if (hasIO) {
    if (!still()) statNums.forEach(function (el) { el.textContent = fmt(el, 0); });
    var onceIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target === stats) countUp(); else e.target.classList.add('hm-is-in');
        onceIO.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    [why, guide, stats].forEach(function (el) { if (el) onceIO.observe(el); });
  } else {
    [why, guide].forEach(function (el) { if (el) el.classList.add('hm-is-in'); });
  }

  /* ---- Pointer tilt on the two portraits --------------------------------- */
  $$('[data-hm-tilt]').forEach(function (fig) {
    var frame = fig.firstElementChild, raf = 0;
    fig.addEventListener('pointermove', function (e) {
      if (!mqFine.matches || still()) return;
      var r = fig.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        fig.classList.add('hm-is-tilting');
        frame.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        frame.style.setProperty('--rx', (y * -7).toFixed(2) + 'deg');
        fig.style.setProperty('--px', (x * -14).toFixed(1) + 'px');
        fig.style.setProperty('--py', (y * -14).toFixed(1) + 'px');
      });
    });
    fig.addEventListener('pointerleave', function () {
      cancelAnimationFrame(raf);
      fig.classList.remove('hm-is-tilting');
      ['--rx', '--ry'].forEach(function (p) { frame.style.removeProperty(p); });
      ['--px', '--py'].forEach(function (p) { fig.style.removeProperty(p); });
    });
  });

  /* ---- Pillar orbit explorer (WAI-ARIA tabs) ----------------------------- */
  var ex = $('.hm-ex');
  var select = function () {};
  if (ex) {
    var wheel = $('.hm-wheel', ex), orbit = $('.hm-orbit', ex);
    var nodes = $$('.hm-node', ex), panels = $$('.hm-pn', ex);
    var coreIn = $('.hm-core-in', ex), coreN = $('.hm-core-n', ex), coreL = $('.hm-core-l', ex);
    var beam = $('.hm-beam', ex), curEl = $('.hm-pn-cur', ex), prog = $('.hm-pn-prog span', ex);
    var NUM = ['I', 'II', 'III', 'IV'];
    var cur = -1, turns = 0;

    orbit.setAttribute('role', 'tablist');
    orbit.setAttribute('aria-label', 'The four pillars');
    nodes.forEach(function (n, i) {
      n.setAttribute('role', 'tab');
      n.id = 'hm-tab-' + i;
      n.setAttribute('aria-controls', 'hm-pn-' + i);
    });
    panels.forEach(function (p, i) {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'hm-tab-' + i);
      p.setAttribute('tabindex', '0');
    });

    function restart(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

    select = function (i, focus) {
      i = (i % 4 + 4) % 4;
      if (i === cur) { if (focus) nodes[i].focus(); return; }
      if (cur < 0) turns = i;
      else { var d = i - cur; if (d > 2) d -= 4; if (d < -2) d += 4; turns += d; }
      wheel.style.setProperty('--rot', String(-90 * turns));
      nodes.forEach(function (n, k) {
        var on = k === i;
        n.setAttribute('aria-selected', on ? 'true' : 'false');
        n.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, k) {
        p.classList.toggle('hm-is-cur', k === i);
        if (k === i) p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true');
      });
      coreN.textContent = NUM[i];
      coreL.textContent = nodes[i].getAttribute('data-hm-core');
      if (cur >= 0 && !still()) { restart(coreIn, 'hm-is-swap'); restart(beam, 'hm-is-go'); }
      curEl.textContent = '0' + (i + 1);
      prog.style.transform = 'scaleX(' + ((i + 1) / 4) + ')';
      cur = i;
      if (focus) nodes[i].focus();
    };
    select(0, false);

    nodes.forEach(function (n, i) {
      n.addEventListener('click', function () { select(i, false); });
      n.addEventListener('keydown', function (e) {
        var k = e.key, to = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') to = cur + 1;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') to = cur - 1;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = 3;
        if (to === null) return;
        e.preventDefault();
        select(to, true);
      });
    });
    $$('.hm-pn-btn', ex).forEach(function (b) {
      b.addEventListener('click', function () { select(cur + (+b.getAttribute('data-hm-step')), false); });
    });

    /* spotlight that follows the pointer across the open panel */
    panels.forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        if (!mqFine.matches) return;
        var r = p.getBoundingClientRect();
        p.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        p.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
    });
  }

  /* ---- "Explore each pillar" chips: highlight + jump into the explorer ---- */
  $$('[data-hm-go]').forEach(function (a) {
    var i = +a.getAttribute('data-hm-go');
    var ph = $('.hm-ph[data-hm-p="' + i + '"]');
    function hot(on) { if (ph) ph.classList.toggle('hm-is-hot', on); }
    a.addEventListener('pointerenter', function () { hot(true); });
    a.addEventListener('pointerleave', function () { hot(false); });
    a.addEventListener('focus', function () { hot(true); });
    a.addEventListener('blur', function () { hot(false); });
    a.addEventListener('click', function (e) {
      if (!ex) return;
      e.preventDefault();
      select(i, false);
      var target = document.getElementById('hm-pillars');
      try { target.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' }); } catch (err) { target.scrollIntoView(); }
      var tab = document.getElementById('hm-tab-' + i);
      setTimeout(function () { try { tab.focus({ preventScroll: true }); } catch (err) { tab.focus(); } }, still() ? 0 : 700);
    });
  });

  /* ---- Journey: rail fills with scroll, nodes light as it passes --------- */
  var path = $('.hm-path');
  if (path) {
    var rail = $('.hm-rail', path), fill = $('.hm-rail-fill', path), bead = $('.hm-rail-bead', path);
    var steps = $$('.hm-st', path), stepNodes = steps.map(function (s) { return $('.hm-st-node', s); });
    var ticking = false, listening = false;

    function layout() {
      var pr = path.getBoundingClientRect();
      var a = stepNodes[0].getBoundingClientRect(), b = stepNodes[stepNodes.length - 1].getBoundingClientRect();
      rail.style.top = (a.top + a.height / 2 - pr.top).toFixed(1) + 'px';
      rail.style.bottom = (pr.bottom - (b.top + b.height / 2)).toFixed(1) + 'px';
    }
    function update() {
      ticking = false;
      var line = window.innerHeight * .62;
      var r = rail.getBoundingClientRect();
      var p = r.height ? (line - r.top) / r.height : 0;
      p = Math.max(0, Math.min(1, p));
      fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      bead.style.transform = 'translateY(' + (p * r.height).toFixed(1) + 'px)';
      bead.style.opacity = p > 0 && p < 1 ? '1' : '0';
      steps.forEach(function (s, k) {
        var nr = stepNodes[k].getBoundingClientRect();
        s.classList.toggle('hm-is-lit', nr.top + nr.height / 2 <= line + 1);
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    function listen(on) {
      if (on === listening) return;
      listening = on;
      if (on) window.addEventListener('scroll', onScroll, { passive: true });
      else window.removeEventListener('scroll', onScroll);
    }
    layout();
    if (still()) {
      steps.forEach(function (s) { s.classList.add('hm-is-lit'); });
    } else {
      update();
      if (hasIO) new IntersectionObserver(function (es) { listen(es[0].isIntersecting); if (es[0].isIntersecting) onScroll(); }, { rootMargin: '20% 0px 20% 0px' }).observe(path);
      else listen(true);
    }
    window.addEventListener('resize', function () { layout(); if (!still()) onScroll(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); if (!still()) onScroll(); });
  }

  /* ---- CTA: glow follows the pointer ------------------------------------- */
  var cta = $('.hm-cta-panel'), glow = $('.hm-cta-glow');
  if (cta && glow) {
    cta.addEventListener('pointermove', function (e) {
      if (!mqFine.matches || still()) return;
      var r = cta.getBoundingClientRect();
      glow.style.setProperty('--gx', (e.clientX - r.left - r.width / 2).toFixed(0) + 'px');
      glow.style.setProperty('--gy', (e.clientY - r.top - r.height / 2).toFixed(0) + 'px');
    });
    cta.addEventListener('pointerleave', function () { glow.style.removeProperty('--gx'); glow.style.removeProperty('--gy'); });
  }
})();

}catch(e){console.warn('page script', e);}