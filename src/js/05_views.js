/* =========================================================
   05 — Vues : Apprendre, Pratique, Histoires, Lexique, Profil
   ========================================================= */
const TABS=[{id:'learn',l:'Apprendre',ic:'learn'},{id:'practice',l:'Pratique',ic:'practice'},{id:'stories',l:'Histoires',ic:'stories'},{id:'guide',l:'Lexique',ic:'guide'},{id:'profile',l:'Profil',ic:'profile'}];
const V={tab:'learn',gtab:'grammar',dq:'',dfilter:'all',cq:'',caff:'',scrolled:false,openNode:null,editName:false,confirmReset:false};

function modal(html){$('#modal').innerHTML=`<div class="scrim" data-act="scrim">${html}</div>`;}
function closeModal(){
  const m=$('#modal'),sc=$('.scrim',m);
  if(!sc||reduced()){m.innerHTML='';return;}
  if(sc.dataset.closing)return;sc.dataset.closing='1';
  anim(sc,[{opacity:1},{opacity:0}],{duration:200,easing:EASE_IN});
  anim($('.sheet',sc),[{transform:'none'},{transform:'translateY(48px) scale(.98)'}],{duration:200,easing:EASE_IN}).then(()=>{if(m.contains(sc))m.innerHTML='';});
}

/* ---------- Statistiques compactes ---------- */
function statChips(){
  syncHearts();
  const cur=currentLesson();const sec=cur?cur.sec:5;
  return `<div class="chips">
   <button class="sec-pill" data-act="nav" data-to="learn" style="background:${SEC_COL[sec]};border:0">${SECS[sec-1].code}</button>
   <button class="stat streak${S.last===today()?'':' off'}" data-act="info-streak" aria-label="Série de ${S.streak} jours">${ic('flame')}<span class="tnum">${S.streak}</span></button>
   <button class="stat gems${ultra()?' ult':''}" data-act="shop" aria-label="${ultra()?'Perlas illimitées':S.gems+' perlas'}">${ic('gem')}<span class="tnum">${ultra()?'∞':S.gems}</span></button>
   <button class="stat hearts${ultra()?' ult':''}" data-act="info-hearts" aria-label="${freeHearts()?'Vies illimitées':S.hearts+' vies'}">${ic('heart')}<span class="tnum">${freeHearts()?'∞':S.hearts}</span></button>
  </div>`;
}
function topbar(title){return `<div class="topbar"><h1 style="font-size:1.25rem">${title}</h1>${statChips()}</div>`;}
function goalPanel(){
  const g=xpToday(),p=Math.min(1,g/S.goal);
  return `<div class="panel"><div class="section-h"><h3>Objectif du jour</h3><button class="btn ghost sm" data-act="nav" data-to="profile">Modifier</button></div>
   <div style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center">${ic('target')}<div><div class="meter gold"><i style="width:${p*100}%"></i></div><div class="small muted tnum" style="margin-top:4px">${g} / ${S.goal} XP</div></div></div></div>`;
}
function questPanel(){
  const qs=quests();
  return `<div class="panel"><div class="section-h"><h3>Quêtes du jour</h3><span class="small muted">+10 perlas chacune</span></div>
   ${qs.map(q=>`<div class="quest${q.v>=q.n?' done':''}">${ic(q.ic)}<div><b>${esc(q.t)}</b><div class="meter thin${q.v>=q.n?' gold':''}"><i style="width:${q.v/q.n*100}%"></i></div><div class="small muted tnum" style="margin-top:2px">${q.v} / ${q.n}</div></div></div>`).join('')}</div>`;
}
function renderSide(){
  const lv=levelOf(S.xp),lt=levelTitle(lv.n);
  $('#side').innerHTML=`<div class="side-stats">${statChips()}</div><div class="panel"><div style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center">${mascot('','m')}<div style="min-width:0"><h3>Panahon ${esc(saPlace())}</h3>${wxBlock()}</div></div></div>${goalPanel()}${questPanel()}
   <div class="panel"><div class="section-h"><h3>Niveau ${lv.n}</h3><span class="small muted">${lt[0]} · ${lt[1]}</span></div>
    <div class="meter"><i style="width:${lv.p*100}%"></i></div><div class="small muted tnum">${fmtNum(S.xp)} / ${fmtNum(lv.hi)} XP</div></div>
   ${sidePanelAccount()}`;
}
/* Encart compte (colonne de droite) */
function sidePanelAccount(){
  const row=(t,s,btn)=>`<div class="panel"><div class="side-acct">${ic('cloud')}<div style="min-width:0"><b>${t}</b><div class="small muted">${s}</div></div></div>${btn||''}</div>`;
  if(!Cloud.available())return row('Sauvegarde locale','Ta progression est enregistrée dans ce navigateur.');
  if(!Cloud.ready)return row('Compte','Connexion au serveur…');
  if(Cloud.user)return row(esc(Cloud.name()),Cloud.offline?'Hors ligne : la synchronisation reprendra dès le retour du réseau.':'Progression synchronisée sur ton compte.');
  return row('Sauvegarde ta progression','Crée un compte pour la retrouver sur tous tes appareils.',`<div class="row-btns" style="margin-top:10px"><button class="btn primary sm" data-act="acct-go" data-id="signup">Créer un compte</button><button class="btn sm" data-act="acct-go" data-id="login">Connexion</button></div>`);
}
function renderChrome(){
  $('#brand').innerHTML=`${mascot('','b','none')}<div>Akademya<small>Tagalog</small></div>`;
  $('#railNav').innerHTML=TABS.map(t=>`<button class="rail-btn" data-act="nav" data-to="${t.id}" ${V.tab===t.id?'aria-current="page"':''}>${ic(t.ic)}${t.l}</button>`).join('');
  $('#tabbar').innerHTML=TABS.map(t=>`<button class="tab" data-act="nav" data-to="${t.id}" ${V.tab===t.id?'aria-current="page"':''}>${ic(t.ic)}<span>${t.l}</span></button>`).join('');
  const q=TTS.quality;
  $('#railFoot').innerHTML=`Voix : ${AUDIO.has()&&S.set.natural!==false?'naturelle (Gemini)':q==='native'?'tagalog':q==='approx'?'approchante':q==='default'?'par défaut':'indisponible'}<br>${Cloud.user?'Compte : '+esc(Cloud.name())+(Cloud.offline?' (hors ligne)':' ✓')+'<br>':''}Du français au tagalog, A1 → C1.`;
  renderSide();
}
function refreshChrome(){if(!P.on){renderChrome();}}

/* ---------- Apprendre ---------- */
function nodeOffset(i){return [0,44,74,44,0,-44,-74,-44][i%8];}
function lessonNode(L,cur,idx){
  const done=isDone(L.id),open=unlocked(L),isCur=cur&&cur.id===L.id;
  const col=SEC_COL[L.sec],cold=SEC_COLD[L.sec];
  const cls=['node',done?'done':'',!open?'locked':'',isCur?'current':'',L.kind==='exam'?'boss':''].join(' ');
  const icn=done&&L.kind!=='exam'?'check':!open?'lock':KIND[L.kind].ic;
  const pop=V.openNode===L.id?nodePop(L,open,done):'';
  return `<div class="node-wrap${isCur&&!pop?' has-tip':''}${pop?' open':''}" style="--x:${nodeOffset(idx)}px;--nc:${col};--ncd:${cold}" id="n-${L.id}">
    ${isCur&&!pop?`<span class="start-tip" style="--nc:${col}">${done?'Réviser':'Commencer'}</span>`:''}
    <button class="${cls}" data-act="node" data-id="${L.id}" aria-label="${attr((L.u?'Unité '+L.u.n+' · ':'')+L.t)}${done?' (terminée)':!open?' (verrouillée)':''}">${ic(icn)}</button>
    ${pop}</div>`;
}
function nodePop(L,open,done){
  const u=L.u;const n=u?u.L.length:1;
  const xp=L.kind==='exam'?30:(XP_BASE[L.kind]||10);
  const sub=L.kind==='exam'?`18 questions, 3 erreurs permises · Section ${L.sec}`:`Leçon ${L.ui+1} sur ${n} · ${KIND[L.kind].lbl}`;
  if(!open)return `<div class="pop locked"><h4>${esc(L.t)}</h4><p class="small">Termine les leçons précédentes pour débloquer celle-ci.</p><button class="btn block" disabled>${ic('lock')}Verrouillée</button></div>`;
  return `<div class="pop" style="--nc:${SEC_COL[L.sec]}"><h4>${esc(L.t)}</h4><p class="small" style="opacity:.92">${sub}</p>
   <button class="btn block" data-act="start" data-id="${L.id}">${done?`Refaire +${Math.ceil(xp/2)} XP`:`Commencer +${xp} XP`}</button></div>`;
}
function renderLearn(){
  const cur=currentLesson();
  let html=topbar('Apprendre');
  if(!S.seenWelcome&&!Object.keys(S.done).length){
    html+=`<div class="hero">${mascot('','m')}<div style="display:grid;gap:8px"><h1>Maligayang pagdating!</h1><p class="muted">Bienvenue dans ton cours de tagalog. Je suis Araw, « soleil » en tagalog. Je m’habille selon la météo de ta ville. On commence par le début, ou tu passes un test pour sauter des sections ?</p>${wxBlock()}
     <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" data-act="welcome-start">Je débute</button><button class="btn sm" data-act="placement">J’ai déjà des bases</button>${Cloud.available()&&!Cloud.user?'<button class="btn sm ghost" data-act="acct-go" data-id="login">J’ai un compte</button>':''}</div></div></div>`;
  }
  else if(cur&&Object.keys(S.done).length){
    const h=new Date().getHours();const hello=h<11?'Magandang umaga':h<14?'Magandang tanghali':h<18?'Magandang hapon':'Magandang gabi';
    html+=`<div class="hero">${mascot('','m')}<div style="display:grid;gap:8px;min-width:0"><h1>${hello}${S.name?', '+esc(S.name):''}!</h1>
     ${wxBlock()}<p class="muted">Prochaine étape : ${cur.u?`unité ${cur.u.n} · ${esc(cur.u.t)} — ${esc(cur.t)}`:esc(cur.t)+' de la section '+cur.sec}.</p>
     <div><button class="btn primary sm" data-act="start" data-id="${cur.id}">${ic('play')}Continuer</button></div></div></div>`;
    if(Cloud.available()&&Cloud.ready&&!Cloud.user&&!V.noNudge)html+=`<div class="nudge">${ic('cloud')}<span><b>Sauvegarde ta progression</b><span class="small muted">Un compte gratuit pour la retrouver sur tous tes appareils.</span></span><button class="btn primary sm" data-act="acct-go" data-id="signup">Créer un compte</button><button class="icon-btn" data-act="nudge-x" aria-label="Masquer">${ic('x')}</button></div>`;
  }
  SECS.forEach(sec=>{
    const sOpen=secUnlocked(sec.id),sDone=secDone(sec.id);
    const units=UNITS.filter(u=>u.sec===sec.id);
    const nL=FLOW.filter(L=>L.sec===sec.id).length,dL=FLOW.filter(L=>L.sec===sec.id&&isDone(L.id)).length;
    html+=`<div class="sign${sOpen?'':' locked'}" style="--sc:${SEC_COL[sec.id]};--scd:${SEC_COLD[sec.id]}" id="sec-${sec.id}">
      <div><div class="via">Section ${sec.id} · ${esc(sec.fr)}</div><div class="route">${esc(sec.tl)}</div></div><span class="code">${sec.code}</span>
      <p>${esc(sec.desc)} <span class="tnum">(${dL}/${nL})</span></p>
      ${!sOpen?`<button class="btn sm" data-act="jump" data-sec="${sec.id}" style="--c:#fff;--cd:rgba(0,0,0,.2);--fg:${SEC_COL[sec.id]}">${ic('skip')}Passer directement ici</button>`:''}
      ${sDone?`<span class="small" style="grid-column:1/-1;font-weight:800">${ic('trophy')} Section terminée</span>`:''}
    </div>`;
    let idx=0;
    units.forEach(u=>{
      const uOpen=unlocked(u.L[0]);
      html+=`<section class="unit" id="u-${u.id}"><div class="ubanner${uOpen?'':' locked'}" ${uOpen?`style="--uc:${SEC_COL[u.sec]};--ucd:${SEC_COLD[u.sec]}"`:''}>
        <div><div class="un">Unité ${u.n}${u.L.some(L=>isDone(L.id))?` · ${u.L.filter(L=>isDone(L.id)).length}/${u.L.length}`:''}</div><h3>${esc(u.t)}</h3><div class="ut">${esc(u.tl)}</div></div>
        <button class="gbtn" data-act="unitguide" data-u="${u.id}" aria-label="Guide de l’unité ${u.n}">${ic('guide')}<span>Guide</span></button></div>
        <div class="path">${u.L.map(L=>lessonNode(L,cur,idx++)).join('')}
        ${STORIES.filter(st=>st.after===u.id).map(st=>{const ok=storyUnlocked(st),rd=!!S.stories[st.id];return `<div class="node-wrap" style="--x:${nodeOffset(idx++)}px;--nc:#7A4BD8;--ncd:#5A33A8"><button class="node story ${rd?'done':ok?'':'locked'}" data-act="story" data-id="${st.id}" aria-label="Histoire : ${attr(st.t)}">${ic(ok?'stories':'lock')}</button><div class="node-label">${esc(st.t)}</div></div>`;}).join('')}
        </div></section>`;
    });
    const E=LESSONS[`sec${sec.id}-exam`];
    html+=`<div class="path" style="padding-top:0">${lessonNode(E,cur,0)}<div class="node-label">Épreuve de la section ${sec.id}</div></div>`;
  });
  html+=`<div class="empty">${mascot('happy','m')}<b>Tapos na! Tout le parcours est là.</b><span class="small">Pour aller encore plus loin : histoires, révisions espacées et conjugaison dans l’onglet Pratique.</span></div>`;
  return `<div class="view">${html}</div>`;
}

/* ---------- Guide d'unité (modale) ---------- */
function guideHTML(blocks){
  return `<div class="doc">${blocks.map(b=>{
    const [t,c]=b;
    if(t==='h')return `<h3>${esc(c)}</h3>`;
    if(t==='p')return `<p>${rich(c)}</p>`;
    if(t==='tip')return `<div class="tip">${ic('bulb')}<p>${rich(c)}</p></div>`;
    if(t==='ex')return `<ul class="exl">${c.map(([tl,fr])=>`<li>${TTS.can()?`<button class="mini" data-say="${attr(tl)}" aria-label="Écouter">${ic('speaker')}</button>`:'<span></span>'}<div><div class="t">${tlTokens(tl)}</div><div class="f">${esc(fr)}</div></div></li>`).join('')}</ul>`;
    if(t==='tbl')return `<div class="tblw"><table class="tbl"><thead><tr>${c[0].map(h=>`<th>${rich(h)}</th>`).join('')}</tr></thead><tbody>${c.slice(1).map(r=>`<tr>${r.map(x=>`<td>${rich(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return '';}).join('')}</div>`;
}
function openUnitGuide(uid){
  const u=UNITS.find(x=>x.id===uid);if(!u)return;
  const vocab=u.bay?`<h3>Le tableau complet</h3>${bayChart()}`:`<h3 style="margin-top:6px">Vocabulaire de l’unité</h3><div class="rows">${u.W.map(w=>wordRow(w)).join('')}</div>`;
  const first=u.L.find(L=>!isDone(L.id))||u.L[0];
  modal(`<div class="sheet wide" role="dialog" aria-label="Guide"><div class="sheet-h"><div><span class="eyebrow">Unité ${u.n} · ${esc(u.sx.code)}</span><h2>${esc(u.t)}</h2><div class="tl">${esc(u.tl)}</div></div><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   <p class="muted">${esc(u.d)}</p>${guideHTML(u.guide)}${vocab}
   <div style="display:flex;gap:10px;flex-wrap:wrap">${unlocked(first)?`<button class="btn primary" data-act="start" data-id="${first.id}">${ic('play')}${isDone(first.id)?'Réviser l’unité':'Commencer'}</button>`:''}
   ${u.L.some(L=>isDone(L.id))&&!u.bay?`<button class="btn" data-act="prac-unit" data-u="${u.id}">${ic('refresh')}Pratique libre</button>`:''}</div></div>`);
}
function strBars(k){const s=(S.words[k]||{}).s||0;return `<span class="str" title="Maîtrise ${s}/6">${[1,2,3,4,5,6].map(i=>`<i class="${s>=i?'on':''}"></i>`).join('')}</span>`;}
function wordRow(w){
  return `<div class="row">${TTS.can()?`<button class="say slow" data-say="${attr(w.tl[0])}" aria-label="Écouter">${ic('speaker')}</button>`:`<span style="font-size:1.6rem">${w.pic&&w.pic[0]!=='#'?w.pic:''}</span>`}
   <div style="min-width:0"><div class="t">${esc(w.tl.join(' / '))}</div><div class="f">${esc(w.fr)}${w.note?' · <i>'+esc(w.note)+'</i>':''}</div></div>
   <div class="meta">${S.words[w.k]?strBars(w.k):''}<div>U${w.u.n}</div></div></div>`;
}
function bayChart(){
  const cons=[['ᜊ','b'],['ᜃ','k'],['ᜇ','d/r'],['ᜄ','g'],['ᜑ','h'],['ᜎ','l'],['ᜋ','m'],['ᜈ','n'],['ᜅ','ng'],['ᜉ','p'],['ᜐ','s'],['ᜆ','t'],['ᜏ','w'],['ᜌ','y']];
  return `<div class="tblw"><table class="tbl"><thead><tr><th></th><th>+a</th><th>+e/i</th><th>+o/u</th><th>seule</th></tr></thead><tbody>
   <tr><td><b>voyelle</b></td><td class="bay sm">ᜀ</td><td class="bay sm">ᜁ</td><td class="bay sm">ᜂ</td><td></td></tr>
   ${cons.map(([g,r])=>`<tr><td><b>${r}</b></td><td><span class="bay sm">${g}</span> <span class="small muted">${r.split('/')[0]}a</span></td><td><span class="bay sm">${g}${BAY_KI}</span> <span class="small muted">${r.split('/')[0]}i</span></td><td><span class="bay sm">${g}${BAY_KU}</span> <span class="small muted">${r.split('/')[0]}u</span></td><td><span class="bay sm">${g}${BAY_VIR}</span> <span class="small muted">${r.split('/')[0]}</span></td></tr>`).join('')}
  </tbody></table></div>`;
}

/* ---------- Pratique ---------- */
function renderPractice(){
  const due=dueKeys().length,mis=S.mistakes.length,tts=TTS.can()&&S.set.listen;
  const lw=learnedWords();
  return `<div class="view">${topbar('Pratique')}
   <div class="hero">${mascot('','m')}<div style="display:grid;gap:6px"><h1>Sanayan</h1><p class="muted">L’entraînement ne coûte jamais de vie et en rend une. ${lw} mot${lw>1?'s':''} appris, ${due} élément${due>1?'s':''} à réviser maintenant.</p></div></div>
   <div class="cards">
    <button class="pcard" data-act="prac" data-p="srs" style="--pc:var(--dagat)"><span class="pi">${ic('refresh')}</span><div><b>Révision intelligente</b><span>${due?due+' élément'+(due>1?'s':'')+' à revoir, au bon moment':'Tes mots les plus fragiles'}</span></div></button>
    <button class="pcard" data-act="prac" data-p="mistakes" style="--pc:var(--pula)" ${mis?'':'disabled'}><span class="pi">${ic('target')}</span><div><b>Corriger mes erreurs</b><span>${mis?mis+' erreur'+(mis>1?'s':'')+' récente'+(mis>1?'s':''):'Aucune erreur en attente'}</span></div></button>
    <button class="pcard" data-act="prac" data-p="listen" style="--pc:#7A4BD8" ${tts?'':'disabled'}><span class="pi">${ic('ear')}</span><div><b>Écoute</b><span>${tts?'Mots et phrases à l’oreille':'Aucune voix disponible sur cet appareil'}</span></div></button>
    <button class="pcard" data-act="conj-cfg" style="--pc:var(--s3)"><span class="pi">${ic('pen')}</span><div><b>Conjugaison</b><span>${Object.keys(VERBS).length} verbes, tous les focus et aspects</span></div></button>
    <button class="pcard" data-act="num-cfg" style="--pc:var(--s2)"><span class="pi">${ic('hash')}</span><div><b>Nombres</b><span>De 1 à 999 999, en lettres</span></div></button>
    <button class="pcard" data-act="prac" data-p="sent" style="--pc:var(--s4)"><span class="pi">${ic('chat')}</span><div><b>Phrases</b><span>Traductions tirées des unités commencées</span></div></button>
    <button class="pcard" data-act="prac" data-p="bay" style="--pc:var(--s5)"><span class="pi">${ic('feather')}</span><div><b>Baybayin</b><span>Lire l’écriture ancienne</span></div></button>
   </div>
   <div class="section-h"><h2>Mots les plus fragiles</h2><button class="btn ghost sm" data-act="dict-learned">Tous mes mots</button></div>
   <div class="rows">${weakKeys().slice(0,8).map(k=>wordRow(BYKEY[k])).join('')||`<div class="empty">${ic('guide')}<span>Les mots apparaissent ici dès ta première leçon.</span></div>`}</div>
  </div>`;
}
function openConjCfg(){
  const affs=Object.keys(TL.AFFIX);
  modal(`<div class="sheet" role="dialog" aria-label="Conjugaison"><div class="sheet-h"><h2>Conjugaison</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   <p class="muted">Choisis les affixes à travailler (aucun = tous).</p>
   <div class="seg" style="flex-wrap:wrap" id="cfgAff">${affs.map(a=>`<button type="button" aria-pressed="false" data-aff="${a}">${esc(TL.AFFIX[a].n)}</button>`).join('')}</div>
   <p class="muted">Mode</p><div class="seg" id="cfgMode"><button type="button" aria-pressed="true" data-m="mc">Choix</button><button type="button" aria-pressed="false" data-m="mix">Mixte</button><button type="button" aria-pressed="false" data-m="type">Clavier</button></div>
   <button class="btn primary block" data-act="conj-go">${ic('play')}Commencer</button></div>`);
}
function openNumCfg(){
  modal(`<div class="sheet" role="dialog" aria-label="Nombres"><div class="sheet-h"><h2>Nombres</h2><button class="icon-btn" data-act="modal-close" aria-label="Fermer">${ic('x')}</button></div>
   <p class="muted">Jusqu’à…</p><div class="seg" id="cfgMax"><button type="button" aria-pressed="false" data-v="10">10</button><button type="button" aria-pressed="true" data-v="100">100</button><button type="button" aria-pressed="false" data-v="1000">1 000</button><button type="button" aria-pressed="false" data-v="999999">999 999</button></div>
   <p class="muted">Mode</p><div class="seg" id="cfgMode"><button type="button" aria-pressed="true" data-m="mc">Choix</button><button type="button" aria-pressed="false" data-m="mix">Mixte</button><button type="button" aria-pressed="false" data-m="type">Clavier</button></div>
   <button class="btn primary block" data-act="num-go">${ic('play')}Commencer</button></div>`);
}

/* ---------- Histoires ---------- */
function renderStories(){
  const lv=['A1','A2','B1','B2','C1'];
  const cols={A1:'var(--s1)',A2:'var(--s2)',B1:'var(--s3)',B2:'var(--s4)',C1:'var(--s5)'};
  return `<div class="view">${topbar('Histoires')}
   <div class="hero">${mascot('','m')}<div style="display:grid;gap:6px"><h1>Mga Kuwento</h1><p class="muted">De courts dialogues avec des questions de compréhension. Touche un mot pour sa traduction. Chaque histoire se débloque après son unité.</p></div></div>
   ${lv.map(l=>{const list=STORIES.filter(s=>s.lvl===l);if(!list.length)return '';return `<div class="section-h"><h2>Niveau ${l}</h2></div><div class="rows">${list.map(st=>{const ok=storyUnlocked(st),rd=S.stories[st.id];const u=UNITS.find(x=>x.id===st.after);
      return `<button class="story-card${ok?'':' locked'}" data-act="story" data-id="${st.id}"><span class="cover" style="--sc:${cols[l]}">${ok?ic('stories'):ic('lock')}</span><div><b>${esc(st.t)}</b><span>${esc(st.fr)} · ${ok?(rd?'Lue':'Nouvelle'):'Après l’unité '+u.n}</span></div>${rd?ic('check'):ic('chevron')}</button>`;}).join('')}</div>`;}).join('')}
  </div>`;
}

/* ---------- Lexique ---------- */
const GTABS=[['grammar','Grammaire'],['dict','Dictionnaire'],['conj','Conjugaison'],['num','Nombres'],['bay','Baybayin'],['pron','Prononciation']];
function renderGuide(){
  let body='';
  if(V.gtab==='grammar'){
    body=SECS.map(sec=>`<div class="section-h"><h2>${sec.code} · ${esc(sec.fr)}</h2></div><div class="ulist">${UNITS.filter(u=>u.sec===sec.id).map(u=>`<button class="ubtn" data-act="unitguide" data-u="${u.id}" style="--uc:${SEC_COL[u.sec]}"><span class="n">${u.n}</span><div><b>${esc(u.t)}</b><span>${esc(u.tl)} · ${esc(u.d)}</span></div>${ic('chevron')}</button>`).join('')}</div>`).join('');
  }else if(V.gtab==='dict'){
    const q=norm(V.dq);
    let list=ALLW;
    if(V.dfilter==='learned')list=list.filter(w=>S.words[w.k]&&S.words[w.k].s>=1);
    if(V.dfilter==='weak')list=list.filter(w=>S.words[w.k]&&S.words[w.k].s<=2);
    if(q)list=list.filter(w=>w.tl.some(t=>norm(t).includes(q))||norm(w.fr).includes(q));
    const shown=list.slice(0,120);
    body=`<div class="search">${ic('search')}<input id="dictQ" type="search" placeholder="Chercher en français ou en tagalog" value="${attr(V.dq)}" aria-label="Chercher"></div>
     <div class="seg"><button type="button" data-act="dfilter" data-f="all" aria-pressed="${V.dfilter==='all'}">Tous (${ALLW.length})</button><button type="button" data-act="dfilter" data-f="learned" aria-pressed="${V.dfilter==='learned'}">Appris (${learnedWords()})</button><button type="button" data-act="dfilter" data-f="weak" aria-pressed="${V.dfilter==='weak'}">À revoir</button></div>
     <div class="rows" id="dictRows">${shown.map(wordRow).join('')||`<div class="empty">Aucun mot trouvé.</div>`}</div>${list.length>120?`<p class="small muted">${list.length-120} autres résultats : affine ta recherche.</p>`:''}`;
  }else if(V.gtab==='conj'){
    const q=norm(V.cq);
    const list=Object.entries(VERBS).filter(([k,v])=>(!V.caff||v.a===V.caff)&&(!q||norm(v.r).includes(q)||norm(v.fr).includes(q)||v.f.some(f=>norm(f).includes(q))));
    body=`<div class="search">${ic('search')}<input id="conjQ" type="search" placeholder="Racine, forme ou sens" value="${attr(V.cq)}" aria-label="Chercher un verbe"></div>
     <div class="seg"><button type="button" data-act="caff" data-a="" aria-pressed="${!V.caff}">Tous</button>${Object.entries(TL.AFFIX).map(([a,A])=>`<button type="button" data-act="caff" data-a="${a}" aria-pressed="${V.caff===a}">${esc(A.n)}</button>`).join('')}</div>
     ${V.caff?`<div class="panel small"><b>${esc(TL.AFFIX[V.caff].n)}</b> — focus ${esc(TL.AFFIX[V.caff].f)}. ${esc(TL.AFFIX[V.caff].d)}</div>`:''}
     <div class="vgrid">${list.map(([k,v])=>`<div class="vc"><div class="top"><b>${esc(v.r)}</b><span class="chip aff" style="padding:1px 8px;font-size:.72rem">${esc(TL.AFFIX[v.a].n)}</span><span class="small muted">${esc(v.fr)}</span></div>
      <div class="forms">${v.f.map((f,i)=>`<div><small>${TL.ASPECTS[i]}</small><span class="tl tl-say" data-say="${attr(f.split('|')[0])}">${esc(f.replace(/\|/g,' / '))}</span></div>`).join('')}</div></div>`).join('')}</div><p class="small muted">${list.length} verbe${list.length>1?'s':''}. Touche une forme pour l’entendre.</p>`;
  }else if(V.gtab==='num'){
    const n=V.num==null?2026:V.num;
    body=`<div class="panel" style="display:grid;gap:10px"><label class="lbl" for="numIn"><b>Tape un nombre (0 à 999 999)</b></label>
      <input class="num-in tnum" id="numIn" type="number" inputmode="numeric" min="0" max="999999" value="${n}">
      <div style="display:flex;gap:10px;align-items:center">${TTS.can()?`<button class="say" data-say="${attr(tlNum(n))}" aria-label="Écouter">${ic('speaker')}</button>`:''}<div class="tl-line" id="numOut">${esc(n>0&&n<=999999?tlNum(n):'—')}</div></div></div>
     ${guideHTML([['h','Repères'],['tbl',[['Nombre','Tagalog','Espagnol (prix, heure)'],['1','*isa*','uno'],['2','*dalawa*','dos'],['3','*tatlo*','tres'],['4','*apat*','kuwatro'],['5','*lima*','singko'],['6','*anim*','sais'],['7','*pito*','siyete'],['8','*walo*','otso'],['9','*siyam*','nuwebe'],['10','*sampu*','diyes'],['11','*labing-isa*','onse'],['12','*labindalawa*','dose'],['20','*dalawampu*','bente'],['30','*tatlumpu*','trenta'],['40','*apatnapu*','kuwarenta'],['50','*limampu*','singkuwenta'],['100','*sandaan*','siyento'],['1000','*isang libo*','mil']]],['tip','Les ordinaux se forment avec *ika-* : *ikalawa* (2e), *ikatlo* (3e), *ika-12* (12e). « Premier » se dit *una*.']])}`;
  }else if(V.gtab==='bay'){
    const t=V.bayText==null?'Mahal kita':V.bayText;
    body=`<div class="panel" style="display:grid;gap:10px"><label for="bayIn"><b>Écris en lettres latines</b></label><input class="type-line" id="bayIn" type="text" value="${attr(t)}" autocomplete="off" spellcheck="false"><div class="bay" id="bayOut" style="font-size:3rem;word-break:break-word">${esc(toBaybayin(t))}</div><p class="small muted">Conversion moderne : e→i, o→u, r→da, consonne finale avec le virama ᜔.</p></div>
     ${bayChart()}${guideHTML(UNITS[UNITS.length-1].guide)}`;
  }else{
    body=guideHTML(PRON);
  }
  return `<div class="view">${topbar('Lexique')}<div class="seg" role="toolbar" aria-label="Rubriques">${GTABS.map(([id,l])=>`<button type="button" data-act="gtab" data-g="${id}" aria-pressed="${V.gtab===id}">${l}</button>`).join('')}</div>${body}</div>`;
}
const PRON=[
 ['h','L’alphabet'],
 ['p','L’alphabet filipino compte 28 lettres : les 26 lettres latines plus *ñ* et *ng*. Les mots tagalogs d’origine n’utilisent que l’ancien *abakada* : a, b, k, d, e, g, h, i, l, m, n, ng, o, p, r, s, t, u, w, y.'],
 ['h','Les voyelles'],
 ['tbl',[['Lettre','Son','Exemple'],['a','« a » de papa','*araw*'],['e','« è » de mère','*ate*'],['i','« i » de lit','*isa*'],['o','« o » de pot','*oo*'],['u','« ou » de loup','*ulo*']]],
 ['p','*e/i* et *o/u* étaient à l’origine des variantes d’un même son : *babae* se dit souvent « babaï ».'],
 ['h','Les consonnes à surveiller'],
 ['tbl',[['Graphie','Prononciation','Exemple'],['ng','comme « parking », même en début de mot','*ngayon*, *ngipin*'],['mga','« ma-nga »','*mga bata*'],['ng (mot seul)','« nang »','*kumain ng isda*'],['g','toujours dur, comme « gare »','*gising*'],['s','toujours « s », jamais « z »','*masaya*'],['r','roulé légèrement','*araw*'],['h','aspiré, comme en anglais','*hapon*']]],
 ['h','L’accent tonique'],
 ['p','L’accent tombe souvent sur l’avant-dernière syllabe, mais pas toujours, et il peut changer le sens du mot. L’écriture courante ne le note pas : c’est le contexte qui tranche.'],
 ['tbl',[['Mot','Accent sur…','Sens'],['*bukas*','BU-kas','demain'],['*bukas*','bu-KAS','ouvert'],['*puno*','PU-no','arbre'],['*puno*','pu-NO','plein'],['*basa*','BA-sa','lire'],['*basa*','ba-SA','mouillé']]],
 ['h','Le coup de glotte'],
 ['p','Beaucoup de mots finissent par une petite coupure de la voix (comme dans « uh-oh ») : *bata*, *hindi*, *oo*. Les dictionnaires la notent avec les accents *pakupya* (â) ou *paiwa* (à) ; l’écriture courante ne les note pas.'],
 ['h','Les diphtongues'],
 ['p','*ay* se dit « aï » (*bahay*), *aw* se dit « aou » (*araw*), *iw* se dit « iou » (*sisiw*), *oy* se dit « oï » (*apoy*).'],
 ['tip','Dans les exercices d’écoute, le bouton tortue relit plus lentement. Si ton appareil n’a pas de voix tagalog, l’application choisit une voix proche (indonésien, malais ou espagnol).']
];

/* ---------- Profil ---------- */
function weekChart(){
  const days=[];for(let i=6;i>=0;i--){const d=dayAdd(today(),-i);days.push({d,v:S.days[d]||0});}
  const max=Math.max(S.goal,...days.map(x=>x.v));const W=320,H=150,pad=24,bw=28;
  const step=(W-pad*2)/7;const lbl=['D','L','M','M','J','V','S'];
  const gy=H-pad-(S.goal/max)*(H-pad*2);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="XP des 7 derniers jours">
   <line x1="${pad}" x2="${W-pad}" y1="${gy}" y2="${gy}" stroke="var(--araw)" stroke-width="2" stroke-dasharray="5 5"/>
   <text x="${W-pad}" y="${gy-5}" text-anchor="end" font-size="10" font-weight="800" fill="var(--ink-3)">objectif ${S.goal}</text>
   ${days.map((x,i)=>{const h=Math.max(3,(x.v/max)*(H-pad*2));const X=pad+i*step+(step-bw)/2,Y=H-pad-h;const [y,m,d]=x.d.split('-').map(Number);const wd=new Date(y,m-1,d).getDay();
     return `<rect x="${X}" y="${Y}" width="${bw}" height="${h}" rx="7" fill="${x.v>=S.goal?'var(--araw)':x.v?'var(--dagat)':'var(--surface-3)'}"/>${x.v?`<text x="${X+bw/2}" y="${Y-4}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--ink-2)">${x.v}</text>`:''}<text x="${X+bw/2}" y="${H-6}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink-3)">${lbl[wd]}</text>`;}).join('')}
  </svg>`;
}
function sw(id,on,label,sub,dis){return `<div class="set-row"><label class="lbl" for="${id}">${label}${sub?`<small>${sub}</small>`:''}</label><span class="switch"><input type="checkbox" id="${id}" data-set="${id.replace('set-','')}" ${on?'checked':''} ${dis?'disabled':''}><span></span></span></div>`;}
/* Carte du mode ultra (profil) */
function ultraCard(){
  const on=ultra();
  return `<label class="ultra-card${on?' on':''}${S.set.anim===false?' still':''}" for="set-ultra">
    <span class="ub">${ic('bolt')}</span>
    <span class="lbl">${on?'Mode ultra activé':'Activer le mode ultra ?'}<small>${on?'Vies, perlas et gels de série illimités. Aucune limite d’erreurs, même aux épreuves.':'Vies, perlas et gels de série illimités : plus rien ne bloque ta progression.'}</small></span>
    <span class="switch"><input type="checkbox" id="set-ultra" data-set="ultra" ${on?'checked':''} aria-label="Mode ultra"><span></span></span></label>`;
}
/* ---------- Position et météo (Profil) ---------- */
function agoFr(ts){const m=Math.round((Date.now()-ts)/6e4);if(m<2)return 'à l’instant';if(m<60)return `il y a ${m} min`;const h=Math.round(m/60);if(h<24)return `il y a ${h} h`;const d=Math.round(h/24);return `il y a ${d} jour${d>1?'s':''}`;}
function placePanel(){
  const s=S.set,auto=s.loc!=='fixed',p=place();
  const opt=(v,l,on)=>`<option value="${attr(v)}" ${on?'selected':''}>${esc(l)}</option>`;
  let status;
  if(auto){
    if(LOC.busy)status='Recherche de ta position…';
    else if(s.gps&&s.gps.ts)status=`${s.gps.n||'Position trouvée'}${s.gps.sub?' ('+s.gps.sub+')':''} · mise à jour ${agoFr(s.gps.ts)}`;
    else if(LOC.perm==='denied'||LOC.err==='denied')status='Localisation refusée : autorise-la dans les réglages du navigateur, ou choisis une ville.';
    else if(LOC.perm==='unsupported'||LOC.err==='unsupported')status='Localisation indisponible ici : choisis une ville.';
    else if(LOC.err)status='Position introuvable pour le moment. Nice est affichée en attendant.';
    else status='Pas encore localisé : Nice est affichée en attendant.';
  }else status=p.src==='fixed'?`${p.n}${p.sub?' ('+p.sub+')':''}`:'Choisis une ville ci-dessous.';
  let body='';
  if(auto){
    body=`<div class="set-row"><label class="lbl" for="locFreq">Actualiser la position<small>Moins souvent, c’est moins de batterie.</small></label>
      <select class="sel" id="locFreq">${Object.keys(LOC_FREQ).map(k=>opt(k,LOC_FREQ_FR[k],(s.locFreq||'day')===k)).join('')}</select></div>
      <div class="row-btns"><button class="btn sm" data-act="loc-now" ${LOC.busy?'disabled':''}>${ic('pin')}${LOC.busy?'Localisation…':'Mettre à jour maintenant'}</button></div>`;
  }else{
    const G=TL.GEO||[];
    const reg=G.find(r=>r[0]===V.geoReg)||G.find(r=>r[0]===(s.place&&s.place.reg))||G[0];
    const dep=reg[2].find(d=>d[0]===V.geoDep)||reg[2].find(d=>d[0]===(s.place&&s.place.dep))||reg[2][0];
    const here=s.place&&s.place.dep===dep[0];
    body=`<div class="geo-grid">
      <label class="lbl" for="geoReg">Région</label><select class="sel" id="geoReg">${G.map(r=>opt(r[0],r[1],r===reg)).join('')}</select>
      <label class="lbl" for="geoDep">Département</label><select class="sel" id="geoDep">${reg[2].map(d=>opt(d[0],d[0]==='PH'?d[1]:d[0]+' · '+d[1],d===dep)).join('')}</select>
      <label class="lbl" for="geoCity">Ville</label><select class="sel" id="geoCity">${here?'':opt('','Choisir une ville…',true)}${dep[2].map((c,i)=>opt(i,c[0],here&&s.place.n===c[0])).join('')}</select></div>
      <form class="geo-search" data-act="geo-search"><input class="type-line" id="geoQ" type="search" placeholder="Autre ville (France ou monde)" autocomplete="off" value="${attr(V.geoQ||'')}"><button class="btn sm" type="submit">Chercher</button></form>
      <div id="geoRes">${geoResHTML()}</div>`;
  }
  return `<div class="section-h"><h2>Météo de la mascotte</h2></div>
   <div class="panel set">
    <div class="set-row"><span class="lbl">Ville<small>${esc(status)}</small></span>
      <div class="seg">${[['auto','Automatique'],['fixed','Ville choisie']].map(([v,l])=>`<button type="button" data-act="loc-mode" data-v="${v}" aria-pressed="${(auto?'auto':'fixed')===v}">${l}</button>`).join('')}</div></div>
    ${body}
    <div class="set-row"><label class="lbl" for="wxSel">Météo affichée<small>${WX.src==='live'?`En direct : ${esc(p.n||'ta position')}, ${WX.t} °C`:WX.src==='manual'?'Choisie à la main':'Météo en direct indisponible ici'}</small></label>
      <select class="sel" id="wxSel">${opt('auto','En direct',!s.wx||s.wx==='auto')}${Object.entries(WX_STATES).map(([k,v])=>opt(k,v.fr,s.wx===k)).join('')}</select></div>
    <p class="small muted">${auto?'Position approximative (environ 1 km), gardée sur cet appareil et utilisée seulement pour la météo et le nom de la ville (BigDataCloud). ':''}La météo se met à jour toutes les 15 minutes quand l’appli est ouverte. Données météo : <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a>.</p>
   </div>`;
}
function geoResHTML(){
  if(V.geoBusy)return '<p class="small muted">Recherche…</p>';
  if(V.geoErr)return `<p class="small muted">${esc(V.geoErr)}</p>`;
  if(!V.geoRes)return '';
  if(!V.geoRes.length)return '<p class="small muted">Aucune ville trouvée.</p>';
  return `<div class="geo-res">${V.geoRes.map((r,i)=>`<button type="button" class="geo-hit" data-act="geo-pick" data-i="${i}">${ic('pin')}<span><b>${esc(r.n)}</b>${r.sub?`<span class="small muted">${esc(r.sub)}</span>`:''}</span></button>`).join('')}</div>`;
}
function renderProfile(){
  const lv=levelOf(S.xp),lt=levelTitle(lv.n);
  const nDone=Object.keys(S.done).length;
  const acc=S.stats.ans?Math.round(S.stats.ok/S.stats.ans*100):0;
  const since=new Date(S.started).toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const voices=TTS.candidates();
  return `<div class="view">${topbar('Profil')}
   <div class="hero">${mascot('happy','m')}<div style="display:grid;gap:4px;min-width:0">
     ${V.editName?`<form data-act="name-form" style="display:flex;gap:8px;flex-wrap:wrap"><input class="type-line" id="nameIn" maxlength="30" value="${attr(S.name)}" placeholder="Ton prénom" style="flex:1;min-width:0"><button class="btn primary sm">OK</button></form>`
       :`<h1 style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${esc(S.name||'Apprenant·e')}<button class="btn ghost sm" data-act="name-edit">Modifier</button></h1>`}
     <span class="muted small">Inscrit·e depuis ${esc(since)} · Niveau ${lv.n} — ${lt[0]} (${lt[1]})</span>
     <div class="meter thin"><i style="width:${lv.p*100}%"></i></div><span class="small muted tnum">${fmtNum(S.xp-lv.lo)} / ${fmtNum(lv.hi-lv.lo)} XP jusqu’au niveau ${lv.n+1}</span></div></div>
   ${accountPanel()}
   <div class="section-h"><h2>Statistiques</h2></div>
   <div class="stats-grid">
    <div class="sg" style="color:#E8710A">${ic('flame')}<div><b class="tnum" style="color:var(--ink)">${S.streak}</b><span>série (record ${S.best})</span></div></div>
    <div class="sg" style="color:var(--araw-d)">${ic('bolt')}<div><b class="tnum" style="color:var(--ink)">${fmtNum(S.xp)}</b><span>XP au total</span></div></div>
    <div class="sg" style="color:var(--dagat)">${ic('guide')}<div><b class="tnum" style="color:var(--ink)">${learnedWords()}</b><span>mots appris</span></div></div>
    <div class="sg" style="color:var(--tama)">${ic('star')}<div><b class="tnum" style="color:var(--ink)">${nDone}/${FLOW.length}</b><span>leçons terminées</span></div></div>
    <div class="sg" style="color:var(--pula)">${ic('target')}<div><b class="tnum" style="color:var(--ink)">${acc}%</b><span>bonnes réponses</span></div></div>
    <div class="sg" style="color:#1C8FD0">${ic('gem')}<div><b class="tnum" style="color:var(--ink)">${ultra()?'∞':S.gems}</b><span>perlas</span></div></div>
   </div>
   <div class="panel"><div class="section-h"><h3>Cette semaine</h3><span class="small muted tnum">${Object.values(S.days).reduce((a,b)=>a+b,0)} XP depuis le début</span></div>${weekChart()}</div>
   ${historyPanel()}
   <div class="section-h"><h2>Badges</h2><span class="small muted">${Object.keys(S.badges).length} / ${BADGES.length}</span></div>
   <div class="badges">${BADGES.map(b=>`<div class="bdg${S.badges[b.id]?'':' off'}" title="${attr(b.d)}"><span class="medal">${ic(b.ic)}</span><b>${esc(b.t)}</b><span class="small muted" style="font-size:.7rem;line-height:1.2">${esc(b.d)}</span></div>`).join('')}</div>
   <div class="section-h"><h2>Boutique</h2></div>
   <div class="cards">
    <button class="pcard" data-act="buy-freeze" style="--pc:#1C8FD0" ${!ultra()&&S.gems>=100&&S.freezes<2?'':'disabled'}><span class="pi">${ic('shield')}</span><div><b>Gel de série — 100 perlas</b><span>${ultra()?'Gels illimités : inclus dans le mode ultra':`Protège ta série un jour d’absence (${S.freezes}/2 équipé${S.freezes>1?'s':''})`}</span></div></button>
    <button class="pcard" data-act="buy-hearts" style="--pc:var(--pula)" ${!freeHearts()&&S.gems>=50&&S.hearts<HEART_MAX?'':'disabled'}><span class="pi">${ic('heart')}</span><div><b>Recharger les vies — 50 perlas</b><span>${ultra()?'Vies illimitées : inclus dans le mode ultra':S.set.zen?'Vies illimitées activées':S.hearts+' / '+HEART_MAX+' vies'}</span></div></button>
   </div>
   <div class="section-h"><h2>Réglages</h2></div>
   ${ultraCard()}
   <div class="panel set">
    <div class="set-row"><span class="lbl">Objectif quotidien<small>XP à gagner chaque jour</small></span><div class="seg">${[[10,'Détente'],[20,'Normal'],[30,'Sérieux'],[50,'Intense']].map(([v,l])=>`<button type="button" data-act="goal" data-v="${v}" aria-pressed="${S.goal===v}">${l} · ${v}</button>`).join('')}</div></div>
    ${sw('set-sfx',S.set.sfx,'Effets sonores')}
    ${sw('set-tts',S.set.tts,'Voix tagalog','Lecture des mots et des phrases')}
    ${sw('set-natural',S.set.natural!==false,'Voix naturelle',AUDIO.has()?fmtNum(AUDIO.ids.size)+' extraits audio Gemini installés':'Extraits audio non installés sur ce site : voix du navigateur')}
    ${sw('set-auto',S.set.auto,'Lecture automatique','Prononcer la phrase dès qu’elle s’affiche')}
    ${sw('set-listen',S.set.listen,'Exercices d’écoute')}
    ${sw('set-type',S.set.type,'Exercices au clavier','Désactive-les si tu préfères les tuiles')}
    ${sw('set-anim',S.set.anim!==false,'Animations','Transitions et effets entre les exercices')}
    ${sw('set-zen',freeHearts(),'Vies illimitées',ultra()?'Inclus dans le mode ultra':'Les erreurs ne coûtent plus de vie',ultra())}
    ${sw('set-unlock',S.set.unlock,'Tout débloquer','Accès libre à toutes les leçons et histoires')}
    <div class="set-row"><label class="lbl" for="voiceSel">Voix<small>${TTS.quality==='native'?'Voix tagalog trouvée.':TTS.quality==='approx'?'Pas de voix tagalog : voix proche utilisée.':'Aucune voix détectée.'}</small></label>
      <select class="sel" id="voiceSel" ${voices.length?'':'disabled'}><option value="">Automatique</option>${voices.slice(0,40).map(v=>`<option value="${attr(v.voiceURI)}" ${S.set.voice===v.voiceURI?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></div>
    <div class="set-row"><label class="lbl" for="rateIn">Vitesse de la voix<small class="tnum">${Math.round(S.set.rate*100)} %</small></label><input id="rateIn" type="range" min="0.5" max="1.2" step="0.05" value="${S.set.rate}" style="flex:1;max-width:220px"><button class="btn sm" data-say="Magandang umaga po! Kumusta po kayo?">${ic('speaker')}Tester</button></div>
    <div class="set-row"><span class="lbl">Thème</span><div class="seg">${[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(([v,l])=>`<button type="button" data-act="theme" data-v="${v}" aria-pressed="${S.set.theme===v}">${l}</button>`).join('')}</div></div>
   </div>
   ${placePanel()}
   <div class="section-h"><h2>Mes données</h2></div>
   <div class="panel set">
    <p class="small muted">${Cloud.user?'Ta progression est enregistrée sur ton compte et dans ce navigateur.':'Ta progression est enregistrée dans ce navigateur.'} Copie-la pour la sauvegarder ou la transférer sur un autre appareil.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-act="export">${ic('copy')}Copier ma progression</button><button class="btn sm" data-act="import-open">Importer</button><button class="btn sm bad" data-act="reset-ask">Tout réinitialiser</button></div>
    <div id="dataZone">${V.confirmReset?`<div class="confirm"><b>Effacer toute la progression ?</b><span class="small">XP, série, mots appris et badges seront perdus. Cette action est définitive.</span><div style="display:flex;gap:8px"><button class="btn sm bad" data-act="reset-yes">Oui, tout effacer</button><button class="btn sm" data-act="reset-no">Annuler</button></div></div>`:''}</div>
   </div>
   <p class="small muted" style="text-align:center">Akademya Tagalog · ${UNITS.length} unités · ${ALLW.length} mots · ${ALLS.length} phrases · ${Object.keys(VERBS).length} verbes · ${STORIES.length} histoires</p>
  </div>`;
}

/* ---------- Rendu principal ---------- */
function render(){
  rollDay();
  const m=$('#main');
  const html=V.tab==='learn'?renderLearn():V.tab==='practice'?renderPractice():V.tab==='stories'?renderStories():V.tab==='guide'?renderGuide():renderProfile();
  m.innerHTML=html;
  renderChrome();
  if(V.tab==='learn'&&!V.scrolled&&!V.justDone){V.scrolled=true;const cur=currentLesson();if(cur&&Object.keys(S.done).length){const el=$('#n-'+cur.id);if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30);}}
  afterRender();
}
/* Effets après rendu : leçon validée sur le chemin, leçon suivante qui s'ouvre, jauges qui se remplissent */
function afterRender(){
  if(reduced()){V.justDone=null;V.enter=false;return;}
  if(V.tab==='learn'&&V.justDone){
    const id=V.justDone;V.justDone=null;V.scrolled=true;
    const done=$(`#n-${id} .node`);
    const cur=currentLesson();const nxt=cur&&$(`#n-${cur.id} .node`);
    if(done){done.scrollIntoView({block:'center'});
      animIn(done,[{transform:'scale(.55)',filter:'saturate(0)'},{transform:'scale(1.22)',filter:'none',offset:.55},{transform:'none'}],{duration:700,easing:SPRING,delay:120});
      replayClass(done.parentElement,'burst');}
    if(nxt&&nxt!==done){
      const wrap=nxt.parentElement,tip=$('.start-tip',wrap);
      setTimeout(()=>{nxt.scrollIntoView({behavior:'smooth',block:'center'});},750);
      animIn(nxt,[{transform:'scale(.7)',filter:'grayscale(1) brightness(1.15)'},{transform:'scale(.7)',filter:'grayscale(1) brightness(1.15)',offset:.35},{transform:'scale(1.18)',filter:'none',offset:.75},{transform:'none'}],{duration:1300,easing:EASE_OUT,delay:500});
      if(tip)animIn(tip,[{opacity:0,transform:'translateX(-50%) translateY(10px) scale(.8)'},{opacity:1,transform:'translateX(-50%)'}],{duration:420,easing:SPRING,delay:1500});
    }
    V.enter=false;return;
  }
  if(V.enter){
    V.enter=false;
    $$('#main .meter i, #side .meter i').forEach((el,i)=>animIn(el,[{transform:'scaleX(0)',transformOrigin:'left'},{transform:'none',transformOrigin:'left'}],{duration:700,delay:120+i*40}));
    if(V.tab==='learn'){const cur=currentLesson();if(cur&&cur.u){stagger($$(`#u-${cur.u.id} .node`),[{opacity:0,transform:'scale(.5)'},{opacity:1,transform:'scale(1.1)',offset:.7},{opacity:1,transform:'none'}],{duration:480,delay:80,easing:SPRING},55);}}
    if(V.tab==='practice')stagger($$('#main .pcard'),RISE,{duration:340,delay:60},45);
    if(V.tab==='stories')stagger($$('#main .story-card'),RISE,{duration:340,delay:60},40);
    if(V.tab==='profile')stagger($$('#main .sg, #main .bdg'),[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'none'}],{duration:320,delay:60,easing:SPRING},18);
  }
}
