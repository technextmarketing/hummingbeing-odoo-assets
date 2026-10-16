try{

/* ==========================================================================
   GALLERY (.gx) - filters with FLIP, scroll reveal, count-up, hover tilt,
   lightbox (arrows, swipe, counter, focus trap) and lazy video modal.
   Plain JS, no libraries. Everything is scoped to section.gx + the overlays.
   ========================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('section.gx');
  if (!root) return;
  document.documentElement.classList.add('gx-js');

  var EASE = 'cubic-bezier(.23,1,.32,1)';
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var canAnimate = typeof Element.prototype.animate === 'function';
  function still() { return mqReduce.matches || !canAnimate; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function inView(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight && r.width > 0; }

  var cells = $$('.gx-cell[data-cat]', root);
  var groups = $$('.gx-group', root);
  var tabs = $$('.gx-tab', root);
  var stats = $$('.gx-stat', root);
  var tabsBox = $('.gx-tabs', root);
  var ind = $('.gx-ind', root);
  var statusEl = $('#gx-status');
  var bar = $('#gx-bar');

  /* ---- Counts (derived from the markup, so they can never drift) --------- */
  var counts = { all: 0, images: 0, video: 0, podcast: 0 };
  cells.forEach(function (c) {
    if (c.hasAttribute('data-nocount')) return;
    counts[c.getAttribute('data-cat')]++; counts.all++;
  });
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  $$('.gx-tab-c[data-count]', root).forEach(function (el) { el.textContent = counts[el.getAttribute('data-count')]; });
  var gcImg = $('[data-gcount="images"]', root), gcMed = $('[data-gcount="media"]', root);
  if (gcImg) gcImg.textContent = plural(counts.images, 'photo', 'photos');
  if (gcMed) gcMed.textContent = plural(counts.video, 'video', 'videos') + ' · ' + plural(counts.podcast, 'episode', 'episodes');
  var STATUS = {
    all: 'Showing all ' + counts.all + ' items',
    images: 'Showing ' + plural(counts.images, 'photo', 'photos'),
    video: 'Showing ' + plural(counts.video, 'video', 'videos'),
    podcast: 'Showing ' + plural(counts.podcast, 'podcast episode', 'podcast episodes')
  };
  statusEl.textContent = STATUS.all;

  /* ---- Count-up ---------------------------------------------------------- */
  var statNums = $$('.gx-stat-n[data-count]', root);
  statNums.forEach(function (el) { el.textContent = still() ? counts[el.getAttribute('data-count')] : '0'; });
  function countUp() {
    statNums.forEach(function (el, i) {
      var target = counts[el.getAttribute('data-count')];
      if (still()) { el.textContent = target; return; }
      var t0 = null, dur = 1400, delay = i * 140;
      function step(ts) {
        if (t0 === null) t0 = ts + delay;
        var p = Math.min(1, Math.max(0, (ts - t0) / dur));
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---- Scroll reveal (staggered per batch) ------------------------------- */
  var hasIO = 'IntersectionObserver' in window;
  var revealIO = hasIO ? new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
    batch.forEach(function (e, i) {
      var el = e.target;
      if (el.classList.contains('gx-cell') && !el.style.getPropertyValue('--d')) {
        el.style.setProperty('--d', Math.min(i, 8) * 60 + 'ms');
        setTimeout(function () { el.style.removeProperty('--d'); }, 1600);
      }
      el.classList.add('is-in');
      revealIO.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('.gx-rv', root).forEach(function (el) { if (revealIO) revealIO.observe(el); else el.classList.add('is-in'); });

  var tl = $('#gx-tl');
  $$('.gx-moment', root).forEach(function (m, i) { m.style.setProperty('--d', i * 140 + 'ms'); });
  var statsBox = $('.gx-stats', root);
  if (hasIO) {
    var onceIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target === statsBox) countUp(); else e.target.classList.add('is-in');
        onceIO.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    if (statsBox) onceIO.observe(statsBox);
    if (tl) onceIO.observe(tl);
  } else { countUp(); if (tl) tl.classList.add('is-in'); }

  /* ---- Filter bar: sliding indicator ------------------------------------- */
  var current = 'all', seq = 0;
  function activeTab() { return tabs.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; })[0]; }
  function moveInd(animate) {
    var t = activeTab(); if (!t || !ind) return;
    if (!animate) ind.style.transition = 'none';
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
    if (!animate) { void ind.offsetWidth; ind.style.transition = ''; }
    if (tabsBox.scrollWidth > tabsBox.clientWidth + 1) {
      var left = t.offsetLeft - (tabsBox.clientWidth - t.offsetWidth) / 2;
      try { tabsBox.scrollTo({ left: left, behavior: still() ? 'auto' : 'smooth' }); } catch (err) { tabsBox.scrollLeft = left; }
    }
  }

  /* ---- Filter: FLIP (First, Last, Invert, Play) ------------------------- */
  function matches(c, cat) { return cat === 'all' || c.getAttribute('data-cat') === cat; }
  function syncGroups() {
    groups.forEach(function (g) {
      g.hidden = !$$('.gx-cell[data-cat]', g).some(function (c) { return !c.hidden; });
    });
  }
  function applyFilter(cat, animate) {
    if (!STATUS[cat]) cat = 'all';
    current = cat;
    var my = ++seq;
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-filter') === cat ? 'true' : 'false'); });
    stats.forEach(function (s) { s.setAttribute('aria-pressed', s.getAttribute('data-go') === cat ? 'true' : 'false'); });
    moveInd(animate);
    statusEl.textContent = STATUS[cat];

    var motion = animate && !still();
    if (motion) cells.forEach(function (c) { c.getAnimations().forEach(function (a) { a.cancel(); }); });
    var visible = cells.filter(function (c) { return !c.hidden; });
    var leaving = visible.filter(function (c) { return !matches(c, cat); });
    var staying = visible.filter(function (c) { return matches(c, cat); });
    var entering = cells.filter(function (c) { return c.hidden && matches(c, cat); });

    function commit() {
      if (my !== seq) return;
      var first = staying.map(function (c) { return c.getBoundingClientRect(); });
      leaving.forEach(function (c) { c.hidden = true; if (motion) c.getAnimations().forEach(function (a) { a.cancel(); }); });
      entering.forEach(function (c) { c.hidden = false; c.classList.add('is-in'); });
      syncGroups();
      if (!motion) return;
      staying.forEach(function (c, i) {
        var a = first[i], b = c.getBoundingClientRect();
        var dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        if ((a.bottom < 0 && b.bottom < 0) || (a.top > innerHeight && b.top > innerHeight)) return;
        c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 620, easing: EASE });
      });
      var k = 0;
      entering.forEach(function (c) {
        if (!inView(c)) return;
        c.animate([
          { opacity: 0, transform: 'translateY(22px) scale(.95)' },
          { opacity: 1, transform: 'none' }
        ], { duration: 560, delay: Math.min(k++, 12) * 45, easing: EASE, fill: 'backwards' });
      });
    }

    var outs = motion ? leaving.filter(inView) : [];
    if (!outs.length) { commit(); return; }
    var anims = outs.map(function (c, i) {
      return c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }],
        { duration: 200, delay: Math.min(i, 6) * 15, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    });
    Promise.all(anims.map(function (a) { return a.finished; })).then(commit, commit);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { if (t.getAttribute('data-filter') !== current) applyFilter(t.getAttribute('data-filter'), true); });
    t.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j === null) return;
      e.preventDefault(); tabs[j].focus(); applyFilter(tabs[j].getAttribute('data-filter'), true);
    });
  });
  stats.forEach(function (s) {
    s.addEventListener('click', function () {
      var cat = s.getAttribute('data-go');
      applyFilter(cat === current ? 'all' : cat, true);
      if (bar) bar.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
    });
  });
  moveInd(false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInd(false); });
  var rz = 0;
  window.addEventListener('resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(function () { moveInd(false); }); });

  /* ---- Hover tilt + sheen (fine pointers only) --------------------------- */
  var tiles = $$('.gx-tile[data-photo]', root);
  tiles.forEach(function (b) {
    var raf = 0, ev = null;
    b.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !mqFine.matches || still()) return;
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = b.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
        var amp = r.width > 420 ? 3.5 : 6;
        b.classList.add('is-tilting');
        b.style.setProperty('--ry', ((px - 0.5) * amp).toFixed(2) + 'deg');
        b.style.setProperty('--rx', ((0.5 - py) * amp).toFixed(2) + 'deg');
        b.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        b.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
    });
    b.addEventListener('pointerleave', function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      b.classList.remove('is-tilting');
      b.style.removeProperty('--rx'); b.style.removeProperty('--ry');
    });
  });

  /* ---- Dialog helpers: scroll lock, focus trap, focus return ------------- */
  var openEl = null, lastFocus = null;
  function focusables(el) {
    return $$('button, [href], iframe, [tabindex]:not([tabindex="-1"])', el).filter(function (n) {
      return !n.disabled && n.offsetParent !== null;
    });
  }
  function lockScroll(on) {
    var de = document.documentElement;
    if (on) {
      var sw = window.innerWidth - de.clientWidth;
      de.style.overflow = 'hidden';
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
    } else { de.style.overflow = ''; document.body.style.paddingRight = ''; }
  }
  function showDialog(el, from) {
    if (openEl && openEl !== el) hideDialog(openEl, null, true);
    lastFocus = from || document.activeElement;
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add('is-open');
    lockScroll(true);
    openEl = el;
    var f = focusables(el); if (f.length) f[0].focus({ preventScroll: true });
  }
  function hideDialog(el, done, instant) {
    el.classList.remove('is-open');
    var fin = function () { if (!el.classList.contains('is-open')) el.hidden = true; if (done) done(); };
    if (instant || still()) fin(); else setTimeout(fin, 360);
    if (openEl === el) {
      openEl = null; lockScroll(false);
      if (!instant && lastFocus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (err) { lastFocus.focus(); } }
    }
  }
  document.addEventListener('focusin', function (e) {
    if (openEl && !openEl.contains(e.target)) { var f = focusables(openEl); if (f.length) f[0].focus({ preventScroll: true }); }
  });

  /* ---- Lightbox --------------------------------------------------------- */
  var lb = $('#gx-lb'), lbImg = $('#gx-lb-img'), lbCap = $('#gx-lb-cap'), lbI = $('#gx-lb-i'), lbProg = $('#gx-lb-prog'), stage = $('#gx-lb-stage');
  var photos = tiles.map(function (b) { var im = b.querySelector('img'); return { src: im.getAttribute('src'), alt: im.getAttribute('alt') }; });
  $('#gx-lb-n').textContent = photos.length;
  var cur = 0, token = 0;

  function preload(i) { var p = photos[(i + photos.length) % photos.length]; var im = new Image(); im.decoding = 'async'; im.src = p.src; }
  function setPhoto(i, dir, from) {
    var n = photos.length;
    cur = (i + n) % n;
    var p = photos[cur], my = ++token;
    lbI.textContent = cur + 1;
    lbProg.style.transform = 'scaleX(' + ((cur + 1) / n) + ')';
    function reveal() {
      if (my !== token) return;
      var running = lbImg.getAnimations ? lbImg.getAnimations() : [];
      if (still()) { running.forEach(function (a) { a.cancel(); }); return; }
      var kf;
      if (from && inView(from)) {
        var r1 = from.getBoundingClientRect(), r2 = lbImg.getBoundingClientRect();
        if (r2.width > 0) {
          var s = Math.min(r1.width / r2.width, r1.height / r2.height) || 0.5;
          var dx = (r1.left + r1.width / 2) - (r2.left + r2.width / 2);
          var dy = (r1.top + r1.height / 2) - (r2.top + r2.height / 2);
          kf = [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: 0.35 }, { transform: 'none', opacity: 1 }];
        }
      }
      if (!kf) kf = dir ? [{ transform: 'translateX(' + dir * 48 + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }]
                        : [{ transform: 'scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }];
      running.forEach(function (a) { a.cancel(); });
      lbImg.animate(kf, { duration: from ? 520 : 420, easing: EASE, fill: 'backwards' });
    }
    function swap() {
      if (my !== token) return;
      lbImg.src = p.src; lbImg.alt = p.alt; lbCap.textContent = p.alt;
      var ready = lbImg.decode ? lbImg.decode().catch(function () {}) : Promise.resolve();
      ready.then(reveal);
    }
    if (dir && !still() && !lb.hidden) {
      lbImg.getAnimations().forEach(function (a) { a.cancel(); });
      lbImg.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + (-dir * 48) + 'px)', opacity: 0 }],
        { duration: 170, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.then(swap, swap);
    } else swap();
    preload(cur + 1); preload(cur - 1);
  }
  function openLightbox(i, from) {
    lbImg.style.transform = '';
    showDialog(lb, from);
    setPhoto(i, 0, from);
  }
  function closeLightbox() { if (!lb.hidden) hideDialog(lb); }
  function go(d) { setPhoto(cur + d, d); }
  $('#gx-lb-prev').addEventListener('click', function () { go(-1); });
  $('#gx-lb-next').addEventListener('click', function () { go(1); });

  // Touch swipe
  var sx = null, sy = 0, sdx = 0;
  stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; sdx = 0; });
  stage.addEventListener('pointermove', function (e) {
    if (sx === null) return;
    sdx = e.clientX - sx;
    if (Math.abs(sdx) > Math.abs(e.clientY - sy) && !still()) lbImg.style.transform = 'translateX(' + (sdx * 0.6) + 'px)';
  });
  function endSwipe() {
    if (sx === null) return;
    var d = sdx; sx = null; lbImg.style.transform = '';
    if (Math.abs(d) > 50) go(d < 0 ? 1 : -1);
  }
  stage.addEventListener('pointerup', endSwipe);
  stage.addEventListener('pointercancel', endSwipe);

  /* ---- Video modal (iframe created only on open) ------------------------- */
  var vm = $('#gx-vm'), vmBox = $('#gx-vm-ratio'), vmTitle = $('#gx-vm-title');
  function openVideo(id, title, from) {
    vmBox.innerHTML = '';
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    f.title = title || 'Video';
    f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    vmBox.appendChild(f);
    vmTitle.textContent = title || 'Video';
    showDialog(vm, from);
  }
  function closeVideo() { if (vm.hidden) return; vmBox.innerHTML = ''; hideDialog(vm); }

  [lb, vm].forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { if (d === lb) closeLightbox(); else closeVideo(); }
    });
  });

  /* ---- Click delegation inside the section ------------------------------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-photo], [data-open], [data-video]');
    if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-video')) { openVideo(t.getAttribute('data-video'), t.getAttribute('data-title'), t); return; }
    var i = parseInt(t.getAttribute(t.hasAttribute('data-photo') ? 'data-photo' : 'data-open'), 10);
    if (!isNaN(i)) openLightbox(i, t);
  });

  /* ---- Keyboard: Esc, arrows, focus trap --------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (!openEl) return;
    if (e.key === 'Escape') { e.preventDefault(); if (openEl === lb) closeLightbox(); else closeVideo(); return; }
    if (openEl === lb && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); return; }
    if (openEl === lb && (e.key === 'Home' || e.key === 'End')) { e.preventDefault(); setPhoto(e.key === 'Home' ? 0 : photos.length - 1, e.key === 'Home' ? -1 : 1); return; }
    if (e.key === 'Tab') {
      var f = focusables(openEl); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---- Backwards-compatible globals ------------------------------------- */
  window.openLightbox = function (src) {
    var i = photos.map(function (p) { return p.src; }).indexOf(src);
    openLightbox(i < 0 ? 0 : i, null);
  };
  window.closeLightbox = closeLightbox;
  window.openVideo = function (id, title) { openVideo(id, title, null); };
  window.closeVideo = closeVideo;
})();

}catch(e){console.warn('page script', e);}