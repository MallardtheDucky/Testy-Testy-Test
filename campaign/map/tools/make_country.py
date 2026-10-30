import json,math,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
K=math.cos(12.5*math.pi/180)
pt=lambda lo,la:((lo-116.5)*K*420,(21.5-la)*420)
def dp(p,e):
    n=len(p);keep=[False]*n;keep[0]=keep[-1]=True;st=[(0,n-1)]
    while st:
        s,t=st.pop()
        if t<=s+1:continue
        x1,y1=p[s];dx,dy=p[t][0]-x1,p[t][1]-y1;L=math.hypot(dx,dy) or 1;m=-1;mi=0
        for i in range(s+1,t):
            d=abs(dy*(p[i][0]-x1)-dx*(p[i][1]-y1))/L
            if d>m:m=d;mi=i
        if m>e:keep[mi]=True;st+= [(s,mi),(mi,t)]
    return [p[i] for i in range(n) if keep[i]]
g=json.load(open('tools/ADM0_simplified.geojson'))['features'][0]['geometry']
polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
d='';pts=[];kept=0
for poly in polys:
    r=[pt(*c[:2]) for c in poly[0]]
    xs=[q[0] for q in r];ys=[q[1] for q in r]
    if max(xs)-min(xs)<2.5 and max(ys)-min(ys)<2.5:continue
    m=len(r)//2;r=dp(r[:m+1],1.4)+dp(r[m:],1.4)[1:]
    if len(r)<4:continue
    kept+=1;pts+=r
    d+='M'+'L'.join('%.1f %.1f'%q for q in r)+'Z'
open('country.js','w').write('window.PH_C={"n":"Filipinas","tag":"PHL","d":"%s"};\n'%d)
print(kept,'rings',len(pts),'points',len(d)//1024,'KB')
