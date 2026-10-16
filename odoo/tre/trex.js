/* TRE in Singapore on Odoo (website 3): mobile menu + "#register-now" opens Odoo's ticket window */
(function(){
  var toggle=document.querySelector('.trex .nav-toggle'), nav=document.querySelector('.trex .tre-nav');
  if(toggle&&nav){
    var set=function(o){nav.classList.toggle('open',o);toggle.setAttribute('aria-expanded',o?'true':'false');};
    toggle.addEventListener('click',function(){set(!nav.classList.contains('open'));});
    document.addEventListener('click',function(e){if(!nav.contains(e.target)&&!toggle.contains(e.target))set(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
  }
  document.querySelectorAll('.trex [data-year]').forEach(function(el){el.textContent=new Date().getFullYear();});
  if(/register-now/.test(location.hash)){
    var tries=0,t=setInterval(function(){
      tries++;
      var m=document.getElementById('modal_ticket_registration');
      if((m&&m.classList.contains('show'))||tries>40){clearInterval(t);return;}
      var b=document.querySelector('[data-bs-target="#modal_ticket_registration"]:not([disabled]), .o_wevent_registration_btn:not([disabled])');
      if(b&&tries>2&&!document.body.classList.contains('o_lazy_js_waiting'))b.click();
    },400);
  }
})();
