---
name: agency-reel
description: Write, build and publish one "Client vs Agency" comedy reel for RecurPost (stick-figure Rex and Kate, 9:16, HyperFrames, a mix of SHORT reels (20 s max) and LONG reels (45 to 75 s) to break monotony, a different aspect of agency life every reel). Use when asked to make a new agency skit/reel or another Client vs Agency reel. Every reel is independent, never an episode. Handles premise selection, the script-hole audit, Kokoro draft voices, the HyperFrames build, both exports (captions / no captions), Drive upload and RecurPost scheduling. Usage - /agency-reel [premise or pain, or "next"] [--short|--long] [--track A|B] [--build-only] [--publish]
---

# Client vs Agency reel

One reel per run. Audience: agency owners. Rex is always the client-side foil, Kate is always the agency owner who wins, and the agency owner is never the butt of the joke.

## Every reel stands alone (Dinesh, 2026-09-25)

These are independent reels, not episodes of a series. Nothing a viewer sees may number or link them: no "EP N", "episode", "part 2", "series", "last time", "next week" or "follow for more episodes" on screen, on the cover or thumbnail, in the YouTube title, in captions or in Drive file names. Each reel must make sense to someone who has never seen another one. (The old ones are still named "Ep N" in folders and notes below; that is internal history, not a pattern to copy.) New project folders: `~/videos/agency-reel-<title-slug>`.

## Two lengths: mix short and long (Dinesh, 2026-09-25)

Dinesh: "We can mix small and large ones actually." A viewer commented on the nature-documentary reel ("natural habitat", Ep 3, 58 s) because they related to it: the longer format has room for recognisable detail that a 20 s joke can't hold. Shipping only 20 s reels got monotonous. So both lengths are in rotation, and every reel still covers a **different aspect of agency life**.

**Picking the length (Step 1 decides it, with the premise):**
- Look at the last three reels in the series log. Never three shorts in a row, never two longs in a row. Roughly one long in every three reels.
- **Choose long** when the premise's laugh comes from recognition piling up: a documentary or narrator parody, a day or a week in the life, a process that gets worse step by step, several small observed moments. Ep 3 (natural habitat) is the model.
- **Choose short** when it is one device and one turn: a form, a feed or a screen that holds the empty answer from frame one (Eps 9 to 11).
- Pass `--short` or `--long` to force it; say which one you picked, and why, when offering premises.

**Long reels (45 to 75 s, final ElevenLabs cut included):**
- 3 to 5 scenes or observed moments, each its own small laugh, escalating to one big turn near the end. Every scene must earn its seconds: the first laugh lands by about 8 s, and there is no hook monologue or setup scene.
- End card 6 to 9 s, same rules as short (second beat, never a recap, closes its own device).
- Budget about 350 to 500 ElevenLabs credits; ask before spending.
- Everything else applies unchanged: living-cartoon motion, the safe zone, escalating pauses before each turn, a full joke, no episode numbers. Don't go past 75 s: Eps 4 and 5 ran 105 s and were too long.
- Reference: `~/videos/client-vs-agency-ep3` (structure) and The Intern v2 at `~/videos/agency-reel-the-intern-v2` (a 95 s living-cartoon rebuild; use it for the motion, not the length).

## Short reels (20 s max)

- **20.0 seconds maximum, final ElevenLabs cut included.** Budget: about 13 to 14 s of sketch plus a 5.5 to 6.5 s voiced end card. The Kokoro draft should land near 18 s, because ElevenLabs reads about 15% slower.
- **5 to 7 spoken lines, one set, one device, one joke.** No scene changes, no secondary characters who need introducing, no hook monologue. Name tags, the title band and the on-screen device orient the viewer in the first second.
- **A full joke, not half of one.** Ep 9 draft 1 ended on a shrug ("You'll know it when you see it." / "Saved.") and Dinesh called it "half a joke, not a full one". The shape that worked: teach a pattern twice, set a bar, then land the third beat somewhere the viewer didn't expect (in Ep 9: "Professional. But fun. Edgy. But safe." / "Sounds like: Nike" / "And the budget?" ... "Not Nike."). The answer should be sitting on screen, visible and empty, from the first frame.
- **Escalating pauses, not an even rhythm** (Dinesh, Ep 11: "it needs better pauses"). Early exchanges snap (0.15 to 0.3 s gaps), each later beat waits a little longer (0.45, then 0.7 with a look), the longest silence (1.3 to 1.5 s) sits right before the punch, and there is about 1 s of laugh room after the punch before the end card slides in. Pay for it by making the end-card headline text only and voicing just the RecurPost line. Reference for timing: Cyanide & Happiness (the silent beat), Corporate Natalie (the look before the reply).
- **The end card is a second beat, never a recap.** Ep 9's first card ("Nike taste. Not-Nike budget.") re-explained the joke and was rejected. The card that shipped reuses the sketch's device, turns it on the viewer kindly ("Your clients want Nike on a not-Nike budget. So do you."), then gives a verified reason to pick RecurPost with a stamp and recurpost.com. The reason must close the card's own device, not add a new idea: Brand Voice v2 swapped "No per-seat charges." (Dinesh 2026-09-25: "not sure how does that make sense there") for "Sounds like enterprise. Priced like it isn't." so the line fills both fields of the form on screen. The screen must also act out the claim while it is spoken, word-synced: Best Time v2 said "RecurPost finds the best time" over a feed still showing 3:00 AM, with the flip only after (Dinesh: "it does not relate to what is being said"). Fix = a scan of the audience curve on "finds" and badges locking on "best time". Also strike or update any headline the payoff contradicts ("asleep" in daylight). And never restate the sketch's point on the card: Best Time's "Their customers are asleep." repeated what the sketch had just shown (Dinesh 2026-09-25: "clients being asleep has already been said... something that agencies can relate to"). The card's message is for the agency owner watching: the situation they live through with their own clients (the client with a 3 AM strategy, and the agency needing proof to push back), then how RecurPost helps them.
- Two-character scenes work for Track B at this length (Ep 9); the narrator/single-POV restriction was about long reels burning 15 s on setup.

## The look: "living cartoon" motion (standing rule since 2026-09-24)

Dinesh on the RecurPost agency explainer v2: "I love this style. Save this in the agency reel skill." Every reel is animated this way:
- The characters act every second: a jointed rig that walks, anticipates, reacts with a face set, tracks with its eyes, hops and squashes.
- The camera travels and hides its cuts: push-ins, punch-ins, pull-back reveals, zoom-throughs, match cuts.
- Motion has physics: arcs with dotted trails, overshoot, particle bursts, count-ups, stamp shakes.
- Light and texture: paper, grain, vignette, sunbeam with dust, day-to-night grading, hand-drawn boil.

Read `reference/motion-style.md` before building, and start from `reference/motion_kit.py`, with the full working example in `~/videos/recurpost-agency-hub-explainer/build.py`. The old style (static figures, fades and pops, hard cuts) is retired.

Reference implementations to copy from, in order of usefulness:
- `~/videos/client-vs-agency-ep9` — THE SHORT-FORMAT BUILDER. Wall-screen form that fills as they talk (chips, strike-throughs, typed fields), voiced form-style end card with a stamp, 20 s fitting (gaps, end-card atempo, hand-set word times). Start here.
- `~/videos/client-vs-agency-ep4` — dialogue over a diagram that builds itself (flowchart, timer, corner cards). Long-format; borrow its diagram code.
- `~/videos/client-vs-agency-ep3` — narrator format (documentary parody), multi-scene, night vision.
- `~/videos/client-vs-agency-ep1` — two-character office scene with escalating chips. The original; do not copy its beat order again.

Read `reference/series-bible.md` before choosing a premise, `reference/cheatsheet.md` before writing the script and again for the shot plan, and `reference/publish.md` when shipping.

## Cost rules (Dinesh 2026-09-28: "Can I do it for cheaper somehow?")

Finance cost about $12.70 on API pricing: $12.67 of Claude tokens and 3 cents of ElevenLabs. The spend came from loading all six guides and a full 34 KB reference build.py into context, writing a 500-line build.py from scratch, and 8 full contact sheets. From now on:
- **The cheat sheet replaces the guides.** `reference/cheatsheet.md` holds every audit rule in about 5 KB. Open `sketch-craft.md`, `visual-storytelling.md`, `animation-craft.md`, `script-audit.md` or `build-recipe.md` only for one specific check or situation, and only read the section you need.
- **Build from the kit.** Run `kit/new_reel.sh <slug>` and read `kit/README.md`. A reel writes only its device, choreography, end card and SFX (about 100 to 150 lines). Never copy and read a whole old project's build.py.
- **Split the work by model.** The main session (the model the user runs, e.g. Fable) handles the premise, script, shot plan and review of snapshots and cuts. The build itself (Steps 3 and 4: Kokoro drafts, build.py, check, snapshots, fixes, renders) goes to a **Sonnet subagent** (Agent tool with `model: "sonnet"`). Its prompt carries the approved script, the shot-plan table, the project path and the kit README path. Tell it never to run ElevenLabs. The main session reviews one contact sheet per round and sends fixes back to the same subagent with SendMessage.
- **Keep context small.** Start each reel in a fresh session. Read files in ranges, and batch build + check + snapshot into one command.

The full guides stay the source of truth for the why:
- `reference/sketch-craft.md`: game, heightening, rule of three, active straight man, reference sketches.
- `reference/visual-storytelling.md`: intensity curve, camera motivation, comedy framing, 9:16 rules.
- `reference/animation-craft.md`: the 12 principles on a stick rig, per-line acting method, timing at 30 fps, GSAP rig rules.
- `reference/script-audit.md` and `reference/build-recipe.md`: every past rejection with its story.

Never trade a setup, a pause or clarity for length or cost; if a cap forces a weaker cut, say so and recommend the better, longer version.

## Step 1 — Pick the premise

1. Read the **agency-life map and pain register** in `reference/series-bible.md`. Pick a pain from an **area of agency life** that neither of the last two reels touched (Ep 9 was Onboarding; see the map). Never reuse a pain already marked used, even with a new setting: Dinesh rejected an episode for this ("same idea as the last reel") when only the staging had changed. Offer Dinesh 2 or 3 premises from different areas, with the one-line joke for each, and recommend one.
2. Decide the track. **Track A** lands on a verified RecurPost behaviour. **Track B** is pure agency pain with no product demo and only a brand line on the end card. Keep Track B to roughly one in three. At short length a two-person scene is fine; avoid ensembles.
3. Decide the format, and make it structurally different from the last two episodes: setting, who is opposite Kate, the comedic device, and how it ends. Same characters, never the same sketch. In the short format the device is usually one on-screen object that fills as they talk (a form, a chat thread, an invoice, a calendar, a notification stack) and holds the empty answer from frame one.

## Step 2 — Write the script, then audit it

Write the full script into the "RecurPost Skit Scripts" Google Doc (`1sOVWUQpbydVoG11A3VpqKUhjhzDAR6Ti-V9qRXMI3rk`, `mcp__google-docs__appendMarkdown`, or the Docs API batchUpdate insertText with the google-docs-mcp token via `~/.claude/skills/demo-review/bin/gsheet.py access_token()` when that tool isn't loaded) and paste it in the reply.

Then run the script checklist in `reference/cheatsheet.md` (it covers script-audit.md and the sketch-craft audit). Do not build until each check passes. Run check 11 (flow) first and literally: read the script as a conversation and confirm each line answers the one before it. Draft 1 of Ep 5 passed checks 1 to 10 and still failed because the lines did not connect. Dinesh caught four separate logic holes in one episode; each rebuild cost an hour.

Verify every product claim before it goes in a line. Grep the product repo (`~/Sites/recurpost`) or the memory files (`reference_recurpost_*`, `feedback_sendible_client_connect_parity`) — see `verify_features_in_code`. If a claim is about Meta or platform behaviour rather than RecurPost, ask Dinesh to confirm the wording before building.

Stop and get Dinesh's approval on the script. Only then build.

## Step 3b — Beat sheet and shot plan (before any build code)

Using the shot-plan and acting sections of `reference/cheatsheet.md`, write a table with one row per line: beat and intensity (1 to 5), the frame (shot size and who is in it), the camera move and its reason (or HOLD), each character's objective, key poses and take, what the device shows (never the answer before the punch word), and the hold length. Mark where the camera sits on every punch. Show it to Dinesh with the script.

## Step 3 — Draft voices (Kokoro, free)

Never call ElevenLabs for a draft. Standing rule: iterate on Kokoro, spend ElevenLabs credits once, on the approved cut.

```bash
npx --yes hyperframes@0.8.50 tts "<line>" -v af_heart -s 0.97 -o /tmp/x.wav </dev/null
```

Voices: Kate `af_heart`, Rex `am_adam`, narrator `bm_george`. Trim silence, apply the phone filter when a character is on a call, then build `voice.json` with `times.py` (copy from ep3/ep4). See `reference/build-recipe.md`.

## Step 4 — Build (Sonnet subagent, from the kit)

Hand Steps 3 and 4 to a Sonnet subagent (see Cost rules). The subagent scaffolds with `kit/new_reel.sh <slug>`, writes `lines.txt` and the Kokoro drafts, and fills the marked sections of the template build.py in the living-cartoon style (`reference/motion-style.md` if it needs the look spelled out). It returns TOTAL, the check result and the contact-sheet paths. Rules for it:

- `python3 build.py && npx --yes hyperframes@0.8.50 check .` until zero errors.
- `npx --yes hyperframes@0.8.50 snapshot --at <beats> --no-end --describe false -o snaps .` and actually read the contact sheet before rendering. Every layout bug in this series was caught in a snapshot, never in the dialogue.
- Render both cuts, then loudnorm to -14 LUFS.
- Print `TOTAL` from `build.py` on every build. A short reel over 20.0 s, or a long one over 75 s, is a failed build, not a note for later.

## Step 5 — Verify

- Transcribe each voice clip individually (`whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-medium.en.bin`) and confirm it matches the script. A whole-file transcript drops words under sound effects; per-clip is the reliable check.
- Check frames at every beat, especially any beat that changes on screen.
- Report honestly what you verified and what you did not (you cannot judge comic timing or voice quality from stills).

## Step 6 — Publish (only when Dinesh approves the cut)

Acting cues matter as much as the words: a caught-out protagonist is cued playful or innocent, never defensive (Ep 11 Maya sounded hostile on "[quick, defensive]" and had to be re-voiced). Final ElevenLabs pass first (Rex = Chris `iP95p4xoKVk53GoZ742B`, Kate = Sarah `EXAVITQu4vr4xnSDxMaL`, narrator = Brian `nPczCjzI2devNBz1zQrb`). A short reel costs about 130 to 170 credits, a long one 350 to 500. Refit a short reel to 20.0 s (see the build recipe's "Fitting a short reel into 20 s"), re-render both cuts, then follow `reference/publish.md` for the Drive upload and RecurPost scheduling.

## Output

Reply with: the file paths for both cuts, what changed since the last draft, what you verified, the credit cost of any ElevenLabs pass, and the open question if one remains. Keep it short; no em-dashes.
