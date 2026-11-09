/* =========================================================
   01f — Ciel animé : un petit shader WebGL derrière l'en-tête (.hero) de l'onglet affiché
   Suit la météo d'Araw (soleil, nuages, pluie, orage, neige, brouillard, vent, nuit),
   le thème clair / sombre et le mode anniversaire. Une seule toile, déplacée d'un onglet à l'autre.
   Économie : 30 i/s sur écran tactile, pause hors écran, onglet caché ou leçon ouverte ;
   image fixe si les animations sont coupées ; dégradé CSS si WebGL est absent.
   ========================================================= */
/* t/b : haut/bas du ciel · c : nuages · cc : couleur des nuages · r : pluie · s : neige · st : étoiles
   f : brume · g : halo autour d'Araw · gc : couleur du halo · w : vent (vitesse des nuages) · dk : ciel sombre */
const SKY_PAL={
  sun:     {t:'#4FA8F7',b:'#BFE3FF',c:.16,cc:'#FFFFFF',g:.9, gc:'#FFE6A0',w:1},
  hot:     {t:'#3E9BEF',b:'#FFD7A3',c:.05,cc:'#FFFFFF',g:1.25,gc:'#FFC060',w:.6},
  cloud:   {t:'#6AACE8',b:'#D5E7F9',c:.48,cc:'#FFFFFF',g:.55,gc:'#FFE6A0',w:1.2},
  overcast:{t:'#8F9FB5',b:'#D2DAE5',c:.85,cc:'#E8EDF3',g:.12,gc:'#FFF4D6',w:.9},
  fog:     {t:'#B5BFCC',b:'#E3E7ED',c:.3, cc:'#EEF1F5',f:1,g:.18,gc:'#FFF4D6',w:.6},
  rain:    {t:'#7A8CA6',b:'#C3CEDC',c:.8, cc:'#A7B4C6',r:1,g:.05,gc:'#FFF4D6',w:1.6},
  storm:   {t:'#2B344B',b:'#525E78',c:.9, cc:'#66728B',r:1.3,g:0,gc:'#FFF4D6',w:2.4,dk:1},
  snow:    {t:'#A5BAD3',b:'#EDF2F8',c:.6, cc:'#F4F7FB',s:1,g:.15,gc:'#FFF4D6',w:.7},
  cold:    {t:'#8BBDEA',b:'#E5F1FB',c:.22,cc:'#FFFFFF',g:.4, gc:'#FFF3CF',w:.8},
  wind:    {t:'#57A6EC',b:'#CDE5F9',c:.42,cc:'#FFFFFF',g:.5, gc:'#FFE6A0',w:4.5},
  night:   {t:'#0A1230',b:'#2A3270',c:.14,cc:'#39437A',st:1,g:.3,gc:'#FFD27A',w:.5,dk:1},
  bday:    {t:'#FF8DB6',b:'#FFE0EB',c:.3, cc:'#FFFFFF',g:.85,gc:'#FFD9E6',w:1}
};
const SKY={cv:null,gl:null,u:null,host:null,ro:null,io:null,raf:0,run:false,seen:true,cur:null,tgt:null,
  prev:0,clock:12,drift:0,flash:0,flashT:-1,nextFlash:3,burst:0,sun:[0,0],fail:false,
  coarse:!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches)};
const SKY_VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const SKY_FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes,uSun;uniform float uT,uDrift;uniform vec3 uTop,uBot,uCC,uGC;uniform vec4 uP1,uP2;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.02+vec2(17.1,9.3);a*=.5;}return v;}
void main(){
  vec2 fc=gl_FragCoord.xy,uv=fc/uRes,p=fc/uRes.y;float dpr=uP2.w;
  vec3 c=mix(uBot,uTop,smoothstep(0.,1.,uv.y));
  if(uP1.w>.01){vec2 g=fc/(dpr*9.),id=floor(g);float r=h(id);
    if(r>.93){vec2 o=fract(g)-.5-(vec2(h(id+3.1),h(id+7.7))-.5)*.5;
      float tw=.55+.45*sin(uT*(.8+r*2.5)+r*60.);
      c+=uP1.w*(1.-smoothstep(0.,.16,length(o)))*tw*(.45+.55*uv.y)*vec3(1.,.96,.88);}}
  vec2 d=(fc-uSun)/uRes.y;float L=length(d);
  float ray=pow(.5+.5*sin(atan(d.y,d.x)*10.+uT*.22),3.)*exp(-L*2.4)*.22;
  c=mix(c,uGC,clamp(uP2.y*(.6*exp(-L*L*12.)+.25*exp(-L*3.6)+ray)*.62,0.,.7));
  if(uP1.x>.01){float cov=1.-uP1.x;vec2 q=p*vec2(1.3,2.6)+vec2(uDrift,0.);
    float a=fbm(q),b=fbm(p*vec2(2.6,4.4)+vec2(uDrift*1.8+5.2,1.3)),sh=fbm(q+vec2(-.06,-.1));
    float k1=smoothstep(cov,cov+.22,a),k2=smoothstep(cov+.04,cov+.3,b);
    vec3 cc=uCC*(.84+.2*clamp((a-sh)*4.+.5,0.,1.));
    c=mix(c,cc,k2*.55);c=mix(c,cc,k1*.9);}
  if(uP2.x>.01){float f=fbm(vec2(p.x*1.4-uT*.035,p.y*5.));
    c=mix(c,uCC,uP2.x*(1.-smoothstep(0.,.75,uv.y))*(.3+.5*f));}
  if(uP1.y>.01){float r=0.;vec2 q=fc/dpr;q.x+=q.y*.2;
    for(int k=0;k<2;k++){float fk=float(k),w=7.-3.*fk,id=floor(q.x/w),rn=h(vec2(id,fk*7.3+1.));
      float fy=fract((q.y+uT*(640.-260.*fk+rn*160.))/(90.+rn*110.)+rn),dx=abs(fract(q.x/w)-.5)*w;
      r+=step(.75-.45*min(uP1.y,1.2),rn)*(1.-smoothstep(.1,.9,dx))*(1.-smoothstep(0.,.2,fy))*(1.-.45*fk);}
    c=mix(c,vec3(.94,.97,1.),clamp(r,0.,1.)*(.22+.08*uP1.y));}
  if(uP1.z>.01){float s=0.;
    for(int k=0;k<2;k++){float fk=float(k);vec2 q=fc/((34.-12.*fk)*dpr);q.y+=uT*(.55-.2*fk);
      vec2 id=floor(q);float rn=h(id+fk*5.);
      vec2 ce=vec2(.25+.5*h(id+.3)+.1*sin(uT*1.2+rn*6.28),.25+.5*h(id+.7));
      float rad=(.08+.06*rn)*(1.-.35*fk);
      s+=step(.35,rn)*(1.-smoothstep(rad*.45,rad,length(fract(q)-ce)))*(1.-.4*fk);}
    c=mix(c,vec3(1.),clamp(s,0.,1.)*.9*min(uP1.z,1.));}
  c+=vec3(.92,.94,1.)*uP2.z*(.35+.45*uv.y);
  c+=(h(fc+fract(uT))-.5)/170.;
  gl_FragColor=vec4(c,1.);
}`;
const hex3=x=>{const v=parseInt(x.slice(1),16);return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255];};
const mix3=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
const css3=a=>'rgb('+a.map(v=>Math.round(Math.max(0,Math.min(1,v))*255)).join(',')+')';
function skyDarkTheme(){
  const t=document.documentElement.getAttribute('data-theme');
  if(t==='dark')return true;if(t==='light')return false;
  try{return matchMedia('(prefers-color-scheme: dark)').matches;}catch(e){return false;}
}
function skyTarget(){
  const st=(typeof bdayOn==='function'&&bdayOn())?'bday':wxNow();
  const p=SKY_PAL[st]||SKY_PAL.sun,dt=skyDarkTheme();
  let top=hex3(p.t),bot=hex3(p.b),cc=hex3(p.cc),g=p.g||0;
  if(dt&&!p.dk){const bg=hex3('#0C1323');top=mix3(top,bg,.66);bot=mix3(bot,bg,.74);cc=mix3(cc,bg,.6);g*=.7;}
  return {st,dark:dt||!!p.dk,top,bot,cc,gc:hex3(p.gc||'#FFE6A0'),v:[p.c||0,p.r||0,p.s||0,p.st||0,p.f||0,g,p.w||1]};
}
const skyCopy=t=>({st:t.st,dark:t.dark,top:t.top.slice(),bot:t.bot.slice(),cc:t.cc.slice(),gc:t.gc.slice(),v:t.v.slice()});
function skyInit(){
  if(SKY.gl)return true;if(SKY.fail)return false;
  try{
    const cv=document.createElement('canvas');cv.className='sky-cv';cv.setAttribute('aria-hidden','true');
    const gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
    if(!gl)throw new Error('webgl');
    const sh=(type,src)=>{const o=gl.createShader(type);gl.shaderSource(o,src);gl.compileShader(o);
      if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,SKY_VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,SKY_FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    SKY.u={};['uRes','uSun','uT','uDrift','uTop','uBot','uCC','uGC','uP1','uP2'].forEach(k=>{SKY.u[k]=gl.getUniformLocation(pr,k);});
    /* Contexte perdu (GPU réinitialisé, appli en arrière-plan sur iOS…) : on repart d'une toile neuve */
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();skyStop();cv.remove();SKY.gl=null;SKY.cv=null;setTimeout(()=>{if(SKY.host&&SKY.host.isConnected)skyMount();},1200);},false);
    SKY.cv=cv;SKY.gl=gl;return true;
  }catch(e){SKY.fail=true;return false;}
}
function skySize(){
  const h=SKY.host,cv=SKY.cv;if(!h||!cv)return;
  const r=h.getBoundingClientRect(),s=Math.min(window.devicePixelRatio||1,SKY.coarse?1.5:2);
  const W=Math.max(1,Math.round(r.width*s)),H=Math.max(1,Math.round(r.height*s));
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  SKY.dpr=s;
  const m=h.querySelector('svg.m');
  if(m){const q=m.getBoundingClientRect();SKY.sun=[(q.left+q.width/2-r.left)*s,(r.bottom-(q.top+q.height*.53))*s];}
  else SKY.sun=[W*.15,H*.6];
  if(SKY.gl)SKY.gl.viewport(0,0,W,H);
}
/* Éclairs d'orage : deux flashs au plus par coup (sous la limite de 3 par seconde), toutes les 5 à 12 s */
function skyFlash(dt){
  if(SKY.tgt.st!=='storm'||reduced()){SKY.flash=0;SKY.flashT=-1;return;}
  if(SKY.flashT<0){SKY.nextFlash-=dt;if(SKY.nextFlash<=0){SKY.flashT=0;SKY.nextFlash=5+Math.random()*7;}SKY.flash=0;return;}
  SKY.flashT+=dt;const t=SKY.flashT;
  SKY.flash=.75*Math.exp(-t*22)+(t>.2?.45*Math.exp(-(t-.2)*16):0);
  if(t>.8){SKY.flashT=-1;SKY.flash=0;}
}
function skyDraw(dt,snap){
  const gl=SKY.gl,u=SKY.u,cv=SKY.cv;if(!gl||!cv||!SKY.tgt)return;
  const c=SKY.cur,t=SKY.tgt,k=snap?1:1-Math.exp(-dt*2.2);
  ['top','bot','cc','gc'].forEach(n=>{for(let i=0;i<3;i++)c[n][i]+=(t[n][i]-c[n][i])*k;});
  for(let i=0;i<c.v.length;i++)c.v[i]+=(t.v[i]-c.v[i])*k;
  SKY.clock=(SKY.clock+dt)%1000;SKY.drift=(SKY.drift+dt*.012*c.v[6])%1000;
  skyFlash(dt);SKY.burst*=Math.exp(-dt*2.6);
  const v=c.v;
  gl.uniform2f(u.uRes,cv.width,cv.height);gl.uniform2f(u.uSun,SKY.sun[0],SKY.sun[1]);
  gl.uniform1f(u.uT,SKY.clock);gl.uniform1f(u.uDrift,SKY.drift);
  gl.uniform3fv(u.uTop,c.top);gl.uniform3fv(u.uBot,c.bot);gl.uniform3fv(u.uCC,c.cc);gl.uniform3fv(u.uGC,c.gc);
  gl.uniform4f(u.uP1,v[0],v[1],v[2],v[3]);gl.uniform4f(u.uP2,v[4],v[5]*(1+SKY.burst*.9),SKY.flash,SKY.dpr||1);
  gl.drawArrays(gl.TRIANGLES,0,3);
}
function skyCanRun(){return !!(SKY.gl&&SKY.host&&SKY.host.isConnected&&SKY.seen&&!document.hidden&&!(P&&P.on)&&!reduced());}
function skyLoop(now){
  SKY.raf=0;if(!SKY.run)return;
  if(!skyCanRun()){SKY.run=false;return;}
  const dt=SKY.prev?Math.min(.1,(now-SKY.prev)/1000):0;
  if(SKY.prev&&dt<(SKY.coarse?1/31:1/61)){SKY.raf=requestAnimationFrame(skyLoop);return;}
  SKY.prev=now;skyDraw(dt);
  SKY.raf=requestAnimationFrame(skyLoop);
}
function skyStop(){SKY.run=false;if(SKY.raf)cancelAnimationFrame(SKY.raf);SKY.raf=0;}
function skyStart(){
  if(!SKY.gl||!SKY.host)return;
  if(!skyCanRun()){skyStop();if(SKY.host.isConnected)skyDraw(0,reduced());return;}
  if(SKY.run)return;
  SKY.run=true;SKY.prev=0;SKY.raf=requestAnimationFrame(skyLoop);
}
/* Toucher Araw : petit saut, « boing », le halo du ciel pulse */
function haptic(p){try{if(S.set.sfx&&navigator.vibrate)navigator.vibrate(p);}catch(e){}}
function arawPoke(e){
  const m=e.currentTarget;
  SFX.play([587.33,880],'sine',.09,.07);haptic(8);
  if(reduced())return;
  SKY.burst=1;
  animIn(m,[{transform:'none'},{transform:'translateY(-14px) scale(1.06,.94)',offset:.35},{transform:'translateY(0) scale(.95,1.06)',offset:.7},{transform:'none'}],{duration:520,easing:'ease-out'});
}
/* Appelé après chaque rendu : installe le ciel dans l'en-tête de l'onglet affiché */
function skyMount(){
  const host=$('#main .hero');
  if(SKY.host!==host){if(SKY.ro)SKY.ro.disconnect();if(SKY.io)SKY.io.disconnect();SKY.ro=SKY.io=null;}
  SKY.host=host;
  if(!host){skyStop();return;}
  const t=skyTarget();SKY.tgt=t;if(!SKY.cur)SKY.cur=skyCopy(t);
  if(t.st!=='storm'){SKY.flash=0;SKY.flashT=-1;SKY.nextFlash=2+Math.random()*3;}
  host.classList.add('sky');host.classList.toggle('sky-dark',t.dark);
  host.style.setProperty('--sky-t',css3(t.top));host.style.setProperty('--sky-b',css3(t.bot));
  const m=$('svg.m',host);if(m&&!m.dataset.poke){m.dataset.poke=1;m.addEventListener('click',arawPoke);}
  if(!skyInit())return;
  if(SKY.cv.parentNode!==host)host.insertBefore(SKY.cv,host.firstChild);
  if(!SKY.ro&&window.ResizeObserver){SKY.ro=new ResizeObserver(()=>{skySize();if(!SKY.run)skyDraw(0,true);});SKY.ro.observe(host);}
  if(!SKY.io&&window.IntersectionObserver){SKY.io=new IntersectionObserver(es=>{SKY.seen=es[es.length-1].isIntersecting;if(SKY.seen)skyStart();else skyStop();});SKY.io.observe(host);}
  skySize();skyDraw(0,false);skyStart();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)skyStop();else skyStart();});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(SKY.host&&SKY.host.isConnected)skyMount();});}catch(e){}
try{matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(SKY.host&&SKY.host.isConnected)skyMount();});}catch(e){}
