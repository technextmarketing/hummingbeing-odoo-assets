/* BHD Asia on Odoo - built from BHDasia (master) */
;
/* clean URLs: someone who lands on /about.html sees /about (index.html -> /) */
(function () {
  var p = location.pathname;
  if (!/\.html$/i.test(p) || /\/(google[^/]*|404)\.html$/i.test(p)) return;
  var c = p.replace(/(^|\/)index\.html$/i, '$1').replace(/\.html$/i, '');
  try { history.replaceState(history.state, '', c + location.search + location.hash); } catch (e) {}
})();
(function(){
  document.documentElement.classList.add('js');
  // Skip-to-content link (accessibility)
  var skip = document.createElement('a');
  skip.href = '#et-main-area';
  skip.className = 'skip-link';
  skip.textContent = 'Skip to content';
  document.body.insertBefore(skip, document.body.firstChild);

  // Header scroll: shadow + auto-hide on scroll down, reveal on scroll up
  var header = document.getElementById('main-header');
  var lastY = window.scrollY;
  function updateHeader(){
    var y = window.scrollY;
    if(y > 10){ header.classList.add('et-fixed-header'); }
    else { header.classList.remove('et-fixed-header'); }
    if(document.body.classList.contains('mobile-nav-open')){
      header.classList.remove('header-hidden');
      lastY = y; return;
    }
    if(y > 180 && y > lastY + 4){
      header.classList.add('header-hidden');
    } else if(y < lastY - 4 || y <= 10){
      header.classList.remove('header-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', updateHeader, {passive:true});
  updateHeader();

  // Hamburger toggle with aria-expanded
  var hamburgerBtn = document.getElementById('mobile-menu-btn');
  if(hamburgerBtn){
    hamburgerBtn.addEventListener('click', function(){
      var isOpen = document.body.classList.toggle('mobile-nav-open');
      this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      this.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('#top-menu a').forEach(function(a){
    a.addEventListener('click', function(){
      document.body.classList.remove('mobile-nav-open');
      if(hamburgerBtn){
        hamburgerBtn.setAttribute('aria-expanded','false');
        hamburgerBtn.setAttribute('aria-label','Open navigation');
      }
    });
  });

  // Scroll-reveal — animate sections into view
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var srSelectors = [
    '.pillar-card','.partner-card','.event-card','.value-card',
    '.service-category','.coaching-package','.team-card','.team-member',
    '.interview-grid','.stats-bar','.countdown-section',
    '.et_pb_section','.et_pb_section_grey',
    '.featured-wrap','.isabelle-section','.contact-grid',
    '.section-head','.page-intro','.mission-card',
    '.newsletter-section','.blurb-item','.clients-section',
  ];
  if(!prefersReducedMotion){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
    srSelectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el,i){
        el.classList.add('sr');
        if(i<4) el.classList.add('sr-d'+(i+1));
        observer.observe(el);
      });
    });
  }

  // Safety net: never leave content invisible if the observer stalls (hidden tab, zoom, extension)
  setTimeout(function(){
    document.querySelectorAll('.sr:not(.visible)').forEach(function(el){ el.classList.add('visible'); });
  }, 1400);

  // Parallax — disable on mobile or when user prefers reduced motion
  var isMobile = window.matchMedia('(max-width:980px)').matches;
  var parallaxBg = document.getElementById('parallax-bg');
  if(parallaxBg && !prefersReducedMotion && !isMobile){
    window.addEventListener('scroll', function(){
      parallaxBg.style.transform = 'translateY(' + (window.scrollY * .28) + 'px)';
    }, {passive:true});
  }
})();

;
function bhdFloatHost(){var h=document.getElementById('bhd-float-host');if(!h){h=document.createElement('div');h.id='bhd-float-host';h.className='bhdx';document.body.appendChild(h);}return h;}
/* ── Floating WhatsApp button + website-aware assistant ─────── */
(function(){
  var WA = 'https://wa.me/818065151778?text=' + encodeURIComponent("Hi BHD Asia, I'd like to know more about your services.");

  // Suggestion pool — rotates randomly so repeats are minimised
  var ALL_SUG = [
    'What services do you offer?',
    'TRE™ workshops',
    'Pricing & packages',
    'Upcoming events',
    'How to book a session',
    'About BHD Asia',
    'Who is Isabelle?',
    'Stress & burnout support',
    'Tell me about coaching',
    'Conflict resolution',
    'Partner organisations',
    'Is there online support?',
    'How does it work?',
    'Where are you located?'
  ];
  var usedSug = [];

  function freshSuggestions(){
    var available = ALL_SUG.filter(function(s){ return usedSug.indexOf(s) === -1; });
    if(available.length < 5){ usedSug = []; available = ALL_SUG.slice(); }
    for(var i = available.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = available[i]; available[i] = available[j]; available[j] = tmp;
    }
    var picked = available.slice(0, 5);
    picked.forEach(function(s){ usedSug.push(s); });
    return picked;
  }

  // Knowledge base — single-word exact matches first, then broader topic patterns
  var KB = [

    // ── Single-word / short exact-match handlers ──────────────
    {
      re:/^how$/,
      a:"Happy to help! Are you asking about <strong>how to book</strong>, <strong>how our sessions work</strong>, or <strong>how much it costs</strong>? Tap a topic below or just type.",
      btns:[{t:'How to Book',u:'contact'},{t:'Pricing',u:'services'},{t:'Our Approach',u:'about'}]
    },
    {
      re:/^(who|whose)$/,
      a:"We're <strong>BHD Asia</strong> (Business and Human Development Consulting Pte Ltd) — led by <strong>Isabelle Claus Teixeira</strong>, 27+ years in HR &amp; coaching.",
      btns:[{t:'Meet the Team',u:'about'},{t:'About Isabelle',u:'isabelle'}]
    },
    {
      re:/^what$/,
      a:"We offer <strong>Organisation Development</strong>, <strong>Resilience Building</strong> (incl. TRE™), and <strong>Individual Coaching</strong>. What area interests you?",
      btns:[{t:'All Services',u:'services'},{t:'TRE™ Workshops',u:'events'}]
    },
    {
      re:/^why$/,
      a:"<strong>Why BHD Asia?</strong> We co-design bespoke solutions — not off-the-shelf programmes. 27+ years across 9 countries, blending executive coaching, somatic methods, and real HR expertise.",
      btns:[{t:'Our Story',u:'about'},{t:'Book a Free Call',u:'contact'}]
    },
    {
      re:/^(help|\?+|start|menu|topics?|options?)$/,
      a:"Here's what I can help with:<br>• <strong>Services</strong> — what we offer<br>• <strong>TRE™ workshops</strong> — dates &amp; pricing<br>• <strong>Coaching</strong> — executive &amp; career<br>• <strong>Events</strong> — upcoming workshops<br>• <strong>Team</strong> — about Isabelle<br>• <strong>Location &amp; online</strong> — where we work<br>• <strong>Contact</strong> — how to reach us<br><br>Just type any topic!",
      btns:[{t:'Services',u:'services'},{t:'Events',u:'events'},{t:'Contact',u:'contact'}]
    },
    {
      re:/^(yes|yeah|yep|yup|ok|okay|sure|go ahead|sounds good)$/,
      a:"Great! What would you like to know? Ask about our <strong>services</strong>, <strong>pricing</strong>, <strong>TRE™ workshops</strong>, or how to <strong>book a session</strong>.",
      btns:[{t:'Services',u:'services'},{t:'Events',u:'events'},{t:'Contact',u:'contact'}]
    },
    {
      re:/^(no|nope|nah|not now|later)$/,
      a:"No problem at all! Feel free to come back anytime. You can always reach us at <a href='mailto:bonjour@bhdasia.com'>bonjour@bhdasia.com</a>.",
      btns:[]
    },

    // ── Topic handlers ────────────────────────────────────────
    {
      re:/(service|services|offer|offering|programme|programs?|help with|what do you|what you do|specialise|specialize|expertise|capabilities?|solutions?)/,
      a:"We focus on three areas: <strong>Organisation Development</strong>, <strong>Resilience Building</strong> (TRE™, somatic coaching, stress &amp; burnout), and <strong>Individual Development</strong> (executive, career &amp; transition coaching). Each solution is co-designed with you.",
      btns:[{t:'View All Services',u:'services'},{t:'Book a Free Call',u:'contact'}]
    },
    {
      re:/(\btre\b|tension|trauma|somatic|tremor|neurogenic|releasing exercise|nervous system|body.?based|bodywork)/,
      a:"<strong>TRE™ (Tension &amp; Trauma Releasing Exercises)</strong> is a neurogenic method that helps the body release deep muscle tension and stress without detailed discussion of past events. We run open workshops — Module 1 (personal use) and Modules 2/3 (provider certification).",
      btns:[{t:'See TRE™ Events',u:'events'},{t:'Enquire Now',u:'contact'}]
    },
    {
      re:/(event|events|workshop|workshops|upcoming|module|when|next date|schedule|calendar|dates?|availability|timetable|course|training|certif)/,
      a:"Our next workshops: <strong>TRE™ for Personal Use (Module 1)</strong> — <strong>29–30 Aug 2026</strong>, and <strong>TRE™ Certification (Module 2)</strong> — 26–27 Sep 2026. Both in-person, Singapore.",
      btns:[{t:'View All Events',u:'events'},{t:'Reserve a Spot',u:'contact'}]
    },
    {
      re:/(price|pricing|cost|fee|how much|rate|sgd|dollar|package|invest|money|budget|afford|pay|payment)/,
      a:"The 2026 TRE™ certification intake is closed. The <strong>2027 Singapore cohort</strong> opens with Module 1 on 27–28 February 2027, co-taught by Isabelle Claus Teixeira and Simba Stenqvist, with <strong>early-bird pricing until 31 December 2026</strong>. Our 8-week individual coaching package is <strong>SGD 2,200</strong>. Group and corporate rates on request.",
      btns:[{t:'Full Pricing',u:'services'},{t:'Ask About Rates',u:'contact'}]
    },
    {
      re:/(contact|email|phone|call|reach|whatsapp|enquire|inquire|message|get in touch|speak|talk|connect)/,
      a:"You can reach us by email at <a href='mailto:bonjour@bhdasia.com'>bonjour@bhdasia.com</a>, call or WhatsApp <strong>+81 80 6515 1778</strong>, or fill in our online contact form.",
      btns:[{t:'Contact Form',u:'contact'}]
    },
    {
      re:/(location|where|address|office|located|based|singapore|raffles|online|virtual|remote|in.?person|hybrid)/,
      a:"Based at <strong>50 Raffles Place, Singapore Land Tower #30-00, Singapore 048623</strong>. We also work remotely with clients across Asia Pacific, Japan, Europe, and beyond.",
      btns:[{t:'Contact Us',u:'contact'},{t:'About BHD Asia',u:'about'}]
    },
    {
      re:/(isabelle|founder|who runs|co.?founder|director|team|staff|people|credentials?|qualif)/,
      a:"<strong>Isabelle Claus Teixeira</strong> is our founder — 27+ years in HR leadership across 9 countries, certified coach since 2012, TRE™ provider, and Forbes Coaches Council contributor.",
      btns:[{t:'Meet Isabelle',u:'isabelle'},{t:'Our Team',u:'about#team'}]
    },
    {
      re:/(resilience|resilient|stress|burnout|burn.?out|anxiety|overwhelm|wellbeing|well.?being|mental.?health|pressure|fatigue|exhaust|psychological.?safety)/,
      a:"Our <strong>Resilience Building</strong> programmes include TRE™ (neurogenic stress release), somatic coaching, burnout prevention, stress management, and psychological safety workshops.",
      btns:[{t:'Resilience Services',u:'services'},{t:'TRE™ Events',u:'events'}]
    },
    {
      re:/(hr|human.?resource|talent|organisat|organizat|culture|change.?management|facilitat|corporate|leadership.?develop|workforce)/,
      a:"Our <strong>Organisation Development</strong> practice covers HR &amp; Talent Management advisory, high-performing team facilitation, culture transformation, leadership development, and change management.",
      btns:[{t:'Org Development',u:'services'},{t:'Talk to Us',u:'contact'}]
    },
    {
      re:/(mediat|conflict|dispute|disagree|difficult.?conversation|resolution|simi)/,
      a:"We facilitate <em>Challenging Conversations &amp; Constructive Conflict</em> workshops and support leaders and teams with professional conflict resolution.",
      btns:[{t:'Our Services',u:'services'},{t:'Book a Consult',u:'contact'}]
    },
    {
      re:/(about|company|bhd|background|history|who are you|what is bhd|mission|values?|philosophy|approach|methodology|how.*work|how does)/,
      a:"<strong>BHD Asia</strong> is a boutique HR consulting, executive coaching and leadership development firm. Founded in Singapore in 2012, we co-design bespoke solutions for clients across Asia Pacific and globally.",
      btns:[{t:'About Us',u:'about'},{t:'Our Services',u:'services'}]
    },
    {
      re:/(book|booking|appointment|sign.?up|register|enrol|enroll|reserve|1.?on.?1|one.?on.?one|free call|consult|discovery|get started|next step|how do i|how to)/,
      a:"To book, use our <a href='/contact'>Contact form</a> or WhatsApp <strong>+81 80 6515 1778</strong> to schedule a free discovery conversation — no commitment needed.",
      btns:[{t:'Book a Free 1:1',u:'contact'}]
    },
    {
      re:/(coaching|executive.?coach|leadership.?coach|career.?coach|transition.?coach|performance.?coach|life.?coach|personal.?develop|growth|goal)/,
      a:"Our coaching covers <strong>Executive Coaching</strong>, <strong>Transition Coaching</strong>, <strong>Performance Coaching</strong>, <strong>Career Coaching</strong>, Self-Awareness Development, and 360° Debriefs — all fully co-designed.",
      btns:[{t:'Coaching Services',u:'services'},{t:'Book a Consult',u:'contact'}]
    },
    {
      re:/(partner|associate|network|client|clients|who.*(work|worked)|companies|testimonial|review|results|forbes|icf|noomii)/,
      a:"We've worked with ByteDance (TikTok), Novartis, Philips, VISA, Mastercard, Heineken APAC, and more. Isabelle is a Forbes Coaches Council contributor and ICF-certified coach.",
      btns:[{t:'Our Partners',u:'partners'},{t:'Our Story',u:'about'}]
    },
    {
      re:/(^(hi|hello|hey|hiya|greetings|yo|howdy|sup)$|^good (morning|afternoon|evening)|how are you)/,
      a:"Hello! I'm the BHD Asia assistant 👋 I can help with services, TRE™ workshops, pricing, events, our team, and how to get in touch. What would you like to know?",
      btns:[]
    },
    {
      re:/(thank|thanks|cheers|appreciate|great|perfect|helpful|awesome|wonderful)/,
      a:"You're very welcome! Feel free to ask anything else, or reach us at <a href='mailto:bonjour@bhdasia.com'>bonjour@bhdasia.com</a>.",
      btns:[]
    },
    {re:/(bye|goodbye|see you|farewell|that.?s all)/, a:"Thanks for visiting BHD Asia. Have a wonderful day! 😊", btns:[]}
  ];

  var FALLBACK_A = "I can help with our <strong>services</strong>, <strong>TRE™ workshops</strong>, <strong>pricing</strong>, <strong>events</strong>, <strong>location</strong> and <strong>contact</strong>. For anything specific, reach Isabelle at <a href='mailto:bonjour@bhdasia.com'>bonjour@bhdasia.com</a> or WhatsApp +81 80 6515 1778.";
  var FALLBACK_BTNS = [{t:'Services',u:'services'},{t:'Events',u:'events'},{t:'Contact Us',u:'contact'}];

  function answerFor(raw){
    var t = raw.toLowerCase().replace(/['".,!?;:()–—]/g,' ').replace(/\s+/g,' ').trim();
    if(!t) t = raw.toLowerCase().trim();
    for(var i=0;i<KB.length;i++){
      if(KB[i].re.test(t)) return {a:KB[i].a, btns:KB[i].btns};
    }
    // Short unrecognised input — echo the word and redirect helpfully
    if(t.length <= 25){
      return {
        a:"I'm not sure about <em>\"" + esc(raw.trim().substring(0,40)) + "\"</em> — try asking about <strong>services</strong>, <strong>pricing</strong>, <strong>TRE™ workshops</strong>, <strong>events</strong>, or <strong>contact</strong>.",
        btns:[{t:'Services',u:'services'},{t:'Events',u:'events'},{t:'Contact',u:'contact'}]
      };
    }
    return {a:FALLBACK_A, btns:FALLBACK_BTNS};
  }

  // FAB
  var fab = document.createElement('div');
  fab.id = 'bhd-fab';
  fab.innerHTML =
    '<a class="bhd-fab-btn bhd-wa" href="' + WA + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.5 2.1 7.9L.3 31.6l8-2.1c2.3 1.3 4.9 1.9 7.7 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.4 16 .4zm0 28.3c-2.5 0-4.9-.7-7-1.9l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.4-2.2-2.1-4.7-2.1-7.2C2.9 8.6 8.8 2.8 16 2.8s13.1 5.8 13.1 13.1S23.2 28.7 16 28.7zm7.2-9.8c-.4-.2-2.3-1.2-2.7-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.6-.2.2-.5.3-.9.1-.4-.2-1.6-.6-3.1-1.9-1.2-1-1.9-2.3-2.2-2.7-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.7-.6-.6-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.3 6.8 6 .9.4 1.7.6 2.3.8.9.3 1.8.2 2.5.2.8-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.4z"/></svg></a>' +
    '<button class="bhd-fab-btn bhd-chat-toggle" aria-label="Open chat assistant" title="Chat with us"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>';
  bhdFloatHost().appendChild(fab);

  // Chat panel
  var chat = document.createElement('div');
  chat.id = 'bhd-chat';
  chat.className = 'bhd-chat-closed';
  chat.setAttribute('role','dialog');
  chat.setAttribute('aria-label','BHD Asia assistant');
  chat.innerHTML =
    '<div class="bhd-chat-head"><div class="bhd-chat-head-info"><span class="bhd-chat-title">BHD Asia Assistant</span><span class="bhd-chat-status"><span class="bhd-status-dot"></span>Typically replies instantly</span></div><button class="bhd-chat-close" aria-label="Close chat">×</button></div>' +
    '<div class="bhd-chat-msgs" id="bhd-chat-msgs"></div>' +
    '<div class="bhd-chat-quick" id="bhd-chat-quick"></div>' +
    '<form class="bhd-chat-input" id="bhd-chat-form"><input type="text" id="bhd-chat-text" placeholder="Ask about our services…" autocomplete="off"/><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></form>';
  bhdFloatHost().appendChild(chat);

  var msgs = chat.querySelector('#bhd-chat-msgs');
  var quick = chat.querySelector('#bhd-chat-quick');
  var form = chat.querySelector('#bhd-chat-form');
  var input = chat.querySelector('#bhd-chat-text');
  var toggle = fab.querySelector('.bhd-chat-toggle');
  var closeBtn = chat.querySelector('.bhd-chat-close');
  var greeted = false;

  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function addUserMsg(text){
    var d = document.createElement('div');
    d.className = 'bhd-msg bhd-msg-user';
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addBotMsg(result){
    var d = document.createElement('div');
    d.className = 'bhd-msg bhd-msg-bot';
    var html = '<div class="bhd-msg-label">BHD Asia</div>' + result.a;
    if(result.btns && result.btns.length){
      html += '<div class="bhd-msg-btns">' +
        result.btns.map(function(b){
          return '<a href="' + (/^(https?:|mailto:|tel:|\/|#)/.test(b.u) ? b.u : (b.u === 'events' ? '/event' : '/' + b.u)) + '" class="bhd-msg-btn">' + b.t + '</a>';
        }).join('') + '</div>';
    }
    d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function renderSuggestions(){
    quick.innerHTML = '';
    freshSuggestions().forEach(function(q){
      var b = document.createElement('button');
      b.className = 'bhd-quick-btn';
      b.type = 'button';
      b.textContent = q;
      b.addEventListener('click', function(){ send(q); });
      quick.appendChild(b);
    });
  }

  function botReply(text){
    var typing = document.createElement('div');
    typing.className = 'bhd-chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function(){
      if(typing.parentNode) typing.parentNode.removeChild(typing);
      addBotMsg(answerFor(text));
      renderSuggestions();
    }, 600);
  }

  function send(text){
    text = (text || '').trim();
    if(!text) return;
    addUserMsg(text);
    botReply(text);
  }

  renderSuggestions();

  function openChat(){
    chat.classList.remove('bhd-chat-closed');
    if(!greeted){ greeted = true; botReply('hello'); }
    setTimeout(function(){ input.focus(); }, 250);
  }
  function closeChat(){ chat.classList.add('bhd-chat-closed'); }

  toggle.addEventListener('click', function(){
    if(chat.classList.contains('bhd-chat-closed')) openChat(); else closeChat();
  });
  closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = input.value;
    input.value = '';
    send(v);
  });
})();

;
/* ===== Featured events + countdowns: single source of truth =====
   Every page reads this list. An event whose start time has passed, or with
   soldOut:true, is skipped automatically everywhere: the homepage featured
   cards, the events-page countdown and every event-page countdown roll over
   to the next active event on their own. To close an event set soldOut:true;
   to add one, add an entry (keep the list in date order). */
(function(){
  var EVENTS=[].map.call(document.querySelectorAll('#xev-data > i'),function(n){
    return {id:n.getAttribute('data-id'),page:n.getAttribute('data-page'),start:n.getAttribute('data-date'),
      soldOut:n.getAttribute('data-sold')==='1',cdTitle:n.getAttribute('data-title'),cdMeta:(n.querySelector('.m')||{}).innerHTML||'',
      link:n.getAttribute('data-href'),linkText:n.getAttribute('data-linktext')};
  });
  window.BHD_EVENTS=EVENTS;

  var CAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  var PIN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  function activeEvents(){
    var now=new Date(),out=[],i;
    for(i=0;i<EVENTS.length;i++){
      if(!EVENTS[i].soldOut&&new Date(EVENTS[i].start)>now)out.push(EVENTS[i]);
    }
    out.sort(function(a,b){return new Date(a.start)-new Date(b.start)});
    return out;
  }
  var pageFile=((document.getElementById('xev-page')||{}).getAttribute?document.getElementById('xev-page').getAttribute('data-page'):'')||'events';

  /* --- Homepage featured cards: always the next two active events --- */
  var homeGrid=document.querySelector('.home-events-grid:not([data-xev])');
  if(homeGrid){
    var hl=activeEvents(),seen={},feat=[],h;
    for(h=0;h<hl.length&&feat.length<2;h++){
      if(hl[h].card&&!seen[hl[h].page]){seen[hl[h].page]=1;feat.push(hl[h]);}
    }
    if(feat.length){
      homeGrid.innerHTML=feat.map(function(e){
        var c=e.card,ext=/^https?:/i.test(c.url)?' target="_blank" rel="noopener"':'';
        return '<div class="home-evt-card">'
          +'<div class="hec-img"><img src="'+c.img+'" alt="'+c.alt+'" width="1920" height="1080" loading="lazy"/></div>'
          +'<div class="hec-body">'
          +'<span class="hec-tag">'+c.tag+'</span>'
          +'<div class="hec-date">'+CAL+c.date+'</div>'
          +'<h3>'+c.title+'</h3>'
          +'<p>'+c.desc+'</p>'
          +'<div class="hec-footer">'
          +'<span class="hec-meta">'+PIN+c.venue+'</span>'
          +'<a class="et_pb_button" href="'+c.url+'"'+ext+'>'+c.cta+' &rarr;</a>'
          +'</div></div></div>';
      }).join('');
    }else{
      homeGrid.innerHTML='<div class="home-evt-card"><div class="hec-body"><span class="hec-tag">Upcoming Events</span><h3>New dates coming soon</h3><p>New workshops and certification dates are announced here first &mdash; check back soon.</p><div class="hec-footer"><span class="hec-meta"></span><a class="et_pb_button" href="/event">View All Events &rarr;</a></div></div></div>';
    }
  }

  /* --- Countdown: any page with an #event-countdown block --- */
  var timerEl=document.getElementById('event-countdown');
  if(timerEl&&timerEl.closest){
    var section=timerEl.closest('.countdown-section,.home-countdown');
    var scope=section||document,timerId=null,hadTarget=false;
    var pad=function(n){return String(n).padStart(2,'0')};
    var setNum=function(id,val){
      var el=document.getElementById(id);
      if(!el||el.textContent===val)return;
      el.textContent=val;
      el.classList.remove('c-flip');void el.offsetWidth;el.classList.add('c-flip');
    };
    var render=function(){
      var list=activeEvents(),own=null,i;
      for(i=0;i<list.length;i++){if(list[i].page===pageFile){own=list[i];break}}
      var target=own||list[0];
      if(!target){
        if(hadTarget){timerEl.innerHTML='<p style="color:var(--blue);font-weight:700;font-size:16px;margin:0">This event has started!</p>';}
        else if(section){section.style.display='none';}
        return;
      }
      hadTarget=true;
      var tEl=scope.querySelector('.countdown-title');if(tEl)tEl.innerHTML=target.cdTitle;
      var mEl=scope.querySelector('.cd-meta-text');if(mEl)mEl.innerHTML=target.cdMeta;
      if(!own){
        var lEl=scope.querySelector('.countdown-text .section-label');if(lEl)lEl.textContent='Next Upcoming Event';
        var aEl=scope.querySelector('.countdown-text a.et_pb_button');
        if(aEl){
          aEl.innerHTML=target.linkText+' &rarr;';
          aEl.setAttribute('href',target.link);
          if(/^https?:/i.test(target.link)){aEl.setAttribute('target','_blank');aEl.setAttribute('rel','noopener');}
          else{aEl.removeAttribute('target');aEl.removeAttribute('rel');}
        }
      }
      var goal=new Date(target.start);
      var tick=function(){
        var diff=goal-new Date();
        if(diff<=0){render();return;}
        setNum('c-days',pad(Math.floor(diff/86400000)));
        setNum('c-hours',pad(Math.floor(diff%86400000/3600000)));
        setNum('c-mins',pad(Math.floor(diff%3600000/60000)));
        setNum('c-secs',pad(Math.floor(diff%60000/1000)));
        timerId=setTimeout(tick,1000);
      };
      if(timerId)clearTimeout(timerId);
      tick();
    };
    render();
  }

  /* --- Events page grid: retire cards whose event has fully passed --- */
  var eventsGrid=document.querySelector('.events-grid');
  if(eventsGrid){
    var hasFuture={},now=new Date(),g;
    for(g=0;g<EVENTS.length;g++){
      if(!EVENTS[g].soldOut&&new Date(EVENTS[g].start)>now)hasFuture[EVENTS[g].page]=true;
    }
    var pastCards=[];
    eventsGrid.querySelectorAll('.evt-card[data-evt-page]').forEach(function(cardEl){
      var p=cardEl.getAttribute('data-evt-page');
      if(hasFuture[p]||cardEl.classList.contains('is-sold')||cardEl.classList.contains('is-past'))return;
      cardEl.classList.add('is-past');
      var img=cardEl.querySelector('.ec-img');
      if(img&&!img.querySelector('.ec-soldout')){
        var b=document.createElement('span');b.className='ec-soldout';b.textContent='Event Ended';img.insertBefore(b,img.firstChild);
      }
      var fill=cardEl.querySelector('.ec-btn-fill');
      if(fill){fill.textContent='View Event';fill.setAttribute('href',p);fill.removeAttribute('target');fill.removeAttribute('rel');}
      pastCards.push(cardEl);
    });
    /* Order: available upcoming first (priority), then sold-out, then past at the very back */
    eventsGrid.querySelectorAll('.evt-card.is-sold').forEach(function(c){eventsGrid.appendChild(c);});
    pastCards.forEach(function(c){eventsGrid.appendChild(c);});
  }
})();

;
/* ════════════════════════════════════════════════════════════════════════
   INTERACTIVE LAYER — 2026-09-30 (ported from hummingbeing.com)
   buttons · mobile menu sheet. Styles in style.css, same heading.
   ════════════════════════════════════════════════════════════════════════ */
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
  // Dark or light surface behind an element: nearest opaque background colour, else anything
  // painting an image/video (hero photos and videos count as dark).
  function onDark(el) {
    for (var e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/gradient/.test(cs.backgroundImage)) return true;
      if (e.querySelector(':scope > video, :scope > .evt-hero-img, :scope > img.hero-bg, :scope > canvas')) return true;
      if (alpha(cs.backgroundColor) > .5) return lum(cs.backgroundColor) < .35;
      if (/gradient/.test(cs.backgroundImage)) {
        var cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).filter(function (c) { return alpha(c) >= .5; });
        if (cols.length) { var avg = cols.reduce(function (t, c) { return t + lum(c); }, 0) / cols.length; return avg < .35; }
      }
    }
    return false;
  }

  /* ---------- buttons ---------- */
  var SEL = '.et_pb_button, .ec-btn-fill, .ec-btn-outline, .header-contact-btn';
  function setXY(b, e) {
    var r = b.getBoundingClientRect();
    b.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
    b.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
  }
  function initButtons() {
    document.querySelectorAll(SEL).forEach(function (b) {
      if (b.dataset.bhdBtn) return; b.dataset.bhdBtn = '1';
      if (b.classList.contains('et_pb_button')) b.classList.add(onDark(b) ? 'on-dark' : 'on-light');
      if (b.tagName === 'A' && b.classList.contains('et_pb_button') && !b.querySelector('.btn-arr, svg')) {
        var lt = b.lastChild;
        if (lt && lt.nodeType === 3) lt.nodeValue = lt.nodeValue.replace(/\s*[→➜⟶]\s*$/, '');
        var s = document.createElement('span'); s.className = 'btn-arr'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = ARROW; b.appendChild(s);
      }
      b.addEventListener('pointerdown', function (e) { setXY(b, e); });
      if (!fine) return;
      b.addEventListener('pointerenter', function (e) { setXY(b, e); });
      if (reduce) return;
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.setProperty('--mx', (dx * .18).toFixed(1) + 'px');
        b.style.setProperty('--my', (dy * .28).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function (e) {
        setXY(b, e); b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- mobile menu sheet ---------- */
  function initMenu() {
    var btn = document.getElementById('mobile-menu-btn'), ul = document.getElementById('top-menu');
    if (!btn || !ul) return;
    if (!btn.querySelector('.mm-l')) btn.innerHTML = '<span class="mm-l"></span><span class="mm-l"></span><span class="mm-l"></span>';
    if (!ul.querySelector('.nav-extra')) {
      var li = document.createElement('li'); li.className = 'nav-extra';
      li.innerHTML =
        '<div class="ne-row">' +
          '<a href="mailto:bonjour@bhdasia.com"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>bonjour@bhdasia.com</a>' +
          '<a href="https://wa.me/818065151778" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9.5 9.5c.3 1.8 2.2 3.8 4 4.2l1.2-1.1 1.8.9c-.3 1-1.2 1.6-2.2 1.5-3.2-.3-6.3-3.4-6.6-6.6-.1-1 .5-1.9 1.5-2.2l.9 1.8z"/></svg>WhatsApp</a>' +
        '</div>' +
        '<div class="ne-soc">' +
          '<a href="https://www.linkedin.com/in/isabelleclausteixeira/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5v6M8 7.5h.01M11.5 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5M11.5 10.5v6"/></svg></a>' +
          '<a href="https://www.instagram.com/isabelleclausteixeira_bhd/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/></svg></a>' +
          '<a href="https://www.youtube.com/@IsabelleClausTeixeira" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5v5l4.5-2.5z"/></svg></a>' +
          '<a href="https://www.facebook.com/bhdasia/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" class="fill"><path d="M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.5h-2.6C11.8 2.5 10.5 4 10.5 6.4v2.1H8v3h2.5V21.5h3.5v-10h2.6l.4-3z"/></svg></a>' +
        '</div>';
      ul.appendChild(li);
    }
    function close() {
      if (!document.body.classList.contains('mobile-nav-open')) return;
      document.body.classList.remove('mobile-nav-open');
      btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open navigation');
    }
    btn.addEventListener('click', function () {
      if (document.body.classList.contains('mobile-nav-open')) {
        var first = ul.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('mobile-nav-open')) { close(); btn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) close(); });
  }

  function start() { initButtons(); initMenu(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.bhdInitButtons = initButtons; // for content injected later (event grids, countdown, agents' pages)
})();

/* ════════════════════════════════════════════════════════════════════════
   EVENT PAGES (.evt-hero) INTERACTIVE LAYER — 2026-09-30 (from hummingbeing)
   Reads BHD_EVENTS (defined above) so status and related events never go stale.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  var hero = document.querySelector('.evt-hero');
  if (!hero) return;
  var body = document.body, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  var EV = window.BHD_EVENTS || [], now = Date.now();
  var here = ((document.getElementById('xev-page') ? document.getElementById('xev-page').getAttribute('data-page') : '') || 'index').toLowerCase();
  body.classList.add('evt-live');

  /* hero: parallax + pointer glow */
  var img = $('.evt-hero-img', hero);
  var glow = document.createElement('span'); glow.className = 'ev-glow'; glow.setAttribute('aria-hidden', 'true');
  hero.insertBefore(glow, $('.evt-hero-inner', hero));
  if (!reduce && img) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { tick = false; var y = window.scrollY || 0; if (y < hero.offsetHeight + 200) img.style.setProperty('--ev-py', (y * .2).toFixed(1) + 'px'); });
    }, { passive: true });
    if (fine) hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--ev-gx', (x * 100).toFixed(1) + '%'); hero.style.setProperty('--ev-gy', (y * 100).toFixed(1) + '%');
      img.style.setProperty('--ev-px', ((.5 - x) * 16).toFixed(1) + 'px');
    });
  }

  /* reveals */
  var io = (!reduce && 'IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ev-in'); io.unobserve(en.target); } });
  }, { threshold: .08, rootMargin: '0px 0px -5% 0px' }) : null;
  function mark(root) {
    ['.evt-facts-grid > *', '.evt-main > .evt-section', '.evt-sidebar > *', '.related-grid > .rel-card', '.facilitator-card', '.schedule-grid > *', '.included-list > li', '.pricing-cards > *', '.module-path > *', '.session-cards > *'].forEach(function (sel) {
      $$(sel, root).forEach(function (el) {
        if (el.classList.contains('ev-rv') || el.closest('.evt-hero')) return;
        var i = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
        el.style.setProperty('--ev-d', Math.min(i, 6) * 70 + 'ms');
        el.classList.add('ev-rv');
        if (io) io.observe(el); else el.classList.add('ev-in');
      });
    });
  }
  mark(document);
  setTimeout(function () { $$('.ev-rv:not(.ev-in)').forEach(function (el) { el.classList.add('ev-in'); }); }, 1600);

  /* status for this page */
  var mine = EV.filter(function (e) { return (e.page || '').toLowerCase() === here; });
  var live = mine.filter(function (e) { return !e.soldOut && Date.parse(e.start) > now; }).sort(function (a, b) { return Date.parse(a.start) - Date.parse(b.start); });
  var status = !mine.length ? '' : live.length ? 'upcoming' : mine.every(function (e) { return e.soldOut; }) ? 'sold' : mine.some(function (e) { return e.soldOut && Date.parse(e.start) > now; }) ? 'sold' : 'past';
  function inDays(t) { var d = Math.ceil((Date.parse(t) - Date.now()) / 864e5); return d <= 1 ? 'Starts tomorrow' : 'Starts in ' + d + ' days'; }
  var label = status === 'upcoming' ? inDays(live[0].start) : status === 'sold' ? 'Sold out' : status === 'past' ? 'This event has passed' : '';
  var badges = $('.evt-hero-top', hero);
  if (label && badges && !/sold|pass|ended|postpon/i.test(badges.textContent) && !$('.ev-status', badges)) {
    var chip = document.createElement('span'); chip.className = 'evt-badge ev-status is-' + status; chip.textContent = label; badges.appendChild(chip);
  }
  if (status === 'past' && !$('.ev-past-note')) {
    var note = document.createElement('div'); note.className = 'ev-past-note';
    note.innerHTML = '<div><p><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>This event has already taken place.</p><a href="/event" class="et_pb_button btn-outline">See upcoming events</a></div>';
    var facts = $('.evt-facts'); (facts || hero).parentNode.insertBefore(note, (facts || hero).nextSibling);
  }

  /* live "other upcoming events" */
  var grid = $('.related-grid');
  var seen = {};
  var next = EV.filter(function (e) { return (e.page || '').toLowerCase() !== here && !e.soldOut && Date.parse(e.start) > now && e.card; })
    .sort(function (a, b) { return Date.parse(a.start) - Date.parse(b.start); })
    .filter(function (e) { if (seen[e.page]) return false; seen[e.page] = 1; return true; }).slice(0, 3);
  function txt(h) { var d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.trim(); }
  if (grid && next.length) {
    grid.innerHTML = '';
    next.forEach(function (e) {
      var a = document.createElement('a'); a.className = 'rel-card'; a.href = e.page;
      var ri = document.createElement('div'); ri.className = 'rel-img';
      var im = document.createElement('img'); im.src = e.card.img; im.alt = txt(e.card.alt || e.card.title); im.width = 400; im.height = 220; im.loading = 'lazy'; im.decoding = 'async';
      ri.appendChild(im); a.appendChild(ri);
      var b = document.createElement('div'); b.className = 'rel-body';
      var st = document.createElement('strong'); st.textContent = txt(e.card.title);
      var sp = document.createElement('span'); sp.textContent = txt(e.card.date).replace(/\s*·\s*/g, ' · ');
      var w = document.createElement('span'); w.className = 'ev-rel-when'; w.textContent = inDays(e.start);
      b.appendChild(st); b.appendChild(sp); b.appendChild(w); a.appendChild(b); grid.appendChild(a);
    });
    var sec = grid.parentNode;
    if (!$('.ev-rel-all', sec)) { var p = document.createElement('p'); p.className = 'ev-rel-all'; p.innerHTML = '<a href="/event" class="et_pb_button btn-outline">See all events</a>'; sec.appendChild(p); }
    mark(sec);
  }

  /* phone booking bar */
  var cta = $('.evt-hero-ctas a.et_pb_button');
  if (cta && status !== 'past' && status !== 'sold') {
    var bar = document.createElement('div'); bar.className = 'ev-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Book this event');
    var t = document.createElement('div'); t.className = 'ev-bar-t';
    var h1 = $('h1', hero), bb = document.createElement('b'); bb.textContent = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : document.title;
    var bs = document.createElement('span'); bs.textContent = label || '';
    t.appendChild(bb); t.appendChild(bs); bar.appendChild(t);
    var btn = cta.cloneNode(true); btn.removeAttribute('id'); delete btn.dataset.bhdBtn; btn.classList.remove('on-dark', 'on-light', 'btn-white', 'btn-white-outline'); $$('.btn-arr', btn).forEach(function (x) { x.remove(); });
    var lbl = btn.textContent.replace(/[→\s]+$/, '').trim();
    if (lbl.length > 16) btn.textContent = /zoom/i.test(lbl) ? 'Join on Zoom' : /waitlist/i.test(lbl) ? 'Waitlist' : 'Register';
    bar.appendChild(btn); body.appendChild(bar);
    var heroOut = false, blockers = 0, seenMap = new Map();
    function upd() { body.classList.toggle('ev-bar-on', heroOut && blockers === 0); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; upd(); }).observe(hero);
      var bo = new IntersectionObserver(function (es) { es.forEach(function (en) { seenMap.set(en.target, en.isIntersecting); }); blockers = 0; seenMap.forEach(function (v) { if (v) blockers++; }); upd(); }, { threshold: .15 });
      $$('#register, .evt-reg-card, #main-footer').forEach(function (el) { bo.observe(el); });
    }
  }
  if (window.bhdInitButtons) window.bhdInitButtons();
})();

/* ════════════════════════════════════════════════════════════════════════
   WARM LIGHT THEME — 2026-09-30 (styles in style.css, same heading)
   Heroes are light now: re-tag their buttons, soften the magnetic pull,
   add slow drifting colour from the logo palette behind hero copy.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lightHeroButtons() {
    document.querySelectorAll('.hero .et_pb_button, .page-title-wrap .et_pb_button, .evt-hero .et_pb_button').forEach(function (b) {
      b.classList.remove('on-dark'); b.classList.add('on-light');
    });
  }
  function softenMagnet() {
    document.querySelectorAll('.et_pb_button, .ec-btn-fill, .ec-btn-outline, .header-contact-btn').forEach(function (b) {
      if (b.dataset.warm) return; b.dataset.warm = '1';
      b.addEventListener('pointermove', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }
  function blobs() {
    if (reduce) return;
    document.querySelectorAll('.hero, .page-title-wrap, .evt-hero').forEach(function (h) {
      if (h.querySelector('.warm-blobs')) return;
      var d = document.createElement('div'); d.className = 'warm-blobs'; d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<i></i><i></i><i></i>';
      var ov = h.querySelector('.hero-overlay, .page-hero-overlay, .evt-hero-overlay');
      if (ov && ov.nextSibling) h.insertBefore(d, ov.nextSibling); else h.appendChild(d);
    });
  }
  function start() { lightHeroButtons(); softenMagnet(); blobs(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  var wrap = window.bhdInitButtons;
  window.bhdInitButtons = function () { if (wrap) wrap(); lightHeroButtons(); softenMagnet(); };
})();

/* v9 — transparent header only where a dark hero sits under it */
(function () {
  var h = document.getElementById('main-header'); if (!h) return;
  var hero = document.querySelector('.hero, .page-title-wrap, .evt-hero');
  var top = hero ? hero.getBoundingClientRect().top + (window.scrollY || 0) : 999;
  if (!hero || top > 80) h.classList.add('hdr-solid');
})();

/* v11 — animated, interactive dark CTA cards */
(function () {
  var SEL = '.hx-cta, .sv-cta-in, .ab-cta > .ab-wrap, .ev-cta-in, .pt-cta-card, .ct-cta-card, .ct-book, .bio-cta > .bhd-container, .cta-strip > .bhd-container';
  var INNER = '.hx-cta, .sv-cta-in, .ev-cta-in, .pt-cta-card, .ct-cta-card, .ct-book, .ab-wrap';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function init() {
    var cards = [].slice.call(document.querySelectorAll(SEL)).filter(function (el) {
      return !(el.matches('.cta-strip > .bhd-container') && el.querySelector(INNER));
    });
    cards.forEach(function (card) {
      if (card.classList.contains('v11-card')) return;
      card.classList.add('v11-card');
      var g = document.createElement('span'); g.className = 'v11-glow'; g.setAttribute('aria-hidden', 'true');
      g.innerHTML = '<i></i><i></i><b></b>'; card.insertBefore(g, card.firstChild);
      var tx = 88, ty = 0, cx = 88, cy = 0, raf = 0;
      function paint() {
        card.style.setProperty('--v11x', cx.toFixed(1) + '%'); card.style.setProperty('--v11y', cy.toFixed(1) + '%');
        g.style.transform = 'translate3d(' + ((cx - 50) * .06).toFixed(2) + 'px,' + ((cy - 50) * .06).toFixed(2) + 'px,0)';
      }
      function tick() {
        cx += (tx - cx) * .12; cy += (ty - cy) * .12; paint();
        raf = (Math.abs(tx - cx) > .2 || Math.abs(ty - cy) > .2) ? requestAnimationFrame(tick) : 0;
      }
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = card.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
        if (reduce) { cx = tx; cy = ty; paint(); return; }
        if (!raf) raf = requestAnimationFrame(tick);
      });
      card.addEventListener('pointerenter', function () { card.classList.add('v11-hot'); });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('v11-hot'); tx = 88; ty = 0;
        if (reduce) { cx = tx; cy = ty; paint(); } else if (!raf) raf = requestAnimationFrame(tick);
      });
      if (reduce || !('IntersectionObserver' in window)) return;
      if (card.getBoundingClientRect().top < innerHeight * .9) return;   /* already on screen: no entrance */
      card.classList.add('v11-wait');
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect(); card.classList.remove('v11-wait'); card.classList.add('v11-in');
        setTimeout(function () { card.classList.remove('v11-in'); }, 2900);
      }, { threshold: .18 });
      io.observe(card);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* v11 — auto-advance for every switcher: tabs, rosters, timelines, the partners
   list and horizontal card strips. Moves on every 3s and loops; pauses while the
   visitor hovers, reads (text selected), uses the keyboard in it, or has just
   picked an item; picks up the count again once they leave. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var STEP = 3000, HOLD = 6000, units = [];
  window.__bhdAuto = units;
  function vis(el) { return !!(el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'); }
  function common(a, b) { if (!b) return a; var n = a; while (n && !n.contains(b)) n = n.parentElement; return n || a; }
  function unit(zone, o) {
    var u = { zone: zone, t: 0, hover: false, hold: 0, inView: false, o: o };
    zone.classList.add('ac-zone');
    zone.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') u.hover = true; });
    zone.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') u.hover = false; });
    zone.addEventListener('pointerdown', function () { u.hold = Date.now() + HOLD; u.t = 0; }, true);
    zone.addEventListener('click', function (e) { if (e.isTrusted) { u.hold = Date.now() + HOLD; u.t = 0; } }, true);
    zone.addEventListener('keydown', function () { u.hold = Date.now() + HOLD; u.t = 0; }, true);
    zone.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { u.hold = Date.now() + HOLD; } }, { passive: true });
    zone.addEventListener('touchstart', function () { u.hold = Date.now() + HOLD; u.t = 0; }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var e = en[0]; u.inView = e.isIntersecting && (e.intersectionRatio >= .3 || e.intersectionRect.height >= innerHeight * .45);
      }, { threshold: [0, .15, .3, .5, .75, 1] }).observe(zone);
    } else u.inView = true;
    units.push(u); return u;
  }
  function paused(u) {
    if (!u.inView || document.hidden || u.hover || Date.now() < u.hold) return true;
    var f = u.zone.querySelector(':focus-visible'); if (f) return true;
    var s = window.getSelection && getSelection();
    if (s && !s.isCollapsed && s.anchorNode && u.zone.contains(s.anchorNode)) return true;
    return false;
  }
  /* progress line inside the active tab */
  function bar(tab, p) {
    if (!tab) return;
    var b = tab.querySelector(':scope > .ac-prog');
    if (!b) {
      [].forEach.call(document.querySelectorAll('.ac-prog'), function (x) { if (x.parentElement.closest('.ac-zone') === tab.closest('.ac-zone') && x.parentElement !== tab) x.remove(); });
      b = document.createElement('span'); b.className = 'ac-prog'; b.setAttribute('aria-hidden', 'true'); b.innerHTML = '<i></i>';
      tab.classList.add('ac-tab'); tab.appendChild(b);
    }
    b.firstChild.style.transform = 'scaleX(' + p.toFixed(3) + ')';
  }
  /* programmatic click that leaves the URL alone (some tabs write a #hash) */
  function press(el) {
    var href = location.href, st = history.state, y = scrollY;
    el.click();
    if (location.href !== href) { try { history.replaceState(st, '', href); } catch (e) {} }
    if (Math.abs(scrollY - y) > 2) scrollTo(scrollX, y);
  }

  function tabsUnit(list, opt) {
    opt = opt || {};
    var tabs = function () { return [].slice.call(list.querySelectorAll('[role="tab"]')).filter(vis); };
    var first = tabs()[0]; if (!first) return;
    var panel = document.getElementById(first.getAttribute('aria-controls') || '');
    var u = unit(opt.zone || common(list, panel), opt);
    u.ok = function () { return vis(list) && tabs().length > 1 && (!opt.when || opt.when()); };
    u.cur = function () { var t = tabs(), i = t.findIndex(function (x) { return x.getAttribute('aria-selected') === 'true'; }); return { t: t, i: i < 0 ? 0 : i }; };
    u.show = function (p) { if (opt.bar === false) return; var c = u.cur(); bar(c.t[c.i], p); };
    u.next = function () { var c = u.cur(); press(c.t[(c.i + 1) % c.t.length]); };
  }

  function stripUnit(el) {
    var u = unit(el, {});
    u.ok = function () { return vis(el) && el.scrollWidth > el.clientWidth + 8; };
    u.show = function () {};
    u.next = function () {
      var kids = [].slice.call(el.children).filter(vis); if (!kids.length) return;
      var end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 6;
      if (end) { el.scrollTo({ left: 0, behavior: 'smooth' }); return; }
      var x0 = el.getBoundingClientRect().left, target = null;
      for (var i = 0; i < kids.length; i++) { if (kids[i].getBoundingClientRect().left - x0 > 8) { target = kids[i]; break; } }
      var dx = target ? target.getBoundingClientRect().left - x0 : el.clientWidth;
      el.scrollBy({ left: dx, behavior: 'smooth' });
    };
  }

  function init() {
    /* the homepage pillars had their own 9s one-shot rotation: this engine takes over */
    var pil = document.querySelector('.hx-pil'); if (pil) pil.classList.remove('hx-pil-auto');
    [].forEach.call(document.querySelectorAll('[role="tablist"]'), function (l) {
      if (l.closest('#main-header, #main-footer')) return;
      if (l.matches('.ev-pills, [aria-label^="Filter"]')) return;           /* filters are not slides */
      if (l.matches('.sv-pkg-switch')) { tabsUnit(l, { zone: l.parentElement }); return; } /* phones: one package at a time */
      if (l.matches('.bio-tl-track')) { tabsUnit(l, { bar: false, zone: l.closest('section') || l.parentElement }); return; }
      tabsUnit(l);
    });
    /* partners: list + detail card on wide screens */
    var pw = document.querySelector('.pt-wrap');
    if (pw) {
      var trig = function () { return [].slice.call(pw.querySelectorAll('.pt-trig')).filter(vis); };
      var u = unit(pw, {});
      u.ok = function () { return pw.classList.contains('pt-desk') && trig().length > 1; };
      u.cur = function () { var t = trig(), i = t.findIndex(function (x) { return x.getAttribute('aria-expanded') === 'true'; }); return { t: t, i: i < 0 ? 0 : i }; };
      u.show = function (p) { var c = u.cur(); bar(c.t[c.i], p); };
      u.next = function () { var c = u.cur(); press(c.t[(c.i + 1) % c.t.length]); };
    }
    /* horizontal snap strips (event cards, bio highlights on phones, ...) */
    [].forEach.call(document.querySelectorAll('body *'), function (el) {
      if (el.closest('#main-header, #main-footer, [role="tablist"]') || el.querySelector('[role="tab"]')) return;
      var cs = getComputedStyle(el);
      if (/x|both|inline/.test(cs.scrollSnapType) && /(auto|scroll)/.test(cs.overflowX)) stripUnit(el);
    });
    var last = Date.now();
    setInterval(function () {
      var now = Date.now(), dt = Math.min(now - last, 250); last = now;
      units.forEach(function (u) {
        if (!u.ok()) return;
        if (!paused(u)) u.t += dt;
        if (u.t >= STEP) { u.t = 0; u.next(); }
        u.show(u.t / STEP);
      });
    }, 80);
  }
  if (document.readyState !== 'loading') setTimeout(init, 400);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 400); });
})();
;

/* ==========================================================================
   EVENTS PAGE (ev-) — one script, runs after shared.js.
   1. Date-driven status (unchanged behaviour): badge every .evt-card, move
      passed and sold-out events into #past-events-grid, order #up-grid by date,
      hide the archive when it is empty.
   2. Countdown: shared.js stays the only timer and keeps writing #c-days..#c-secs;
      we mirror those values as rolling digits + progress bars, show the time in
      the visitor's zone and build an .ics for the event shown (Blob, no network).
   3. Listing: filter pills (same categories / same matching as before) with live
      counts, sliding indicator, FLIP re-layout and arrow-key tabs; Grid / By-month
      view; date blocks + "Starts in" chips; pointer tilt + spotlight; reveal.
   4. Past events: swipeable strip with arrows + progress.
   ========================================================================== */
(function () {
  'use strict';
  var d = document, W = window;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  var mqReduce = W.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = W.matchMedia('(hover: hover) and (pointer: fine)');
  var canAnim = typeof Element.prototype.animate === 'function';
  function still() { return mqReduce.matches || !canAnim; }
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  var DAY = 864e5;
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function ms(s, e) { return s ? Date.parse(s + (e ? 'T23:59:59' : 'T00:00:00') + '+08:00') : NaN; }

  var nextSec = $('.ev-next'), upSec = $('#events-grid'), pastSec = $('#past-events'), ctaSec = $('.ev-cta');
  var up = $('#up-grid'), past = $('#past-events-grid');
  [nextSec, upSec, pastSec, ctaSec].forEach(function (s) { if (s) s.classList.add('ev-js'); });

  /* ---- 1. Date-driven event status: runs every load ------------------------- */
  var now = Date.now();
  var LABEL = { sold: 'Sold Out', past: 'Passed', ongoing: 'Ongoing', upcoming: 'Upcoming' };
  function statusOf(c) {
    if (c.getAttribute('data-sold') === 'true') return 'sold';
    var em = ms(c.getAttribute('data-end') || c.getAttribute('data-start'), true),
        sm = c.getAttribute('data-start') ? ms(c.getAttribute('data-start'), false) : em;
    if (!isNaN(em) && em < now) return 'past';
    if (!isNaN(sm) && sm <= now && (isNaN(em) || now <= em)) return 'ongoing';
    return 'upcoming';
  }
  $$('.evt-card').forEach(function (c) {
    var st = statusOf(c); c.setAttribute('data-status', st);
    var img = c.querySelector('.ec-img');
    if (img) {
      img.querySelectorAll('.ec-soldout,.ec-badge').forEach(function (b) { b.remove(); });
      c.classList.remove('is-sold', 'is-past');
      if (st === 'sold') c.classList.add('is-sold');
      if (st === 'past') c.classList.add('is-past');
      var b = d.createElement('span'); b.className = 'ec-badge ' + st; b.textContent = LABEL[st]; img.insertBefore(b, img.firstChild);
    }
    if (st === 'past' || st === 'sold') {
      var soldBtn = st === 'past' && c.querySelector('.ec-btn-sold');
      if (soldBtn) { var sp = d.createElement('span'); sp.className = 'ec-btn ec-btn-ended'; sp.textContent = 'Event Ended'; soldBtn.replaceWith(sp); }
      if (past && c.parentElement !== past) past.appendChild(c);
    } else if (up && c.parentElement !== up) { c.classList.remove('hidden', 'ev-hide'); up.appendChild(c); }
  });
  if (up) {
    var order = { ongoing: 0, upcoming: 0, sold: 1 };
    var live0 = $$('.evt-card', up);
    live0.sort(function (a, b) {
      var ga = order[a.getAttribute('data-status')] || 0, gb = order[b.getAttribute('data-status')] || 0;
      if (ga !== gb) return ga - gb;
      var sa = ms(a.getAttribute('data-start'), 0), sb = ms(b.getAttribute('data-start'), 0);
      if (isNaN(sa)) sa = Infinity; if (isNaN(sb)) sb = Infinity;
      return sa - sb;
    });
    live0.forEach(function (c) { up.appendChild(c); });
  }
  if (past) { /* archive order: sold out first (soonest first), then passed (most recent first) */
    $$('.evt-card', past).sort(function (a, b) {
      var sa = a.getAttribute('data-status') === 'sold', sb = b.getAttribute('data-status') === 'sold';
      if (sa !== sb) return sa ? -1 : 1;
      if (sa) return ms(a.getAttribute('data-start'), 0) - ms(b.getAttribute('data-start'), 0);
      return ms(b.getAttribute('data-end') || b.getAttribute('data-start'), 1) - ms(a.getAttribute('data-end') || a.getAttribute('data-start'), 1);
    }).forEach(function (c) { past.appendChild(c); });
  }
  if (pastSec && past && !past.querySelector('.evt-card')) pastSec.style.display = 'none';

  /* ---- Scroll reveal (with a safety net so nothing stays hidden) ---------------- */
  var hasIO = 'IntersectionObserver' in W, ioFired = false;
  function reveal(el) { el.classList.add('ev-in'); }
  var revealIO = hasIO ? new IntersectionObserver(function (entries) {
    ioFired = true;
    entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); })
      .forEach(function (e, i) {
        var el = e.target;
        if (el.classList.contains('ev-rc')) {
          el.style.setProperty('--d', Math.min(i, 6) * 90 + 'ms');
          setTimeout(function () { el.style.removeProperty('--d'); }, 1500);
        }
        reveal(el); revealIO.unobserve(el);
      });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  function watch(el) { if (revealIO && !still()) revealIO.observe(el); else reveal(el); }
  $$('.evt-card').forEach(function (c) { c.classList.add('ev-rc'); });
  var rvAll = $$('.ev-rv, .evt-card.ev-rc');
  rvAll.forEach(watch);
  setTimeout(function () {
    rvAll.forEach(function (el) {
      if (el.classList.contains('ev-in')) return;
      if (!ioFired || el.getBoundingClientRect().top < innerHeight) { reveal(el); if (revealIO) revealIO.unobserve(el); }
    });
  }, 1500);

  /* ---- 2. Countdown: rolling digits mirroring shared.js ------------------------ */
  (function () {
    var box = $('#event-countdown'); if (!nextSec || !box) return;
    function col() {
      var c = d.createElement('span'); c.className = 'ev-col';
      var st = d.createElement('span'); st.className = 'ev-strip-d';
      for (var i = 0; i < 10; i++) { var n = d.createElement('span'); n.textContent = i; st.appendChild(n); }
      c.appendChild(st); return c;
    }
    var MAX = { h: 24, m: 60, s: 60 };
    $$('.ev-tile', box).forEach(function (tile) {
      var src = tile.querySelector('.c-n'); if (!src) return;
      var roll = d.createElement('span'); roll.className = 'ev-roll'; roll.setAttribute('aria-hidden', 'true');
      src.parentNode.insertBefore(roll, src);
      var u = tile.getAttribute('data-u');
      function paint() {
        var v = (src.textContent || '').trim();
        if (!/^\d+$/.test(v)) { roll.innerHTML = ''; var t = d.createElement('span'); t.className = 'ev-roll-t'; t.textContent = v || '--'; roll.appendChild(t); return; }
        if (roll.querySelector('.ev-roll-t')) roll.innerHTML = '';
        while (roll.children.length < v.length) roll.insertBefore(col(), roll.firstChild);
        while (roll.children.length > v.length) roll.removeChild(roll.firstChild);
        for (var i = 0; i < v.length; i++) roll.children[i].firstChild.style.setProperty('--ev-n', v.charAt(i));
        var n = +v, max = u === 'd' ? Math.max(30, n + 1) : MAX[u];
        tile.style.setProperty('--ev-f', Math.min(1, n / max).toFixed(3));
      }
      paint();
      if ('MutationObserver' in W) new MutationObserver(paint).observe(src, { childList: true, characterData: true, subtree: true });
    });

    /* the event shown = same rule shared.js uses (first active event in its registry) */
    var pageFile = ((location.pathname.split('/').pop()||'index').replace(/\.html$/i,'')||'index').toLowerCase();
    function shown() {
      var L = W.BHD_EVENTS; if (!L || !L.length) return null;
      var t = new Date(), list = L.filter(function (e) { return !e.soldOut && new Date(e.start) > t; })
        .sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
      for (var i = 0; i < list.length; i++) if (list[i].page === pageFile) return list[i];
      return list[0] || null;
    }
    function txt(h) { var t = d.createElement('textarea'); t.innerHTML = h || ''; return t.value.replace(/\s+/g, ' ').trim(); }

    var local = $('#ev-local'), lastLocal = '';
    function paintLocal() {
      var e = shown(); if (!local) return;
      if (!e) { local.hidden = true; return; }
      var s = '';
      try {
        s = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(e.start));
      } catch (err) { s = ''; }
      if (!s) { local.hidden = true; return; }
      if (s === lastLocal) return; lastLocal = s;
      local.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>Starts in your time zone: <strong></strong></span>';
      local.querySelector('strong').textContent = s;
      local.hidden = false;
    }
    paintLocal();
    var titleEl = $('.countdown-title', nextSec);
    if (titleEl && 'MutationObserver' in W) new MutationObserver(paintLocal).observe(titleEl, { childList: true, characterData: true, subtree: true });

    /* Add to calendar: .ics built client-side from the registry entry */
    var ics = $('#ev-ics'), msg = $('#ev-ics-msg');
    if (ics && W.BHD_EVENTS && typeof Blob === 'function' && W.URL && URL.createObjectURL) {
      ics.hidden = false;
      ics.addEventListener('click', function () {
        var e = shown(); if (!e) return;
        var title = txt(e.cdTitle), meta = txt(e.cdMeta), start = new Date(e.start);
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        function utc(x) { return x.getUTCFullYear() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()) + 'T' + pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + pad(x.getUTCSeconds()) + 'Z'; }
        function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
        var lines = [], when;
        var tr = meta.match(/(\d{1,2})(?::(\d{2}))?\s*[\u2013\u2014-]\s*(\d{1,2})(?::(\d{2}))?\s*([AP]M)?/i);
        var dr = meta.match(new RegExp('(\\d{1,2})\\s*[\\u2013\\u2014-]\\s*(\\d{1,2})\\s+(' + MONTH.join('|') + ')'));
        if (tr && (tr[5] || tr[2] || tr[4])) {
          var sH = +tr[1], eH = +tr[3], pm = tr[5] && /pm/i.test(tr[5]);
          if (pm) { if (sH < 12) sH += 12; if (eH < 12) eH += 12; }
          var mins = (eH * 60 + (+tr[4] || 0)) - (sH * 60 + (+tr[2] || 0));
          if (!(mins > 0 && mins <= 16 * 60)) mins = 120;
          when = ['DTSTART:' + utc(start), 'DTEND:' + utc(new Date(start.getTime() + mins * 6e4))];
        } else if (dr) {
          var p = String(e.start).slice(0, 10).split('-'), n = Math.max(1, +dr[2] - +dr[1] + 1);
          var s0 = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])), s1 = new Date(s0.getTime() + n * DAY);
          var dv = function (x) { return x.getUTCFullYear() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()); };
          when = ['DTSTART;VALUE=DATE:' + dv(s0), 'DTEND;VALUE=DATE:' + dv(s1)];
        } else {
          when = ['DTSTART:' + utc(start), 'DTEND:' + utc(new Date(start.getTime() + 2 * 36e5))];
        }
        var url = new URL(e.link || e.page, location.href).href;
        var parts = meta.split(/\s*\u00b7\s*/), loc = parts[parts.length - 1] || '';
        lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BHD Asia//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
          'UID:' + (e.id || 'event') + '-' + String(e.start).slice(0, 10).replace(/-/g, '') + '@bhdasia.com',
          'DTSTAMP:' + utc(new Date())].concat(when, [
          'SUMMARY:' + esc(title), 'DESCRIPTION:' + esc(meta + '\n' + url), 'LOCATION:' + esc(loc), 'URL:' + url,
          'END:VEVENT', 'END:VCALENDAR']);
        var body = lines.map(function (l) {                       /* fold long lines (RFC 5545) */
          var out = []; while (l.length > 70) { out.push(l.slice(0, 70)); l = ' ' + l.slice(70); } out.push(l); return out.join('\r\n');
        }).join('\r\n') + '\r\n';
        var name = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) + '.ics';
        var a = d.createElement('a');
        a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
        a.download = name; a.style.display = 'none';
        d.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        if (msg) msg.textContent = 'Calendar file saved: ' + name;
      });
    }

    /* pointer glow + tile tilt (fine pointers only) */
    if (mqFine.matches && !still()) {
      var glow = $('.ev-next-card', nextSec) || nextSec;
      glow.addEventListener('pointermove', function (ev) {
        var r = glow.getBoundingClientRect();
        glow.style.setProperty('--ev-mx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        glow.style.setProperty('--ev-my', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      $$('.ev-tile', box).forEach(function (t) {
        t.addEventListener('pointermove', function (ev) {
          var r = t.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
          t.style.setProperty('--ev-rx', (y * -2.4).toFixed(2) + 'deg'); t.style.setProperty('--ev-ry', (x * 3).toFixed(2) + 'deg');
        });
        t.addEventListener('pointerleave', function () { t.style.setProperty('--ev-rx', '0deg'); t.style.setProperty('--ev-ry', '0deg'); });
      });
    }

    /* stats: count up to the numbers already on the page */
    var nums = $$('.ev-stat-n', nextSec);
    function countUp() {
      nums.forEach(function (el, k) {
        var n = +el.textContent; if (!(n > 1)) return;
        var t0 = null, dur = 1500 + k * 160;
        el.textContent = '0';
        (function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          el.textContent = p === 1 ? String(n) : String(Math.round(n * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }
    var statsBox = $('.ev-stats', nextSec);
    if (hasIO && statsBox && !still()) {
      var sio = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; sio.disconnect(); countUp(); }, { threshold: 0.5 });
      sio.observe(statsBox);
    }
  })();

  /* ---- 3. Upcoming listing ------------------------------------------------------ */
  if (!upSec || !up) return;
  var base = $$('.evt-card', up);
  var pastCards = past ? $$('.evt-card', past) : [];
  base.forEach(function (c, i) { c._evI = i; });
  var todaySG = Math.floor((Date.now() + 8 * 36e5) / DAY) * DAY - 8 * 36e5;
  var thisYear = new Date(todaySG + 8 * 36e5).getUTCFullYear();
  var CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  function decorate(card, withChip) {
    var th = card.querySelector('.ec-img'), st = card.getAttribute('data-start');
    if (!th || !st || th.querySelector('.ev-cal')) return;
    var p = st.split('-');
    if (p.length === 3) {
      var cal = d.createElement('span'); cal.className = 'ev-cal'; cal.setAttribute('aria-hidden', 'true');
      cal.innerHTML = '<b>' + (+p[2]) + '</b><span>' + MON[+p[1] - 1] + '</span>' + (+p[0] !== thisYear ? '<i>' + p[0] + '</i>' : '');
      th.appendChild(cal);
    }
    if (!withChip) return;
    var days = Math.round((ms(st, false) - todaySG) / DAY);
    if (isNaN(days) || days < 0) return;
    var t = days === 0 ? 'Starts today' : days === 1 ? 'Starts tomorrow'
      : days < 60 ? 'Starts in ' + days + ' days' : 'Starts in ' + Math.round(days / 30.44) + ' months';
    var w = d.createElement('span'); w.className = 'ev-when' + (days <= 14 ? ' ev-soon' : '');
    w.innerHTML = CLOCK + '<span></span>'; w.lastChild.textContent = t;
    th.appendChild(w);
  }
  base.forEach(function (c) { decorate(c, c.getAttribute('data-status') === 'upcoming'); });
  pastCards.forEach(function (c) { decorate(c, false); });

  /* counts in the heading */
  var nUp = base.length, nPast = pastCards.length, countBox = $('#ev-count');
  if (countBox) { $('#ev-count-up').textContent = nUp; $('#ev-count-past').textContent = nPast; countBox.hidden = false; }

  /* filter pills */
  var bar = $('.ev-pills', upSec), tabs = bar ? $$('.ev-pill', bar) : [];
  var statusEl = $('#ev-status');
  var empty = d.createElement('p'); empty.className = 'ev-empty'; empty.hidden = true; empty.textContent = 'No events in this category right now.';
  up.appendChild(empty);
  function match(c, f) { return f === 'all' || (c.getAttribute('data-cat') || '').indexOf(f) > -1; }
  var ind = null;
  if (bar) { ind = d.createElement('span'); ind.className = 'ev-ind'; ind.setAttribute('aria-hidden', 'true'); bar.insertBefore(ind, bar.firstChild); }
  var tabCount = {};
  tabs.forEach(function (t) {
    var f = t.getAttribute('data-filter'), n = base.filter(function (c) { return match(c, f); }).length, name = t.textContent.trim();
    tabCount[f] = n; t._evName = name;
    var s = d.createElement('span'); s.className = 'ev-fc'; s.textContent = n; s.setAttribute('aria-hidden', 'true'); t.appendChild(s);
    t.setAttribute('aria-label', name + ', ' + n + (n === 1 ? ' event' : ' events'));
    if (!n) t.setAttribute('data-empty', '');
  });
  function activeTab() { return tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]; }
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
  function visible() { return base.filter(function (c) { return !c.classList.contains('ev-hide'); }); }
  function updateStatus() {
    var n = visible().length;
    empty.hidden = n !== 0;
    if (!statusEl) return;
    var t = activeTab(), name = t ? t._evName : '';
    statusEl.innerHTML = current === 'all'
      ? 'Showing all <b>' + n + '</b> upcoming ' + (n === 1 ? 'event' : 'events')
      : n ? 'Showing <b>' + n + '</b> of ' + nUp + ' &middot; ' + name : 'Nothing in ' + name + ' right now';
  }

  /* layout: status order, or grouped by month */
  function gkey(c) {
    var s = c.getAttribute('data-status');
    if (s === 'sold') return 'z';
    if (s === 'ongoing') return '0';
    var st = c.getAttribute('data-start') || '';
    return /^\d{4}-\d{2}/.test(st) ? '1' + st.slice(0, 7) : '2';
  }
  function glabel(k) {
    if (k === 'z') return 'Sold Out';
    if (k === '0') return 'Happening now';
    if (k === '2') return 'Upcoming';
    return MONTH[+k.slice(6, 8) - 1] + ' ' + k.slice(1, 5);
  }
  function layout() {
    $$('.ev-month', up).forEach(function (h) { h.parentNode.removeChild(h); });
    var list = base.slice();
    if (view === 'month') {
      list.sort(function (a, b) {
        var ka = gkey(a), kb = gkey(b);
        if (ka !== kb) return ka < kb ? -1 : 1;
        var sa = ms(a.getAttribute('data-start'), false), sb = ms(b.getAttribute('data-start'), false);
        if (isNaN(sa)) sa = Infinity; if (isNaN(sb)) sb = Infinity;
        return (sa - sb) || (a._evI - b._evI);
      });
    }
    list.forEach(function (c) { up.insertBefore(c, empty); });
    up.classList.toggle('ev-by-month', view === 'month');
    if (view !== 'month') return;
    var groups = {};
    list.forEach(function (c) {
      if (c.classList.contains('ev-hide')) return;
      var k = gkey(c);
      if (groups[k]) { groups[k].n++; return; }
      var h = d.createElement('div');
      h.className = 'ev-month' + (k === 'z' ? ' ev-m-sold' : '');
      h.setAttribute('role', 'heading'); h.setAttribute('aria-level', '3');
      h.innerHTML = '<span class="ev-month-l">' + glabel(k) + '</span><span class="ev-month-n"></span>';
      up.insertBefore(h, c);
      groups[k] = { el: h, n: 1 };
    });
    Object.keys(groups).forEach(function (k) { groups[k].el.querySelector('.ev-month-n').textContent = groups[k].n + (groups[k].n === 1 ? ' event' : ' events'); });
  }

  /* filter with FLIP */
  function applyFilter(f, animate) {
    if (!(f in tabCount)) f = 'all';
    current = f;
    var my = ++seq;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-filter') === f;
      t.classList.toggle('ev-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on) up.setAttribute('aria-labelledby', t.id);
    });
    moveInd(animate);
    var motion = animate && !still();
    stopAnims();
    var vis = visible();
    var leaving = vis.filter(function (c) { return !match(c, f); });
    var staying = vis.filter(function (c) { return match(c, f); });
    var entering = base.filter(function (c) { return c.classList.contains('ev-hide') && match(c, f); });
    function commit() {
      if (my !== seq) return;
      stopAnims();
      var oldHeads = {};
      $$('.ev-month', up).forEach(function (h) { oldHeads[h.textContent] = h.getBoundingClientRect(); });
      var first = staying.map(function (c) { return c.getBoundingClientRect(); });
      leaving.forEach(function (c) { c.classList.add('ev-hide'); });
      entering.forEach(function (c) { c.classList.remove('ev-hide'); reveal(c); if (revealIO) revealIO.unobserve(c); });
      layout();
      updateStatus();
      if (!motion) return;
      staying.forEach(function (c, i) {
        var a = first[i], b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        if ((a.bottom < 0 && b.bottom < 0) || (a.top > innerHeight && b.top > innerHeight)) return;
        track(c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 760, easing: EASE }));
      });
      entering.forEach(function (c, i) {
        track(c.animate([{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 110 + i * 70, easing: EASE, fill: 'backwards' }));
      });
      $$('.ev-month', up).forEach(function (h) {
        var o = oldHeads[h.textContent];
        if (o) { var dy = o.top - h.getBoundingClientRect().top; if (Math.abs(dy) > 1) track(h.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 760, easing: EASE })); }
        else track(h.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: 80, easing: EASE, fill: 'backwards' }));
      });
    }
    if (motion && leaving.length) {
      leaving.forEach(function (c) { track(c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 300, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' })); });
      setTimeout(commit, 290);
    } else commit();
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { if (t.getAttribute('data-filter') !== current) applyFilter(t.getAttribute('data-filter'), true); });
  });
  if (bar) bar.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(d.activeElement), n = tabs.length, j = null;
    if (i < 0) return;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    if (j === null) return;
    e.preventDefault(); tabs[j].focus();
    applyFilter(tabs[j].getAttribute('data-filter'), true);
  });

  /* view toggle */
  var viewBtns = $$('.ev-view', upSec);
  function setView(v) {
    if (v === view) return;
    view = v;
    viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false'); });
    var my = ++seq;
    stopAnims();
    if (still()) { layout(); return; }
    var out = track(up.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px)' }], { duration: 280, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }));
    out.onfinish = function () {
      if (my !== seq) return;
      layout(); stopAnims();
      var items = Array.prototype.slice.call(up.children).filter(function (el) { return el.offsetParent !== null && el.getBoundingClientRect().top < innerHeight + 200; });
      items.forEach(function (el, i) {
        reveal(el);
        track(el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 720, delay: Math.min(i, 8) * 70, easing: EASE, fill: 'backwards' }));
      });
    };
  }
  viewBtns.forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view')); }); });

  /* soft pointer tilt + warm spotlight (fine pointers only) */
  if (mqFine.matches && !still()) {
    base.concat(pastCards).forEach(function (card) {
      var raf = 0, pe = null;
      function paint() {
        raf = 0; if (!pe) return;
        var r = card.getBoundingClientRect(), x = (pe.clientX - r.left) / r.width, y = (pe.clientY - r.top) / r.height;
        card.style.setProperty('--ev-rx', ((.5 - y) * 1.6).toFixed(2) + 'deg');
        card.style.setProperty('--ev-ry', ((x - .5) * 2.4).toFixed(2) + 'deg');
        card.style.setProperty('--ev-px', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--ev-py', (y * 100).toFixed(1) + '%');
      }
      card.addEventListener('pointerenter', function () { card.classList.add('ev-tilting'); });
      card.addEventListener('pointermove', function (e) { pe = e; if (!raf) raf = requestAnimationFrame(paint); });
      card.addEventListener('pointerleave', function () {
        pe = null; card.classList.remove('ev-tilting');
        card.style.setProperty('--ev-rx', '0deg'); card.style.setProperty('--ev-ry', '0deg');
      });
    });
    var ctaIn = $('.ev-cta-in');
    if (ctaIn) ctaIn.addEventListener('pointermove', function (e) {
      var r = ctaIn.getBoundingClientRect();
      ctaIn.style.setProperty('--ev-cx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      ctaIn.style.setProperty('--ev-cy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---- 4. Past events strip ------------------------------------------------------ */
  if (pastSec && past && pastCards.length) {
    var nav = $('.ev-nav', pastSec), prog = $('.ev-prog', pastSec), thumb = prog ? prog.querySelector('span') : null;
    var arrows = nav ? $$('.ev-arrow', nav) : [];
    function stepW() {
      var c = past.querySelector('.evt-card'), gap = parseFloat(getComputedStyle(past).columnGap) || 16;
      return c ? c.getBoundingClientRect().width + gap : past.clientWidth * .8;
    }
    arrows.forEach(function (b) {
      b.addEventListener('click', function () {
        var dx = +b.getAttribute('data-dir') * stepW();
        try { past.scrollBy({ left: dx, behavior: still() ? 'auto' : 'smooth' }); } catch (e) { past.scrollLeft += dx; }
      });
    });
    var sraf = 0;
    function sync() {
      sraf = 0;
      var sw = past.scrollWidth, cw = past.clientWidth, sl = past.scrollLeft, over = sw > cw + 2;
      if (nav) nav.hidden = !over;
      if (prog) prog.hidden = !over;
      if (!over) return;
      if (arrows[0]) arrows[0].disabled = sl <= 2;
      if (arrows[1]) arrows[1].disabled = sl >= sw - cw - 2;
      if (thumb) {
        var Wd = prog.clientWidth, w = Math.max(28, Wd * cw / sw);
        thumb.style.width = w + 'px';
        thumb.style.transform = 'translateX(' + ((Wd - w) * (sl / (sw - cw))).toFixed(1) + 'px)';
      }
    }
    past.addEventListener('scroll', function () { if (!sraf) sraf = requestAnimationFrame(sync); }, { passive: true });
    W.addEventListener('resize', function () { if (!sraf) sraf = requestAnimationFrame(sync); });
    W.addEventListener('load', sync);
    sync();
  }

  /* ---- Init ------------------------------------------------------------------------ */
  applyFilter('all', false);
  W.addEventListener('resize', function () { moveInd(false); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { moveInd(false); });
  W.addEventListener('load', function () { moveInd(false); });
  if (W.bhdInitButtons) W.bhdInitButtons();
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
  /* sticky register bars the site scripts append to <body> sit outside the scoped site wrapper (and so lost the
     site's look: transparent button, Odoo's purple text): move each one into a scoped holder as it appears */
  (function(){
    var sc=document.querySelector('header#top.hbx')?'hbx':(document.querySelector('header#top.bhdx')?'bhdx':'');
    if(!sc) return;
    function adopt(){
      document.querySelectorAll('body > .ce-bar, body > .ev-bar').forEach(function(b){
        var h=document.createElement('div'); h.className=sc+' xev-bar-host';
        b.parentNode.insertBefore(h,b); h.appendChild(b);
      });
    }
    adopt(); new MutationObserver(adopt).observe(document.body,{childList:true});
  })();
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
