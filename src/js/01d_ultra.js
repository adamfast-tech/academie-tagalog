/* =========================================================
   01d — Mode ultra : activation avec un éclair
   L'éclair part du haut de l'écran et frappe l'interrupteur (ou le bouton touché).
   Deux flashs au maximum (sous la limite de 3 par seconde), rien de tout ça si
   les animations sont coupées : simple message.
   ========================================================= */
function setUltra(on,target){
  S.set.ultra=!!on;if(!on)syncHearts();save();
  if(!P.on){const f=document.activeElement&&document.activeElement.id;render();const n=f&&document.getElementById(f);if(n)try{n.focus({preventScroll:true});}catch(e){}}
  ultraFX(!!on,target);
}
function boltPoints(x0,y0,x1,y1,jag,steps){
  const pts=[[x0,y0]];
  for(let i=1;i<steps;i++){
    const t=i/steps,amp=jag*(1-Math.abs(t-.5));
    pts.push([x0+(x1-x0)*t+(Math.random()-.5)*2*amp,y0+(y1-y0)*t+(Math.random()-.5)*amp*.35]);
  }
  pts.push([x1,y1]);return pts;
}
const ptsStr=p=>p.map(([x,y])=>x.toFixed(1)+','+y.toFixed(1)).join(' ');
function ultraTarget(el){
  const cands=[el,$('#set-ultra')&&$('#set-ultra').parentElement,$('#main .stat.hearts'),$('.stat.hearts')];
  for(const c of cands){if(!c)continue;const r=c.getBoundingClientRect();if(r.width&&r.bottom>0&&r.top<innerHeight)return {x:r.left+r.width/2,y:r.top+r.height/2};}
  return {x:innerWidth/2,y:innerHeight*.45};
}
function ultraFX(on,el){
  SFX.zap(on);
  try{if(navigator.vibrate)navigator.vibrate(on?[16,50,70]:18);}catch(e){}
  toast(on?'⚡ Mode ultra activé : plus aucune limite !':'Mode ultra désactivé.');
  const card=$('.ultra-card');
  if(reduced()){if(card)replayClass(card,'zap-soft');return;}
  const {x,y}=ultraTarget(el),W=innerWidth,H=innerHeight;
  const fx=document.createElement('div');fx.className='ultra-fx'+(on?'':' off');fx.setAttribute('aria-hidden','true');
  fx.style.setProperty('--x',x+'px');fx.style.setProperty('--y',y+'px');
  let svg='';
  if(on){
    /* cible proche du haut (pastilles) : l'éclair arrive en biais pour garder de l'ampleur */
    const near=y<220,side=x>W/2?-1:1;
    const x0=Math.max(20,Math.min(W-20,near?x+side*W*(.35+Math.random()*.25):x+(Math.random()-.5)*W*.5));
    const main=boltPoints(x0,-12,x,y,Math.min(70,Math.max(26,Math.hypot(x-x0,y+12)*.12)),Math.max(7,Math.round(Math.hypot(x-x0,y+12)/55)));
    const branches=[];
    [.3,.55,.72].forEach(f=>{const i=Math.floor(f*(main.length-1)),[bx,by]=main[i];const dir=Math.random()<.5?-1:1;
      branches.push(boltPoints(bx,by,bx+dir*(40+Math.random()*90),by+50+Math.random()*80,16,4));});
    svg=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g class="bolt">
      <polyline class="glow" points="${ptsStr(main)}"/><polyline class="core" points="${ptsStr(main)}"/>
      ${branches.map(b=>`<polyline class="br" points="${ptsStr(b)}"/>`).join('')}</g></svg><div class="flash"></div>`;
  }
  const n=on?18:9;let sparks='';
  for(let i=0;i<n;i++)sparks+=`<i class="sp" style="left:${x}px;top:${y}px"></i>`;
  fx.innerHTML=svg+`<i class="ring" style="left:${x}px;top:${y}px"></i>`+sparks;
  document.body.appendChild(fx);
  const hit=on?120:0;
  if(on){
    const g=$('.bolt',fx);
    $$('polyline',fx).forEach(pl=>{let L=900;try{L=pl.getTotalLength();}catch(e){}pl.style.strokeDasharray=L;
      pl.animate([{strokeDashoffset:L},{strokeDashoffset:0}],{duration:hit,easing:'linear',fill:'both'});});
    g.animate([{opacity:1},{opacity:1,offset:.25},{opacity:.2,offset:.35},{opacity:1,offset:.45},{opacity:.45,offset:.65},{opacity:0}],{duration:620,delay:hit,fill:'both'});
    $('.flash',fx).animate([{opacity:0},{opacity:.85,offset:.12},{opacity:0,offset:.4},{opacity:.45,offset:.55},{opacity:0}],{duration:520,delay:hit-20,fill:'both'});
    const view=$('#main .view');
    if(view)view.animate([{transform:'none'},{transform:'translate(-6px,3px)'},{transform:'translate(5px,-4px)'},{transform:'translate(-3px,2px)'},{transform:'translate(2px,-1px)'},{transform:'none'}],{duration:340,delay:hit,easing:'ease-out'});
  }
  $('.ring',fx).animate([{opacity:1,transform:'scale(.4)'},{opacity:0,transform:`scale(${on?9:4})`}],{duration:on?650:420,delay:hit,easing:EASE_OUT,fill:'forwards'});
  $$('.sp',fx).forEach((s,i)=>{
    const a=(i/n)*Math.PI*2+Math.random()*.4,d=(on?70:30)+Math.random()*(on?90:30),deg=a*180/Math.PI+90;
    s.animate([{opacity:1,transform:`rotate(${deg}deg) translateY(0) scaleY(1)`},{opacity:0,transform:`rotate(${deg}deg) translateY(${-d}px) scaleY(.3)`}],
      {duration:(on?520:380)+Math.random()*220,delay:hit,easing:EASE_OUT,fill:'forwards'});
  });
  if(card)setTimeout(()=>replayClass(card,on?'zap':'unzap'),hit);
  if(on)setTimeout(()=>stagger($$('#main .stat.ult, .side .stat.ult'),[{transform:'scale(.4) rotate(-20deg)',opacity:.2},{transform:'scale(1.25)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:560,easing:SPRING},90),hit+120);
  setTimeout(()=>fx.remove(),1500);
}
