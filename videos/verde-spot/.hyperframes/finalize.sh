#!/bin/bash
# usage: finalize.sh master.mp4 out.mp4
IN=$1; OUT=$2; T=$(mktemp -d)
J=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
read MI MTP MLRA MTH OFF < <(echo "$J" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -v error -y -i "$IN" -vn -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$MI:measured_TP=$MTP:measured_LRA=$MLRA:measured_thresh=$MTH:offset=$OFF:linear=true,aresample=48000,alimiter=limit=0.79:attack=2:release=60:level=false" -ar 48000 $T/a.wav
ffmpeg -v error -y -i "$IN" -i $T/a.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v 3400k -maxrate 4500k -bufsize 7M -profile:v high -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "^\s+(I|Peak):"
ls -la "$OUT"; rm -rf $T
