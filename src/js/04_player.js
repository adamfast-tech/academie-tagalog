/* =========================================================
   04 — Lecteur de leçon et lecteur d'histoire
   ========================================================= */
let P={on:false};
const PRAISE=['Bravo !','Magaling!','Tama!','Excellent !','Ang galing!','Parfait !','Bien joué !','Mahusay!'];
const XP_BASE={words:10,phrases:10,conj:10,num:10,bay:10,review:15,exam:30};

function freshInner(){const old=$('#pInner');const n=old.cloneNode(false);old.replaceWith(n);return n;}
function openPlayer(){
  const p=$('#player');const was=!p.hidden;p.hidden=false;document.body.style.overflow='hidden';
  $('#pClose').innerHTML=`<svg viewBox="0 0 24 24">${ICONS.x}</svg>`;
  $('#pBar').parentElement.classList.remove('hot','glint');
  if(!was){p.getAnimations&&p.getAnimations().forEach(a=>a.cancel());animIn(p,[{opacity:0,transform:'translateY(36px) scale(.985)'},{opacity:1,transform:'none'}],{duration:380});}
}
let closing=null;
function closePlayer(){
  if(closing)return closing;
  const p=$('#player');const justDone=P.completed&&P.L?P.L.id:null;
  TTS.stop();hideGloss();
  closing=anim(p,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(28px) scale(.99)'}],{duration:220,easing:EASE_IN}).then(()=>{
    p.hidden=true;if(p.getAnimations)p.getAnimations().forEach(a=>a.cancel());
    document.body.style.overflow='';P={on:false};closing=null;
    V.justDone=justDone;render();
  });
  return closing;
}

/* opts : {mode:'lesson'|'practice'|'exam'|'jump'|'mistakes', L, title, lives, target} */
function startSession(items,opts){
  if(closing){closing.then(()=>startSession(items,opts));return;}
  items=items.filter(Boolean);
  if(!items.length){toast('Rien à réviser pour le moment.');return;}
  syncHearts();
  const usesHearts=opts.mode==='lesson'&&!freeHearts();
  if(usesHearts&&S.hearts<=0){showNoHearts(false,()=>startSession(items,opts));return;}
  P={on:true,...opts,queue:items.map((e,i)=>Object.assign(e,{slot:i})),i:0,total:items.length,okSlots:new Set(),failed:new Set(),
     mistakes:0,combo:0,maxCombo:0,firstOk:0,graded:0,t0:Date.now(),state:'answer',usesHearts,lives:ultra()?null:(opts.lives||null),noListen:false};
  openPlayer();showEx();
}
/* Sortie de l'exercice en cours (glisse vers la gauche) */
function exitInner(){const prev=$('#pInner');if(!prev.firstChild||reduced())return Promise.resolve();return anim(prev,[{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-44px)'}],{duration:150,easing:EASE_IN});}
function pApi(){return {update:paintFoot,submit:()=>{if(P.state==='answer'&&P.ex&&P.ex.ready())pCheck();},locked:()=>P.state!=='answer'};}
function heartsHTML(){
  if(P.mode==='story')return '';
  if(P.lives!=null)return `${ic('heart')}<span>${P.lives}</span>`;
  if(!P.usesHearts)return `<span class="hearts inf" title="Vies illimitées">${ic('heart')}∞</span>`;
  return `${ic('heart')}<span>${S.hearts}</span>`;
}
function paintHead(){
  const bar=$('#pBar');const w=(P.okSlots.size/P.total*100)+'%';
  if(bar.style.width!==w&&P.lastOk&&P.state==='feedback')replayClass(bar.parentElement,'glint');
  bar.style.width=w;bar.parentElement.classList.toggle('hot',(P.combo||0)>=3);
  $('#pHearts').innerHTML=heartsHTML();
}
const EX_PARTS='.ex-h,.prompt-row,.bubble,.vcard,.bignum,.bay,.intro>*,.pics>*,.opts>*,.pairs .pb,.answer-zone,.bank .tile,.type-line,.type-box';
function showEx(){
  P.ex=P.queue[P.i];P.state='answer';P.wasReady=false;
  const foot=$('#pFoot');foot.className='pfoot';$('#pFb').innerHTML='';
  const inner=freshInner();
  $('#pBody').scrollTop=0;
  P.ex.render(inner,pApi());
  paintHead();paintFoot();
  P.busy=false;
  animIn(inner,[{opacity:0,transform:'translateX(52px)'},{opacity:1,transform:'none'}],{duration:320});
  stagger($$(EX_PARTS,inner).slice(0,18),[{opacity:0,transform:'translateY(14px) scale(.98)'},{opacity:1,transform:'none'}],{duration:300,delay:40},24);
}
function paintFoot(){
  const a=$('#pActs');const ex=P.ex;
  if(P.state==='answer'){
    if(!ex.graded){a.innerHTML=`<span></span><button class="btn primary" id="pGo">Continuer</button>`;}
    else if(ex.type==='pairs'){a.innerHTML=`<span class="small muted">Touche un mot de chaque colonne.</span><span></span>`;return;}
    else{
      const left=ex.listen?`<button class="btn ghost sm" id="pNoListen">${ic('ear')}Écoute impossible</button>`:(ex.type==='build'||ex.type==='pick'?`<span></span>`:`<span></span>`);
      const ready=ex.ready();
      a.innerHTML=`${left}<button class="btn ok" id="pGo" ${ready?'':'disabled'}>Vérifier</button>`;
      if(ready&&!P.wasReady)animIn($('#pGo'),[{transform:'scale(.94)'},{transform:'scale(1.04)',offset:.6},{transform:'none'}],{duration:320,easing:SPRING});
      P.wasReady=ready;
      const nl=$('#pNoListen');if(nl)nl.onclick=()=>{P.noListen=true;P.queue=P.queue.map((e,i)=>i>=P.i&&e.listen&&e.regen?Object.assign(e.regen(),{slot:e.slot}):e);showEx();toast('Exercices d’écoute désactivés pour cette séance.');};
    }
    $('#pGo').onclick=()=>{if(!ex.graded){P.okSlots.add(ex.slot);if(ex.k===undefined&&ex.render)void 0;pNext();}else pCheck();};
  }else{
    a.innerHTML=`<span></span><button class="btn ${P.lastOk?'ok':'bad'}" id="pGo">Continuer</button>`;
    $('#pGo').onclick=pNext;
    setTimeout(()=>{const b=$('#pGo');if(b)try{b.focus({preventScroll:true});}catch(e){}},30);
  }
}
function pCheck(){
  const ex=P.ex;if(P.busy||P.state!=='answer'||!ex.ready())return;
  const res=ex.check();ex.reveal(res);
  P.state='feedback';P.lastOk=res.ok;
  P.graded++;S.stats.ans++;
  if(res.ok){
    SFX.ok();P.combo++;P.maxCombo=Math.max(P.maxCombo,P.combo);S.day.combo=Math.max(S.day.combo,P.combo);
    P.okSlots.add(ex.slot);if(!P.failed.has(ex.slot))P.firstOk++;
    S.stats.ok++;S.day.ok++;
    if(ex.listen){S.stats.listen++;S.day.listen++;}
    if(ex.typed){S.stats.typed++;S.day.typed++;}
    if(ex.conj){S.stats.conj++;S.day.conj++;}
    if(ex.num)S.stats.nums++;
    if(ex.k)srs(ex.k,true);
    if(P.mode==='mistakes')clearMistake(ex.ref);
    if(ex.ref&&!ex.k&&ex.ref.startsWith('b'))srs(ex.ref,true);
  }else{
    SFX.bad();P.combo=0;P.mistakes++;P.failed.add(ex.slot);
    if(ex.k)srs(ex.k,false);
    addMistake(ex.ref||ex.k);
    if(P.usesHearts){S.hearts=Math.max(0,S.hearts-1);if(S.hearts<HEART_MAX&&S.hearts===HEART_MAX-1)S.heartsTs=Date.now();}
    if(P.lives!=null)P.lives=Math.max(0,P.lives-1);
    if(P.lives==null&&ex.regen){const again=ex.regen();again.slot=ex.slot;P.queue.push(again);}
  }
  save();
  const foot=$('#pFoot');foot.className='pfoot '+(res.ok?'ok':'bad');
  const showAns=!res.ok||res.showAns||res.typo;
  const combo=res.ok&&P.combo>=3&&P.combo%1===0&&[3,5,10,15,20,30].includes(P.combo)?`<span class="combo">${P.combo} bonnes réponses d’affilée !</span>`:'';
  $('#pFb').innerHTML=`<span class="badge-ic">${ic(res.ok?'check':'x')}</span><div>
    <h3>${res.ok?(res.typo?'Presque parfait !':pick(PRAISE)):'Réponse correcte :'}</h3>
    ${showAns&&res.ans?`<div class="ans ${res.ok?'':'tl'}">${res.ok?'Réponse : ':''}${esc(res.ans)}</div>`:''}
    ${res.expl?`<div class="expl">${esc(res.expl)}</div>`:''}${combo}</div>`;
  paintHead();paintFoot();
  /* Animations du retour */
  const fb=$('#pFb');
  animIn(foot,[{transform:'translateY(22px)'},{transform:'none'}],{duration:360,easing:SPRING});
  animIn($('.badge-ic',fb),[{opacity:0,transform:'scale(.2) rotate(-30deg)'},{opacity:1,transform:'scale(1.18)',offset:.6},{opacity:1,transform:'none'}],{duration:480});
  stagger($$('h3,.ans,.expl,.combo',fb),RISE,{duration:280,delay:90},55);
  if(res.ok){replayClass($('.badge-ic',fb),'burst');}
  else{
    animIn($('#pInner'),[{transform:'none'},{transform:'translateX(-11px)'},{transform:'translateX(9px)'},{transform:'translateX(-6px)'},{transform:'translateX(3px)'},{transform:'none'}],{duration:440,easing:'ease-out'});
    if(P.usesHearts||P.lives!=null){const h=$('#pHearts');animIn($('.ico',h),[{transform:'none'},{transform:'scale(1.5) rotate(-14deg)'},{transform:'scale(.85) rotate(8deg)'},{transform:'none'}],{duration:560});
      const d=document.createElement('span');d.className='dmg';d.textContent='−1';h.appendChild(d);setTimeout(()=>d.remove(),950);}
  }
}
async function pNext(){
  if(P.busy)return;
  if(P.usesHearts&&S.hearts<=0&&P.state==='feedback'){showNoHearts(true);return;}
  if(P.lives!=null&&P.lives<=0){examFail();return;}
  P.i++;P.busy=true;
  await exitInner();
  if(P.i>=P.queue.length){P.busy=false;finishSession();return;}
  showEx();
}

/* ---------- Plus de vies ---------- */
function showNoHearts(inLesson,resume){
  if(!inLesson){openPlayer();P={on:true,mode:'nohearts',total:1,okSlots:new Set(),queue:[]};}
  const wait=Math.ceil(nextHeartIn()/60000);
  $('#pBar').style.width=inLesson?$('#pBar').style.width:'0%';$('#pHearts').innerHTML=`${ic('heart')}<span>0</span>`;
  $('#pFoot').className='pfoot';$('#pFb').innerHTML='';
  const nh=freshInner();nh.innerHTML=`<div class="done">${mascot('sad','lvl-ring')}<h1 style="color:var(--pula)">Plus de vies !</h1>
    <p class="muted" style="max-width:40ch">Une vie revient toutes les 20 minutes (prochaine dans ${wait} min). Tu peux aussi t’entraîner pour en regagner une, sans risque d’en perdre.</p>
    <div style="display:grid;gap:10px;width:100%;max-width:360px">
      <button class="btn gold block" id="nhRefill" ${S.gems>=50?'':'disabled'}>${ic('gem')}Recharger — 50 perlas</button>
      <button class="btn ultra-btn block" id="nhUltra">${ic('bolt')}Activer le mode ultra</button>
      <button class="btn primary block" id="nhPractice">${ic('practice')}S’entraîner (+1 vie)</button>
      <button class="btn ghost block" id="nhQuit">Quitter</button></div></div>`;
  $('#pActs').innerHTML='';celebrate(nh);
  $('#nhRefill').onclick=()=>{S.gems-=50;S.hearts=HEART_MAX;S.heartsTs=Date.now();save();toast('Vies rechargées !');
    if(inLesson){P.i++;if(P.i>=P.queue.length)finishSession();else showEx();}else if(resume){P={on:false};resume();}};
  $('#nhUltra').onclick=e=>{S.set.ultra=true;save();ultraFX(true,e.currentTarget);
    setTimeout(()=>{if(inLesson){P.usesHearts=false;P.i++;if(P.i>=P.queue.length)finishSession();else showEx();}else if(resume){P={on:false};resume();}},reduced()?0:900);};
  $('#nhPractice').onclick=()=>{closePlayer().then(()=>startPractice('srs'));};
  $('#nhQuit').onclick=closePlayer;
}
function examFail(){
  SFX.bad();
  $('#pFoot').className='pfoot';$('#pFb').innerHTML='';
  const ef=freshInner();ef.innerHTML=`<div class="done">${mascot('sad','lvl-ring')}<h1 style="color:var(--pula)">Épreuve non réussie</h1>
    <p class="muted" style="max-width:42ch">Tu as fait trop d’erreurs cette fois. Révise les unités de la section, puis retente ta chance : l’épreuve change à chaque essai.</p></div>`;
  $('#pActs').innerHTML=`<span></span><button class="btn primary" id="pGo">Continuer</button>`;
  $('#pGo').onclick=closePlayer;celebrate(ef);
}
/* Entrée en scène de l'écran de fin */
function celebrate(root){
  const d=$('.done',root);if(!d)return;
  animIn($('svg',d),[{opacity:0,transform:'scale(.3) translateY(30px)'},{opacity:1,transform:'scale(1.12)',offset:.6},{opacity:1,transform:'none'}],{duration:650,easing:SPRING});
  animIn($('h1',d),POP,{duration:520,delay:160,easing:SPRING});
  stagger($$('p,.dtile',d),[{opacity:0,transform:'translateY(18px) scale(.94)'},{opacity:1,transform:'none'}],{duration:420,delay:280,easing:SPRING},90);
  stagger($$('.unlock,.done>div>button',d),[{opacity:0,transform:'translateX(-24px)'},{opacity:1,transform:'none'}],{duration:380,delay:560},110);
  $$('[data-to]',d).forEach((el,i)=>setTimeout(()=>countUp(el,+el.dataset.to,900),320+i*90));
  animIn($('#pActs .btn'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:360,delay:700});
}

/* ---------- Fin de séance ---------- */
function finishSession(){
  const mode=P.mode,L=P.L;
  const perfect=P.mistakes===0;
  const gradedSlots=P.queue.filter(e=>e.graded).map(e=>e.slot);const nGraded=new Set(gradedSlots).size||1;
  const acc=Math.round(P.firstOk/Math.max(1,nGraded)*100);
  const secs=Math.round((Date.now()-P.t0)/1000);
  let xp=10,gems=5;
  const prevDone=L&&isDone(L.id);
  const unitBefore=L&&L.u?unitDone(L.u):true;
  if(mode==='lesson'){xp=XP_BASE[L.kind]||10;if(prevDone)xp=Math.ceil(xp/2);}
  if(mode==='exam'||mode==='jump'){xp=30;gems=20;}
  if(mode==='practice'||mode==='mistakes'){xp=10;gems=3;}
  if(perfect&&(mode==='lesson'||mode==='exam')){xp+=5;gems+=5;}
  const goalBefore=xpToday()>=S.goal;
  addXP(xp);S.gems+=gems;
  if(mode==='lesson'||mode==='exam'){S.done[L.id]={n:((S.done[L.id]||{}).n||0)+1,acc,t:Date.now()};}
  if(mode==='jump'){FLOW.filter(x=>x.sec<P.target).forEach(x=>{if(!S.done[x.id])S.done[x.id]={n:0,acc:100,t:Date.now(),skip:1};});S.tested[P.target]=1;}
  if((mode==='practice'||mode==='mistakes')&&!freeHearts()){syncHearts();if(S.hearts<HEART_MAX){S.hearts++;if(S.hearts>=HEART_MAX)S.heartsTs=Date.now();}}
  if(mode!=='practice'&&mode!=='mistakes'){S.stats.lessons++;S.day.lessons++;if(perfect){S.stats.perfect++;S.day.perfect++;}}
  else{S.day.lessons++;}
  const h=new Date().getHours();if(h<8)S.stats.early++;if(h>=22)S.stats.late++;
  const streakUp=touchStreak();
  const goalNow=!goalBefore&&xpToday()>=S.goal;
  const unitNow=L&&L.u&&!unitBefore&&unitDone(L.u);
  const nextU=unitNow?UNITS[L.u.i+1]:null;
  P.completed=mode==='lesson'||mode==='exam';
  const badges=checkBadges(),qs=claimQuests();
  save();
  Cloud.log(L?L.id:mode==='jump'?'jump-'+P.target:(P.kind||mode),mode,xp,acc);
  SFX.done();confetti();
  const title=mode==='jump'?'Section débloquée !':mode==='exam'?'Épreuve réussie !':perfect?'Leçon parfaite !':'Leçon terminée !';
  const mm=Math.floor(secs/60),ss=String(secs%60).padStart(2,'0');
  $('#pBar').style.width='100%';$('#pFoot').className='pfoot';$('#pFb').innerHTML='';
  const fin=freshInner();
  fin.innerHTML=`<div class="done">${mascot('happy','lvl-ring')}<h1>${title}</h1>
   <div class="dtiles">
    <div class="dtile" style="--c:var(--araw-d)"><div class="lbl">XP gagnés</div><div class="val">${ic('bolt')}<span data-to="${xp}">${xp}</span></div></div>
    <div class="dtile" style="--c:var(--tama)"><div class="lbl">Précision</div><div class="val">${ic('target')}<span data-to="${acc}" data-suf="%">${acc}%</span></div></div>
    <div class="dtile" style="--c:var(--dagat)"><div class="lbl">Temps</div><div class="val tnum">${ic('clock')}${mm}:${ss}</div></div>
   </div>
   <div class="unlocks">
    ${unitNow?`<div class="unlock">${ic('trophy')}<div><b>Unité ${L.u.n} terminée !</b><div class="small muted">${nextU?'Unité '+nextU.n+' débloquée : '+esc(nextU.t):'Il reste l’épreuve de la section.'}</div></div></div>`:''}
    ${streakUp?`<div class="unlock">${ic('flame')}<div><b>Série : ${S.streak} jour${S.streak>1?'s':''}</b><div class="small muted">Reviens demain pour la prolonger.</div></div></div>`:''}
    ${goalNow?`<div class="unlock">${ic('target')}<div><b>Objectif du jour atteint</b><div class="small muted">${S.goal} XP aujourd’hui. Mahusay!</div></div></div>`:''}
    <div class="unlock">${ic('gem')}<div><b>+${gems} perlas</b><div class="small muted">${ultra()?'Mode ultra : perlas illimitées':'Total : '+S.gems}</div></div></div>
    ${(mode==='practice'||mode==='mistakes')&&!freeHearts()?`<div class="unlock">${ic('heart')}<div><b>Vies : ${S.hearts}/${HEART_MAX}</b><div class="small muted">L’entraînement rend une vie.</div></div></div>`:''}
    ${badges.map(b=>`<div class="unlock">${ic(b.ic)}<div><b>Badge : ${esc(b.t)}</b><div class="small muted">${esc(b.d)} · +20 perlas</div></div></div>`).join('')}
    ${qs.map(q=>`<div class="unlock">${ic('flag')}<div><b>Quête accomplie : ${esc(q.t)}</b><div class="small muted">+10 perlas</div></div></div>`).join('')}
   </div></div>`;
  $('#pActs').innerHTML=`<span></span><button class="btn primary" id="pGo">Continuer</button>`;
  $('#pGo').onclick=closePlayer;celebrate(fin);
  setTimeout(()=>{try{$('#pGo').focus({preventScroll:true});}catch(e){}},50);
}

/* ---------- Démarrages ---------- */
function startLesson(id){
  const L=LESSONS[id];if(!L)return;
  if(!unlocked(L)){toast('Termine d’abord les leçons précédentes.');return;}
  if(L.kind==='exam'){startSession(shuffle(examItems(L.sec,18)),{mode:'exam',L,lives:3});return;}
  startSession(lessonItems(L),{mode:'lesson',L});
}
function startJump(secN){
  const prev=secN-1;
  const items=shuffle(examItems(prev,12).concat(prev>1?examItems(prev-1,4):[]));
  startSession(items,{mode:'jump',target:secN,lives:3});
}
function startPractice(kind,cfg){
  cfg=cfg||{};let items=[];const us=seenUnits();
  if(kind==='srs'){
    const due=dueKeys().slice(0,12);
    items=due.map(k=>exFromRef(k));
    if(items.length<10){const extra=weakKeys().filter(k=>!due.includes(k)).slice(0,10-items.length);items=items.concat(extra.map(k=>exFromRef(k)));}
    if(items.length<10){const u=pick(us);items=items.concat(unitMix(u,{w:3,s:4,g:1,c:1,n:1}).slice(0,10-items.length));}
  }else if(kind==='mistakes'){
    items=S.mistakes.slice(0,15).map(r=>exFromRef(r));
    startSession(shuffle(items),{mode:'mistakes'});return;
  }else if(kind==='listen'){
    for(let i=0;i<10;i++){const u=pick(us);if(Math.random()<.5&&u.W.length)items.push(exWord(pick(u.W),'listen'));else if(u.S.length)items.push(exSent(pick(u.S),'listen'));}
  }else if(kind==='conj'){
    let keys=Object.keys(VERBS).filter(k=>!cfg.aff||!cfg.aff.length||cfg.aff.includes(VERBS[k].a));
    if(!keys.length)keys=Object.keys(VERBS);
    for(let i=0;i<12;i++)items.push(exConj(pick(keys),null,cfg.mode==='type'?'type':cfg.mode==='mix'?(i%2?'type':'mc'):'mc'));
  }else if(kind==='num'){
    const max=cfg.max||100;const min=1;
    for(let i=0;i<12;i++){const n=max<=10?1+rnd(10):randNum(min,max);const m=cfg.mode==='type'?'type':cfg.mode==='mix'?pick(['tl','dig','type']):pick(['tl','dig']);items.push(exNum(n,m,min,max));}
  }else if(kind==='bay'){
    sample(BAY_ITEMS,8).forEach((it,i)=>items.push(exBayGlyph(it,BAY_ITEMS,i%2?'rom':'')));
    sample(BAY_SETS[5].words,4).forEach(w=>items.push(exBayWord(w,'mc')));
  }else if(kind==='sent'){
    for(let i=0;i<10;i++){const u=pick(us);const k=['b_fr2tl','b_tl2fr','mc'];if(typeOK())k.push('type','fill');items.push(exSent(pick(u.S),pick(k)));}
  }else if(kind==='unit'){
    const u=UNITS.find(x=>x.id===cfg.u);items=shuffle(unitMix(u,{w:5,s:5,g:2,c:1,n:1}));
  }
  startSession(shuffle(items.filter(Boolean)),{mode:'practice',kind:kind==='unit'?cfg.u:kind});
}

/* ---------- Lecteur d'histoire ---------- */
function startStory(id){
  if(closing){closing.then(()=>startStory(id));return;}
  const st=STORIES.find(x=>x.id===id);if(!st)return;
  if(!storyUnlocked(st)){toast('Termine l’unité correspondante pour débloquer cette histoire.');return;}
  P={on:true,mode:'story',st,i:0,total:st.lines.length,okSlots:new Set(),mistakes:0,t0:Date.now(),waitingQ:false,queue:[]};
  openPlayer();
  $('#pFoot').className='pfoot';$('#pFb').innerHTML='';
  freshInner().innerHTML=`<div class="ex-h"><span class="tag">${ic('stories')}Histoire · ${esc(st.lvl)}</span><h2>${esc(st.t)}</h2><p class="muted">${esc(st.fr)}</p></div><div id="sLines" style="display:grid;gap:14px"></div>`;
  $('#pHearts').innerHTML='';
  storyStep();
}
const AV_COLORS=['#1652C8','#C02D52','#0F8C76','#D9652A','#4C3FB4','#7A4BD8'];
function voiceFor(st,who){const V=TL.VOICES||{};return who?((V.cast||{})[st.cast[who]]||V.def||VOICE_DEF):(V.narr||VOICE_DEF);}
function storyLineHTML(st,ln){
  const [who,tl,fr]=ln;
  if(!who)return `<div class="sline nar"><div><div class="tl-line" style="font-size:1.1rem">${tlTokens(tl)}</div><div class="trans" hidden>${esc(fr)}</div>
    <div style="display:flex;gap:6px;justify-content:center;margin-top:6px">${TTS.can()?`<button class="icon-btn" data-say="${attr(tl)}" data-voice="${voiceFor(st,'')}" aria-label="Écouter">${ic('speaker')}</button>`:''}<button class="btn ghost sm" data-act="trans">Traduction</button></div></div></div>`;
  const keys=Object.keys(st.cast);const ci=keys.indexOf(who);
  return `<div class="sline"><span class="avatar" style="--av:${AV_COLORS[ci%AV_COLORS.length]}">${esc(st.cast[who].replace(/^(Aling|Mang|Lola|Tita|M\.)\s*/,'').charAt(0))}</span>
   <div style="min-width:0"><div class="who">${esc(st.cast[who])}</div><div class="bubble"><div class="tl-line" style="font-size:1.15rem">${tlTokens(tl)}</div><div class="trans" hidden>${esc(fr)}</div>
   <div style="display:flex;gap:4px;margin-top:4px">${TTS.can()?`<button class="icon-btn" data-say="${attr(tl)}" data-voice="${voiceFor(st,who)}" aria-label="Écouter">${ic('speaker')}</button>`:''}<button class="btn ghost sm" data-act="trans">Traduction</button></div></div></div></div>`;
}
function storyStep(){
  const st=P.st;const box=$('#sLines');
  if(P.i>=st.lines.length){storyFinish();return;}
  const ln=st.lines[P.i];
  $('#pBar').style.width=(P.i/st.lines.length*100)+'%';
  if(Array.isArray(ln)){
    $('#pActs').innerHTML=`<span class="small muted">Touche un mot pour sa traduction.</span><button class="btn primary" id="pGo" disabled>Continuer</button>`;
    const show=()=>{
      const ty=$('.sline.typing',box);if(ty)ty.remove();
      box.insertAdjacentHTML('beforeend',storyLineHTML(st,ln));
      const el=box.lastElementChild;
      animIn(el,ln[0]?[{opacity:0,transform:'translateY(14px) scale(.96)'},{opacity:1,transform:'none'}]:RISE,{duration:380,easing:SPRING});
      if(S.set.auto)TTS.speak(ln[1],false,voiceFor(st,ln[0]));
      const g=$('#pGo');g.disabled=false;g.onclick=()=>{if(g.disabled)return;g.disabled=true;P.i++;storyStep();};
      setTimeout(()=>el.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'end'}),30);
    };
    if(ln[0]&&!reduced()){
      const keys=Object.keys(st.cast);const ci=keys.indexOf(ln[0]);
      box.insertAdjacentHTML('beforeend',`<div class="sline typing"><span class="avatar" style="--av:${AV_COLORS[ci%AV_COLORS.length]}">${esc(st.cast[ln[0]].replace(/^(Aling|Mang|Lola|Tita|M\.)\s*/,'').charAt(0))}</span><div><div class="who">${esc(st.cast[ln[0]])}</div><div class="bubble dots"><i></i><i></i><i></i></div></div></div>`);
      setTimeout(()=>box.lastElementChild.scrollIntoView({behavior:'smooth',block:'end'}),20);
      setTimeout(show,520);
    }else show();
    return;
  }else{
    const opts=ln.o.map((t,i)=>({t,i}));const order=shuffle(opts);
    box.insertAdjacentHTML('beforeend',`<div class="sq"><b>${esc(ln.q)}</b><div class="opts">${order.map((o,j)=>`<button class="opt${ln.tl?' tlo':''}" data-sq="${o.i}"><span class="kbd">${j+1}</span><span>${esc(o.t)}</span></button>`).join('')}</div></div>`);
    $('#pActs').innerHTML=`<span class="small muted">Choisis la bonne réponse.</span><button class="btn primary" id="pGo" disabled>Continuer</button>`;
    const q=box.lastElementChild;
    animIn(q,[{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'none'}],{duration:420,easing:SPRING});
    stagger($$('.opt',q),RISE,{duration:300,delay:120},60);
    $$('[data-sq]',q).forEach(b=>b.onclick=()=>{
      if(q.dataset.solved)return;
      if(+b.dataset.sq===ln.a){b.classList.add('right');q.dataset.solved=1;SFX.ok();$$('[data-sq]',q).forEach(x=>x.disabled=true);const g=$('#pGo');g.disabled=false;animIn(g,[{transform:'scale(.94)'},{transform:'scale(1.05)',offset:.6},{transform:'none'}],{duration:320,easing:SPRING});g.onclick=()=>{if(g.disabled)return;g.disabled=true;P.i++;storyStep();};}
      else{b.classList.add('wrong');b.disabled=true;P.mistakes++;SFX.bad();}
    });
  }
  setTimeout(()=>{const last=box.lastElementChild;if(last)last.scrollIntoView({behavior:'smooth',block:'end'});},40);
}
function storyFinish(){
  const st=P.st;const first=!S.stories[st.id];
  const xp=first?15:8,gems=first?10:2;
  S.stories[st.id]={t:Date.now(),m:P.mistakes};S.day.stories++;
  addXP(xp);S.gems+=gems;const streakUp=touchStreak();
  const badges=checkBadges(),qs=claimQuests();save();
  Cloud.log(st.id,'story',xp,null);
  SFX.done();confetti();
  $('#pBar').style.width='100%';
  const sf=freshInner();
  sf.innerHTML=`<div class="done">${mascot('happy','lvl-ring')}<h1>Histoire terminée !</h1><p class="muted">${esc(st.t)} — ${esc(st.fr)}</p>
   <div class="dtiles"><div class="dtile" style="--c:var(--araw-d)"><div class="lbl">XP</div><div class="val">${ic('bolt')}<span data-to="${xp}">${xp}</span></div></div>
   <div class="dtile" style="--c:var(--tama)"><div class="lbl">Erreurs</div><div class="val">${P.mistakes}</div></div>
   <div class="dtile" style="--c:#1C8FD0"><div class="lbl">Perlas</div><div class="val">${ic('gem')}${gems}</div></div></div>
   <div class="unlocks">${streakUp?`<div class="unlock">${ic('flame')}<div><b>Série : ${S.streak} jour${S.streak>1?'s':''}</b></div></div>`:''}
   ${badges.map(b=>`<div class="unlock">${ic(b.ic)}<div><b>Badge : ${esc(b.t)}</b><div class="small muted">${esc(b.d)}</div></div></div>`).join('')}
   ${qs.map(q=>`<div class="unlock">${ic('flag')}<div><b>Quête accomplie : ${esc(q.t)}</b></div></div>`).join('')}</div></div>`;
  $('#pActs').innerHTML=`<span></span><button class="btn primary" id="pGo">Continuer</button>`;
  $('#pGo').onclick=closePlayer;celebrate(sf);
}
function confirmQuit(){
  if(!P.on||P.mode==='nohearts'){closePlayer();return;}
  const lost=P.mode==='story'?'Ta progression dans cette histoire sera perdue.':'Ta progression dans cette séance sera perdue (les vies perdues ne reviennent pas).';
  modal(`<div class="sheet" role="dialog" aria-label="Quitter">${mascot('sad','lvl-ring')}<h2>Tu pars déjà ?</h2><p class="muted">${lost}</p>
    <button class="btn primary block" data-act="modal-close">Continuer la séance</button><button class="btn ghost block" data-act="quit-confirm">Quitter</button></div>`);
}
