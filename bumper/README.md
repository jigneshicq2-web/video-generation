# RecurPost — 6 s YouTube bumpers (16:9)

| # | Spot | Deliverable | Alternate (logo and CTA side by side) |
|---|---|---|---|
| 1 | `batch`: "Batch schedule" | `out/RecurPost_Bumper_6s_16x9.mp4` | `out/RecurPost_Bumper_6s_16x9_alt_side-lockup.mp4` |
| 2 | `where`: "Where's the post?" | `out/RecurPost_Bumper2_WheresThePost_6s_16x9.mp4` | `out/RecurPost_Bumper2_WheresThePost_6s_16x9_alt_side-lockup.mp4` |

All files are 1920×1080, 30 fps, H.264 High, AAC 48 kHz stereo, exactly 6.000 s, mastered to about −14 LUFS with true peak ≤ −1.9 dBFS.

```
SPOT=where                                  # or batch
python3 bumper/vo.py $SPOT                  # exact-script VO -> audio/bumper/$SPOT/vo{0,1,2}.wav (Kokoro af_heart @ 1.2x)
python3 bumper/audio.py $SPOT               # music + SFX + VO -> audio/bumper/$SPOT/mix.wav
node bumper/render.js $SPOT video           # -> out/bumper_${SPOT}_silent.mp4 (END_LAYOUT=side for the alternate end card)
ffmpeg -i out/bumper_${SPOT}_silent.mp4 -i audio/bumper/$SPOT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k \
       -t 6 -movflags +faststart <deliverable>.mp4
node bumper/render.js $SPOT sheet 0.25      # QA contact sheet -> out/bumper_${SPOT}_contact_sheet.png
```

## Structure
```
bumper/lib.js                     shared: palette, type, easing, icons, background, card parts, yellow wipe, end card, frame driver
bumper/spots/<spot>/timeline.js   timing source of truth: scene bounds, VO placement, SFX cue sheet
bumper/spots/<spot>/scenes.js     that spot's Scene 1–2 drawing
bumper/render.js                  CLI
bumper/vo.py, bumper/audio.py     VO and soundtrack (shared music bed; per-spot cues)
```
Every spot in the series shares the same yellow wipe at 3.76 s, the same end card (static from 4.56 s), the same 120 BPM bed and the same sting on beat 8 (4.0 s). That gives the bumpers a consistent sonic and visual signature.

## Video 1 — "Batch schedule"
| Time | Visual | Copy | VO |
|---|---|---|---|
| 0.00–1.50 | Five post cards enter. The cursor clicks each card's clock control on the 8th-note grid, and each control turns into a check. | STILL SCHEDULING / ONE POST AT A TIME? | 0.05–2.24 "Still scheduling client posts one at a time?" |
| 1.50–3.80 | The cards sweep into the first client row of an abstract calendar. One bulk-action click at 2.55 s fills every slot, and a check confirms at 3.30 s. | **BATCH SCHEDULE** / WITH RECURPOST | 2.32–3.82 "Batch schedule with RecurPost." |
| 3.80–6.00 | Yellow wipe, then the end card. | Logo · TRY RECURPOST FREE | 4.28–4.95 "Try it free." |

Trade-off: the first VO line (~2.2 s) runs about 0.7 s past Scene 1 into the pause/sweep, because reading it fast enough to fit 1.5 s sounded rushed.

## Video 2 — "Where's the post?"
| Time | Visual | Copy | VO |
|---|---|---|---|
| 0.00–1.50 | Five post cards and a small calendar widget drift in, scattered. A client message pops in beside them at 0.28 s with one notification ping. | CLIENT ASKING: / ‘WHERE’S THE POST?’ · message: "Where’s the post?" | 0.04–1.60 "Client asking, 'Where's the post?'" |
| 1.50–3.80 | The widget opens into the full calendar while the cards sweep into their slots (two whooshes). The status legend appears, the rest of the calendar fills, and a confirmation plays when the view settles at 2.42 s. At 2.62–2.92 s the post from the message is located: the rest dims, and the post lifts with a yellow ring while the camera pushes in slowly. | KEEP EVERY CLIENT POST **IN VIEW** · Scheduled · Published · Drafts · Failed | 1.70–3.74 "Keep every post in view with RecurPost." |
| 3.80–6.00 | Same wipe and end card as Video 1. | Logo · TRY RECURPOST FREE | 4.28–4.95 "Try it free." |

- **Status encoding:**
  - Scheduled: yellow clock.
  - Published: charcoal check.
  - Drafts: dashed outline, faded.
  - Failed: red "!".
- **Failed posts:** red is a functional accent outside the brand palette. It is used on exactly one of 19 posts, so a failure reads as one status among many and the spot makes no promise that posts never fail.
- **Continuity:** the located post is the same card that sat next to the client's message in Scene 1, carrying the same artwork.
- **Brief inconsistency kept as written:** the on-screen line says "CLIENT POST" while the VO says "every post", exactly as the brief specifies.

## Brand and compliance (both spots)
- **Logo:** `assets/brand/logo_dark_text.png` matches the supplied file to within WebP→PNG rounding (≤0.5%, alpha identical). It is drawn at its native 2000:245 ratio with no recolor, crop, shadow or effect. Only position and opacity animate on entry.
- **Palette:** sampled from the logo: yellow `#FFCD42` and charcoal `#1F1F1F` on a warm off-white.
- **UI:** abstract bars, shapes and icons. There are no platform logos, metrics, URL, pricing, quotes or claims. The only words on screen are the phrases each brief specifies.
- **Safe area:** critical copy and the logo sit inside 10% title-safe (x 192–1728).
- **Audio:** synthesized in code with no stock or library material, so it is cleared for commercial use.
- **Not verified by a human listener:** the TTS voice and the mix. Review them on headphones before trafficking.
