
window.sendLead=function(d){
  d=d||{};
  try{
    if(d.inquiry==='Newsletter signup'){
      fetch('/website_mass_mailing/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({jsonrpc:'2.0',method:'call',params:{list_id:2,value:d.email||'',subscription_type:'email'}})}).catch(function(){});
      return;
    }
    var fd=new FormData();
    fd.append('csrf_token',(window.odoo&&odoo.csrf_token)||'');
    fd.append('name',(d.inquiry||'Website enquiry')+(d.name?' — '+d.name:''));
    fd.append('contact_name',d.name||'');
    fd.append('email_from',d.email||'');
    fd.append('phone',d.phone||'');
    fd.append('description',['Source: '+(d.source||'HummingBeing website'),d.event?'Event: '+d.event:'',d.inquiry?'Enquiry: '+d.inquiry:'','',d.message||''].filter(function(x,i){return x||i===3;}).join('\n'));
    fetch('/website/form/crm.lead',{method:'POST',body:fd}).catch(function(){});
  }catch(e){console.warn('sendLead',e);}
};
try{

/* Socials page interactions (scoped to .sx) */
(function () {
  var root = document.querySelector('.sx');
  if (!root) return;
  root.classList.add('sx-js');

  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function rich() { return mqFine.matches && !mqReduce.matches; }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---- staggered scroll reveals ---- */
  each(root.querySelectorAll('[data-sx-stagger]'), function (g) {
    var i = 0;
    each(g.children, function (c) {
      if (c.hasAttribute('data-sx-reveal')) { c.style.setProperty('--d', Math.min(i, 8) * 70 + 'ms'); i++; }
    });
  });
  var revealEls = root.querySelectorAll('[data-sx-reveal]');
  /* once revealed, drop the reveal hooks so each element's own hover/tilt transitions take over */
  function settle(el) {
    var d = parseFloat(el.style.getPropertyValue('--d')) || 0;
    setTimeout(function () {
      el.removeAttribute('data-sx-reveal');
      el.classList.remove('is-in');
      el.style.removeProperty('--d');
    }, 950 + d);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); settle(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    each(revealEls, function (el) { io.observe(el); });
  } else {
    each(revealEls, function (el) { el.classList.add('is-in'); });
  }

  /* ---- toast + copy to clipboard ---- */
  var toast = root.querySelector('.sx-toast');
  var toastMsg = toast ? toast.querySelector('.sx-toast__msg') : null;
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toastMsg.textContent = '';
    setTimeout(function () {
      toastMsg.textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
    }, 40);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.left = '0'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      if (ok) resolve(); else reject();
    });
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (!b || !root.contains(b)) return;
    var val = b.getAttribute('data-copy');
    var lbl = b.querySelector('.sx-copy__lbl');
    var icon = b.querySelector('i');
    copyText(val).then(function () {
      say('Copied ' + val);
      b.classList.add('is-copied');
      if (lbl) lbl.textContent = 'Copied';
      if (icon) icon.className = 'fa-solid fa-check';
      clearTimeout(b._sxT);
      b._sxT = setTimeout(function () {
        b.classList.remove('is-copied');
        if (lbl) lbl.textContent = 'Copy';
        if (icon) icon.className = 'fa-regular fa-copy';
      }, 1900);
    }, function () {
      say('Copy not available here — ' + val);
    });
  });

  /* ---- platform switcher (tabs) ---- */
  var sw = root.querySelector('[data-sx-switch]');
  var selectPlatform = function () {};
  if (sw) {
    var tabs = Array.prototype.slice.call(sw.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var ind = sw.querySelector('.sx-tabs__ind');
    var cur = -1;
    var place = function (instant) {
      if (!ind || cur < 0) return;
      var t = tabs[cur];
      if (instant) ind.style.transition = 'none';
      ind.style.width = t.offsetWidth + 'px';
      ind.style.height = t.offsetHeight + 'px';
      ind.style.transform = 'translate(' + t.offsetLeft + 'px,' + t.offsetTop + 'px)';
      if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
    };
    selectPlatform = function (i, focus) {
      if (i < 0 || i >= tabs.length) return;
      var first = cur < 0;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = panels[j];
        if (!p) return;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('inert'); else p.setAttribute('inert', '');
      });
      cur = i;
      place(first);
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, j) {
      var p = panels[j];
      if (p) each(p.children, function (c, k) { c.style.setProperty('--i', k); });
      t.addEventListener('click', function () { selectPlatform(j); });
      var dwell;
      t.addEventListener('mouseenter', function () {
        if (!mqFine.matches) return;
        clearTimeout(dwell);
        dwell = setTimeout(function () { selectPlatform(j); }, 130);
      });
      t.addEventListener('mouseleave', function () { clearTimeout(dwell); });
    });
    sw.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length, to = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') to = (cur + 1) % n;
      else if (k === 'ArrowUp' || k === 'ArrowLeft') to = (cur - 1 + n) % n;
      else if (k === 'Home') to = 0;
      else if (k === 'End') to = n - 1;
      if (to === null) return;
      e.preventDefault();
      selectPlatform(to, true);
    });
    selectPlatform(0);
    window.addEventListener('resize', function () { place(true); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { place(true); }).observe(sw.querySelector('[role="tablist"]'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(true); });
  }

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth', block: 'start' });
  }
  each(root.querySelectorAll('[data-sx-jump]'), function (b) {
    b.addEventListener('click', function () {
      selectPlatform(parseInt(b.getAttribute('data-sx-jump'), 10));
      scrollToEl(sw);
    });
  });

  /* ---- filterable grids/lists (FLIP animated) ---- */
  var status = root.querySelector('.sx-status');
  var filters = {};
  each(root.querySelectorAll('[data-sx-filter]'), function (chipsEl) {
    var list = document.getElementById(chipsEl.getAttribute('data-sx-filter'));
    if (!list) return;
    var chips = Array.prototype.slice.call(chipsEl.querySelectorAll('[data-f]'));
    var items = Array.prototype.slice.call(list.children);
    var noun = chipsEl.getAttribute('data-noun') || 'items';
    function apply(f) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-f') === f ? 'true' : 'false'); });
      var before = new Map();
      items.forEach(function (el) { if (!el.hidden) before.set(el, el.getBoundingClientRect()); });
      var shown = 0;
      items.forEach(function (el) {
        var tags = (el.getAttribute('data-tags') || '').split(' ');
        var on = f === 'all' || tags.indexOf(f) > -1;
        el.hidden = !on;
        el.classList.add('is-in');
        if (on) shown++;
      });
      if (!mqReduce.matches && window.Map) {
        items.forEach(function (el) {
          if (el.hidden) return;
          var a = before.get(el), r = el.getBoundingClientRect();
          el.style.transition = 'none';
          if (a) {
            var dx = a.left - r.left, dy = a.top - r.top;
            el.style.transform = (dx || dy) ? 'translate(' + dx + 'px,' + dy + 'px)' : '';
          } else {
            el.style.opacity = '0';
            el.style.transform = 'translateY(18px) scale(.96)';
          }
        });
        void list.offsetWidth;
        items.forEach(function (el) {
          if (el.hidden) return;
          el.style.transition = 'transform .6s cubic-bezier(.23,1,.32,1), opacity .45s ease';
          el.style.transform = '';
          el.style.opacity = '';
        });
        clearTimeout(list._sxT);
        list._sxT = setTimeout(function () { items.forEach(function (el) { el.style.transition = ''; }); }, 650);
      }
      if (status) {
        var chip = chips.filter(function (c) { return c.getAttribute('data-f') === f; })[0];
        var name = chip ? chip.textContent.replace(/\s+/g, ' ').trim() : f;
        status.textContent = 'Showing ' + shown + ' ' + noun + (f === 'all' ? '' : ': ' + name);
      }
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.getAttribute('data-f')); }); });
    filters[list.id] = apply;
  });
  each(root.querySelectorAll('[data-sx-show]'), function (b) {
    b.addEventListener('click', function () {
      var target = document.getElementById('sx-themes');
      if (filters['sx-theme-grid']) filters['sx-theme-grid'](b.getAttribute('data-sx-show'));
      scrollToEl(target);
    });
  });

  /* ---- pointer tilt + spotlight (fine pointers, motion allowed) ---- */
  each(root.querySelectorAll('[data-sx-tilt]'), function (el) {
    var max = parseFloat(el.getAttribute('data-sx-tilt')) || 5;
    var raf = 0, px = 0.5, py = 0.5, w = 0, h = 0;
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !rich()) return;
      var r = el.getBoundingClientRect();
      w = r.width; h = r.height;
      px = (e.clientX - r.left) / w; py = (e.clientY - r.top) / h;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.style.setProperty('--gx', (px * w).toFixed(0) + 'px');
        el.style.setProperty('--gy', (py * h).toFixed(0) + 'px');
      });
    });
    el.addEventListener('pointerleave', function () {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  /* ---- magnetic CTAs ---- */
  each(root.querySelectorAll('.sx-magnet'), function (m) {
    m.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !rich()) return;
      var r = m.getBoundingClientRect();
      var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      m.style.transform = 'translate(' + (x * 0.16).toFixed(1) + 'px,' + (y * 0.3).toFixed(1) + 'px)';
    });
    m.addEventListener('pointerleave', function () { m.style.transform = ''; });
  });

  /* ---- newsletter: sends the signup to Isabelle (email + Google Sheet) via sendLead() ---- */
  var form = root.querySelector('.sx-nl__form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var msg = form.querySelector('.sx-nl__msg');
      var btn = form.querySelector('button[type="submit"]');
      if (!input.value.trim() || !input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        msg.textContent = 'Please enter a valid email address.';
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      if (typeof sendLead === 'function') {
        sendLead({ name: '', email: input.value.trim(), phone: '', event: '', inquiry: 'Newsletter signup', source: 'Socials page — newsletter', message: 'Please add me to the HummingBeing newsletter.' });
      }
      msg.textContent = 'Thank you — you are on the list.';
      btn.textContent = 'Subscribed';
      btn.classList.remove('hb-btn-primary');
      btn.classList.add('hb-btn-dark');
    });
  }
})();

}catch(e){console.warn('page script', e);}