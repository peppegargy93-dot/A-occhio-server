import json,re,subprocess
R=1.12
T=json.load(open('assets/voice/tighten.json'))
def m(x,t):
    rem=0.0
    for a,b in T[x]['cuts']:
        if t>=b: rem+=b-a
        elif t>a: rem+=t-a
    return (t-rem)/R
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode())
A={1:(0,6.10),2:(6.10,9.95),3:(9.95,14.07),4:(14.07,19.46),5:(19.46,24.0),6:(24.0,26.5),7:(26.5,None)}
B={9:(0,3.18),10:(3.18,13.52),11:(13.52,32.60),12:(32.60,None)}
newc={}
for x,S in (('1',A),('2',B)):
    D=dur(f'assets/voice/traccia-{x}-60.wav')
    for n,(a,b) in S.items():
        na=m(x,a); nb=D if b is None else m(x,b); newc[n]=(x,a,b,na,nb)
        subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{na:.4f}','-to',f'{nb:.4f}','-i',f'assets/voice/traccia-{x}-60.wav','-af','afade=t=in:d=0.015,areverse,afade=t=in:d=0.03,areverse','-ar','48000','-ac','1',f'assets/voice/{n:02d}.wav'],check=True)
dur_new={n:round(v[4]-v[3],3) for n,v in newc.items()}
dur_new[12]=4.0
dur_new[8]=5.733
print(dur_new, 'total', round(sum(dur_new.values()),2))
# words
vm=json.load(open('audio_meta.json'))
old={v['frame']:v for v in vm['voices']}
for n,(x,a,b,na,nb) in newc.items():
    for w in old[n]['words']:
        w['start']=round(max(0,m(x,a+w['start'])-na),3); w['end']=round(max(w['start']+0.05,m(x,a+w['end'])-na),3)
# frames: k-wrapped
built={'01-colore':4.5,'02-semaforo':3.3,'03-batteria':3.2,'04-conto':3.6,'05-maestra':3.8,'07-comunismo':4.4,'09-svolta':2.8}
num={'01-colore':1,'02-semaforo':2,'03-batteria':3,'04-conto':4,'05-maestra':5,'07-comunismo':7,'09-svolta':9}
K={}
for fid,b in built.items():
    p=f'compositions/frames/{fid}.html'; s=open(p).read(); n=dur_new[num[fid]]; k=round(b/n,4); K[fid]=k
    s=re.sub(r'data-duration="[0-9.]+"',lambda mm: f'data-duration="{n}"' if float(mm.group(0)[15:-1])>=b-0.001 or abs(float(mm.group(0)[15:-1])-b)<0.6 else mm.group(0), s)
    s=re.sub(r'(var id="'+fid+r'",k=)[0-9.]+',r'\g<1>'+str(k),s)
    s=re.sub(r'outer\.set\(\{\},\{\},[0-9.]+\)',f'outer.set({{}},{{}},{n})',s)
    open(p,'w').write(s)
# frame 06
p='compositions/frames/06-quante-volte.html'; s=open(p).read(); s=s.replace('data-duration="2.5"',f'data-duration="{dur_new[6]}"'); open(p,'w').write(s)
# frame 10 beats
p='compositions/frames/10-botta-risposta.html'; s=open(p).read()
mm=re.search(r'const BEATS = \{([^}]*)\};',s); beats=dict((k.strip(),float(v)) for k,v in (kv.split(':') for kv in mm.group(1).split(',')))
x,a,b,na,nb=newc[10]
nb10={k:round(m('2',a+v)-na,3) for k,v in beats.items()}
s=s.replace(mm.group(0),'const BEATS = { '+', '.join(f'{k}:{v}' for k,v in nb10.items())+' };')
s=re.sub(r'var DUR = [0-9.]+;',f'var DUR = {dur_new[10]};',s); s=re.sub(r'data-duration="10.34"',f'data-duration="{dur_new[10]}"',s); open(p,'w').write(s)
# frame 11 beats
p='compositions/frames/11-bandiera.html'; s=open(p).read()
mm=re.search(r'const BEATS = \{([^}]*)\};',s); beats=dict((k.strip(),float(v)) for k,v in (kv.split(':') for kv in mm.group(1).split(',')))
x,a,b,na,nb=newc[11]
nb11={k:round(m('2',a+v)-na,3) for k,v in beats.items()}
s=s.replace(mm.group(0),'const BEATS = { '+', '.join(f'{k}: {v}' for k,v in nb11.items())+' };')
s=re.sub(r'const DUR = [0-9.]+;',f'const DUR = {dur_new[11]};',s); s=re.sub(r'data-duration="19.08"',f'data-duration="{dur_new[11]}"',s); open(p,'w').write(s)
print('beats10',nb10,'beats11',nb11,'K',K)
# sfx
def dd(f): return round(min(dur(f),3.0),3)
S='assets/sfx/'; c=[]
def cue(fr,f,off,vol,d=None): c.append({"frame":fr,"file":f,"offset_s":round(off,3),"duration_s":round(d if d else dd(f),3),"volume":vol,"source":"host"})
red=sum(dur_new[i] for i in range(1,7))
cue(1,S+'meccanico-bed.wav',0,0.30,red)
cue(2,S+'semaforo-click.wav',1.0/K['02-semaforo'],0.45)
cue(9,S+'semaforo-click.wav',0.65/K['09-svolta'],0.45)
for kk in ('verde1','verde2','verde3'): cue(10,S+'stamp.wav',nb10[kk]-0.03,0.7)
cue(10,S+'chime.mp3',nb10['maestraA']+0.57,0.35)
cue(11,S+'sniff.wav',nb11['bianco']-0.1,0.6)
cue(12,S+'stamp.wav',0.29,0.8)
lofi_len=round(sum(dur_new[i] for i in (9,10,11,12)),3)
cue(9,'assets/bgm/lofi.wav',0,0.18,lofi_len)
vm['sfx']=c; vm['bgm']=None
json.dump(vm,open('audio_meta.json','w'),ensure_ascii=False,indent=1)
sb=open('STORYBOARD.md').read()
for n,v in dur_new.items(): sb=re.sub(r'(## Frame %d —.*?\n- duration: )[0-9.]+s'%n, r'\g<1>%ss'%v, sb, flags=re.S)
sb=re.sub(r'duration: [0-9.]+s\nmessage','duration: 61s\nmessage',sb)
open('STORYBOARD.md','w').write(sb)
