global.window={};require('/home/claude/work/philippines-map/data.js');require('/home/claude/work/philippines-map/neighbors.js');
const D=window.PH,out=[];
for(const r of D.cg){const pts=[];let first=true;for(const i of r){const rev=i<0,a=D.arcs[rev?~i:i],n=a.length>>1;for(let j=first?0:1;j<n;j++){const q=rev?n-1-j:j;pts.push(a[2*q],a[2*q+1])}first=false}out.push(pts)}
for(const n of window.PH_NB){for(const m of n.d.matchAll(/M[^M]*?Z/g)){out.push(m[0].match(/-?\d+(\.\d+)?/g).map(Number))}}
require('fs').writeFileSync('/home/claude/rings.json',JSON.stringify(out));console.log(out.length)
