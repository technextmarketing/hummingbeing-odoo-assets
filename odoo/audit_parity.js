/* Content parity: every imported Odoo page vs the live page (live = repo commit the domain serves, byte-identical).
   Compares visible text (word by word), images (file names) and internal links. Static HTML both sides.
   Run in the logged-in bhdasia.odoo.com tab: (0,eval)(src); await PARITY()  -> window.PAR */
window.PARITY = async function () {
  const SITES = [
    {k: 'hb', w: 2, raw: 'https://raw.githubusercontent.com/technextsg/hummingbeing-website/4d8bb1ad2ed82dd4ad9f633c3ae820b682b6884d/',
     pages: {'index': '/', about: '/about', book: '/book', gallery: '/gallery', 'holistic-mastermind': '/holistic-mastermind', isabelle: '/isabelle',
             'online-session-preparation': '/online-session-preparation', 'retreats-workshops': '/retreats-workshops', socials: '/socials', 'tre-certification': '/tre-certification'},
     liveDrop: 'body > nav, body > footer, .wa-float, .top-float', odooRoot: '#wrap'},
    {k: 'bhd', w: 1, raw: 'https://raw.githubusercontent.com/TechNextSG/BHDasia/58607ff/',
     pages: {'index': '/', about: '/about', services: '/services', partners: '/partners', contact: '/contact', isabelle: '/isabelle', jasmine: '/jasmine',
             rina: '/rina', simba: '/simba', privacy: '/privacy', terms: '/terms-and-conditions', code: '/code', inclusivity: '/inclusivity',
             'online-session-preparation': '/online-session-preparation'},
     liveDrop: 'header#main-header, footer#main-footer', odooRoot: '#wrap'},
    {k: 'tre', w: 3, raw: 'https://raw.githubusercontent.com/technextmarketing/tre-singapore/1d3466d76ea29e5b447217db3c52e1e4f9b4e403/', pages: null,
     liveDrop: 'header.site-header, footer.site-footer', odooDrop: 'header.site-header, footer.site-footer', odooRoot: 'body'},
  ];
  const TRE = ['index', 'about', 'blog', 'contact', 'education', 'events', 'facilitators', 'facilitator', 'online-session-guide',
    'blog/from-provider-to-certifying-trainer', 'blog/nervous-system-habits-for-the-workday', 'blog/science-of-neurogenic-tremors', 'blog/tre-for-coaches',
    'blog/what-is-tre', 'blog/your-first-tre-session', 'events/breath-as-medicine', 'events/feminine-masculine-energetics-corporate',
    'events/from-shaking-to-shaping-bucharest', 'events/from-shaking-to-shaping-online-sep3', 'events/from-shaking-to-shaping-online',
    'events/internal-alchemy-singapore', 'events/nervous-system-regulation-coaches-singapore', 'events/the-body-in-the-room', 'events/tre-module-1-bucharest',
    'events/tre-module-2-singapore', 'events/tre-module-3-singapore', 'events/tre-provider-certification-2027-singapore',
    'events/tre-provider-certification-singapore', 'facilitators/isabelle-claus-teixeira', 'facilitators/nikki-tay', 'facilitators/rina-ho', 'facilitators/yan'];
  SITES[2].pages = Object.fromEntries(TRE.map(p => [p, p === 'index' ? '/' : '/' + p]));
  const P = new DOMParser();
  const clean = (doc, drop, root) => {
    doc.querySelectorAll('script, style, noscript, template, link, meta' + (drop ? ', ' + drop : '')).forEach(n => n.remove());
    return doc.querySelector(root) || doc.body;
  };
  const words = el => (el.textContent || '').replace(/ /g, ' ').replace(/[​﻿]/g, '').split(/\s+/).filter(Boolean);
  const imgs = el => [...el.querySelectorAll('img, source, video')].flatMap(n => [n.getAttribute('src'), n.getAttribute('poster'), ...(n.getAttribute('srcset') || '').split(',').map(x => x.trim().split(' ')[0])])
      .filter(Boolean).map(u => decodeURIComponent(u.split('?')[0].split('/').pop())).filter(Boolean);
  const links = el => [...el.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  const bag = a => { const m = new Map(); a.forEach(x => m.set(x, (m.get(x) || 0) + 1)); return m; };
  const minus = (a, b) => { const mb = bag(b), out = []; bag(a).forEach((n, k) => { const d = n - (mb.get(k) || 0); if (d > 0) out.push(d > 1 ? k + ' x' + d : k); }); return out; };
  const res = [];
  for (const S of SITES) {
    await fetch('/website/force/' + S.w + '?path=/', {credentials: 'same-origin'});
    for (const [slug, url] of Object.entries(S.pages)) {
      const r = {site: S.k, url};
      try {
        const lt = await (await fetch(S.raw + slug + '.html', {cache: 'no-store'})).text();
        const or = await fetch(url, {cache: 'no-store', credentials: 'same-origin'});
        r.status = or.status;
        const ot = await or.text();
        const L = clean(P.parseFromString(lt, 'text/html'), S.liveDrop, 'body');
        const O = clean(P.parseFromString(ot, 'text/html'), S.odooDrop, S.odooRoot);
        const lw = words(L), ow = words(O);
        r.words = [lw.length, ow.length];
        r.same = lw.join(' ') === ow.join(' ');
        if (!r.same) {
          let i = 0; while (i < lw.length && lw[i] === ow[i]) i++;
          r.firstDiff = {at: i, live: lw.slice(Math.max(0, i - 4), i + 10).join(' '), odoo: ow.slice(Math.max(0, i - 4), i + 10).join(' ')};
          r.onlyLive = minus(lw, ow).slice(0, 12); r.onlyOdoo = minus(ow, lw).slice(0, 12);
        }
        const li = imgs(L), oi = imgs(O);
        r.imgMissing = minus(li, oi).slice(0, 10);
        const ol = links(O);
        r.linksToOldSite = ol.filter(h => /hummingbeing\.com|bhdasia\.com|tre-in-singapore\.com/.test(h) && !/\.pdf/.test(h)).slice(0, 8);
        r.linkCount = [links(L).length, ol.length];
      } catch (e) { r.err = String(e); }
      res.push(r);
    }
  }
  window.PAR = res;
  return res.length;
};
'PARITY loaded';
