# RecurPost — 6 s YouTube bumper (16:9)

**Deliverable:** `out/RecurPost_Bumper_6s_16x9.mp4`. 1920×1080, 30 fps, H.264 High, AAC 48 kHz stereo, 6.000 s.
**Alternate:** `out/RecurPost_Bumper_6s_16x9_alt_side-lockup.mp4` uses the same spot with the logo and CTA side by side on the end card.

```
python3 bumper/vo.py        # exact-script VO -> audio/bumper/vo{0,1,2}.wav (Kokoro af_heart @ 1.2x)
python3 bumper/audio.py     # music + SFX + VO -> audio/bumper/mix.wav (-14 LUFS, true peak -1.9 dBFS)
node bumper/render.js video # -> out/bumper_silent.mp4   (END_LAYOUT=side for the alternate end card)
ffmpeg -i out/bumper_silent.mp4 -i audio/bumper/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k \
       -t 6 -movflags +faststart out/RecurPost_Bumper_6s_16x9.mp4
node bumper/render.js sheet 0.25   # QA contact sheet -> out/bumper_contact_sheet.png
```

`bumper/timeline.js` holds all timing: scene bounds, click grid, VO placement and SFX cues.

## Beats as built

| Time | Visual | Copy | VO |
|---|---|---|---|
| 0.00–1.50 | Five post cards enter one after another, already moving on frame 0. The cursor clicks each card's clock control on the 8th-note grid (0.25 / 0.50 / 0.75 / 1.00 / 1.25 s). Each control fills yellow and turns into a check. | STILL SCHEDULING / ONE POST AT A TIME? | 0.05–2.24 "Still scheduling client posts one at a time?" |
| 1.50–3.80 | Cards hold, then sweep into the first client row of an abstract calendar (4 client rows × 7 days). One click on the bulk-action control at 2.55 s fills every remaining slot in a diagonal cascade. A check confirms at 3.30 s. | **BATCH SCHEDULE** (yellow band) / WITH RECURPOST | 2.32–3.82 "Batch schedule with RecurPost." |
| 3.80–6.00 | Slanted yellow brand wipe, then the end card. Logo in by 4.42 s, CTA in by 4.56 s. The frame is static from 4.56 s to 6.00 s. | Logo · TRY RECURPOST FREE | 4.28–4.95 "Try it free." |

## Brand and compliance
- The logo is `assets/brand/logo_dark_text.png`, which matches the supplied file to within WebP→PNG rounding (≤0.5%, alpha identical). It is drawn at its native 2000:245 ratio with no recolor, crop, shadow or effect. Only its position and opacity animate during entry.
- The palette is sampled from the logo: yellow `#FFCD42` and charcoal `#1F1F1F`, on a warm off-white.
- The UI is abstract: bars, shapes and icons only. It has no interface text, platform logos, metrics, URL, pricing or claims. The only words on screen are the three supplied lines.
- Critical copy and the logo sit inside 10% title-safe. The stacked end card spans x 421–1499, the side lockup x 215–1703.
- Audio is synthesized in code with no stock or library material. The music is 120 BPM: a light kick/hat pulse, plucked arp and synth lift into a sting on beat 8 (4.0 s). SFX are 6 soft clicks, 2 whooshes and 1 confirmation.

## Known trade-off
At a natural pace, the VO's first line (~2.2 s) is longer than the 1.5 s Scene 1, so it runs about 0.7 s into the start of Scene 2, over the pause and the sweep. "Batch schedule" still lands with its on-screen copy. The alternative was a ~1.5× read, which sounded rushed.
