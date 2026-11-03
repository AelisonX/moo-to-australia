# usage: python3 -I build_targets.py <ne_10m_admin_0_countries.geojson> <ne_50m_admin_0_countries.geojson> <outdir>
# Writes targets.json (level targets at 1:10m, mainland filters) and a lighter world.json (1:50m, simplified).
import json, sys, math
c10, c50, out = sys.argv[1], sys.argv[2], sys.argv[3]
def polys(g): return g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
def q(r,d): return [[round(x,d),round(y,d)] for x,y in r]
def dp(pts, tol):
    if len(pts) < 5: return pts
    keep=[False]*len(pts); keep[0]=keep[-1]=True; st=[(0,len(pts)-1)]
    while st:
        a,b=st.pop(); ax,ay=pts[a]; bx,by=pts[b]; dx,dy=bx-ax,by-ay; L=math.hypot(dx,dy)
        m,mi=0,-1
        for i in range(a+1,b):
            d=abs(dy*(pts[i][0]-ax)-dx*(pts[i][1]-ay))/L if L>1e-9 else math.hypot(pts[i][0]-ax,pts[i][1]-ay)
            if d>m: m,mi=d,i
        if m>tol: keep[mi]=True; st+= [(a,mi),(mi,b)]
    return [p for p,k in zip(pts,keep) if k]
T = {  # key: (NE ADMIN name, bbox filter lon0,lat0,lon1,lat1 or None, label)
  'NZ': ('New Zealand', (165,-48,179.9,-33.5), 'New Zealand'),
  'FR': ('France', (-6,41,10,51.5), 'France'),
  'JP': ('Japan', (122,24,146.5,46), 'Japan'),
  'BR': ('Brazil', None, 'Brazil'),
  'CA': ('Canada', None, 'Canada'),
}
d=json.load(open(c10)); res={}
for k,(adm,bb,label) in T.items():
    ps=[]
    for f in d['features']:
        if f['properties']['ADMIN']!=adm: continue
        for p in polys(f['geometry']):
            xs=[a for a,_ in p[0]]; ys=[b for _,b in p[0]]; cx,cy=sum(xs)/len(xs),sum(ys)/len(ys)
            if bb and not (bb[0]<=cx<=bb[2] and bb[1]<=cy<=bb[3]): continue
            tol = 0.02 if k=='CA' else 0.005
            rings=[q(dp(r,tol),4) for r in p]
            if len(rings[0])>=4: ps.append(rings)
    res[k]={'name':label,'polys':ps}
    print(k,label,len(ps),'polys',sum(len(r) for p in ps for r in p),'pts')
json.dump(res,open(out+'/targets.json','w'),separators=(',',':'))
d=json.load(open(c50)); W=[]
for f in d['features']:
    p=f['properties']
    if 'Australia' in (p.get('SOVEREIGNT') or ''): continue
    ps=[]
    for poly in polys(f['geometry']):
        rings=[q(dp(r,0.02),2) for r in poly]
        if len(rings[0])>=4: ps.append(rings)
    if ps: W.append({'n':p['NAME'],'p':ps})
json.dump(W,open(out+'/world.json','w'),separators=(',',':'))
