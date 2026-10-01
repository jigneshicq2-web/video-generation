#!/usr/bin/env bash
# Scaffold a new Client vs Agency reel project from the agency-reel kit.
#
# Usage: new_reel.sh <slug> [Title Words...]
#   slug         lowercase-dash project slug, e.g. "onboarding-drift"
#   Title Words  optional human title for the docstring/headline placeholders (default: Title Cased slug)
#
# Creates ~/videos/agency-reel-<slug>/ with the kit's Python files (copied, so this and every other
# project stay frozen against future kit changes), the shared assets (fonts/brand/sfx/music), empty
# assets/voice + renders + thumb dirs, thumb fonts + a template make_covers.py, package.json/
# hyperframes.json/meta.json (meta id/name set to the slug), and a template build.py with clearly
# marked sections (device/screen HTML, extra CSS, choreography, end card, SFX) to fill in.
set -euo pipefail

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "usage: new_reel.sh <slug> [Title Words...]" >&2
  exit 1
fi
shift || true
if [[ $# -gt 0 ]]; then
  TITLE="$*"
else
  TITLE="$(echo "$SLUG" | sed -E 's/-/ /g; s/(^| )([a-z])/\1\U\2/g')"
fi

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$HOME/videos/agency-reel-finance"          # source of shared assets + baseline config
DEST="$HOME/videos/agency-reel-$SLUG"

if [[ ! -d "$SRC" ]]; then
  echo "expected the reference project at $SRC (assets/config source) — not found" >&2
  exit 1
fi
if [[ -e "$DEST" ]]; then
  echo "$DEST already exists — pick a different slug or remove it first" >&2
  exit 1
fi

echo "Scaffolding $DEST ..."
mkdir -p "$DEST"

# ---- kit Python files (copied, not symlinked, so a project stays frozen if the kit later changes)
for f in reel_kit.py motion_kit.py parts.py times.py el_call.py fix_tails.py compress.py tts_el.py gen_sfx.py; do
  cp "$KIT_DIR/$f" "$DEST/$f"
done

# ---- shared assets (fonts/brand/sfx/music) copied from the reference project
mkdir -p "$DEST/assets"
for d in fonts brand sfx music; do
  cp -R "$SRC/assets/$d" "$DEST/assets/$d"
done
mkdir -p "$DEST/assets/voice" "$DEST/renders" "$DEST/thumb"

# ---- thumb: the two fonts it needs + a template make_covers.py
cp "$SRC/thumb/BricolageGrotesque-800.woff2" "$DEST/thumb/BricolageGrotesque-800.woff2"
cp "$SRC/thumb/Manrope-latin.woff2" "$DEST/thumb/Manrope-latin.woff2"
sed -e "s/__SLUG__/$SLUG/g" -e "s/__TITLE__/$TITLE/g" "$KIT_DIR/templates/make_covers.py.tmpl" > "$DEST/thumb/make_covers.py"

# ---- project config, copied from the reference project
cp "$SRC/package.json" "$DEST/package.json"
cp "$SRC/hyperframes.json" "$DEST/hyperframes.json"
python3 - "$SRC/meta.json" "$DEST/meta.json" "$SLUG" <<'PY'
import json, sys, datetime
src, dest, slug = sys.argv[1], sys.argv[2], sys.argv[3]
meta = json.load(open(src))
meta['id'] = f'agency-reel-{slug}'
meta['name'] = f'agency-reel-{slug}'
meta['createdAt'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
json.dump(meta, open(dest, 'w'), indent=2)
PY

# ---- template build.py, with clearly marked sections to fill
sed -e "s/__TITLE__/$TITLE/g" "$KIT_DIR/templates/build.py.tmpl" > "$DEST/build.py"

echo "Done. Next steps:"
echo "  1. cd $DEST"
echo "  2. Write lines.txt (id|SPK|text per line) and run times.py for a Kokoro draft VO, OR write"
echo "     takes.json ([[id, spk, text, cue], ...]) and run tts_el.py for the final ElevenLabs VO."
echo "  3. Fill in build.py's five marked sections (device/screen HTML, extra CSS, choreography,"
echo "     end card, SFX) — see ~/videos/agency-reel-finance/build_kit.py for the full worked pattern."
echo "  4. python3 build.py && npx --yes hyperframes@0.8.50 check ."
