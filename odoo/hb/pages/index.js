try{

/* Upcoming-events section: date-driven on every page load.
   Reads each card's .evt-date-tag (data-start/data-end, ISO SGT). Colours the
   pill, badges the thumb (Upcoming/Ongoing/Passed), hides events that have
   already ended, and orders the rest soonest-first so the newest upcoming
   event always leads. Refreshes automatically each open/refresh. */
(function(){
  var now = Date.now();
  function ms(d, endOfDay){ return d ? Date.parse(d + (endOfDay ? 'T23:59:59' : 'T00:00:00') + '+08:00') : NaN; }

  // colour the standalone date pills
  document.querySelectorAll('.evt-date-tag').forEach(function(t){
    if(/is-(past|upcoming|ongoing|closed)/.test(t.className)) return;
    var em = ms(t.getAttribute('data-end') || t.getAttribute('data-start'), true);
    var sm = t.getAttribute('data-start') ? ms(t.getAttribute('data-start'), false) : em;
    if(isNaN(em)){ t.classList.add('is-upcoming'); return; }
    if(em < now) t.classList.add('is-past');
    else if(sm <= now && now <= em) t.classList.add('is-ongoing');
    else t.classList.add('is-upcoming');
  });

  var grid = document.getElementById('home-evt-grid');
  if(!grid) return;
  var BADGE = { sold:'Sold Out', past:'Passed', ongoing:'Ongoing', upcoming:'Upcoming' };

  function statusOf(card){
    if(card.getAttribute('data-sold') === 'true') return 'sold';
    var tag = card.querySelector('.evt-date-tag');
    if(!tag) return 'upcoming';
    var em = ms(tag.getAttribute('data-end') || tag.getAttribute('data-start'), true);
    var sm = tag.getAttribute('data-start') ? ms(tag.getAttribute('data-start'), false) : em;
    if(!isNaN(em) && em < now) return 'past';
    if(!isNaN(sm) && sm <= now && (isNaN(em) || now <= em)) return 'ongoing';
    return 'upcoming';
  }
  function startMs(card){
    var tag = card.querySelector('.evt-date-tag');
    var s = tag ? ms(tag.getAttribute('data-start'), false) : NaN;
    return isNaN(s) ? Infinity : s;
  }

  var cards = [].slice.call(grid.querySelectorAll('.home-evt-card'));
  cards.forEach(function(card){
    var status = statusOf(card);
    card.setAttribute('data-status', status);
    var thumb = card.querySelector('.home-evt-thumb');
    if(thumb){
      thumb.querySelectorAll('.h-badge').forEach(function(b){ b.remove(); });
      var b = document.createElement('span');
      b.className = 'h-badge is-' + status;
      b.textContent = BADGE[status];
      thumb.insertBefore(b, thumb.firstChild);
    }
    card.classList.toggle('is-sold', status === 'sold');
    // an event that has already ended is never featured on the homepage
    card.hidden = (status === 'past');
  });

  // order soonest-first; sold-out sinks below live events
  var order = { ongoing:0, upcoming:0, sold:1, past:2 };
  cards.sort(function(a,b){
    var ga = order[a.getAttribute('data-status')] || 0, gb = order[b.getAttribute('data-status')] || 0;
    if(ga !== gb) return ga - gb;
    return startMs(a) - startMs(b);
  });
  cards.forEach(function(c){ grid.appendChild(c); });
})();

}catch(e){console.warn('page script', e);}
try{

/* ==========================================================================
   HOME (.hx) - reveal on scroll, event tilt + countdown chip + swipe track,
   click-to-play video facade, offer tabs, quote carousel, "is this for you"
   check list, breathing CTA. Plain JS, no libraries, scoped to .hx-sec.
   Runs after the upcoming-events script above (it relies on data-status).
   ========================================================================== */
(function () {
  'use strict';
  var secs = [].slice.call(document.querySelectorAll('.hx-sec'));
  if (!secs.length) return;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  secs.forEach(function (s) { s.classList.add('hx-live'); });

  /* ---- Reveal on scroll ------------------------------------------------- */
  var rv = $$('.hx-sec .hx-rv');
  if (still() || !('IntersectionObserver' in window)) {
    rv.forEach(function (e) { e.classList.add('hx-in'); });
  } else {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        // event cards sit in a swipe track on phones: reveal the whole row together so the peeking card shows
        var grp = en.target.classList.contains('home-evt-card') ? $$('.home-evt-card', en.target.parentNode) : [en.target];
        grp.forEach(function (g) { g.classList.add('hx-in'); rio.unobserve(g); });
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (e) { rio.observe(e); });
  }

  /* ---- Pointer tilt helper (fine pointers only) -------------------------- */
  function tilt(el, ax, ay, cb) {
    if (!mqFine.matches || still()) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('hx-tilt');
      el.style.setProperty('--rx', ((.5 - y) * ax).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((x - .5) * ay).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      if (cb) cb(x, y);
    });
    el.addEventListener('pointerleave', function () {
      el.classList.remove('hx-tilt');
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      if (cb) cb(.5, .5);
    });
  }

  /* ---- 1. Upcoming events ------------------------------------------------ */
  var ev = $('#hx-evts');
  if (ev) {
    var track = $('#home-evt-grid', ev), nav = $('.hx-evt-nav', ev), prog = $('.hx-evt-prog', ev);
    var now = Date.now();
    $$('.home-evt-card', track).forEach(function (card) {
      tilt(card, 5, 7);
      var st = card.getAttribute('data-status'), tag = $('.evt-date-tag', card);
      if (!tag || (st !== 'upcoming' && st !== 'ongoing')) return;
      var chip = document.createElement('span'); chip.className = 'hx-when';
      if (st === 'ongoing') chip.textContent = 'Happening now';
      else {
        var s = Date.parse(tag.getAttribute('data-start') + 'T00:00:00+08:00');
        if (isNaN(s)) return;
        var d = Math.ceil((s - now) / 864e5);
        chip.innerHTML = '<i class="fa-regular fa-clock" aria-hidden="true"></i>' + (d <= 1 ? 'Starts tomorrow' : 'Starts in ' + d + ' days');
      }
      tag.parentNode.appendChild(chip);
    });
    var bar = prog ? $('i', prog) : null, btns = $$('.hx-arrow', nav), raf = 0;
    function cards() { return $$('.home-evt-card', track).filter(function (c) { return !c.hidden; }); }
    function upd() {
      raf = 0;
      var max = track.scrollWidth - track.clientWidth, over = max > 4;
      nav.hidden = !over; if (prog) prog.hidden = !over;
      if (!over) return;
      btns[0].disabled = track.scrollLeft < 4;
      btns[1].disabled = track.scrollLeft > max - 4;
      if (bar) {
        bar.style.width = (track.clientWidth / track.scrollWidth * 100).toFixed(2) + '%';
        bar.style.transform = 'translateX(' + (track.scrollLeft / track.clientWidth * 100).toFixed(2) + '%)';
      }
    }
    function queue() { if (!raf) raf = requestAnimationFrame(upd); }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var c = cards(); if (c.length < 2) return;
        var step = c[1].offsetLeft - c[0].offsetLeft;
        track.scrollBy({ left: +b.getAttribute('data-dir') * step, behavior: still() ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    upd();
  }

  /* ---- 2. Video facade: YouTube only loads when the visitor presses play -- */
  var fac = $('.hx-facade');
  if (fac) {
    var ns = fac.parentNode.querySelector('noscript');
    if (ns && 'content' in document.createElement('template')) {
      fac.hidden = false;
      fac.addEventListener('click', function () {
        var t = document.createElement('template'); t.innerHTML = ns.textContent;
        var f = t.content.querySelector('iframe'); if (!f) return;
        f.setAttribute('src', f.getAttribute('src') + (f.getAttribute('src').indexOf('?') > -1 ? '&' : '?') + 'autoplay=1');
        f.removeAttribute('loading');
        fac.parentNode.insertBefore(f, fac);
        fac.classList.add('hx-gone');
        setTimeout(function () { fac.remove(); try { f.focus(); } catch (e) {} }, still() ? 0 : 500);
      });
      tilt(fac, 0, 0, function (x, y) {
        fac.style.setProperty('--px', ((.5 - x) * 16).toFixed(1) + 'px');
        fac.style.setProperty('--py', ((.5 - y) * 10).toFixed(1) + 'px');
      });
    }
  }

  /* ---- 3. Offer tabs ------------------------------------------------------ */
  var off = $('.hx-offer');
  if (off) {
    var tabs = $$('.hx-otab', off), panels = $$('.hx-opanel', off), tl = $('.hx-offer-tabs', off), hoverT = 0;
    panels.forEach(function (p) { p.setAttribute('role', 'tabpanel'); });
    function sel(i, focus) {
      tabs.forEach(function (t, j) { var on = j === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p, j) { p.classList.toggle('hx-cur', j === i); });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, j = -1;
        if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % n;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j > -1) { e.preventDefault(); sel(j, true); }
      });
      if (mqFine.matches) {
        t.addEventListener('pointerenter', function () { clearTimeout(hoverT); hoverT = setTimeout(function () { sel(i); }, 110); });
        t.addEventListener('pointerleave', function () { clearTimeout(hoverT); });
      }
    });
    var mqCol = window.matchMedia('(max-width: 900px)');
    function orient() { tl.setAttribute('aria-orientation', mqCol.matches ? 'horizontal' : 'vertical'); }
    orient(); if (mqCol.addEventListener) mqCol.addEventListener('change', orient);
    panels.forEach(function (p) {
      var m = $('.hx-opanel-media', p);
      tilt(m, 0, 0, function (x, y) {
        m.style.setProperty('--px', ((.5 - x) * 14).toFixed(1) + 'px');
        m.style.setProperty('--py', ((.5 - y) * 10).toFixed(1) + 'px');
      });
    });
  }

  /* ---- 4. Quote carousel -------------------------------------------------- */
  var q = $('.hx-q');
  if (q) {
    var stage = $('.hx-q-stage', q), slides = $$('.hx-q-slide', q), dotsBox = $('.hx-q-dots', q);
    var count = $('.hx-q-count', q), pauseB = $('.hx-q-pause', q), n = slides.length, cur = 0;
    var userPaused = false, hovering = false, focusIn = false, inView = false, auto = !still() && n > 1;
    var dots = slides.map(function (s, i) {
      s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', (i + 1) + ' of ' + n);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'hx-qdot';
      b.setAttribute('aria-label', 'Show quote ' + (i + 1) + ' of ' + n); b.innerHTML = '<i></i>';
      b.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(b); return b;
    });
    var tapHold = false, tapT = 0;
    q.addEventListener('pointerdown', function () { tapHold = true; clearTimeout(tapT); hold(); tapT = setTimeout(function () { tapHold = false; hold(); }, 8000); });
    function hold() {
      q.classList.toggle('hx-hold', userPaused || hovering || focusIn || !inView || tapHold);
      stage.setAttribute('aria-live', (auto && !userPaused) ? 'off' : 'polite');
    }
    function go(k) {
      cur = (k + n) % n;
      slides.forEach(function (s, j) {
        s.setAttribute('data-pos', j === cur ? 'cur' : (j < cur ? 'before' : 'after'));
        s.setAttribute('aria-hidden', j === cur ? 'false' : 'true');
      });
      dots.forEach(function (d, j) { if (j === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      count.textContent = pad(cur + 1) + ' / ' + pad(n);
    }
    dots.forEach(function (d) {
      $('i', d).addEventListener('animationend', function () { if (auto && !userPaused) go(cur + 1); });
    });
    $$('[data-q]', q).forEach(function (b) { b.addEventListener('click', function () { go(cur + +b.getAttribute('data-q')); }); });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    var sx = null, sy = 0;
    stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', function () { sx = null; });
    if (auto) {
      q.classList.add('hx-auto');
      pauseB.hidden = false;
      pauseB.addEventListener('click', function () {
        userPaused = !userPaused;
        pauseB.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        pauseB.innerHTML = userPaused
          ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg><span>Play</span>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg><span>Pause</span>';
        hold();
      });
      if (mqFine.matches) {
        q.addEventListener('pointerenter', function () { hovering = true; hold(); });
        q.addEventListener('pointerleave', function () { hovering = false; hold(); });
      }
      q.addEventListener('focusin', function () { focusIn = true; hold(); });
      q.addEventListener('focusout', function (e) { if (!q.contains(e.relatedTarget)) { focusIn = false; hold(); } });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { inView = es[0].isIntersecting; hold(); }, { threshold: .35 }).observe(q);
      } else inView = true;
      document.addEventListener('visibilitychange', function () { if (document.hidden) { inView = false; hold(); } });
    }
    go(0); hold();
  }

  /* ---- 5. Is this for you: tap-to-check ----------------------------------- */
  var fit = $('.hx-fit');
  if (fit) {
    var items = $$('.hx-fit-item', fit), meter = $('.hx-fit-meter', fit), num = $('b', meter), fill = $('.hx-fit-bar i', meter);
    items.forEach(function (li) {
      var lab = $('.hx-fit-label', li), dot = $('.hx-fit-dot', li);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'hx-fit-btn'; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="hx-fit-box" aria-hidden="true"><i class="fa-solid fa-check"></i></span>';
      if (dot) dot.remove();
      b.appendChild(lab); li.appendChild(b); li.classList.add('hx-btnd');
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        var c = $$('.hx-fit-btn[aria-pressed="true"]', fit).length;
        num.textContent = c; fill.style.transform = 'scaleX(' + (c / items.length) + ')';
        num.classList.remove('hx-bump'); void num.offsetWidth; num.classList.add('hx-bump');
      });
    });
    $('.hx-fit-hint', fit).hidden = false; meter.hidden = false;
    var fr = $('.hx-fit-frame', fit);
    tilt(fr, 4, 6, function (x, y) {
      fr.style.setProperty('--px', ((.5 - x) * 16).toFixed(1) + 'px');
      fr.style.setProperty('--py', ((.5 - y) * 12).toFixed(1) + 'px');
    });
  }

  /* ---- 6. Breathing CTA --------------------------------------------------- */
  var cta = $('.hx-cta');
  if (cta && !still()) {
    var lbl = $('.hx-breath-lbl', cta), ring = $('.hx-breath span', cta), outT = 0;
    if (lbl && ring) {
      lbl.hidden = false;
      var say = function (txt) { lbl.classList.add('hx-fade'); setTimeout(function () { lbl.textContent = txt; lbl.classList.remove('hx-fade'); }, 300); };
      var cycle = function () { clearTimeout(outT); say('Breathe in'); outT = setTimeout(function () { say('Breathe out'); }, 4000); };
      ring.addEventListener('animationiteration', cycle);
      cycle();
    }
    if (mqFine.matches) {
      var glow = $('.hx-cta-glow', cta);
      cta.addEventListener('pointermove', function (e) {
        var r = cta.getBoundingClientRect();
        glow.style.setProperty('--gx', (e.clientX - r.left).toFixed(0) + 'px');
        glow.style.setProperty('--gy', (e.clientY - r.top).toFixed(0) + 'px');
      });
    }
  }
})();

}catch(e){console.warn('page script', e);}
try{

/* ==========================================================================
   HOME - live events feed (2026-09-29).
   The events page is the single source of truth: on every visit this reads
   events.html, keeps the events that have not ended and are not sold out,
   orders them soonest-first and rebuilds the cards (the static cards in the
   HTML are only the first paint / no-JS fallback). Adds filter pills with
   counts, a "Next up" badge, the "Starts in" chip, card tilt and the count.
   ========================================================================== */
(function () {
  'use strict';
  var sec = document.getElementById('hx-evts');
  var grid = document.getElementById('home-evt-grid');
  if (!sec || !grid) return;
  var bar = sec.querySelector('.hx-evf'), countEl = sec.querySelector('.hx-evt-count');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var FILTERS = [
    { k: 'all', l: 'All', i: 'fa-solid fa-layer-group' },
    { k: 'online', l: 'Online', i: 'fa-solid fa-video' },
    { k: 'singapore', l: 'Singapore', i: 'fa-solid fa-location-dot' },
    { k: 'international', l: 'International', i: 'fa-solid fa-earth-europe' },
    { k: 'workshops', l: 'Workshops', i: 'fa-solid fa-people-group' },
    { k: 'certification', l: 'Certification', i: 'fa-solid fa-graduation-cap' }
  ];
  var current = 'all';

  function ms(d, end) { return d ? Date.parse(d + (end ? 'T23:59:59' : 'T00:00:00') + '+08:00') : NaN; }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function cats(el) { return (el.getAttribute('data-cat') || '').toLowerCase().split(/\s+/); }
  function statusOf(start, end, sold) {
    var now = Date.now(), s = ms(start, false), e = ms(end || start, true);
    if (sold) return 'sold';
    if (!isNaN(e) && e < now) return 'past';
    if (!isNaN(s) && s <= now) return 'ongoing';
    return 'upcoming';
  }

  /* ---- build one home card from an events-page card ----------------------- */
  function build(src) {
    var card = document.createElement('article');
    card.className = 'home-evt-card hx-rv hx-in';
    card.setAttribute('data-cat', src.getAttribute('data-cat') || '');
    var th = src.querySelector('.evt-card-thumb'), h3 = src.querySelector('h3');
    var title = h3 ? h3.textContent.trim() : 'Event';
    var a = document.createElement('a');
    a.className = 'home-evt-thumb';
    a.href = th ? th.getAttribute('href') : '/event';
    a.setAttribute('aria-label', title + ' - event details');
    var img = th && th.querySelector('img');
    if (img) { var im = img.cloneNode(false); im.setAttribute('loading', 'lazy'); a.appendChild(im); }
    card.appendChild(a);
    var body = document.createElement('div'); body.className = 'home-evt-body';
    var tags = document.createElement('div'); tags.className = 'home-evt-tags';
    $$('.evt-tag', src).forEach(function (t) {
      var s = document.createElement('span');
      s.className = 'home-evt-tag' + (t.classList.contains('loc') ? ' loc' : '');
      s.innerHTML = t.innerHTML; tags.appendChild(s);
    });
    body.appendChild(tags);
    var h = document.createElement('h3'); h.innerHTML = h3 ? h3.innerHTML : title; body.appendChild(h);
    var dates = src.querySelector('.evt-dates');
    if (dates) body.appendChild(document.importNode(dates, true));
    var dsc = src.querySelector('.evt-card-desc');
    if (dsc) { var p = document.createElement('p'); p.className = 'home-evt-desc'; p.innerHTML = dsc.innerHTML; body.appendChild(p); }
    var acts = document.createElement('div'); acts.className = 'home-evt-actions';
    $$('.evt-card-actions a.hb-btn', src).forEach(function (b, i) {
      var n = document.importNode(b, true);
      n.className = 'hb-btn ' + (i === 0 ? 'hb-btn-primary' : 'home-evt-btn2');
      acts.appendChild(n);
    });
    body.appendChild(acts);
    card.appendChild(body);
    return card;
  }

  /* ---- status pills, badges, chips, tilt ---------------------------------- */
  function decorate(list) {
    var now = Date.now();
    list.forEach(function (card, idx) {
      $$('.evt-date-tag', card).forEach(function (t) {
        t.classList.remove('is-past', 'is-ongoing', 'is-upcoming');
        var st = statusOf(t.getAttribute('data-start'), t.getAttribute('data-end'), false);
        t.classList.add(st === 'past' ? 'is-past' : st === 'ongoing' ? 'is-ongoing' : 'is-upcoming');
      });
      var tag = card.querySelector('.evt-date-tag');
      var st = card.getAttribute('data-status');
      var thumb = card.querySelector('.home-evt-thumb');
      if (thumb) {
        $$('.h-badge', thumb).forEach(function (b) { b.remove(); });
        var b = document.createElement('span');
        var next = idx === 0 && st === 'upcoming';
        b.className = 'h-badge is-' + (next ? 'next' : st);
        b.textContent = next ? 'Next up' : (st === 'ongoing' ? 'Ongoing' : 'Upcoming');
        thumb.insertBefore(b, thumb.firstChild);
      }
      if (tag && !card.querySelector('.hx-when')) {
        var chip = document.createElement('span'); chip.className = 'hx-when';
        if (st === 'ongoing') chip.textContent = 'Happening now';
        else {
          var s = ms(tag.getAttribute('data-start'), false);
          if (!isNaN(s)) {
            var d = Math.ceil((s - now) / 864e5);
            chip.innerHTML = '<i class="fa-regular fa-clock" aria-hidden="true"></i>' + (d <= 1 ? 'Starts tomorrow' : 'Starts in ' + d + ' days');
          }
        }
        if (chip.textContent) tag.parentNode.appendChild(chip);
      }
      if (!card._hxTilt && mqFine.matches && !mqReduce.matches) {
        card._hxTilt = true;
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.classList.add('hx-tilt');
          card.style.setProperty('--rx', ((.5 - y) * 5).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - .5) * 7).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', function () {
          card.classList.remove('hx-tilt');
          card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
        });
      }
    });
  }

  /* ---- filters ------------------------------------------------------------- */
  function allCards() { return $$('.home-evt-card', grid).filter(function (c) { return c.getAttribute('data-status') !== 'past'; }); }
  function layout() {
    var vis = allCards().filter(function (c) { return !c.hidden; });
    grid.classList.toggle('hx-many', vis.length > 3);
    grid.scrollLeft = 0;
    window.dispatchEvent(new Event('resize')); // the track arrows + progress bar re-measure on resize
  }
  function apply(k, animate) {
    current = k;
    var shown = 0;
    allCards().forEach(function (c) {
      var on = k === 'all' || cats(c).indexOf(k) > -1;
      c.hidden = !on;
      c.classList.remove('hx-pop');
      if (on && animate && !mqReduce.matches) { void c.offsetWidth; c.style.setProperty('--pd', Math.min(shown, 4) * 70 + 'ms'); c.classList.add('hx-pop'); }
      if (on) shown++;
    });
    if (bar) $$('.hx-evf-b', bar).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false'); });
    layout();
  }
  function buildFilters() {
    if (!bar) return;
    var list = allCards(), counts = { all: list.length };
    list.forEach(function (c) { cats(c).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    var useful = FILTERS.filter(function (f) { return f.k === 'all' || (counts[f.k] && counts[f.k] < list.length); });
    bar.innerHTML = '';
    if (useful.length < 2) { bar.hidden = true; return; }
    useful.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hx-evf-b'; b.setAttribute('data-k', f.k); b.setAttribute('aria-controls', 'home-evt-grid');
      b.setAttribute('aria-pressed', f.k === current ? 'true' : 'false');
      b.innerHTML = '<i class="' + f.i + '" aria-hidden="true"></i>' + f.l + '<span class="hx-evf-n">' + (counts[f.k] || 0) + '</span>';
      b.addEventListener('click', function () { apply(f.k, true); });
      bar.appendChild(b);
    });
    if (!useful.some(function (f) { return f.k === current; })) current = 'all';
    bar.hidden = false;
    bar.classList.add('hx-in');
  }
  function setCount(n) {
    if (!countEl) return;
    countEl.innerHTML = '<span class="hx-evt-n">' + n + '</span> upcoming ' + (n === 1 ? 'event' : 'events') + ' &middot; updated from the events calendar';
  }
  function finish() {
    var list = allCards();
    decorate(list);
    buildFilters();
    apply(current, false);
    setCount(list.length);
    if (window.hbInitButtons) window.hbInitButtons();
  }

  // first paint: the static cards (already status-tagged by the script above)
  $$('.home-evt-card', grid).forEach(function (c) {
    if (!c.getAttribute('data-status')) {
      var t = c.querySelector('.evt-date-tag');
      c.setAttribute('data-status', t ? statusOf(t.getAttribute('data-start'), t.getAttribute('data-end'), false) : 'upcoming');
    }
  });
  finish();

  /* ---- sync with the events page ------------------------------------------ */
  if (!window.fetch || !window.DOMParser) return;
  fetch('/event', { cache: 'no-cache', credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'text/html');
      var src = doc.getElementById('evt-grid');
      if (!src) return;
      var items = $$('article.evt-card', src).map(function (a) {
        var sold = a.getAttribute('data-sold') === 'true' || a.classList.contains('is-sold');
        return { el: a, start: a.getAttribute('data-start'), status: statusOf(a.getAttribute('data-start'), a.getAttribute('data-end'), sold) };
      }).filter(function (x) { return x.start && (x.status === 'upcoming' || x.status === 'ongoing'); });
      items.sort(function (a, b) { return ms(a.start, false) - ms(b.start, false); });
      var sig = items.map(function (x) { var th = x.el.querySelector('.evt-card-thumb'); return (th ? th.getAttribute('href') : '') + '|' + x.start; }).join(',');
      var have = allCards().filter(function (c) { return c.getAttribute('data-status') !== 'past'; }).map(function (c) {
        var t = c.querySelector('.evt-date-tag'), th = c.querySelector('.home-evt-thumb');
        return (th ? th.getAttribute('href') : '') + '|' + (t ? t.getAttribute('data-start') : '');
      });
      if (!items.length || sig === have.join(',')) return; // already current
      var frag = document.createDocumentFragment();
      items.forEach(function (x) {
        var c = build(x.el);
        c.setAttribute('data-status', x.status);
        frag.appendChild(c);
      });
      grid.innerHTML = '';
      grid.appendChild(frag);
      finish();
    })
    .catch(function () { /* offline or blocked: the static cards stay */ });
})();


}catch(e){console.warn('page script', e);}