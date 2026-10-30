import re,base64,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
b64=lambda f,m:'data:%s;base64,%s'%(m,base64.b64encode(open(f,'rb').read()).decode())
mime={'png':'image/png','jpg':'image/jpeg'}
def assets(t):return re.sub(r'assets/(\w+)\.(png|jpg)',lambda m:b64(m.group(0),mime[m.group(2)]),t)
h=open('index.html').read()
css=assets(open('style.css').read())
h=h.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
h=h.replace('assets/land.jpg',b64('assets/land.jpg','image/jpeg'))
h=re.sub(r'<script src="(\w+\.js)"></script>',lambda m:'<script>'+assets(open(m.group(1)).read()).replace('</script','<\\/script')+'</script>',h)
h=h.replace('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">','<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27><text y=%27.9em%27 font-size=%2790%27>🗺️</text></svg>">')
open('republika.html','w').write(h)
print(len(h)//1024,'KB')
