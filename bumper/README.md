# RecurPost — YouTube bumpers (6 s) and in-stream (15 s, 20 s, 25 s), 16:9

| # | Spot | Deliverable | Alternate (logo and CTA side by side) |
|---|---|---|---|
| 1 | `batch`: "Batch schedule" | `out/RecurPost_Bumper_6s_16x9.mp4` | `out/RecurPost_Bumper_6s_16x9_alt_side-lockup.mp4` |
| 2 | `where`: "Where's the post?" | `out/RecurPost_Bumper2_WheresThePost_6s_16x9.mp4` | `out/RecurPost_Bumper2_WheresThePost_6s_16x9_alt_side-lockup.mp4` |
| 4 | `unified`: 20 s skippable in-stream, "One calendar view" | `out/RecurPost_InStream_OneCalendarView_20s_16x9.mp4` | — (own end card) |
| 5 | `failed`: 25 s skippable in-stream, "A post fails" | `out/RecurPost_InStream_FailedPost_25s_16x9.mp4` | — (own end card) |
| 6 | `approve`: 15 s non-skippable in-stream, "Which version did the client approve?" | `out/RecurPost_InStream_WhichVersionApproved_15s_16x9.mp4` | — (own end card) |
| 7 | `share`: 25 s skippable in-stream, "Share the calendar, keep your login" | `out/RecurPost_InStream_ShareCalendar_25s_16x9.mp4` | — (own end card) |
| 3 | `reports`: "Month-end reports" | `out/RecurPost_Bumper3_MonthEndReports_6s_16x9.mp4` | `out/RecurPost_Bumper3_MonthEndReports_6s_16x9_alt_side-lockup.mp4`; agency-cover variant: `..._alt_agency-cover.mp4` (`COVER=agency`) |

All files are 1920×1080, 30 fps, H.264 High, AAC 48 kHz stereo, exactly 6.000 s, mastered to about −14 LUFS with true peak ≤ −1.9 dBFS.

```
SPOT=reports                                # batch | where | reports
python3 bumper/vo.py $SPOT                  # exact-script VO -> audio/bumper/$SPOT/vo{0,1,2}.wav (Kokoro af_heart @ 1.2x)
python3 bumper/audio.py $SPOT               # music + SFX + VO -> audio/bumper/$SPOT/mix.wav
node bumper/render.js $SPOT video           # -> out/bumper_${SPOT}_silent.mp4 (END_LAYOUT=side for the alternate end card)
ffmpeg -i out/bumper_${SPOT}_silent.mp4 -i audio/bumper/$SPOT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k \
       -t 6 -movflags +faststart <deliverable>.mp4
node bumper/render.js $SPOT sheet 0.25      # QA contact sheet -> out/bumper_${SPOT}_contact_sheet.png
```

## Structure
```
bumper/ui.js                      long-form UI kit: post cards, status badges, headlines, backdrop, layer camera
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

## Video 3 — "Month-end reports eating your Friday?"
| Time | Visual | Copy | VO |
|---|---|---|---|
| 0.00–1.50 | A tear-off calendar page flips to MONTH-END (flip SFX). Nine unbranded grey report pages fall onto a desk, 0.20–0.84 s, with soft paper hits and one heavier impact on the last page. The camera pushes in so the pile fills the frame, and a small clock ticks on the 8th-note grid. | CLIENT REPORTS. / **THERE GOES FRIDAY.** · MONTH-END | 0.04–1.73 "Client reports. There goes Friday." |
| 1.50–3.80 | The pile compresses into one digital report (whoosh). The supplied logo lands on the cover, and abstract brand-coloured charts build: bars, a donut and a line, with no numbers, axes or labels. A dotted path leads to a recurring-calendar icon and a scheduled-email icon. The email icon's clock badge resolves to a check with the confirmation tone at 2.78 s. | BRANDED REPORTS. / **SCHEDULED DELIVERY.** | 1.82–3.70 "Brand and schedule them with RecurPost." |
| 3.80–6.00 | Same wipe and end card as the series. | Logo · TRY RECURPOST FREE | 4.28–4.95 "Try it free." |

- **Charts:** the bars deliberately show no upward trend, and the line wanders, so nothing reads as a results or time-savings claim.
- **`COVER=agency` variant:** replaces the RecurPost logo on the report cover with an abstract, letter-free "your agency" mark. The brief asked for the RecurPost logo on the cover, but the core message is reports presented under the *agency's* brand. A RecurPost logo on the client report can read as "reports branded RecurPost", which is the opposite of what is being sold. The default cut follows the brief; the variant is there to compare.

## 20 s in-stream — "One calendar view" (`unified`)
One continuous story built around one post card, the "hero" with a yellow outline. Each scene hands its objects to the next: the four client windows pan into an overlapping stack, then line up as the rows of one calendar. The hero lands in its slot, gets moved from Thursday to Friday, and the whole calendar shrinks into the end-card panel.

| Time | Visual | Copy | VO |
|---|---|---|---|
| 0.0–2.0 | Dark-to-light open on the hero card, then four client calendars split the screen, each drifting at its own pace. The card slips behind Client 2 and reappears on Client 4, then the calendars pan past the camera. | MULTIPLE CLIENTS. / **MULTIPLE CALENDARS.** · Client 1–4 | 0.05–2.04 |
| 2.0–4.7 | The calendars overlap. A client message pops in next to the hero (notification sound). A cursor clicks through three windows, bringing each to the front, and at 3.52 s everything freezes. | **WHERE’S THE FULL SCHEDULE?** · "Is Thursday’s post ready?" | 2.20–4.81 |
| 4.7–8.7 | Rising whoosh: each window becomes its client's row in one calendar. Client labels slide to the sidebar, cards slot into day columns, and the logo reveals subtly in the calendar bar. The hero lands at 6.3 s, then a slow push-in. | CLIENT POSTS. / **ONE CALENDAR VIEW.** | 5.00–8.75 |
| 8.7–13.0 | Camera moves in and pans left to right while status badges switch on. Tags pop on the spoken word: Scheduled 9.28, Published 10.08, Draft 10.60, Failed 11.35 (light confirmation each). Each tag is large, then settles small on its card. | **SEE POST STATUS AT A GLANCE** · Scheduled · Published · Draft · Failed | 8.90–12.01 |
| 13.0–15.4 | A cursor drags the hero from Thursday to Friday onto a dashed drop target, with a soft snap at 14.3 s. The rest of the calendar stays put. | MOVE POSTS. / **KEEP THE PLAN IN VIEW.** | 13.05–14.74 |
| 15.4–20.0 | The calendar scales into the end-card panel. Logo, line and CTA build in; static from about 17.2 s. Sting on beat 33 (16.5 s). | BRING YOUR CLIENT / SCHEDULES INTO VIEW. · START YOUR RECURPOST TRIAL | 15.30–18.10 · pause · 18.40–19.62 |

- **Timing trade-offs:**
  - **Line 3 (5.00–8.75 s):** at a natural pace it runs about 0.75 s past the brief's 8.0 s mark. That beat ends at 8.7 s, and the status beat is about 4.3 s instead of 5 s.
  - **Line 6 (15.30–18.10 s):** starts during the calendar-to-end-card transition, so the brief pause before "Start your trial today" fits inside 20 s.
- **Safe areas:**
  - "Client N" labels fade out before they leave title-safe during camera moves.
  - The in-calendar logo shows only while the whole calendar is in frame, so it is never cropped.
  - Status tags are clamped inside title-safe.
- **Audio:**
  - **Music:** an original 20 s bed (`music: 'long20'`): A-minor problem section, drums drop out on the freeze, a rise into a C–G–Am–F groove, a lift into the end card, then a resolving sting.
  - **Effects:** clicks, a notification, a whoosh, a riser, four light confirmations and a snap.

## 25 s in-stream — "A post fails. The client notices first." (`failed`)
One continuous story around one scheduled post card (dark artwork). It fails at its slot, joins its client's timeline, and the timeline becomes the History view. The card then opens into a detail panel, folds back into History, and the cards gather into the brand panel, which becomes the CTA.

| Time | Visual | Copy | VO |
|---|---|---|---|
| 0.0–3.5 | Card glides to a dashed publishing slot, pauses, and at 1.3 s gets a red outline, a "!" badge and a Failed label (soft alert, no alarm). It then slides into its client's timeline. | **POST FAILED** · Failed | 0.30–1.61 |
| 3.5–7.0 | Timeline with published (check) and scheduled (clock) posts; the failed card is the anchor. The client message pops in (notification), then slides aside as the camera pushes toward the card. | **THE CLIENT NOTICED FIRST.** · "Wasn’t this supposed to go live?" | 3.75–5.23 |
| 7.0–12.0 | The timeline becomes the History view: three client rows, logo in the panel bar. The failed post is highlighted, the rest step back, and a team member (generic avatar and cursor) reviews it. A callout appears on "see the reason": an info icon, the label and abstract lines. No error text is invented. | **REVIEW FAILED POSTS IN HISTORY** · Reason shown in History | 7.15–11.78 |
| 12.0–17.5 | The card expands into a detail panel with Failed, the reason box, **Edit and Retry** and **Retry Now**. The cursor hovers Edit and Retry on "edit", then selects Retry Now on "now" (click + restrained confirmation). A neutral **Retry action selected** chip appears; there is no published or green state. The panel folds back into History, and the card keeps its Failed marker plus a neutral retry badge. | **REVIEW. EDIT. RETRY.** | 12.45–15.18 |
| 17.5–21.0 | Pull-back to the organized three-client view. The failed post stays clearly marked and the scheduled posts stay visible. An icon-only status view sits in the panel bar. | SEE THE ISSUE. / **TAKE THE NEXT STEP.** | 17.75–20.51 |
| 21.0–25.0 | The cards gather into a yellow brand panel that becomes the CTA pill, then the logo and supporting line build. Static from about 22.0 s; sting at 21.0 s. | Logo · Keep client publishing in view. · START YOUR RECURPOST TRIAL | 21.05–23.37 · pause · 23.60–24.78 |

- **Accuracy:**
  - **Reason:** shown only as "Reason shown in History" plus abstract lines.
  - **Retry outcome:** stays neutral ("Retry action selected"). The card is never shown as published.
  - **Failures:** red is used only for the failed post, with no alarm graphics.
- **Pacing:** the VO uses 16.6 s of the 25 s at a natural 1.0× read (1.1× on the close), so every message and label has time to register. Each hold carries a slow camera push, so the only fully static stretch is the end card.
- **Music:** the same engine as the 20 s spot, with these parameters: problem section until 7.0 s, a short drop and rise into the History reveal, a groove under the review/action beats, a lift from 20.4 s, and a sting at 21.0 s (beat 42).

## 15 s non-skippable — "Which version did the client approve?" (`approve`)
One client post card carries the story. Its newest version ("Updated version", yellow artwork) leaves the thread and searches three surfaces. Those surfaces align into one workspace, where the card goes Draft → In review → Approved. The approved card then takes its calendar slot and finally grows into the CTA pill.

| Time | Visual | Copy | VO (1.2× except line 1) |
|---|---|---|---|
| 0.0–2.9 | Version 1, Version 2 and Updated version land in a message thread (soft clicks, quiet notifications). Two short bubbles overlap, then the question bubble lands and the music pauses. | **WHICH VERSION IS APPROVED?** · Version 1 · Version 2 · Updated version · "Which version is approved?" | 0.08–1.84 |
| 2.9–5.95 | The thread slides away and the card hops across abstract calendar, email and chat surfaces, which then align into one workspace (whoosh, match cut on the card). | **FEEDBACK, SPREAD ACROSS THREADS.** | 2.90–5.82 |
| 5.95–9.6 | Workspace with the logo in its bar and team + client avatars. Draft → In review → Approved; a client comment (abstract) appears beside the post. Approved lands at 8.35 s with a confirmation tone. It is a yellow review decision, not a publish state. | **A CLEARER CLIENT REVIEW WORKFLOW** · Draft · In review · Approved | 5.95–9.54 |
| 9.6–11.5 | The approved card glides into the calendar and sits lifted and larger than the other clients' (dimmed) posts. | **REVIEW BEFORE PUBLISHING** | 9.65–11.54 |
| 11.5–15.0 | The approved card grows into the CTA pill, then the logo builds above it. Static from about 12.5 s; sting at 11.5 s. | Logo · START YOUR RECURPOST TRIAL | 11.70–13.62 · 13.80–14.88 |

- **Script density:** the exact script is about 13 s of speech, so it is read at 1.2× and the beats follow the voice: workflow 5.95–9.6 s, payoff 9.6–11.5 s, end card from 11.5 s. The last word ends 0.12 s before the cut. This leaves no room for a pause before the CTA.
- **Music:** the same engine as the other long-form spots, with these parameters: drum pause on the question (1.62–2.5 s), a short drop and rise into the workflow, a warmer groove from 6.0 s, and a sting at 11.5 s (beat 23).

## 25 s in-stream — "Your client shouldn't need your scheduler login" (`share`)
One calendar and one post card (sky-blue artwork, yellow outline) carry the story. The same grid and card positions stay in place while the calendar changes role: agency workspace → shareable preview → client-facing "Shared calendar" → agency workspace again → the card becomes the CTA. The palette is brand yellow and charcoal with sky and coral as bright complementary accents; the client is coral.

| Time | Visual | Copy | VO (1.1×) |
|---|---|---|---|
| 0.0–4.0 | Bright downbeat; calendar cards pop in on the 8th-note grid. The client message pops in. A generic login panel (lock + blank fields, no credentials) appears; the cursor approaches, pauses (soft click) and pulls back. | **CLIENT WANTS TO REVIEW THE PLAN?** · "Can I review next week’s posts?" | 0.15–2.37 |
| 4.0–8.0 | The post card lifts (whoosh) and becomes a shareable preview on the client side; the agency workspace shrinks to the left. A share chip travels to the client. The lock between them closes (click) and then settles onto the agency side, so the login stays with the agency. The camera glides into the shared calendar. | SHARE THE CALENDAR. / **KEEP YOUR LOGIN PRIVATE.** | 4.05–6.45 |
| 8.0–14.0 | Client-facing view: logo, **Shared calendar** label, the client's avatar and no editing controls. The client's cursor clicks the post (click), and a comment note attaches to it (pop) with a gentle highlight. | **SHARE FOR REVIEW AND COMMENTS** · Shared calendar | 8.10–11.87 |
| 14.0–19.0 | The same calendar becomes the agency workspace (team list, toolbar). The camera pushes in. The team sees the comment (click), lifts the card, and updates its artwork from sky to coral (pencil badge, click). The card returns to its slot (snap) and the note is marked reviewed. Nothing auto-publishes. | CLIENT FEEDBACK. / **YOUR WORKFLOW.** | 14.10–17.43 |
| 19.0–21.7 | Pull back to the organized calendar; a yellow ripple and bright yellow/sky/coral shapes burst from the card (confirmation tone). | **A CLEARER WAY TO REVIEW THE PLAN** | 19.15–20.48 |
| 21.7–25.0 | Cards sweep outward; the post card becomes the CTA pill, then the logo builds. Static from about 22.9 s; sting at 22.0 s. | Logo · START YOUR RECURPOST TRIAL | 21.20–23.29 · 23.55–24.73 |

- **Accuracy:** the client only views and comments. The shared view has no editing controls and the client never sees the agency workspace. No credentials are ever shown.
- **Close timing:** "Share client calendars with RecurPost" starts at 21.2 s, during the payoff, so "Start your trial today" keeps a real pause and ends 0.27 s before the cut.
- **Music:** the same engine with no problem section (major from the first frame), opening up at 8.0 s when the shared calendar arrives. The engine gained an optional riser and a "pop" effect; the earlier spots' mixes are verified unchanged.
- **Motion:** every hold has a drift or float, so the end card is the only static stretch.

## Brand and compliance (all spots)
- **Logo:** `assets/brand/logo_dark_text.png` matches the supplied file to within WebP→PNG rounding (≤0.5%, alpha identical). It is drawn at its native 2000:245 ratio with no recolor, crop, shadow or effect. Only position and opacity animate on entry.
- **Palette:** sampled from the logo: yellow `#FFCD42` and charcoal `#1F1F1F` on a warm off-white.
- **UI:** abstract bars, shapes and icons. There are no platform logos, metrics, URL, pricing, quotes or claims. The only words on screen are the phrases each brief specifies.
- **Safe area:** critical copy and the logo sit inside 10% title-safe (x 192–1728).
- **Audio:** synthesized in code with no stock or library material, so it is cleared for commercial use.
- **Not verified by a human listener:** the TTS voice and the mix. Review them on headphones before trafficking.
