# Worked example: one short reel, premise to shot plan

Based on Ep 9 "Brand Voice" (short, Track B, Onboarding) as recorded in
`.claude/skills/agency-reel/reference/series-bible.md` and `SKILL.md`. The spoken lines
below are reconstructed from the beats the skill documents, so treat the wording as
illustrative, not the shipped script.

## Step 1: premise

- **Pain:** the onboarding brief that contradicts itself (area: Onboarding).
- **Why it was allowed:** the last two reels were different areas.
- **Length:** short, because it is one device and one turn: a form on the wall that is
  visible and empty from frame one.
- **Track B:** no product demo; RecurPost appears only on the end card.
- **Game in one sentence:** Rex describes his brand with "X. But Y." pairs until the
  brief is Nike, and then Kate asks the budget.

## Step 2: script (rule of three)

| # | Line | Job |
|---|---|---|
| 1 | Rex: "Professional. But fun." | Teach the pattern (chip strikes itself out) |
| 2 | Rex: "Edgy. But safe." | Pattern again |
| 3 | Rex: "Sounds like: Nike." | Set a bar |
| 4 | Kate: "And the budget?" | Active straight man, precise question |
| 5 | (stare, longest silence) | Pause before the punch |
| 6 | Rex: "Not Nike." | Punch lands where the viewer didn't guess |

Audit highlights:
- **Full joke:** draft 1 ended on a shrug ("You'll know it when you see it."). Rejected as "half a joke". The fix was the third beat that breaks the pattern.
- **Flow:** each line answers the one before.
- **Screen vs line:** the Budget field sits visible and empty from frame one. "Not Nike." types in red only on the punch word.

## Step 3b: shot plan (excerpt)

| Line | Intensity | Frame | Camera | Device shows | Hold |
|---|---|---|---|---|---|
| "Professional. But fun." | 2 | two-shot, Rex left, Kate right | HOLD | chip appears, then strikes | 0.2 s gap |
| "Edgy. But safe." | 3 | same | slow push-in (emphasis) | second chip strikes | 0.45 s |
| "Sounds like: Nike." | 3 | Rex medium | settle before the line | Sounds like: Nike types in | 0.7 s |
| "And the budget?" | 4 | Kate close-up | punch-in on her | Budget field highlighted, still empty | 1.4 s (longest silence) |
| "Not Nike." | 5 | two-shot, camera holds | HOLD | red "Not Nike." types in | 1.0 s laugh room |

Timing rule applied: gaps escalate (0.2, 0.45, 0.7, 1.4 s) so each beat waits a little longer.

## Step 3-4: voices and build

- Kokoro drafts: Kate `af_heart`, Rex `am_adam`. Draft target is about 18 s, because ElevenLabs runs about 15% slower.
- `kit/new_reel.sh brand-voice`, then fill the five marked sections in `build.py` (device HTML, extra CSS, choreography, end card, SFX).
- `python3 build.py && npx hyperframes check .` until 0 errors, then snapshot every beat.
- `TOTAL` must print at or under 20.0 s; over is a failed build.

## End card (second beat, never a recap)

- Rejected v1: "Nike taste. Not-Nike budget." It re-explained the joke.
- Shipped v2: reuse the form, turn it on the viewer kindly: *"Your clients want Nike on a
  not-Nike budget. So do you."* Then a RecurPost reason that closes the form's own
  fields: *"Sounds like enterprise. Priced like it isn't."* with a stamp and recurpost.com.

## What this teaches

1. The device holds the answer from frame one, and the line triggers the reveal.
2. Silence is written into the plan, not left to chance.
3. Rejections are logged as rules, so mistakes are not repeated.
