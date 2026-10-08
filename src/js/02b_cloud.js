/* =========================================================
   02b — Comptes en ligne (version web) : Supabase Auth + Postgres
   Compte commun avec l'Académie CMD & PowerShell (même projet Supabase, même session).
   Table tagalog_progress : un état JSON par compte, protégé par RLS.
   Table tagalog_history  : dernières leçons terminées.
   Sans compte (ou dans l'aperçu Claude), tout reste dans le navigateur.
   ========================================================= */
const CFG=(typeof window!=='undefined'&&window.AKADEMYA_SUPABASE)||null;
const IN_ARTIFACT=!!(typeof window!=='undefined'&&window.claude&&typeof window.claude.use==='function');
/* Réglages suivis d'un appareil à l'autre ; les autres (thème, voix, sons…) restent propres à l'appareil */
const SYNC_SET=['zen','ultra','unlock','listen','type','auto'];
const AUTH={mode:'login',msg:'',err:'',busy:false,confirmDel:false,pwd:false};

function stripLocal(o){
  const c=Object.assign({},o);delete c.owner;
  c.set={};SYNC_SET.forEach(k=>{c.set[k]=o.set[k];});
  return c;
}
/* Fusion d'un état distant dans l'état local : on garde le meilleur de chaque côté */
function mergeRemote(R){
  if(!R||R.v!==1||typeof R!=='object')return false;
  const before=JSON.stringify(S);
  const newer=(R.updated||0)>(S.updated||0);
  S.xp=Math.max(S.xp||0,R.xp||0);
  if(R.started)S.started=Math.min(S.started||R.started,R.started);
  if(newer){
    ['gems','hearts','heartsTs','freezes','goal','mistakes'].forEach(k=>{if(R[k]!==undefined)S[k]=R[k];});
    if(R.name)S.name=R.name;
    if(R.set)SYNC_SET.forEach(k=>{if(k in R.set)S.set[k]=R.set[k];});
    S.updated=R.updated;
  }
  if(R.last&&(!S.last||R.last>S.last||(R.last===S.last&&(R.streak||0)>(S.streak||0)))){S.last=R.last;S.streak=R.streak||0;}
  S.best=Math.max(S.best||0,R.best||0,S.streak||0);
  S.seenWelcome=S.seenWelcome||!!R.seenWelcome;
  for(const [d,v] of Object.entries(R.days||{}))S.days[d]=Math.max(S.days[d]||0,+v||0);
  for(const [k,v] of Object.entries(R.done||{})){const l=S.done[k];if(!l||(v.n||0)>(l.n||0)||((v.n||0)===(l.n||0)&&(v.t||0)>(l.t||0)))S.done[k]=v;}
  Object.assign(S.tested,R.tested||{});
  for(const [k,v] of Object.entries(R.words||{})){const l=S.words[k];if(!l||(v.n||0)>(l.n||0)||((v.n||0)===(l.n||0)&&(v.d||0)>(l.d||0)))S.words[k]=v;}
  for(const [k,v] of Object.entries(R.badges||{}))if(!S.badges[k]||v<S.badges[k])S.badges[k]=v;
  for(const [k,v] of Object.entries(R.stories||{}))if(!S.stories[k])S.stories[k]=v;
  for(const k of Object.keys(S.stats))S.stats[k]=Math.max(S.stats[k]||0,(R.stats||{})[k]||0);
  if(R.day&&R.day.d){
    if(!S.day.d||R.day.d>S.day.d)S.day=Object.assign(defState().day,R.day);
    else if(R.day.d===S.day.d){for(const k of Object.keys(S.day))if(typeof S.day[k]==='number')S.day[k]=Math.max(S.day[k],+R.day[k]||0);
      S.day.claimed=Object.assign({},R.day.claimed||{},S.day.claimed||{});}
  }
  return JSON.stringify(S)!==before;
}
function authErr(e){
  const m=String((e&&(e.message||e.error_description||e.msg||e.error))||e||'');const c=(e&&e.code)||'';
  if(/invalid login credentials/i.test(m)||c==='invalid_credentials')return 'Identifiant ou mot de passe incorrect.';
  if(/email not confirmed/i.test(m)||c==='email_not_confirmed')return 'Adresse pas encore confirmée : ouvre le lien reçu par e-mail, puis reconnecte-toi.';
  if(/already registered|already been registered/i.test(m)||c==='user_already_exists')return 'Un compte existe déjà avec cette adresse e-mail.';
  if(/rate limit|too many/i.test(m)||/rate_limit/.test(c))return 'Trop de tentatives ou d’e-mails envoyés. Réessaie dans quelques minutes.';
  if(/weak|at least|should be/i.test(m)&&/password/i.test(m))return 'Mot de passe trop faible : 8 caractères minimum.';
  if(/invalid.*email|email.*invalid|unable to validate email/i.test(m))return 'Adresse e-mail invalide.';
  if(/not authorized|email_address_not_authorized/i.test(m)||c==='email_address_not_authorized')return 'Le serveur refuse d’envoyer l’e-mail de confirmation à cette adresse.';
  if(/database error saving new user/i.test(m))return 'Inscription refusée par le serveur (nom d’utilisateur déjà pris ?).';
  if(/failed to fetch|networkerror|load failed/i.test(m))return 'Serveur injoignable : vérifie ta connexion Internet.';
  if(/same.*password|different from the old/i.test(m))return 'Le nouveau mot de passe doit être différent de l’ancien.';
  return m||'Une erreur est survenue.';
}
const Cloud={sb:null,user:null,profile:null,on:false,ready:false,synced:false,timer:null,writing:false,again:false,history:[],lastSync:0,offline:false,
  available(){return !!(CFG&&CFG.url&&CFG.key&&typeof window!=='undefined'&&window.supabase&&!IN_ARTIFACT);},
  name(){return (this.profile&&this.profile.username)||(this.user&&((this.user.user_metadata||{}).username||this.user.email))||'';},
  async init(){
    if(!this.available())return;
    try{
      /* storageKey commun : une connexion sur l'Académie vaut aussi ici (même domaine github.io) */
      this.sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'academie-auth'}});
      this.sb.auth.onAuthStateChange((ev,session)=>{
        if(ev==='PASSWORD_RECOVERY'){AUTH.mode='newpass';AUTH.msg='Choisis ton nouveau mot de passe.';AUTH.err='';setTimeout(()=>{if(!P.on)go('profile');},0);}
        const u=session?session.user:null;const was=this.user&&this.user.id;this.user=u;
        if(u&&u.id!==was)setTimeout(()=>this.onLogin(),0);
        else if(!u&&was)setTimeout(()=>this.onLogout(),0);
      });
      await this.sb.auth.getSession();
    }catch(e){}
    this.ready=true;this.refresh();
  },
  refresh(){if(!P.on)render();else renderChrome();},
  async onLogin(){
    const uid=this.user&&this.user.id;if(!uid)return;
    try{
      const [p,g]=await Promise.all([
        this.sb.from('profiles').select('username,created_at').eq('id',uid).maybeSingle(),
        this.sb.from('tagalog_progress').select('state,updated_at').eq('user_id',uid).maybeSingle()]);
      if(p.error||g.error)throw (p.error||g.error);
      this.profile=p.data||null;
      if(S.owner&&S.owner!==uid)resetLocal();
      const guest=!S.owner&&(S.xp>0||Object.keys(S.done).length>0);
      if(g.data&&g.data.state)mergeRemote(g.data.state);
      if(!S.name&&this.profile&&this.profile.username)S.name=this.profile.username;
      S.owner=uid;this.on=true;this.synced=true;this.offline=false;
      try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
      await this.flush();
      if(guest)toast('Ta progression a été ajoutée à ton compte.');
      this.loadHistory();
    }catch(e){this.offline=true;}
    this.refresh();
  },
  onLogout(){
    this.on=false;this.synced=false;this.profile=null;this.history=[];
    resetLocal();try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
    AUTH.mode='login';AUTH.confirmDel=false;AUTH.pwd=false;V.scrolled=false;this.refresh();
  },
  async pull(){
    if(!this.on||!this.user)return;
    try{const g=await this.sb.from('tagalog_progress').select('state').eq('user_id',this.user.id).maybeSingle();
      if(g.data&&g.data.state&&mergeRemote(g.data.state)){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}if(!P.on)render();this.push();}}catch(e){}
  },
  push(now){if(!this.on)return;clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),now?50:1500);},
  async flush(){
    if(!this.on||!this.user)return;
    if(this.writing){this.again=true;return;}
    this.writing=true;
    try{const r=await this.sb.from('tagalog_progress').upsert({user_id:this.user.id,state:JSON.parse(JSON.stringify(stripLocal(S)))},{onConflict:'user_id'});
      if(r.error)throw r.error;this.lastSync=Date.now();this.offline=false;}
    catch(e){this.offline=true;}
    this.writing=false;if(!P.on&&V.tab==='profile'){const s=$('#acctSync');if(s)s.outerHTML=syncPill();}
    if(this.again){this.again=false;this.flush();}
  },
  async log(id,mode,xp,acc){
    if(!this.on||!this.user)return;
    id=String(id||mode).toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,32);
    try{await this.sb.from('tagalog_history').insert({lesson_id:id,mode,xp:clamp(xp|0,0,200),accuracy:acc==null?null:clamp(acc|0,0,100)});this.loadHistory();}catch(e){}
  },
  async loadHistory(){
    if(!this.on||!this.user)return;
    try{const r=await this.sb.from('tagalog_history').select('lesson_id,mode,xp,accuracy,completed_at').order('completed_at',{ascending:false}).limit(10);
      if(!r.error){this.history=r.data||[];if(!P.on&&V.tab==='profile'){const h=$('#acctHist');if(h)h.outerHTML=historyPanel();}}}catch(e){}
  }
};
/* Remet l'état à zéro en gardant les réglages propres à l'appareil */
function resetLocal(){const keep=Object.assign({},S.set);S=defState();SYNC_SET.forEach(k=>delete keep[k]);Object.assign(S.set,keep);}
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')Cloud.pull();else if(Cloud.on)Cloud.flush();});

/* ---------- Interface du compte (Profil) ---------- */
function syncPill(){
  const last=Cloud.lastSync?new Date(Cloud.lastSync).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'';
  return `<span class="pill ${Cloud.offline?'bad':'ok'}" id="acctSync">${ic(Cloud.offline?'x':'check')}${Cloud.offline?'Hors ligne':'Synchronisé'+(last?' · '+last:'')}</span>`;
}
function acctMsgHtml(){return AUTH.err?`<div class="acct-msg bad">${esc(AUTH.err)}</div>`:AUTH.msg?`<div class="acct-msg ok">${esc(AUTH.msg)}</div>`:'';}
function acctSay(err,msg){AUTH.err=err||'';AUTH.msg=msg||'';const el=$('#acctMsg');if(el)el.innerHTML=acctMsgHtml();}
const pwField=(name,label,auto,hint)=>`<label>${label}<span class="pw"><input class="type-line" type="password" name="${name}" autocomplete="${auto}" ${auto==='new-password'?'minlength="8"':''} required><button type="button" class="pw-eye" aria-label="Afficher le mot de passe">Afficher</button></span>${hint?`<span class="hint-s">${hint}</span>`:''}</label>`;
function accountPanel(){
  if(!Cloud.available())return '';
  if(!Cloud.ready)return `<div class="panel acct"><span class="small muted">Connexion au serveur de comptes…</span></div>`;
  const msg=`<div id="acctMsg" role="status" aria-live="polite">${acctMsgHtml()}</div>`;
  if(Cloud.user){
    const nm=Cloud.name();
    return `<div class="panel acct">
      <div class="acct-head"><span class="avatar" aria-hidden="true">${esc(nm.slice(0,2).toUpperCase())}</span><div class="acct-id"><b>${esc(nm)}</b><span class="small muted">${esc(Cloud.user.email||'')}</span></div>${syncPill()}</div>
      ${msg}
      ${AUTH.mode==='newpass'||AUTH.pwd?`<form class="auth-form" data-form="newpass" novalidate>${pwField('password','Nouveau mot de passe','new-password','8 caractères minimum')}${pwField('password2','Confirme le mot de passe','new-password')}<div class="row-btns"><button class="btn primary sm" type="submit">Enregistrer</button><button class="btn sm" type="button" data-act="acct-cancel">Annuler</button></div></form>`:''}
      <div class="row-btns">${AUTH.pwd||AUTH.mode==='newpass'?'':`<button class="btn sm" data-act="acct-pwd">Changer le mot de passe</button>`}<button class="btn sm" data-act="acct-logout">Se déconnecter</button>${AUTH.confirmDel?'':`<button class="btn sm ghost" data-act="acct-del">Supprimer le compte…</button>`}</div>
      ${AUTH.confirmDel?`<div class="confirm"><b>Supprimer définitivement le compte « ${esc(nm)} » ?</b><span class="small">Le compte est commun avec l’Académie CMD &amp; PowerShell : profil, progression et historique des deux sites seront effacés du serveur.</span><div class="row-btns"><button class="btn sm bad" data-act="acct-del-yes">Oui, supprimer</button><button class="btn sm" data-act="acct-del-no">Annuler</button></div></div>`:''}
    </div>`;
  }
  const m=AUTH.mode==='signup'||AUTH.mode==='forgot'?AUTH.mode:'login';
  const tabs=`<div class="seg" role="group" aria-label="Compte"><button type="button" data-act="acct-mode" data-id="login" aria-pressed="${m==='login'}">Connexion</button><button type="button" data-act="acct-mode" data-id="signup" aria-pressed="${m==='signup'}">Créer un compte</button></div>`;
  let form='';
  if(m==='login')form=`<form class="auth-form" data-form="login" novalidate>
      <label>E-mail ou nom d’utilisateur<input class="type-line" type="text" name="login" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required></label>
      ${pwField('password','Mot de passe','current-password')}
      <button class="btn primary" type="submit">Se connecter</button>
      <button class="link-btn" type="button" data-act="acct-mode" data-id="forgot">Mot de passe oublié ?</button></form>`;
  else if(m==='signup')form=`<form class="auth-form" data-form="signup" novalidate>
      <label>Nom d’utilisateur<input class="type-line" type="text" name="username" autocomplete="username" autocapitalize="off" spellcheck="false" minlength="3" maxlength="24" required><span class="hint-s">3 à 24 caractères : lettres sans accent, chiffres, . _ -</span></label>
      <label>Adresse e-mail<input class="type-line" type="email" name="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required></label>
      ${pwField('password','Mot de passe','new-password','8 caractères minimum')}
      ${pwField('password2','Confirme le mot de passe','new-password')}
      <button class="btn primary" type="submit">Créer mon compte</button>
      ${S.xp>0||Object.keys(S.done).length?'<span class="small muted">Ta progression actuelle sera ajoutée à ton nouveau compte.</span>':''}</form>`;
  else form=`<form class="auth-form" data-form="forgot" novalidate>
      <label>Adresse e-mail du compte<input class="type-line" type="email" name="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required></label>
      <button class="btn primary" type="submit">Recevoir un lien</button>
      <button class="link-btn" type="button" data-act="acct-mode" data-id="login">Retour à la connexion</button></form>`;
  return `<div class="panel acct">
    <div class="acct-intro">${ic('cloud')}<div><b>Sauvegarde ta progression</b><span class="small muted">Retrouve-la sur tous tes appareils. Un seul compte pour Akademya Tagalog et l’Académie CMD &amp; PowerShell.</span></div></div>
    ${m==='forgot'?'':tabs}${msg}${form}</div>`;
}
const PRAC_FR={sent:'Phrases','jump-2':'Test de niveau','jump-3':'Test de niveau','jump-4':'Test de niveau','jump-5':'Test de niveau',srs:'Révision intelligente',weak:'Mots fragiles',mistakes:'Corriger mes erreurs',listen:'Écoute',conj:'Conjugaison',num:'Nombres',bay:'Baybayin'};
const MODE_FR={lesson:'Leçon',exam:'Épreuve',jump:'Test',practice:'Entraînement',mistakes:'Erreurs',story:'Histoire'};
function historyPanel(){
  if(!Cloud.on||!Cloud.history.length)return '<div id="acctHist"></div>';
  const byId={};FLOW.forEach(L=>{const U=UNITS.find(u=>u.id===L.id.split('-')[0]);byId[L.id]=U&&!/^sec/.test(L.id)?U.t+' · '+L.t:L.t;});STORIES.forEach(s=>{byId[s.id]='Histoire · '+s.t;});UNITS.forEach(u=>{byId[u.id]=u.t;});
  const fmt=t=>{const d=new Date(t);const same=ymd(d)===today();return same?'aujourd’hui '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  return `<div id="acctHist"><div class="section-h"><h2>Historique</h2><span class="small muted">Enregistré sur ton compte</span></div>
    <div class="panel hist">${Cloud.history.map(h=>{const t=byId[h.lesson_id]||PRAC_FR[h.lesson_id]||h.lesson_id;
      return `<div class="hist-row"><span class="tag">${MODE_FR[h.mode]||h.mode}</span><span class="hist-t">${esc(t)}</span><span class="small muted tnum">${h.accuracy!=null?h.accuracy+' % · ':''}+${h.xp} XP · ${fmt(h.completed_at)}</span></div>`;}).join('')}</div></div>`;
}
async function acctAction(act,id){
  if(act==='acct-go'){AUTH.mode=id||'signup';AUTH.err='';AUTH.msg='';go('profile');setTimeout(()=>{const a=$('.acct');if(a)a.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});},120);return;}
  if(act==='acct-mode'){AUTH.mode=id;AUTH.err='';AUTH.msg='';render();return;}
  if(act==='acct-pwd'){AUTH.pwd=true;AUTH.err='';AUTH.msg='';render();return;}
  if(act==='acct-cancel'){AUTH.pwd=false;if(AUTH.mode==='newpass')AUTH.mode='login';AUTH.err='';AUTH.msg='';render();return;}
  if(act==='acct-del'){AUTH.confirmDel=true;render();return;}
  if(act==='acct-del-no'){AUTH.confirmDel=false;render();return;}
  if(!Cloud.sb)return;
  if(act==='acct-logout'){try{await Cloud.flush();}catch(e){}await Cloud.sb.auth.signOut();toast('Déconnecté.');return;}
  if(act==='acct-del-yes'){
    const r=await Cloud.sb.functions.invoke('delete-account',{method:'POST'});
    if(r.error||!(r.data&&r.data.ok)){AUTH.confirmDel=false;render();acctSay(authErr((r.data&&r.data.error)||r.error));return;}
    Cloud.on=false;await Cloud.sb.auth.signOut();toast('Compte supprimé.');return;
  }
}
if(typeof document!=='undefined'){
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.pw-eye');if(!b)return;const i=b.previousElementSibling;if(!i)return;
    const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Masquer':'Afficher';b.setAttribute('aria-label',show?'Masquer le mot de passe':'Afficher le mot de passe');});
  document.addEventListener('submit',async e=>{
    const f=e.target.closest&&e.target.closest('form[data-form]');if(!f)return;
    e.preventDefault();if(!Cloud.sb||AUTH.busy)return;
    const kind=f.dataset.form;const fd=new FormData(f);const v=k=>String(fd.get(k)||'').trim();
    const btn=f.querySelector('button[type="submit"]');const label=btn?btn.textContent:'';
    const busy=b=>{AUTH.busy=b;if(btn){btn.disabled=b;btn.textContent=b?'Patiente…':label;}};
    const redirect=location.origin+location.pathname;
    acctSay('','');busy(true);
    try{
      if(kind==='login'){
        const idv=v('login'),pwd=String(fd.get('password')||'');
        if(!idv||!pwd){acctSay('Renseigne ton e-mail (ou nom d’utilisateur) et ton mot de passe.');return;}
        let email=idv;
        if(!idv.includes('@')){
          const q=await Cloud.sb.rpc('resolve_login',{p_login:idv,p_password:pwd});
          if(q.error){acctSay(authErr(q.error));return;}
          if(!q.data){acctSay('Identifiant ou mot de passe incorrect. Après 10 essais, ce nom d’utilisateur est bloqué 15 minutes.');return;}
          email=q.data;
        }
        const r=await Cloud.sb.auth.signInWithPassword({email,password:pwd});
        if(r.error){acctSay(authErr(r.error));return;}
        AUTH.mode='login';toast('Connecté. Progression synchronisée.');
      }else if(kind==='signup'){
        const u=v('username'),em=v('email'),pw=String(fd.get('password')||'');
        if(!/^[A-Za-z0-9._-]{3,24}$/.test(u)){acctSay('Nom d’utilisateur : 3 à 24 caractères, lettres sans accent, chiffres, point, tiret ou soulignement.');return;}
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){acctSay('Adresse e-mail invalide.');return;}
        if(pw.length<8){acctSay('Mot de passe : 8 caractères minimum.');return;}
        if(pw!==String(fd.get('password2')||'')){acctSay('Les deux mots de passe ne correspondent pas.');return;}
        const a=await Cloud.sb.rpc('username_available',{p_username:u});
        if(a.error){acctSay(authErr(a.error));return;}
        if(a.data===false){acctSay('Ce nom d’utilisateur est déjà pris.');return;}
        const r=await Cloud.sb.auth.signUp({email:em,password:pw,options:{data:{username:u},emailRedirectTo:redirect}});
        if(r.error){acctSay(authErr(r.error));return;}
        if(r.data&&r.data.user&&Array.isArray(r.data.user.identities)&&r.data.user.identities.length===0){acctSay('Un compte existe déjà avec cette adresse e-mail.');return;}
        if(!r.data.session){AUTH.mode='login';render();acctSay('','Compte créé. Ouvre le lien de confirmation reçu par e-mail, puis connecte-toi ici.');return;}
        toast('Compte créé. Mabuhay, '+u+' !');
      }else if(kind==='forgot'){
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))){acctSay('Adresse e-mail invalide.');return;}
        const r=await Cloud.sb.auth.resetPasswordForEmail(v('email'),{redirectTo:redirect});
        if(r.error){acctSay(authErr(r.error));return;}
        acctSay('','Si un compte existe pour cette adresse, un lien vient d’être envoyé. Pense à vérifier les indésirables.');
      }else if(kind==='newpass'){
        const p1=String(fd.get('password')||''),p2=String(fd.get('password2')||'');
        if(p1.length<8){acctSay('Mot de passe : 8 caractères minimum.');return;}
        if(p1!==p2){acctSay('Les deux mots de passe ne correspondent pas.');return;}
        const r=await Cloud.sb.auth.updateUser({password:p1});
        if(r.error){acctSay(authErr(r.error));return;}
        AUTH.pwd=false;AUTH.mode='login';render();acctSay('','Mot de passe modifié.');
      }
    }catch(err){acctSay(authErr(err));}
    finally{busy(false);}
  });
}
