/* =========================================================
   03 — Exercices : fabriques, rendu, correction
   ========================================================= */
function picHTML(pic,cls){if(!pic)return '';if(pic[0]==='#')return `<div class="${cls} txt">${esc(pic.slice(1))}</div>`;return `<div class="${cls}">${pic}</div>`;}
const listenOK=()=>TTS.can()&&S.set.listen&&!(typeof P!=='undefined'&&P.noListen);
const typeOK=()=>S.set.type;
function autoSay(t){if(S.set.auto)setTimeout(()=>TTS.speak(t),250);}
function sayBtns(t,big){if(!TTS.can())return '';return `<div style="display:grid;gap:8px;justify-items:center;flex:none"><button type="button" class="say${big?' big':''}" data-say="${attr(t)}" aria-label="Écouter">${ic('speaker')}</button>${big?`<button type="button" class="say slow" data-say="${attr(t)}" data-slow="1" aria-label="Écouter lentement">${ic('turtle')}</button>`:''}</div>`;}
function head(title,tag,tagCls){return `<div class="ex-h">${tag?`<span class="tag ${tagCls||''}">${tag}</span>`:''}<h2>${esc(title)}</h2></div>`;}

/* ---------- Tokens et tuiles ---------- */
function tokenize(str){return String(str).split(/\s+/).map(t=>t.replace(/^[«“"(¿¡—–-]+(?=\S)/,'').replace(/[.,!?;:»”")…]+$/,'')).filter(t=>t&&t!=='—'&&t!=='–');}
const PROPER=new Set(['Julien','Maria','Liza','Marco','Ana','Ben','Paolo','Joy','Lola','Lolo','Tatay','Nanay','Kuya','Ate','Tita','Tito','Sir','Ma’am','Maynila','Manille','Cebu','Pilipinas','Philippines','Pransiya','Pransya','France','Lyon','Batangas','Davao','Palawan','Boracay','Baguio','Quiapo','Cubao','Makati','EDSA','Intramuros','Laguna','Canada','Diyos','Dieu','Rizal','José','Jose','Santos','Monsieur','Madame','Mang','Aling','Tonyo','Tagalog','Ingles','Pranses','Pilipino','Pilipina','Filipino','Pasko','Noël','Batman','Apo','Bundok','Lunes','Martes','Miyerkoles','Huwebes','Biyernes','Sabado','Linggo','Enero','Mayo','Hunyo','Julien','CR','G','OA','Dok','Juan','Tamad','Simbang','Gabi','Noche','Buena','Kalayaan','Araw','UST']);
ALLS.forEach(s=>s.tl.concat(s.fr).forEach(v=>tokenize(v).forEach((t,i)=>{if(i>0&&/^[A-ZÀ-Ý]/.test(t))PROPER.add(t);})));
function tileCase(t,i){if(i>0||PROPER.has(t))return t;return t.charAt(0).toLowerCase()+t.slice(1);}

/* ---------- Réservoirs de leurres ---------- */
function tiers(u){const sec=UNITS.filter(x=>x.sec===u.sec&&x!==u);return [shuffle(u.W),shuffle(sec.flatMap(x=>x.W)),shuffle(ALLW)];}
function distract(w,n,by){
  const seen=new Set([norm(w.tl[0]),norm(w.fr)]);const res=[];
  for(const tier of tiers(w.u)){for(const x of tier){
    if(res.length>=n)return res;
    if(x===w||(by==='pic'&&!x.pic))continue;
    const a=norm(x.tl[0]),b=norm(x.fr);if(seen.has(a)||seen.has(b))continue;
    seen.add(a);seen.add(b);res.push(x);
  }}
  return res;
}
function sentTiers(s,lang){const u=s.u;const pool=u.S.concat(UNITS.filter(x=>x.sec===u.sec&&x!==u).flatMap(x=>x.S));return shuffle(pool.filter(x=>x!==s)).map(x=>lang==='tl'?x.tl[0]:x.fr[0]);}
function tilesFor(s,lang){
  const canon=lang==='tl'?s.tl[0]:s.fr[0];
  const toks=tokenize(canon).map(tileCase);
  const have=new Set(toks.map(t=>norm(t)));
  const extra=[];const want=toks.length>9?2:toks.length>5?3:4;
  for(const other of sentTiers(s,lang)){for(const t of tokenize(other)){
    const n=norm(t);if(!n||have.has(n))continue;have.add(n);extra.push(tileCase(t,0));
    if(extra.length>=want)break;}
    if(extra.length>=want)break;}
  return shuffle(toks.concat(extra));
}

/* ---------- Exercice : carte de nouveau mot ---------- */
function exIntro(w){
  return {type:'intro',graded:false,
    render(r){
      r.innerHTML=`${head('Nouveau mot',ic('sparkle')+'Nouveau','new')}
      <div class="intro">${picHTML(w.pic,'em')}
        <div class="word">${esc(w.tl[0])}</div>
        ${w.tl.length>1?`<div class="note">aussi : ${w.tl.slice(1).map(esc).join(', ')}</div>`:''}
        ${sayBtns(w.tl[0])}
        <div class="fr">${esc(w.fr)}</div>${w.note?`<div class="note">${esc(w.note)}</div>`:''}
      </div>`;
      autoSay(w.tl[0]);
    },
    ready:()=>true,check:()=>({ok:true}),reveal(){}};
}

/* ---------- Exercice générique à choix ---------- */
function exPick(o){
  let sel=null,root=null,api=null;
  const opts=o.options;
  function paint(){
    $$('[data-opt]',root).forEach(b=>b.classList.toggle('sel',b.dataset.opt===String(sel)));
    if(o.layout==='gap'){const slot=$('.gap-slot',root);const op=opts.find(x=>String(x.v)===String(sel));slot.textContent=op?op.txt:' ';slot.classList.toggle('filled',!!op);}
  }
  return {type:'pick',_ans:o.answer,graded:true,k:o.k,ref:o.ref,listen:o.listen,conj:o.conj,num:o.num,regen:o.regen,
    render(r,a){root=r;api=a;
      let body='';
      if(o.layout==='pics')body=`<div class="pics">${opts.map((x,i)=>`<button type="button" class="pic" data-opt="${attr(x.v)}">${x.h}<span class="kbd">${i+1}</span></button>`).join('')}</div>`;
      else body=`<div class="opts">${opts.map((x,i)=>`<button type="button" class="opt${x.tl?' tlo':''}" data-opt="${attr(x.v)}"><span class="kbd">${i+1}</span><span>${x.h}</span></button>`).join('')}</div>`;
      let prompt=o.prompt||'';
      if(o.layout==='gap'){const parts=o.gapQ.split('___');prompt=`<div class="bubble"><div class="gap-line">${tlTokens(parts[0])}<span class="gap-slot"> </span>${tlTokens(parts.slice(1).join('___'))}</div></div>`;}
      r.innerHTML=head(o.title,o.tag,o.tagCls)+prompt+body;
      $$('[data-opt]',r).forEach(b=>b.addEventListener('click',()=>{if(api.locked())return;sel=b.dataset.opt;const op=opts.find(x=>String(x.v)===sel);if(op&&op.say)TTS.speak(op.say);else SFX.tap();paint();api.update();}));
      if(o.auto)autoSay(o.auto);
    },
    key(n){const b=$$('[data-opt]',root)[n-1];if(b)b.click();},
    ready:()=>sel!==null,
    check(){return {ok:String(sel)===String(o.answer),ans:o.ansText,expl:o.expl};},
    reveal(res){$$('[data-opt]',root).forEach(b=>{b.disabled=true;if(b.dataset.opt===String(o.answer))b.classList.add('right');else if(b.dataset.opt===String(sel))b.classList.add('wrong');});}
  };
}

/* Tolère le déplacement d'un adverbe de temps en début ou en fin de phrase */
const TIMEW=new Set(['bukas','kahapon','ngayon','mamaya','kanina']);
function timeShiftOK(txt,ans){
  const a=norm(ans).split(' '),t=norm(txt).split(' ');
  if(a.length!==t.length)return false;
  const strip=x=>x.filter(w=>!TIMEW.has(w)).join(' ');
  if(strip(a)!==strip(t))return false;
  const ta=a.filter(w=>TIMEW.has(w)).sort().join(),tt=t.filter(w=>TIMEW.has(w)).sort().join();
  if(!ta||ta!==tt)return false;
  return t.every((w,i)=>!TIMEW.has(w)||i===a.indexOf(w)||i===0||i===t.length-1);
}
/* ---------- Exercice : construire une phrase avec des tuiles ---------- */
function exBuild(o){
  const tiles=o.tiles;let placed=[],root,api;
  /* Position à l'écran de chaque tuile visible (pour l'animation FLIP) */
  function rects(){const m={};$$('.answer-zone .tile',root).forEach(b=>m[b.dataset.pti]=b.getBoundingClientRect());$$('.bank .tile:not(.ghost)',root).forEach(b=>{if(!(b.dataset.ti in m))m[b.dataset.ti]=b.getBoundingClientRect();});return m;}
  function paint(){
    const before=rects();
    $('.answer-zone',root).innerHTML=placed.map((ti,j)=>`<button type="button" class="tile${o.lang==='tl'?' tlo':''}" data-pl="${j}" data-pti="${ti}">${esc(tiles[ti])}</button>`).join('');
    $$('.bank .tile',root).forEach(b=>b.classList.toggle('ghost',placed.includes(+b.dataset.ti)));
    $$('.answer-zone .tile',root).forEach(b=>flipFrom(b,before[b.dataset.pti],340));
    $$('.bank .tile:not(.ghost)',root).forEach(b=>flipFrom(b,before[b.dataset.ti],340));
  }
  return {type:'build',_ans:o.answers[0],_tiles:tiles,graded:true,k:o.k,ref:o.ref,listen:o.listen,regen:o.regen,
    render(r,a){root=r;api=a;
      r.innerHTML=head(o.title,o.tag,o.tagCls)+(o.prompt||'')+`<div class="answer-zone" aria-label="Ta réponse"></div><div class="bank">${tiles.map((t,i)=>`<button type="button" class="tile${o.lang==='tl'?' tlo':''}" data-ti="${i}">${esc(t)}</button>`).join('')}</div>`;
      r.addEventListener('click',e=>{
        if(api.locked())return;
        const b=e.target.closest('.tile');if(!b)return;
        if(b.dataset.ti!=null){const i=+b.dataset.ti;if(placed.includes(i))return;placed.push(i);if(o.lang==='tl'&&S.set.auto)TTS.speak(tiles[i]);else SFX.tap();}
        else if(b.dataset.pl!=null){placed.splice(+b.dataset.pl,1);SFX.tap();}
        paint();api.update();
      });
      if(o.auto)autoSay(o.auto);
    },
    ready:()=>placed.length>0,
    check(){const txt=placed.map(i=>tiles[i]).join(' ');const exact=o.answers.some(a=>norm(a)===norm(txt)||loose(a)===loose(txt));const ok=exact||(o.lang==='tl'&&o.answers.some(a=>timeShiftOK(txt,a)));return {ok,ans:o.ansText,expl:o.expl,showAns:ok&&!exact};},
    reveal(){$$('.tile',root).forEach(b=>b.disabled=true);}
  };
}

/* ---------- Exercice : saisie au clavier ---------- */
function exType(o){
  let root,api;
  return {type:'type',_ans:o.answers[0],graded:true,typed:true,k:o.k,ref:o.ref,listen:o.listen,conj:o.conj,num:o.num,regen:o.regen,
    render(r,a){root=r;api=a;
      const input=o.single?`<input class="type-line" id="tIn" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${attr(o.ph||'Écris en tagalog')}" aria-label="Ta réponse">`
        :`<textarea class="type-box" id="tIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${attr(o.ph||'Écris en tagalog')}" aria-label="Ta réponse"></textarea>`;
      r.innerHTML=head(o.title,o.tag||(ic('keyboard')+'Au clavier'),o.tagCls)+(o.prompt||'')+input;
      const el=$('#tIn',r);
      el.addEventListener('input',()=>api.update());
      el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();api.submit();}});
      setTimeout(()=>{try{el.focus({preventScroll:true});}catch(e){}},60);
      if(o.auto)autoSay(o.auto);
    },
    ready(){const v=$('#tIn',root);return !!(v&&v.value.trim());},
    check(){
      const v=$('#tIn',root).value;
      if(o.numMode){const ok=o.answers.some(a=>numKey(a)===numKey(v));return {ok,ans:o.ansText,expl:o.expl};}
      const c=compareAnswer(v,o.answers);
      let expl=o.expl||'';
      if(c.ok&&c.typo==='letter')expl=`Attention à l’orthographe : ${c.word}.`+(expl?' '+expl:'');
      return {ok:c.ok,typo:c.typo,ans:o.ansText,expl,showAns:c.ok&&!c.exact};
    },
    reveal(){const v=$('#tIn',root);if(v)v.readOnly=true;}
  };
}

/* ---------- Exercice : compléter un mot dans la phrase ---------- */
function exFill(s){
  const canon=s.tl[0];const toks=tokenize(canon);
  const cand=toks.map((t,i)=>({t,i})).filter(x=>x.t.length>=3&&!PROPER.has(x.t)&&!PARTICLES[norm(x.t)]);
  if(!cand.length)return exSent(s,'b_fr2tl');
  const target=cand.sort((a,b)=>b.t.length-a.t.length)[rnd(Math.min(2,cand.length))];
  const raw=canon.split(/(\s+)/);let wi=-1,html='';
  raw.forEach(p=>{if(/^\s+$/.test(p)||!p){html+=esc(p);return;}wi++;
    if(wi===target.i){const m=p.match(/^([«“"(¿¡]*)(.*?)([.,!?;:»”")…]*)$/);html+=`${esc(m[1])}<input class="gap-in" id="tIn" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Mot manquant" style="width:${Math.max(5,target.t.length+1)}ch">${esc(m[3])}`;}
    else html+=tlTokens(p);});
  let root,api;
  return {type:'fill',_ans:target.t,graded:true,typed:true,k:s.k,ref:s.k,regen:()=>exFill(s),
    render(r,a){root=r;api=a;
      r.innerHTML=head('Complète la phrase',ic('keyboard')+'Au clavier')+`<div class="bubble">${esc(s.fr[0])}</div><div class="bubble"><div class="gap-line">${html}</div></div>`;
      const el=$('#tIn',r);el.addEventListener('input',()=>api.update());
      el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();api.submit();}});
      setTimeout(()=>{try{el.focus({preventScroll:true});}catch(e){}},60);
    },
    ready(){const v=$('#tIn',root);return !!(v&&v.value.trim());},
    check(){const v=$('#tIn',root).value;const c=compareAnswer(v,[target.t]);return {ok:c.ok,ans:canon,expl:c.typo==='letter'?`Attention à l’orthographe : ${target.t}.`:'',showAns:true};},
    reveal(){const v=$('#tIn',root);if(v)v.readOnly=true;}
  };
}

/* ---------- Exercice : paires ---------- */
function exPairs(words){
  let root,api,selL=null,selR=null,matched=0;
  const L=shuffle(words),R=shuffle(words);
  return {type:'pairs',_pairs:words.map(w=>w.k),graded:true,auto:true,
    render(r,a){root=r;api=a;
      r.innerHTML=head('Associe les paires')+`<div class="pairs"><div class="col">${L.map(w=>`<button type="button" class="pb tlo" data-l="${attr(w.k)}">${esc(w.tl[0])}</button>`).join('')}</div><div class="col">${R.map(w=>`<button type="button" class="pb" data-r="${attr(w.k)}">${esc(w.fr)}</button>`).join('')}</div></div>`;
      r.addEventListener('click',e=>{
        const b=e.target.closest('.pb');if(!b||api.locked())return;
        if(b.dataset.l){selL=b.dataset.l;const w=words.find(x=>x.k===selL);TTS.speak(w.tl[0]);}else selR=b.dataset.r;
        $$('.pb',r).forEach(x=>x.classList.toggle('sel',x.dataset.l===selL&&!!selL||x.dataset.r===selR&&!!selR));
        if(selL&&selR){
          const bl=$(`[data-l="${CSS.escape(selL)}"]`,r),br=$(`[data-r="${CSS.escape(selR)}"]`,r);
          if(selL===selR){[bl,br].forEach(x=>{x.classList.remove('sel');x.classList.add('good');animIn(x,[{transform:'scale(1)'},{transform:'scale(1.07)',offset:.45},{transform:'none'}],{duration:300,easing:SPRING});setTimeout(()=>{x.classList.remove('good');x.classList.add('gone');},300);});matched++;SFX.tap();srs(selL,true);
            if(matched===words.length)setTimeout(()=>api.submit(),380);}
          else{[bl,br].forEach(x=>{x.classList.remove('sel');x.classList.add('flash');setTimeout(()=>x.classList.remove('flash'),400);});SFX.bad();}
          selL=selR=null;
        }
      });
    },
    ready:()=>matched===words.length,
    check:()=>({ok:true}),reveal(){}
  };
}

/* ---------- Fabriques : mots ---------- */
function exWord(w,kind){
  const regen=()=>exWord(w,kind);
  if(kind==='pic'){
    const ds=distract(w,3,'pic');if(ds.length<2)return exWord(w,'fr2tl');
    const options=shuffle([w,...ds]).map(x=>({v:x.k,h:picHTML(x.pic,'em')+`<span>${esc(x.tl[0])}</span>`,say:x.tl[0]}));
    return exPick({title:`Lequel signifie « ${w.fr} » ?`,layout:'pics',options,answer:w.k,ansText:w.tl[0],k:w.k,ref:w.k,regen});
  }
  if(kind==='tl2fr'){
    const ds=distract(w,3,'fr');
    const options=shuffle([w,...ds]).map(x=>({v:x.k,h:esc(x.fr)}));
    return exPick({title:'Que signifie ce mot ?',prompt:`<div class="prompt-row">${sayBtns(w.tl[0])}<div class="bubble"><span class="tl-line">${esc(w.tl[0])}</span></div></div>`,options,answer:w.k,ansText:w.fr,k:w.k,ref:w.k,regen,auto:w.tl[0]});
  }
  if(kind==='fr2tl'){
    const ds=distract(w,3,'tl');
    const options=shuffle([w,...ds]).map(x=>({v:x.k,h:esc(x.tl[0]),tl:true,say:x.tl[0]}));
    return exPick({title:`Comment dit-on « ${w.fr} » ?`,prompt:w.note?`<p class="note">${esc(w.note)}</p>`:'',options,answer:w.k,ansText:w.tl[0],k:w.k,ref:w.k,regen});
  }
  if(kind==='listen'){
    if(!listenOK())return exWord(w,'fr2tl');
    const ds=distract(w,2,'tl');
    const options=shuffle([w,...ds]).map(x=>({v:x.k,h:esc(x.tl[0]),tl:true}));
    return exPick({title:'Qu’entends-tu ?',tag:ic('ear')+'Écoute',prompt:`<div style="display:flex;justify-content:center;gap:14px;align-items:center">${sayBtns(w.tl[0],true)}</div>`,options,answer:w.k,ansText:`${w.tl[0]} — ${w.fr}`,k:w.k,ref:w.k,regen,auto:w.tl[0],listen:true});
  }
  if(kind==='type'){
    if(!typeOK())return exWord(w,'fr2tl');
    return exType({title:'Écris en tagalog',prompt:`<div class="bubble">${esc(w.fr)}${w.note?`<div class="note">${esc(w.note)}</div>`:''}</div>`,answers:w.tl,ansText:w.tl.join(' / '),single:true,k:w.k,ref:w.k,regen});
  }
  return exWord(w,'tl2fr');
}

/* ---------- Fabriques : phrases ---------- */
function exSent(s,kind){
  const regen=()=>exSent(s,kind);
  const noteHTML=s.note?`<p class="note">${esc(s.note)}</p>`:'';
  if(kind==='b_fr2tl'){
    return exBuild({title:'Traduis en tagalog',prompt:`<div class="bubble">${esc(s.fr[0])}</div>${noteHTML}`,tiles:tilesFor(s,'tl'),answers:s.tl,lang:'tl',ansText:s.tl[0],k:s.k,ref:s.k,regen});
  }
  if(kind==='b_tl2fr'){
    return exBuild({title:'Traduis en français',prompt:`<div class="prompt-row">${sayBtns(s.tl[0])}<div class="bubble"><span class="tl-line">${tlTokens(s.tl[0])}</span></div></div>`,tiles:tilesFor(s,'fr'),answers:s.fr,lang:'fr',ansText:s.fr[0],k:s.k,ref:s.k,regen,auto:s.tl[0]});
  }
  if(kind==='listen'){
    if(!listenOK())return exSent(s,'b_fr2tl');
    return exBuild({title:'Écris ce que tu entends',tag:ic('ear')+'Écoute',prompt:`<div style="display:flex;justify-content:center">${sayBtns(s.tl[0],true)}</div>`,tiles:tilesFor(s,'tl'),answers:s.tl,lang:'tl',ansText:`${s.tl[0]} — ${s.fr[0]}`,k:s.k,ref:s.k,regen,auto:s.tl[0],listen:true});
  }
  if(kind==='type'){
    if(!typeOK())return exSent(s,'b_fr2tl');
    return exType({title:'Écris en tagalog',prompt:`<div class="bubble">${esc(s.fr[0])}</div>${noteHTML}`,answers:s.tl,ansText:s.tl[0],k:s.k,ref:s.k,regen});
  }
  if(kind==='fill'){if(!typeOK())return exSent(s,'b_tl2fr');return exFill(s);}
  if(kind==='mc'){
    const others=sample(s.u.S.filter(x=>x!==s&&norm(x.fr[0])!==norm(s.fr[0])),2);
    const options=shuffle([s,...others]).map(x=>({v:x.k,h:esc(x.fr[0])}));
    return exPick({title:'Choisis la bonne traduction',prompt:`<div class="prompt-row">${sayBtns(s.tl[0])}<div class="bubble"><span class="tl-line">${tlTokens(s.tl[0])}</span></div></div>`,options,answer:s.k,ansText:s.fr[0],k:s.k,ref:s.k,regen,auto:s.tl[0]});
  }
  return exSent(s,'b_fr2tl');
}

/* ---------- Fabrique : exercice à trous ---------- */
function exGap(g){
  const options=shuffle([g.a,...g.d]).map((t,i)=>({v:'o'+i+':'+t,txt:t,h:esc(t),tl:true}));
  const ans=options.find(x=>x.txt===g.a).v;
  const full=g.q.replace('___',g.a);
  return exPick({title:'Complète la phrase',tag:ic('bulb')+'Grammaire',layout:'gap',gapQ:g.q,options,answer:ans,ansText:full,expl:`${g.ex} — ${g.fr}`,k:g.k,ref:g.k,regen:()=>exGap(g)});
}

/* ---------- Fabrique : conjugaison ---------- */
function aspectsFor(v){const f=v.f.map(x=>x.split('|')[0]);return [0,1,2,3].filter(i=>!(i===0&&f[0]===f[1]));}
function verbCard(v,asp){
  const A=TL.AFFIX[v.a];
  return `<div class="vcard"><span class="eyebrow">racine</span><div class="root">${esc(v.r)}</div><div class="muted">${esc(v.fr)}</div>
    <div class="chips"><span class="chip aff">${esc(A.n)} · focus ${esc(A.f)}</span><span class="chip asp">${esc(TL.ASPECTS[asp])}</span></div>
    <div class="small muted">${esc(TL.ASPECT_HINT[asp])}</div></div>`;
}
function exConj(key,asp,mode){
  const v=VERBS[key];if(asp==null)asp=pick(aspectsFor(v));
  const regen=()=>exConj(key,asp,mode);
  const correct=v.f[asp].split('|');
  const ref=`c:${key}:${asp}`;
  if(mode==='type'&&typeOK()){
    return exType({title:'Conjugue le verbe',tag:ic('pen')+'Conjugaison',prompt:verbCard(v,asp),answers:correct,ansText:correct.join(' / '),single:true,ph:'forme conjuguée',ref,regen,conj:true,expl:`${TL.ASPECTS[asp]} de ${v.f[0].split('|')[0]}.`});
  }
  const pool=new Set();
  v.f.forEach((f,i)=>{const x=f.split('|')[0];if(i!==asp&&!correct.includes(x))pool.add(x);});
  const sib=shuffle(Object.values(VERBS).filter(x=>x.a===v.a&&x!==v));
  for(const x of sib){if(pool.size>=5)break;const f=x.f[asp].split('|')[0];if(!correct.includes(f))pool.add(f);}
  const ds=sample(Array.from(pool),3);
  const options=shuffle([correct[0],...ds]).map((t,i)=>({v:'c'+i+':'+t,txt:t,h:esc(t),tl:true,say:t}));
  const ans=options.find(x=>x.txt===correct[0]).v;
  return exPick({title:'Choisis la bonne forme',tag:ic('pen')+'Conjugaison',prompt:verbCard(v,asp),options,answer:ans,ansText:correct.join(' / '),expl:`${TL.ASPECTS[asp]} (${TL.ASPECT_HINT[asp]}) de ${v.r} avec ${TL.AFFIX[v.a].n}.`,ref,regen,conj:true});
}

/* ---------- Fabrique : nombres ---------- */
/* Avec les voix Gemini installées, on privilégie les nombres qui ont leur fichier audio */
function randNum(min,max){
  let n=rawNum(min,max);
  if(S.set.natural!==false&&AUDIO.has())for(let i=0;i<25&&!AUDIO.find(tlNum(n));i++)n=rawNum(min,max);
  return n;
}
function rawNum(min,max){
  if(max<=20)return min+rnd(max-min+1);
  const r=Math.random();
  const ranges=[[11,19],[20,99],[100,999],[1000,max]].map(([a,b])=>[Math.max(a,min),Math.min(b,max)]).filter(([a,b])=>a<=b);
  const [a,b]=ranges[Math.floor(r*ranges.length)];
  let n=a+rnd(b-a+1);
  if(n>=1000&&Math.random()<.5)n=Math.round(n/50)*50||n;
  return clamp(n,min,max);
}
function nearNums(n,min,max){
  const out=new Set();let guard=0;
  const steps=[1,-1,10,-10,100,-100,2,-2,20,-20,1000,-1000,11,-9];
  while(out.size<3&&guard++<60){const d=pick(steps);const m=n+d;if(m>=Math.max(1,min)&&m<=Math.max(max,n+20)&&m!==n)out.add(m);}
  while(out.size<3)out.add(n+out.size+3);
  return Array.from(out);
}
function exNum(n,mode,min,max){
  min=min||1;max=max||Math.max(10,n);
  const regen=()=>exNum(n,mode,min,max);const ref=`n:${n}:${min}:${max}`;
  const txt=tlNum(n);
  if(mode==='type'&&typeOK()){
    return exType({title:'Écris ce nombre en tagalog',tag:ic('hash')+'Nombres',prompt:`<div class="bignum tnum">${fmtNum(n)}</div>`,answers:[txt],numMode:true,ansText:txt,single:true,ph:'en toutes lettres',ref,regen,num:true});
  }
  if(mode==='dig'){
    const options=shuffle([n,...nearNums(n,min,max)]).map(x=>({v:String(x),h:`<span class="tnum" style="font-size:1.2rem">${fmtNum(x)}</span>`}));
    return exPick({title:'Quel est ce nombre ?',tag:ic('hash')+'Nombres',prompt:`<div class="prompt-row">${sayBtns(txt)}<div class="bubble"><span class="tl-line">${esc(txt)}</span></div></div>`,options,answer:String(n),ansText:`${fmtNum(n)} — ${txt}`,ref,regen,num:true,auto:txt});
  }
  const options=shuffle([n,...nearNums(n,min,max)]).map(x=>({v:String(x),h:esc(tlNum(x)),tl:true,say:tlNum(x)}));
  return exPick({title:'Comment dit-on ce nombre ?',tag:ic('hash')+'Nombres',prompt:`<div class="bignum tnum">${fmtNum(n)}</div>`,options,answer:String(n),ansText:txt,ref,regen,num:true});
}

/* ---------- Fabriques : baybayin ---------- */
const BAY_ITEMS=BAY_SETS.slice(0,5).flatMap(b=>b.items);
function exBayIntro(it){
  return {type:'intro',graded:false,render(r){r.innerHTML=`${head('Nouveau signe',ic('feather')+'Baybayin','new')}<div class="intro"><div class="bay">${it[0]}</div><div class="word">${esc(it[1])}</div>${sayBtns(it[1].split(' / ')[0])}</div>`;autoSay(it[1].split(' / ')[0]);},ready:()=>true,check:()=>({ok:true}),reveal(){}};
}
function exBayGlyph(it,pool,dir){
  pool=pool||BAY_ITEMS;const regen=()=>exBayGlyph(it,pool,dir);
  const ds=sample(pool.filter(x=>x[0]!==it[0]&&x[1]!==it[1]),3);
  if(dir==='rom'){
    const options=shuffle([it,...ds]).map(x=>({v:x[0],h:`<span class="bay-opt">${x[0]}</span>`}));
    return exPick({title:`Quel signe se lit « ${it[1]} » ?`,tag:ic('feather')+'Baybayin',layout:'pics',options,answer:it[0],ansText:it[0]+' = '+it[1],ref:'b:'+it[0],regen});
  }
  const options=shuffle([it,...ds]).map(x=>({v:x[1],h:esc(x[1])}));
  return exPick({title:'Comment se lit ce signe ?',tag:ic('feather')+'Baybayin',prompt:`<div class="bay">${it[0]}</div>`,options,answer:it[1],ansText:it[1],ref:'b:'+it[0],regen});
}
function exBayWord(word,mode){
  const regen=()=>exBayWord(word,mode);const g=toBaybayin(word);
  const fr=BAY_WORD_FR[word]||'';
  if(mode==='type'&&typeOK())return exType({title:'Lis ce mot et écris-le',tag:ic('feather')+'Baybayin',prompt:`<div class="bay">${g}</div>`,answers:[word],ansText:`${word} — ${fr}`,single:true,ph:'en lettres latines',ref:'bw:'+word,regen});
  const others=sample(BAY_SETS[5].words.filter(x=>x!==word),3);
  const options=shuffle([word,...others]).map(x=>({v:x,h:esc(x),tl:true}));
  return exPick({title:'Que dit ce mot ?',tag:ic('feather')+'Baybayin',prompt:`<div class="bay">${g}</div>`,options,answer:word,ansText:`${word} — ${fr}`,ref:'bw:'+word,regen});
}

/* ---------- Composition des leçons ---------- */
function lessonItems(L){
  const out=[];
  if(L.kind==='words'){
    L.W.forEach(w=>{if(!S.words[w.k])out.push(exIntro(w));out.push(exWord(w,w.pic&&Math.random()<.75?'pic':'tl2fr'));});
    if(L.W.length>=4)out.push(exPairs(sample(L.W,Math.min(5,L.W.length))));
    shuffle(L.W).forEach(w=>{const k=['fr2tl','fr2tl','tl2fr'];if(listenOK())k.push('listen','listen');if(typeOK()&&w.tl[0].length<=22)k.push('type','type');out.push(exWord(w,pick(k)));});
    return out;
  }
  if(L.kind==='phrases'){
    L.S.forEach((s,i)=>out.push(exSent(s,i%2?'b_tl2fr':'b_fr2tl')));
    const second=L.S.map(s=>{const k=['b_fr2tl','b_tl2fr','fill'];if(listenOK())k.push('listen','listen');if(typeOK()&&tokenize(s.tl[0]).length<=5)k.push('type');return exSent(s,pick(k));});
    out.push(...shuffle(second.concat(L.G.map(exGap))));
    return out;
  }
  if(L.kind==='conj'){
    const keys=L.u.vb;
    for(let i=0;i<12;i++)out.push(exConj(pick(keys),null,i>=8?'type':'mc'));
    return out;
  }
  if(L.kind==='num'){
    const [a,b]=L.u.num;const modes=['tl','dig','tl','dig','tl','type'];
    const used=new Set();
    for(let i=0;i<10;i++){let n,g=0;do{n=randNum(a,b);}while(used.has(n)&&g++<20);used.add(n);out.push(exNum(n,modes[i%modes.length],a,b));}
    return out;
  }
  if(L.kind==='bay'){
    const b=L.bay;
    if(b.items){
      b.items.forEach(it=>{if(!S.words['b:'+it[0]])out.push(exBayIntro(it));out.push(exBayGlyph(it,b.items.length>=4?b.items:BAY_ITEMS));});
      shuffle(b.items).forEach(it=>out.push(exBayGlyph(it,b.items.length>=4?b.items:BAY_ITEMS,'rom')));
    }else{
      sample(b.words,10).forEach((w,i)=>out.push(exBayWord(w,i>=7?'type':'mc')));
    }
    return out;
  }
  if(L.kind==='review'){
    if(L.bayAll){sample(BAY_ITEMS,8).forEach((it,i)=>out.push(exBayGlyph(it,BAY_ITEMS,i%2?'rom':'')));sample(BAY_SETS[5].words,6).forEach((w,i)=>out.push(exBayWord(w,i%3===2?'type':'mc')));return shuffle(out);}
    return shuffle(unitMix(L.u,{w:5,s:6,g:2,c:2,n:2}));
  }
  return out;
}
function unitMix(u,q){
  const out=[];
  sample(u.W,q.w).forEach(w=>{const k=['fr2tl','tl2fr','pic'];if(listenOK())k.push('listen');if(typeOK())k.push('type','type');out.push(exWord(w,pick(k)));});
  sample(u.S,q.s).forEach(s=>{const k=['b_fr2tl','b_tl2fr','fill','mc'];if(listenOK())k.push('listen');if(typeOK()&&tokenize(s.tl[0]).length<=6)k.push('type');out.push(exSent(s,pick(k)));});
  sample(u.G,q.g).forEach(g=>out.push(exGap(g)));
  if(u.vb&&q.c)for(let i=0;i<q.c;i++)out.push(exConj(pick(u.vb),null,Math.random()<.4?'type':'mc'));
  if(u.num&&q.n)for(let i=0;i<q.n;i++)out.push(exNum(randNum(u.num[0],u.num[1]),pick(['tl','dig','type']),u.num[0],u.num[1]));
  return out;
}
function examItems(secN,size){
  const us=UNITS.filter(u=>u.sec===secN&&!u.bay);const out=[];
  for(let i=0;i<size;i++){
    const u=pick(us);const r=Math.random();
    if(r<.3&&u.W.length){const k=['fr2tl','tl2fr'];if(typeOK())k.push('type');if(listenOK())k.push('listen');out.push(exWord(pick(u.W),pick(k)));}
    else if(r<.75&&u.S.length){const k=['b_fr2tl','b_tl2fr','mc'];if(typeOK())k.push('fill');if(listenOK())k.push('listen');out.push(exSent(pick(u.S),pick(k)));}
    else if(u.G.length)out.push(exGap(pick(u.G)));
    else out.push(exWord(pick(u.W),'fr2tl'));
  }
  return out;
}
/* Retrouve un exercice à partir d'une référence enregistrée (erreurs, révision) */
function exFromRef(ref,mode){
  if(!ref)return null;
  const x=BYKEY[ref];
  if(x){
    if(ref[0]==='w'){const k=['fr2tl','tl2fr'];if(typeOK())k.push('type');if(listenOK()&&mode!=='nolisten')k.push('listen');return exWord(x,pick(k));}
    if(ref[0]==='s'){const k=['b_fr2tl','b_tl2fr'];if(typeOK())k.push('fill');if(listenOK()&&mode!=='nolisten')k.push('listen');return exSent(x,pick(k));}
    if(ref[0]==='g')return exGap(x);
  }
  if(ref.startsWith('c:')){const [,key,asp]=ref.split(':');if(VERBS[key])return exConj(key,+asp,'mc');}
  if(ref.startsWith('n:')){const [,n,a,b]=ref.split(':');return exNum(+n,'tl',+a,+b);}
  if(ref.startsWith('b:')){const it=BAY_ITEMS.find(i=>i[0]===ref.slice(2));if(it)return exBayGlyph(it);}
  if(ref.startsWith('bw:'))return exBayWord(ref.slice(3),'mc');
  return null;
}
