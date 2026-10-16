try{

/* ==========================================================================
   ABOUT (.ab-) - word-by-word titles, staggered scroll reveal, marker sweep,
   count-up (200, already on the page), pointer tilt + glow + scroll parallax
   on the photos, hummingbird tabs (click, arrow keys, swipe) that re-frame
   the photo, and the BHD link line. Scoped to section.ab-sec.
   ========================================================================== */
(function () {
  'use strict';
  var secs = Array.prototype.slice.call(document.querySelectorAll('section.ab-sec'));
  if (!secs.length) return;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  secs.forEach(function (s) { s.classList.add('ab-js'); });

  /* ---- Titles: wrap each word (text stays identical) --------------------- */
  $$('.ab-split').forEach(function (h) {
    var k = 0;
    function tag(el) { el.classList.add('ab-w'); el.style.setProperty('--ab-d', (k++ * 70) + 'ms'); }
    (function walk(el) {
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.textContent = p; tag(w); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('ab-num')) tag(n); else walk(n);
        }
      });
    })(h);
  });

  /* ---- Marker sweeps: stagger within each paragraph ----------------------- */
  $$('.ab-copy p').forEach(function (p) {
    $$('.ab-mark', p).forEach(function (m, i) { m.style.setProperty('--ab-md', (400 + i * 260) + 'ms'); });
  });
  $$('.ab-trait').forEach(function (t, i) { t.style.setProperty('--ab-i', i); });

  /* ---- Count-up ------------------------------------------------------------ */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-ab-to'), 10);
    if (!end || still()) { el.textContent = end; return; }
    var t0 = null, dur = 1600;
    el.style.minWidth = el.getBoundingClientRect().width + 'px'; /* no reflow of the title while counting */
    el.textContent = '0';
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(end * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Scroll reveal ------------------------------------------------------- */
  function show(el) {
    el.classList.add('ab-in');
    $$('[data-ab-to]', el).forEach(countUp);
  }
  var targets = $$('.ab-rv, .ab-split, .ab-rule');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; })
        .forEach(function (e, i) {
          var el = e.target;
          if (el.classList.contains('ab-rv')) {
            el.style.setProperty('--ab-d', Math.min(i, 6) * 90 + 'ms');
            setTimeout(function () { el.style.removeProperty('--ab-d'); }, 2600);
          }
          show(el); io.unobserve(el);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else targets.forEach(show);

  /* ---- Photos: pointer tilt + glow, offset line drifts the other way ------- */
  var frames = $$('[data-ab-tilt]');
  frames.forEach(function (f) {
    var inner = f.querySelector('.ab-frame-in');
    f.addEventListener('pointermove', function (e) {
      if (!mqFine.matches || still()) return;
      var r = inner.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      f.style.setProperty('--ab-rx', ((.5 - y) * 6).toFixed(2) + 'deg');
      f.style.setProperty('--ab-ry', ((x - .5) * 8).toFixed(2) + 'deg');
      f.style.setProperty('--ab-gx', (x * 100).toFixed(1) + '%');
      f.style.setProperty('--ab-gy', (y * 100).toFixed(1) + '%');
      f.style.setProperty('--ab-lx', ((.5 - x) * 14).toFixed(1) + 'px');
      f.style.setProperty('--ab-ly', ((.5 - y) * 14).toFixed(1) + 'px');
    });
    f.addEventListener('pointerleave', function () {
      ['--ab-rx', '--ab-ry', '--ab-lx', '--ab-ly'].forEach(function (p) { f.style.removeProperty(p); });
    });
  });

  /* ---- Photos: gentle scroll parallax -------------------------------------- */
  var ticking = false;
  function parallax() {
    ticking = false;
    if (still()) return;
    var vh = window.innerHeight;
    frames.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      f.style.setProperty('--ab-py', (Math.max(-1, Math.min(1, p)) * -26).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
  parallax();

  /* ---- Hummingbird tabs ------------------------------------------------------ */
  var box = document.querySelector('.ab-tabs');
  if (box) {
    var tabs = $$('.ab-tab', box);
    var pans = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var fig = document.querySelector('.ab-bird-fig');
    var chip = fig && fig.querySelector('.ab-chip');
    var chipI = chip && chip.querySelector('.ab-chip-i i');
    var chipL = chip && chip.querySelector('.ab-chip-l');
    var chipN = chip && chip.querySelector('.ab-chip-n');
    var cur = 0;
    box.hidden = false;
    box.setAttribute('role', 'tablist');
    tabs.forEach(function (t, i) {
      t.setAttribute('role', 'tab');
      pans[i].setAttribute('role', 'tabpanel');
      pans[i].setAttribute('aria-labelledby', t.id);
      pans[i].tabIndex = 0;
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault(); select(n, true);
      });
    });
    function select(i, focus) {
      var changed = i !== cur; cur = i;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        pans[j].classList.toggle('ab-cur', on);
      });
      if (focus) tabs[i].focus();
      if (fig) fig.setAttribute('data-ab-v', String(i + 1));
      if (chip) {
        var icon = tabs[i].querySelector('i');
        if (chipI && icon) chipI.className = icon.className.replace(/\s*\bab-\S+/g, '');
        if (chipL) chipL.textContent = tabs[i].querySelector('.ab-tab-l').textContent;
        if (chipN) chipN.textContent = '0' + (i + 1) + ' / 0' + tabs.length;
        if (changed && !still() && chip.animate) {
          chip.animate([{ opacity: 0, transform: 'translate3d(0,8px,0)' }, { opacity: 1, transform: 'none' }],
            { duration: 450, easing: 'cubic-bezier(.23,1,.32,1)' });
        }
      }
    }
    select(0, false);

    /* swipe the text panel left/right on touch */
    var panels = document.querySelector('.ab-panels'), sx = 0, sy = 0, down = false;
    if (panels) {
      panels.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; down = true; sx = e.clientX; sy = e.clientY; });
      panels.addEventListener('pointerup', function (e) {
        if (!down) return; down = false;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) select((cur + (dx < 0 ? 1 : -1) + tabs.length) % tabs.length, false);
      });
      panels.addEventListener('pointercancel', function () { down = false; });
    }
  }
})();

}catch(e){console.warn('page script', e);}