# Build recipe

Copy the closest reference project (`~/videos/client-vs-agency-ep4` for dialogue-over-diagram, `ep3` for narrator) and keep its conventions.

## Project scaffold

```
lines.txt        NN|SPK|text            (SPK: K Kate, R Rex, N narrator)
times.py         Kokoro/Sarvam word timings (no timestamps from those engines)
tts_el.py        final ElevenLabs pass, per line, /with-timestamps
build.py         writes compositions/frames/main.html + index.html + timing.json
assets/          fonts brand sfx music voice voice_kokoro voice_el
renders/
```

Fonts, brand, sfx and `music/room.wav` + `music/sting.wav` copy straight from any existing episode.

## Voices

Draft (free): `npx --yes hyperframes@0.8.50 tts "<line>" -v <voice> -s <speed> -o /tmp/x.wav </dev/null` — the `</dev/null` matters, otherwise npx eats the while-read loop's stdin. Kate `af_heart` 0.97, Rex `am_adam` 1.05, narrator `bm_george` 0.92. Trim with `silenceremove` both ends.

Phone filter when a character is on a call: `highpass=f=320,lowpass=f=3200,acompressor=threshold=-18dB:ratio=4,volume=1.25`.

Final: `tts_el.py` — one call per line with an acting cue in brackets, `/with-timestamps`, then trim at the real speech onset (v3 alignment start times run late; take `min(alignment_start - 0.12, energy_onset - 0.04)`). Word times come from the alignment. Costs about 350 to 500 credits for a full episode.

Word timings for engines without timestamps (`times.py`): find the voiced regions with `silencedetect`, then spread words across them in proportion to word length. Good enough for captions and cue timing.

## Timing model in build.py

```python
GAP = {...}            # gap BEFORE each line; NEGATIVE = the next speaker cuts in
for n in ORDER: t += GAP[n]; L[n] = t; t += VO[n]['dur']
```

`W(n, 'word-prefix')` returns the absolute time of a word, and every visual cue hangs off it, so the animation follows the read rather than a guessed clock.

**Interruptions:** clip the interrupted line's tail (0.2 to 0.3s with a 50ms fade), drop its caption words past the new end, and give the interrupter a negative gap of 0.25 to 0.35s. Both halves are needed.

**Comedic pauses** live in GAP. Kate's escalating waits in Ep 1 were 0.45, 0.7, 1.0, 1.25.

## Captions

Split each line into phrases (sentence end, or 5 words max). Each word starts `display:none` and is set to `inline-block` at its own time, so the box grows word by word and nobody can read the punchline early. Speaker chip on the left of each caption.

## Layout rules learned

- **One card per person, and only one.** Rex with a corner card plus a top bar carrying his name and voice meter read as two Rexes. Mirror the cards in the bottom corners and give each a coloured label.
- Put name tags and status chrome **outside** the zooming camera div, or the zoom crops them.
- Anything that must survive a punch-in belongs at x 100 to 980 when the camera scales 1.2 with origin near centre.
- SVG node labels do not wrap: give small nodes a smaller font class or the text spills outside the box.
- Stick figures sitting on furniture: draw the legs frontal (knees out, shins down) and keep the character layer above the furniture front, or the legs vanish.
- Hide every overlay (`.doc`, tracking boxes, corner cards, title, wait pill, charts) at `END_CARD + 0.3`, otherwise the checker reports text bleeding through the end card.

## End card

Yellow flood, text revealed with the voiceover, then the URL. Keep the headline under about 6 words; crowding was a specific complaint. Lines land one at a time, so the card never shows everything at once.

Short format (Ep 9): 5.5 to 6.5 s, two voiced lines. The pattern that shipped: a two-line headline set with an explicit `<br>` (auto-wrap broke "not- / Nike"), a big punch line under it, the sketch's device re-drawn large for the viewer (a white form card, fields at 60px+ type), a RecurPost logo stamp that pops in (GSAP owns its centring and tilt via `xPercent/yPercent/rotation`; a CSS `transform` on it clashes with the pop), then the claim line and recurpost.com. Keep the stamp off the text the joke depends on (on the card's bottom edge, not over the fields). Spread the content down the full 1920 height; the first version sat in the top half.

## Fitting a short reel into 20 s

In this order, until `TOTAL` is 20.0 or less:
1. Gaps between lines: 0.1 to 0.25 s. ElevenLabs takes already carry about 0.38 s of tail.
2. Hold before the end card 0.65 to 0.75 s. After the last word, hold 1.2 to 1.5 s with a happy payoff beat already in motion (character celebrates, a warm resolving sting, the URL held) and a 0.3 s audio fade. Screen Time v2 cut 0.5 s after "log off" and Dinesh called it abrupt: "something happy should show up there to make the impact". Take that time from the silent headline hold, not from the stare.
3. End-card voiceover `atempo` up to 1.12 (set a `TEMPO` dict in tts_el.py and divide word times by it). Never speed up the sketch's dialogue, and never the final RecurPost line: at 1.08 Dinesh heard "RecurPost finds the best time" as rushed (Ep 10). Leave it at natural speed with about 0.2 s of breath before it.
4. The stare before the punch goes last and never below about 1.0 s.
If it still doesn't fit, cut a line and re-run the flow check.

**v3 alignment can be garbage on short lines.** In Ep 9 "Great. And the budget?" came back with the last three words squeezed into 0.1 s. When a cue hangs off a word (a field lights up on "budget"), check the word times against `silencedetect` and set them by hand (an `OVERRIDE` dict in tts_el.py) instead of trusting the alignment.

**Late v3 alignment on whole lines (Ep 10):** besides squeezed words, v3 put some lines' words 0.4 s late and kept 0.8 s of silence after "My mom." (alignment end past the speech). Compare every take's word times with `silencedetect`; fix with `OVERRIDE` word times and a `CLIP_END` hard end in tts_el.py. Long pauses INSIDE a take (0.7 s after "Strategy.") are shortened with `compress.py` (cuts + word-time shift, run after tts_el.py; copy from ep10). Whisper disagreeing with the script on one word ("then" heard as "that" by three models) = retake that line, about 20 credits.

**Keep v3 acting cues short (2 to 4 words).** Ep 11: a long cue ("[sheepish, knows it will not fly but tries anyway, hopeful little smile, trailing up into a question]") was partly read aloud before the line. If it happens, salvage the take with `CLIP_START` in tts_el.py (seconds dropped from the front) instead of paying for a retake, and transcribe the result.

**The container adds up to 0.1 s:** a 19.99 s TOTAL rendered to a 20.1 s file. Aim for TOTAL 19.87 or less and check the rendered file with ffprobe.

**Checker gotchas in this builder:** strike-through bars animated with `scaleX` must get their initial scale from `gsap.set`, not a CSS `transform` (`gsap_css_transform_conflict`); greyed struck text needs about 3:1 contrast (`#6A6878` on the chip, not `#9A98A6`); give every sound effect its own audio track index (`20 + j`) so the checker doesn't flag overlaps.

## Sound

`room.wav` under the whole sketch, `sting.wav` at the end card (volume 0.35), plus `click` / `pop` / `thunk` / `whoosh` / `tick` on visual beats. Synthesize new one-shots with ffmpeg `aevalsrc` when a beat needs something specific (use `gt(t,x)` not `(t>x)` in expressions).

## Checks before rendering

```bash
python3 build.py
npx --yes hyperframes@0.8.50 check .          # must be 0 errors
npx --yes hyperframes@0.8.50 snapshot --at <beat times> --no-end --describe false -o snaps .
```

Read the contact sheet. Look for: text outside boxes, overlays clipped by zooms, elements hidden behind other elements, and anything that appears before the line that explains it.

## Known gotchas

- `CH` in build.py is the canvas height. Never shadow it with a local variable; the page renders black.
- GSAP `random(...)` values fail the determinism check. Compute a value instead.
- `tl.set` with `textContent` is how counters and stamps update; keep them deterministic.
- Kokoro and ElevenLabs disagree on runtime by about 15 percent; re-check length after the final pass.
- A whole-file transcript drops words under sound effects. Verify per clip.

## Render and finish

```bash
npx --yes hyperframes@0.8.50 render . -o renders/<slug>-draftX.mp4
NOCAPS=1 python3 build.py && npx --yes hyperframes@0.8.50 render . -o renders/<slug>-draftX-nocaps.mp4
python3 build.py    # restore the captioned build
ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k out.mp4
# single-pass loudnorm can land 1 dB hot on short reels (Ep 11: -12.9): measure with ebur128 and apply a volume= correction to hit -14.0
```

Open the result for Dinesh with `open`. He cannot see files you only describe.

## Camera moves (Dinesh, Ep 7)

- In a split screen, punch-ins on one panel near the ending "look weird": the frame stops being two equal panels. Hold the ending steady and let the content (stamps, notes, captions) carry the payoff. One early punch-in to show a visual gag is fine.

## Staging (Dinesh, Ep 5)

- Characters in conversation face each other, not the camera. The Ep 1 heads are frontal; for a two-shot, wrap the facial features in a `<g transform="translate(±20 0)">`, make the far eye or lens smaller, and add a small nose bump on the facing edge (see `client-vs-agency-ep5/build.py`, `rex_svg` / `kate_svg`). Kate faces left when she stands on the right; Rex faces right when he sits on the left.

## Arms that hinge at the shoulders (Ep 8)

When sleeves pivot at the shoulders instead of the chest centre, the rotation sign that opens an arm is + for the left arm and - for the right. Gestures written as (-a, +a) cross the arms over the chest (Dinesh: "he crosses his hands, that looks weird"). Ep 8's pose() mirrors any angle above 20 degrees; snapshot every gesture beat.

## ElevenLabs v3 truncates takes

Some v3 takes end before the last word finishes (Ep 8 r3 "get out of the way" cut mid-word: alignment ran to 4.16 s in a 4.00 s file). After a pass, flag any take whose last alignment time is past the file duration and re-take it. Trim tails at alignment end + 0.38 s with a 0.12 s fade; +0.18 clipped word endings.

## Instagram safe zone and full-bleed frame (Dinesh 2026-09-25)

The reels up to Ep 11 "were cut on the sides a bit and looked like something was missing" on Instagram. Cause: on tall phones IG scales 9:16 to fill the screen height and trims about 60 to 100 px off each side, and its like/comment/share rail covers the right edge. Name tags sat 60 px from the edge and the set ran edge to edge, so they got clipped. The old layout also parked the scene in a 1080x1080 square with flat bands above and below, which read as empty.

- **Full bleed:** the set's background (wall, floor, paper, light) fills the whole 1080x1920 canvas. No flat colour bands; the title chrome floats over the scene.
- **Safe box for anything that matters** (faces, props the joke needs, name tags, screen text, captions, end-card text, the URL): x 110 to 940 (the right side keeps about 140 px clear for the IG button rail), y 230 to 1480. Decoration may go past it; nothing readable may.
- **Captions** sit inside y 1240 to 1480, never lower: IG's username/caption overlay covers the bottom ~420 px.
- **Title chrome:** "Client vs Agency 😅" pill plus the reel title, and "Wait for the end 😂", all within y 120 to 330 and centred. No "EP N" anywhere.
- Check it: render a snapshot with a 110/140 px side crop and a 420 px bottom band shaded (`safe_overlay` debug flag) and confirm nothing readable is cut.

## Covers and thumbnails, v2 (Dinesh 2026-09-25: "need better thumbnail too")

The v1 covers were a small screenshot of the scene under a headline, with tiny characters, an "EP 10" pill, and a "Wait for the end" sticker clipped over Kate's name tag. v2:
- **One character, big.** A close-up of the character mid-reaction (Rex smug or confused, Kate's deadpan look), drawn with the rig at 2.5 to 4x scale, face in the top two thirds, plus ONE prop from the sketch that teases the setup (the blurred liker, the half-filled form, the 12h screen time).
- **Headline:** 3 to 5 words, Bricolage 800 at 120 px or more, one word on a yellow swoosh. Tease the setup, never the punchline.
- **Grid-safe:** everything readable inside the middle 1080x1440 (y 240 to 1680) and x 90 to 990. Only the small "CLIENT vs AGENCY" pill, no episode number, no sticker overlapping anything.
- Full-bleed paper or colour background with the same grain and vignette as the reel.
- YouTube 1280x720: the same character on the left, the headline on the right (explicit `<br>`), readable at 320 px wide.

## Cards and fields need even padding (Dinesh 2026-09-25)

Brand Voice v2's end-card form had a fixed `height` that was shorter than its rows, so the Budget field ran into the card's bottom border ("weird margins around not enterprise"). Screen Time's end card had a badge riding over its row and a stamp crossing the card edge. Rules:
- Size cards with `height:auto` plus padding, or do the arithmetic (border-box: content = height - 2 x border - vertical padding) before fixing a height.
- On every end-card snapshot, zoom into each card and confirm every field, badge and stamp has even inner padding and touches no border. The shared checker does not catch this.

## Less text, big time jumps, voiced key lines (Dinesh 2026-09-26, Committee v2)

- **Crowding:** "all the text is making it a little too crowded." Show only text the viewer must read to get a joke (name tags on first appearance, the device's key state, the reveal). No decorative labels, sign text or chips that repeat the captions. One focal text element at a time.
- **No "Wait for the end" pill.** It adds no value. The title band is small and fades out after the hook (about 3 s).
- **Time jumps must be seen.** The Monday-to-Thursday chips sat out of frame and he didn't notice them. Every day or time jump is a big in-frame card (110px+, centred in the safe box, 0.8 to 1.0 s, with a whoosh) that covers the wipe.
- **Voice the line that carries the message.** "No one will have time to read that it is written." An end-card headline that IS the takeaway ("Every client has a committee.") is spoken by Kate, with the text rising on her words. Silent headlines are only for a secondary line.

## Clipping a take mid-sentence (Dinesh 2026-09-26)

Committee v2 clipped Rex's opening after "Dave from the gym." In the take he carried on, so the list ended on a rising, still-going pitch and Dinesh heard "more that was not said". When you clip a take, end it where the speaker's pitch actually falls (the end of a thought in the take, not the end of a phrase in the script), and listen to the list's last item. A list read as a list needs its last item to sound final ("And Dave from the gym.") or a closing line after it.

## The device never runs ahead of the line (Dinesh 2026-09-26, The Review v2)

Kate said "Open the top one." while the report was already open on screen. Check every device beat against its word: nothing opens, appears, counts or unblurs before the line that asks for it or names it. An action a character performs (a tap, an open) happens after the instruction, with a visible cause (a finger tap, a ripple). Also avoid bare time phrases a viewer can misread: Rex's "Last month. Is it working?" read as a fragment; "Four months in. Is it working?" also plants a later payoff.

## Brand name in Hindi voices (Dinesh 2026-09-26)

"Our name should be said like we say in English." In Hindi reels, the RecurPost line is said in ENGLISH as its own sentence (Dinesh 2026-09-26: "say it in English because when we say RecurPost in Hindi it sounds weird"), or better, don't say the brand at all and let the stamp carry it. Payment Pakka shipped "Payment hum nahi dilwa sakte, but we'll take care of the posting." followed by the RecurPost stamp and recurpost.com (Dinesh's wording) Never spell RecurPost in Devanagari (री कर पोस्ट made Anika say it wrong). Keep it Roman or give it its own English take, and have Dinesh pick by ear. Check the cost of one ElevenLabs sample before making several: an Indian library voice cost about 27 credits per 4.6 s line, not the 3 to 5 assumed.

## Put key text where the eye already is (Dinesh 2026-09-27, Pick Your Brain)

The PSA warning signs slammed onto the wall board above the characters, in sync with the narrator, and Dinesh "did not follow the spoken words to the warning signs the first time... I focused on those two characters." Viewers watch the faces. A card that carries the joke's structure must land where the viewer is already looking. The fix that worked: on the cue word the scene dims (freeze) and the card slams big across the middle of the frame, over the faces, holds about 1.1 to 1.3 s, then shrinks and flies to its home on the board, so the board fills up as the reel goes on. Characters hold still (or keep a pose) while it's up; nobody speaks over it except the narrator reading it.

## Punch-ins that crop the device (Dinesh 2026-09-27, Real People)

"After the team the zoom on Kate and Rex looks weird." Two 1.5x punch-ins (Kate on her line, Rex on the stare) became medium shots that cut the wall screen in half, clipping the watermark the joke depended on, then a hard cut back to wide landed on the punch. When the device carries the joke, keep it whole in frame through the turn: hold a two-shot that shows the device and both faces, creep in slowly (about 1.04 to 1.13) during the stare, stop before the punch, and hold.

## Upgrading an old reel: keep its layout (Dinesh 2026-09-29, Committee Hindi)

A from-scratch kit rebuild of the old Committee (new rigs, new panel geometry) came out "all mixed and jumbled up"; Dinesh: "The earlier version was a lot better. The visuals were clearer." When an existing reel needs a new cut, a rename or the living-cartoon motion, copy its project and adapt its own build.py: keep the framing, props and positions, re-time to the new voices, and add acting inside the existing layout (head/arm transforms, looks, blinks, boil, squash on changes, motivated camera). Never re-lay out a scene the owner already found clear.
