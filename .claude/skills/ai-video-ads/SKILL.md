---
name: ai-video-ads
description: Plan, script, build and QA a short paid-social video ad (9:16 Meta/Reels/TikTok/Shorts, 15-30 s) for any brand. Use when asked to make a video ad, retargeting spot or product promo. Brand-agnostic; borrows the script-audit, draft-then-final voice and snapshot-QA discipline from the agency-reel skill. Usage - /ai-video-ads <brand or product> [--length 15|30] [--style code|generative|hybrid]
---

# AI video ads

One ad per run. Never spend paid credits (voice, generative video) before the script is approved and the free draft is reviewed.

## Step 0: Brief (ask only what is missing)

Collect: brand and product, audience, one offer or one message, platform and length (default 9:16, 30 s), tone, assets on hand (logo, colours, fonts, product shots), CTA. Check `README.md` and `src/brand.js` in this repo first; the brand tokens may already exist.

If the brand logo or colours are unknown, say so and use a clearly labelled placeholder. Never invent an official logo.

## Step 1: Concept and claims

- One message in one sentence. Hook inside 2 s (muted viewers decide fast). One CTA.
- **Claims discipline:** no invented metrics, prices, awards, testimonials or customer logos. Every product claim must be verified (product repo, pricing page, or the user's confirmation). Anything unverified is cut or flagged.
- Offer 2 concepts with a recommendation; get approval before writing the full script.

## Step 2: Script and audit

Write the VO script and on-screen copy, then check:
1. Hook by 2 s; the first frame already shows the problem or the payoff.
2. Each line answers the one before it (read it as a conversation).
3. Nothing appears on screen that the voice has not set up.
4. Works muted: on-screen text carries the message without audio.
5. Ends on a single CTA, not a recap.
6. No claim that is not verified.

Stop for approval of the script.

## Step 3: Storyboard table

One row per scene: time range, primary visual, on-screen copy, VO line, camera move and its reason, SFX cue. Safe zones for 9:16: keep critical copy roughly between y 300 and y 1510 (clear of Reels caption/CTA overlays) with side margins of at least 70 px.

## Step 4: Choose the build route

| Route | Use when | Tools |
|---|---|---|
| **code** (default for UI/product ads) | exact text, UI and logos matter | this repo's pipeline: `src/timeline.js`, `src/scenes/*.js`, `src/render.js` (see `README.md`) or HyperFrames HTML/GSAP |
| **generative** | lifestyle or cinematic shots, people, product B-roll | Higgsfield MCP (`generate_video`, `generate_image`, `get_workflow_instructions`) |
| **hybrid** | generative plates plus code-drawn text/UI/logo | generate clips, composite text and logo in code |

Rule of thumb: generative video garbles UI copy and logos, so render those in code and overlay them.
Check `balance` on Higgsfield before generating, and tell the user the expected credit cost first.

## Step 5: Voice and audio

- Draft with free local TTS (Kokoro, via `scripts/vo.py`) and iterate there.
- Spend on a final voice (ElevenLabs or Higgsfield) once, on the approved cut. Ask before spending.
- Music original or licensed only; duck it under speech; master to about -14 LUFS with a peak ceiling near -1 dBFS (`scripts/audio.py`).

## Step 6: Build and QA

- Render, then produce a contact sheet and single-frame stills at every scene boundary. Look at them.
- Verify with ffprobe: duration, resolution, fps, audio present. Run black-frame and freeze detection; only intentional freezes allowed.
- Check spelling of every on-screen word against the approved script.
- Report honestly what was verified and what was not (a human must judge voice quality, comic or emotional timing and brand fit).

## Step 7: Deliver

Output: the file path, the contact sheet, length and specs, credits spent, open items (logo, colours, voice), and suggested variants (different hook, a 15 s cut, captions on/off). Do not publish or schedule anything unless asked.

## Adapting from agency-reel

Reuse, do not copy: the draft-then-final voice rule, the cheat-sheet style audit, snapshot-before-render, both caption/no-caption exports, and recording what was rejected so it is not repeated. Do not reuse its stick-figure cast, RecurPost-specific rules or its Drive/RecurPost publishing steps.
