# RecurPost — "Everything Social. One Workflow." (40 s, 9:16 Meta retargeting spot)

**Deliverable:** `out/RecurPost_Meta_40s_9x16.mp4` (1080×1920, 30 fps, H.264 High, AAC 48 kHz stereo, 40.00 s)

**40 s cut:** the script, on-screen text and motion graphics are the same as the 30 s cut. The only change
is pace. Every animation plays 25% slower: scenes are authored in 30 s "storyboard seconds" and
`SCALE = 40/30` in `src/timeline.js` maps them to real time. The VO read is slightly more relaxed (1.0×
instead of 1.12×). The music is 135 BPM, where one storyboard second equals 3 beats, so scene changes stay
on the beat. The official RecurPost logo and clock mark are in `assets/brand/`.

Every frame is rendered by code, which keeps text, UI, platform marks and the logo exact. Generative video
tends to garble UI copy and logos, and this spec rules both out. Music and SFX are synthesized from scratch,
so there is no stock or library audio. The voiceover is the exact script, generated one line at a time and
placed on a cue sheet.

```
npm install                       # @napi-rs/canvas, simple-icons, fonts
pip install numpy scipy soundfile pyloudnorm kokoro-onnx imageio-ffmpeg
python3 scripts/vo.py             # VO lines -> audio/vo/  (needs Kokoro model files, see below)
python3 scripts/audio.py          # music + SFX + VO mix -> audio/mix.wav (-14.9 LUFS, true peak ≤ -1 dBTP after AAC)
node src/render.js video          # frames -> out/video_silent.mp4
ffmpeg -i out/video_silent.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k \
       -t 40 -movflags +faststart out/RecurPost_Meta_40s_9x16.mp4
node src/render.js sheet 0.5      # QA contact sheet -> out/contact_sheet.png
node src/render.js stills 3.2,15.4  # single-frame checks -> out/stills/
```

Kokoro model files (`kokoro.onnx`, `voices.bin`) come from the
[kokoro-onnx releases](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).
Point `KOKORO_DIR` at the folder that holds them.

## Status of earlier open items

| Item | Status |
|---|---|
| **Official RecurPost logo** | **Done.** The light lockup (`assets/brand/logo.png`, white text and yellow mark) is used in the reveal, the hero interface, the Scene 10 logo build and the end frame. It is always contain-fitted at its native ~8:1 ratio. The clock mark (`icon.png`) is used in the hero interface. A dark-text version is kept as `logo_dark_text.png` for light backgrounds. |
| **Brand colours** | Still the placeholder palette. Left unchanged on purpose to keep the motion graphics as they were. Replace the tokens in `src/brand.js` to restyle; the logo yellow is roughly `#FFCD45`. |
| **Voice** | Still the local Kokoro `am_fenrir` voice. The Higgsfield *Holden* voice needs credits on the workspace. To swap it in, replace `audio/vo/line00–11.wav` or add `audio/vo_override.wav`, then re-run `scripts/audio.py` and the mux step. |

## Structure

```
src/timeline.js      single source of truth: scene times, VO placement, SFX cue sheet, 30→40 s time scale (135 BPM grid)
src/brand.js         brand tokens + logo slot
src/lib.js           easing, camera, Flow Line, cards, chips, vector icons, background/grain
src/scenes/*.js      11 scenes (each a pure function of time)
src/render.js        renderer (raw RGBA -> ffmpeg), stills, contact sheet
scripts/vo.py        exact-script VO, per line
scripts/audio.py     music, SFX, VO processing, ducking, loudness + limiter
```

## Storyboard as built

Times in this table are storyboard seconds. Multiply by 4/3 for real time in the 40 s cut: Scene 02 starts at 3.8 s, Scene 06 at 18.67 s, Scene 10 at 34.67 s, Scene 11 at 37.33 s, and the final lockup holds from about 38.1 s to 40 s.

The **RecurPost Flow Line** (cyan → violet → coral gradient) connects every scene. Each scene hands its
main object to the next one.

| # | Time | Primary visual | On-screen copy | VO (starts) |
|---|---|---|---|---|
| 01 | 0.00–2.85 | 18 windows/cards (tabs, spreadsheet, calendar, DMs, toasts, analytics, report) with camera punches; freeze + desaturate at 2.70 | TOO MANY TABS. · APPROVED? · POSTED? · WHERE'S THE REPORT? · CAN YOU POST THIS AGAIN? · CLIENT WAITING... · WHICH ACCOUNT? | 0.30 "Still managing social media like this?" |
| 02 | 2.85–6.00 | Chaos implodes → flash/shockwave → logo; Flow Line draws the workflow ring; push through CREATE node | CREATE PLAN SCHEDULE APPROVE PUBLISH ENGAGE ANALYZE · "Your social media workflow, in one place." | 2.90 "Meet RecurPost." 4.00 "Your social media workflow, in one place." |
| 03 | 6.00–8.00 | Composer → cursor clicks AI Assist → post generates → platforms toggle → 4 format previews → folds into a card | CREATE SMARTER · AI CONTENT · MULTI-PLATFORM · CONTENT COMPOSER | 6.30 "Create smarter with AI." |
| 04 | 8.00–11.00 | Card lands in calendar (WED 12 PM); 12 posts snap in; Best time; pull-out to 6 accounts wired by the Flow Line; collapse to one card | PLAN ONCE. · SCHEDULE EVERYWHERE. · BULK SCHEDULING · MULTIPLE ACCOUNTS · BEST TIME · CONTENT CALENDAR | 8.25 "Schedule across accounts." |
| 05 | 11.00–14.00 | Card enters a rotating loop (POST → PUBLISH → RECYCLE); more evergreen posts join; loop contracts into an approval check | CREATE ONCE. · KEEP IT WORKING. · EVERGREEN CONTENT · RECURRING POSTS · AUTOMATION | 11.30 "And keep your best content working." |
| 06 | 14.00–17.00 | Check unfolds into a post card; stepper POST → CLIENT REVIEW → PENDING APPROVAL → APPROVED → SCHEDULED; client comment; big check hits; check morphs into Publish button | CLIENT REVIEW · "Looks great! Approved." · NO MORE APPROVAL CHAOS. | 14.30 "Get approvals without the back-and-forth." |
| 07 | 17.00–20.00 | Publish clicked → 3 channels; LinkedIn fails → WHY? reason → Reconnect → Retry → Published; post lifts off | PUBLISH. · POST FAILED · WHY? · SEE IT. FIX IT. RETRY IT. · FIX → RETRY → PUBLISHED | 17.15 "And when something goes wrong, know exactly what to fix." |
| 08 | 20.00–23.00 | Published post throws off 5 interactions (IG comment, FB comment, LinkedIn message, Google Business Profile review, IG DM); magnetic snap into one inbox | ONE INBOX. · COMMENTS · DMs · REVIEWS · AUTOMATION | 20.35 "Manage conversations from one inbox." |
| 09 | 23.00–26.00 | Data burst → metric tiles, line/bar charts, top posts → everything assembles into a white-label client report → zooms back | ANALYTICS · REACH · ENGAGEMENT · CLICKS · FOLLOWERS · TOP POSTS · CLIENT REPORT · PERFORMANCE · INSIGHTS · WHITE LABEL · SCHEDULED REPORT | 23.30 "Turn performance into client-ready reports." |
| 10 | 26.00–28.00 | Pull-back hero: 8 pillars orbit the RecurPost interface on the Flow Line; impact on the beat; everything converges into the logo | EVERYTHING SOCIAL. · ONE WORKFLOW. · YOUR SOCIAL MEDIA. SIMPLIFIED. | 26.18 "One workflow." 26.95 "All in RecurPost." |
| 11 | 28.00–30.00 | Clean branded close, calm Flow Line arc; final lockup holds 28.6–30.0 | Logo · EVERYTHING SOCIAL. · ONE WORKFLOW. · Plan. Publish. Manage. Measure. · EXPLORE RECURPOST → | — |

**Brief conflict I resolved:** Scene 11 asks for "YOUR SOCIAL MEDIA. SIMPLIFIED." under the logo, and §33
gives an exact final-frame hierarchy without that line. That line now sits under the converging logo in
Scene 10 (27.45–28.35). The final frame follows §33 exactly.

**Timing notes:** The Scene 02/03 boundary moved from 5.0 s to 6.0 s so the VO could stay natural and not
be sped up; §11 allows this. Scene 03 is 2 s long. The approval, SCHEDULED and PUBLISHED states carry
through Scenes 06 → 07 as one continuous status story.

## Audio

- **Music:** original, 135 BPM in the 40 s cut, A-minor progression (Am–F–C–G). The section times below are storyboard seconds.
  - 0–2.7 tension build, hard stop at the freeze.
  - 3.0 beat enters: kick, clap, bass, pad.
  - 10 s: 16th hats and plucked arpeggio. 20 s: peak (open hats, brighter filters).
  - Drop and snare roll 25.5–26.5, then a big impact on "ONE WORKFLOW." exactly on beat 79 (35.11 s real).
  - 28–30: branded chord and sting.
  - Bass and pad are side-chained to the kick.
- **SFX:** 157 cues on the cue sheet in `src/timeline.js`, each tied to a visual event: keys,
  notifications, whooshes, snaps, approval chime, error, retry, magnetic snap, data blips, report impact,
  logo sting.
- **VO:** exact script, 12 lines, one voice. "RecurPost" gets the same spelling in every line so it is
  pronounced consistently. Chain: high-pass, presence EQ, compression. The music ducks up to about 6 dB
  under speech and the SFX about 2.5 dB.
- **Master:** −14.9 LUFS integrated, true peak −1.2 dBFS after AAC encoding, no clipping.

## QA

Checked against the final file with ffprobe and ffmpeg ebur128/blackdetect/freezedetect, and by eye on
the contact sheet (`out/storyboard_contact_sheet.png`):

- **Passed:** 40.00 s · 1080×1920 · 30 fps · no black frames · no black bars.
- **Freezes:** the only freezes are intentional — the 0.2 s freeze-frame at 3.6 s and the final lockup hold from about 38.1 s.
- **Text:** every label is from the brief's list and spelled as specified. All text is real type, never generated.
- **Claims:** no metrics, statistics, prices, awards, testimonials or customer logos. Analytics show
  direction only. Commenter names and the "Client · …" account names are generic placeholders.
- **Platform marks:** Instagram, Facebook, TikTok and Google come from simple-icons vector marks. LinkedIn is shown as a text-label tile, following §16.
- **Safe zones:** critical copy sits between about y 300 and y 1510 (clear of the Reels caption and CTA overlay) with side margins of at least 70 px.
- **Not verified:** the VO voice and mix have not been checked by a human listener. Review them before
  publishing.
