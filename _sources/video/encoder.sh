#!/usr/bin/env bash
# Capture puis encode la vidéo de fond. Usage : bash encoder.sh <dossier-images-temporaire> <dossier-sortie>
# Important : les images JPEG sont en « plage complète » ; on convertit en plage vidéo standard (tv), sinon Chrome refuse la vidéo.
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"; IMG="$1"; OUT="$2"
rm -rf "$IMG"; node "$ICI/capturer.mjs" images "$IMG" 25 | tail -1
VF="scale=in_range=pc:out_range=tv,format=yuv420p"; COUL="-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
mkdir -p "$OUT"
ffmpeg -loglevel error -y -framerate 25 -i "$IMG/img-%04d.jpg" -vf "$VF" -c:v libx264 -preset slow -crf 23 -profile:v high $COUL -movflags +faststart -an "$OUT/solaweb-fond.mp4"
ffmpeg -loglevel error -y -framerate 25 -i "$IMG/img-%04d.jpg" -vf "$VF" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 $COUL -an "$OUT/solaweb-fond.webm"
ffmpeg -loglevel error -y -i "$IMG/img-0175.jpg" -vf scale=1600:-1 -q:v 4 "$OUT/solaweb-fond-affiche.jpg"
ls -la "$OUT"
