# Agency reel cheat sheet (read this, not the six guides)

Distilled from sketch-craft.md, visual-storytelling.md, animation-craft.md, script-audit.md, build-recipe.md and motion-style.md (2026-09-28). Open a full guide only when a check below fails and you need the why, or when a situation isn't covered here.

## Script (Step 2): every answer must be yes

**Shape**
1. Game in one sentence, no "and also". One device on screen from frame one, and it orients the viewer muted (name tags, title band, the device).
2. First unusual thing by 3 s (short) or 6 s (long). Long: first laugh by 8 s, no hook monologue.
3. Rule of three: teach the pattern twice, the third beat breaks it somewhere true but unguessable. Stop after beat two and guess; if the guess is the punch, rewrite.
4. A full joke: setup, turn, punch, optional face-saving button from Rex. Never end on a shrug, "Saved.", "Noted." or a restatement.
5. The turn uses what's already on screen (his words, his data, the device). Nothing new arrives at the end.

**Flow (check 11; do it first, out loud)**
6. Each line answers the one before. Delete a line: if the next still makes sense, they weren't connected.
7. Every prop, screen or person is asked for or mentioned before it appears. Motives and stakes are said in dialogue, not stage directions.
8. Nobody asks a question the screen already answered. Kate states what she sees; Rex's punch rebuts her.

**Characters**
9. Rex is sincere, proud, never winks. He cracks gradually: deny, spin, crack, face-save. He engages with everything in front of him; his flaw shows in HOW.
10. Kate is the active straight man: a precise question or a move (she dials the number), never just "that's weird". She never joins the bad path, never snoops his data, has RecurPost and never acts like she lacks it. She wins without raising her voice.
11. The agency side, juniors and the viewer are never the butt. Every change in behaviour has a stated reason.
12. Specific and believable: Rex's shop is small (tens of clicks, $850 retainers). Evergreen: no dates, months or "this Friday" on screen or in dialogue.

**Screen versus line**
13. The punch's slot is visible and empty from frame one. The device never answers before the character (reveal on the punch word). Anything the joke needs is also said out loud.
14. No brand name straight after a name-shaped slot ("his name" then "RecurPost...").

**End card**
15. A second beat, never a recap. It reuses the sketch's device, speaks to the agency owner's own situation kindly, and gives one verified RecurPost reason (grep the repo). The screen acts out the claim on the words that say it. It closes its own device; no new idea.

**Length**: short = 5 to 7 lines, Kokoro draft near 18 s, final at most 19.87 s. Long = 3 to 5 small scenes, 45 to 75 s final, 6 to 9 s end card. ElevenLabs runs about 15% slower than Kokoro.

## Timing
- Gaps escalate: 0.15 to 0.3 s early, then 0.45, then 0.7 with a look, the longest silence (1.3 to 1.5 s, or a staged 2 to 2.5 s beat) right before the punch, and 1.0 s of laugh room after it.
- To fit 20 s, trim in this order: gaps (0.1 to 0.25 s), the silent headline lead (0.85 s minimum), end-card atempo up to 1.12 (never on the RecurPost line), and never the stare below 1.0 s.

## Shot plan (Step 3b)
- One focal point per shot. Rex stays left and Kate right; they face each other.
- Every camera move needs a reason (reveal, emphasis, reaction, transition, release), otherwise HOLD. The camera settles 6 to 10 frames before the punch and holds at least 1.0 s after it.
- Punch-ins go on the listener's reaction. Never crop the device the joke depends on, or half a face; keep it to 1.1x or less when both people matter.
- Mood or colour shifts only at the turn. Every gag gets a sound accent plus a visual accent (shake, flash, squash).
- Safe box: x 110 to 940, y 230 to 1480. Captions sit at y 1240 to 1480. The title band fades after the hook.

## Acting (rig)
- Rex acts with brows above the shades, head angle, mouth width and hands. His one big take is lowering the shades (use sparingly).
- Kate acts with stillness, lid:1, slow blinks of 10 to 14 frames, small head tilts and one big move at most.
- One big move at a time. Moving holds, not freezes. Eyes lead the head.
- Accents land 2 frames before the stressed syllable. Asymmetric eases (power3.out, back.out); sine only for drifts.

## Voices
- Kokoro drafts are free (Kate af_heart 0.97, Rex am_adam 1.05, narrator bm_george). Deep or phone voices are ffmpeg filters on the draft.
- ElevenLabs runs once, on the approved cut. Edit takes.json, then grep it before any paid run. Keep cues to 2 to 4 words.
- A caught-out character is cued playful, never defensive.
- If v3 clips the last word, add SUFFIX " [pause]" and retake. Transcribe each clip with whisper; check word times against the energy envelope and fix them with OVERRIDE.

## Build checks
- Snapshot every beat and actually look. Snapshots are where the bugs show up: crops, overlapping chips, a glow still on after its cause is gone, text through the end card.
- Cards use height:auto and even padding. Any seek-safe motion runs through tick(). Each element has one driver. Every SFX gets its own track index.
- Loudnorm, then measure and apply a volume= correction to land -14.0 LUFS. Check the file length with ffprobe.
- Covers: one character big, a headline that teases the setup (never the punch), no episode numbers. Bake the cover into the first 0.1 s of both cuts.
