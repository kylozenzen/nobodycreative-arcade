#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OUTPUT="$ROOT/nobody-arcade-phase2-netlify.zip"

cd "$ROOT"
rm -f "$OUTPUT"
zip -qr "$OUTPUT" . \
  -x '.git/*' \
  -x 'scripts/*' \
  -x 'nobody-arcade-phase2-netlify.zip'

if ! unzip -Z1 "$OUTPUT" | grep -qx 'index.html'; then
  echo "Packaging failed: index.html is not at the archive root." >&2
  rm -f "$OUTPUT"
  exit 1
fi

echo "Created $OUTPUT"
