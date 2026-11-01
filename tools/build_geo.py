# usage: python3 -I build_geo.py <ne_10m_map_units> <ne_50m_countries> <outdir>
import json,sys,math
mu10,c50,out=sys.argv[1],sys.argv[2],sys.argv[3]
def polys(g):
    return g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
def area(ring):  # approx km2 planar on sphere-ish
    a=0
    for i in range(len(ring)-1):
        x1,y1=ring[i];x2,y2=ring[i+1]
        a+=math.radians(x2-x1)*(2+math.sin(math.radians(y1))+math.sin(math.radians(y2)))
    return abs(a*6371**2/2)
def cen(ring):
    xs=[p[0] for p in ring];ys=[p[1] for p in ring]
    return sum(xs)/len(xs),sum(ys)/len(ys)
def q(ring,d): return [[round(x,d),round(y,d)] for x,y in ring]
NAMED=[('Tasmania',-43.6,-39.4,143.5,148.6),('Macquarie Island',-55,-54,158,159.5),('Lord Howe Island',-32,-31.3,158.9,159.4),
('Kangaroo Island',-36.2,-35.5,136.4,138.2),('Tiwi Islands',-12,-11,129.8,131.6),('Torres Strait Islands',-11,-9,141.8,144.5),
('Groote Eylandt',-14.4,-13.5,136.2,137.0),('Fraser Island (K\'gari)',-26,-24.6,152.9,153.4)]
regions={}
d=json.load(open(mu10))
for f in d['features']:
    p=f['properties']
    if 'Australia' not in (p.get('SOVEREIGNT') or ''): continue
    unit=p['GEOUNIT']
    for poly in polys(f['geometry']):
        A=area(poly[0]); cx,cy=cen(poly[0])
        name=unit
        if unit=='Australia':
            if A>5e6: name='Mainland Australia'
            else:
                name='Other Australian islands'
                for n,la0,la1,lo0,lo1 in NAMED:
                    if la0<=cy<=la1 and lo0<=cx<=lo1: name=n;break
        regions.setdefault(name,[]).append([q(r,4) for r in poly])
summary=[]
for n,ps in regions.items():
    allpts=[pt for poly in ps for pt in poly[0]]
    A=sum(area(poly[0]) for poly in ps)
    summary.append((n,len(ps),round(A),min(p[1] for p in allpts),max(p[1] for p in allpts),min(p[0] for p in allpts),max(p[0] for p in allpts)))
summary.sort(key=lambda s:-s[2])
for s in summary: print(s)
json.dump({'regions':[{'name':n,'polys':ps} for n,ps in regions.items()]},open(out+'/au.json','w'),separators=(',',':'))
# world 50m (non-Australian), quantized 0.02 deg
d=json.load(open(c50)); W=[]
for f in d['features']:
    p=f['properties']
    if 'Australia' in (p.get('SOVEREIGNT') or ''): continue
    ps=[[q(r,2) for r in poly] for poly in polys(f['geometry'])]
    W.append({'n':p['NAME'],'p':ps})
json.dump(W,open(out+'/world.json','w'),separators=(',',':'))
