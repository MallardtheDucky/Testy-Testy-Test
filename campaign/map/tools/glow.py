import json,numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import distance_transform_edt,gaussian_filter
FR=[-8000,-3000,10000,9600];C=6;W=(FR[2]-FR[0])//C;H=(FR[3]-FR[1])//C
rings=json.load(open('/home/claude/rings.json'));nph=sum(1 for _ in rings)
import re
ph=json.load(open('/home/claude/rings_ph.json')) if False else None
def mask(rs):
    im=Image.new('1',(W,H),0);d=ImageDraw.Draw(im)
    for r in rs:
        p=[((r[i]-FR[0])/C,(r[i+1]-FR[1])/C) for i in range(0,len(r),2)]
        if len(p)>2:d.polygon(p,fill=1)
    return np.array(im,dtype=bool)
import subprocess,os
n_ph=int(open('/home/claude/n_ph.txt').read())
S=4.4
PH=[(58,.06),(44,.07),(32,.08),(22,.09),(14,.11),(8,.13),(4,.14)];NB=[(40,.06),(28,.07),(18,.08),(10,.1),(5,.12)]
keep=np.ones((H,W));
for rs,L in ((rings[:n_ph],PH),(rings[n_ph:],NB)):
    d=distance_transform_edt(~mask(rs))*C
    for w,o in L:keep*=1-o*(d<=w*S/2)
a=gaussian_filter(1-keep,2.5)
out=np.zeros((H,W,4),np.uint8);out[...,0],out[...,1],out[...,2]=0x6a,0x4a,0x1e;out[...,3]=np.clip(a*255,0,255)
Image.fromarray(out).save('assets/glow.png',optimize=True)
print(os.path.getsize('assets/glow.png')/1e3,'KB',W,H)

mph=mask(rings[:n_ph]);d_in=distance_transform_edt(mph)*C
ai=gaussian_filter(np.clip(1-d_in/(7*S/2),0,1)**1.5*.17*mph,1.5)*mph
o2=np.zeros((H,W,4),np.uint8);o2[...,0],o2[...,1],o2[...,2]=0x4a,0x34,0x16;o2[...,3]=np.clip(ai*255,0,255)
Image.fromarray(o2).save('assets/inner.png',optimize=True);print(os.path.getsize('assets/inner.png')/1e3,'KB inner')
