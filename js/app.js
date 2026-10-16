(function(){
const body=document.body,overlay=document.getElementById('guideOverlay');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Guia de primeiros passos (overlay) */
function openGuide(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');body.classList.add('menu-open')}
function closeGuide(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');body.classList.remove('menu-open')}
document.querySelectorAll('[data-guide]').forEach(x=>x.addEventListener('click',openGuide));document.querySelectorAll('[data-guide-close]').forEach(x=>x.addEventListener('click',closeGuide));overlay.addEventListener('click',e=>{if(e.target===overlay)closeGuide()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGuide()});

/* Menu mobile */
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.desktop-nav');if(menu){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('mobile-open',!open);body.classList.toggle('menu-open',!open)})}

/* Abas de recursos: ARIA + teclado (setas, Home, End) */
const tabs=[...document.querySelectorAll('.feature-tab')];
function selectTab(tab,focus){const key=tab.dataset.feature;tabs.forEach(t=>{const on=t===tab;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1});document.querySelectorAll('.feature-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===key));if(focus)tab.focus()}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{const k=e.key;let n=null;if(k==='ArrowDown'||k==='ArrowRight')n=tabs[(i+1)%tabs.length];else if(k==='ArrowUp'||k==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];else if(k==='Home')n=tabs[0];else if(k==='End')n=tabs[tabs.length-1];if(n){e.preventDefault();selectTab(n,true)}})});

/* Revelacao ao entrar na tela */
if(reduce){document.querySelectorAll('.reveal').forEach(x=>x.classList.add('is-visible'))}
else{const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>observer.observe(x))}

/* Inclinacao suave da tela do hero */
const app=document.querySelector('.app-window'),visual=document.querySelector('.hero-visual');if(app&&visual&&!reduce&&matchMedia('(pointer:fine)').matches){visual.addEventListener('pointermove',e=>{const r=visual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;app.style.transform=`perspective(1300px) rotateY(${-4+x*3}deg) rotateX(${2-y*2}deg)`});visual.addEventListener('pointerleave',()=>app.style.transform='perspective(1300px) rotateY(-4deg) rotateX(2deg)')}

/* Ancoras com rolagem suave */
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}}));

/* Galeria: ampliar tela */
const lb=document.getElementById('lightbox');
if(lb&&typeof lb.showModal==='function'){const img=document.getElementById('lbImg'),tt=document.getElementById('lbTitle'),dd=document.getElementById('lbDesc');
document.querySelectorAll('[data-shot]').forEach(b=>b.addEventListener('click',()=>{img.src=b.dataset.shot;img.alt=b.dataset.title;tt.textContent=b.dataset.title;dd.textContent=b.dataset.desc;lb.showModal()}));
lb.addEventListener('click',e=>{if(e.target===lb||e.target.hasAttribute('data-lb-close'))lb.close()})}

/* Formulario do teste gratis: abre WhatsApp ou e-mail configurado em window.THOTH_CONTACT */
const form=document.getElementById('teste');
if(form){form.addEventListener('submit',e=>{e.preventDefault();const status=form.querySelector('.form-status');let ok=true;form.querySelectorAll('[required]').forEach(f=>{const bad=!f.value.trim();f.setAttribute('aria-invalid',String(bad));if(bad)ok=false});
if(!ok){status.textContent='Preencha os campos marcados para continuar.';return}
const d=Object.fromEntries(new FormData(form).entries()),c=window.THOTH_CONTACT||{};
const msg=`Olá! Quero testar o Thoth CRM por 14 dias.\nNome: ${d.nome}\nWhatsApp: ${d.whats}\nNegócio: ${d.negocio}\nMercado: ${d.mercado}`;
if(c.whatsapp){status.textContent='Abrindo o WhatsApp…';window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`,'_blank','noopener')}
else if(c.email){status.textContent='Abrindo o seu e-mail…';location.href=`mailto:${c.email}?subject=${encodeURIComponent('Teste grátis Thoth CRM')}&body=${encodeURIComponent(msg)}`}
else{status.textContent='Recebemos o seu pedido, mas o canal de contato ainda não foi configurado neste site.'}})}


/* Fluxo da mensagem: a linha, os icones e os exemplos se desenham ao rolar */
const flow=document.getElementById('flow');
if(flow&&window.gsap&&window.ScrollTrigger&&!reduce){
gsap.registerPlugin(ScrollTrigger);
gsap.matchMedia().add({wide:'(min-width: 1051px)',tablet:'(min-width: 801px) and (max-width: 1050px)',phone:'(max-width: 800px)'},ctx=>{
const {phone,tablet}=ctx.conditions,steps=[...flow.querySelectorAll('.flow-step')],fill=flow.querySelector('.flow-line-fill'),axis=phone?'scaleY':'scaleX';
const tl=gsap.timeline({defaults:{ease:'power2.out'},scrollTrigger:{trigger:flow,start:phone?'top 82%':'top 85%',end:phone?'bottom 72%':'top 22%',scrub:.6}});
if(!tablet)tl.fromTo(fill,{[axis]:0},{[axis]:1,ease:'none',duration:steps.length},0);
steps.forEach((st,i)=>{const node=st.querySelector('.flow-node'),paths=st.querySelectorAll('.draw'),demo=st.querySelectorAll('.flow-demo > *'),txt=st.querySelectorAll('small,h3,p');
tl.from(node,{scale:.6,opacity:.2,duration:.35},i).from(paths,{strokeDashoffset:1,duration:.7,stagger:.12,ease:'none'},i+.1).from(txt,{opacity:0,y:10,duration:.4,stagger:.06},i+.15).from(demo,{opacity:0,y:12,duration:.4,stagger:.18},i+.35)});
const stages=steps[3].querySelectorAll('.stage');
if(stages.length===3){stages.forEach((c,k)=>{tl.to(c,{className:'chip stage on',duration:.01},3.7+k*.3);if(k<2)tl.to(c,{className:'chip stage',duration:.01},4+k*.3)})}
steps[1].querySelectorAll('.chip').forEach((c,k)=>{tl.to(c,{className:'chip on',duration:.01},1.55+k*.15)});
})}

/* Movimento ligado ao scroll (GSAP + ScrollTrigger) */
if(window.gsap&&window.ScrollTrigger&&!reduce){gsap.registerPlugin(ScrollTrigger);
gsap.from('.scene-flow > *',{opacity:0,y:10,stagger:.16,duration:.5,ease:'power2.out',scrollTrigger:{trigger:'.scene-flow',start:'top 90%'}});
gsap.fromTo('.army-stage',{scale:.95,y:24},{scale:1,y:0,ease:'none',scrollTrigger:{trigger:'.army-wrap',start:'top 92%',end:'center 55%',scrub:true}});
gsap.from('.army-legend li',{opacity:0,y:16,stagger:.12,duration:.5,ease:'power2.out',scrollTrigger:{trigger:'.army-legend',start:'top 92%'}});
gsap.from('.compare-row:not(.header)',{opacity:0,x:-18,stagger:.07,duration:.45,ease:'power2.out',scrollTrigger:{trigger:'.compare-table',start:'top 82%'}});
}
})();
