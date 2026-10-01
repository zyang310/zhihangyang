#!/usr/bin/env bash
# Turns raw Higgsfield exports in media-raw/ (gitignored) into web-ready files in src/assets/media/.
#   stills (png/jpg/webp)  -> WebP, longest side 4096px, quality 90 (needs cwebp: brew install webp)
#   videos (mp4/mov/webm)  -> H.264 MP4 center-cropped to 16:9 (the plate's shape), no audio,
#                             +faststart, plus its exact last frame as JPEG
#                             (needs ffmpeg: brew install ffmpeg)
#                             A name ending in .reverse (intro.reverse.mp4) is played backwards
#                             and saved without the suffix (intro.mp4).
# Usage: npm run media
set -euo pipefail

RAW=media-raw
OUT=src/assets/media

[ -d "$RAW" ] || { echo "Put raw exports in $RAW/ first." >&2; exit 1; }
mkdir -p "$OUT"
shopt -s nullglob nocaseglob

stills=("$RAW"/*.{png,jpg,jpeg,webp})
if [ ${#stills[@]} -gt 0 ]; then
  command -v cwebp >/dev/null || { echo "cwebp not found. Install it with: brew install webp" >&2; exit 1; }
  for f in "${stills[@]}"; do
    name=$(basename "${f%.*}")
    w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/ {print $2}')
    h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/ {print $2}')
    resize=()
    if (( w >= h && w > 4096 )); then resize=(-resize 4096 0); elif (( h > w && h > 4096 )); then resize=(-resize 0 4096); fi
    cwebp -quiet -q 90 -m 6 -sharp_yuv ${resize[@]+"${resize[@]}"} "$f" -o "$OUT/$name.webp"
    echo "still  $OUT/$name.webp"
  done
fi

videos=("$RAW"/*.{mp4,mov,webm})
if [ ${#videos[@]} -gt 0 ]; then
  command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it with: brew install ffmpeg" >&2; exit 1; }
  for f in "${videos[@]}"; do
    name=$(basename "${f%.*}")
    # Generators don't always deliver exactly 16:9 (Seedance gave 1948x1064); trim the excess evenly.
    filters="crop=trunc(min(iw\\,ih*16/9)/2)*2:trunc(min(ih\\,iw*9/16)/2)*2"
    if [[ "$name" == *.reverse ]]; then
      name=${name%.reverse}
      filters+=",reverse"
    fi
    ffmpeg -loglevel error -y -i "$f" -an -vf "$filters" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/$name.mp4"
    # The last frame, for a seamless crossfade from the video to the still plate.
    ffmpeg -loglevel error -y -sseof -0.3 -i "$OUT/$name.mp4" -update 1 -q:v 2 "$OUT/$name-last.jpg"
    echo "video  $OUT/$name.mp4 (+ $name-last.jpg)"
  done
fi

du -sh "$OUT"
