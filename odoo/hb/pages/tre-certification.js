try{

/* ==========================================================================
   TRE CERTIFICATION (.tc-) - scroll reveal, word reveal, count-up, tilt,
   credential highlighter, "why" tabs, certification stepper, price switch.
   Plain JS, no libraries, no network requests. Scoped to .tc-sec sections.
   ========================================================================== */
(function () {
  'use strict';
  var secs = [].slice.call(document.querySelectorAll('.tc-sec'));
  if (!secs.length) return;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function still() { return mqReduce.matches; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  secs.forEach(function (s) { s.classList.add('tc-on'); });

  /* ---- Stagger delays for grouped reveals ------------------------------- */
  $$('[data-tc-stagger]').forEach(function (g) {
    var step = parseInt(g.getAttribute('data-tc-stagger'), 10) || 80;
    $$(':scope > .tc-rv', g).forEach(function (el, i) { el.style.setProperty('--tc-d', (i * step) + 'ms'); });
  });

  /* ---- Word-by-word quote ------------------------------------------------ */
  $$('[data-tc-words]').forEach(function (bq) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var sp = document.createElement('span');
            sp.className = 'tc-w'; sp.style.setProperty('--i', i++); sp.textContent = part;
            frag.appendChild(sp);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    })(bq);
  });

  /* ---- Count-up (only numbers already on the page) ----------------------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-tc-count'), 10);
    if (still() || isNaN(target)) { el.textContent = target; return; }
    var t0 = null, dur = 1500;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Scroll reveal ------------------------------------------------------ */
  var hasIO = 'IntersectionObserver' in window;
  var counters = $$('[data-tc-count]');
  function onIn(el) {
    el.classList.add('tc-in');
    $$('[data-tc-count]', el).forEach(countUp);
  }
  var targets = $$('.tc-rv, .tc-draw');
  if (!hasIO || still()) {
    targets.forEach(function (el) { el.classList.add('tc-in'); });
  } else {
    counters.forEach(function (el) { el.textContent = '0'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        onIn(e.target); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Pointer tilt + spotlight (fine pointers only) ---------------------- */
  function trackPointer(el, tilt) {
    var raf = 0;
    el.addEventListener('pointermove', function (e) {
      if (!mqFine.matches || still()) return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (tilt) {
          el.classList.add('tc-tilting');
          el.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - y) * 8).toFixed(2) + 'deg');
        }
      });
    });
    el.addEventListener('pointerleave', function () {
      cancelAnimationFrame(raf);
      if (!tilt) return;
      el.classList.remove('tc-tilting');
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    });
  }
  $$('.tc-tilt').forEach(function (el) { trackPointer(el, true); });
  $$('[data-tc-spot]').forEach(function (el) { trackPointer(el, false); });

  /* ---- Keyboard for tablists ---------------------------------------------- */
  function tabKeys(tabs, select) {
    tabs.forEach(function (t, i) {
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j === null) return;
        e.preventDefault(); select(j); tabs[j].focus();
      });
    });
  }
  function navBar(label, onDir) {
    var nav = document.createElement('div');
    nav.className = 'tc-pnav';
    nav.innerHTML = '<span class="tc-pnav-c"></span><span class="tc-pnav-b">' +
      '<button type="button" class="tc-pbtn" data-dir="-1" aria-label="Previous ' + label + '"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>' +
      '<button type="button" class="tc-pbtn" data-dir="1" aria-label="Next ' + label + '"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></span>';
    $$('.tc-pbtn', nav).forEach(function (b) {
      b.addEventListener('click', function () { onDir(parseInt(b.getAttribute('data-dir'), 10)); });
    });
    return nav;
  }

  /* ---- 1. Credential chips highlight their phrase in the bio -------------- */
  var trainer = $('.tc-trainer');
  if (trainer) {
    var chips = $$('.tc-chip', trainer), hls = $$('.tc-hl', trainer);
    var light = function (k) { hls.forEach(function (h) { h.classList.toggle('tc-lit', !!k && h.getAttribute('data-tc-k') === k); }); };
    var pressed = function () { var p = $('.tc-chip[aria-pressed="true"]', trainer); return p ? p.getAttribute('data-tc-k') : null; };
    chips.forEach(function (c) {
      var k = c.getAttribute('data-tc-k');
      c.addEventListener('click', function () {
        var on = c.getAttribute('aria-pressed') !== 'true';
        chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c && on ? 'true' : 'false'); });
        light(on ? k : null);
      });
      c.addEventListener('pointerenter', function () { if (mqFine.matches) light(k); });
      c.addEventListener('pointerleave', function () { if (mqFine.matches) light(pressed()); });
      c.addEventListener('focus', function () { light(k); });
      c.addEventListener('blur', function () { light(pressed()); });
    });
  }

  /* ---- 3. Why TRE: tabs built from the six reason cards -------------------- */
  var why = $('.tc-why-ui');
  if (why) {
    var wPanels = $$('.tc-wp', why), stage = $('.tc-why-stage', why), wGrid = $('.tc-why-grid', why);
    var list = document.createElement('div');
    list.className = 'tc-why-tabs';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Why TRE is worth certifying in');
    list.setAttribute('aria-orientation', 'vertical');
    var ind = document.createElement('span');
    ind.className = 'tc-why-ind'; ind.setAttribute('aria-hidden', 'true');
    list.appendChild(ind);
    var wTabs = wPanels.map(function (p, i) {
      p.id = 'tc-why-p' + i;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'tc-why-t' + i);
      p.tabIndex = 0;
      var num = document.createElement('span');
      num.className = 'tc-wp-num'; num.setAttribute('aria-hidden', 'true'); num.textContent = pad(i + 1);
      p.appendChild(num);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tc-wt'; b.id = 'tc-why-t' + i;
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', p.id);
      var icon = $('.tc-wp-i i', p);
      b.innerHTML = '<span class="tc-wt-i" aria-hidden="true"><i class="' + icon.className + '"></i></span><span class="tc-wt-l"></span><span class="tc-wt-n" aria-hidden="true">' + pad(i + 1) + '</span>';
      $('.tc-wt-l', b).textContent = $('h3', p).textContent;
      list.appendChild(b);
      return b;
    });
    why.insertBefore(list, stage);
    var wCur = 0, wN = wPanels.length;
    var wNav = navBar('reason', function (d) { wSel((wCur + d + wN) % wN); });
    stage.appendChild(wNav);
    var wCount = $('.tc-pnav-c', wNav);
    var moveInd = function () {
      var t = wTabs[wCur];
      if (getComputedStyle(ind).display === 'none') return;
      ind.style.height = t.offsetHeight + 'px';
      ind.style.transform = 'translateY(' + t.offsetTop + 'px)';
    };
    var wSel = function (i) {
      wCur = i;
      wTabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        wPanels[j].classList.toggle('tc-cur', on);
      });
      wCount.textContent = pad(i + 1) + ' / ' + pad(wN);
      moveInd();
    };
    tabKeys(wTabs, wSel);
    wTabs.forEach(function (t, i) { t.addEventListener('click', function () { wSel(i); }); });
    wSel(0);
    window.addEventListener('resize', moveInd, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);
  }

  /* ---- 4. Certification stepper -------------------------------------------- */
  var path = $('[data-tc-steps]');
  if (path) {
    var steps = $$('.tc-st', path), stepsBox = $('.tc-steps', path), sN = steps.length;
    var track = document.createElement('div');
    track.className = 'tc-track';
    track.setAttribute('role', 'tablist');
    track.setAttribute('aria-label', 'Certification path');
    track.innerHTML = '<span class="tc-track-line" aria-hidden="true"><span class="tc-track-fill"></span></span>';
    var fill = $('.tc-track-fill', track);
    var nodes = steps.map(function (st, i) {
      st.id = 'tc-step-p' + i;
      st.setAttribute('role', 'tabpanel');
      st.setAttribute('aria-labelledby', 'tc-step-t' + i);
      st.tabIndex = 0;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tc-node'; b.id = 'tc-step-t' + i;
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', st.id);
      var dot = i === sN - 1 ? '<i class="fa-solid fa-award"></i>' : String(i + 1);
      b.innerHTML = '<span class="tc-node-dot" aria-hidden="true">' + dot + '</span><span class="tc-node-l"></span>';
      $('.tc-node-l', b).textContent = st.getAttribute('data-tc-short') || ('Step ' + (i + 1));
      track.appendChild(b);
      return b;
    });
    path.insertBefore(track, stepsBox);
    var sCur = 0;
    var sNav = navBar('step', function (d) { var j = sCur + d; if (j >= 0 && j < sN) sSel(j); });
    path.appendChild(sNav);
    var sCount = $('.tc-pnav-c', sNav), sBtns = $$('.tc-pbtn', sNav);
    var sSel = function (i) {
      stepsBox.setAttribute('data-dir', i < sCur ? '-1' : '1');
      sCur = i;
      nodes.forEach(function (b, j) {
        b.setAttribute('aria-selected', j === i ? 'true' : 'false');
        b.tabIndex = j === i ? 0 : -1;
        b.classList.toggle('tc-done', j < i);
        steps[j].classList.toggle('tc-cur', j === i);
      });
      fill.style.setProperty('--tc-p', sN > 1 ? i / (sN - 1) : 1);
      sCount.textContent = 'Step ' + (i + 1) + ' of ' + sN;
      sBtns[0].disabled = i === 0;
      sBtns[1].disabled = i === sN - 1;
    };
    tabKeys(nodes, sSel);
    nodes.forEach(function (b, i) { b.addEventListener('click', function () { sSel(i); }); });
    sSel(0);
  }

  /* ---- 7. Pricing: early-bird / normal switch -------------------------------- */
  var price = $('.tc-price');
  if (price) {
    var billWrap = $('.tc-bill-wrap', price), bill = $('.tc-bill', price);
    var billBtns = $$('.tc-bill-b', price), plans = $$('.tc-plan', price);
    billWrap.hidden = false;
    var toNum = function (s) { return parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0; };
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var tween = function (el, to) {
      var from = toNum(el.textContent), goal = toNum(to);
      if (el._tcRaf) cancelAnimationFrame(el._tcRaf);
      if (still() || from === goal) { el.textContent = to; return; }
      var t0 = null, dur = 650;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = p === 1 ? to : fmt(Math.round(from + (goal - from) * e));
        if (p < 1) el._tcRaf = requestAnimationFrame(step);
      };
      el._tcRaf = requestAnimationFrame(step);
      if (typeof el.animate === 'function') {
        el.animate([{ transform: 'translateY(-8px)', opacity: 0.35 }, { transform: 'none', opacity: 1 }],
          { duration: 550, easing: 'cubic-bezier(.23,1,.32,1)' });
      }
    };
    var setMode = function (m) {
      bill.setAttribute('data-mode', m);
      billBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tc-bill') === m ? 'true' : 'false'); });
      plans.forEach(function (card) {
        $$('.tc-plan-tier', card).forEach(function (t) { t.classList.toggle('tc-tier-on', t.getAttribute('data-tc-tier') === m); });
        var num = $('.tc-plan-num', card);
        if (num) tween(num, num.getAttribute('data-' + m));
      });
    };
    billBtns.forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-tc-bill')); });
    });
  }
})();

}catch(e){console.warn('page script', e);}