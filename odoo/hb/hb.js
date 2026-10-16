/* HummingBeing on Odoo - built from hummingbeing-website (main) */
;
/* HummingBeing — scripts.js v6 */

// ── Button ripple on click ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.hb-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var r = document.createElement('span');
      r.className = 'btn-ripple';
      var rect = btn.getBoundingClientRect();
      r.style.left = (e.clientX - rect.left) + 'px';
      r.style.top  = (e.clientY - rect.top)  + 'px';
      btn.appendChild(r);
      r.addEventListener('animationend', function() { r.remove(); });
    });
  });
});

// ── Scroll progress bar ───────────────────────────────────────────────────
;(function() {
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var scrolled = window.scrollY;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (total > 0 ? scrolled / total : 0) + ')';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ── Transparent → solid nav on scroll + hide on scroll-down ───────────────
;(function() {
  var lastY = 0;
  function updateNav() {
    var y = window.scrollY;
    var nav = document.querySelector('nav');
    var topBtn = document.querySelector('.top-float');
    if (nav) {
      if (y > 60) nav.classList.add('scrolled');
      else        nav.classList.remove('scrolled');
      var dropdownOpen = !!document.querySelector('.nav-dropdown.dropdown-open');
      if (dropdownOpen) {
        nav.classList.remove('nav-hidden');
      } else if (y > lastY && y > 80) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
    }
    if (topBtn) {
      if (y > 400) topBtn.classList.add('visible');
      else         topBtn.classList.remove('visible');
    }
    lastY = y;
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// ── Mobile menu ────────────────────────────────────────────────────────────
function toggleMenu() {
  const ul  = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  const open = ul.classList.toggle('nav-open');
  btn.classList.toggle('open', open);
  if (!open) {
    document.querySelectorAll('.nav-dropdown').forEach(function(d) {
      d.classList.remove('dropdown-open');
    });
  }
}

document.addEventListener('click', function(e) {
  const nav = document.querySelector('nav');
  if (!nav || nav.contains(e.target)) return;
  const ul  = document.querySelector('.nav-links');
  const btn = document.querySelector('.hamburger');
  if (ul)  ul.classList.remove('nav-open');
  if (btn) btn.classList.remove('open');
  document.querySelectorAll('.nav-dropdown').forEach(function(d) {
    d.classList.remove('dropdown-open');
  });
});

// ── Services dropdown ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var nav = document.querySelector('nav');
  document.querySelectorAll('.nav-dropdown-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      var dropdown = this.closest('.nav-dropdown');
      var opening = !dropdown.classList.contains('dropdown-open');
      document.querySelectorAll('.nav-dropdown').forEach(function(d) {
        d.classList.remove('dropdown-open');
      });
      if (opening) {
        dropdown.classList.add('dropdown-open');
        if (nav) nav.classList.remove('nav-hidden');
      }
    });
  });
  document.querySelectorAll('.nav-dropdown-menu a').forEach(function(link) {
    link.addEventListener('click', function() {
      document.querySelectorAll('.nav-dropdown').forEach(function(d) {
        d.classList.remove('dropdown-open');
      });
    });
  });
});

// ── Scroll animations ──────────────────────────────────────────────────────
var animObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

function hasAnim(el) {
  return el.classList.contains('anim-up') || el.classList.contains('anim-left') ||
         el.classList.contains('anim-right') || el.classList.contains('anim-scale') ||
         el.classList.contains('anim-fade') || el.classList.contains('anim-line');
}

document.addEventListener('DOMContentLoaded', function() {

  // Cards in cards-grid — staggered
  document.querySelectorAll('.cards-grid .hb-card').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i % 3 * 0.11) + 's';
    animObserver.observe(el);
  });

  // Standalone cards (not inside cards-grid)
  document.querySelectorAll('.hb-card:not(.cards-grid .hb-card)').forEach(function(el, i) {
    if (!hasAnim(el)) {
      el.classList.add('anim-up');
      el.style.transitionDelay = (i % 4 * 0.1) + 's';
      animObserver.observe(el);
    }
  });

  // Steps — staggered fade-up
  document.querySelectorAll('.steps .step').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i * 0.11) + 's';
    animObserver.observe(el);
  });

  // Step number circles — scale-bounce in, slightly after their parent
  document.querySelectorAll('.step-num').forEach(function(el, i) {
    if (!hasAnim(el)) {
      el.classList.add('anim-scale');
      el.style.transitionDelay = (i * 0.11 + 0.12) + 's';
      animObserver.observe(el);
    }
  });

  // Testimonials — staggered fade-up
  document.querySelectorAll('.testimonial, .testimonial-light').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i % 3 * 0.1) + 's';
    animObserver.observe(el);
  });

  // Social / platform cards
  document.querySelectorAll('.platform-hero, .social-card').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i % 4 * 0.1) + 's';
    animObserver.observe(el);
  });

  // Two-col: text from right, image from left
  document.querySelectorAll('.two-col-text').forEach(function(el) {
    el.classList.add('anim-right');
    animObserver.observe(el);
  });
  document.querySelectorAll('.two-col-image').forEach(function(el) {
    el.classList.add('anim-left');
    animObserver.observe(el);
  });

  // Section center headers (eyebrow + h2 as a unit)
  document.querySelectorAll('.section-header-center').forEach(function(el) {
    if (!hasAnim(el)) {
      el.classList.add('anim-up');
      animObserver.observe(el);
    }
  });

  // Dividers — draw in from left
  document.querySelectorAll('.divider').forEach(function(el) {
    if (!hasAnim(el)) {
      el.classList.add('anim-line');
      animObserver.observe(el);
    }
  });

  // Feature list items — staggered
  document.querySelectorAll('.feature-list li').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i * 0.08) + 's';
    animObserver.observe(el);
  });

  // Info strip items (isabelle page)
  document.querySelectorAll('.info-strip-item').forEach(function(el, i) {
    if (!hasAnim(el)) {
      el.classList.add('anim-up');
      el.style.transitionDelay = (i * 0.12) + 's';
      animObserver.observe(el);
    }
  });

  // CTA banners
  document.querySelectorAll('.cta-banner').forEach(function(el) {
    if (!hasAnim(el)) {
      el.classList.add('anim-up');
      animObserver.observe(el);
    }
  });

  // Stats
  document.querySelectorAll('.stat-item').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i * 0.1) + 's';
    animObserver.observe(el);
  });

  // Event cards
  document.querySelectorAll('.event-card, .event-featured').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i % 3 * 0.1) + 's';
    animObserver.observe(el);
  });

  // Resource rows (socials page)
  document.querySelectorAll('.resource-row').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i * 0.07) + 's';
    animObserver.observe(el);
  });

  // Changelog entries
  document.querySelectorAll('.cl-entry').forEach(function(el, i) {
    el.classList.add('anim-up');
    el.style.transitionDelay = (i % 5 * 0.08) + 's';
    animObserver.observe(el);
  });

});

;

// ════════════════════════════════════════════════════════════════════════
// INTERACTIVE LAYER — 2026-09-29 (styles in styles.css, same heading)
// buttons · mobile menu · journey steps · philosophy cards · hummingbird
// ════════════════════════════════════════════════════════════════════════
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function lum(rgb) {
    var m = (rgb || '').match(/[\d.]+/g); if (!m) return 1;
    var c = m.slice(0, 3).map(function (v) { v = v / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function alpha(rgb) { var m = (rgb || '').match(/[\d.]+/g); return m && m.length > 3 ? +m[3] : 1; }
  // Dark or light surface behind an element: nearest opaque background colour, else
  // anything painting an image/video (hero photos and videos count as dark).
  function onDark(el) {
    for (var e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/gradient/.test(cs.backgroundImage)) return true;
      if (e.querySelector(':scope > video, :scope > .hero-video, :scope > canvas')) return true;
      if (alpha(cs.backgroundColor) > .5) return lum(cs.backgroundColor) < .35;
      if (/gradient/.test(cs.backgroundImage)) {
        var cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).filter(function (c) { return alpha(c) >= .5; });
        if (cols.length) { var avg = cols.reduce(function (t, c) { return t + lum(c); }, 0) / cols.length; return avg < .35; }
      }
    }
    return false;
  }

  /* ---------- buttons ---------- */
  function initButtons() {
    document.querySelectorAll('.hb-btn, .nav-cta').forEach(function (b) {
      if (b.dataset.hbBtn) return; b.dataset.hbBtn = '1';
      var inert = b.classList.contains('btn-soldout') || b.classList.contains('btn-ended');
      if (b.classList.contains('hb-btn')) b.classList.add(onDark(b) ? 'on-dark' : 'on-light');
      if (!inert && b.classList.contains('hb-btn') && b.tagName === 'A' && !b.querySelector('.btn-arr, i, svg')) {
        var lt = b.lastChild; if (lt && lt.nodeType === 3) { lt.nodeValue = lt.nodeValue.replace(/\s*[\u2192\u279C\u27F6]\s*$/, ''); } var s = document.createElement('span'); s.className = 'btn-arr'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = ARROW; b.appendChild(s);
      }
      if (inert) return;
      b.addEventListener('pointerdown', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
        b.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      if (!fine) return;
      b.addEventListener('pointerenter', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
        b.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      if (reduce) return;
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.setProperty('--mx', (dx * .18).toFixed(1) + 'px');
        b.style.setProperty('--my', (dy * .28).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
        b.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
        b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var nav = document.querySelector('nav'), ul = document.querySelector('.nav-links'), btn = document.querySelector('.hamburger');
    if (!nav || !ul || !btn) return;
    btn.setAttribute('aria-label', 'Open menu'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'site-menu');
    if (!ul.id) ul.id = 'site-menu';
    if (!ul.querySelector('.nav-extra')) {
      var li = document.createElement('li'); li.className = 'nav-extra';
      li.innerHTML =
        '<div class="ne-row"><a href="mailto:bonjour@bhdasia.com"><i class="fa-regular fa-envelope"></i>bonjour@bhdasia.com</a>' +
        '<a href="https://wa.me/818065151778" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>WhatsApp</a></div>' +
        '<div class="ne-soc">' +
        '<a href="https://www.instagram.com/isabelleclausteixeira_bhd/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
        '<a href="https://www.linkedin.com/in/isabelleclausteixeira/" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>' +
        '<a href="https://www.youtube.com/@IsabelleClausTeixeira" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a></div>';
      ul.appendChild(li);
    }
    function set(open) {
      ul.classList.toggle('nav-open', open); btn.classList.toggle('open', open);
      nav.classList.toggle('menu-open', open); document.body.classList.toggle('menu-lock', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { nav.classList.remove('nav-hidden'); var f = ul.querySelector('a'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350); }
      else document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.classList.remove('dropdown-open'); });
    }
    window.toggleMenu = function () { set(!ul.classList.contains('nav-open')); };
    ul.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a || a.classList.contains('nav-dropdown-toggle')) return;
      if (window.innerWidth <= 900) set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ul.classList.contains('nav-open')) { set(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && ul.classList.contains('nav-open')) set(false); });
  }

  /* ---------- journey steps ---------- */
  function initSteps() {
    document.querySelectorAll('.steps').forEach(function (wrap) {
      var steps = [].slice.call(wrap.querySelectorAll(':scope > .step')); if (steps.length < 2) return;
      wrap.classList.add('steps-live');
      wrap.style.setProperty('--n', steps.length);
      var track = document.createElement('div'); track.className = 'steps-track'; track.setAttribute('aria-hidden', 'true'); track.innerHTML = '<i></i><b></b>';
      wrap.insertBefore(track, wrap.firstChild);
      var pinned = -1;
      steps.forEach(function (s, i) {
        s.tabIndex = 0;
        var on = function () { pinned = i; paint(i + 1, i); };
        s.addEventListener('mouseenter', on); s.addEventListener('focus', on); s.addEventListener('click', on);
      });
      wrap.addEventListener('mouseleave', function () { pinned = -1; scroll(); });
      function paint(litCount, current) {
        steps.forEach(function (s, i) { s.classList.toggle('lit', i < litCount); s.classList.toggle('is-on', i === current); });
        var p = steps.length > 1 ? Math.max(0, Math.min(1, (litCount - 1) / (steps.length - 1))) : 0;
        wrap.style.setProperty('--p', litCount ? p.toFixed(3) : 0);
      }
      function scroll() {
        if (pinned > -1) return;
        var r = wrap.getBoundingClientRect(), vh = window.innerHeight;
        var prog = Math.max(0, Math.min(1, (vh * .82 - r.top) / (r.height + vh * .25)));
        var n = reduce ? steps.length : Math.round(prog * steps.length);
        paint(n, n - 1);
      }
      window.addEventListener('scroll', scroll, { passive: true }); scroll();
    });
  }

  /* ---------- philosophy cards ---------- */
  function initPhilo() {
    var rows = document.querySelectorAll('.philo-row'); if (!rows.length) return;
    var sec = rows[0].closest('section') || rows[0].parentElement;
    sec.classList.add('philo-live');
    sec.querySelectorAll('.philo-item').forEach(function (c) {
      c.addEventListener('pointerenter', function () { sec.classList.add('has-hover'); });
      c.addEventListener('pointerleave', function () { sec.classList.remove('has-hover'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
      if (!fine) return;
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--sx', (x * 100) + '%'); c.style.setProperty('--sy', (y * 100) + '%');
        if (!reduce) { c.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg'); }
      });
    });
    if (!fine) { // on touch, light each card as it crosses the middle of the screen
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { en.target.classList.toggle('is-on', en.isIntersecting); }); }, { rootMargin: '-45% 0px -45% 0px' });
      sec.querySelectorAll('.philo-item').forEach(function (c) { io.observe(c); });
    }
  }

  /* ---------- hummingbird section ---------- */
  function initBird() {
    var sec = document.querySelector('.hb-bird'); if (!sec) return;
    var h2 = sec.querySelector('h2');
    if (h2 && !h2.querySelector('.w')) {
      var k = 0;
      h2.innerHTML = h2.innerHTML.split(/(<br\s*\/?>)/i).map(function (part) {
        return /^<br/i.test(part) ? part : part.split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) || !w ? w : '<span class="w" style="transition-delay:' + (k++ * 70) + 'ms">' + w + '</span>'; }).join('');
      }).join('');
    }
    new IntersectionObserver(function (es, o) { es.forEach(function (en) { if (en.isIntersecting) { sec.classList.add('in'); countUp(); o.disconnect(); } }); }, { threshold: .3 }).observe(sec);
    var tagNum = sec.querySelector('.hb-tag b');
    function countUp() {
      if (!tagNum) return; var end = 200, t0 = performance.now(), d = reduce ? 0 : 1600;
      (function t(now) { var p = d ? Math.min(1, (now - t0) / d) : 1; tagNum.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(t); })(t0);
    }
    var fig = sec.querySelector('.two-col-image');
    if (fig && fine && !reduce) {
      fig.addEventListener('pointermove', function (e) {
        var r = fig.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        fig.style.setProperty('--rx', ((.5 - y) * 5).toFixed(2) + 'deg'); fig.style.setProperty('--ry', ((x - .5) * 7).toFixed(2) + 'deg');
        fig.style.setProperty('--px', ((.5 - x) * 18).toFixed(1) + 'px'); fig.style.setProperty('--py', ((.5 - y) * 14).toFixed(1) + 'px');
        fig.style.setProperty('--gx', (x * 100) + '%'); fig.style.setProperty('--gy', (y * 100) + '%');
      });
      fig.addEventListener('pointerleave', function () { ['--rx', '--ry'].forEach(function (p) { fig.style.setProperty(p, '0deg'); }); ['--px', '--py'].forEach(function (p) { fig.style.setProperty(p, '0px'); }); });
    }
    // wing-beat wave: calm by default, "stress" button speeds it up and makes it ragged
    var path = sec.querySelector('.hb-wave path.live'), ctl = sec.querySelector('.hb-wave-ctl button'), lbl = sec.querySelector('.hb-wave-ctl span');
    if (!path) return;
    var stressed = false, amp = 12, freq = 3, jit = 0, ph = 0, raf = 0, visible = false;
    function draw() {
      ph += stressed ? .16 : .045;
      var d = '';
      for (var x = 0; x <= 420; x += 6) {
        var y = 23 + Math.sin(x / 420 * Math.PI * 2 * freq + ph) * amp * Math.sin(x / 420 * Math.PI) + (jit ? (Math.random() - .5) * jit : 0);
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      path.setAttribute('d', d);
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; cancelAnimationFrame(raf); if (visible) draw(); }).observe(sec);
    draw();
    if (ctl) ctl.addEventListener('click', function () {
      stressed = !stressed; amp = stressed ? 18 : 12; freq = stressed ? 9 : 3; jit = stressed ? 7 : 0;
      ctl.setAttribute('aria-pressed', stressed ? 'true' : 'false');
      ctl.innerHTML = stressed ? '<svg viewBox="0 0 24 24"><path d="M3 12c3-6 6-6 9 0s6 6 9 0"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M2 12h3l2-6 4 12 3-9 2 3h6"/></svg>';
      if (lbl) lbl.textContent = stressed ? 'This is stress: fast and ragged. Tap to release it.' : 'This is a regulated system: steady and calm. Tap to see stress.';
      if (reduce) draw();
    });
  }

  function start() { initButtons(); initMenu(); initSteps(); initPhilo(); initBird(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.hbInitButtons = initButtons; // for content injected later (event grids, countdown)
})();

// ==========================================================================
// EVENT PAGES (.ce-*) INTERACTIVE LAYER — 2026-09-29 (styles in styles.css)
// Every event detail page on the .ce-* template: hero parallax + glow,
// scroll reveals, poster tilt, live status chip, past-event notice, live
// "Other upcoming events" and a phone booking bar. Status and related
// events are read from events.html so they never go stale.
// ==========================================================================
(function () {
  'use strict';
  var hero = document.querySelector('.ce-hero');
  if (!hero) return;
  var body = document.body;
  body.classList.add('ce-live');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function ms(d, end) { return d ? Date.parse(d + (end ? 'T23:59:59' : 'T00:00:00') + '+08:00') : NaN; }
  function statusOf(start, end, sold) {
    var now = Date.now(), s = ms(start, false), e = ms(end || start, true);
    if (sold) return 'sold';
    if (!isNaN(e) && e < now) return 'past';
    if (!isNaN(s) && s <= now) return 'ongoing';
    return 'upcoming';
  }
  function whenText(st, start, end) {
    if (st === 'sold') return 'Sold out';
    if (st === 'past') return 'This event has passed';
    if (st === 'ongoing') return (end && end !== start) ? 'Happening now' : 'Happening today';
    var d = Math.ceil((ms(start, false) - Date.now()) / 864e5);
    return d <= 1 ? 'Starts tomorrow' : 'Starts in ' + d + ' days';
  }
  function slug(h) { var p = (h || '').split('#')[0].split('?')[0]; var m = p.match(/\/event\/([^\/]+)/); return m ? m[1] : p.replace(/^.*\//, '').replace(/\.html$/, ''); }
  var here = slug(location.pathname) || 'index';

  /* ---- hero: parallax background + pointer glow --------------------------- */
  var bg = $('.ce-bg', hero);
  var glow = document.createElement('span'); glow.className = 'ce-glow'; glow.setAttribute('aria-hidden', 'true');
  hero.insertBefore(glow, $('.ce-hero-inner', hero));
  if (!still()) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.scrollY || 0;
        if (bg && y < hero.offsetHeight + 200) bg.style.setProperty('--ce-py', (y * .22).toFixed(1) + 'px');
      });
    }, { passive: true });
    if (mqFine.matches) hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--ce-gx', (x * 100).toFixed(1) + '%');
      hero.style.setProperty('--ce-gy', (y * 100).toFixed(1) + '%');
      if (bg) bg.style.setProperty('--ce-px', ((.5 - x) * 18).toFixed(1) + 'px');
    });
  }

  /* ---- scroll reveal -------------------------------------------------------- */
  var groups = ['.ce-facts-grid', '.ce-main > *', '.ce-list > li', '.ce-side > .ce-box', '.ce-people > .ce-person', '.ce-sched > *', '.ce-prep', '.ce-related h2', '.ce-rel-grid > .ce-rel'];
  function mark(root) {
    groups.forEach(function (sel) {
      $$(sel, root).forEach(function (el) {
        if (el.classList.contains('ce-rv') || el.closest('.ce-hero')) return;
        var sib = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
        el.style.setProperty('--ce-d', Math.min(sib, 6) * 70 + 'ms');
        el.classList.add('ce-rv');
        if (io) io.observe(el); else el.classList.add('ce-in');
      });
    });
  }
  var io = (!still() && 'IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ce-in'); io.unobserve(en.target); } });
  }, { threshold: .1, rootMargin: '0px 0px -5% 0px' }) : null;
  mark(document);

  /* ---- poster tilt + people spotlight --------------------------------------- */
  var poster = $('.ce-poster');
  if (poster && mqFine.matches && !still()) {
    poster.addEventListener('pointermove', function (e) {
      var r = poster.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      poster.classList.add('ce-tilt');
      poster.style.setProperty('--ce-rx', ((.5 - y) * 5).toFixed(2) + 'deg');
      poster.style.setProperty('--ce-ry', ((x - .5) * 7).toFixed(2) + 'deg');
    });
    poster.addEventListener('pointerleave', function () {
      poster.classList.remove('ce-tilt'); poster.style.setProperty('--ce-rx', '0deg'); poster.style.setProperty('--ce-ry', '0deg');
    });
  }
  $$('.ce-person').forEach(function (p) {
    p.addEventListener('pointermove', function (e) {
      var r = p.getBoundingClientRect();
      p.style.setProperty('--ce-mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      p.style.setProperty('--ce-my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });

  /* ---- phone booking bar ---------------------------------------------------- */
  var cta = $('.ce-hero-actions a.hb-btn-primary');
  var bar = null, barSub = null;
  function buildBar(sub) {
    if (!cta || bar) return;
    var h1 = $('h1', hero);
    bar = document.createElement('div'); bar.className = 'ce-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Book this event');
    var t = document.createElement('div'); t.className = 'ce-bar-t';
    var b = document.createElement('b'); b.textContent = h1 ? h1.textContent.trim() : document.title;
    barSub = document.createElement('span'); barSub.textContent = sub || '';
    t.appendChild(b); t.appendChild(barSub); bar.appendChild(t);
    var btn = cta.cloneNode(true); btn.removeAttribute('id'); btn.removeAttribute('data-hb-btn'); btn.classList.remove('on-dark', 'on-light'); $$('.btn-arr', btn).forEach(function (a) { a.remove(); });
    var lbl = btn.textContent.replace(/[→\s]+$/, '').trim();
    if (lbl.length > 18) btn.textContent = /zoom/i.test(lbl) ? 'Join on Zoom' : 'Register';
    bar.appendChild(btn);
    body.appendChild(bar);
    var heroOut = false, blockers = 0;
    function upd() { body.classList.toggle('ce-bar-on', heroOut && blockers === 0); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; upd(); }).observe(hero);
      var seen = new Map();
      var bo = new IntersectionObserver(function (es) {
        es.forEach(function (en) { seen.set(en.target, en.isIntersecting); });
        blockers = 0; seen.forEach(function (v) { if (v) blockers++; }); upd();
      }, { threshold: .15 });
      $$('.ce-side, #reserve, footer').forEach(function (el) { bo.observe(el); });
    }
    if (window.hbInitButtons) window.hbInitButtons();
  }

  /* ---- sync with events.html ------------------------------------------------ */
  function afterData(items) {
    var mine = items.filter(function (x) { return x.slug === here; })[0];
    var badges = $('.ce-badges', hero);
    var already = badges && /pass|ended|sold/i.test(badges.textContent);
    if (mine && badges && !already && !$('.ce-status', badges)) {
      var chip = document.createElement('span');
      chip.className = 'ce-badge ce-status is-' + mine.status;
      chip.textContent = whenText(mine.status, mine.start, mine.end);
      badges.appendChild(chip);
    }
    var past = mine && mine.status === 'past';
    if (past && !$('.ce-past-note')) {
      var note = document.createElement('div'); note.className = 'ce-past-note';
      note.innerHTML = '<div><p><i class="fa-solid fa-circle-info" aria-hidden="true"></i>This event has already taken place.</p><a href="/event" class="hb-btn hb-btn-primary">See upcoming events</a></div>';
      var facts = $('.ce-facts');
      (facts || hero).parentNode.insertBefore(note, (facts || hero).nextSibling);
    }
    if (!past && (!mine || mine.status !== 'sold')) buildBar(mine ? whenText(mine.status, mine.start, mine.end) : (($('.ce-fact span') || {}).textContent || ''));

    var grid = $('.ce-rel-grid');
    if (grid) {
      var next = items.filter(function (x) { return x.slug !== here && (x.status === 'upcoming' || x.status === 'ongoing'); })
        .sort(function (a, b) { return ms(a.start, false) - ms(b.start, false); }).slice(0, 3);
      if (next.length) {
        grid.innerHTML = '';
        next.forEach(function (x) {
          var a = document.createElement('a'); a.className = 'ce-rel'; a.href = x.href;
          if (x.img) { var im = document.createElement('img'); im.src = x.img; im.alt = x.alt || x.title; im.loading = 'lazy'; im.decoding = 'async'; a.appendChild(im); }
          var b = document.createElement('div'); b.className = 'b';
          var st = document.createElement('strong'); st.textContent = x.title;
          var sp = document.createElement('span'); sp.className = 'ce-rel-meta'; sp.textContent = [x.loc, x.date].filter(Boolean).join(' · ');
          var w = document.createElement('span'); w.className = 'ce-rel-when'; w.textContent = whenText(x.status, x.start, x.end);
          b.appendChild(st); b.appendChild(sp); b.appendChild(w); a.appendChild(b); grid.appendChild(a);
        });
        var inner = grid.parentNode;
        if (!$('.ce-rel-all', inner)) {
          var all = document.createElement('p'); all.className = 'ce-rel-all';
          all.innerHTML = '<a href="/event" class="hb-btn btn-outline">See all events</a>';
          inner.appendChild(all);
        }
        mark(inner);
      }
    }
    if (window.hbInitButtons) window.hbInitButtons();
  }

  if (!window.fetch || !window.DOMParser) { buildBar(''); return; }
  fetch('/event', { cache: 'no-cache', credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'text/html');
      var items = [];
      ['evt-grid', 'evt-archive'].forEach(function (id) {
        var box = doc.getElementById(id); if (!box) return;
        $$('article.evt-card', box).forEach(function (c) {
          var th = $('.evt-card-thumb', c), img = th && $('img', th), h3 = $('h3', c), loc = $('.evt-tag.loc', c), dt = $('.evt-date-tag', c);
          var sold = c.getAttribute('data-sold') === 'true' || c.classList.contains('is-sold');
          var start = c.getAttribute('data-start'), end = c.getAttribute('data-end');
          if (!th || !start) return;
          items.push({
            href: th.getAttribute('href'), slug: slug(th.getAttribute('href')), img: img ? img.getAttribute('src') : '', alt: img ? img.getAttribute('alt') : '',
            title: h3 ? h3.textContent.trim() : '', loc: loc ? loc.textContent.trim() : '', date: dt ? dt.textContent.trim() : '',
            start: start, end: end, status: statusOf(start, end, sold)
          });
        });
      });
      afterData(items);
    })
    .catch(function () { buildBar(''); });
})();

// ==========================================================================
// AUTO-ADVANCE ENGINE — 2026-09-29
// Every tab set, one-at-a-time button group, "next" carousel and swipe
// track on the site moves to its next item every 3 s and loops.
// Pauses while the pointer is over the section or focus is inside it,
// holds 8 s after the visitor taps / clicks / swipes / types there, only
// counts while the component is on screen and the tab is visible, and the
// count restarts from zero when it resumes. Off for prefers-reduced-motion.
// Opt a component out with data-hb-auto="off" on it or an ancestor.
// ==========================================================================
(function () {
  'use strict';
  var STEP = 3000, HOLD = 8000;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var drivers = [], claimed = [];
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function shown(el) { return !!(el && el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden'; }
  function excluded(el) {
    if (!el || el.closest('[data-hb-auto="off"], nav, footer, [role="dialog"], [aria-modal="true"], .ecx, .hb-chat-win')) return true;
    var lab = ((el.getAttribute('aria-label') || '') + ' ' + (el.className || '') + ' ' + ((el.closest('[aria-label]') || {}).getAttribute ? el.closest('[aria-label]').getAttribute('aria-label') : '')).toLowerCase();
    return /filter|evt-filter|hx-evf|ev-views|accordion|faq|bk-switch/.test(lab);
  }
  function isClaimed(el) { return claimed.some(function (c) { return c === el || c.contains(el) || el.contains(c); }); }
  function rootOf(el) { return el.closest('section, article, .ce-layout, main > div') || el.parentElement; }

  function add(kind, el, next) {
    if (isClaimed(el)) return;
    claimed.push(el);
    var d = { kind: kind, el: el, root: rootOf(el), next: next, t: 0, vis: false, hover: false, focus: false, holdUntil: 0, engineAt: 0 };
    var r = d.root;
    r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') d.hover = true; });
    r.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { d.hover = false; d.t = 0; } });
    r.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) d.focus = true; });
    r.addEventListener('focusout', function (e) { if (!r.contains(e.relatedTarget)) { d.focus = false; d.t = 0; } });
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      r.addEventListener(ev, function (e) { if (e.isTrusted) { d.holdUntil = Date.now() + HOLD; d.t = 0; } }, { passive: true });
    });
    if (kind === 'track') el.addEventListener('scroll', function () { if (Date.now() - d.engineAt > 900) { d.holdUntil = Date.now() + HOLD; d.t = 0; } }, { passive: true });
    io.observe(el);
    drivers.push(d);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { drivers.forEach(function (d) { if (d.el === en.target) { d.vis = en.intersectionRatio >= .35; if (!d.vis) d.t = 0; } }); });
  }, { threshold: [0, .35, .6] });

  function clickNext(list) {
    var items = list.filter(shown);
    if (items.length < 2) return false;
    var cur = items.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-current') === 'true'; });
    items[(cur + 1) % items.length].click();
    return true;
  }

  function scan() {
    // 1. tab sets
    $$('[role="tablist"]').forEach(function (tl) {
      if (excluded(tl)) return;
      var tabs = $$('[role="tab"]', tl);
      if (tabs.length < 2) return;
      add('tabs', tl, function () { return clickNext($$('[role="tab"]', tl).filter(function (t) { return !t.disabled && t.getAttribute('aria-disabled') !== 'true'; })); });
    });
    // 2. one-at-a-time button groups (exactly one pressed)
    var seen = [];
    $$('button[aria-pressed]').forEach(function (b) {
      var g = b.parentElement;
      if (seen.indexOf(g) > -1) return; seen.push(g);
      var bs = $$(':scope > button[aria-pressed]', g);
      if (bs.length < 3 || excluded(g)) return;
      if (bs.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length !== 1) return;
      add('group', g, function () { return clickNext($$(':scope > button[aria-pressed]', g)); });
    });
    // 3. swipe tracks (scroll-snap rows), including those driven by prev/next buttons
    $$('body *').forEach(function (el) {
      if (el.children.length < 2 || excluded(el) || el.querySelector('[role="tab"]')) return;
      var cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowX) || cs.scrollSnapType === 'none' || /tablist/.test(el.getAttribute('role') || '')) return;
      if (el.scrollWidth <= el.clientWidth + 8) return;
      add('track', el, function () {
        if (el.scrollWidth <= el.clientWidth + 8) return false;
        var kids = [].filter.call(el.children, shown);
        var step = kids.length > 1 ? (kids[1].offsetLeft - kids[0].offsetLeft) : el.clientWidth;
        var d = drivers.filter(function (x) { return x.el === el; })[0]; if (d) d.engineAt = Date.now();
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 6) el.scrollTo({ left: 0, behavior: 'smooth' });
        else el.scrollBy({ left: step, behavior: 'smooth' });
        return true;
      });
    });
    // 4. carousels with a "Next" button but no tabs / track
    $$('button[aria-label^="Next"], button[data-q="1"], button[data-dir="1"]').forEach(function (b) {
      var box = b.closest('section, article, [class*="carousel"], [class*="slider"]') || b.parentElement;
      var ctl = b.getAttribute('aria-controls') && document.getElementById(b.getAttribute('aria-controls'));
      if (excluded(b) || b.closest('.hx-q') || isClaimed(box) || (ctl && isClaimed(ctl))) return;
      add('next', box, function () {
        if (!shown(b)) return false;
        if (b.disabled) { var prev = box.querySelector('button[aria-label^="Prev"], button[data-dir="-1"]'); var n = 30; while (prev && !prev.disabled && n--) prev.click(); return true; }
        b.click(); return true;
      });
    });
  }

  var last = Date.now();
  function tick() {
    var now = Date.now(), dt = Math.min(now - last, 500); last = now;
    if (document.hidden) return;
    drivers.forEach(function (d) {
      var live = d.vis && !d.hover && !d.focus && now >= d.holdUntil && shown(d.el);
      if (!live) { d.t = 0; return; }
      d.t += dt;
      if (d.t >= STEP) { d.t = 0; d.engineAt = now; try { d.next(); } catch (e) {} }
    });
  }
  function start() {
    scan();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(scan, 800); });
    setInterval(tick, 200);
    document.addEventListener('visibilitychange', function () { drivers.forEach(function (d) { d.t = 0; }); last = Date.now(); });
    window.hbAuto = { state: function () { return drivers.map(function (d) { return d.kind + ' vis:' + d.vis + ' hover:' + d.hover + ' focus:' + d.focus + ' hold:' + Math.max(0, d.holdUntil - Date.now()) + ' t:' + d.t; }); }, list: function () { return drivers.map(function (d) { return d.kind + ':' + (d.el.id || d.el.className || d.el.tagName).toString().slice(0, 40); }); }, rescan: scan };
  }
  // scripts.js is deferred, so every page script has already built its components here
  setTimeout(start, 400);
  window.addEventListener('load', function () { setTimeout(function () { if (window.hbAuto) window.hbAuto.rescan(); }, 800); });
})();
;

/* Next-event countdown — DYNAMIC and interactive.
   Picks the earliest event that is neither past nor sold out, lets visitors switch
   to the other upcoming events, rolls each digit, shows the visitor's local time
   and offers an .ics "Add to calendar". Add/flag events in EVENTS below. */
(function(){
  var EVENTS=[].map.call(document.querySelectorAll('#xev-data > i'),function(n){
    return {title:n.getAttribute('data-title'),sub:(n.querySelector('.s')||{}).innerHTML||'',metaCal:(n.querySelector('.c')||{}).innerHTML||'',
      metaLoc:n.getAttribute('data-loc'),metaIcon:n.getAttribute('data-icon'),date:n.getAttribute('data-date'),
      href:n.getAttribute('data-href'),soldOut:n.getAttribute('data-sold')==='1'};
  });
  var sec=document.getElementById('next-event'); if(!sec) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var now=Date.now();
  var list=EVENTS.filter(function(e){return !e.soldOut && new Date(e.date).getTime()>now;})
                 .sort(function(a,b){return new Date(a.date)-new Date(b.date);});
  if(!list.length){ sec.style.display='none'; return; }
  var cur=list[0], target=0, timer=0;
  var info=document.getElementById('ecx-info'), tiles=[].slice.call(sec.querySelectorAll('.ecx-tile'));
  function strip(t){ var d=document.createElement('div'); d.innerHTML=t; return (d.textContent||'').trim(); }
  function col(){ var c=document.createElement('span'); c.className='ecx-col'; var st=document.createElement('span'); st.className='ecx-strip';
    for(var i=0;i<10;i++){ var n=document.createElement('span'); n.textContent=i; st.appendChild(n); } c.appendChild(st); return c; }
  function setDigits(el,val,minLen){ var str=String(val); while(str.length<minLen) str='0'+str;
    while(el.children.length<str.length) el.insertBefore(col(),el.firstChild);
    while(el.children.length>str.length) el.removeChild(el.firstChild);
    for(var i=0;i<str.length;i++) el.children[i].firstChild.style.transform='translateY(-'+(+str[i]*1.15).toFixed(2)+'em)'; }
  function render(){
    document.getElementById('ecx-title').innerHTML=cur.title;
    document.getElementById('ecx-sub').innerHTML=cur.sub;
    document.getElementById('ecx-meta').innerHTML='<li><i class="fa-regular fa-calendar"></i>'+cur.metaCal+'</li><li><i class="'+cur.metaIcon+'"></i>'+cur.metaLoc+'</li>';
    document.getElementById('ecx-reg').setAttribute('href',cur.href);
    target=new Date(cur.date).getTime();
    var loc=document.getElementById('ecx-local');
    try{ var f=new Intl.DateTimeFormat(undefined,{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
      loc.innerHTML='<i class="fa-regular fa-clock"></i>In your time zone: <strong style="color:#fff;font-weight:700">&nbsp;'+f.format(new Date(target))+'</strong>'; }catch(e){ loc.textContent=''; }
    var chips=document.getElementById('ecx-chips'), wrap=document.getElementById('ecx-next');
    chips.innerHTML=''; wrap.hidden=list.length<2;
    list.slice(0,4).forEach(function(e){ var d=new Date(e.date); var b=document.createElement('button'); b.type='button'; b.className='ecx-chip';
      b.setAttribute('aria-pressed',e===cur?'true':'false');
      b.innerHTML='<b>'+d.getDate()+'</b><span>'+d.toLocaleString('en-GB',{month:'short'})+' &middot; '+strip(e.title).replace(/ \u2014 .*$/,'')+'</span>';
      b.addEventListener('click',function(){ if(e===cur) return; switchTo(e); }); chips.appendChild(b); });
    tick();
  }
  function switchTo(e){ if(reduce){ cur=e; render(); return; } info.classList.add('swap'); setTimeout(function(){ cur=e; render(); info.classList.remove('swap'); },260); }
  var lastSr='';
  function tick(){
    var diff=target-Date.now();
    if(diff<=0){ document.getElementById('ecx-tiles').innerHTML='<p class="ecx-now">It&#8217;s happening now &mdash; join us live.</p>'; clearInterval(timer); return; }
    var d=Math.floor(diff/864e5), h=Math.floor(diff%864e5/36e5), m=Math.floor(diff%36e5/6e4), s=Math.floor(diff%6e4/1e3);
    var vals={d:d,h:h,m:m,s:s}, max={d:Math.max(30,d+1),h:24,m:60,s:60};
    tiles.forEach(function(t){ var u=t.dataset.u; setDigits(t.querySelector('.ecx-num'),vals[u],2); t.style.setProperty('--f',(vals[u]/max[u]).toFixed(3)); });
    var sr=d+' days, '+h+' hours to go'; if(sr!==lastSr){ document.getElementById('ecx-sr').textContent=sr; lastSr=sr; }
  }
  document.getElementById('ecx-ics').addEventListener('click',function(){
    var st=new Date(cur.date), en=new Date(st.getTime()+2*36e5);
    function z(x){ return x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); }
    var url=new URL(cur.href,location.href).href;
    var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HummingBeing//Events//EN','BEGIN:VEVENT','UID:'+z(st)+'@hummingbeing.com','DTSTAMP:'+z(new Date()),
      'DTSTART:'+z(st),'DTEND:'+z(en),'SUMMARY:'+strip(cur.title),'DESCRIPTION:'+strip(cur.sub)+' \\n'+url,'LOCATION:'+strip(cur.metaLoc),'URL:'+url,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
    a.download=strip(cur.title).replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()+'.ics';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500);
  });
  if(fine && !reduce){
    sec.addEventListener('pointermove',function(e){ var r=sec.getBoundingClientRect();
      sec.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%'); sec.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%'); });
    tiles.forEach(function(t){ t.addEventListener('pointermove',function(e){ var r=t.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      t.style.setProperty('--rx',(y*-10).toFixed(1)+'deg'); t.style.setProperty('--ry',(x*12).toFixed(1)+'deg'); });
      t.addEventListener('pointerleave',function(){ t.style.setProperty('--rx','0deg'); t.style.setProperty('--ry','0deg'); }); });
  }
  render(); timer=setInterval(tick,1000);
  if(window.hbInitButtons) window.hbInitButtons();
})();

/* ===== Date-driven event status: runs fresh on every page load =====
   Each card carries data-start / data-end (ISO, SGT) and optional data-sold.
   Status -> badge (Upcoming/Ongoing/Sold Out/Passed), and passed and sold-out
   events are moved into the Past and Sold Out archive automatically. */
(function(){
  var now = Date.now();
  function ms(d, endOfDay){ return d ? Date.parse(d + (endOfDay ? 'T23:59:59' : 'T00:00:00') + '+08:00') : NaN; }
  var grid = document.getElementById('evt-grid');
  var archive = document.getElementById('evt-archive');

  // 1) colour the individual date pills (skip a manually fixed state, e.g. is-closed)
  document.querySelectorAll('.evt-date-tag').forEach(function(t){
    if(/is-(past|upcoming|ongoing|closed)/.test(t.className)) return;
    var em = ms(t.getAttribute('data-end') || t.getAttribute('data-start'), true);
    var sm = t.getAttribute('data-start') ? ms(t.getAttribute('data-start'), false) : em;
    if(isNaN(em)){ t.classList.add('is-upcoming'); return; }
    if(em < now) t.classList.add('is-past');
    else if(sm <= now && now <= em) t.classList.add('is-ongoing');
    else t.classList.add('is-upcoming');
  });

  var BADGE = { sold:['evt-sold-badge','Sold Out'], past:['evt-past-badge','Passed'],
                ongoing:['evt-ongoing-badge','Ongoing'], upcoming:['evt-upcoming-badge','Upcoming'] };

  function statusOf(card){
    if(card.getAttribute('data-sold') === 'true') return 'sold';
    var em = ms(card.getAttribute('data-end') || card.getAttribute('data-start'), true);
    var sm = card.getAttribute('data-start') ? ms(card.getAttribute('data-start'), false) : em;
    if(!isNaN(em) && em < now) return 'past';
    if(!isNaN(sm) && sm <= now && (isNaN(em) || now <= em)) return 'ongoing';
    return 'upcoming';
  }
  function setBadge(card, status){
    var thumb = card.querySelector('.evt-card-thumb'); if(!thumb) return;
    thumb.querySelectorAll('.evt-sold-badge,.evt-past-badge,.evt-ongoing-badge,.evt-upcoming-badge').forEach(function(b){ b.remove(); });
    card.classList.remove('is-sold','is-past');
    if(status === 'sold') card.classList.add('is-sold');
    if(status === 'past') card.classList.add('is-past');
    var m = BADGE[status]; if(!m) return;
    var b = document.createElement('span'); b.className = m[0]; b.textContent = m[1];
    thumb.insertBefore(b, thumb.firstChild);
  }
  function endActions(card){
    var actions = card.querySelector('.evt-card-actions'); if(!actions) return;
    if(actions.querySelector('.btn-ended')) return;
    var first = actions.querySelector('.hb-btn');
    var ended = document.createElement('span'); ended.className = 'hb-btn btn-ended'; ended.textContent = 'Event Ended';
    if(first) actions.replaceChild(ended, first);
  }

  // 2) badge + auto-place every card by its live status
  document.querySelectorAll('.evt-card').forEach(function(card){
    var status = statusOf(card);
    card.setAttribute('data-status', status);
    setBadge(card, status);
    if(status === 'past' || status === 'sold'){
      if(status === 'past') endActions(card);
      if(archive && card.parentElement !== archive) archive.appendChild(card);
    } else if(grid && card.parentElement !== grid){
      card.classList.remove('is-hidden');
      grid.appendChild(card);
    }
  });

  // 3) order the upcoming grid: soonest date first; sold-out pushed to the end
  if(grid){
    var order = { ongoing:0, upcoming:0, sold:1, past:2 };
    var live = [].slice.call(grid.querySelectorAll('.evt-card'));
    live.sort(function(a,b){
      var ga = order[a.getAttribute('data-status')] || 0, gb = order[b.getAttribute('data-status')] || 0;
      if(ga !== gb) return ga - gb;
      var sa = ms(a.getAttribute('data-start'), false), sb = ms(b.getAttribute('data-start'), false);
      if(isNaN(sa)) sa = Infinity; if(isNaN(sb)) sb = Infinity;
      return sa - sb;
    });
    live.forEach(function(c){ grid.appendChild(c); });
  }
  // 4) order the archive: sold-out first (soonest first), then passed (most recent first)
  if(archive){
    var arch = [].slice.call(archive.querySelectorAll('.evt-card'));
    arch.sort(function(a,b){
      var sa = a.getAttribute('data-status') === 'sold', sb = b.getAttribute('data-status') === 'sold';
      if(sa !== sb) return sa ? -1 : 1;
      if(sa) return ms(a.getAttribute('data-start'), false) - ms(b.getAttribute('data-start'), false);
      return ms(b.getAttribute('data-end') || b.getAttribute('data-start'), true) - ms(a.getAttribute('data-end') || a.getAttribute('data-start'), true);
    });
    arch.forEach(function(c){ archive.appendChild(c); });
  }
})();

;

/* ==========================================================================
   EVENTS LISTING (.ev) - runs after the date-status script above has badged
   the cards, moved passed events to #evt-archive and pushed sold-out cards to
   the back of #evt-grid. This adds: upcoming / past counts (count-up), filter
   pills (role=tablist) with live counts + sliding indicator + FLIP re-layout,
   a grid / by-month view, "Starts in N days" chips, pointer tilt + spotlight,
   scroll reveal and the swipeable past-events strip. Cards are never created
   or renamed here: the markup in #evt-grid / #evt-archive stays the source.
   ========================================================================== */
(function () {
  'use strict';
  var up = document.getElementById('events-grid');
  var past = document.getElementById('past-events');
  var grid = document.getElementById('evt-grid');
  var archive = document.getElementById('evt-archive');
  if (!up || !grid) return;
  [up, past].forEach(function (s) { if (s) s.classList.add('ev-js'); });

  var EASE = 'cubic-bezier(.23,1,.32,1)';
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var canAnim = typeof Element.prototype.animate === 'function';
  function still() { return mqReduce.matches || !canAnim; }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function ms(d, endOfDay) { return d ? Date.parse(d + (endOfDay ? 'T23:59:59' : 'T00:00:00') + '+08:00') : NaN; }
  var DAY = 864e5;
  var todaySG = Math.floor((Date.now() + 8 * 36e5) / DAY) * DAY - 8 * 36e5; /* SGT midnight today */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var base = $$('article.evt-card', grid);            /* live cards, in the status script's order */
  var pastCards = archive ? $$('article.evt-card', archive) : [];
  base.forEach(function (c, i) { c._evI = i; });

  /* ---- Date block + "Starts in N days" chip ------------------------------- */
  function decorate(card, live) {
    var th = card.querySelector('.evt-card-thumb'), st = card.getAttribute('data-start');
    if (!th || !st || th.querySelector('.ev-cal')) return;
    var p = st.split('-');
    if (p.length === 3) {
      var cal = document.createElement('span');
      cal.className = 'ev-cal'; cal.setAttribute('aria-hidden', 'true');
      cal.innerHTML = '<b>' + (+p[2]) + '</b><span>' + MON[+p[1] - 1] + '</span>';
      th.appendChild(cal);
    }
    if (!live) return;
    var days = Math.round((ms(st, false) - todaySG) / DAY);
    if (isNaN(days) || days < 0) return;                /* already under way */
    var txt = days === 0 ? 'Starts today' : days === 1 ? 'Starts tomorrow'
      : days < 60 ? 'Starts in ' + days + ' days' : 'Starts in ' + Math.round(days / 30.44) + ' months';
    var w = document.createElement('span');
    w.className = 'ev-when' + (days <= 14 ? ' ev-soon' : '');
    w.innerHTML = '<i class="fa-regular fa-clock" aria-hidden="true"></i><span>' + txt + '</span>';
    th.appendChild(w);
  }
  base.forEach(function (c) { decorate(c, !(c.classList.contains('is-sold') || c.getAttribute('data-sold') === 'true')); });
  pastCards.forEach(function (c) { decorate(c, false); });

  /* ---- Scroll reveal ------------------------------------------------------ */
  var hasIO = 'IntersectionObserver' in window;
  var revealIO = hasIO ? new IntersectionObserver(function (entries) {
    entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; })
      .forEach(function (e, i) {
        var el = e.target;
        if (el.classList.contains('ev-rc')) {
          el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
          setTimeout(function () { el.style.removeProperty('--d'); }, 1500);
        }
        el.classList.add('ev-in');
        revealIO.unobserve(el);
      });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  base.concat(pastCards).forEach(function (c) { c.classList.add('ev-rc'); });
  $$('.ev-rv, .ev-rc', up).concat(past ? $$('.ev-rv, .ev-rc', past) : []).forEach(function (el) {
    if (revealIO && !still()) revealIO.observe(el); else el.classList.add('ev-in');
  });

  /* ---- Counts: upcoming / past (count-up) ---------------------------------- */
  var upEl = document.getElementById('evt-count-up'), pastEl = document.getElementById('evt-count-past');
  var nUp = base.length, nPast = pastCards.length;
  function countTo(el, n, delay) {
    if (!el) return;
    if (still() || n < 2) { el.textContent = n; return; }
    var t0 = null, dur = 1100;
    el.textContent = '0';
    (function step(ts) {
      if (t0 === null) t0 = ts + (delay || 0);
      var p = Math.min(1, Math.max(0, (ts - t0) / dur));
      el.textContent = Math.round(n * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if (upEl) upEl.textContent = nUp;
  if (pastEl) pastEl.textContent = nPast;
  var countBox = document.getElementById('evt-count');
  if (hasIO && countBox && !still()) {
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      countTo(upEl, nUp, 150); countTo(pastEl, nPast, 300); cio.disconnect();
    }, { threshold: 0.6 });
    cio.observe(countBox);
  }

  /* ---- Filter pills -------------------------------------------------------- */
  var bar = up.querySelector('.evt-filter');
  var tabs = bar ? $$('.evt-filter-btn', bar) : [];
  var empty = document.getElementById('evt-empty');
  var statusEl = document.getElementById('ev-status');
  var ind = null;
  function match(c, f) { return f === 'all' || (c.getAttribute('data-cat') || '').indexOf(f) !== -1; }
  if (bar) {
    ind = document.createElement('span'); ind.className = 'ev-ind'; ind.setAttribute('aria-hidden', 'true');
    bar.insertBefore(ind, bar.firstChild);
  }
  var tabCount = {};
  tabs.forEach(function (t) {
    var f = t.getAttribute('data-filter'), n = base.filter(function (c) { return match(c, f); }).length;
    tabCount[f] = n;
    var s = document.createElement('span'); s.className = 'ev-fc'; s.textContent = n; s.setAttribute('aria-hidden', 'true');
    t.appendChild(s);
    t.setAttribute('aria-label', t.firstChild.nodeValue.trim() + ', ' + n + (n === 1 ? ' event' : ' events'));
    if (!n) t.setAttribute('data-empty', '');
  });

  function activeTab() { return tabs.filter(function (t) { return t.classList.contains('is-active'); })[0]; }
  function moveInd(animate) {
    var t = activeTab(); if (!t || !ind) return;
    var instant = !animate || still();
    if (instant) ind.style.transition = 'none';
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
    if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
    if (bar.scrollWidth > bar.clientWidth + 1) {
      var left = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
      try { bar.scrollTo({ left: left, behavior: instant ? 'auto' : 'smooth' }); } catch (err) { bar.scrollLeft = left; }
    }
  }

  var current = 'all', view = 'grid', seq = 0, anims = [];
  function stopAnims() { anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); anims = []; }
  function track(a) { anims.push(a); return a; }
  function shown() { return base.filter(function (c) { return !c.classList.contains('is-hidden'); }); }
  function updateStatus() {
    var n = shown().length;
    if (empty) empty.style.display = n === 0 ? 'block' : 'none';
    if (!statusEl) return;
    var t = activeTab(), name = t ? t.firstChild.nodeValue.trim() : '';
    statusEl.innerHTML = current === 'all'
      ? 'Showing all <b>' + n + '</b> upcoming ' + (n === 1 ? 'event' : 'events')
      : n ? 'Showing <b>' + n + '</b> of ' + nUp + ' &middot; ' + name : 'Nothing in ' + name + ' right now';
  }

  /* ---- Layout: grid order, or grouped by month ------------------------------ */
  function gkey(c) {
    var s = c.getAttribute('data-status');
    if (s === 'sold') return 'z';                        /* sold out stays after everything bookable */
    if (s === 'ongoing') return '0';
    var st = c.getAttribute('data-start') || '';
    return /^\d{4}-\d{2}/.test(st) ? '1' + st.slice(0, 7) : '2';
  }
  function glabel(k) {
    if (k === 'z') return 'Sold Out';
    if (k === '0') return 'Ongoing';
    if (k === '2') return 'Upcoming';
    return MONTH[+k.slice(6, 8) - 1] + ' ' + k.slice(1, 5);
  }
  function layout() {
    $$('.ev-month', grid).forEach(function (h) { h.parentNode.removeChild(h); });
    var order = base.slice();
    if (view === 'month') {
      order.sort(function (a, b) {
        var ka = gkey(a), kb = gkey(b);
        if (ka !== kb) return ka < kb ? -1 : 1;
        var sa = ms(a.getAttribute('data-start'), false), sb = ms(b.getAttribute('data-start'), false);
        if (isNaN(sa)) sa = Infinity; if (isNaN(sb)) sb = Infinity;
        return (sa - sb) || (a._evI - b._evI);
      });
    }
    order.forEach(function (c) { if (empty && empty.parentNode === grid) grid.insertBefore(c, empty); else grid.appendChild(c); });
    grid.classList.toggle('ev-by-month', view === 'month');
    if (view !== 'month') return;
    var groups = {};
    order.forEach(function (c) {
      if (c.classList.contains('is-hidden')) return;
      var k = gkey(c);
      if (groups[k]) { groups[k].n++; return; }
      var h = document.createElement('div');
      h.className = 'ev-month' + (k === 'z' ? ' ev-m-sold' : '');
      h.setAttribute('role', 'heading'); h.setAttribute('aria-level', '3');
      h.innerHTML = '<span class="ev-month-l">' + glabel(k) + '</span><span class="ev-month-n"></span>';
      grid.insertBefore(h, c);
      groups[k] = { el: h, n: 1 };
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].el.querySelector('.ev-month-n').textContent = groups[k].n + (groups[k].n === 1 ? ' event' : ' events');
    });
  }

  /* ---- Filter with FLIP ---------------------------------------------------- */
  function applyFilter(f, animate) {
    if (!(f in tabCount)) f = 'all';
    current = f;
    var my = ++seq;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-filter') === f;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && t.id) grid.setAttribute('aria-labelledby', t.id);
    });
    moveInd(animate);
    var motion = animate && !still();
    stopAnims();
    var vis = shown();
    var leaving = vis.filter(function (c) { return !match(c, f); });
    var staying = vis.filter(function (c) { return match(c, f); });
    var entering = base.filter(function (c) { return c.classList.contains('is-hidden') && match(c, f); });

    function commit() {
      if (my !== seq) return;
      stopAnims();
      var oldHeads = {};
      $$('.ev-month', grid).forEach(function (h) { oldHeads[h.textContent] = h.getBoundingClientRect(); });
      var first = staying.map(function (c) { return c.getBoundingClientRect(); });
      leaving.forEach(function (c) { c.classList.add('is-hidden'); });
      entering.forEach(function (c) { c.classList.remove('is-hidden'); c.classList.add('ev-in'); });
      layout();
      updateStatus();
      if (!motion) return;
      staying.forEach(function (c, i) {
        var a = first[i], b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        if ((a.bottom < 0 && b.bottom < 0) || (a.top > innerHeight && b.top > innerHeight)) return;
        track(c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 620, easing: EASE }));
      });
      entering.forEach(function (c, i) {
        track(c.animate([{ opacity: 0, transform: 'translateY(18px) scale(.96)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, delay: 90 + i * 55, easing: EASE, fill: 'backwards' }));
      });
      $$('.ev-month', grid).forEach(function (h) {
        var o = oldHeads[h.textContent];
        if (o) {
          var b = h.getBoundingClientRect(), dy = o.top - b.top;
          if (Math.abs(dy) > 1) track(h.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 620, easing: EASE }));
        } else {
          track(h.animate([{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 60, easing: EASE, fill: 'backwards' }));
        }
      });
    }
    if (motion && leaving.length) {
      leaving.forEach(function (c) {
        track(c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' }));
      });
      setTimeout(commit, 190);
    } else commit();
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { if (t.getAttribute('data-filter') !== current) applyFilter(t.getAttribute('data-filter'), true); });
  });
  if (bar) bar.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement), n = tabs.length, j = null;
    if (i < 0) return;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    if (j === null) return;
    e.preventDefault();
    tabs[j].focus();
    applyFilter(tabs[j].getAttribute('data-filter'), true);
  });

  /* ---- View toggle: grid / by month ------------------------------------------ */
  var viewBtns = $$('.ev-view', up);
  function setView(v) {
    if (v === view) return;
    view = v;
    viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false'); });
    var my = ++seq;
    stopAnims();
    if (still()) { layout(); return; }
    var out = track(grid.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' }));
    out.onfinish = function () {
      if (my !== seq) return;
      layout();
      stopAnims();
      var items = Array.prototype.slice.call(grid.children).filter(function (el) {
        return el.offsetParent !== null && el.getBoundingClientRect().top < innerHeight + 200;
      });
      items.forEach(function (el, i) {
        el.classList.add('ev-in');
        track(el.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
          { duration: 560, delay: Math.min(i, 8) * 55, easing: EASE, fill: 'backwards' }));
      });
    };
  }
  viewBtns.forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view')); }); });

  /* ---- Pointer tilt + spotlight (fine pointers only) ----------------------------- */
  if (mqFine.matches && !still()) {
    base.concat(pastCards).forEach(function (card) {
      var raf = 0, ev = null;
      function paint() {
        raf = 0; if (!ev) return;
        var r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        card.style.setProperty('--ev-rx', ((.5 - y) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--ev-ry', ((x - .5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--ev-px', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--ev-py', (y * 100).toFixed(1) + '%');
      }
      card.addEventListener('pointerenter', function () { card.classList.add('ev-tilting'); });
      card.addEventListener('pointermove', function (e) { ev = e; if (!raf) raf = requestAnimationFrame(paint); });
      card.addEventListener('pointerleave', function () {
        ev = null; card.classList.remove('ev-tilting');
        card.style.setProperty('--ev-rx', '0deg'); card.style.setProperty('--ev-ry', '0deg');
      });
    });
  }

  /* ---- Past events strip ------------------------------------------------------- */
  if (past && archive) {
    if (!pastCards.length) past.hidden = true;
    var nav = past.querySelector('.ev-nav'), prog = past.querySelector('.ev-prog');
    var thumb = prog ? prog.querySelector('span') : null;
    var arrows = nav ? $$('.ev-arrow', nav) : [];
    function stepW() {
      var c = archive.querySelector('.evt-card');
      var gap = parseFloat(getComputedStyle(archive).columnGap) || 16;
      return c ? c.getBoundingClientRect().width + gap : archive.clientWidth * .8;
    }
    arrows.forEach(function (b) {
      b.addEventListener('click', function () {
        var d = +b.getAttribute('data-dir') * stepW();
        try { archive.scrollBy({ left: d, behavior: still() ? 'auto' : 'smooth' }); } catch (e) { archive.scrollLeft += d; }
      });
    });
    var sraf = 0;
    function sync() {
      sraf = 0;
      var sw = archive.scrollWidth, cw = archive.clientWidth, sl = archive.scrollLeft, over = sw > cw + 2;
      if (nav) nav.hidden = !over;
      if (prog) prog.hidden = !over;
      if (!over) return;
      if (arrows[0]) arrows[0].disabled = sl <= 2;
      if (arrows[1]) arrows[1].disabled = sl >= sw - cw - 2;
      if (thumb && prog) {
        var W = prog.clientWidth, w = Math.max(28, W * cw / sw);
        thumb.style.width = w + 'px';
        thumb.style.transform = 'translateX(' + ((W - w) * (sl / (sw - cw))).toFixed(1) + 'px)';
      }
    }
    archive.addEventListener('scroll', function () { if (!sraf) sraf = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', function () { if (!sraf) sraf = requestAnimationFrame(sync); });
    sync();
  }

  /* ---- Init ----------------------------------------------------------------- */
  applyFilter('all', false);
  window.addEventListener('resize', function () { moveInd(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInd(false); });
  window.addEventListener('load', function () { moveInd(false); });
})();

;

(function(){
  var poster=document.querySelector('.ce-poster'); if(!poster) return;
  var img=poster.querySelector('img'); if(!img) return;
  poster.setAttribute('role','button'); poster.setAttribute('tabindex','0'); poster.setAttribute('aria-label','View full-size image');
  if(!poster.querySelector('.ce-zoom-hint')){ var h=document.createElement('span'); h.className='ce-zoom-hint'; h.innerHTML='<i class="fa-solid fa-magnifying-glass-plus"></i> Click to enlarge'; poster.style.position=poster.style.position||'relative'; poster.appendChild(h); }
  var lb=document.createElement('div'); lb.className='ce-lightbox'; lb.setAttribute('aria-hidden','true');
  lb.innerHTML='<button class="ce-lightbox-close" aria-label="Close">&times;</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg=lb.querySelector('img'), closeBtn=lb.querySelector('.ce-lightbox-close');
  function open(){ lbImg.src=img.currentSrc||img.src; lbImg.alt=img.alt||''; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function shut(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  poster.addEventListener('click', open);
  poster.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
  lb.addEventListener('click', function(e){ if(e.target===lb||e.target===closeBtn) shut(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') shut(); });
})();

;

/* ==== Odoo glue ============================================================
   Register buttons open Odoo's own ticket window; a link ending in
   #register-now (used on the event cards) opens it straight away. */
(function(){
  function openReg(){
    var b=document.querySelector('.xev-open-reg');
    if(b){ b.click(); }
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-xev-register]');
    if(!a) return;
    e.preventDefault(); openReg();
  });
  /* Odoo pre-fills phone fields with the visitor's dialling code (e.g. +65). If nothing else
     was typed, send the field empty instead of saving "+65" as the phone number. */
  function dropBareCode(form){
    if(!form) return;
    form.querySelectorAll('input[type=tel]').forEach(function(i){ if(/^\+?\d{1,4}$/.test(i.value.trim())) i.value=''; });
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.s_website_form_send');
    if(b) dropBareCode(b.closest('form'));
  },true);
  document.addEventListener('submit',function(e){
    if(e.target.classList&&e.target.classList.contains('s_website_form')) dropBareCode(e.target);
  },true);
  /* Odoo's icon-only buttons (login, booking calendar): give them names screen readers can announce */
  function nameIcons(){
    [['.o_show_password','Show password'],['#prevCal','Previous month'],['#nextCal','Next month']].forEach(function(p){
      document.querySelectorAll(p[0]).forEach(function(b){ if(!b.getAttribute('aria-label')) b.setAttribute('aria-label', p[1]); });
    });
  }
  nameIcons(); window.addEventListener('load', function(){ setTimeout(nameIcons, 1500); });
  /* Odoo's form code clears its forms when it starts (to undo browser-restored values). On a slow
     connection someone may already be typing: remember what they typed and put it back afterwards. */
  (function(){
    if(!document.body.classList.contains('o_lazy_js_waiting')) return;
    var typed=new Map();
    function remember(e){
      var el=e.target;
      if(!el.closest||!el.closest('form.s_website_form, .js_subscribe')||el.type==='hidden'||!el.name) return;
      typed.set(el, (el.type==='checkbox'||el.type==='radio') ? el.checked : el.value);
    }
    document.addEventListener('input',remember,true); document.addEventListener('change',remember,true);
    var mo=new MutationObserver(function(){
      if(document.body.classList.contains('o_lazy_js_waiting')) return;
      mo.disconnect();
      setTimeout(function(){
        document.removeEventListener('input',remember,true); document.removeEventListener('change',remember,true);
        typed.forEach(function(v,el){
          if(el.type==='checkbox'||el.type==='radio'){ if(v&&!el.checked){ el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true})); } }
          else if(v&&(!el.value||/^\+?\d{1,4}$/.test(el.value.trim()))){ el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); }
        });
      },800);
    });
    mo.observe(document.body,{attributes:true,attributeFilter:['class']});
  })();
  /* Odoo pages without a site hero (cart, checkout, confirmation): keep the
     HummingBeing menu in its solid "scrolled" look so it stays readable */
  var hbNav=document.querySelector('header.hbx.xev-head nav');
  if(hbNav && !document.querySelector('.xev-flush')){
    var keep=function(){ hbNav.classList.add('scrolled'); };
    keep(); window.addEventListener('scroll',keep,{passive:true});
  }
  if(/register-now/.test(location.hash)){
    /* keep trying until Odoo's ticket window is really open (its scripts load lazily) */
    var tries=0,t=setInterval(function(){
      tries++;
      var m=document.getElementById('modal_ticket_registration');
      if((m && m.classList.contains('show')) || tries>30){ clearInterval(t); return; }
      if(tries>2) openReg();
    },400);
  }
})();
