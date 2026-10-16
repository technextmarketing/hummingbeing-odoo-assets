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
    var sub = d._subject && d._subject.indexOf('Event registration') === 0 ? d._subject : '';
    var topic = sub || d.interest || 'Website enquiry';   /* same "Topic — Person" titles as the other two sites */
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

/* Register buttons point at hummingbeing.com on the static site; where Odoo serves TRE, they open this site's
   own Odoo registration, ticket window and checkout (same events, seats and payments as the other two sites). */
(function () {
  var MAP = {
"https://hummingbeing.com/event-body-in-the-room": "/event/the-body-in-the-room-5/register#register-now",
"https://hummingbeing.com/event-breath-as-medicine": "/event/breath-as-a-medicine-12/register#register-now",
"https://hummingbeing.com/event-certification-2027": "/event/become-a-certified-tretm-provider-2027-cohort-6/register#register-now",
"https://hummingbeing.com/event-2027-module1": "/event/become-a-certified-tretm-provider-2027-cohort-6/register#register-now",
"https://hummingbeing.com/event-2027-module2": "/event/become-a-certified-tretm-provider-2027-cohort-6/register#register-now",
"https://hummingbeing.com/event-2027-module3": "/event/become-a-certified-tretm-provider-2027-cohort-6/register#register-now",
"https://hummingbeing.com/event-certification": "/event/become-a-certified-tretm-provider-2026-cohort-7/register#register-now",
"https://hummingbeing.com/event-feminine-masculine-energetics": "/event/navigating-feminine-masculine-energetics-4/register#register-now",
"https://hummingbeing.com/event-internal-alchemy": "/event/internal-alchemy-introductory-workshop-9/register#register-now",
"https://hummingbeing.com/event-selfcare-coaches-singapore": "/event/nervous-system-regulation-self-induced-neurogenic-tremoring-10/register#register-now",
"https://hummingbeing.com/event-shaking-online": "/event/from-shaking-to-shaping-online-1/register#register-now",
"https://hummingbeing.com/event-shaking-to-shaping-sep3": "/event/from-shaking-to-shaping-online-3-sep-8/register#register-now",
"https://hummingbeing.com/event-shaking-to-shaping": "/event/from-shaking-to-shaping-bucharest-3/register#register-now",
"https://hummingbeing.com/event-tre-module1-bucharest": "/event/tretm-module-1-bucharest-2/register#register-now"
};
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://hummingbeing.com/event-"]');
    if (!a) return;
    var u = a.getAttribute('href').split('#')[0].split('?')[0].replace(/\.html$/, '');
    if (MAP[u]) { e.preventDefault(); window.location.href = MAP[u]; }
  }, true);
})();
