import json,sys
for path in sys.argv[1:]:
    d=json.load(open(path))
    print("==",path.split('/')[-1], len(d['features']))
    for f in d['features']:
        p=f['properties']
        sov=p.get('SOVEREIGNT') or p.get('sovereignt')
        if sov and 'Australia' in sov:
            g=f['geometry']; n=len(g['coordinates']) if g['type']=='MultiPolygon' else 1
            print(p.get('ADMIN'),'|',p.get('NAME'),'|',p.get('GEOUNIT'),'|',p.get('TYPE'),'| polys',n)
