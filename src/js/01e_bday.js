/* =========================================================
   01e — Mode « Joyeux anniversaire Savannah ! » (réglage caché sous le mode ultra)
   Thème rose, cœurs qui flottent, Araw en chapeau de fête, mélodie et lettre surprise.
   Réglage propre à l'appareil (non synchronisé avec le compte).
   ========================================================= */
const bdayOn=()=>!!(typeof S!=='undefined'&&S&&S.set&&S.set.bday);
const BDAY_PRAISE=['Ang galing mo! 💖','Bravo, birthday girl !','Mahusay ka! 🎂','Parfait, comme toi ! 💕'];
/* Message (encodé pour ne pas apparaître en clair dans le code) */
const BDAY_MSG='WyJCb25qb3VyIG1hIFNhdmFubmFoLCBq4oCZZXNww6hyZSBxdWUgdHUgcGFzc2VyYXMgdW5lIGFncsOpYWJsZSBqb3VybsOpZS4gSmUgc2FpcyBxdWUgY2V0dGUgam91cm7DqWUgZXN0IGltcG9ydGFudGUgcG91ciB0b2ksIGFsb3JzIGplIGZlcmFpIG1vbiBtYXhpbXVtIHBvdXIgcXVlIGNlIHNvaXQgcsOpdXNzaSAhIiwgIk7igJlvdWJsaWUgcGFzIHF1ZSB0dSBlcyBiZWxsZSwgaW50ZWxsaWdlbnRlLCBkcsO0bGUsIGJpZW52ZWlsbGFudGUsIGfDqW7DqXJldXNlLCBjdXJpZXVzZSwgbWFsaW5lIGV0IGluY3JveWFibGUuIEV0IGF1c3NpIGF2ZWMgbGEgc2FsbGUgdOKAmWVzIFVSSEhIISBIZWhlLiIsICJKZSBzdWlzIGZpZXIgZGUgdG9pLCBzdXIgdG91dCBsZXMgYXNwZWN0cyAhIiwgIkplIHN1aXMgZXQgamUgcmVzdGVyYWkgYXZlYyB0b2kg8J+YmC4iLCAiSm95ZXV4IGFubml2ZXJzYWlyZSwgamUgdOKAmWFpbWUg8J+SmCJd';
function bdayParas(){try{return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(BDAY_MSG),c=>c.charCodeAt(0))));}catch(e){return [];}}
const HEART_PATH='M12 21.2C6.4 17.2 2 13.4 2 8.6 2 5.5 4.4 3 7.4 3c1.9 0 3.6 1 4.6 2.6C13 4 14.7 3 16.6 3 19.6 3 22 5.5 22 8.6c0 4.8-4.4 8.6-10 12.6z';
const heartSvg=(fill,cls)=>`<svg class="${cls||''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}" fill="${fill||'currentColor'}"/></svg>`;
const BDAY_COLS=['#FF4D8D','#FF7AA8','#E8346E','#FFB3CB','#FFD43B','#C94BE8'];

/* Thème : classe sur <html>, police manuscrite pour la lettre, cœurs en arrière-plan */
function applyBday(){
  const on=bdayOn(),root=document.documentElement;
  root.classList.toggle('bday',on);
  let fx=document.getElementById('bdayFx');
  if(on&&!fx){
    if(!document.getElementById('bdayFont')){const l=document.createElement('link');l.id='bdayFont';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap';document.head.appendChild(l);}
    fx=document.createElement('div');fx.id='bdayFx';fx.className='bday-fx';fx.setAttribute('aria-hidden','true');
    fx.innerHTML=Array.from({length:16},(_,i)=>{const s=14+Math.round(Math.random()*20),d=(12+Math.random()*12).toFixed(1),dl=(-Math.random()*20).toFixed(1),x=(Math.random()*96).toFixed(1),o=(.18+Math.random()*.3).toFixed(2);
      return `<i style="left:${x}%;width:${s}px;height:${s}px;animation-duration:${d}s;animation-delay:${dl}s;opacity:${o}">${heartSvg(BDAY_COLS[i%BDAY_COLS.length])}</i>`;}).join('');
    document.body.appendChild(fx);
  }else if(!on&&fx)fx.remove();
}
/* « Joyeux anniversaire » (mélodie traditionnelle, domaine public) */
function playBdayTune(){
  if(!S.set.sfx)return;const ac=SFX.ctx();if(!ac)return;
  const q=.36,G=392,A=440,B=493.88,C=523.25,D=587.33,E=659.25,F=698.46,G5=783.99;
  const notes=[[G,.75],[G,.25],[A,1],[G,1],[C,1],[B,2],[G,.75],[G,.25],[A,1],[G,1],[D,1],[C,2]];
  let t=ac.currentTime+.05;
  try{notes.forEach(([f,b])=>{const o=ac.createOscillator(),g=ac.createGain(),d=b*q;o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.13,t+.02);g.gain.setValueAtTime(.13,t+d*.7);g.gain.exponentialRampToValueAtTime(.001,t+d*.98);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d);t+=d;});}catch(e){}
}
/* Explosion de cœurs depuis l'élément touché */
function bdayBurst(el){
  if(reduced())return;
  const r=(el||document.body).getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const fx=document.createElement('div');fx.className='bday-burst';fx.setAttribute('aria-hidden','true');
  const n=26;fx.innerHTML=Array.from({length:n},(_,i)=>`<i style="left:${x}px;top:${y}px">${heartSvg(BDAY_COLS[i%BDAY_COLS.length])}</i>`).join('');
  document.body.appendChild(fx);
  $$('i',fx).forEach((h,i)=>{const a=(i/n)*Math.PI*2+Math.random()*.5,d=90+Math.random()*170,s=.6+Math.random()*1.1,rot=(Math.random()-.5)*80;
    h.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.2)'},{opacity:1,transform:`translate(calc(-50% + ${Math.cos(a)*d*.55}px),calc(-50% + ${Math.sin(a)*d*.55}px)) scale(${s}) rotate(${rot/2}deg)`,offset:.35},
      {opacity:0,transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d+60}px)) scale(${s*.8}) rotate(${rot}deg)`}],{duration:1100+Math.random()*500,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});});
  setTimeout(()=>fx.remove(),1800);
}
function setBday(on,el){
  S.set.bday=!!on;save();applyBday();
  if(!P.on)render();
  if(on){
    try{if(navigator.vibrate)navigator.vibrate([20,60,20,60,40]);}catch(e){}
    const target=el||($('#set-bday')&&$('#set-bday').closest('.bday-card'));
    bdayBurst(target);confetti();playBdayTune();
    setTimeout(openBdayLetter,reduced()?0:1100);
  }else toast('Mode anniversaire désactivé.');
}
/* La lettre */
function openBdayLetter(){
  const ps=bdayParas();
  modal(`<div class="sheet letter" role="dialog" aria-label="Message pour Savannah">
    <div class="letter-seal" aria-hidden="true">${heartSvg('#E8346E','seal-heart')}</div>
    <h2 class="letter-title">Pour toi, Savannah</h2>
    <div class="letter-body">${ps.map(p=>`<p>${esc(p).replace(/ ([!?;:])/g,'\u202F$1')}</p>`).join('')}</div>
    <button class="btn primary block" data-act="modal-close">Fermer 💖</button></div>`);
  const sh=$('#modal .letter');if(!sh||reduced())return;
  animIn($('.letter-seal',sh),[{opacity:0,transform:'scale(.3) rotate(-20deg)'},{opacity:1,transform:'scale(1.15) rotate(6deg)',offset:.6},{opacity:1,transform:'none'}],{duration:700,easing:SPRING});
  animIn($('.letter-title',sh),POP,{duration:520,delay:200,easing:SPRING});
  stagger($$('.letter-body p',sh),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:520,delay:420,easing:EASE_OUT},380);
}
/* Carte du réglage (Profil, sous le mode ultra) */
function bdayCard(){
  const on=bdayOn();
  return `<div class="bday-wrap"><label class="bday-card${on?' on':''}" for="set-bday">
    <span class="bb">🎂</span>
    <span class="lbl">Joyeux anniversaire Savannah !<small>${on?'Mode anniversaire activé 💕':'Active le mode anniversaire 💝'}</small></span>
    <span class="switch"><input type="checkbox" id="set-bday" data-set="bday" ${on?'checked':''} aria-label="Mode anniversaire"><span></span></span></label>
    ${on?'<button class="link-btn bday-reread" data-act="bday-letter">💌 Relire le message</button>':''}</div>`;
}
function bdaySpot(){
  return bdayOn()||V.bdayOpen?bdayCard():`<button class="bday-secret" data-act="bday-reveal" aria-label="Surprise">${heartSvg()}</button>`;
}
