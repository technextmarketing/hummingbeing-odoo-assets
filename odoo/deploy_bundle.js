/* Browser-side deployer for bhdasia.odoo.com (no API key on the PC: runs in the user's logged-in tab).
   Load:  (0,eval)(await (await fetch(RAW + 'deploy_bundle.js')).text())
   Run:   XD(RAW + 'odoo/hb/', {dry:true}) -> report;  XD(..., {}) -> deploy;  progress in window.XDLOG
   Steps: files (skip same sha1) -> site views -> pages -> 301s -> cacheable /web/content URLs (like cache_urls.py). */
window.XD = async function (base, opts) {
  opts = opts || {};
  const DRY = !!opts.dry, log = window.XDLOG = [], L = (...a) => log.push(a.join(' '));
  const ck = (m, meth, args, kw) => fetch('/web/dataset/call_kw', {method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({jsonrpc: '2.0', method: 'call', params: {model: m, method: meth, args: args || [], kwargs: kw || {}}})})
    .then(r => r.json()).then(j => { if (j.error) throw new Error(m + '.' + meth + ': ' + ((j.error.data || {}).message || JSON.stringify(j.error))); return j.result; });
  const sr = (m, d, f, kw) => ck(m, 'search_read', [d], Object.assign({fields: f}, kw || {}));
  const create = (m, v) => ck(m, 'create', [[v]]).then(r => r[0]);
  const write = (m, ids, v) => ck(m, 'write', [ids, v]);
  const abs = u => /^https?:/.test(u) ? u : base + u;
  const text = async u => { const r = await fetch(abs(u), {cache: 'no-store'}); if (!r.ok) throw new Error('fetch ' + u + ' ' + r.status); return r.text(); };
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  const b64 = buf => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(',')[1]); fr.readAsDataURL(new Blob([buf])); });
  const b64txt = s => b64(new TextEncoder().encode(s));
  const man = await (await fetch(base + 'manifest.json', {cache: 'no-store'})).json();
  const W = man.website, P = man.prefix, scope = {hb: 'hbx', tre: 'trex', bhd: 'bhdx'}[man.site];
  const out = {site: man.site, website: W, files: {created: 0, updated: 0, same: 0}, views: [], pages: [], redirects: 0, cache: 0};
  L('manifest', man.source, man.files.length, 'files');

  // 1) files
  const ex = await sr('ir.attachment', [['url', 'in', man.files.map(f => f.url)], ['type', '=', 'binary']], ['id', 'url', 'checksum', 'website_id']);
  const byUrl = {}; ex.forEach(a => byUrl[a.url] = a);
  for (const f of man.files) {
    const a = byUrl[f.url];
    if (a && a.checksum === f.sha1) { out.files.same++; continue; }
    if (DRY) { out.files[a ? 'updated' : 'created']++; continue; }
    const r = await fetch(abs(f.src), {cache: 'no-store'}); if (!r.ok) throw new Error('fetch ' + f.src + ' ' + r.status);
    const buf = await r.arrayBuffer();
    const got = hex(await crypto.subtle.digest('SHA-1', buf));
    if (got !== f.sha1) throw new Error('sha1 mismatch ' + f.url);
    const vals = {name: f.url.split('/').pop(), type: 'binary', raw: await b64(buf), mimetype: f.mimetype, public: true, url: f.url,
                  website_id: W, res_model: 'ir.ui.view', res_id: 0};
    if (a) { await write('ir.attachment', [a.id], vals); out.files.updated++; } else { await create('ir.attachment', vals); out.files.created++; }
    L('file', f.url, (buf.byteLength / 1024).toFixed(0) + ' KB');
  }

  // 2) site views (header/footer, events listing, event page)
  for (const v of man.views) {
    const arch = await text(v.arch);
    const par = v.inherit ? (await sr('ir.ui.view', [['key', '=', v.inherit], ['website_id', '=', false]], ['id']))[0] : null;
    const cur = (await sr('ir.ui.view', [['key', '=', v.key], ['website_id', '=', W]], ['id']))[0];
    const vals = Object.assign({name: v.name, key: v.key, type: 'qweb', website_id: W, arch: arch, active: true},
      par ? {inherit_id: par.id, mode: 'extension', priority: v.priority || 1000} : {mode: 'primary', priority: 16});
    if (!DRY) { if (cur) await write('ir.ui.view', [cur.id], vals); else await create('ir.ui.view', vals); }
    out.views.push((cur ? 'updated ' : 'created ') + v.key);
  }

  // 3) pages (the homepage replaces Odoo's blank starter page of this website)
  for (const p of man.pages) {
    const arch = await text(p.arch);
    const meta = {website_meta_title: p.title, website_meta_description: p.description, is_published: true, website_indexed: p.indexed !== false};
    if (p.og) meta.website_meta_og_img = p.og;
    const cur = (await sr('website.page', [['url', '=', p.url], ['website_id', '=', W]], ['id']))[0];
    const vals = p.url === '/' ? Object.assign(meta, {arch: arch, name: 'Home'})
                               : Object.assign(meta, {url: p.url, name: p.name, website_id: W, type: 'qweb', key: p.key, arch: arch});
    if (!DRY) { if (cur) await write('website.page', [cur.id], vals); else await create('website.page', vals); }
    out.pages.push((cur ? 'updated ' : 'created ') + p.url);
  }

  // 4) old addresses -> new pages
  for (const [frm, to] of Object.entries(man.redirects)) {
    const cur = (await sr('website.rewrite', [['url_from', '=', frm], ['website_id', '=', W]], ['id']))[0];
    const vals = {name: man.site.toUpperCase() + ' old URL ' + frm, url_from: frm, url_to: to, redirect_type: '301', website_id: W};
    if (!DRY) { if (cur) await write('website.rewrite', [cur.id], vals); else await create('website.rewrite', vals); }
    out.redirects++;
  }

  // 5) cacheable URLs: /<prefix>/x.webp -> /web/content/<id>/x.webp?unique=<sha1[:12]>  (Odoo serves /hb/... no-cache)
  const pre = P.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const PATH_RE = new RegExp(pre + "[A-Za-z0-9_.\\-/]+?\\.(?:css|js|webp|png|jpe?g|gif|svg|ico|mp4|webm|mp3|pdf|woff2?|avif)(?:\\?v=[0-9A-Za-z._-]+)?(?=[\"')\\s,;&<]|$)", 'g');
  const CONT_RE = /\/web\/content\/(\d+)\/[A-Za-z0-9_.\-]+\?unique=[0-9a-f]+/g;
  const atts = async () => { const rows = await sr('ir.attachment', [['type', '=', 'binary'], ['url', '=like', P + '%']], ['id', 'url', 'checksum']);
    const u = {}, i = {}; rows.filter(r => r.checksum).forEach(r => { u[r.url] = r; i[r.id] = r; }); return [u, i]; };
  const curl = a => '/web/content/' + a.id + '/' + a.url.split('/').pop().replace(/[^A-Za-z0-9_.\-]/g, '-') + '?unique=' + a.checksum.slice(0, 12);
  const rewrite = (s, u, i) => { let n = 0;
    s = s.replace(CONT_RE, (m, id) => { const a = i[+id]; if (!a) return m; const nw = curl(a); if (nw !== m) n++; return nw; });
    s = s.replace(PATH_RE, m => { const a = u[m.split('?')[0]]; if (!a) return m; n++; return curl(a); });
    return [s, n]; };
  if (!DRY && man.cache !== false) {
    let [u, i] = await atts();
    for (const a of Object.values(u)) {                      // stylesheets + scripts first (they point at images/video)
      if (!/\.(css|js)$/.test(a.url)) continue;
      const src = await (await fetch('/web/content/' + a.id + '?unique=' + a.checksum.slice(0, 12))).text();
      const [nw, n] = rewrite(src, u, i);
      if (n) { await write('ir.attachment', [a.id], {raw: await b64txt(nw), mimetype: a.url.endsWith('.css') ? 'text/css' : 'application/javascript'}); out.cache += n; }
    }
    [u, i] = await atts();
    const w = (await sr('website', [['id', '=', W]], ['custom_code_head', 'custom_code_footer']))[0];
    const wv = {};
    for (const f of ['custom_code_head', 'custom_code_footer']) { const [nw, n] = rewrite(w[f] || '', u, i); if (n) { wv[f] = nw; out.cache += n; } }
    if (Object.keys(wv).length) await write('website', [W], wv);
    const views = await sr('ir.ui.view', [['key', '=like', scope + '.%'], ['website_id', '=', W]], ['id']);
    const pages = await sr('website.page', [['website_id', '=', W]], ['view_id']);
    const ids = [...new Set(views.map(v => v.id).concat(pages.map(p => p.view_id[0])))];
    for (const id of ids) {
      const arch = (await ck('ir.ui.view', 'read', [[id], ['arch_db']]))[0].arch_db || '';
      const [nw, n] = rewrite(arch, u, i);
      if (n) { await write('ir.ui.view', [id], {arch_db: nw}); out.cache += n; }
    }
  }
  L('done'); return out;
};
'XD loaded';
