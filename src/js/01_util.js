/* =========================================================
   01 — Utilitaires, icônes, mascotte, audio, normalisation
   ========================================================= */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const attr=s=>esc(s).replace(/'/g,'&#39;');
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function sample(a,n){return shuffle(a).slice(0,n);}
function uniqBy(a,f){const s=new Set();return a.filter(x=>{const k=f(x);if(s.has(k))return false;s.add(k);return true;});}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const DAY=864e5;
function ymd(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function today(){return ymd(new Date());}
function dayAdd(s,n){const [y,m,d]=s.split('-').map(Number);return ymd(new Date(y,m-1,d+n));}
function daysBetween(a,b){const [y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);return Math.round((new Date(y2,m2-1,d2)-new Date(y1,m1-1,d1))/DAY);}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function fmtNum(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}

/* Texte riche des guides : *tagalog* (prononçable) et **gras** */
function rich(s){
  return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,(m,t)=>`<span class="tl tl-say" data-say="${attr(t)}">${t}</span>`);
}

/* ---------- Normalisation et comparaison ---------- */
function norm(s){
  return String(s||'').toLowerCase()
    .replace(/[’'‘`´]/g,'')
    .replace(/œ/g,'oe').replace(/æ/g,'ae')
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[-–—_]/g,' ')
    .replace(/[.,!?;:«»"“”()…¿¡\/]/g,' ')
    .replace(/\s+/g,' ').trim();
}
const loose=s=>norm(s).replace(/ /g,'');
function lev(a,b){
  if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;
  let p=Array.from({length:n+1},(_,i)=>i),c=new Array(n+1);
  for(let i=1;i<=m;i++){c[0]=i;for(let j=1;j<=n;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));}[p,c]=[c,p];}
  return p[n];
}
/* Compare une saisie à une liste de réponses acceptées.
   Retour : {ok, typo, exact} — une faute de frappe n'est tolérée que sur un mot long, jamais sur un petit mot grammatical. */
function compareAnswer(input,answers){
  const ni=norm(input);if(!ni)return {ok:false};
  for(const a of answers){if(norm(a)===ni)return {ok:true,exact:true};}
  for(const a of answers){if(loose(a)===loose(input))return {ok:true,typo:'space'};}
  const ti=ni.split(' ');
  for(const a of answers){
    const ta=norm(a).split(' ');
    if(ta.length!==ti.length)continue;
    let diff=-1,bad=false;
    for(let i=0;i<ta.length;i++){if(ta[i]!==ti[i]){if(diff>=0){bad=true;break;}diff=i;}}
    if(bad||diff<0)continue;
    if(ta[diff].length>=5&&lev(ta[diff],ti[diff])===1)return {ok:true,typo:'letter',word:ta[diff]};
  }
  return {ok:false};
}

/* ---------- Icônes (SVG 24×24) ---------- */
const ICONS={
 pin:'<path d="M12 2.4a7.1 7.1 0 0 0-7.1 7.1c0 5.3 7.1 12.1 7.1 12.1s7.1-6.8 7.1-12.1A7.1 7.1 0 0 0 12 2.4z" fill="currentColor"/><circle cx="12" cy="9.5" r="2.7" fill="#fff"/>',
 learn:'<path d="M3 11.2 12 4l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>',
 practice:'<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6.5 6v12M3 9v6M17.5 6v12M21 9v6M6.5 12h11"/></g>',
 stories:'<path d="M2 5.5h6.5A3.5 3.5 0 0 1 12 9v12a2.5 2.5 0 0 0-2.5-2.5H2zM22 5.5h-6.5A3.5 3.5 0 0 0 12 9v12a2.5 2.5 0 0 1 2.5-2.5H22z" fill="currentColor"/>',
 guide:'<path d="M5 3.5h12.5a1.5 1.5 0 0 1 1.5 1.5v13H7a2 2 0 0 0-2 2zM5 20a2 2 0 0 0 2 2h12v-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M9 8h6M9 11.5h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 profile:'<circle cx="12" cy="8" r="4.2" fill="currentColor"/><path d="M3.8 21a8.2 8.2 0 0 1 16.4 0z" fill="currentColor"/>',
 flame:'<path d="M12.3 2.2c.6 3.3 4.9 5.4 4.9 10.6a5.3 5.3 0 0 1-10.6.6c-.2-2.3.9-4 2.2-5.1.1 1.9 1 3 2.1 3.2-.4-3.4.4-6.5 1.4-9.3z" fill="currentColor"/>',
 gem:'<path d="M6.2 3.5h11.6L22 9.2 12 21 2 9.2z" fill="currentColor"/><path d="M2 9.2h20M8.6 3.5 12 9.2l3.4-5.7M12 9.2V21" stroke="#fff" stroke-opacity=".45" stroke-width="1.3" fill="none"/>',
 heart:'<path d="M12 21.2s-8.6-5.4-8.6-11.6A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.6 2.6c0 6.2-8.6 11.6-8.6 11.6z" fill="currentColor"/>',
 bolt:'<path d="M13.5 2 4.5 13.6h6.6L10 22l9.5-12h-6.8z" fill="currentColor"/>',
 star:'<path d="m12 2.6 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor"/>',
 chat:'<path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 20 17H10l-5.5 4v-4H4A1.5 1.5 0 0 1 2.5 15.5V6A1.5 1.5 0 0 1 4 4.5z" fill="currentColor"/>',
 check:'<path d="M4.5 12.5 9.5 17.5 19.5 6.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
 x:'<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.6"/>',
 trophy:'<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0zM10.5 15.5h3v3h-3zM7.5 20.5h9" fill="currentColor"/><path d="M7 5.5H3.5a3.5 3.5 0 0 0 4 4M17 5.5h3.5a3.5 3.5 0 0 1-4 4M8 20.5h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 speaker:'<path d="M3.5 9h4l5.5-4.5v15L7.5 15h-4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.2 5.8a8.8 8.8 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
 turtle:'<path d="M3 15.5c0-4.2 3.6-7.5 8-7.5s8 3.3 8 7.5z" fill="currentColor"/><path d="M19 13.5h1.8a1.7 1.7 0 0 0 0-3.4H19M6 15.5V19M15.5 15.5V19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 sliders:'<g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M4 6h9M18 6h2M4 12h3M12 12h8M4 18h11M20 18h0"/><circle cx="15.5" cy="6" r="2.3"/><circle cx="9.5" cy="12" r="2.3"/><circle cx="17.5" cy="18" r="2.3"/></g>',
 chevron:'<path d="m9 5.5 6.5 6.5L9 18.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
 back:'<path d="M15 5.5 8.5 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
 refresh:'<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5A8 8 0 0 0 6.2 6.3L4 8.5M4 4v4.5h4.5M4 12.5a8 8 0 0 0 13.8 5.2l2.2-2.2M20 20v-4.5h-4.5"/></g>',
 target:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
 hash:'<path d="M4.5 9h15M4.5 15h15M10 4 8 20M16 4l-2 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
 pen:'<path d="m4 20 1.2-4.6L16.4 4.2a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z" fill="currentColor"/><path d="M14 6.6l3.4 3.4" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>',
 ear:'<path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 3.2-3.2 4.2-3.2 7.4a3.3 3.3 0 0 1-5.8 2.1M9.5 10a2.5 2.5 0 0 1 5 0c0 1.4-1.3 1.8-1.8 2.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>',
 keyboard:'<rect x="2.5" y="6" width="19" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M7.5 14h9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
 bulb:'<path d="M12 2.8a6.2 6.2 0 0 0-3.9 11c.7.6 1.1 1.4 1.1 2.3v.7h5.6v-.7c0-.9.4-1.7 1.1-2.3A6.2 6.2 0 0 0 12 2.8z" fill="currentColor"/><path d="M9.5 19.5h5M10.5 22h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 feather:'<path d="M20 4c-6 0-11.5 3.6-13.4 9.8L5 20l2-1.3C9 13 13 9.5 17 8c-3 2.2-5.6 5.3-7.2 9.2C15 16.7 19.6 11 20 4z" fill="currentColor"/>',
 skip:'<path d="M3.5 5.5 11 12l-7.5 6.5zM12 5.5l7.5 6.5L12 18.5z" fill="currentColor"/>',
 shield:'<path d="M12 2.8 20 6v6.2c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6z" fill="currentColor"/><path d="M8.5 12h7M12 8.5v7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
 flag:'<path d="M5 21V3.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M5 4h12.5l-2.5 4.2 2.5 4.3H5z" fill="currentColor"/>',
 clock:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 7v5.2l3.2 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 play:'<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
 copy:'<rect x="8" y="8" width="12.5" height="12.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 8V5.5A2 2 0 0 0 13.5 3.5H5.5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2H8" fill="none" stroke="currentColor" stroke-width="2.2"/>',
 cloud:'<path d="M7 19a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 19 10.5a4.3 4.3 0 0 1-.5 8.5z" fill="currentColor"/>',
 crown:'<path d="M3 7.5 7.5 11 12 4.5 16.5 11 21 7.5 19 18H5z" fill="currentColor"/><path d="M5 20.5h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 sparkle:'<path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1z" fill="currentColor"/><path d="M19 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor"/>',
 sun:'<circle cx="12" cy="12" r="4.6" fill="currentColor"/><g stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g>'
};
const ic=(n,cls)=>`<span class="ico${cls?' '+cls:''}" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[n]||ICONS.star}</svg></span>`;

/* ---------- Toast ---------- */
let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);}

/* ---------- Synthèse vocale ---------- */
const TTS={
  ok:false, voices:[], voice:null, quality:'none',
  init(){
    if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){this.ok=false;return;}
    const load=()=>{try{this.voices=speechSynthesis.getVoices()||[];}catch(e){this.voices=[];}this.pickVoice();};
    load();
    try{speechSynthesis.onvoiceschanged=()=>{load();if(typeof refreshChrome==='function')refreshChrome();};}catch(e){}
    this.ok=true;
  },
  rank(v){const l=(v.lang||'').toLowerCase().replace('_','-');
    if(l.startsWith('fil')||l.startsWith('tl'))return 0;
    if(l.startsWith('id'))return 1; if(l.startsWith('ms'))return 2; if(l.startsWith('es'))return 3; if(l.startsWith('it'))return 4; return 9;},
  candidates(){return this.voices.slice().sort((a,b)=>this.rank(a)-this.rank(b));},
  pickVoice(){
    const want=S&&S.set&&S.set.voice;
    let v=want?this.voices.find(x=>x.voiceURI===want):null;
    if(!v){const c=this.candidates();v=c.length&&this.rank(c[0])<9?c[0]:null;}
    this.voice=v;
    this.quality=v?(this.rank(v)===0?'native':'approx'):(this.voices.length?'default':'none');
  },
  prep(t){
    t=String(t).replace(/[’']/g,'').replace(/___/g,' … ');
    if(this.quality!=='native'){t=t.replace(/\bmga\b/gi,'manga').replace(/\bng\b/gi,'nang');}
    return t;
  },
  /* Priorité aux fichiers audio Gemini ; voix du navigateur en secours */
  speak(text,slow,voice){
    if(!S.set.tts||!text)return;
    if(S.set.natural!==false){
      const id=AUDIO.find(text,voice);
      if(id){try{speechSynthesis.cancel();}catch(e){}AUDIO.play(id,slow).then(ok=>{if(!ok)this.synth(text,slow);});return;}
    }
    this.synth(text,slow);
  },
  stop(){try{speechSynthesis.cancel();}catch(e){}if(AUDIO.cur)try{AUDIO.cur.pause();}catch(e){}},
  synth(text,slow){
    if(!this.ok)return;
    if(AUDIO.cur)try{AUDIO.cur.pause();}catch(e){}
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(this.prep(text));
      if(this.voice){u.voice=this.voice;u.lang=this.voice.lang;}else u.lang='fil-PH';
      u.rate=clamp((S.set.rate||.9)*(slow?.62:1),.4,1.4);
      speechSynthesis.speak(u);
    }catch(e){}
  },
  can(){return !!S.set.tts&&((S.set.natural!==false&&AUDIO.has())||(this.ok&&this.voices.length>0));}
};

/* ---------- Fichiers audio pré-générés (voix Gemini) ----------
   Chaque extrait s'appelle audio/<id>.mp3 ; id = empreinte de « voix|texte normalisé ».
   audio/index.json liste les extraits présents. */
function hash2(s){let a=2166136261,b=5381;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a^=c;a=Math.imul(a,16777619);b=(Math.imul(b,33)+c)|0;}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');}
const VOICE_DEF='Kore';
function audioId(text,voice){return hash2((voice||VOICE_DEF)+'|'+norm(text));}
const AUDIO={ids:null,cur:null,seq:0,base:'audio/',
  load(){
    if(!/^https?:$/.test(location.protocol)||typeof fetch!=='function')return;
    fetch(this.base+'index.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{
      if(Array.isArray(j)&&j.length){this.ids=new Set(j);if(typeof refreshChrome==='function')refreshChrome();}
    }).catch(()=>{});
  },
  has(){return !!(this.ids&&this.ids.size);},
  find(text,voice){
    if(!this.ids)return null;
    let id=audioId(text,voice);if(this.ids.has(id))return id;
    if(voice&&voice!==VOICE_DEF){id=audioId(text,VOICE_DEF);if(this.ids.has(id))return id;}
    return null;
  },
  /* Un seul élément <audio> réutilisé : iOS autorise ensuite la lecture sans nouveau geste */
  play(id,slow){
    try{
      const a=this.cur||(this.cur=new Audio());
      a.pause();a.preload='auto';a.preservesPitch=true;
      a.src=this.base+id+'.mp3';
      a.defaultPlaybackRate=a.playbackRate=slow?.72:1;
      const my=++this.seq,p=a.play();
      /* false = voix du navigateur en secours, sauf si un autre extrait a pris la main entre-temps */
      return p&&p.then?p.then(()=>true,e=>my!==this.seq||(e&&e.name==='AbortError')):Promise.resolve(true);
    }catch(e){return Promise.resolve(false);}
  }
};

/* ---------- Effets sonores (Web Audio, synthétisés) ---------- */
const SFX={ac:null,
  ctx(){if(!this.ac){try{this.ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){this.ac=null;}}if(this.ac&&this.ac.state==='suspended')this.ac.resume();return this.ac;},
  play(notes,type,vol,step){
    if(!S.set.sfx)return;const ac=this.ctx();if(!ac)return;
    const t0=ac.currentTime+.01;
    notes.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=f;
      const t=t0+i*(step||.09);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.16,t+.015);g.gain.exponentialRampToValueAtTime(.0008,t+.32);
      o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.34);});
  },
  ok(){this.play([783.99,1174.66],'triangle',.17,.085);},
  bad(){this.play([196,155.56],'square',.06,.12);},
  done(){this.play([523.25,659.25,783.99,1046.5,1318.5],'triangle',.15,.1);},
  tap(){this.play([880],'sine',.04);},
  /* Éclair du mode ultra : craquement + grondement + carillon (activation), ou extinction (désactivation) */
  zap(on){
    if(!S.set.sfx)return;const ac=this.ctx();if(!ac)return;const t=ac.currentTime+.02;
    try{
      if(!on){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(640,t);o.frequency.exponentialRampToValueAtTime(110,t+.45);
        g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.52);return;}
      const len=Math.floor(ac.sampleRate*.9),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<len;i++){const k=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-k,2.5)*(Math.random()<.9-.8*k?1:.25);}
      const crack=ac.createBufferSource(),hp=ac.createBiquadFilter(),g1=ac.createGain();crack.buffer=buf;hp.type='highpass';hp.frequency.value=1100;
      g1.gain.setValueAtTime(.0001,t+.1);g1.gain.exponentialRampToValueAtTime(.3,t+.112);g1.gain.exponentialRampToValueAtTime(.001,t+.8);
      crack.connect(hp).connect(g1).connect(ac.destination);crack.start(t+.1);
      const rumble=ac.createBufferSource(),lp=ac.createBiquadFilter(),g2=ac.createGain();rumble.buffer=buf;rumble.playbackRate.value=.35;lp.type='lowpass';lp.frequency.value=170;
      g2.gain.setValueAtTime(.0001,t+.12);g2.gain.exponentialRampToValueAtTime(.55,t+.2);g2.gain.exponentialRampToValueAtTime(.001,t+1.7);
      rumble.connect(lp).connect(g2).connect(ac.destination);rumble.start(t+.12);
      setTimeout(()=>this.play([659.25,987.77,1318.5,1975.5],'triangle',.1,.06),420);
    }catch(e){}
  }
};

/* ---------- Confettis ---------- */
function confetti(){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const c=$('#confetti');const ctx=c.getContext&&c.getContext('2d');if(!ctx)return;
  c.hidden=false;const W=c.width=innerWidth,H=c.height=innerHeight;
  const cols=['#FCD116','#CE1126','#0038A8','#1F9D55','#F2B300','#ffffff'];
  const P=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*11,vy:-Math.random()*12-4,s:5+Math.random()*7,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:pick(cols)}));
  let f=0;
  (function loop(){ctx.clearRect(0,0,W,H);P.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();});
    if(++f<110)requestAnimationFrame(loop);else{ctx.clearRect(0,0,W,H);c.hidden=true;}})();
}

/* ---------- Baybayin ---------- */
const BAY_V={a:'ᜀ',i:'ᜁ',u:'ᜂ'};
const BAY_C={k:'ᜃ',g:'ᜄ',ng:'ᜅ',t:'ᜆ',d:'ᜇ',r:'ᜇ',n:'ᜈ',p:'ᜉ',b:'ᜊ',m:'ᜋ',y:'ᜌ',l:'ᜎ',w:'ᜏ',s:'ᜐ',h:'ᜑ'};
const BAY_KI='ᜒ',BAY_KU='ᜓ',BAY_VIR='᜔';
function toBaybayin(text){
  let s=String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/c(?=[ei])/g,'s').replace(/c/g,'k').replace(/qu/g,'k').replace(/q/g,'k').replace(/f/g,'p').replace(/v/g,'b').replace(/z/g,'s').replace(/x/g,'ks').replace(/j/g,'dy').replace(/ñ/g,'ny')
    .replace(/e/g,'i').replace(/o/g,'u').replace(/[’'-]/g,'');
  let out='',i=0;
  while(i<s.length){
    let c=null,len=0;
    if(s.startsWith('ng',i)){c='ng';len=2;}
    else if(BAY_C[s[i]]){c=s[i];len=1;}
    if(c){
      const v=s[i+len];
      if(v==='a'||v==='i'||v==='u'){out+=BAY_C[c]+(v==='a'?'':v==='i'?BAY_KI:BAY_KU);i+=len+1;}
      else{out+=BAY_C[c]+BAY_VIR;i+=len;}
    }else if(BAY_V[s[i]]){out+=BAY_V[s[i]];i++;}
    else{out+=s[i];i++;}
  }
  return out;
}

/* ---------- Nombres en tagalog ---------- */
const N_ONES=['','isa','dalawa','tatlo','apat','lima','anim','pito','walo','siyam'];
const N_TEENS=['sampu','labing-isa','labindalawa','labintatlo','labing-apat','labinlima','labing-anim','labimpito','labingwalo','labinsiyam'];
const N_TENS=['','sampu','dalawampu','tatlumpu','apatnapu','limampu','animnapu','pitumpu','walumpu','siyamnapu'];
function linkWord(phrase){
  if(/[aeiou]$/.test(phrase))return phrase+'ng';
  if(/n$/.test(phrase))return phrase+'g';
  return phrase+' na';
}
function n100(n){if(n<10)return N_ONES[n];if(n<20)return N_TEENS[n-10];const t=Math.floor(n/10),u=n%10;return u?N_TENS[t]+'’t '+N_ONES[u]:N_TENS[t];}
function n1000(n){
  const h=Math.floor(n/100),r=n%100,parts=[];
  if(h){const w=linkWord(N_ONES[h]);parts.push(w.endsWith(' na')?w+' raan':w+' daan');}
  if(r){if(h)parts.push('at');parts.push(n100(r));}
  return parts.join(' ');
}
function tlNum(n){
  n=Math.floor(Math.abs(n));if(n===0)return 'wala (sero)';
  if(n<1000)return n1000(n);
  const th=Math.floor(n/1000),r=n%1000;
  let s=linkWord(n1000(th))+' libo';
  if(r){s+=(r<100||r%100===0?' at ':' ')+n1000(r);}
  return s;
}
function numKey(s){
  s=String(s).replace(/[’']t\b/g,' at');
  let k=' '+norm(s)+' ';
  k=k.replace(/ at /g,' ').replace(/\s+/g,'');
  return k.replace(/isandaan|sandaan/g,'isangdaan').replace(/dalawandaan/g,'dalawangdaan').replace(/limandaan/g,'limangdaan')
    .replace(/sanlibo/g,'isanglibo').replace(/labing(?=[dtls])/g,'labin').replace(/labingpito/g,'labimpito').replace(/nadaan/g,'naraan');
}
