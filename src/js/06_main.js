/* =========================================================
   06 — Démarrage, navigation, événements
   ========================================================= */
const ORIG_THEME=document.documentElement.getAttribute('data-theme');
function applyTheme(){
  const r=document.documentElement;
  if(S.set.theme==='light'||S.set.theme==='dark')r.setAttribute('data-theme',S.set.theme);
  else if(ORIG_THEME)r.setAttribute('data-theme',ORIG_THEME);else r.removeAttribute('data-theme');
}
function go(tab){
  const from=TABS.findIndex(t=>t.id===V.tab),to=TABS.findIndex(t=>t.id===tab);
  const same=tab===V.tab;
  V.tab=tab;V.openNode=null;V.enter=!same;hideGloss();try{history.replaceState(null,'','#'+tab);}catch(e){}
  if(same){render();window.scrollTo(0,0);return;}
  swapView(()=>{render();window.scrollTo(0,0);},to<from?'back':'fwd');
}

/* ---------- Bulles de traduction ---------- */
function showGloss(el){
  const g=$('#gloss');g.innerHTML=`<b>${esc(el.dataset.w)}</b> — ${esc(el.dataset.g)}`;g.hidden=false;
  const r=el.getBoundingClientRect();const gw=Math.min(260,innerWidth-24);
  g.style.left=clamp(r.left+r.width/2-gw/2,12,innerWidth-gw-12)+'px';g.style.maxWidth=gw+'px';
  const below=r.bottom+8;g.style.top=(below+60>innerHeight?r.top-52:below)+'px';
  if(!el.dataset.spoken){TTS.speak(el.dataset.w);}
}
function hideGloss(){const g=$('#gloss');if(g)g.hidden=true;}

/* ---------- Modales d'information ---------- */
const ULTRA_BTN=`<button class="btn ultra-btn block" data-act="ultra-on">${ic('bolt')}Activer le mode ultra</button>`;
const ULTRA_NOTE=`<p class="ultra-note">${ic('bolt')}<span>Mode ultra activé : vies, perlas et gels de série illimités.</span></p>`;
function openShop(){
  const u=ultra();
  modal(`<div class="sheet" role="dialog" aria-label="Boutique"><div class="sheet-h"><h2>Boutique</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   ${u?ULTRA_NOTE:`<p class="muted">Tu as <b class="tnum">${S.gems}</b> perlas. Tu en gagnes avec chaque leçon, chaque quête et chaque badge.</p>`}
   <button class="pcard" data-act="buy-freeze" style="--pc:#1C8FD0" ${!u&&S.gems>=100&&S.freezes<2?'':'disabled'}><span class="pi">${ic('shield')}</span><div><b>Gel de série — 100 perlas</b><span>${u?'Inclus dans le mode ultra':`Sauve ta série si tu manques un jour (${S.freezes}/2)`}</span></div></button>
   <button class="pcard" data-act="buy-hearts" style="--pc:var(--pula)" ${!freeHearts()&&S.gems>=50&&S.hearts<HEART_MAX?'':'disabled'}><span class="pi">${ic('heart')}</span><div><b>Recharger les vies — 50 perlas</b><span>${u?'Inclus dans le mode ultra':freeHearts()?'Vies illimitées activées':`${S.hearts} / ${HEART_MAX} vies`}</span></div></button>
   ${u?'':ULTRA_BTN}</div>`);
}
function openStreakInfo(){
  const todayDone=S.last===today(),u=ultra();
  modal(`<div class="sheet" role="dialog" aria-label="Série"><div class="sheet-h"><h2>${ic('flame')} Série : ${S.streak} jour${S.streak>1?'s':''}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   <p>${todayDone?'Tu as pratiqué aujourd’hui. Reviens demain pour la prolonger.':'Termine une leçon, une histoire ou un entraînement aujourd’hui pour prolonger ta série.'}</p>
   <p class="muted">Record : ${S.best} jour${S.best>1?'s':''} · Gels : ${u?'illimités':S.freezes+'/2 équipés'}</p>
   ${u?ULTRA_NOTE:`<button class="btn primary block" data-act="buy-freeze" ${S.gems>=100&&S.freezes<2?'':'disabled'}>${ic('shield')}Acheter un gel — 100 perlas</button>`}</div>`);
}
function openHeartsInfo(){
  syncHearts();const m=Math.ceil(nextHeartIn()/60000),u=ultra(),free=freeHearts();
  modal(`<div class="sheet" role="dialog" aria-label="Vies"><div class="sheet-h"><h2>${ic('heart')} ${free?'Vies illimitées':'Vies : '+S.hearts+' / '+HEART_MAX}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   ${u?ULTRA_NOTE:`<p>${free?'Le mode « vies illimitées » est activé dans les réglages.':`Chaque erreur dans une leçon coûte une vie. Une vie revient toutes les 20 minutes${S.hearts<HEART_MAX?` (prochaine dans ${m} min)`:''}.`}</p>
   <p class="muted">L’entraînement (onglet Pratique) ne coûte jamais de vie et en rend une.</p>`}
   ${free?'':`<button class="btn gold block" data-act="buy-hearts" ${S.gems>=50&&S.hearts<HEART_MAX?'':'disabled'}>${ic('gem')}Recharger — 50 perlas</button>`}
   ${u?'':ULTRA_BTN}
   <button class="btn block" data-act="prac" data-p="srs">${ic('practice')}S’entraîner</button></div>`);
}
function openPlacement(){
  modal(`<div class="sheet" role="dialog" aria-label="Test de niveau"><div class="sheet-h"><h2>Où commencer ?</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   <p class="muted">Choisis la section qui te semble à ton niveau. Un test de 16 questions sur la section précédente (3 erreurs permises) débloque tout ce qui précède.</p>
   ${SECS.slice(1).map(s=>`<button class="ubtn" data-act="jump-go" data-sec="${s.id}" style="--uc:${SEC_COL[s.id]}"><span class="n">${s.code}</span><div><b>${esc(s.tl)} — ${esc(s.fr)}</b><span>${esc(s.desc)}</span></div>${ic('chevron')}</button>`).join('')}
   <button class="btn ghost block" data-act="welcome-start">Finalement, je commence au début</button></div>`);
}
function openJump(sec){
  const s=SECS[sec-1];
  modal(`<div class="sheet" role="dialog" aria-label="Passer à la section"><div class="sheet-h"><h2>Sauter à la section ${s.code}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   <p>Test de 16 questions sur le niveau ${SECS[sec-2].code}, avec 3 erreurs permises. Réussis-le et toutes les leçons avant <b>${esc(s.tl)}</b> seront validées.</p>
   <button class="btn primary block" data-act="jump-go" data-sec="${sec}">${ic('skip')}Commencer le test</button></div>`);
}

/* ---------- Clics ---------- */
document.addEventListener('click',e=>{
  const tok=e.target.closest('.tok');
  if(tok){showGloss(tok);e.stopPropagation();return;}
  hideGloss();
  const say=e.target.closest('[data-say]');
  if(say&&!e.target.closest('[data-act]')){TTS.speak(say.dataset.say,!!say.dataset.slow,say.dataset.voice);if(!TTS.can())toast('Aucune voix disponible sur cet appareil.');return;}
  if(e.target.id==='pClose'||e.target.closest('#pClose')){confirmQuit();return;}
  const cfg=e.target.closest('#cfgAff button, #cfgMode button, #cfgMax button');
  if(cfg){const box=cfg.parentElement;if(box.id==='cfgAff')cfg.setAttribute('aria-pressed',cfg.getAttribute('aria-pressed')==='true'?'false':'true');else $$('button',box).forEach(b=>b.setAttribute('aria-pressed',b===cfg?'true':'false'));return;}
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act,d=a.dataset;
  if(act.startsWith('acct-')){acctAction(act,d.id);return;}
  switch(act){
    case 'scrim':if(e.target===a)closeModal();break;
    case 'modal-close':closeModal();break;
    case 'nav':closeModal();go(d.to);break;
    case 'node':{V.openNode=V.openNode===d.id?null:d.id;const y=window.scrollY;render();window.scrollTo(0,y);
      const n=$(`#n-${d.id} .node`);animIn(n,[{transform:'scale(.9)'},{transform:'scale(1.06)',offset:.6},{transform:'none'}],{duration:280,easing:SPRING});break;}
    case 'start':closeModal();V.openNode=null;startLesson(d.id);break;
    case 'unitguide':openUnitGuide(d.u);break;
    case 'story':closeModal();startStory(d.id);break;
    case 'jump':openJump(+d.sec);break;
    case 'jump-go':closeModal();S.seenWelcome=true;save();startJump(+d.sec);break;
    case 'welcome-start':closeModal();S.seenWelcome=true;save();startLesson(FLOW[0].id);break;
    case 'placement':openPlacement();break;
    case 'prac':closeModal();startPractice(d.p);break;
    case 'prac-unit':closeModal();startPractice('unit',{u:d.u});break;
    case 'conj-cfg':openConjCfg();break;
    case 'num-cfg':openNumCfg();break;
    case 'conj-go':{const aff=$$('#cfgAff [aria-pressed="true"]').map(b=>b.dataset.aff);const m=($('#cfgMode [aria-pressed="true"]')||{}).dataset;closeModal();startPractice('conj',{aff,mode:m?m.m:'mc'});break;}
    case 'num-go':{const mx=($('#cfgMax [aria-pressed="true"]')||{}).dataset;const m=($('#cfgMode [aria-pressed="true"]')||{}).dataset;closeModal();startPractice('num',{max:mx?+mx.v:100,mode:m?m.m:'mc'});break;}
    case 'dict-learned':V.gtab='dict';V.dfilter='learned';go('guide');break;
    case 'gtab':V.gtab=d.g;render();break;
    case 'dfilter':V.dfilter=d.f;render();break;
    case 'caff':V.caff=d.a;render();break;
    case 'goal':S.goal=+d.v;save();render();break;
    case 'theme':S.set.theme=d.v;save();applyTheme();render();break;
    case 'name-edit':V.editName=true;render();setTimeout(()=>{const i=$('#nameIn');if(i)i.focus();},30);break;
    case 'trans':{const box=a.closest('.sline');const t=box&&$('.trans',box);if(t)t.hidden=!t.hidden;break;}
    case 'shop':openShop();break;
    case 'info-streak':openStreakInfo();break;
    case 'info-hearts':openHeartsInfo();break;
    case 'loc-mode':
      if(d.v==='fixed'){S.set.loc='fixed';if(!S.set.place){const g=S.set.gps,c=g?nearestCity(g.lat,g.lon):null;V.geoReg=c?c.reg:'93';V.geoDep=c?c.dep:'06';}}
      else{S.set.loc='auto';}
      save();render();
      if(S.set.loc==='auto'&&(!S.set.gps||locDue()))doLocate();else loadWeather(true).then(()=>render());
      break;
    case 'loc-now':doLocate();break;
    case 'geo-pick':{const r=(V.geoRes||[])[+d.i];if(!r)break;S.set.place={n:r.n,lat:r.lat,lon:r.lon,sub:r.sub};S.set.loc='fixed';V.geoRes=null;V.geoQ='';save();
      toast('Météo de '+r.n+' activée.');loadWeather(true).then(()=>render());render();break;}
    case 'nudge-x':V.noNudge=true;{const n=a.closest('.nudge');if(n)anim(n,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-8px)'}],{duration:200}).then(()=>render());}break;
    case 'ultra-on':closeModal();setUltra(true);break;
    case 'buy-freeze':if(!ultra()&&S.gems>=100&&S.freezes<2){S.gems-=100;S.freezes++;save();toast('Gel de série équipé.');closeModal();render();}break;
    case 'buy-hearts':syncHearts();if(!freeHearts()&&S.gems>=50&&S.hearts<HEART_MAX){S.gems-=50;S.hearts=HEART_MAX;S.heartsTs=Date.now();save();toast('Vies rechargées.');closeModal();render();}break;
    case 'export':{const txt=JSON.stringify(S);
      const fallback=()=>{$('#dataZone').innerHTML=`<p class="small">Copie ce texte et garde-le précieusement :</p><textarea class="json" readonly id="expTxt">${esc(txt)}</textarea>`;const t=$('#expTxt');t.focus();t.select();};
      try{navigator.clipboard.writeText(txt).then(()=>toast('Progression copiée dans le presse-papiers.'),fallback);}catch(err){fallback();}break;}
    case 'import-open':$('#dataZone').innerHTML=`<p class="small">Colle ici une progression copiée depuis Akademya :</p><textarea class="json" id="impTxt" aria-label="Progression à importer"></textarea><button class="btn sm primary" data-act="import-go">Importer</button>`;break;
    case 'import-go':{try{const o=JSON.parse($('#impTxt').value);if(!o||typeof o!=='object'||o.v!==1||typeof o.xp!=='number')throw 0;
      const dd=defState(),ow=S.owner;S=Object.assign(dd,o);S.owner=ow;S.set=Object.assign(dd.set,o.set||{});S.stats=Object.assign(dd.stats,o.stats||{});S.day=Object.assign(dd.day,o.day||{});save();applyTheme();toast('Progression importée.');render();}
      catch(err){toast('Ce texte n’est pas une progression Akademya valide.');}break;}
    case 'reset-ask':V.confirmReset=true;render();break;
    case 'reset-no':V.confirmReset=false;render();break;
    case 'reset-yes':{const ow=S.owner;resetLocal();S.owner=ow;}V.confirmReset=false;V.scrolled=false;save();applyTheme();toast('Progression effacée.');go('learn');break;
    case 'quit-confirm':closeModal();closePlayer();break;
  }
});
/* Localisation demandée par l'utilisateur (geste : la demande d'autorisation du navigateur peut s'afficher) */
async function doLocate(){
  const p=locate(true);if(!P.on)render();
  const ok=await p;if(!P.on)render();
  if(ok)toast('Météo de '+(S.set.gps.n||'ta position')+' activée.');
  else{toast(LOC.err==='timeout'||LOC.err==='unavailable'?'Position introuvable pour le moment. Réessaie plus tard.':LOC.err==='unsupported'?'Localisation indisponible ici : choisis une ville.':'Localisation bloquée : les réglages à vérifier sont indiqués dans Profil → Météo de la mascotte.');
    if(V.tab!=='profile'&&!P.on)go('profile');setTimeout(()=>{const h=[...document.querySelectorAll('#main .section-h h2')].find(x=>x.textContent.includes('Météo'));if(h)h.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});},150);}
}
document.addEventListener('submit',e=>{
  const gs=e.target.closest('[data-act="geo-search"]');
  if(gs){e.preventDefault();const q=($('#geoQ').value||'').trim();if(q.length<2)return;
    V.geoQ=q;V.geoBusy=true;V.geoErr='';V.geoRes=null;const box=$('#geoRes');if(box)box.innerHTML=geoResHTML();
    geoSearch(q).then(r=>{V.geoRes=r;},()=>{V.geoErr='Recherche indisponible pour le moment (connexion ?).';})
      .then(()=>{V.geoBusy=false;const b=$('#geoRes');if(b)b.innerHTML=geoResHTML();});return;}
  const f=e.target.closest('[data-act="name-form"]');if(!f)return;e.preventDefault();
  S.name=($('#nameIn').value||'').trim().slice(0,30);V.editName=false;save();render();
});
document.addEventListener('mouseover',e=>{
  if(!matchMedia('(hover:hover)').matches)return;
  const tok=e.target.closest('.tok');if(tok){const g=$('#gloss');g.innerHTML=`<b>${esc(tok.dataset.w)}</b> — ${esc(tok.dataset.g)}`;g.hidden=false;const r=tok.getBoundingClientRect();const gw=Math.min(260,innerWidth-24);g.style.left=clamp(r.left+r.width/2-gw/2,12,innerWidth-gw-12)+'px';g.style.top=(r.bottom+8)+'px';}
});
document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('.tok'))hideGloss();});
window.addEventListener('scroll',hideGloss,{passive:true});
document.addEventListener('scroll',hideGloss,{passive:true,capture:true});

/* ---------- Saisies ---------- */
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='dictQ'){V.dq=t.value;const pos=t.selectionStart;render();const n=$('#dictQ');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(err){}}}
  else if(t.id==='conjQ'){V.cq=t.value;const pos=t.selectionStart;render();const n=$('#conjQ');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(err){}}}
  else if(t.id==='numIn'){let n=parseInt(t.value,10);V.num=isNaN(n)?0:n;const ok=n>0&&n<=999999;$('#numOut').textContent=ok?tlNum(n):'—';const b=t.parentElement.querySelector('[data-say]');if(b&&ok)b.dataset.say=tlNum(n);}
  else if(t.id==='bayIn'){V.bayText=t.value;$('#bayOut').textContent=toBaybayin(t.value);}
  else if(t.id==='rateIn'){S.set.rate=+t.value;save();const s=t.parentElement.querySelector('small');if(s)s.textContent=Math.round(S.set.rate*100)+' %';}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.set==='ultra'){setUltra(t.checked);}
  else if(t.dataset&&t.dataset.set){S.set[t.dataset.set]=t.checked;if(t.dataset.set==='zen'&&!t.checked)syncHearts();save();render();const n=document.getElementById(t.id);if(n)try{n.focus({preventScroll:true});}catch(e){}}
  else if(t.id==='geoReg'){V.geoReg=t.value;V.geoDep=null;render();}
  else if(t.id==='geoDep'){V.geoDep=t.value;render();}
  else if(t.id==='geoCity'){const G=TL.GEO||[];const reg=G.find(r=>r[0]===V.geoReg)||G.find(r=>r[0]===(S.set.place&&S.set.place.reg))||G[0];
    const dep=reg[2].find(x=>x[0]===V.geoDep)||reg[2].find(x=>x[0]===(S.set.place&&S.set.place.dep))||reg[2][0];const c=dep[2][+t.value];
    if(c){S.set.place={n:c[0],lat:c[1],lon:c[2],sub:dep[1],reg:reg[0],dep:dep[0]};S.set.loc='fixed';save();toast('Météo de '+c[0]+' activée.');loadWeather(true).then(()=>render());render();}}
  else if(t.id==='locFreq'){S.set.locFreq=t.value;save();render();locAuto().then(ch=>{if(ch&&!P.on)render();});}
  else if(t.id==='wxSel'){S.set.wx=t.value;save();loadWeather(true).then(()=>render());}
  else if(t.id==='voiceSel'){S.set.voice=t.value;save();TTS.pickVoice();TTS.speak('Kumusta! Ako si Araw.');render();}
});

/* ---------- Clavier ---------- */
document.addEventListener('keydown',e=>{
  if($('#modal').innerHTML&&e.key==='Escape'){closeModal();return;}
  if(!P.on)return;
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'');
  if(e.key==='Escape'){confirmQuit();return;}
  if(P.mode==='story'||P.mode==='nohearts'){if(e.key==='Enter'&&!typing){const b=$('#pGo');if(b&&!b.disabled){e.preventDefault();b.click();}}
    if(/^[1-4]$/.test(e.key)&&!typing){const q=$$('#sLines .sq').pop();if(q){const b=$$('[data-sq]',q)[+e.key-1];if(b&&!b.disabled)b.click();}}return;}
  if(e.key==='Enter'){
    if(typing&&P.state==='answer')return;
    const b=$('#pGo');if(b&&!b.disabled){e.preventDefault();b.click();}return;
  }
  if(!typing&&/^[1-9]$/.test(e.key)&&P.state==='answer'&&P.ex&&P.ex.key){P.ex.key(+e.key);}
});

/* ---------- Démarrage ---------- */
function boot(){
  load();rollDay();syncHearts();
  const st=checkStreak();
  TTS.init();AUDIO.load();applyTheme();Cloud.init();
  const h=(location.hash||'').replace('#','');if(TABS.some(t=>t.id===h))V.tab=h;
  V.enter=true;render();
  loadWeather().then(ch=>{if(ch&&!P.on)render();});
  locPerm().then(()=>locAuto()).then(ch=>{if(!P.on&&(ch||LOC.perm==='denied'||LOC.perm==='unsupported'))render();});
  /* Météo toutes les 15 min, seulement quand l'appli est affichée ; position selon la fréquence choisie */
  const wxTick=()=>{if(document.hidden||(S.set.wx&&S.set.wx!=='auto'))return;loadWeather(true).then(ch=>{if(ch&&!P.on&&!$('#modal').innerHTML)render();});};
  setInterval(wxTick,15*60e3);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)return;
    /* Retour depuis les réglages du téléphone : on revérifie l'autorisation */
    if(LOC.perm==='denied'||LOC.err){const was=LOC.perm;locPerm().then(st=>{if(st!==was&&st!=='denied'){LOC.err='';if(!P.on&&!$('#modal').innerHTML)render();}});}
    locAuto().then(ch=>{if(ch&&!P.on&&!$('#modal').innerHTML)render();});
    loadWeather().then(ch=>{if(ch&&!P.on&&!$('#modal').innerHTML)render();});});
  if(st==='ultra')toast('Mode ultra : ta série est restée intacte.');
  else if(st==='freeze')toast('Un gel de série a protégé ta série !');
  else if(st==='lost')toast('Ta série est repartie de zéro. Kaya mo ’yan !');
  setInterval(()=>{if(!P.on&&!$('#modal').innerHTML){const before=S.hearts;syncHearts();if(S.hearts!==before){save();renderChrome();}}},60000);
  window.addEventListener('hashchange',()=>{const h=(location.hash||'').replace('#','');if(TABS.some(t=>t.id===h)&&h!==V.tab){V.tab=h;render();}});
}
boot();
