#!/bin/bash
S=~/.claude/skills/product-launch-video/scripts
cp $S/captions.mjs $S/captions-v-local.mjs && sed -i 's/return density > 3.5 ? 2 : density > 2.5 ? 3 : 4;/return 7;/; s/const SILENCE_GAP = 0.18;/const SILENCE_GAP = 0.45;/' $S/captions-v-local.mjs
node $S/captions-v-local.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json | tail -1; rm $S/captions-v-local.mjs
python3 - <<'PY'
import json,re
p='compositions/captions.html'; s=open(p).read()
m=re.search(r'var GROUPS = (\[.*?\]);\n',s); G=json.loads(m.group(1))
i=0
while i<len(G)-1:
    a,b=G[i],G[i+1]
    if len(a['words'])<=2 and a['frame']==b['frame'] and len(a['words'])+len(b['words'])<=8 and not a['text'].rstrip().endswith(('.','?')):
        a['words']+=b['words']; a['end']=b['end']; a['text']+=' '+b['text']; G.pop(i+1)
    else: i+=1
s=s[:m.start(1)]+json.dumps(G,ensure_ascii=False)+s[m.end(1):]
s=s.replace('top: 1600px;\n      height: 320px;','top: 1470px;\n      height: 180px;').replace('padding: 29px 52px;','padding: 14px 28px;').replace('font-size: 73px;','font-size: 44px;').replace('border-radius: 22px;','border-radius: 0;').replace('font-family: Roboto, sans-serif;','font-family: "Special Elite", monospace;').replace('font-weight: 700;','font-weight: 400;').replace('max-width: 80%;','max-width: 900px;').replace('background: rgba(0, 0, 0, 0.72);','background: #141414;').replace('color: #fff;','color: #EFE6D2;')
s=s.replace('<style>','<style>\n@font-face{font-family:"Special Elite";src:url("assets/fonts/special-elite-latin-400-normal.woff2") format("woff2");}\n',1)
open(p,'w').write(s); print(len(G),'groups')
PY
