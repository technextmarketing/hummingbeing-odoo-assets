
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
    fd.append('description',['Website: HummingBeing','Page: '+(d.source||location.pathname),d.event?'Location / event: '+d.event:'',d.inquiry?'Enquiry: '+d.inquiry:'','',d.message||''].filter(function(x,i){return x||i===4;}).join('\n'));
    fetch('/website/form/crm.lead',{method:'POST',body:fd}).catch(function(){});
  }catch(e){console.warn('sendLead',e);}
};
try{

function handleBookSubmit(e) {
  e.preventDefault();
  var g = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
  sendLead({
    name: (g('fname') + ' ' + g('lname')).trim(),
    email: g('email'),
    phone: g('phone'),
    event: g('location'),
    inquiry: g('service'),
    source: 'Book a Session page',
    message: 'Heard via: ' + (g('hear') || '—') + ' | ' + g('message')
  });
  document.querySelector('form').style.display = 'none';
  document.getElementById('success-msg').style.display = 'block';
}
function toggleFaq(btn) {
  var item = btn.closest('.faq-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(i) { i.classList.remove('open'); });
  if (!wasOpen) item.classList.add('open');
}

}catch(e){console.warn('page script', e);}
try{

/* BOOK A SESSION (.bk-) interactions: reveals, plan picker -> form, form feel, sidebar tabs, FAQ.
   Never changes what the form sends: handleBookSubmit / sendLead above are untouched. */
(function () {
  var doc = document, root = doc.documentElement;
  root.classList.add('bk-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || doc).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = doc.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  /* ---------- count-up (only the S$2,300 already on the page) ---------- */
  function countUp(n) {
    if (!n || n.getAttribute('data-bk-done')) return;
    n.setAttribute('data-bk-done', '1');
    if (reduce) return;
    var to = +n.getAttribute('data-bk-to'), pre = n.getAttribute('data-bk-pre') || '', t0 = performance.now(), d = 1300;
    function fmt(v) { return pre + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    (function tick(now) {
      var p = Math.min(1, (now - t0) / d);
      n.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick); else n.textContent = fmt(to);
    })(t0);
  }

  /* ---------- scroll reveal ---------- */
  function shown(t) { t.classList.add('bk-in'); countUp($('.bk-count', t)); }
  var rvs = $$('.bk-rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { shown(en.target); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (r) { io.observe(r); });
  } else rvs.forEach(shown);

  /* ---------- form: progress, inline validation, service pills ---------- */
  var panel = $('#bk-panel'), form = panel && $('form', panel);
  var chosen = null, setService = function () {};
  if (form) {
    var fields = $$('input, select, textarea', form), req = fields.filter(function (f) { return f.required; });
    var groups = $$('.bk-grp', form);

    var prog = el('div', 'bk-prog',
      '<div class="bk-prog-top"><span><b>0</b> of ' + req.length + ' required fields complete</span><span class="bk-prog-pct">0%</span></div>' +
      '<div class="bk-prog-bar"><i></i></div>');
    prog.setAttribute('aria-hidden', 'true');
    panel.insertBefore(prog, panel.firstChild);
    var progN = $('b', prog), progP = $('.bk-prog-pct', prog), progBar = $('.bk-prog-bar', prog);

    function progress() {
      var n = req.filter(function (f) { return f.validity.valid; }).length, p = req.length ? n / req.length : 0;
      progN.textContent = n; progP.textContent = Math.round(p * 100) + '%';
      progBar.style.setProperty('--p', p.toFixed(3));
      prog.classList.toggle('bk-full', n === req.length);
      groups.forEach(function (g) {
        var r = $$('[required]', g);
        g.classList.toggle('bk-done', r.length > 0 && r.every(function (f) { return f.validity.valid; }));
      });
    }

    fields.forEach(function (f) {
      var g = f.closest('.form-group'); if (!g) return;
      var st = el('span', 'bk-st', '<i class="fa-solid fa-check" aria-hidden="true"></i>');
      st.setAttribute('aria-hidden', 'true');
      var err = el('span', 'bk-err'); err.id = 'bk-err-' + f.id;
      g.appendChild(st); g.appendChild(err);
      f.setAttribute('aria-describedby', err.id);
      var touched = false;
      function check(force) {
        if (force) touched = true;
        var ok = f.validity.valid, has = String(f.value).trim() !== '';
        if (!touched && !(ok && has)) { g.classList.remove('bk-ok', 'bk-bad'); err.textContent = ''; f.removeAttribute('aria-invalid'); return; }
        g.classList.toggle('bk-ok', ok && has);
        g.classList.toggle('bk-bad', !ok);
        st.innerHTML = ok ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-exclamation"></i>';
        err.textContent = ok ? '' : f.validationMessage;
        if (ok) f.removeAttribute('aria-invalid'); else f.setAttribute('aria-invalid', 'true');
      }
      f.addEventListener('blur', function () { if (String(f.value).trim() !== '') touched = true; check(); });
      f.addEventListener('input', function () { check(); progress(); });
      f.addEventListener('change', function () { check(true); progress(); });
      f.addEventListener('invalid', function () { check(true); });
    });

    /* service: selectable cards that fill the existing #service select */
    var sel = $('#service');
    if (sel) {
      var sg = sel.closest('.form-group'), lab = $('label[for="service"]', sg);
      var ICONS = ['fa-wave-square', 'fa-compass', 'fa-spa', 'fa-circle-question', 'fa-people-group'];
      var pills = el('div', 'bk-pills');
      pills.setAttribute('role', 'group');
      if (lab) { lab.id = 'bk-svc-l'; pills.setAttribute('aria-labelledby', 'bk-svc-l'); }
      var k = 0;
      [].slice.call(sel.options).forEach(function (o) {
        if (!o.value) return;
        var b = el('button', 'bk-pill', '<i class="fa-solid ' + (ICONS[k++] || 'fa-circle') + '" aria-hidden="true"></i><span></span>');
        b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-v', o.value);
        b.querySelector('span').textContent = o.text;
        b.addEventListener('click', function () { setService(o.value); });
        pills.appendChild(b);
      });
      sg.insertBefore(pills, sel);
      sg.classList.add('bk-pilled');
      sel.tabIndex = -1;
      if (lab) lab.addEventListener('click', function (e) { e.preventDefault(); var f = $('.bk-pill', pills); if (f) f.focus(); });
      function syncPills() { $$('.bk-pill', pills).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === sel.value ? 'true' : 'false'); }); }
      sel.addEventListener('change', syncPills);
      setService = function (v) {
        if (!v || sel.value === v) { syncPills(); return; }
        sel.value = v;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      };
      syncPills();
    }
    progress();

    /* after the existing handler hides the form, show the thank-you in view */
    form.addEventListener('submit', function () {
      if (form.style.display !== 'none') return;
      panel.classList.add('bk-sent');
      var ok = $('#success-msg');
      if (ok) ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });

    /* chosen-path strip (filled when a plan is picked) */
    chosen = el('div', 'bk-chosen');
    chosen.hidden = true; chosen.tabIndex = -1;
    chosen.setAttribute('role', 'status');
    chosen.innerHTML = '<span class="bk-chosen-ic" aria-hidden="true"><i class="fa-solid"></i></span>' +
      '<span class="bk-chosen-tx"><span class="bk-chosen-k">Your path</span><strong></strong> <span class="bk-chosen-p"></span>' +
      '<span class="bk-chosen-tip" hidden>Tip: mention it in your message.</span></span>' +
      '<button type="button" class="bk-chosen-x">Change</button>';
    panel.insertBefore(chosen, form);
  }

  /* ---------- pricing: pick a plan -> pre-fill + scroll to the form ---------- */
  var price = $('.bk-price'), plans = $$('.bk-plan');
  function pick(p, go) {
    plans.forEach(function (q) { q.classList.toggle('bk-picked', q === p); });
    if (p.getAttribute('data-bk-service')) setService(p.getAttribute('data-bk-service'));
    if (chosen) {
      var name = $('.bk-plan-name', p).textContent, pr = $('.bk-plan-price', p);
      var cnt = $('.bk-count', pr);
      $('strong', chosen).textContent = name;
      $('.bk-chosen-p', chosen).textContent = '\u00b7 ' + (cnt ? (cnt.getAttribute('data-bk-pre') || '') + (+cnt.getAttribute('data-bk-to')).toLocaleString('en-US') : pr.textContent.trim());
      $('.bk-chosen-ic i', chosen).className = 'fa-solid ' + (p.getAttribute('data-bk-icon') || 'fa-check');
      $('.bk-chosen-tip', chosen).hidden = !p.getAttribute('data-bk-tip');
      chosen.hidden = false;
      chosen.style.animation = 'none'; void chosen.offsetWidth; chosen.style.animation = '';
    }
    if (go && panel) {
      panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (chosen) chosen.focus({ preventScroll: true });
    }
  }
  plans.forEach(function (p) {
    var cta = $('.bk-plan-cta', p);
    if (cta) cta.addEventListener('click', function (e) { if (!panel) return; e.preventDefault(); pick(p, true); });
    p.addEventListener('click', function (e) { if (e.target.closest('a, button') || !panel) return; pick(p, true); });
    if (!fine) return;
    p.addEventListener('pointermove', function (e) {
      var r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      p.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); p.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      if (reduce) return;
      p.classList.add('bk-tilting');
      p.style.setProperty('--rx', ((.5 - y) * 5).toFixed(2) + 'deg'); p.style.setProperty('--ry', ((x - .5) * 6).toFixed(2) + 'deg');
    });
    p.addEventListener('pointerleave', function () {
      p.classList.remove('bk-tilting'); p.style.setProperty('--rx', '0deg'); p.style.setProperty('--ry', '0deg');
    });
  });
  if (chosen) $('.bk-chosen-x', chosen).addEventListener('click', function () {
    price.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    var p = $('.bk-plan.bk-picked .bk-plan-cta') || $('.bk-plan-cta'); if (p) p.focus({ preventScroll: true });
  });

  /* mobile: price switcher synced with a swipeable track */
  if (price && plans.length) {
    var track = $('#bk-plans'), cells = $$('.bk-plan-cell', track);
    var sw = el('div', 'bk-switch'); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Choose a session option');
    sw.appendChild(el('span', 'bk-sw-ind')).setAttribute('aria-hidden', 'true');
    var sws = cells.map(function (c, i) {
      var b = el('button', 'bk-sw'); b.type = 'button';
      b.textContent = $('.bk-plan-price', c).textContent.trim();
      b.setAttribute('aria-label', $('.bk-plan-name', c).textContent + ', ' + b.textContent);
      b.setAttribute('aria-pressed', i ? 'false' : 'true');
      b.addEventListener('click', function () {
        track.scrollTo({ left: c.offsetLeft - track.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
        mark(i);
      });
      sw.appendChild(b); return b;
    });
    /* the S$2,300 pill should read the final value even before the count-up */
    var cnt0 = $('.bk-count', track);
    if (cnt0) sws[0].textContent = cnt0.getAttribute('data-bk-pre') + (+cnt0.getAttribute('data-bk-to')).toLocaleString('en-US');
    track.parentNode.insertBefore(sw, track);
    price.classList.add('bk-live');
    function mark(i) { sw.style.setProperty('--i', i); sws.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); }); }
    var raf = 0;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
        cells.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - track.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
        mark(best);
      });
    }, { passive: true });
  }

  /* ---------- sidebar: Where We Work / Session Lengths tabs ---------- */
  var info = $('.bk-info');
  if (info) {
    var tl = $('.bk-tabs', info), tabs = $$('.bk-tabbtn', info), panes = $$('.bk-pane', info);
    tl.hidden = false; tl.setAttribute('role', 'tablist'); tl.setAttribute('aria-label', 'Session details');
    info.classList.add('bk-tabbed');
    tabs.forEach(function (t, i) {
      t.setAttribute('role', 'tab'); t.setAttribute('aria-controls', panes[i].id);
      panes[i].setAttribute('role', 'tabpanel'); panes[i].setAttribute('aria-labelledby', t.id); panes[i].tabIndex = 0;
      t.addEventListener('click', function () { tab(i); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return; e.preventDefault(); n = (n + tabs.length) % tabs.length; tab(n); tabs[n].focus();
      });
    });
    function tab(i) {
      info.style.setProperty('--i', i);
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j ? 'true' : 'false'); t.tabIndex = i === j ? 0 : -1; });
      panes.forEach(function (p, j) { p.hidden = i !== j; p.classList.remove('bk-grow'); });
      var p = panes[i]; void p.offsetWidth;
      requestAnimationFrame(function () { p.classList.add('bk-grow'); });
    }
    tab(0);
  }

  /* ---------- FAQ accordion ---------- */
  var qs = $$('.bk-q'), qb = qs.map(function (q) { return $('.bk-q-btn', q); });
  function setQ(q, open) { q.classList.toggle('bk-open', open); $('.bk-q-btn', q).setAttribute('aria-expanded', open ? 'true' : 'false'); }
  qs.forEach(function (q, i) {
    setQ(q, i === 0);
    qb[i].addEventListener('click', function () {
      var open = !q.classList.contains('bk-open');
      qs.forEach(function (x) { setQ(x, false); });
      if (open) setQ(q, true);
    });
    qb[i].addEventListener('keydown', function (e) {
      var n = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: qs.length - 1 }[e.key];
      if (n === undefined) return; e.preventDefault(); qb[(n + qs.length) % qs.length].focus();
    });
  });
})();

}catch(e){console.warn('page script', e);}