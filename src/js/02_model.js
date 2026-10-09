/* =========================================================
   02 — Modèle : cours, leçons, lexique, état, progression
   ========================================================= */
const SECS=TL.SECTIONS, UNITS=TL.UNITS, VERBS=TL.VERBS, STORIES=TL.STORIES;
const SEC_COL=['','var(--s1)','var(--s2)','var(--s3)','var(--s4)','var(--s5)'];
const SEC_COLD=['','var(--s1-d)','var(--s2-d)','var(--s3-d)','var(--s4-d)','var(--s5-d)'];
const KIND={
  words:{ic:'star',lbl:'Vocabulaire'}, phrases:{ic:'chat',lbl:'Phrases'}, conj:{ic:'pen',lbl:'Conjugaison'},
  num:{ic:'hash',lbl:'Nombres'}, review:{ic:'target',lbl:'Bilan'}, bay:{ic:'feather',lbl:'Baybayin'}, exam:{ic:'trophy',lbl:'Épreuve'}
};
const ALLW=[], ALLS=[], ALLG=[];
const BYKEY={};
UNITS.forEach((u,i)=>{
  u.i=i; u.n=i+1; u.sx=SECS.find(s=>s.id===u.sec);
  u.W=u.w.map((w,j)=>({k:`w:${u.id}:${j}`,u,tl:w[0].split('|'),fr:w[1],pic:w[2]||'',note:w[3]||''}));
  u.S=u.s.map((s,j)=>({k:`s:${u.id}:${j}`,u,tl:s[0].split('|'),fr:s[1].split('|'),note:s[2]||''}));
  u.G=u.g.map((g,j)=>({k:`g:${u.id}:${j}`,u,q:g[0],a:g[1],d:g[2],fr:g[3],ex:g[4]}));
  u.W.forEach(x=>{ALLW.push(x);BYKEY[x.k]=x;}); u.S.forEach(x=>{ALLS.push(x);BYKEY[x.k]=x;}); u.G.forEach(x=>{ALLG.push(x);BYKEY[x.k]=x;});
});
function chunk(arr,n){const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));if(out.length>1&&out[out.length-1].length<3){const l=out.pop();out[out.length-1]=out[out.length-1].concat(l);}return out;}

/* ---------- Baybayin : données de l'unité ---------- */
const BAY_SETS=[
  {t:'Les voyelles',items:[['ᜀ','a'],['ᜁ','e / i'],['ᜂ','o / u']]},
  {t:'Consonnes (1)',items:[['ᜊ','ba'],['ᜃ','ka'],['ᜇ','da / ra'],['ᜄ','ga'],['ᜑ','ha'],['ᜎ','la'],['ᜋ','ma']]},
  {t:'Consonnes (2)',items:[['ᜈ','na'],['ᜅ','nga'],['ᜉ','pa'],['ᜐ','sa'],['ᜆ','ta'],['ᜏ','wa'],['ᜌ','ya']]},
  {t:'Le kudlit',items:[['ᜊᜒ','bi'],['ᜊᜓ','bu'],['ᜃᜒ','ki'],['ᜃᜓ','ku'],['ᜋᜒ','mi'],['ᜋᜓ','mu'],['ᜐᜒ','si'],['ᜐᜓ','su'],['ᜆᜒ','ti'],['ᜆᜓ','tu'],['ᜎᜒ','li'],['ᜈᜓ','nu']]},
  {t:'Le virama',items:[['ᜃ᜔','k'],['ᜈ᜔','n'],['ᜋ᜔','m'],['ᜆ᜔','t'],['ᜎ᜔','l'],['ᜌ᜔','y'],['ᜅ᜔','ng'],['ᜐ᜔','s']]},
  {t:'Lire des mots',words:['tao','bata','mata','ina','ama','isa','gabi','lupa','puso','kita','bahay','anak','araw','buhay','mahal','salamat','ilaw','ngiti','bundok','Pilipinas']}
];
const BAY_WORD_FR={tao:'personne',bata:'enfant',mata:'œil',ina:'mère',ama:'père',isa:'un',gabi:'soir',lupa:'terre',puso:'cœur',kita:'te (moi → toi)',bahay:'maison',anak:'enfant',araw:'soleil ; jour',buhay:'vie',mahal:'cher ; aimé',salamat:'merci',ilaw:'lumière',ngiti:'sourire',bundok:'montagne',Pilipinas:'Philippines'};

/* ---------- Leçons ---------- */
const LESSONS={}; const FLOW=[];
UNITS.forEach(u=>{
  u.L=[];
  if(u.bay){
    BAY_SETS.forEach((b,i)=>u.L.push({id:`${u.id}-b${i+1}`,kind:'bay',t:b.t,bay:b,bi:i}));
    u.L.push({id:`${u.id}-r`,kind:'review',t:'Bilan baybayin',bayAll:true});
  }else{
    chunk(u.W,6).forEach((c,i)=>u.L.push({id:`${u.id}-m${i+1}`,kind:'words',t:'Vocabulaire '+(i+1),W:c}));
    const sc=chunk(u.S,6);
    const gc=sc.map(()=>[]);u.G.forEach((g,i)=>gc[i%sc.length].push(g));
    sc.forEach((c,i)=>u.L.push({id:`${u.id}-p${i+1}`,kind:'phrases',t:'Phrases '+(i+1),S:c,G:gc[i]}));
    if(u.vb)u.L.push({id:`${u.id}-v`,kind:'conj',t:'Conjugaison'});
    if(u.num)u.L.push({id:`${u.id}-n`,kind:'num',t:'Nombres'});
    u.L.push({id:`${u.id}-r`,kind:'review',t:'Bilan de l’unité'});
  }
  u.L.forEach((L,i)=>{L.u=u;L.sec=u.sec;L.ui=i;LESSONS[L.id]=L;FLOW.push(L);});
  const secUnits=UNITS.filter(x=>x.sec===u.sec);
  if(secUnits[secUnits.length-1]===u){
    const E={id:`sec${u.sec}-exam`,kind:'exam',t:'Épreuve de section',sec:u.sec,u:null,ui:0};
    LESSONS[E.id]=E;FLOW.push(E);
  }
});
FLOW.forEach((L,i)=>L.gi=i);

/* ---------- Lexique (bulles d'aide au survol / toucher) ---------- */
const LEX=new Map();
function lexAdd(k,v){k=norm(k);if(!k)return;const cur=LEX.get(k);if(!cur){LEX.set(k,[v]);return;}if(cur.includes(v))return;
  for(let i=cur.length-1;i>=0;i--){if(v.startsWith(cur[i]))cur.splice(i,1);else if(cur[i].startsWith(v))return;}cur.push(v);}
const PARTICLES={ang:'le, la (sujet)',ng:'de ; un (objet)',sa:'à, dans, sur',si:'(devant un prénom)',ni:'de (devant un prénom)',kay:'à (devant un prénom)',sina:'(devant plusieurs prénoms)',nina:'de (plusieurs prénoms)',mga:'(pluriel)',ay:'est (inversion)',na:'déjà ; lien',pa:'encore',ba:'(question)',po:'(respect)',ho:'(respect, familier)',at:'et',t:'et',ka:'tu',ko:'je ; mon',mo:'tu ; ton',kami:'nous (sans toi)',tayo:'nous (avec toi)',kayo:'vous',sila:'ils, elles',siya:'il, elle',ako:'je, moi',ikaw:'tu, toi',niya:'il ; son, sa',namin:'nous ; notre',natin:'nous ; notre',ninyo:'vous ; votre',nila:'ils ; leur',akin:'à moi',iyo:'à toi',kaniya:'à lui, à elle',kanya:'à lui, à elle',amin:'à nous',atin:'à nous',inyo:'à vous',kanila:'à eux',ito:'ceci',iyan:'cela',iyon:'cela (là-bas)',yan:'ça',yun:'ça ; ce',yung:'le ; ce',to:'ceci',di:'ne… pas',wag:'ne… pas (ordre)',hindi:'non ; ne… pas',lang:'seulement',din:'aussi',rin:'aussi',naman:'quant à ; adoucit',nga:'vraiment',daw:'paraît-il',raw:'paraît-il',pala:'ah tiens',yata:'on dirait',muna:'d’abord',kasi:'parce que',o:'ou',pero:'mais',kung:'si',nang:'quand ; de manière',noong:'quand (passé)',kahit:'même si',para:'pour',ngayong:'ce, cette (aujourd’hui)',mamayang:'ce (plus tard)'};
ALLW.forEach(w=>w.tl.forEach(t=>lexAdd(t,w.fr)));
Object.entries(PARTICLES).forEach(([k,v])=>{if(!LEX.has(norm(k)))lexAdd(k,v);});
Object.values(VERBS).forEach(v=>{const m=new Map();v.f.forEach((f,i)=>f.split('|').forEach(x=>{const a=m.get(x)||[];a.push(TL.ASPECTS[i].toLowerCase());m.set(x,a);}));m.forEach((asp,x)=>lexAdd(x,v.fr+' — '+asp.join(', ')));});
const LEX_MAX=Math.max(...Array.from(LEX.keys()).map(k=>k.split(' ').length));
function glossOf(word){
  const k=norm(word);if(!k)return null;
  if(LEX.has(k))return LEX.get(k).join(' · ');
  if(k.endsWith('ng')&&LEX.has(k.slice(0,-2)))return LEX.get(k.slice(0,-2)).join(' · ')+' (+ lien)';
  if(k.endsWith('g')&&k.slice(-2,-1)==='n'&&LEX.has(k.slice(0,-1)))return LEX.get(k.slice(0,-1)).join(' · ')+' (+ lien)';
  if(k.endsWith('t')&&LEX.has(k.slice(0,-1)))return LEX.get(k.slice(0,-1)).join(' · ')+' + et';
  if(k.endsWith('y')&&LEX.has(k.slice(0,-1)))return LEX.get(k.slice(0,-1)).join(' · ')+' + ay';
  return null;
}
/* Rend une phrase tagalog avec des mots touchables */
function tlTokens(text){
  const parts=String(text).split(/(\s+)/);
  const words=[];parts.forEach((p,i)=>{if(!/^\s+$/.test(p)&&p)words.push({i,p});});
  const out=parts.map(p=>esc(p));
  let w=0;
  while(w<words.length){
    let used=1,gl=null;
    for(let n=Math.min(LEX_MAX,words.length-w);n>=2;n--){
      const phrase=words.slice(w,w+n).map(x=>x.p).join(' ');
      const k=norm(phrase);if(LEX.has(k)&&k.includes(' ')){gl=LEX.get(k).join(' · ');used=n;break;}
    }
    if(!gl)gl=glossOf(words[w].p);
    const first=words[w].i,last=words[w+used-1].i;
    const raw=parts.slice(first,last+1).join('');
    const m=raw.match(/^([«“"(¿¡]*)(.*?)([.,!?;:»”")…]*)$/);
    const html=gl?`${esc(m[1])}<span class="tok" data-g="${attr(gl)}" data-w="${attr(m[2])}">${esc(m[2])}</span>${esc(m[3])}`:esc(raw);
    out[first]=html;for(let j=first+1;j<=last;j++)out[j]='';
    w+=used;
  }
  return out.join('');
}

/* ---------- État ---------- */
const KEY='akademya-tagalog-v1';
const HEART_MAX=5, HEART_MS=20*60e3;
function defState(){return {v:1,name:'',started:Date.now(),xp:0,gems:100,hearts:HEART_MAX,heartsTs:Date.now(),
  streak:0,best:0,last:null,freezes:0,goal:20,days:{},done:{},tested:{},words:{},badges:{},stories:{},mistakes:[],
  stats:{ans:0,ok:0,lessons:0,perfect:0,conj:0,nums:0,listen:0,typed:0,early:0,late:0},
  day:{d:today(),xp:0,lessons:0,perfect:0,ok:0,combo:0,stories:0,listen:0,typed:0,conj:0,claimed:{}},
  set:{sfx:true,tts:true,rate:.9,voice:'',listen:true,type:true,zen:false,ultra:false,unlock:false,theme:'auto',auto:true,wx:'auto',anim:true,natural:true,loc:'auto',locFreq:'day',place:null,gps:null,zoom:false},
  seenWelcome:false,updated:0,owner:null};}
let S=defState();
function load(){
  try{const raw=localStorage.getItem(KEY);if(raw){const o=JSON.parse(raw);const d=defState();
    S=Object.assign(d,o);S.set=Object.assign(d.set,o.set||{});S.stats=Object.assign(d.stats,o.stats||{});S.day=Object.assign(d.day,o.day||{});}}catch(e){}
}
let saveT;
/* S.updated sert à départager deux appareils ; pas de mise à jour avant la première synchronisation d'un compte */
function save(){if(!Cloud.user||Cloud.synced)S.updated=Date.now();clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}Cloud.push();},120);}

/* ---------- Journée, série, vies ---------- */
function rollDay(){const t=today();if(S.day.d!==t){S.day={d:t,xp:0,lessons:0,perfect:0,ok:0,combo:0,stories:0,listen:0,typed:0,conj:0,claimed:{}};}}
/* Mode ultra : vies, perlas et gels de série illimités, aucune limite d'erreurs */
function ultra(){return !!(S&&S.set&&S.set.ultra);}
function freeHearts(){return ultra()||!!(S&&S.set&&S.set.zen);}
function checkStreak(){
  if(!S.last)return null;const t=today();const gap=daysBetween(S.last,t);
  if(gap<=1)return null;
  const missed=gap-1;
  if(S.streak>0&&ultra()){S.last=dayAdd(t,-1);save();return 'ultra';}
  if(S.streak>0&&S.freezes>=missed){S.freezes-=missed;S.last=dayAdd(t,-1);save();return 'freeze';}
  if(S.streak>0){S.streak=0;save();return 'lost';}
  return null;
}
function touchStreak(){const t=today();if(S.last===t)return false;S.streak=(S.last===dayAdd(t,-1))?S.streak+1:1;S.last=t;S.best=Math.max(S.best,S.streak);return true;}
function syncHearts(){
  if(S.hearts>=HEART_MAX){S.hearts=HEART_MAX;S.heartsTs=Date.now();return;}
  const n=Math.floor((Date.now()-S.heartsTs)/HEART_MS);
  if(n>0){S.hearts=Math.min(HEART_MAX,S.hearts+n);S.heartsTs+=n*HEART_MS;if(S.hearts>=HEART_MAX)S.heartsTs=Date.now();}
}
function nextHeartIn(){if(S.hearts>=HEART_MAX)return 0;return Math.max(0,HEART_MS-(Date.now()-S.heartsTs));}
function addXP(n){S.xp+=n;const t=today();S.days[t]=(S.days[t]||0)+n;S.day.xp+=n;}
function xpToday(){return S.days[today()]||0;}

/* ---------- Répétition espacée ---------- */
const SRS_INT=[0,10*60e3,DAY,3*DAY,7*DAY,16*DAY,35*DAY];
function srs(k,ok){
  if(!k)return;const w=S.words[k]||(S.words[k]={s:0,d:0,n:0,ok:0,ko:0});
  w.n++;
  if(ok){w.ok++;w.s=Math.min(6,w.s+1);w.d=Date.now()+SRS_INT[w.s];}
  else{w.ko++;w.s=Math.max(0,w.s-2);w.d=Date.now()+SRS_INT[1];}
}
const learnedWords=()=>Object.keys(S.words).filter(k=>k[0]==='w'&&S.words[k].s>=1).length;
function dueKeys(){const now=Date.now();return Object.keys(S.words).filter(k=>BYKEY[k]&&S.words[k].d<=now).sort((a,b)=>S.words[a].s-S.words[b].s||S.words[a].d-S.words[b].d);}
function weakKeys(){return Object.keys(S.words).filter(k=>BYKEY[k]&&k[0]==='w').sort((a,b)=>(S.words[a].s-S.words[b].s)||((S.words[b].ko||0)-(S.words[a].ko||0)));}
function addMistake(ref){if(!ref)return;S.mistakes=S.mistakes.filter(x=>x!==ref);S.mistakes.unshift(ref);if(S.mistakes.length>60)S.mistakes.length=60;}
function clearMistake(ref){S.mistakes=S.mistakes.filter(x=>x!==ref);}

/* ---------- Déblocage ---------- */
const isDone=id=>!!S.done[id];
function unlocked(L){
  if(S.set.unlock)return true;
  if(L.gi===0)return true;
  if(isDone(L.id))return true;
  return isDone(FLOW[L.gi-1].id);
}
function currentLesson(){return FLOW.find(L=>!isDone(L.id)&&unlocked(L))||null;}
const unitDone=u=>u.L.every(L=>isDone(L.id));
const secDone=n=>FLOW.filter(L=>L.sec===n).every(L=>isDone(L.id));
const secStarted=n=>FLOW.some(L=>L.sec===n&&isDone(L.id));
function secUnlocked(n){if(S.set.unlock||n===1)return true;return secDone(n-1)||FLOW.some(L=>L.sec===n&&isDone(L.id));}
function storyUnlocked(st){return S.set.unlock||unitDone(UNITS.find(u=>u.id===st.after));}
/* Unités dont le contenu a été vu (pour la pratique) */
function seenUnits(){const us=UNITS.filter(u=>!u.bay&&u.L.some(L=>isDone(L.id)));return us.length?us:[UNITS[0]];}

/* ---------- Niveaux ---------- */
function levelOf(xp){let n=1;while(60*n*(n+1)/2<=xp)n++;const lo=60*(n-1)*n/2,hi=60*n*(n+1)/2;return {n,lo,hi,p:(xp-lo)/(hi-lo)};}
function levelTitle(n){return n<=2?['Baguhan','débutant']:n<=5?['Mag-aaral','élève']:n<=9?['Masigasig','assidu']:n<=14?['Mahusay','doué']:n<=19?['Bihasa','aguerri']:n<=29?['Dalubhasa','expert']:['Pantas','sage'];}

/* ---------- Badges ---------- */
const BADGES=[
 {id:'first',t:'Unang Hakbang',d:'Terminer une première leçon',ic:'star',ok:()=>S.stats.lessons>=1},
 {id:'st3',t:'Tatlong Araw',d:'Série de 3 jours',ic:'flame',ok:()=>S.best>=3},
 {id:'st7',t:'Isang Linggo',d:'Série de 7 jours',ic:'flame',ok:()=>S.best>=7},
 {id:'st30',t:'Isang Buwan',d:'Série de 30 jours',ic:'flame',ok:()=>S.best>=30},
 {id:'st100',t:'Sandaang Araw',d:'Série de 100 jours',ic:'flame',ok:()=>S.best>=100},
 {id:'xp100',t:'Sandaan',d:'100 XP gagnés',ic:'bolt',ok:()=>S.xp>=100},
 {id:'xp1k',t:'Sanlibo',d:'1 000 XP gagnés',ic:'bolt',ok:()=>S.xp>=1000},
 {id:'xp5k',t:'Limanlibo',d:'5 000 XP gagnés',ic:'bolt',ok:()=>S.xp>=5000},
 {id:'xp20k',t:'Dalawampung Libo',d:'20 000 XP gagnés',ic:'crown',ok:()=>S.xp>=20000},
 {id:'perf1',t:'Walang Mali',d:'Une leçon sans faute',ic:'check',ok:()=>S.stats.perfect>=1},
 {id:'perf25',t:'Perpekto',d:'25 leçons sans faute',ic:'check',ok:()=>S.stats.perfect>=25},
 {id:'w100',t:'Sandaang Salita',d:'100 mots appris',ic:'guide',ok:()=>learnedWords()>=100},
 {id:'w400',t:'Mayamang Bokabularyo',d:'400 mots appris',ic:'guide',ok:()=>learnedWords()>=400},
 {id:'sec1',t:'A1 · Unang Hakbang',d:'Terminer la section 1',ic:'trophy',ok:()=>secDone(1)},
 {id:'sec2',t:'A2 · Araw-araw',d:'Terminer la section 2',ic:'trophy',ok:()=>secDone(2)},
 {id:'sec3',t:'B1 · Pagpapalalim',d:'Terminer la section 3',ic:'trophy',ok:()=>secDone(3)},
 {id:'sec4',t:'B2 · Kahusayan',d:'Terminer la section 4',ic:'trophy',ok:()=>secDone(4)},
 {id:'sec5',t:'C1 · Dalubhasa',d:'Terminer tout le cours',ic:'crown',ok:()=>secDone(5)},
 {id:'read3',t:'Mambabasa',d:'Lire 3 histoires',ic:'stories',ok:()=>Object.keys(S.stories).length>=3},
 {id:'readAll',t:'Kuwentista',d:'Lire toutes les histoires',ic:'stories',ok:()=>Object.keys(S.stories).length>=STORIES.length},
 {id:'conj',t:'Pandiwa',d:'Conjuguer 100 verbes justes',ic:'pen',ok:()=>S.stats.conj>=100},
 {id:'num',t:'Kuwentador',d:'50 nombres justes',ic:'hash',ok:()=>S.stats.nums>=50},
 {id:'bay',t:'Baybayin',d:'Terminer l’unité baybayin',ic:'feather',ok:()=>unitDone(UNITS[UNITS.length-1])},
 {id:'early',t:'Maagang Ibon',d:'Une leçon avant 8 h',ic:'sun',ok:()=>S.stats.early>=1},
 {id:'late',t:'Kuwago',d:'Une leçon après 22 h',ic:'clock',ok:()=>S.stats.late>=1},
 {id:'ear',t:'Matalas ang Tainga',d:'50 exercices d’écoute réussis',ic:'ear',ok:()=>S.stats.listen>=50}
];
function checkBadges(){const n=[];BADGES.forEach(b=>{if(!S.badges[b.id]&&b.ok()){S.badges[b.id]=Date.now();S.gems+=20;n.push(b);}});return n;}

/* ---------- Quêtes du jour ---------- */
function quests(){
  const g=S.goal;
  const pool=[
    {id:'lessons',t:'Terminer 2 leçons',m:'lessons',n:2,ic:'star'},
    {id:'perfect',t:'Une leçon sans faute',m:'perfect',n:1,ic:'check'},
    {id:'ok',t:'20 bonnes réponses',m:'ok',n:20,ic:'target'},
    {id:'combo',t:'10 bonnes réponses d’affilée',m:'combo',n:10,ic:'bolt'},
    {id:'typed',t:'Écrire 5 réponses au clavier',m:'typed',n:5,ic:'keyboard'},
    {id:'conj',t:'Conjuguer 10 verbes',m:'conj',n:10,ic:'pen'},
    {id:'stories',t:'Lire une histoire',m:'stories',n:1,ic:'stories'}
  ];
  if(TTS.can()&&S.set.listen)pool.push({id:'listen',t:'Réussir 5 exercices d’écoute',m:'listen',n:5,ic:'ear'});
  const h=hashStr(today());
  const a=pool[h%pool.length];let b=pool[(h>>>5)%pool.length];if(b===a)b=pool[(pool.indexOf(a)+1)%pool.length];
  return [{id:'xp',t:`Gagner ${g} XP`,m:'xp',n:g,ic:'bolt'},a,b].map(q=>({...q,v:Math.min(q.n,S.day[q.m]||0)}));
}
function claimQuests(){const done=[];quests().forEach(q=>{if(q.v>=q.n&&!S.day.claimed[q.id]){S.day.claimed[q.id]=1;S.gems+=10;done.push(q);}});return done;}
