global.window={};require('../data.js');const fs=require('fs');const D=window.PH;
const strip=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ñ/gi,'n');
const DROP=new Set(['de','del','la','las','los','y','of','the','city','distrito','comandancia','islas','isla','island','islands','municipality','ng','sa','nga']);
const words=n=>strip(n).replace(/\([^)]*\)/g,' ').replace(/[^A-Za-z ]/g,' ').split(/\s+/).filter(w=>w&&!DROP.has(w.toLowerCase())).map(w=>w.toUpperCase());
const V=/[AEIOU]/;
const cons=w=>w.slice(1).split('').filter(c=>!V.test(c));
function cands(n){const W=words(n);if(!W.length)return[];const out=[];const a=W[0],j=W.join('');
 if(W.length>1){const b=W[1];out.push(a[0]+b[0]+(b[1]||a[1]||'X'),a.slice(0,2)+b[0],a[0]+b[0]+(cons(b)[0]||''),a[0]+(cons(a)[0]||'')+b[0],a[0]+b[0]+(W[2]?W[2][0]:b.slice(-1)))}
 out.push(a.slice(0,3));const c=cons(a);out.push(a[0]+(c[0]||'')+(c[1]||''),a[0]+(c[0]||'')+a.slice(-1),a[0]+a[1]+a.slice(-1),a[0]+a[1]+(c[0]||''));
 for(let i=0;i<j.length;i++)for(let k=i+1;k<j.length;k++)for(let m=k+1;m<j.length;m++)out.push(j[i]+j[k]+j[m]);
 return out.filter(t=>t.length===3);}
const used=new Set(['PHL']),assign=(n,pref)=>{let t=null;for(const c of [pref,...cands(n)])if(c&&!used.has(c)){t=c;break}
 if(!t){const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(const x of L)for(const y of L){const c=words(n)[0][0]+x+y;if(!used.has(c)){t=c;break}if(t)break}}used.add(t);return t};
const RO=['ILK','VCG','PCE','MMR','PTS','BIC','MYP','PYN','CYB','LYS','MSE','MME','AJO'];
const PO={'Manila':'MNL','Cebú':'CEB','Iloílo':'ILO','Batangas':'BTG','Cavite':'CAV','La Laguna':'LAG','Pampanga':'PAM','Bulacán':'BUL','Albay':'ALB','Leyte':'LEY','Samar':'SAM','Bohol':'BOH','Joló (Sulu)':'JOL','Ilocos Norte':'ILN','Ilocos Sur':'ILS','La Unión':'LUN','Pangasinán':'PAN','Nueva Écija':'NEC','Nueva Vizcaya':'NVZ','Cagayan':'CAG','Isabela':'ISA','Tárlac':'TAR','Zambales':'ZAM','Bataán':'BAT','Tayabas':'TAY','Camarines Norte':'CMN','Camarines Sur':'CMS','Negros Occidental':'NEO','Negros Oriental':'NER','Mindoro':'MIN','Paragua':'PAR','Capiz':'CAP','Antique':'ANT','Benguet':'BEN','Abra':'ABR','Islas Batanes':'BTN','Distrito de Davao':'DAV','Distrito de Cotabato':'COT','Distrito de Zamboanga':'ZAB','Distrito de Misamis':'MIS','Distrito de Lanao':'LAN','Distrito de Surigao':'SUR','Distrito de Morong':'MOR','Distrito del Príncipe':'PRI','Distrito de La Infanta':'INF','Lepanto y Bontoc':'LEB','Masbate y Ticao':'MAT','Comandancia de Romblón':'ROM'};
const tags={r:D.regions.map((r,i)=>assign(r.n,RO[i])),p:D.provinces.map(p=>assign(p.n,PO[p.n]))};
const order=D.towns.map((_,i)=>i).sort((a,b)=>D.towns[b].a-D.towns[a].a),tt=[];order.forEach(i=>tt[i]=assign(D.towns[i].n));tags.t=tt;
const out={c:[['PHL','Filipinas (The Philippines)']],r:D.regions.map((r,i)=>[tags.r[i],r.n]),p:D.provinces.map((p,i)=>[tags.p[i],p.n,tags.r[p.r]]),t:D.towns.map((t,i)=>[tags.t[i],t.n,tags.p[t.p]])};

global.window={};require('../trade.js');const TR=window.PH_TRADE,ROUTES=JSON.parse(fs.readFileSync('tools/routes.json','utf8'));
const XO={'Hong Kong':'HKG','Singapur':['SGP','SIN','SNG','SPR','SIG','SGR','SPO','SIP'],'Iligan':['PLG','PGN','PIG','PNG'],'Sandakán':'SDK','Japón':'JPN','América':['USA','AME'],'Indias Neerlandesas':'NEI','España':['ESP','SPA','ESA','EPA']};
const portTag=n=>{const w=words(n)[0],c=cons(w);for(const x of [c[0],c[1],w[1],c[2],w[2],...w.slice(1)]){const t='P'+w[0]+(x||'');if(t.length===3&&!used.has(t))return t}const j=words(n).join('');for(let i=0;i<j.length;i++)for(let k=i+1;k<j.length;k++){const t='P'+j[i]+j[k];if(!used.has(t))return t}return null};
const xt={};const nodes=TR.nodes.map(n=>[n.n,n.t]);['Japón','América','Indias Neerlandesas','España'].forEach(n=>nodes.push([n,'overseas']));
const X=nodes.map(([n,t])=>{let pf=[].concat(XO[n]||[]).find(c=>!used.has(c))||(t==='overseas'||t==='foreign'?null:portTag(n));
 if(!pf){const b=([].concat(XO[n]||['P'+words(n)[0][0]])[0]).slice(0,2);pf=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(x=>b+x).find(c=>!used.has(c))}
 xt[n]=assign(n,pf);return[xt[n],n,t]});
const RT=ROUTES.map(([a,b,k])=>[xt[a]+'-'+xt[b],a,b,k===1?'steamer trunk':k===2?'coastwise feeder':'overseas']);
out.x=X;out.rt=RT;
fs.writeFileSync('tags.js','window.PH_TAGS='+JSON.stringify(out)+';\n');
fs.writeFileSync('tags.json',JSON.stringify(out,null,1));
const csv=['level,tag,name,parent_tag'];for(const [l,k] of [['country','c'],['region','r'],['province','p'],['town','t'],['trade_node','x']])out[k].forEach(x=>csv.push([l,x[0],'"'+x[1].replace(/"/g,'""')+'"',x[2]||''].join(',')));
out.rt.forEach(x=>csv.push(['trade_route',x[0],'"'+x[1]+' - '+x[2]+'"',x[3]].join(',')));
fs.writeFileSync('tags.csv',csv.join('\n')+'\n');
console.log('tags',used.size,'unique of',csv.length-1);
console.log(out.r.map(x=>x[0]+' '+x[1]).join(' | '));console.log(out.p.map(x=>x[0]+' '+x[1]).join(' | '));
console.log(out.t.slice(0,60).map(x=>x[0]+' '+x[1]).join(' | '));
