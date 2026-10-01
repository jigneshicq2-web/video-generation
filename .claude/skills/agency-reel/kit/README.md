# agency-reel kit

Shared build kit for "Client vs Agency" reels, extracted from `~/videos/agency-reel-finance/build.py`
(verified via `build_kit.py` there: same TOTAL, 0 `hyperframes check` errors, pixel-identical snapshots).
A new reel's `build.py` writes ~100-150 lines: device/screen HTML, extra CSS, choreography, end card, SFX.
Everything else — timing, base CSS, captions, camera/rig/idle-life, end-card chrome, writers — lives here.

## Scaffold a new reel

```bash
~/.claude/skills/agency-reel/kit/new_reel.sh <slug> ["Title Words"]
```

Creates `~/videos/agency-reel-<slug>/` with the kit's `.py` files copied in (frozen against later kit
changes), `assets/{fonts,brand,sfx,music}` copied from Finance, empty `assets/voice`/`renders`/`thumb`
(thumb gets its two fonts + a template `make_covers.py`), `package.json`/`hyperframes.json`/`meta.json`
(id/name = the slug), and a template `build.py` with five marked sections.

## What a new reel must write

1. **`lines.txt`** (`id|SPK|text`) for a Kokoro draft, or **`takes.json`** (`[[id, spk, text, cue], ...]`,
   or `{"takes":[...], "voices":{...}, "override":{...}, "clip_end":{...}, "suffix":{...}}`) for the final
   ElevenLabs pass.
2. **`build.py`**'s five sections: device/screen HTML, extra CSS (`base_css()` covers the shared chrome),
   choreography (k1/r1/k2/... beats), end card (headline, your widget(s), stamp/url/corner-card timing),
   and the SFX list. Everything else is already wired by `reel_kit.Reel`.

## reel_kit.py API

Module-level: `CW,CH` (1080x1920), palette `INK,CREAM,YEL,TEAL,RED,GRN`, `NOCAPS`/`SAFE` (from the
`NOCAPS=1`/`SAFE=1` env vars), `LIB`/`kate` (re-exported from `motion_kit`), `REST_STAND`/`REST_SIT`/
`K_FACE_DEFAULT`/`R_FACE_DEFAULT`, `load_json`/`load_voice`/`load_timing_cfg`, `rig_scale`/`rig_point`
(place a prop relative to a rig), `inner_box` (a screen's content-box origin), `base_css(extra=...)`, and
`safe_html(...)` (the IG safe box).

`Reel(root, order, end_card_order=('e1',))`:
- **Timing** (from `voice.json` + `timing_cfg.json`'s `GAP`/`LAUGH`/`E1_LEAD`/`HOLD`, defaults if missing):
  `.L`, `.EV` (2+ end_card_order ids for a multi-line card), `.END_CARD`, `.E1_SPEECH_END`, `.TOTAL`,
  `.E(n)`/`.W(n, word|idx)`/`.EW(id, word_idx)`.
- **Captions**: `.chunks(n)`, `.caps_html()`, `.caption_choreography()`.
- **Camera/acting**: `.camto(s,px,py,sx,sy,at,d,ease=)`, `.home(at,d,ease=)`, `.shot_two(at,d=0.4,...)`
  (the shared office two-shot), `.pop_(sel,at,...)`, `.speak(P,n,rest_mouth,rig_id=None)`. These, and any
  raw JS from `.A(f"...")`, append to `.js`, joined by `.write_main()`.
- **Rig/idle life**: `.rig_setup(...)` declares JS globals `K`/`R`; `.idle_life(blinks=[...], ...)` wires
  motes/steam/plant/boil. **Chrome**: `.name_tags(fade_at,...)`, `.title_chrome(out_at,...)`, `.hide_cam()`.
- **End card**: `.end_card_slide_in()`, `.headline_in(swoosh_sel=,...)`, `.stamp_slam(at,shake_sel=,...)`,
  `.url_rise(at)`, `.corner_card_kate(hold_time, pose=, face=, extra_props=(), nod=True)`,
  `.corner_card_rex(hold_time, pose=, face=, extra_props=(), brow_raise=True)` (pose/face are JS
  object-literal strings; extra_props are selectors set opacity:1, e.g. a held phone).
- **Writers**: `.scene_clip()`, `.vo_clips()`, `.sfx_clips(sfx,sdur)`, `.music_clip(id,src,start,dur,
  track_index,volume=1)`, `.write_main(out_dir,body_html,css)`, `.write_index(root,clips)`,
  `.write_timing(root,beats)` (prints `TOTAL ... BEATS ...`).

## The other kit files (copied into every new project)

- **`motion_kit.py`** — `LIB` (seek-safe GSAP: tick, boil, camera, shake, burst, fly+trail, typeSeq,
  countUp, swoosh, ripple, `rig()`) and `kate()` (jointed SVG, `phone=` prop option).
- **`parts.py`** — `rex()`, `room()`/`chair()`/`side_table()`/`tag()` (shared office set), `SCR`/`KATE`/`REX`.
- **`times.py`** — Kokoro word timings: reads `lines.txt`, writes `assets/voice/voice.json`.
- **`tts_el.py`** — final ElevenLabs pass: reads `takes.json` (+`retakes.json`), writes `assets/voice/*`.
  **Costs real credits — never run it speculatively.** `el_call.py` is the raw API call it uses.
- **`fix_tails.py`** — trims each take's tail to `speech_end + 0.22s`.
- **`compress.py`** — shortens long in-take pauses to `MAXP[id]` (`timing_cfg.json`'s `"MAXP"`, else a
  small default) and shifts word times.
- **`gen_sfx.py`** — the three optional named "phone" one-shots (`buzz`/`ring`/`hold`); pass names to
  generate just what's needed, or no args for all three.

## Build / check / snapshot / render / loudness

```bash
python3 build.py                                      # main.html, index.html, timing.json
npx --yes hyperframes@0.8.50 check .                   # must report 0 errors
npx --yes hyperframes@0.8.50 snapshot --at 0.8,3.36,... --no-end --describe false -o snaps .
npx --yes hyperframes@0.8.50 render .                  # or render --captions=false
ffmpeg -i renders/out.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -  # measure (input_i)
ffmpeg -i renders/out.mp4 -af volume=<correction-dB> renders/out_loud.mp4   # apply; re-measure to ~-14 LUFS
```
