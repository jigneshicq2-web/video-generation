# RecurPost Video Ads: MASTER PRODUCTION BRIEF
### Read this first. Every video script in this folder inherits these rules.

---

## 0. HOW TO START A BUILD (paste this into a new Claude Code session on this repo)

```
You are building a RecurPost Meta video ad in the repo jigneshicq2-web/video-generation,
branch claude/gallant-clarke-vbbxsk.

1. Read prompts/recurpost/video/00-video-master-brief.md completely.
2. Read the script for the ad I name below in prompts/recurpost/video/01-evergreen-video-scripts.md.
3. Read README.md and src/ to understand the existing code-rendered pipeline
   (@napi-rs/canvas frames -> ffmpeg, Kokoro VO, synthesized music/SFX).
4. Build the ad as a NEW project under ads/<ad-id>/ (do not modify the existing 40s spot in src/).
   Reuse src/lib.js helpers by require(), copy-and-adapt anything that needs brand changes.
5. Render: the 35s master AND the 15s cut defined in the script.
6. Run the QA checklist in section 12 of the master brief; fix every failure.
7. Produce a contact sheet + 4 stills (0.2s, 1.5s, 3.0s, CTA frame) and send them to me.
8. Commit and push to the branch.

Ad to build: <AD ID, e.g. EV-04 "The Callout">
```

---

## 1. Deliverables per ad

| File | Spec |
|---|---|
| `out/ads/<ad-id>/<ad-id>_35s_9x16.mp4` | 1080×1920, 30 fps, H.264 High, yuv420p, AAC 48 kHz stereo 256 kbps, `+faststart`, exact duration from script |
| `out/ads/<ad-id>/<ad-id>_15s_9x16.mp4` | Same spec; built from the 15s cut map in the script (NOT a speed-up) |
| `out/ads/<ad-id>/<ad-id>_35s_4x5.mp4` | Optional: 1080×1350 crop-safe version (re-layout, not a blind crop) |
| `out/ads/<ad-id>/contact_sheet.png` | 1 frame every 0.5s |
| `out/ads/<ad-id>/stills/` | 0.2s, 1.5s, 3.0s, CTA frame, thumbnail frame (frame 0) |
| `out/ads/<ad-id>/captions.srt` | Burned-in text is already on screen; SRT is for Meta auto-captions fallback |

---

## 2. Performance targets and why the rules exist

- **Hook rate ≥ 30%** (3-sec plays ÷ impressions). The past AI videos got 12%.
- **Hold rate ≥ 20%** (ThruPlays ÷ 3-sec plays).

**Non-negotiable hook rules (0–3s):**
1. **Frame 0 is a finished, readable composition.** It doubles as the thumbnail. No black frame, no fade-in, no blank background waiting for text.
2. **Motion starts on frame 0–6.** Something is already moving when the video appears.
3. **The hook text is fully readable by 1.0s.** Max 12 words on screen in the hook. If longer (EV-04), it types/punches in word-by-word and completes by 2.5s.
4. **No logo, no product name, no "RecurPost" before the TURN beat** (≈8s+). Viewers scroll past ads that look like ads.
5. **Sound-off first.** Everything said in VO appears as on-screen text. VO is a bonus layer, never the only carrier of meaning.
6. **One idea per hook.** One visual metaphor, one line.

**Hold rules (3–35s):**
1. **Visual change every ≤ 2.5s:** cut, camera punch, number slam, colour flip, element entrance. Never 3s of static frame.
2. **Open loop before 5s:** a counter still ticking, a question not yet answered, a split screen whose "difference" isn't revealed yet.
3. **Progress cue:** a thin yellow progress bar, 6 px tall at y = 1880, fills 0→100% over the full duration. It signals "this ends soon", which raises completion.
4. **The payoff must visibly resolve the hook's image.** The graveyard reverses, the calendar refills, the counter resets. This is the "meaningful result" the viewer stays for.

---

## 3. Brand system (OVERRIDES src/brand.js placeholder palette)

The existing 40s spot uses a placeholder violet/cyan palette. **These ads use the real RecurPost palette.** Create `ads/_shared/brand.js` with:

```js
module.exports = {
  yellow: '#FFCC43',   // RecurPost Yellow (sampled from official logo)
  black:  '#1F1F1F',   // RecurPost Black (logo wordmark)
  white:  '#FFFFFF',
  cream:  '#FFF8E6',   // warm off-white background tint (derived)
  ink2:   '#2A2A2A',   // raised dark surface
  grey:   '#6B6B6B',   // secondary text
  line:   '#E6E6E6',   // light UI borders
  dimDot: '#3A3A3A',   // inactive elements on black
  alert:  '#E5484D',   // pain/problem ONLY, max 1 element on screen at a time
  success:'#2BB673',   // check marks only
};
```

**Colour rules:**
- Default canvas: **black #1F1F1F** (scroll-stopping in a mostly-white feed). Use **cream #FFF8E6** for "calm/after" moments to create a light/dark emotional flip.
- Yellow is the hero accent: highlight words, the CTA, the loop arrow, and the ONE object the eye must follow.
- **Never yellow text on cream/white.** On light backgrounds, highlight words get a yellow marker box behind black text. On black, highlight words are yellow text.
- Text on yellow is always black.
- No blues or purples. No gradients except a subtle radial vignette (#1F1F1F → #141414 edges).

**Logo files** (already in repo):
- `assets/brand/logo.png`: white wordmark + yellow clock "O" (use on black)
- `assets/brand/logo_dark_text.png`: black wordmark + yellow clock (use on cream/white)
- `assets/brand/icon.png`: yellow clock mark only

Always contain-fit at native ratio (~8.2:1). Never stretch, recolour, rotate more than 0°, or animate the letters individually. Allowed logo animations: scale 0.92→1.0 with ease-out-back over 0.4s, opacity 0→1 over 0.15s, a single yellow light sweep across it.

**Brand motif: the Recur Loop.** The circular arrow from the logo's clock is the visual engine of every ad. Draw it as a thick (stroke 18–28 px) yellow arc with a triangular arrowhead. It represents recycling/auto-repeat and should be the object that "does the work" in the MECHANISM beat.

---

## 4. Typography

- **Font:** Inter (installed locally; also `@fontsource/inter`). Weights: 800 (headlines), 700 (CTA/labels), 500 (support lines). No other families. The only exception is a handwritten annotation, which must be marked in the script.
- **Sizes at 1080 px width:**

| Role | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| HOOK headline | 96–120 px | 800 | 1.02 | −2.5% |
| Beat headline | 76–92 px | 800 | 1.05 | −2% |
| Support line | 40–48 px | 500 | 1.25 | 0 |
| UI labels | 26–34 px | 600–700 | 1.2 | 0 |
| Counters / numbers | 140–260 px | 800 | 1.0 | −3%, tabular figures |
| CTA button text | 44 px | 700 | — | 0 |

- **Max 3 lines** per headline, **max ~16 characters per line** at hook sizes. Balance line breaks manually; never leave one word alone on the last line.
- **Text entrance styles** (pick per script; don't mix more than 2 per ad):
  - **PUNCH:** each word scales 1.25→1.0 + opacity 0→1 over 4 frames, 3-frame stagger, with a 4 px camera shake on the last word.
  - **SLAM:** whole line scales 1.6→1.0 over 5 frames with ease-out-expo, plus a 0.1s white flash at 15% opacity and 8 px shake.
  - **TYPE:** a character-by-character typewriter at 28 chars/s with a blinking 4 px yellow caret.
  - **MASK-UP:** the line rises 40 px from a mask over 8 frames, ease-out-cubic.
- **Text exits:** fast (4–6 frames). Slide up 30 px + fade, or hard-cut on a beat.

---

## 5. Layout and safe zones (9:16, 1080×1920)

- **Critical text and UI:** y 260 → y 1480. Clear of the top Reels UI (0–250) and the bottom caption/CTA overlay (1500–1920).
- **Side margins:** ≥ 72 px.
- **Hook text sits in the upper-middle third (y 380–900)**, where the eye lands on a fresh Reel.
- The **progress bar** (section 2) and **logo end card** are the only elements allowed below y 1480, and the end card CTA must stay above y 1560.
- **4:5 version:** the same content re-laid inside y 0–1350; headline sizes −10%.

---

## 6. Motion language

- **Easing:** default `easeOutCubic` for entrances, `easeInCubic` for exits, `easeOutBack(1.4)` for pops, `easeOutExpo` for slams. No linear moves except counters and progress bar.
- **Camera:** a virtual 2D camera (see `camera()` in src/lib.js). Use punch-ins (scale 1.0→1.08 over 6 frames) on key words; slow drift (1.00→1.03 over a beat) on calm shots. Shake: 6–10 px random offset decaying over 6 frames, only on SLAM moments.
- **Transitions** (use the ones named in each script):
  - **WHIP:** 6-frame horizontal motion-blur pan (render 3 blurred copies at 25% offset).
  - **ZOOM-THROUGH:** scale into an element until it fills the frame, then cut.
  - **MATCH-MORPH:** an element in scene A becomes an element in scene B (e.g. the wheel becomes the Recur Loop).
  - **HARD CUT on beat:** the most common transition. Cut exactly on the music beat grid.
- **Density:** at most 3 moving element groups on screen at once outside the CHAOS beats. Clarity beats busyness.
- **Grain:** 3% film grain + 2% vignette on every frame (reuse `finish()` from lib.js), so it doesn't look like a flat template.
- **Frame rate:** 30 fps. Motion blur on fast moves (> 60 px/frame): average 3 sub-frame renders.

---

## 7. Product UI to animate (RecurPost evergreen libraries)

Draw clean, simplified UI. **Do not imitate a real screenshot pixel-for-pixel, and don't show features RecurPost doesn't have.**

Allowed UI elements for this feature:
- **Post card:** white rounded rect, 24 px radius, image area (abstract coloured shapes, NO real photos or brands), 2 grey caption bars, a small platform glyph (simple-icons: Instagram, Facebook, Google; LinkedIn as a text tile per README §16).
- **Library:** a rounded container titled "Content Library" with category tabs. Category names used in these ads: **"Tips", "Testimonials", "Offers", "Blog"**.
- **Category schedule rule:** a pill row like "Tips → Every Tue 10:00".
- **Auto-repeat toggle:** label "Recurring" with a yellow ON toggle.
- **Calendar:** month or week grid; posts appear as coloured chips (yellow = Tips, black/white = Testimonials, grey #9A9A9A = Offers, light grey = Blog).
- **Client workspaces:** a grid of mini calendars labelled with fictional client names only: "Bloom Café", "Apex Law", "Kiko Toys", "UrbanFit", "Nova Dental", "Spice Route".

**Claim guardrail:** no %, no hours-saved figures, no follower counts, no "AI writes your content". Example arithmetic (20 × 30 = 600) must be presented as an example, not a result.

---

## 8. Voiceover

- **Engine:** existing Kokoro pipeline (`scripts/vo.py`), voice `am_fenrir` unless the script says otherwise. Generate **one file per line**, place by cue sheet.
- **Read style:** confident, slightly fast (1.08×), conversational, talking to one agency owner. Not a "radio ad" voice.
- **VO must start by 0.25s.** Silence at the start kills hook rate for sound-on viewers.
- **Pronunciation:** "RecurPost" = "REE-ker-post" (write it as "Recur Post" in the TTS input if needed). "Evergreen" normal.
- **Hinglish lines (EV-10):** Kokoro English voices mispronounce Hindi. Either use a Hindi-capable TTS voice, or ship EV-10 with **music + SFX only, no VO** (text carries everything). The script states the default.
- **VO line ≠ on-screen text word-for-word** is allowed, but the on-screen text must carry the same meaning.

---

## 9. Music and SFX

- **Music:** synthesize an original track (reuse the approach in `scripts/audio.py`). **120 BPM** for all ads in this set (one beat = 0.5s = 15 frames), which makes the beat grid easy to align to.
  - 0–3s: no slow intro. Start on a hit: kick + sub boom + riser tail.
  - The AGITATE section tightens (16th hats, rising filter).
  - TURN: a **drop to silence for 0.5–1.0s** (the "freeze" moment), then the beat returns fuller.
  - MECHANISM: steady groove with a plucked arpeggio.
  - PAYOFF: a brighter chord and an open hat.
  - CTA: resolve plus a short brand sting (2 notes, rising).
- **SFX library** (synthesize; names as in audio.py where they exist): `slam`, `whoosh_short`, `whip`, `pop`, `click`, `key`, `notif`, `stamp`, `tick` (counter), `riser`, `drop_silence`, `chime` (success), `paper` (cards falling), `glass_crack`, `reverse_whoosh`, `sting`.
- **Every visual event in the script has an SFX cue.** The scripts list them with times.
- **Mix:** VO ducks music ~6 dB. Master at −14 LUFS integrated, true peak ≤ −1 dBTP after AAC.

---

## 10. CTA end card (shared across all ads, last 3–4s)

- **Background:** black #1F1F1F with a faint Recur Loop graphic (yellow 10% opacity, 900 px diameter, slowly rotating 20°/s).
- **Layout (centred):**
  - logo.png at 640 px wide, y ≈ 760
  - Support line under it (script-specific), Medium 44 px, white 85%, y ≈ 900
  - CTA pill: yellow #FFCC43, black text 44 px Bold, 640×120 px, radius 60, y ≈ 1080. Default text: **"Start Free Trial"**
  - Under the pill: "recurpost.com" Medium 34 px, white 60%, y ≈ 1200
- **Motion:** logo scales in 0.92→1.0 (0.4s), support line mask-up (+0.15s), pill pops (+0.3s) with a single yellow pulse ring every 1.0s until the end.
- **SFX:** `sting` on the logo, `pop` on the pill.

---

## 11. 15-second cut rules

- Keep the **identical hook (0–3s)**. Never trim the hook.
- Then: 1 agitate shot (≤2s) → TURN line (≤2s) → MECHANISM flash (≤4s) → PAYOFF image (≤2s) → CTA end card (2s).
- Rebuild the timeline (new cue sheet), don't speed footage up. VO is re-cut from the same lines; drop lines rather than rush them.

---

## 12. QA CHECKLIST (run before sending anything)

**Technical**
- [ ] ffprobe: exact duration, 1080×1920, 30 fps, yuv420p, AAC 48 kHz
- [ ] `ffmpeg blackdetect`: no black frames (esp. frame 0)
- [ ] `freezedetect`: no unintended freezes > 0.5s (the TURN freeze is intentional and listed in the script)
- [ ] Loudness −14 LUFS ±1, true peak ≤ −1 dBTP

**Hook**
- [ ] Frame 0 still is readable and meaningful as a thumbnail
- [ ] Something moves within the first 6 frames
- [ ] Hook text fully on screen by 1.0s (or 2.5s for word-by-word hooks)
- [ ] No logo or "RecurPost" before the TURN beat

**Copy and brand**
- [ ] Every on-screen word matches the script exactly (spelling, Hinglish, punctuation)
- [ ] No yellow text on cream or white; no white text on yellow
- [ ] Logo never stretched; appears only at/after TURN and on the end card
- [ ] No real brand logos except simple-icons platform glyphs; client names are the fictional list
- [ ] No metric/claim beyond the script's guardrail

**Layout**
- [ ] All critical text inside y 260–1480, x 72–1008
- [ ] Max 3 lines per headline; no single-word last lines

**Story**
- [ ] The payoff visibly resolves the hook image
- [ ] Visual change at least every 2.5s (check the contact sheet)
- [ ] Muted watch-through makes complete sense (watch once with audio off)

**Human review flags to report back**
- VO pronunciation of "RecurPost" and any Hinglish
- Any moment that felt slow on the muted watch
