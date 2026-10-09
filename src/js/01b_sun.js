/* =========================================================
   01b — Mascotte : Araw, le petit soleil, habillé selon la météo de la ville de l'utilisateur
   Lieu : position automatique (rafraîchie selon la fréquence choisie) ou ville choisie ; Nice par défaut.
   ========================================================= */
const WX_STATES={
  sun:     {fr:'Ensoleillé',  tl:'Maaraw {sa} ngayon!',                        tr:'Il fait beau {a} aujourd’hui !'},
  hot:     {fr:'Très chaud',  tl:'Ang init {sa}!',                              tr:'Qu’il fait chaud {a} !'},
  cloud:   {fr:'Éclaircies',  tl:'Medyo maulap {sa}.',                          tr:'C’est un peu nuageux {a}.'},
  overcast:{fr:'Couvert',     tl:'Makulimlim {sa} ngayon.',                     tr:'Le ciel est couvert {a}.'},
  fog:     {fr:'Brouillard',  tl:'Mahamog {sa} ngayon.',                        tr:'Il y a du brouillard {a}.'},
  rain:    {fr:'Pluie',       tl:'Umuulan {sa}! Magdala ka ng payong.',         tr:'Il pleut {a} ! Prends un parapluie.'},
  storm:   {fr:'Orage',       tl:'Kumikidlat at kumukulog {sa}!',               tr:'Il y a des éclairs et du tonnerre {a} !'},
  snow:    {fr:'Neige',       tl:'Umuulan ng niyebe {sa}!',                     tr:'Il neige {a} !'},
  cold:    {fr:'Froid',       tl:'Malamig {sa} ngayon. Mag-jacket ka!',         tr:'Il fait froid {a}. Mets une veste !'},
  wind:    {fr:'Venteux',     tl:'Mahangin {sa} ngayon!',                       tr:'Il y a du vent {a} !'},
  night:   {fr:'Nuit',        tl:'Gabi na {sa}. Tulog na ang araw!',            tr:'C’est la nuit {a}. Le soleil dort !'}
};
const WX={st:null,t:null,code:null,wind:null,day:true,src:'',ts:0,key:''};
const WX_KEY='akademya-wx';

/* ---------- Lieu ---------- */
const PLACE_DEF={n:'Nice',lat:43.703,lon:7.266,sub:'Alpes-Maritimes'};
const LOC_FREQ={day:864e5,week:6048e5,month:2592e6,never:Infinity};
const LOC_FREQ_FR={day:'Une fois par jour',week:'Une fois par semaine',month:'Une fois par mois',never:'Jamais (à la demande)'};
const LOC={busy:false,err:'',perm:''};
function place(){
  const s=S.set;
  if(s.loc==='fixed'&&s.place&&isFinite(s.place.lat))return Object.assign({src:'fixed'},s.place);
  if(s.loc!=='fixed'&&s.gps&&isFinite(s.gps.lat))return Object.assign({src:'gps'},s.gps);
  return Object.assign({src:'default'},PLACE_DEF);
}
const placeName=()=>place().n||'';
const saPlace=()=>{const n=placeName();return n?'sa '+n:'dito';};
function aPlace(){const n=placeName();if(!n)return 'ici';if(/^Le /.test(n))return 'au '+n.slice(3);if(/^Les /.test(n))return 'aux '+n.slice(4);return 'à '+n;}
const wxTl=W=>W.tl.replace('{sa}',saPlace());
const wxTr=W=>W.tr.replace('{a}',aPlace());
function geoKm(a1,o1,a2,o2){const r=Math.PI/180,x=Math.sin((a2-a1)*r/2),y=Math.sin((o2-o1)*r/2);return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a1*r)*Math.cos(a2*r)*y*y));}
function nearestCity(lat,lon){
  let best=null;
  (TL.GEO||[]).forEach(([rc,rn,deps])=>deps.forEach(([dc,dn,cities])=>cities.forEach(([n,a,o])=>{const k=geoKm(lat,lon,a,o);if(!best||k<best.km)best={n,lat:a,lon:o,km:k,sub:dn,reg:rc,dep:dc};})));
  return best;
}
async function locPerm(){
  if(typeof navigator==='undefined'||!navigator.geolocation){LOC.perm='unsupported';return LOC.perm;}
  try{if(navigator.permissions&&navigator.permissions.query){const r=await navigator.permissions.query({name:'geolocation'});LOC.perm=r.state;return r.state;}}catch(e){}
  return LOC.perm||'prompt';
}
/* Faut-il redemander la position ? selon la fréquence choisie (jamais = seulement à la demande) */
function locDue(){
  const s=S.set;if(s.loc==='fixed')return false;
  const f=LOC_FREQ[s.locFreq]||LOC_FREQ.day;
  if(f===Infinity)return false;
  return !s.gps||!s.gps.ts||Date.now()-s.gps.ts>=f;
}
function getPos(maxAge){return new Promise((res,rej)=>{try{navigator.geolocation.getCurrentPosition(p=>res(p.coords),rej,{enableHighAccuracy:false,timeout:15000,maximumAge:maxAge});}catch(e){rej(e);}});}
async function reverseName(lat,lon){
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),6000);
    const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,{signal:ctrl.signal});
    clearTimeout(to);
    if(r.ok){const j=await r.json();const n=j.city||j.locality;if(n)return {n:String(n).slice(0,60),sub:String(j.principalSubdivision||j.countryName||'').slice(0,60)};}
  }catch(e){}
  const c=nearestCity(lat,lon);
  if(c&&c.km<=40)return {n:c.n,sub:c.km<=8?c.sub:'à '+Math.round(c.km)+' km'};
  return {n:'',sub:''};
}
/* Localisation basse consommation : pas de GPS précis, position récente du système acceptée, arrondie à ~1 km */
async function locate(manual){
  if(LOC.busy)return false;
  LOC.busy=true;LOC.err='';
  try{
    if(typeof navigator==='undefined'||!navigator.geolocation)throw {code:'unsupported'};
    const f=LOC_FREQ[S.set.locFreq]||LOC_FREQ.day;
    const c=await getPos(manual?6e4:Math.min(f===Infinity?864e5:f,6*36e5));
    const lat=+c.latitude.toFixed(2),lon=+c.longitude.toFixed(2);
    const nm=await reverseName(lat,lon);
    S.set.gps={lat,lon,n:nm.n,sub:nm.sub,ts:Date.now()};LOC.perm='granted';save();
    await loadWeather(true);
    return true;
  }catch(e){
    const code=e&&e.code;
    LOC.err=code===1?'denied':code===3?'timeout':code==='unsupported'?'unsupported':'unavailable';
    if(code===1)LOC.perm='denied';
    return false;
  }finally{LOC.busy=false;}
}
/* Au démarrage et au retour sur l'appli : seulement si l'utilisateur a déjà autorisé, et si c'est l'heure */
async function locAuto(){
  if(!locDue())return false;
  const st=await locPerm();if(st!=='granted')return false;
  return locate(false);
}
async function geoSearch(q){
  const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),7000);
  const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=fr&format=json&name='+encodeURIComponent(q),{signal:ctrl.signal});
  clearTimeout(to);if(!r.ok)throw new Error('http '+r.status);
  const j=await r.json();
  return (j.results||[]).map(x=>({n:x.name,lat:+(+x.latitude).toFixed(3),lon:+(+x.longitude).toFixed(3),sub:[x.admin2||x.admin1,x.country_code==='FR'?'':x.country].filter(Boolean).join(', ')}));
}

/* ---------- Météo ---------- */
function localHour(){return new Date().getHours();}
function wxClassify(code,t,wind,day){
  if(code>=95)return 'storm';
  if((code>=71&&code<=77)||code===85||code===86)return 'snow';
  if((code>=51&&code<=67)||(code>=80&&code<=82))return 'rain';
  if(code===45||code===48)return 'fog';
  if(wind>=40)return 'wind';
  if(!day)return 'night';
  if(t!=null&&t<=8)return 'cold';
  if(code===3)return 'overcast';
  if(code===2)return 'cloud';
  if(t!=null&&t>=29)return 'hot';
  return 'sun';
}
function wxFallback(){const h=localHour();WX.st=(h>=7&&h<20)?'sun':'night';WX.src='fallback';}
async function loadWeather(force){
  const prev=WX.st;
  if(S.set.wx&&S.set.wx!=='auto'){WX.st=S.set.wx;WX.src='manual';return prev!==WX.st;}
  const p=place(),key=(+p.lat).toFixed(2)+','+(+p.lon).toFixed(2);
  if(!force){try{const c=JSON.parse(localStorage.getItem(WX_KEY)||'null');if(c&&c.key===key&&Date.now()-c.ts<15*60e3){Object.assign(WX,c);return prev!==WX.st;}}catch(e){}}
  try{
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),7000);
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${(+p.lat).toFixed(2)}&longitude=${(+p.lon).toFixed(2)}&current=temperature_2m,weather_code,is_day,wind_speed_10m&timezone=auto`,{signal:ctrl.signal});
    clearTimeout(to);
    if(!r.ok)throw new Error('http '+r.status);
    const c=(await r.json()).current;
    WX.t=Math.round(c.temperature_2m);WX.code=c.weather_code;WX.wind=Math.round(c.wind_speed_10m);WX.day=!!c.is_day;
    WX.st=wxClassify(WX.code,WX.t,WX.wind,WX.day);WX.src='live';WX.ts=Date.now();WX.key=key;
    try{localStorage.setItem(WX_KEY,JSON.stringify(WX));}catch(e){}
  }catch(e){if(WX.src!=='live'||WX.key!==key||force)wxFallback();}
  return prev!==WX.st;
}
const wxNow=()=>WX.st||((localHour()>=7&&localHour()<20)?'sun':'night');

/* ---------- Dessin ---------- */
function sunCloud(x,y,s,fill,stroke,cls){
  return `<g class="${cls||''}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M7 25C-2 25-2 12 8 12C9 4 19 0 25 6C29 1 39 2 40 10C48 10 49 23 42 25Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/></g></g>`;
}
function mascot(mood,cls,wx){
  if(wx===undefined)wx=wxNow();
  const night=wx==='night',hot=wx==='hot',worried=wx==='storm';
  const sad=mood==='sad'||(worried&&mood!=='happy');
  const happy=mood==='happy';
  const rayCol=hot?'#FF7A1A':night?'#E5A93B':'#FFB020';
  const rays=Array.from({length:12},(_,i)=>`<rect x="56" y="${i%2?17:13}" width="8" height="${i%2?13:16}" rx="4" transform="rotate(${i*30} 60 64)"/>`).join('');
  const dark='#3A2200';
  let eyes,mouth;
  if(night&&!happy&&!sad){
    eyes=`<path d="M43 58q6 6 12 0M65 58q6 6 12 0" fill="none" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>`;
    mouth=`<ellipse cx="60" cy="76" rx="3.6" ry="4.4" fill="${dark}"/>`;
  }else if(happy){
    eyes=`<path d="M43 60q6-8 12 0M65 60q6-8 12 0" fill="none" stroke="${dark}" stroke-width="3.6" stroke-linecap="round"/>`;
    mouth=`<path d="M47 70q13 17 26 0z" fill="${dark}"/><path d="M53 76q7 5 14 0q-7-4-14 0z" fill="#FF6B6B"/>`;
  }else if(sad){
    eyes=`<g class="m-eyes"><ellipse cx="49" cy="60" rx="4" ry="5" fill="${dark}"/><ellipse cx="71" cy="60" rx="4" ry="5" fill="${dark}"/><circle cx="50.3" cy="58.3" r="1.5" fill="#fff"/><circle cx="72.3" cy="58.3" r="1.5" fill="#fff"/></g><path d="M42 54l11-4M78 54l-11-4" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
    mouth=worried?`<ellipse cx="60" cy="77" rx="5" ry="4" fill="${dark}"/>`:`<path d="M50 79q10-8 20 0" fill="none" stroke="${dark}" stroke-width="3.6" stroke-linecap="round"/>`;
  }else{
    eyes=`<g class="m-eyes"><ellipse cx="49" cy="58" rx="4.2" ry="5.6" fill="${dark}"/><ellipse cx="71" cy="58" rx="4.2" ry="5.6" fill="${dark}"/><circle cx="50.5" cy="55.8" r="1.7" fill="#fff"/><circle cx="72.5" cy="55.8" r="1.7" fill="#fff"/></g>`;
    mouth=wx==='overcast'||wx==='fog'?`<path d="M51 74q9 4 18 0" fill="none" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>`
      :`<path d="M49 71q11 11 22 0" fill="none" stroke="${dark}" stroke-width="3.6" stroke-linecap="round"/>`;
  }
  let back='',front='',fx='';
  const drops=(n,col)=>Array.from({length:n},(_,i)=>{const x=[10,22,98,110,16,104,6,114][i%8],y=[40,70,46,76,98,100,62,58][i%8];return `<path class="m-drop" style="animation-delay:${(i*.17).toFixed(2)}s" d="M${x} ${y}q3 5 0 7q-3-2 0-7z" fill="${col}"/>`;}).join('');
  const glasses=`<g><rect x="39" y="51" width="18" height="12" rx="5" fill="#16213A"/><rect x="63" y="51" width="18" height="12" rx="5" fill="#16213A"/><path d="M57 55h6M39 55l-6-3M81 55l6-3" stroke="#16213A" stroke-width="2.6" stroke-linecap="round"/><path d="M43 55l5-2M67 55l5-2" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/></g>`;
  const scarf=`<path d="M33 86Q60 101 87 86L89 95Q60 110 31 95Z" fill="#D7263D"/><path d="M71 96l9-3 4 20-9 2z" fill="#B71C30"/><path d="M38 90l3 6M48 93l2 7M58 95l1 7M68 94l-1 7" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`;
  if(wx==='sun'&&!happy&&!sad)front+=glasses;
  if(wx==='sun'&&happy)front+=`<g transform="translate(0 -4)">${glasses}</g>`;
  if(hot){front+=glasses+`<path class="m-sweat" d="M88 46q5 8 0 11q-5-3 0-11z" fill="#6EC6FF"/>`;}
  if(wx==='cloud')front+=sunCloud(4,80,1.05,'#FFFFFF','#C9D6EA','m-cloud');
  if(wx==='overcast'){back+=sunCloud(58,16,1.25,'#E2E8F0','#B8C4D6','m-cloud slow');front+=sunCloud(0,82,1.1,'#F1F5F9','#B8C4D6','m-cloud');}
  if(wx==='fog')front+=`<g class="m-fog"><rect x="6" y="80" width="70" height="7" rx="3.5" fill="#CBD5E1" fill-opacity=".9"/><rect x="40" y="91" width="74" height="7" rx="3.5" fill="#CBD5E1" fill-opacity=".85"/><rect x="14" y="102" width="62" height="7" rx="3.5" fill="#CBD5E1" fill-opacity=".8"/></g>`;
  if(wx==='rain'||wx==='storm'){
    back+=`<path d="M60 30V104" stroke="#5B3A20" stroke-width="3.2"/><path d="M60 104q0 9-7 9q-6 0-6-6" fill="none" stroke="#5B3A20" stroke-width="3.2" stroke-linecap="round"/>`;
    front+=`<g transform="rotate(-8 60 64)"><path d="M14 34Q60-16 106 34Q94 26 83 34Q72 26 60 34Q48 26 37 34Q26 26 14 34Z" fill="${wx==='storm'?'#4C3FB4':'#D7263D'}"/><path d="M60 34Q60 4 60-1M37 34Q42 8 60-1M83 34Q78 8 60-1" stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none"/><path d="M60-1v-6" stroke="#5B3A20" stroke-width="3" stroke-linecap="round"/></g>`;
    fx+=drops(8,'#4AA3F0');
  }
  if(wx==='storm'){fx+=sunCloud(70,0,.95,'#64748B','#475569','')+`<path class="m-bolt" d="M92 22l-8 14h7l-5 12 13-17h-7l5-9z" fill="#FCD116" stroke="#C99400" stroke-width="1.2"/>`;}
  if(wx==='snow'){
    front+=`<path d="M29 54Q30 22 60 21Q90 22 91 54Z" fill="#2563EB"/><rect x="27" y="47" width="66" height="11" rx="5.5" fill="#1D4ED8"/><path d="M34 52h52" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="3 4"/><circle cx="60" cy="18" r="8" fill="#fff"/>`+scarf;
    fx+=Array.from({length:7},(_,i)=>{const x=[10,24,100,112,8,106,96][i],y=[30,64,40,72,96,100,18][i];return `<circle class="m-flake" style="animation-delay:${(i*.4).toFixed(1)}s" cx="${x}" cy="${y}" r="2.6" fill="#fff" stroke="#BFD4F2"/>`;}).join('');
  }
  if(wx==='cold'){front+=scarf;fx+=`<path class="m-breath" d="M90 76q6-3 10 0q4 3 9 0" fill="none" stroke="#9CC3F0" stroke-width="2.4" stroke-linecap="round"/>`;}
  if(wx==='wind')fx+=`<g fill="none" stroke="#7FB2EE" stroke-width="3" stroke-linecap="round"><path class="m-wind" d="M2 46h24q7 0 7-7"/><path class="m-wind" style="animation-delay:.5s" d="M0 66h20"/><path class="m-wind" style="animation-delay:.9s" d="M4 86h22q6 0 6 6"/></g><path class="m-leaf" d="M100 30q10-2 12 8q-10 2-12-8z" fill="#22A35A"/>`;
  if(night&&!happy&&!sad){
    front+=`<path d="M27 52C28 32 46 22 64 25C82 28 96 42 104 62C95 52 88 48 82 49Z" fill="#4C3FB4"/><path d="M27 52Q55 41 82 49" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="104" cy="64" r="5.5" fill="#FCD116"/>`;
    fx+=`<text class="m-z" x="88" y="40" font-family="Baloo 2, sans-serif" font-weight="800" font-size="13" fill="#7C8FCB">z</text><text class="m-z" style="animation-delay:1.4s" x="96" y="30" font-family="Baloo 2, sans-serif" font-weight="800" font-size="10" fill="#7C8FCB">z</text>`;
  }
  const faceFill=night?'url(#akSunN)':'url(#akSunG)';
  const bodyCls=['m-body',happy?'m-hop':'',wx==='cold'?'m-shiver':''].join(' ');
  return `<svg class="${cls||'m'}" viewBox="0 0 120 120" aria-hidden="true" overflow="visible">
   ${fx}<g class="${bodyCls}">${back}<g class="m-rays${wx==='wind'?' fast':''}" fill="${rayCol}">${rays}</g>
   <circle cx="60" cy="64" r="32" fill="${faceFill}" stroke="#F29A00" stroke-width="2"/>
   <ellipse cx="41" cy="71" rx="6" ry="4" fill="#FF7A6B" fill-opacity="${hot?'.75':'.45'}"/><ellipse cx="79" cy="71" rx="6" ry="4" fill="#FF7A6B" fill-opacity="${hot?'.75':'.45'}"/>
   ${eyes}${mouth}${front}</g></svg>`;
}
/* Petit bloc météo : lieu, température, phrase tagalog à écouter */
function wxBlock(){
  const st=wxNow(),W=WX_STATES[st],p=place(),nm=p.n||'Ma position';
  const where=WX.src==='live'?`${nm} · ${WX.t} °C · ${W.fr}`:WX.src==='manual'?`Météo choisie · ${W.fr}`:`${nm} · météo en direct indisponible`;
  const ask=S.set.loc!=='fixed'&&p.src==='default'&&LOC.perm!=='denied'&&LOC.perm!=='unsupported';
  const tl=wxTl(W);
  return `<div class="wx"><div class="wx-top"><span class="wx-pill">${ic(st==='night'?'clock':st==='rain'||st==='storm'?'cloud':'sun')}${esc(where)}</span>${ask?`<button class="wx-loc" data-act="loc-now" ${LOC.busy?'disabled':''}>${ic('pin')}${LOC.busy?'Localisation…':'Ma ville'}</button>`:''}</div>
    <p><span class="tl tl-say" data-say="${attr(tl)}">${esc(tl)}</span><br><span class="small muted">${esc(wxTr(W))}</span></p></div>`;
}
