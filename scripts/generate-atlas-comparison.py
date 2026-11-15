"""Generate the standard Atlas comparison from the two pinned GGG data.json files.
Usage: python3 scripts/generate-atlas-comparison.py path/to/3.29.1.json path/to/3.30.0.json
"""
import hashlib
import json
import sys
from pathlib import Path

def load(path):
    raw = Path(path).read_bytes()
    tree = json.loads(raw)
    assert tree['tree'] == 'Atlas'
    nodes = {}
    for ident, n in tree['nodes'].items():
        if not ident.isdigit() or n.get('isMastery'):
            continue
        assert n['skill'] == int(ident)
        nodes[ident] = dict(name=n['name'], stats=n['stats'], points=n.get('grantedPassivePoints', 0),
                            kind=next((name for key, name in [('isKeystone','Keystone'),('isNotable','Notable'),('isWormhole','Gateway')] if n.get(key)), 'Small'),
                            links=sorted(set(n['in'] + n['out'])))
    return nodes, hashlib.sha256(raw).hexdigest()

old, sha_old = load(sys.argv[1])
new, sha_new = load(sys.argv[2])
rows = []
for i in sorted(old.keys() | new.keys(), key=int):
    a, b = old.get(i), new.get(i)
    state = 'Added' if a is None else 'Removed' if b is None else 'Changed' if a != b else 'Retained'
    rows.append(dict(id=i, state=state, before=a, after=b if state != 'Retained' else None))
dest = Path(__file__).resolve().parents[1] / 'poe-atlas-tree-compare' / 'comparison.json'
dest.write_text(json.dumps(dict(versions=['3.29.1','3.30.0'], sha256=[sha_old,sha_new], nodes=rows), separators=(',',':'))+'\n')
