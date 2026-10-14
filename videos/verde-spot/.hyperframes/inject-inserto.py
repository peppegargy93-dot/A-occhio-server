# Inserts the root-level inserto <video> over frame 8's tilted clipping slot (main deliverable only).
import re,sys
p='index.html'; s=open(p).read()
if 'id="el-inserto-video"' in s: sys.exit(0)
m=re.search(r'(<div\s+id="el-08-inserto-vuoto".*?data-start="([0-9.]+)".*?></div>)',s,re.S)
start=m.group(2)
block=f'''
      <div id="el-inserto-wrap" style="position:absolute;left:170px;top:360px;width:740px;height:1090px;transform:rotate(-2.4deg);z-index:5;pointer-events:none;">
        <video id="el-inserto-video" class="clip" src="assets/inserto/inserto.mp4" data-start="{start}" data-duration="5.733" data-track-index="9" data-has-audio="true" data-volume="1" playsinline style="position:absolute;left:123px;top:146px;width:494px;height:878px;object-fit:cover;"></video>
      </div>
'''
s=s[:m.end(1)]+block+s[m.end(1):]
open(p,'w').write(s); print('inserto injected at',start)
