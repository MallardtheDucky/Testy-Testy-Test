import json,math,heapq
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import distance_transform_edt
from skimage.graph import route_through_array
K=math.cos(12.5*math.pi/180)
pt=lambda lo,la:((lo-116.5)*K*420,(21.5-la)*420)
FR=[-8000,-3000,10000,9600];C=8
W=(FR[2]-FR[0])//C;H=(FR[3]-FR[1])//C
im=Image.new('1',(W,H),0);dr=ImageDraw.Draw(im)
for r in json.load(open('/home/claude/rings.json')):
    p=[((r[i]-FR[0])/C,(r[i+1]-FR[1])/C) for i in range(0,len(r),2)]
    if len(p)>2:dr.polygon(p,fill=1)
land=np.array(im,dtype=bool);dist=distance_transform_edt(~land)
base=1+np.clip(6-dist,0,6)*1.6
base[dist<2]=1e6
cell=lambda x,y:(int((y-FR[1])/C),int((x-FR[0])/C))
xy=lambda rc:(FR[0]+(rc[1]+.5)*C,FR[1]+(rc[0]+.5)*C)
def snap(x,y,need=2.6):
    r,c=cell(x,y);best=None
    for R in range(0,40):
        for dr_ in range(-R,R+1):
            for dc in range(-R,R+1):
                if max(abs(dr_),abs(dc))!=R:continue
                a,b=r+dr_,c+dc
                if 0<=a<H and 0<=b<W and dist[a,b]>=need:
                    d=dr_*dr_+dc*dc
                    if best is None or d<best[0]:best=(d,a,b)
        if best:return best[1],best[2]
N=[("Manila",120.97,14.58,"hub"),("Iloílo",122.56,10.70,"hub"),("Cebú",123.90,10.31,"hub"),("Zamboanga",122.08,6.91,"hub"),
("Sual",120.09,16.06,"open"),("Legazpi",123.74,13.14,"open"),
("Aparri",121.64,18.36,"coast"),("Vigán",120.39,17.57,"coast"),("San Fernando",120.31,16.62,"coast"),("Batangas",121.05,13.76,"coast"),
("Tayabas",121.62,13.93,"coast"),("Calapan",121.18,13.41,"coast"),("Romblón",122.27,12.58,"coast"),("Masbate",123.62,12.37,"coast"),
("Capiz",122.75,11.60,"coast"),("Antique",121.94,10.75,"coast"),("Bacolod",122.95,10.67,"coast"),("Dumaguete",123.31,9.31,"coast"),
("Tagbilarán",123.85,9.65,"coast"),("Calbayog",124.60,12.07,"coast"),("Tacloban",125.00,11.24,"coast"),("Maasín",124.84,10.13,"coast"),
("Surigao",125.50,9.78,"coast"),("Butuan",125.54,8.95,"coast"),("Cagayán de Misamis",124.65,8.48,"coast"),("Iligan",124.24,8.23,"coast"),
("Dapitan",123.42,8.65,"coast"),("Cotabato",124.24,7.20,"coast"),("Davao",125.61,7.07,"coast"),("Joló",121.00,6.05,"coast"),
("Puerto Princesa",118.73,9.74,"coast"),
("Hong Kong",114.17,22.30,"foreign"),("Singapur",103.85,1.28,"foreign"),("Sandakán",118.12,5.85,"foreign")]
P={n[0]:snap(*pt(n[1],n[2])) for n in N}
E=[("Manila","Sual",1),("Manila","Batangas",1),("Manila","Iloílo",1),("Iloílo","Cebú",1),("Manila","Legazpi",1),("Cebú","Cagayán de Misamis",1),
("Cagayán de Misamis","Zamboanga",1),("Zamboanga","Joló",1),("Cebú","Tacloban",1),
("Sual","San Fernando",2),("San Fernando","Vigán",2),("Vigán","Aparri",2),("Batangas","Tayabas",2),("Batangas","Calapan",2),("Calapan","Romblón",2),
("Romblón","Capiz",2),("Capiz","Iloílo",2),("Iloílo","Bacolod",2),("Iloílo","Antique",2),("Bacolod","Cebú",2),("Cebú","Tagbilarán",2),
("Tagbilarán","Dumaguete",2),("Dumaguete","Dapitan",2),("Dapitan","Zamboanga",2),("Cagayán de Misamis","Iligan",2),("Cebú","Maasín",2),("Maasín","Tacloban",2),
("Tacloban","Calbayog",2),("Calbayog","Masbate",2),("Masbate","Legazpi",2),("Tacloban","Surigao",2),("Surigao","Butuan",2),("Surigao","Davao",2),
("Zamboanga","Cotabato",2),("Cotabato","Davao",2),("Iloílo","Puerto Princesa",2),("Manila","Puerto Princesa",2)]
OUT=[("Hacia Hong Kong","Manila","Hong Kong"),("Hacia Singapur y Suez","Manila","Singapur"),("Hacia Sandakán","Joló","Sandakán"),("Hacia el Japón","Aparri",pt(124.0,28.4)),
("Hacia América","Legazpi",(10000,2300)),("Hacia las Indias Neerlandesas","Joló",pt(118.6,-1.3)),("Hacia España, por Suez","Singapur",(-8000,5750))]
cost=base.copy();used={}
def route(a,b):
    s=P[a] if isinstance(a,str) else snap(*a);t=P[b] if isinstance(b,str) else snap(*b)
    path,_=route_through_array(cost,s,t,fully_connected=True,geometric=True);return path
def add(path,tier,key=None):
    for u,v in zip(path,path[1:]):
        e=(u,v) if u<v else (v,u)
        if e not in used:used[e]=tier
        cost[u]=min(cost[u],base[u]*.18) if base[u]<1e5 else cost[u]
    cost[path[-1]]=min(cost[path[-1]],base[path[-1]]*.18)
for a,b,t in sorted(E,key=lambda e:e[2]):add(route(a,b),t)
outp={}
for t,a,b in OUT:
    p=route(a,b);add(p,3);outp[t]=p
def chains(tier):
    adj={}
    for (u,v),k in used.items():
        if k==tier:adj.setdefault(u,[]).append(v);adj.setdefault(v,[]).append(u)
    seen=set();res=[]
    def walk(s,n):
        ch=[s,n];seen.add(frozenset((s,n)))
        while len(adj[ch[-1]])==2:
            nx=[w for w in adj[ch[-1]] if frozenset((ch[-1],w)) not in seen]
            if not nx:break
            seen.add(frozenset((ch[-1],nx[0])));ch.append(nx[0])
        return ch
    for s in list(adj):
        if len(adj[s])!=2:
            for n in adj[s]:
                if frozenset((s,n)) not in seen:res.append(walk(s,n))
    for s in list(adj):
        for n in adj[s]:
            if frozenset((s,n)) not in seen:res.append(walk(s,n))
    return res
def rdp(p,e):
    if len(p)<3:return p
    a,b=p[0],p[-1];dx,dy=b[0]-a[0],b[1]-a[1];L=math.hypot(dx,dy)or 1
    d=[abs(dy*(q[0]-a[0])-dx*(q[1]-a[1]))/L for q in p[1:-1]];i=int(np.argmax(d))
    if d[i]<e:return [a,b]
    return rdp(p[:i+2],e)[:-1]+rdp(p[i+1:],e)
def simp(ch,e=11):return [[round(x),round(y)] for x,y in rdp([xy(c) for c in ch],e)]
lanes=[]
for k in (1,2,3):
    for ch in chains(k):
        if len(ch)>2:lanes.append({"k":k,"p":simp(ch)})
outs=[]
for t,p in outp.items():
    q=p[-min(len(p),260):];outs.append({"t":t,"pts":simp(q,14)})
nodes=[]
for n,lo,la,tier in N:
    r,c=P[n];x,y=xy((r,c));wl=land[r,max(0,c-9):c].any();wr=land[r,c+1:c+10].any()
    nodes.append({"n":n,"x":round(x),"y":round(y),"t":tier,"a":"end" if (wr and not wl) else "start"})
json.dump({"frame":FR,"nodes":nodes,"lanes":lanes,"out":outs},open('/home/claude/trade_new.json','w'))
def bez(p):
    o=[]
    for i in range(len(p)-1):
        a=p[i-1] if i else p[i];b=p[i];c=p[i+1];e=p[i+2] if i+2<len(p) else c
        x1,y1=b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6;x2,y2=c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6
        for j in range(16):
            t=j/16;m=1-t;o.append((m**3*b[0]+3*m*m*t*x1+3*m*t*t*x2+t**3*c[0],m**3*b[1]+3*m*m*t*y1+3*m*t*t*y2+t**3*c[1]))
    return o
bad=0;tot=0
for l in lanes:
    for x,y in bez(l["p"]):
        r,c=cell(x,y);tot+=1
        if 0<=r<H and 0<=c<W and land[r,c]:bad+=1
print(len(lanes),"chains",tot,"samples",bad,"on land")
pv=Image.new('RGB',(W,H),(232,217,173));a=np.array(pv);a[land]=(190,170,120);pv=Image.fromarray(a);d=ImageDraw.Draw(pv)
for l in lanes:
    pts=[((x-FR[0])/C,(y-FR[1])/C) for x,y in bez(l["p"])]
    d.line(pts,fill={1:(20,60,160),2:(70,120,200),3:(200,60,60)}[l["k"]],width=3 if l["k"]==1 else 2)
for n in nodes:d.ellipse([(n["x"]-FR[0])/C-4,(n["y"]-FR[1])/C-4,(n["x"]-FR[0])/C+4,(n["y"]-FR[1])/C+4],fill=(220,170,30))
pv.crop((0,int((-300-FR[1])/C),int(4800/C+1000),int(7500/C+300))).save('/home/claude/preview.png')
pv.resize((W//4,H//4)).save('/home/claude/preview_full.png')
