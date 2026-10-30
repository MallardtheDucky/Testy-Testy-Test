# 1892 mainland Southeast Asia: Burma -> British, Laos -> Siam, rest of Indochina stays French.
# Splits the lumped 'other' and 'indochina' shapes in neighbors.js using Natural Earth borders (ne50.json, fetched from github.com/nvkelso/natural-earth-vector).
# usage: python3 tools/fix_neighbors.py path/to/ne_50m_admin_0_countries.geojson   (run from the project folder)
import json,math,re,subprocess,sys
from shapely.geometry import Polygon,shape,MultiPolygon
from shapely.ops import unary_union
K=math.cos(12.5*math.pi/180);P=lambda lo,la:((lo-116.5)*K*420,(21.5-la)*420)
raw=open('tools/neighbors.orig.js').read();NB=json.loads(raw[raw.index('['):raw.rindex(']')+1])
def rings(d):return [[tuple(map(float,t.split())) for t in s.replace('Z','').split('L')] for s in d.split('M') if s]
def path(g):
    polys=[g] if g.geom_type=='Polygon' else list(g.geoms);out=''
    for p in polys:
        if p.is_empty or p.area<4:continue
        for r in [p.exterior]+[i for i in p.interiors if Polygon(i).area>60]:out+='M'+'L'.join('%d %d'%(round(x),round(y)) for x,y in r.coords[:-1])+'Z'
    return out
ne=json.load(open(sys.argv[1]))['features']
def country(n):
    g=[shape(f['geometry']) for f in ne if f['properties'].get('ADMIN')==n][0]
    ps=[g] if g.geom_type=='Polygon' else list(g.geoms)
    return unary_union([Polygon([P(*c) for c in p.exterior.coords]) for p in ps]).buffer(0)
MMR,THA,LAO=country('Myanmar'),country('Thailand'),country('Laos')
by={n['k']:n for n in NB}
def big(n):
    rs=rings(n['d']);i=max(range(len(rs)),key=lambda i:len(rs[i]));return Polygon(rs[i]).buffer(0),[r for j,r in enumerate(rs) if j!=i]
other,other_small=big(by['other']);indo,indo_small=big(by['indochina'])
thai=other.intersection(THA.buffer(1));burma=other.intersection(MMR.buffer(1)).difference(thai)
laos=indo.intersection(LAO.buffer(1))
siam=unary_union([thai,laos]).buffer(3).buffer(-3).intersection(unary_union([other,indo]))  # closing: no hairline gaps along the old border
rest=other.difference(siam).difference(burma);indo_rest=indo.difference(siam)
tail=lambda rs:''.join('M'+'L'.join('%d %d'%(round(x),round(y)) for x,y in r)+'Z' for r in rs)
by['other']['d']=path(rest)+tail(other_small);by['indochina']['d']=path(indo_rest)+tail(indo_small)
new=[n for n in NB if n['k'] not in('other','indochina')]
new+= [{'k':'indochina','c':by['indochina']['c'],'d':by['indochina']['d']},
       {'k':'burma','c':'#e9a7b0','d':path(burma)},{'k':'siam','c':'#b9c98f','d':path(siam)},
       {'k':'other','c':by['other']['c'],'d':by['other']['d']}]
open('neighbors.js','w').write(raw[:raw.index('[')]+json.dumps(new,ensure_ascii=False,separators=(',',':'))+';\n')
print([ (n['k'],len(n['d'])) for n in new])
