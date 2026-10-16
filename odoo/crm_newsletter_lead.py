# Odoo server action (mailing.subscription) - "Newsletter sign-up -> CRM lead" (user, 16 Oct: every website form
# lands in the one CRM). Runs on every new list subscription from any of the three sites; the lead then goes
# through "Categorise website leads" (site / interest / source / team). One lead per email: no duplicates.
LIST_SITE_TAG = {1: 11, 2: 10, 3: 13}      # BHD Asia / HummingBeing / TRE in Singapore newsletter -> site tag
T_NEWS = 25
for sub in records:
    c = sub.contact_id
    email = (c.email or '').strip()
    if not email or sub.opt_out:
        continue
    if env['crm.lead'].with_context(active_test=False).search_count([('email_from', '=ilike', email), ('tag_ids', 'in', [T_NEWS])]):
        continue
    tags = [T_NEWS] + ([LIST_SITE_TAG[sub.list_id.id]] if sub.list_id.id in LIST_SITE_TAG else [])
    env['crm.lead'].create({
        'name': 'Newsletter sign-up — ' + (c.name or email),
        'contact_name': c.name or False,
        'email_from': email,
        'type': 'lead',
        'team_id': 5,
        'tag_ids': [(6, 0, tags)],
        'description': 'Joined the ' + (sub.list_id.name or 'newsletter') + ' from the website.',
    })
