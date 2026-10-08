/* =========================================================
   01c — Mouvement : transitions et micro-animations (Web Animations API)
   Uniquement transform / opacity : fluide à 60 i/s, y compris sur téléphone.
   ========================================================= */
const EASE_OUT='cubic-bezier(.22,1,.36,1)', EASE_IN='cubic-bezier(.55,0,1,.45)', SPRING='cubic-bezier(.34,1.56,.64,1)';
function reduced(){
  try{if(typeof S!=='undefined'&&S.set&&S.set.anim===false)return true;return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}
}
/* Animation qui reste sur son état final (pour les sorties) */
function anim(el,kf,o){
  if(!el||!el.animate||reduced())return Promise.resolve(null);
  try{const a=el.animate(kf,Object.assign({duration:280,easing:EASE_OUT,fill:'both'},o||{}));return a.finished.then(()=>a,()=>a);}
  catch(e){return Promise.resolve(null);}
}
/* Animation d'entrée : l'élément retrouve ensuite son style normal */
function animIn(el,kf,o){return anim(el,kf,o).then(a=>{if(a)try{a.cancel();}catch(e){}});}
function stagger(els,kf,o,step){els.forEach((el,i)=>animIn(el,kf,Object.assign({},o,{delay:((o&&o.delay)||0)+i*(step||35)})));}
const RISE=[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}];
const POP=[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.08)',offset:.6},{opacity:1,transform:'none'}];
/* FLIP : fait glisser un élément depuis son ancienne position */
function flipFrom(el,from,ms){
  if(!el||!from)return;const to=el.getBoundingClientRect();
  const dx=from.left-to.left,dy=from.top-to.top;
  if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
  animIn(el,[{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:ms||320,easing:EASE_OUT});
}
/* Compteur qui monte */
function countUp(el,to,ms){
  if(!el)return;if(reduced()){el.textContent=to;return;}
  const t0=performance.now(),suf=el.dataset.suf||'';el.textContent='0'+suf;
  (function f(t){const p=Math.min(1,(t-t0)/(ms||800));const e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(f);})(t0);
}
/* Relance une animation CSS portée par une classe */
function replayClass(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
/* Changement d'onglet : View Transitions si dispo, sinon glissement simple */
function swapView(fn,dir){
  if(document.startViewTransition&&!reduced()){
    const r=document.documentElement;r.dataset.vt=dir||'fwd';
    try{const t=document.startViewTransition(fn);t.finished.then(()=>{delete r.dataset.vt;},()=>{delete r.dataset.vt;});return;}catch(e){delete r.dataset.vt;}
  }
  fn();
  animIn($('#main .view'),[{opacity:0,transform:`translateX(${dir==='back'?-22:22}px)`},{opacity:1,transform:'none'}],{duration:280});
}
