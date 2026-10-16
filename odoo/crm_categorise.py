# Odoo server action (crm.lead) - "Categorise website leads". Runs on every new lead (base.automation)
# and can be run on selected leads. Adds ONE site tag, ONE type tag and ONE interest tag (never removes
# tags; a group that already has a tag is left alone), links the event, and sets source / medium / team.
# Site comes from the form's "Website: ..." line, the event order's website, or the team.
SITE_TAG = {'bhd': 11, 'hb': 10, 'tre': 13}
SITE_SRC = {'bhd': 16, 'hb': 17, 'tre': 18}
SITE_TEAM = {'bhd': 5, 'hb': 4, 'tre': 4}
WEB_SITE = {1: 'bhd', 2: 'hb', 3: 'tre'}
SRC_SITE = {16: 'bhd', 17: 'hb', 18: 'tre'}
TAG_SITE = {11: 'bhd', 10: 'hb', 13: 'tre'}
T_REG, T_ENQ, T_GEN, T_CALL = 9, 12, 14, 15
TYPES = [T_REG, T_ENQ, T_GEN, T_CALL]
I_SESS, I_COACH, I_MIND, I_CERT, I_CORP, I_WORK, I_DIR, I_MEDIA, I_OTHER = 16, 17, 18, 19, 20, 21, 22, 23, 24
INTERESTS = [I_SESS, I_COACH, I_MIND, I_CERT, I_CORP, I_WORK, I_DIR, I_MEDIA, I_OTHER]
RULES = [
    (I_CERT, ['certification', 'certified tre', 'certified provider', 'module 1', 'module 2', 'module 3', 'cohort', 'trainee']),
    (I_CORP, ['organisation', 'organization', 'corporate', 'hr / wellbeing', 'team programme']),
    (I_COACH, ['coaching']),
    (I_MIND, ['mindfulness']),
    (I_WORK, ['workshop', 'event or workshop']),
    (I_SESS, ['individual or group session', '(tension', 'tre session']),
    (I_DIR, ['directory listing']),
    (I_MEDIA, ['media / partnership', 'partnership']),
]
CALL_WORDS = ['discovery call', '1:1 session', 'supervision', 'prepaid package', 'third-party programme session']
for lead in records:
    tags = lead.tag_ids.ids
    desc = (lead.description or '')
    d = str(desc).lower().replace(' :', ':')
    name = (lead.name or '').lower()
    # ---- site
    site = SRC_SITE.get(lead.source_id.id)
    if not site:
        if 'website: tre in singapore' in d or 'website: tre singapore' in d:
            site = 'tre'
        elif 'website: hummingbeing' in d:
            site = 'hb'
        elif 'website: bhd asia' in d:
            site = 'bhd'
    if not site:
        for t in tags:
            if t in TAG_SITE:
                site = TAG_SITE[t]
    reg = lead.registration_ids[:1]
    if not site and reg:
        wid = reg.sale_order_id.website_id.id or reg.visitor_id.website_id.id
        site = WEB_SITE.get(wid)
    if not site:
        site = 'hb' if lead.team_id.id == 4 else 'bhd'
    add = [SITE_TAG[site]]
    # ---- the event, for event registrations sent by a site form ("Event registration — <title>")
    if not lead.event_id and 'event registration' in name:
        title = (lead.name or '').split('—', 1)[-1].split(' — ')[0].strip()
        ev = env['event.event'].search([('name', '=ilike', title)], limit=1) if title else env['event.event']
        if ev:
            lead.write({'event_id': ev.id})
    # ---- type
    is_call = bool(lead.calendar_event_ids) or any(w in name for w in CALL_WORDS)
    if not [t for t in tags if t in TYPES]:
        if reg or 'event registration' in name:
            add.append(T_REG)
        elif is_call:
            add.append(T_CALL)
        elif lead.event_id or name.startswith('event enquiry'):
            add.append(T_ENQ)
        else:
            add.append(T_GEN)
    # ---- interest (topic fields only, not the free-text message)
    if not [t for t in tags if t in INTERESTS]:
        topic = name + ' ' + (lead.event_id.name or '').lower()
        for key in ('interest:', 'enquiry:', 'who:', 'service:'):
            i = d.find(key)
            if i >= 0:
                j = d.find('<', i)
                topic += ' ' + d[i + len(key):(j if j > i else i + 160)]
        hit = False
        for tag_id, words in RULES:
            if not hit and any(w in topic for w in words):
                add.append(tag_id)
                hit = True
        if not hit:
            add.append(I_WORK if (lead.event_id or reg) else I_OTHER)
    vals = {}
    new = [t for t in add if t not in tags]
    if new:
        vals['tag_ids'] = [(4, t) for t in new]
    if not lead.source_id:
        vals['source_id'] = SITE_SRC[site]
    if not lead.medium_id:
        vals['medium_id'] = 7
    if not lead.user_id and lead.team_id.id != SITE_TEAM[site]:
        vals['team_id'] = SITE_TEAM[site]
    if vals:
        lead.write(vals)
