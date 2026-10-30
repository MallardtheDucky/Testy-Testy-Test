(()=>{
const D=window.PH,NS='http://www.w3.org/2000/svg',$=s=>document.querySelector(s);
const svg=$('#map'),gSea=$('#sea'),gLand=$('#land'),gSub=$('#sub'),gTown=$('#town'),gLab=$('#labs'),tip=$('#tip'),panel=$('#panel');
const WASH=['#8f9fe0','#efd37c','#e99aa5','#8cc499','#68a9b8','#f0b692','#b9a3d8','#ece2c9'],KM=111/420,K=Math.cos(12.5*Math.PI/180);
const R=D.regions,P=D.provinces,T=D.towns,N=x=>x.toLocaleString('en');
const TG=window.PH_TAGS||{r:[],p:[],t:[]};let TAGMODE=false;
R.forEach((u,i)=>{u.i=i;u.tag=(TG.r[i]||[''])[0]});P.forEach((u,i)=>{u.i=i;u.tag=(TG.p[i]||[''])[0]});T.forEach((u,i)=>{u.i=i;u.tag=(TG.t[i]||[''])[0]});
const ringPath=r=>{let s='',first=true;for(const i of r){const rev=i<0,a=D.arcs[rev?~i:i],n=a.length>>1;
 for(let j=first?0:1;j<n;j++){const q=rev?n-1-j:j;s+=(first&&j===0?'M':'L')+a[2*q]+' '+a[2*q+1]+' '}first=false}return s+'Z'};
[R,P,T].forEach(arr=>arr.forEach(u=>u.d=u.g.map(ringPath).join('')));D.coast=D.cg.map(ringPath).join('');
const thin=(a,e)=>{const n=a.length>>1,keep=new Uint8Array(n);keep[0]=keep[n-1]=1;const st=[[0,n-1]];if(a[0]===a[2*n-2]&&a[1]===a[2*n-1]&&n>3){const m=n>>1;keep[m]=1;st[0]=[0,m];st.push([m,n-1])}
 while(st.length){const[s,t]=st.pop();if(t<=s+1)continue;const x1=a[2*s],y1=a[2*s+1],dx=a[2*t]-x1,dy=a[2*t+1]-y1,L=Math.hypot(dx,dy)||1;let m=-1,mi=0;
  for(let i=s+1;i<t;i++){const d=Math.abs(dy*(a[2*i]-x1)-dx*(a[2*i+1]-y1))/L;if(d>m){m=d;mi=i}}
  if(m>e){keep[mi]=1;st.push([s,mi],[mi,t])}}
 const o=[];for(let i=0;i<n;i++)if(keep[i])o.push(a[2*i],a[2*i+1]);return o};
const LV=[0,.15,.4,1,2.5,6],arcL=LV.map(()=>({})),ringL=LV.map(()=>[]);
const ringAt=(l,ri)=>ringL[l][ri]||(ringL[l][ri]=(r=>{let s='',first=true;for(const i of r){const rev=i<0,k=rev?~i:i,a=l?(arcL[l][k]||(arcL[l][k]=thin(D.arcs[k],LV[l]))):D.arcs[k],n=a.length>>1;
 for(let j=first?0:1;j<n;j++){const q=rev?n-1-j:j;s+=(first&&j===0?'M':'L')+a[2*q]+' '+a[2*q+1]+' '}first=false}return s+'Z'})(D.cg[ri]));
const RB=D.cg.map(r=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const i of r){const a=D.arcs[i<0?~i:i];for(let j=0;j<a.length;j+=2){const x=a[j],y=a[j+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}return[x0,y0,x1,y1]});
const CA=[...new Set(D.cg.flat().map(i=>i<0?~i:i))],AB=CA.map(k=>{const a=D.arcs[k];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let j=0;j<a.length;j+=2){const x=a[j],y=a[j+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return[x0,y0,x1,y1]}),arcStr=[];
const arcAt=(l,k)=>{const c=arcStr[l]||(arcStr[l]={});return c[k]||(c[k]=(a=>{let s='M'+a[0]+' '+a[1];for(let j=2;j<a.length;j+=2)s+='L'+a[j]+' '+a[j+1];return s})(l?(arcL[l][k]||(arcL[l][k]=thin(D.arcs[k],LV[l]))):D.arcs[k]))};
let coastKey='',strokeKey='';function coastLOD(u){let l=0;for(let k=LV.length-1;k>0;k--)if(LV[k]<=.5*u){l=k;break}
 {const[vx,vy,vw,vh]=vb,m=30*u,v=[];for(let i=0;i<CA.length;i++){const b=AB[i];if(b[0]<vx+vw+m&&b[2]>vx-m&&b[1]<vy+vh+m&&b[3]>vy-m)v.push(CA[i])}
  const k=l+':'+v.join(',');if(k!==strokeKey){strokeKey=k;COASTA.setAttribute('d',v.map(i=>arcAt(l,i)).join(''))}}
 const[vx,vy,vw,vh]=vb,m=60*u,v=[];for(let i=0;i<RB.length;i++){const b=RB[i];if(b[0]<vx+vw+m&&b[2]>vx-m&&b[1]<vy+vh+m&&b[3]>vy-m)v.push(i)}
 const k=l+':'+v.join(',');if(k===coastKey)return;coastKey=k;COASTV.setAttribute('d',v.map(i=>ringAt(l,i)).join(''))}
const AP=[],arcPath=k=>AP[k]||(AP[k]=(a=>{let s='M'+a[0]+' '+a[1];for(let j=2;j<a.length;j+=2)s+='L'+a[j]+' '+a[j+1];return s})(D.arcs[k]));
R.forEach(r=>r.kids=[]);P.forEach((p,i)=>{p.kids=[];R[p.r].kids.push(i)});T.forEach((t,i)=>P[t.p].kids.push(i));
const mk=(tag,a,par)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);par&&par.appendChild(e);return e};
const pt=(lon,lat)=>[(lon-116.5)*K*420,(21.5-lat)*420];
const colors=bs=>{const o=[],use=WASH.map(()=>0);bs.forEach((a,i)=>{const u=new Set();for(let j=0;j<i;j++){const b=bs[j];if(a[0]<b[2]+8&&a[2]>b[0]-8&&a[1]<b[3]+8&&a[3]>b[1]-8)u.add(o[j])}let c=0,best=1e9;for(let k=0;k<WASH.length;k++)if(!u.has(k)&&use[k]<best){best=use[k];c=k}use[c]++;o.push(c)});return o};
let SW=1,SH=1;const measure=()=>{SW=svg.clientWidth;SH=svg.clientHeight};measure();
let mt,raf=0,pend=null;const moving=()=>{svg.classList.add('moving');clearTimeout(mt);mt=setTimeout(()=>svg.classList.remove('moving'),200)};
const queue=v=>{pend=v;if(!raf)raf=requestAnimationFrame(()=>{raf=0;const p=pend;pend=null;setVB(p)})};
let CV=true;
let sel={r:null,p:null,t:null},vb=[0,0,D.w,D.h],labels=[],anim=0,moved=false;
const world=()=>{const m=260;return[-m,-m,D.w+2*m,D.h+2*m]};

const gr=mk('g',{fill:'none',stroke:'#5a3f16','stroke-width':.7,'stroke-opacity':.2,'vector-effect':'non-scaling-stroke'},gSea);
const FRM=window.PH_TRADE.frame;
for(let lo=96;lo<=142;lo+=2){const x=pt(lo,0)[0];if(x>=FRM[0]&&x<=FRM[2])mk('path',{d:`M${x} ${FRM[1]}V${FRM[3]}`,'vector-effect':'non-scaling-stroke'},gr)}
for(let la=-2;la<=30;la+=2){const y=pt(0,la)[1];if(y>=FRM[1]&&y<=FRM[3])mk('path',{d:`M${FRM[0]} ${y}H${FRM[2]}`,'vector-effect':'non-scaling-stroke'},gr)}
mk('path',{id:'coast',d:D.coast,'fill-rule':'evenodd','vector-effect':'non-scaling-stroke'},gSea);
const GLOW=mk('image',{href:'assets/glow.png',x:FRM[0],y:FRM[1],width:FRM[2]-FRM[0],height:FRM[3]-FRM[1],'pointer-events':'none',preserveAspectRatio:'none'},gSea);
mk('use',{href:'#coast',fill:'#e8d9ad',stroke:'none'},gSea);

const gNb=mk('g',{id:'nb','pointer-events':'none'});svg.insertBefore(gNb,$('#lanes'));
const NBD=(window.PH_NB||[]).map(n=>n.d).join('');
const COASTA=mk('path',{id:'coastA','vector-effect':'non-scaling-stroke',fill:'none'},svg.querySelector('defs')),COASTV=mk('path',{id:'coastV','fill-rule':'evenodd','vector-effect':'non-scaling-stroke'},svg.querySelector('defs'));
mk('path',{id:'fcoast',d:NBD,'fill-rule':'evenodd','vector-effect':'non-scaling-stroke'},svg.querySelector('defs'));
mk('use',{href:'#fcoast',fill:'#e8d9ad',stroke:'none'},gNb);
(window.PH_NB||[]).forEach(n=>mk('path',{d:n.d,fill:n.c,'fill-opacity':.62,'fill-rule':'evenodd'},gNb));
mk('use',{class:'tex',href:'#fcoast',fill:'url(#landtex)',stroke:'none',style:'mix-blend-mode:multiply'},gNb);
mk('use',{href:'#fcoast',fill:'none',stroke:'#2e200e','stroke-width':1,'stroke-opacity':.7,'stroke-linejoin':'round'},gNb);

const gShore=mk('g',{id:'shore','pointer-events':'none'});svg.insertBefore(gShore,gLab);
(mk('use',{class:'tex tex-ph',href:'#coastV',fill:'url(#landtex)',stroke:'none',style:'mix-blend-mode:multiply'},gShore));
const INNER=mk('image',{href:'assets/inner.png',x:FRM[0],y:FRM[1],width:FRM[2]-FRM[0],height:FRM[3]-FRM[1],'pointer-events':'none',preserveAspectRatio:'none'},gShore);
(mk('use',{href:'#coastA',fill:'none',stroke:'#2e200e','stroke-width':1.4,'stroke-linejoin':'round','stroke-opacity':.92},gShore));
const gLnP=mk('g',{id:'lnP',class:'ln'}),gLnL=mk('g',{id:'lnL',class:'ln'}),gLnS=mk('g',{id:'lnS',class:'ln'}),gLnT=mk('g',{id:'lnT',class:'ln'});
svg.insertBefore(gLnP,gSub);svg.insertBefore(gLnL,gSub);svg.insertBefore(gLnS,gTown);svg.insertBefore(gLnT,gShore);

const TR=window.PH_TRADE,gLanes=$('#lanes');
function smooth(p){let d=`M${p[0][0]} ${p[0][1]}`;
 const cap=(vx,vy,L)=>{const m=Math.hypot(vx,vy),k=m>L?L/m:1;return[vx*k,vy*k]};
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c,L=Math.hypot(c[0]-b[0],c[1]-b[1])/3,
  [h1,h2]=cap((c[0]-a[0])/6,(c[1]-a[1])/6,L),[h3,h4]=cap((e[0]-b[0])/6,(e[1]-b[1])/6,L);
  d+=`C${b[0]+h1} ${b[1]+h2} ${c[0]-h3} ${c[1]-h4} ${c[0]} ${c[1]}`}return d}
function sampled(p){const o=[];for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c,
 x1=b[0]+(c[0]-a[0])/6,y1=b[1]+(c[1]-a[1])/6,x2=c[0]-(e[0]-b[0])/6,y2=c[1]-(e[1]-b[1])/6;
 for(let k=0;k<12;k++){const t=k/12,m=1-t;o.push([m*m*m*b[0]+3*m*m*t*x1+3*m*t*t*x2+t*t*t*c[0],m*m*m*b[1]+3*m*m*t*y1+3*m*t*t*y2+t*t*t*c[1]])}}
 o.push(p[p.length-1]);return o}
TR.lanes.forEach(l=>mk('path',{d:smooth(l.p),class:'k'+l.k},gLanes));
const OUT=TR.out.map(o=>({t:o.t,pts:sampled(o.pts)}));
const NODES=TR.nodes.map(n=>mk('circle',{cx:n.x,cy:n.y,class:n.t},gLanes));
const LABW={hub:2600,open:2300,coast:1700,foreign:2600},RAD={hub:7,open:5.5,coast:3.6,foreign:4.5},MINW={hub:1e9,open:4200,coast:2300,foreign:1e9};
const gPorts=mk('g',{id:'ports','pointer-events':'none'},svg);
const XT={};(TG.x||[]).forEach(x=>XT[x[1]]=x[0]);
const OD={'Hacia Hong Kong':'Hong Kong','Hacia Singapur y Suez':'Singapur','Hacia el Japón':'Japón','Hacia América':'América','Hacia las Indias Neerlandesas':'Indias Neerlandesas','Hacia España, por Suez':'España'};
const PORTS=TR.nodes.map(n=>{const e=mk('text',{class:'port '+n.t},gPorts);e.textContent=n.n;return{e,n,tag:XT[n.n]||'',m:n.n}});
const TAGS=OUT.map(o=>{const e=mk('text',{class:'tag'},gPorts);e.textContent=XT[OD[o.t]]||o.t;return e});
function placeTrade(u){
 const bx=[];
 PORTS.forEach(P=>{const {e,n}=P,w=n.a==='end',fs=({hub:15,open:13.5,coast:12,foreign:12.5})[n.t]*u,off=(RAD[n.t]+4)*u,full=vb[2]<=LABW[n.t],txt=full&&P.tag?n.n+' · '+P.tag:(full?n.n:P.tag),len=txt.length*fs*(full?.5:.62);
  if(P.m!==txt){P.m=txt;e.textContent=txt}e.classList.toggle('tg3',!full);
  let show=full;/* trade names and tags only appear when zoomed in */e.setAttribute('font-size',fs);e.setAttribute('text-anchor',w?'end':'start');e.setAttribute('x',n.x+(w?-off:off));e.setAttribute('y',n.y+fs*.32);
  if(show){const x0=w?n.x-off-len:n.x+off,b=[x0,n.y-fs*.7,x0+len,n.y+fs*.7];if(bx.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))show=false;else bx.push(b)}
  e.style.display=show?'':'none'});
 const [vx,vy,vw,vh]=vb,x1=vx+vw,y1=vy+vh,ins=p=>p[0]>=vx&&p[0]<=x1&&p[1]>=vy&&p[1]<=y1,fs=13*u;
 OUT.forEach((o,i)=>{const e=TAGS[i],P=o.pts;let h=null,side='';
  for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1];if(ins(a)&&!ins(b)){
   const dx=b[0]-a[0],dy=b[1]-a[1];let t=1,s='';
   if(dx>0&&(x1-a[0])/dx<t){t=(x1-a[0])/dx;s='r'}else if(dx<0&&(vx-a[0])/dx<t){t=(vx-a[0])/dx;s='l'}
   if(dy>0&&(y1-a[1])/dy<t){t=(y1-a[1])/dy;s='b'}else if(dy<0&&(vy-a[1])/dy<t){t=(vy-a[1])/dy;s='t'}
   h=[a[0]+dx*t,a[1]+dy*t];side=s}}
  if(!h&&ins(P[P.length-1])){h=P[P.length-1];side='e'}
  if(!h||vw<1400||vw>2600){e.style.display='none';return}
  e.style.display='';e.setAttribute('font-size',fs);
  const len=o.t.length*fs*.58,right=side==='r';let x=h[0]+(right?-1:1)*10*u,y=h[1]+(side==='t'?16*u:-8*u);
  e.setAttribute('text-anchor',right?'end':'start');
  x=right?Math.max(x,vx+len+6*u):Math.min(Math.max(x,vx+6*u),x1-len-6*u);y=Math.min(Math.max(y,vy+16*u),y1-8*u);
  e.setAttribute('x',x);e.setAttribute('y',y)})}

function lines(g,lvl,S,hi){
 const u=t=>lvl===0?t:lvl===1?T[t].p:P[T[t].p].r;let h='',l='';
 D.ao.forEach((o,k)=>{if(o[0]<0||o[1]<0)return;const a=u(o[0]),b=u(o[1]);if(a===b)return;if(S&&!S.has(a)&&!S.has(b))return;
  if(hi==null||hi===a||hi===b)h+=arcPath(k);else l+=arcPath(k)});
 g.innerHTML='';if(l)mk('path',{d:l,class:'lo'},g);if(h)mk('path',{d:h},g)}

function shapes(g,items,idxs,kind,cls){
 const col=colors(idxs.map(i=>items[i].b));
 idxs.forEach((i,k)=>{const it=items[i];const e=mk('path',{d:it.d,fill:WASH[col[k]],'data-k':kind,'data-i':i},g);it.el=e});
}
const CTY=window.PH_C;let gCty=null;
if(CTY){gCty=mk('g',{id:'cty','pointer-events':'none',fill:'none','stroke-linejoin':'round'});svg.insertBefore(gCty,gLand);
 mk('path',{d:CTY.d,stroke:'#fff3c4','stroke-width':11,'stroke-opacity':.28,'vector-effect':'non-scaling-stroke'},gCty);
 mk('path',{d:CTY.d,stroke:'#f4d98a','stroke-width':4.5,'stroke-opacity':.5,'vector-effect':'non-scaling-stroke'},gCty);}
const FOR=[['Formosa',121.0,23.9,130],['Imperio Chino',117.4,24.9,120],['Borneo Británico',117.0,5.5,95],['Borneo Holandés',116.9,2.3,130],['Sarawak',113.9,3.2,90],['Indias Neerlandesas · Célebes',121.8,1.3,110]].map(([t,lo,la,fs])=>({t,xy:pt(lo,la),fs,rot:0,nb:1}));
const SEAS=[['Océano Pacífico',127.0,13.4,250,-80],['Mar de la China',117.0,13.0,250,-80],['Mar de Joló',119.9,9.0,140,-32],['Mar de Célebes',123.4,5.6,115,0]].map(([t,lo,la,fs,rot])=>({t,xy:pt(lo,la),fs,rot}));

const CCOL='#b98507',COUNTRY='Filipinas',gCountry=mk('g',{id:'country','pointer-events':'none'},svg);svg.insertBefore(gCountry,gLab);
const CPATH=mk('path',{id:'cspline',fill:'none'},svg.querySelector('defs'));
const CTX=mk('text',{class:'ctry'},gCountry),CTP=mk('textPath',{href:'#cspline',startOffset:'50%','text-anchor':'middle'},CTX),CMEAS=mk('text',{class:'ctry',visibility:'hidden'},gCountry);
CTP.textContent=COUNTRY;CMEAS.textContent=COUNTRY;
const CFS=300,CFILL=.66;
function buildSpline(){
 const hint=[[125.15,6.5],[125.1,7.9],[124.7,9.3],[124.5,10.6],[123.7,11.7],[123.0,12.7],[122.0,13.8],[121.2,15.0],[121.0,16.4],[121.15,17.6],[121.45,18.5]].map(([lo,la])=>pt(lo,la)).reverse();
 const V=[];if(CTY){const m=CTY.d.match(/-?\d+\.?\d*/g);for(let j=0;j<m.length;j+=4)V.push(+m[j],+m[j+1])}else CA.forEach(k=>{const a=D.arcs[k];for(let j=0;j<a.length;j+=6)V.push(a[j],a[j+1])});
 const P2=hint.map(([x,y])=>{let lo=1e9,hi=-1e9;for(let j=0;j<V.length;j+=2){if(Math.abs(V[j+1]-y)<150&&Math.abs(V[j]-x)<420){if(V[j]<lo)lo=V[j];if(V[j]>hi)hi=V[j]}}
  return[hi>lo?x*.35+(lo+hi)/2*.65:x,y]});
 CPATH.setAttribute('d',smooth(P2));
}
let CFE=CFS;
function fitCountry(f=CFE){CFE=f;
 const L=CPATH.getTotalLength();CTX.setAttribute('font-size',f);CMEAS.setAttribute('font-size',f);CMEAS.setAttribute('letter-spacing',0);
 const w=CMEAS.getComputedTextLength(),n=COUNTRY.length,ls=Math.min(.75*f,Math.max(0,(L*CFILL-w)/(n-1)));
 CTX.setAttribute('letter-spacing',ls.toFixed(1));CTX.setAttribute('dy',f*.3);
}
buildSpline();fitCountry();document.fonts&&document.fonts.ready.then(()=>fitCountry());

function render(){
 gLand.innerHTML=gSub.innerHTML=gTown.innerHTML=gLab.innerHTML='';labels=[];
 svg.classList.toggle('cv',CV);
 if(CV)mk('path',{d:D.coast,fill:CCOL,'fill-rule':'evenodd','data-k':'c','data-i':0},gLand);
 else{shapes(gLand,R,R.map((_,i)=>i),'r');
 R.forEach((r,i)=>{r.el.classList.toggle('dim',sel.r!=null&&i!==sel.r);r.el.classList.toggle('off',i===sel.r)})}
 if(sel.r!=null){
  const ps=R[sel.r].kids;shapes(gSub,P,ps,'p');
  ps.forEach(i=>{P[i].el.classList.toggle('dim',sel.p!=null&&i!==sel.p);P[i].el.classList.toggle('off',i===sel.p)});
  if(sel.p!=null){const ts=P[sel.p].kids;shapes(gTown,T,ts,'t');ts.forEach(i=>T[i].el.classList.toggle('sel',i===sel.t));
   ts.forEach(i=>addLab(T[i],'t'))}
  else ps.forEach(i=>addLab(P[i],'p'));
 }else if(!CV)R.forEach(r=>addLab(r,'r'));
 if(sel.p==null)FOR.forEach(s=>{const e=mk('text',{class:'nb'},gLab);e.textContent=s.t;labels.push({e,sea:1,x:s.xy[0],y:s.xy[1],fs:s.fs,ang:0})});
 if(sel.p==null)SEAS.forEach(s=>{const e=mk('text',{class:'sea'},gLab);e.textContent=s.t;labels.push({e,sea:1,x:s.xy[0],y:s.xy[1],fs:s.fs,ang:s.rot})});
 labels.sort((a,b)=>b.fs-a.fs);
 if(CV){gLnP.innerHTML=gLnL.innerHTML='';lines.done=0}else{if(!lines.done){lines.done=1;lines(gLnP,1,null,null)}lines(gLnL,2,null,sel.r)}
 if(sel.r!=null)lines(gLnS,1,new Set(R[sel.r].kids),sel.p);else gLnS.innerHTML='';
 if(sel.p!=null)lines(gLnT,0,new Set(P[sel.p].kids),null);else gLnT.innerHTML='';
 drawPanel();place();
}
function orient(it){if(it.o)return it.o;const X=[],Y=[];
 for(const ring of it.g)for(const i of ring){const a=D.arcs[i<0?~i:i];for(let j=0;j<a.length;j+=8){X.push(a[j]);Y.push(a[j+1])}}
 const m=X.length||1;let mx=0,my=0;for(let i=0;i<X.length;i++){mx+=X[i];my+=Y[i]}mx/=m;my/=m;
 let sxx=0,syy=0,sxy=0;for(let i=0;i<X.length;i++){const x=X[i]-mx,y=Y[i]-my;sxx+=x*x;syy+=y*y;sxy+=x*y}
 const ext=a=>{const c=Math.cos(a),s=Math.sin(a),A=[],B=[];for(let i=0;i<X.length;i++){const x=X[i]-mx,y=Y[i]-my;A.push(x*c+y*s);B.push(-x*s+y*c)}
  const rg=v=>{v.sort((p,q)=>p-q);return(v[Math.floor(v.length*.96)]||0)-(v[Math.floor(v.length*.04)]||0)};return[rg(A),rg(B)]};
 let a=.5*Math.atan2(2*sxy,sxx-syy),[E,W]=ext(a);
 if(E/Math.max(1,W)<1.45){a=0;[E,W]=ext(0)}
 return it.o={a:a*180/Math.PI,E,W}}
function addLab(it,k){const e=mk('text',{class:k},gLab);const nm0=k==='p'?it.n.replace(/^(Distrito del?|Comandancia de) /,''):it.n;e.textContent=nm0;const n=nm0.length,sp=k==='r'?.7:k==='p'?.62:.52;
 let ang=0,fs;
 if(k==='t')fs=it.c[2]*.95/(n*sp);
 else{const o=orient(it);ang=o.a;fs=k==='r'?Math.min(o.E*1.2/(n*sp),o.W*.6):Math.min(o.E*.8/(n*sp),o.W*.6,42)}
 const tg=mk('text',{class:'tg '+k},gLab);tg.textContent=it.tag||'';
 labels.push({e,tg,tfs:Math.min(it.c[2]*.4,k==='r'?150:k==='p'?70:40),x:it.c[0],y:it.c[1],fs,ang,k,L:n*sp*fs})}
const LIM={r:[8,1e9],p:[7,1e9],t:[7,1e9]},CAP={r:90,p:64,t:54};
function place(){
 const u=vb[2]/SW,boxes=[],cop=CV?1:0;
 if(CV){const f=Math.min(400,Math.max(CFS,46*u));if(Math.abs(f-CFE)/CFE>.03)fitCountry(f)}/* keep the name a readable size on screen, however far out you are */
 gCountry.style.opacity=cop.toFixed(2);gCountry.style.display=cop<.02?'none':'';
 {const o=Math.min(1,Math.max(.3,u/3)).toFixed(2);GLOW.setAttribute('opacity',o);INNER.setAttribute('opacity',o)}
 coastLOD(u);
 labels.forEach(l=>{const s=l.fs/u,fe=l.sea?l.fs:Math.min(l.fs,CAP[l.k]*u),kf=fe/l.fs;l.e.setAttribute('font-size',fe);l.e.setAttribute('x',l.x);l.e.setAttribute('y',l.y);
  l.e.setAttribute('transform',l.ang?`rotate(${l.ang} ${l.x} ${l.y})`:'');
  let show=l.sea?(s>=10&&s<=900):(s>=LIM[l.k][0]&&s<=LIM[l.k][1]);
  if(TAGMODE&&!l.sea)show=false;
  if(show&&!l.sea){
   const r=l.ang*Math.PI/180,c=Math.abs(Math.cos(r)),sn=Math.abs(Math.sin(r));let ok=false;
   for(const k of [1,.84,.7,.58,.48]){const f=fe*k;if(f/u<7)break;const hl=l.L*(f/l.fs)/2*.9,hh=f*.5,hx=c*hl+sn*hh,hy=sn*hl+c*hh,b=[l.x-hx,l.y-hy,l.x+hx,l.y+hy];
    if(!boxes.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1])){boxes.push(b);l.e.setAttribute('font-size',f);ok=true;break}}
   if(!ok)show=false}
  const fade=l.k==='r'&&sel.r==null&&!l.sea&&!TAGMODE?1-cop:1;
  l.e.style.opacity=fade<1?fade:'';if(fade<.03)show=false;
  l.e.style.display=show?'':'none';
  if(l.tg){let ts=false;const s2=l.tfs/u;
   if(!l.sea&&!show&&(TAGMODE||cop<.03)&&s2>=9&&s2<=90){const hw=l.tfs*1.15,hh=l.tfs*.55,b=[l.x-hw,l.y-hh,l.x+hw,l.y+hh];
    if(TAGMODE||!boxes.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1])){ts=true;boxes.push(b)}}
   if(ts){const te=Math.min(l.tfs,28*u);l.tg.setAttribute('font-size',te);l.tg.setAttribute('x',l.x);l.tg.setAttribute('y',l.y+te*.34)}
   l.tg.style.display=ts?'':'none'}});
 NODES.forEach((c,i)=>{const t=TR.nodes[i].t;c.setAttribute('r',RAD[t]*u);c.style.display=vb[2]<=MINW[t]*1.15?'':'none'});placeTrade(u);
 const km=110*u*KM,n=[1,2,5,10,20,50,100,200,500].filter(v=>v<=km).pop()||1,s=$('#scale');
 s.firstElementChild.style.width=n/(KM*u)+'px';s.lastElementChild.textContent=N(n)+' kilometres';
}
const FR=TR.frame;
function clampVB(v){const a=SW/SH,fw=FR[2]-FR[0],fh=FR[3]-FR[1];
 const w=Math.min(v[2],fw,fh*a),h=w*v[3]/v[2];let x=v[0]+(v[2]-w)/2,y=v[1]+(v[3]-h)/2;
 x=Math.min(Math.max(x,FR[0]),FR[2]-w);y=Math.min(Math.max(y,FR[1]),FR[3]-h);return[x,y,w,h]}
function setVB(v){v=clampVB(v);moving();vb=v;svg.setAttribute('viewBox',v.join(' '));place()}
function fit(b,pad=.12){
 const a=SW/SH;let w=b[2]-b[0],h=b[3]-b[1];w*=1+pad*2;h*=1+pad*2;
 if(w/h<a)w=h*a;else h=w/a;const cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;return[cx-w/2,cy-h/2,w,h]}
function target(){const it=sel.t!=null?T[sel.t]:sel.p!=null?P[sel.p]:sel.r!=null?R[sel.r]:null;
 if(!it){const w=world();return fit([w[0],w[1],w[0]+w[2],w[1]+w[3]],0)}return fit(it.b,sel.t!=null?.9:.1)}
function fly(to){cancelAnimationFrame(anim);const from=vb.slice(),t0=performance.now(),d=matchMedia('(prefers-reduced-motion:reduce)').matches?1:850;
 const ez=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 (function f(now){const t=Math.min(1,(now-t0)/d),e=ez(t);
  const w=from[2]*Math.pow(to[2]/from[2],e),h=from[3]*Math.pow(to[3]/from[3],e);
  const cx=(from[0]+from[2]/2)*(1-e)+(to[0]+to[2]/2)*e,cy=(from[1]+from[3]/2)*(1-e)+(to[1]+to[3]/2)*e;
  setVB([cx-w/2,cy-h/2,w,h]);if(t<1)anim=requestAnimationFrame(f)})(t0)}
function go(r=null,p=null,t=null,quiet){CV=false;sel={r,p,t};render();fly(target())}
function goCountry(){CV=true;sel={r:null,p:null,t:null};render();fly(target())}

const nm=(a,i)=>a[i].n;
function list(arr,idxs,kind,sub){return'<ul class="idx">'+[...idxs].sort((a,b)=>arr[a].n.localeCompare(arr[b].n)).map(i=>
 `<li class="${kind==='t'&&i===sel.t?'on':''}"><button data-go="${kind}:${i}"><span>${arr[i].n}</span><i></i><em>${sub(arr[i])}</em></button></li>`).join('')+'</ul>'}
const NOTE={'Albay':'Sorsogón was still part of Albay in 1892; it became its own province in October 1894.','Negros Oriental':'Negros was divided into two provinces in 1890. Siquijor joined Negros Oriental in 1892.','Negros Occidental':'Created in 1890, when Negros was divided into two provinces.','Distrito de La Infanta':'A politico-military district: the towns of Binangonan de Lampon (now Real, Infanta and General Nakar) and the Polillo islands.','Distrito del Príncipe':'A politico-military district with its seat at Baler, attached to Nueva Écija.','Distrito de Morong':'A politico-military district created in 1853 from the Montes de San Mateo.','Manila':'The province of Manila, covering the walled city and its surrounding pueblos, including all of today’s Metro Manila.','Mindoro':'Marinduque was governed through Mindoro.','Comandancia de Romblón':'A politico-military comandancia administered from Capiz.','Distrito de Surigao':'The comandancia of Butuan (Agusan) lay within this district.','Distrito de Lanao':'The seventh of the Mindanao politico-military districts.','Distrito de Misamis':'The second district of Mindanao, with its capital at Cagayan de Misamis.','La Unión':'A politico-military government formed in 1850.','Lepanto y Bontoc':'Approximate: Lepanto and Bontoc were separate commands, shown here as one.','Cagayan':'Approximate: the Kalinga and Apayao uplands are drawn with Cagayan, though Spanish control there was loose.'};
const mod=a=>[...new Set(a.map(x=>x.startsWith('NCR')?'Metro Manila':x))].join(', ');
function hud(){const e=$('#sel');if(!e)return;
 e.innerHTML=CV?'':'<button data-go="b:0" class="back" title="Back to the previous level"><b>\u2039 Back</b></button>';
 const h=$('#hint');if(h)h.textContent=CV?'Select the Philippines to open its divisions':sel.r==null?'Select a division · Esc returns to the country':''}
$('#sel')&&$('#sel').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)pick(...b.dataset.go.split(':'))});
function drawPanel(){
 hud();if(!panel)return;
 const cr=[`<button data-go="x:0">Islas Filipinas</button>`];let h='';
 if(sel.r!=null)cr.push(sel.p==null?R[sel.r].n:`<button data-go="r:${sel.r}">${R[sel.r].n}</button>`);
 if(sel.p!=null)cr.push(sel.t==null?P[sel.p].n:`<button data-go="p:${sel.p}">${P[sel.p].n}</button>`);
 if(sel.t!=null)cr.push(T[sel.t].n);
 h+=`<p class="crumbs">${cr.join(' › ')}</p>`;
 if(sel.r==null)
  h+=`<h2>Islas Filipinas, 1892</h2><p>Spain governed the islands through provinces, politico-military districts and comandancias. Regions did not exist yet, so this chart shows the ${P.length} provinces, districts and comandancias as they stood in 1892, gathered into ${R.length} divisions by geography. Choose a division on the chart, or from the index below.</p><p>Sea lanes of 1892, each routed through open water. Heavy blue lines are the steamer trunks between the great ports (gold), light lines are the coastwise feeders to the provincial ports, and the long dashes are the overseas trades to Hong Kong, Singapore (and on to Spain by Suez), Sandakán, Japan, America and the Indias Neerlandesas. Zoom in to bring out the lesser ports.</p><h3>Index of divisions</h3>`+list(R,R.keys(),'r',r=>N(r.a)+' km²');
 else if(sel.p==null){const r=R[sel.r],nt=r.kids.reduce((s,i)=>s+P[i].kids.length,0),big=[...r.kids].sort((a,b)=>P[b].a-P[a].a)[0];
  h+=`<h2>${r.n}</h2><p>Holds ${r.kids.length} ${r.kids.length>1?'provinces and districts':'province or district'}, covering about ${N(r.a)} km². Today that ground is divided into ${N(nt)} cities and municipalities. The largest unit is ${P[big].n}, at ${N(P[big].a)} km².</p><h3>Provinces &amp; districts</h3>`+list(P,r.kids,'p',p=>p.kids.length+' towns')}
 else{const p=P[sel.p],r=R[sel.r];
  if(sel.t==null)h+=`<h2>${p.n}</h2><p>A Spanish-era province or district in the division of ${r.n}, about ${N(p.a)} km². Today its land lies in ${mod(p.m)}, and holds ${p.kids.length} cities and municipalities.</p>${NOTE[p.n]?`<p>${NOTE[p.n]}</p>`:''}`;
  else{const t=T[sel.t];h+=`<h2>${t.n}</h2><p>A present-day city or municipality, within ${p.n} in the 1890s. It covers about ${N(t.a)} km², ${(100*t.a/Math.max(1,p.a)).toFixed(1)}% of that unit.</p>`}
  h+=`<h3>Towns (modern names)</h3>`+list(T,p.kids,'t',t=>N(t.a)+' km²')}
 h+=`<p class="credit">Areas are approximate. Outlines follow today’s boundaries (geoBoundaries, CC BY 4.0, Runfola et al. 2020), regrouped into the Spanish units of 1892. The 13 divisions are my own geographic grouping. Drag to pan, scroll to zoom, Esc to step back.</p>`;
 panel.innerHTML=h;const on=panel.querySelector('.on');on&&on.scrollIntoView({block:'nearest'});
}
panel&&panel.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)pick(...b.dataset.go.split(':'))});
function back(){sel.t!=null?go(sel.r,sel.p):sel.p!=null?go(sel.r):sel.r!=null?go():CV||goCountry()}
function pick(k,i){i=+i;
 if(k==='b')back();else if(k==='x')goCountry();else if(k==='c'||k==='v')go();else if(k==='r')go(i);
 else if(k==='p')go(P[i].r,i);
 else go(P[T[i].p].r,T[i].p,i)}

svg.addEventListener('click',e=>{if(moved)return;const k=e.target.dataset&&e.target.dataset.k;if(k)pick(k,e.target.dataset.i)});
svg.addEventListener('pointermove',e=>{if(drag)return;const el=e.target,it=el.dataset&&el.dataset.k?(({c:[{n:'Filipinas',tag:'PHL'}],r:R,p:P,t:T})[el.dataset.k][el.dataset.i]):null,n=it?(it.tag?it.tag+' · ':'')+it.n:null;
 if(!n){tip.hidden=true;return}const b=svg.getBoundingClientRect();tip.hidden=false;tip.textContent=n;tip.style.left=Math.min(e.clientX-b.left+14,b.width-tip.offsetWidth-6)+'px';tip.style.top=(e.clientY-b.top+16)+'px'});
svg.addEventListener('pointerleave',()=>tip.hidden=true);
let drag=null;const ptrs=new Map();let pinch=null;
const zoomAt=(v,cx,cy,k)=>{const b=svg.getBoundingClientRect(),mx=v[0]+(cx-b.left)/SW*v[2],my=v[1]+(cy-b.top)/SH*v[3];
 const w=Math.max(60,v[2]*k),kk=w/v[2];return[mx-(mx-v[0])*kk,my-(my-v[1])*kk,w,v[3]*kk]};
svg.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptrs.size===2){const [p,q]=[...ptrs.values()];pinch={d:Math.hypot(p[0]-q[0],p[1]-q[1]),vb:vb.slice()};drag=null;moved=true;cancelAnimationFrame(anim)}
 else{drag={x:e.clientX,y:e.clientY,vb:vb.slice()};moved=false}});
addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(pinch&&ptrs.size>=2){const [p,q]=[...ptrs.values()],d=Math.hypot(p[0]-q[0],p[1]-q[1]);
  queue(zoomAt(pinch.vb,(p[0]+q[0])/2,(p[1]+q[1])/2,pinch.d/Math.max(1,d)));return}
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<5)return;
 moved=true;cancelAnimationFrame(anim);const u=drag.vb[2]/SW;queue([drag.vb[0]-dx*u,drag.vb[1]-dy*u,drag.vb[2],drag.vb[3]])});
const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size)drag=null;setTimeout(()=>moved=false,0)};
addEventListener('pointerup',up);addEventListener('pointercancel',up);
svg.addEventListener('wheel',e=>{e.preventDefault();cancelAnimationFrame(anim);queue(zoomAt(pend||vb,e.clientX,e.clientY,Math.exp(e.deltaY*.0015)))},{passive:false});
const tb=$('#tagbtn');function setTags(v){TAGMODE=v;tb.setAttribute('aria-pressed',v);tb.textContent='Tags: '+(v?'on':'off');place()}
tb.addEventListener('click',()=>setTags(!TAGMODE));
addEventListener('keydown',e=>{if(e.key==='t'||e.key==='T')setTags(!TAGMODE);if(e.key==='Escape')back()});
addEventListener('resize',()=>{measure();fly(target())});
setVB(target());render();
})();
