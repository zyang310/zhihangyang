#!/usr/bin/env bash
# Turns raw Higgsfield exports in media-raw/ (gitignored) into web-ready files in src/assets/media/.
#   stills (png/jpg/webp)  -> JPEG, longest side 3200px (uses macOS sips; no install needed)
#   videos (mp4/mov/webm)  -> H.264 MP4, no audio, +faststart, plus its exact last frame as JPEG
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

for f in "$RAW"/*.{png,jpg,jpeg,webp}; do
  name=$(basename "${f%.*}")
  sips -s format jpeg -s formatOptions 80 -Z 3200 "$f" --out "$OUT/$name.jpg" >/dev/null
  echo "still  $OUT/$name.jpg"
done

videos=("$RAW"/*.{mp4,mov,webm})
if [ ${#videos[@]} -gt 0 ]; then
  command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it with: brew install ffmpeg" >&2; exit 1; }
  for f in "${videos[@]}"; do
    name=$(basename "${f%.*}")
    filters=()
    if [[ "$name" == *.reverse ]]; then
      name=${name%.reverse}
      filters=(-vf reverse)
    fi
    ffmpeg -loglevel error -y -i "$f" -an ${filters[@]+"${filters[@]}"} -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/$name.mp4"
    # The last frame, for a seamless crossfade from the video to the still plate.
    ffmpeg -loglevel error -y -sseof -0.3 -i "$OUT/$name.mp4" -update 1 -q:v 2 "$OUT/$name-last.jpg"
    echo "video  $OUT/$name.mp4 (+ $name-last.jpg)"
  done
fi

du -sh "$OUT"
