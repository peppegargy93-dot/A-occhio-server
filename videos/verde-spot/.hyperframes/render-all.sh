#!/bin/bash
set -e
cd "$(dirname "$0")/.."
npx hyperframes render --quality delivery --fps 30 --output renders/master-inserto.mp4
node ~/.claude/skills/product-launch-video/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes . >/dev/null
npx hyperframes render --quality delivery --fps 30 --output renders/master-vuoto.mp4
bash .hyperframes/finalize.sh renders/master-inserto.mp4 renders/verde-spot-9x16.mp4
bash .hyperframes/finalize.sh renders/master-vuoto.mp4 renders/verde-spot-9x16-slot-vuoto.mp4
ffmpeg -v error -y -sseof -0.1 -i renders/master-inserto.mp4 -frames:v 1 -q:v 2 renders/verde-spot-9x16-poster.jpg
cp assets/voice/traccia-1-60.wav renders/verde-voce-traccia-1.wav
cp assets/voice/traccia-2-60.wav renders/verde-voce-traccia-2.wav
echo ALLDONE
