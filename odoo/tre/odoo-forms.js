/* TRE in Singapore on Odoo: the site's forms were built for FormSubmit (formsubmit.co). Every one of them
   sends through fetch(), so this bridge answers those calls from Odoo instead - enquiries and event
   registrations become CRM leads, newsletter sign-ups join the "TRE in Singapore newsletter" list - and
   replies {"success":"true"} like FormSubmit did, so the site's own success/failure messages keep working. */
(function () {
  var LIST_ID = 3;
  var F = window.fetch;
  if (!F) return;
  function ok() { return new Response(JSON.stringify({success: 'true'}), {status: 200, headers: {'Content-Type': 'application/json'}}); }
  function csrf() { return (window.odoo && window.odoo.csrf_token) || ''; }
  function toOdoo(d) {
    var keys = Object.keys(d).filter(function (k) { return k.charAt(0) !== '_'; });
    if (d.email && !d.name && !d.message && keys.length <= 2) {          /* newsletter sign-up */
      return F.call(window, '/website_mass_mailing/subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({jsonrpc: '2.0', method: 'call', params: {list_id: LIST_ID, value: d.email, subscription_type: 'email'}})})
        .then(function (r) { return r.json(); }).then(function (j) { if (j.error) throw new Error('subscribe failed'); return ok(); });
    }
    var topic = d._subject || ('TRE in Singapore — ' + (d.interest || d.event || 'Website enquiry'));
    var fd = new FormData();
    fd.append('csrf_token', csrf());
    fd.append('name', topic + (d.name ? ' — ' + d.name : ''));
    fd.append('contact_name', d.name || '');
    fd.append('email_from', d.email || '');
    fd.append('phone', d.phone || '');
    var lines = ['Website: TRE in Singapore', 'Page: ' + (d.page || location.href)];
    keys.forEach(function (k) { if (['name', 'email', 'phone', 'page', 'message'].indexOf(k) < 0 && d[k]) lines.push(k + ': ' + d[k]); });
    if (d.message) lines.push('', d.message);
    fd.append('description', lines.join('\n'));
    return F.call(window, '/website/form/crm.lead', {method: 'POST', body: fd})
      .then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.id) throw new Error('lead not saved'); return ok(); });
  }
  window.fetch = function (u, o) {
    var s = String((u && u.url) || u || '');
    if (s.indexOf('formsubmit.co') > -1) {
      var d = {};
      try { d = JSON.parse((o && o.body) || '{}'); } catch (e) {}
      return toOdoo(d);
    }
    return F.apply(this, arguments);
  };
})();
