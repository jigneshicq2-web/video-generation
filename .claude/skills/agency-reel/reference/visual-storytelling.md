# Visual storytelling for Client vs Agency reels

What the best books and courses teach about telling a story with shots, staging, composition, colour and editing, turned into rules for our 9:16 Rex and Kate reels (1080x1920, 20 to 80 s, HTML/SVG/GSAP with a `.cam` layer). Read with `motion-style.md` (how things move) and `script-audit.md` (what is said). This file covers what the viewer sees and when.

The test for every rule here: **a muted viewer on a phone must be able to follow the story and find the laugh.** Most social video plays muted at least some of the time (Digiday reports 75% of people keep phones on mute; estimates for Instagram are lower, around 40%: [Digiday](https://digiday.com/sponsored/75-percent-of-people-watch-mobile-videos-on-mute/), [Verbit](https://verbit.ai/sound-on-sound-off-64-marketers-using-video-see-benefit-of-captions/)).

---

## (a) Principles, with the why

1. **Emotion first, then story, then everything else.** Walter Murch ranks a cut by emotion (51%), story (23%), rhythm (10%), eye trace (7%), 2D screen plane (5%) and 3D space (4%). When they conflict, give up the lower ones first ([StudioBinder on *In the Blink of an Eye*](https://www.studiobinder.com/blog/walter-murch-rule-of-six/)). *Why:* the viewer forgives a jumped prop but not a dead laugh. For us, a cut that lands Kate's deadpan at the right instant beats a perfectly continuous one.

2. **Intensity is made with contrast and removed with affinity.** Bruce Block's core principle: more contrast in a visual component (space, line, shape, tone, colour, movement, rhythm) raises intensity; more affinity (sameness) lowers it ([Block, *The Visual Story*, ch. 2](https://www.taylorfrancis.com/chapters/mono/10.4324/9781315794839-2/contrast-affinity-bruce-block)). *Why:* the audience feels the build without being told. Plot an **intensity curve** that matches the script: calm affinity at the setup (flat space, matched warm tones, slow even rhythm), rising contrast as Rex escalates (tighter shots, clashing red against Kate's cool blue, faster cuts), maximum contrast at the punch, then a sharp drop to affinity for the hold.

3. **Give each character a visual signature and keep it.** Block's components become character tools: Rex gets diagonals, jagged shapes, warm saturated colour and fast erratic motion; Kate gets verticals and horizontals, round shapes, cool calm colour and slow deliberate motion. *Why:* when Kate finally moves fast or the frame goes red on her side, the change itself is the story.

4. **Choose the moment, then the frame.** Scott McCloud's five choices are moment, frame, image, word and flow ([*Making Comics*](https://en.wikipedia.org/wiki/Making_Comics); [uCreative summary](https://www.ucreative.com/articles/comicstheory1/)). Pick which instants to show before deciding how to show them. *Why:* a 20 s reel holds about 6 to 10 shots. Each must be the most telling instant, not a random slice.

5. **Let the viewer close the gap.** McCloud's closure: the mind fills in what happens between panels. Action-to-action (Rex types, the form is full) is fast and clear. Moment-to-moment (Kate's eyes, then Kate's eyes half a second later) stretches time and builds tension. *Why:* the laugh often lives in what the viewer infers. Cut from Rex's "one small change" to 47 red comments on the device and let the viewer do the maths.

6. **Simplify and combine.** Pixar story rules from Emma Coats: "Simplify. Focus. Combine characters. Hop over detours," and "What's the essence of your story? Most economical telling of it?" ([Coats' 22 rules](https://www.aerogrammestudio.com/2013/03/07/pixars-22-rules-of-storytelling/)). Pixar in a Box's story spine ("Once upon a time... Every day... Until one day... Because of that... Until finally...") compresses a film into beats ([Khan Academy](https://www.khanacademy.org/humanities/hass-storytelling/storytelling-pixar-in-a-box)). *Why:* a reel is a story spine with one "because of that" and a punch.

7. **Readable staging beats pretty drawing.** Disney-trained Nancy Beiman teaches rough staging and clear silhouettes before detail in *Prepare to Board!* ([Routledge](https://www.routledge.com/Prepare-to-Board-Creating-Story-and-Characters-for-Animated-Features-and-Shorts/Beiman/p/book/9781498797009)). *Why:* stick figures live or die on silhouette. A pose that reads as a black shape at thumbnail size reads everywhere.

8. **Film grammar keeps the viewer oriented.** Keep the 180 degree line: Rex stays left facing right, Kate stays right facing left, for the whole reel unless a cut is meant to disorient. Matched eyelines (each looks toward where the other is on screen) sell that they are talking to each other. Screen direction carries meaning: things arriving from Rex's side are trouble. Cut on action (mid-gesture) to hide cuts. Use J cuts (next shot's audio starts early) and L cuts (previous line runs over the next picture) so the reaction plays under the line that caused it.

---

## (b) Shot and beat planning method

Work in three passes. Never open the build before pass 3 exists.

**Pass 1: beat sheet.** Write the story spine in one line per beat. Mark the single punch beat and the device's role in each beat (empty, filling, reveal, verdict). Assign an intensity value 1 to 10 to each beat (Block's curve). It must rise to the punch and fall at the hold.

**Pass 2: shot list.** For each beat, apply McCloud's choices: which moment, which frame (shot size), which image (what is in the frame and, as important, what is not), which word (caption or on-screen text), which flow (how it hands off to the next shot). One focal point per shot.

**Pass 3: camera moves.** Every move needs a motivation from this list: *reveal* (pull-back, pan), *emphasis* (push-in, punch-in), *reaction* (punch-in on a face), *transition* (match cut, zoom-through), *release* (pull-back after the punch). No motivation, no move: hold.

### Shot sizes for stick figures in 9:16

| Size | Framing in 1080x1920 | Use it for |
|---|---|---|
| Wide / two-shot | Both full figures plus device, figures about 500 to 700 px tall | Setup, geography, the hold after the punch |
| Medium | One character from the waist, about 1.3x | Lines with gesture |
| Close-up | Head fills about 40% of width, about 2x | Reactions, the deadpan |
| Insert | The device fills the frame | Reading what the device says |
| Over-the-shoulder | Back of Rex's head large in the foreground, Kate small beyond | Pressure, power imbalance |

### Template

| # | Time | Beat (spine) | Intensity | Shot size | Focal point | Device state | Camera move + motivation | Caption / on-screen text | Sound | Cut type |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.0 to 2.0 | Hook: Rex barges in | 5 | Two-shot | Rex's entrance | Empty form | None (entrance is the motion) | "The client who..." | Door slam | Hard cut in |
| 2 | 2.0 to 6.0 | Rex's demand | 6 | Medium Rex | Rex's pointing hand | Filling | Slow push-in (emphasis) | Rex line, word by word | Typing | Cut on action |
| 3 | 6.0 to 8.0 | Device overflows | 8 | Insert | The device | Overflowing | Punch-in (emphasis) | None, the device reads | Pop x3 | Match cut |
| 4 | 8.0 to 9.5 | Kate reacts | 9 | Close-up Kate | Kate's eyes | Off screen | None (hold) | None | Silence | L cut |
| 5 | 9.5 to 12.0 | Punch line | 10 | Close-up Kate | Kate's mouth | Off screen | None | Kate line | None | Hard cut |
| 6 | 12.0 to 14.0 | Hold / release | 3 | Two-shot | Rex's frozen face | Verdict visible | Pull-back (release) | None | Room tone | Cut to end card |

Fill every column. An empty "motivation" cell means cut the move.

---

## (c) Comedy framing rules

1. **Hide, then show.** A reveal needs information withheld first. Frame the device off screen or face down, let Rex promise "just a tiny tweak," then pull back or pan to show the 40-field form. Edgar Wright's comedy is built on "what's in frame and what's not" ([Every Frame a Painting, via MovieMaker](https://www.moviemaker.com/edgar-wright-visual-comedy-video/)).

2. **The reaction is the laugh.** The funniest shot is usually the listener, not the speaker. Kate's blank stare after Rex's line is the payoff. Give it its own shot and its own time. Cyanide & Happiness uses silent **beat panels** for exactly this pause ([TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Webcomic/CyanideAndHappiness)).

3. **Know where the camera is when the joke lands.** Decide the punch frame first and build backwards. Two options, pick one on purpose: *wide* (Keaton, Tati) so the viewer sees cause and effect together, or *close* on the reaction so the viewer sees the character realise. Never land the punch mid-move.

4. **Hold. Do not cut away from the laugh.** Keaton played gags in wide single takes so the audience could see it was real ([Every Frame a Painting, "The Art of the Gag," via No Film School](https://nofilmschool.com/2015/11/buster-keaton-tony-zhou-every-frame-painting)). For us: after the punch, freeze the camera for at least 1.0 s (series rule), keep small idle motion (a blink, a sweat drop) so it does not read as a frozen render, and cut only once the laugh has had room.

5. **Use frame edges as gag tools.** Wright's list: things entering frame funnily, characters exiting funnily, "there and back again" (Kate walks off to check, walks straight back), match cuts between scenes, perfectly timed sound effects, and over-dramatic lighting cues ([MovieMaker](https://www.moviemaker.com/edgar-wright-visual-comedy-video/)). A second phone sliding in from frame left is funnier than a phone appearing.

6. **Comic space: stage in depth and let the eye find it.** Tati put gags in the middle and far distance of wide, long-held shots ([Criterion, "The Dance of PlayTime"](https://www.criterion.com/current/posts/446-the-dance-of-playtime); [Cinemontage](https://cinemontage.org/jacques-tatis-playtime/)). On a phone we cannot rely on wandering eyes, so use one background gag at most, and only during a hold (a notification count ticking up behind Kate). Oversimplified hides background gags the same way, as a reward for rewatchers ([Creator Handbook](https://www.creatorhandbook.net/oversimplified-a-youtube-empire/)).

7. **The device must never answer the joke before the character does.** Order is: line, reaction, then device confirms (or device, reaction, then line). If the calendar turns red before Kate says "that's Christmas," the device stole the punch. Time the device's verdict to land on or after the punch word, never before.

8. **Rule of three with escalation in the frame.** Each repeat is bigger: shot one medium, two tighter, three the widest reveal. Contrast (Block) must increase each time or the third beat feels flat.

9. **Timing lives in sound effects and cuts together.** A pop, stamp or "ding" exactly on the frame of the visual change doubles the gag. For muted viewers the same moment needs a visual accent (shake, flash, squash).

---

## (d) 9:16 short-form rules

1. **Safe zone.** Keep faces, the device and captions inside x 110 to 940, y 230 to 1480 (the house rule in build-recipe.md, which also accounts for tall phones cropping the sides). Instagram and TikTok cover the top username band, the right-side action column and the bottom caption stack; guides range from 108 to 270 px top and 320 to 670 px bottom ([Outfy](https://www.outfy.com/blog/instagram-safe-zone/), [Firstpier](https://www.firstpier.com/resources/instagram-ad-safe-zones)). The punch must sit in the centre band.

2. **Stack, do not spread.** Vertical frames compose top to bottom. Default layout: caption band top third, characters middle, device lower middle (or device top, faces below). Characters side by side must still face each other; pull them close so both heads fit at a readable size.

3. **One focal point at a time.** At phone size only one thing can be read per instant. Dim, blur or scale down everything else (Block's tonal contrast: the focal point is the brightest, most saturated, sharpest thing).

4. **The first frame is a story frame.** No fades, logos or empty sets. Frame 1 shows both characters, a readable 3 to 5 word headline and a hint of the device, with motion already happening ([Teleprompter on the 3 second rule](https://www.teleprompter.com/blog/tiktok-3-second-rule)). It doubles as the cover frame: if the grid thumbnail is this frame, would a stranger know the premise?

5. **Text is storytelling, not subtitles.** Captions reveal word by word (see `build-recipe.md`) so the punch is never readable early. Speaker chips or colour match the characters (Rex warm, Kate cool). Emphasise one word per line. Minimum about 56 px for captions and 60 px for device text; the headline 120 px or more.

6. **Readable at thumb size.** Test at 360x640. Silhouettes, faces and device content must read at that scale. Thin 2 px lines vanish; use 6 px or thicker strokes on figures.

7. **Continuity so nobody gets lost.** Fix Rex left and Kate right for the whole reel. Keep a persistent anchor (the desk line, the device's position) across cuts. Use match cuts and camera moves instead of unexplained jumps, and end each scene on a frame that matches the next.

8. **Colour and light carry mood shifts.** Grade the whole frame when the stakes change: neutral daylight setup, warmer and more saturated as Rex escalates, a cool or dim flash on the "oh no" beat, a bright warm release on the win. Change one thing at a time so the change reads.

9. **How the references do it.** Kurzgesagt reduces ideas to "simple shapes" and bright colour so one concept reads per scene ([Forbes interview with Philipp Dettmer](https://www.forbes.com/sites/danidiplacido/2024/10/24/kurzgesagt-in-a-nutshell-creator-talks-youtube-tiktok-and-optimistic-nihilism/)). Oversimplified uses near stick figures with oversized heads and expressive brows, and bait-and-switch visual gags against narration ([TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/WebAnimation/OverSimplified)). Cyanide & Happiness gets huge range from minimal figures through pose, silence and the beat panel. Duolingo's owl runs on one exaggerated personality, fast trend-native skits and absurd escalation, measured on watch time and shares ([Digiday](https://digiday.com/marketing/how-duolingo-is-using-its-unhinged-content-with-duo-the-owl-to-make-people-laugh-on-tiktok/)).

---

## Common failure modes and fixes

| Failure | Why it hurts | Fix |
|---|---|---|
| Cluttered frame | No focal point at phone size | One focal point; dim or remove the rest; stage in depth |
| Everything the same size | No hierarchy, no contrast (Block) | Vary shot sizes; scale the focal element 1.3x or more |
| Camera moves without motivation | Motion reads as noise, dulls real emphasis | Every move needs reveal, emphasis, reaction, transition or release; otherwise hold |
| Cutting on the joke | Kills the laugh (Murch: emotion first) | Hold 1.0 s or more on the reaction; cut after the laugh |
| Device answers first | Punch is spoiled | Device verdict lands on or after the punch word |
| Characters face camera | Reads as two monologues, breaks eyelines | Three-quarter heads facing each other; camera looks at the conversation |
| Punch mid-move | Eye is tracking, not reading | Settle the camera 6 to 10 frames before the punch |
| Screen direction flips | Viewer loses who is who | Respect the 180 degree line; Rex left, Kate right |
| Slow open | Swipe in the first second | Motion and headline on frame 1 |
| Text under the UI | Unreadable on the real app | Safe-zone overlay check on every snapshot |
| Uniform rhythm | Flat intensity curve | Short fast cuts in the build, one long hold at the punch |

---

## (e) Visual audit checklist

Run on the storyboard, then again on `hyperframes snapshot` frames. Every answer must be yes.

1. Muted, with captions only, does the story still make sense and does the punch land?
2. Does frame 1 show both characters, the premise headline and motion, with no fade or logo?
3. Would frame 1 work as the cover thumbnail on a profile grid?
4. Does every shot have exactly one focal point that is the brightest, largest or sharpest element?
5. Do Rex and Kate face each other (not the camera) in every two-shot, with eyelines that meet?
6. Does Rex stay screen left and Kate screen right for the whole reel?
7. Does every camera move have a written motivation (reveal, emphasis, reaction, transition, release)?
8. Is the camera settled before the punch word, not moving through it?
9. Is there a held reaction shot of at least 1.0 s after the punch, with small idle motion?
10. Does the device's verdict land on or after the punch word, never before?
11. Is information hidden before each reveal (off screen, face down, out of frame)?
12. Does the intensity curve rise to the punch through increasing contrast (shot size, colour, rhythm) and drop after?
13. Does each repeat in a rule of three escalate visually?
14. Are all faces, captions and device text inside the safe zone (x 110 to 940, y 230 to 1480)?
15. Is every caption and device label readable at 360x640?
16. Does each scene's last frame hand off cleanly (match cut, move or cut on action) to the next?
17. Does the mood shift (colour or light) happen at the story turn and nowhere else?
18. Is the punch word hidden in the caption until it is spoken?
19. Does every visible gag moment have both a sound accent and a visual accent (shake, flash, squash)?

---

## (f) References and what to steal

- **Pixar in a Box, "The Art of Storytelling"** ([Khan Academy](https://www.khanacademy.org/humanities/hass-storytelling/storytelling-pixar-in-a-box)). Steal the story spine as the beat sheet skeleton, and the habit of boarding before building.
- **Emma Coats, Pixar's 22 rules** ([Aerogramme](https://www.aerogrammestudio.com/2013/03/07/pixars-22-rules-of-storytelling/)). Steal "simplify, focus, hop over detours" and "most economical telling."
- **Bruce Block, *The Visual Story*** ([Taylor & Francis](https://www.taylorfrancis.com/chapters/mono/10.4324/9781315794839-2/contrast-affinity-bruce-block)). Steal contrast and affinity, per-character visual signatures, and the intensity curve plotted against the beat sheet.
- **Scott McCloud, *Understanding Comics* and *Making Comics*** ([Wikipedia](https://en.wikipedia.org/wiki/Making_Comics)). Steal the five choices as shot-list columns, closure for off-screen jokes, and moment-to-moment transitions for the deadpan.
- **Walter Murch, *In the Blink of an Eye*** ([StudioBinder](https://www.studiobinder.com/blog/walter-murch-rule-of-six/)). Steal the rule of six as the tiebreaker: emotion wins, 3D continuity loses.
- **Nancy Beiman, *Prepare to Board!*** ([Routledge](https://www.routledge.com/Prepare-to-Board-Creating-Story-and-Characters-for-Animated-Features-and-Shorts/Beiman/p/book/9781498797009)). Steal rough staging first, silhouette tests, and designing characters for the story's acting.
- **Every Frame a Painting, "Edgar Wright: How to Do Visual Comedy"** ([MovieMaker](https://www.moviemaker.com/edgar-wright-visual-comedy-video/)). Steal frame entrances and exits, there-and-back-again, match cuts and sound-synced gags.
- **Every Frame a Painting, "Buster Keaton: The Art of the Gag"** ([No Film School](https://nofilmschool.com/2015/11/buster-keaton-tony-zhou-every-frame-painting)). Steal the wide, held frame that shows cause and effect together, and "show, do not title-card."
- **Jacques Tati, *PlayTime*** ([Criterion](https://www.criterion.com/current/posts/446-the-dance-of-playtime)). Steal depth staging and one quiet background gag during holds.
- **Kurzgesagt** ([Forbes](https://www.forbes.com/sites/danidiplacido/2024/10/24/kurzgesagt-in-a-nutshell-creator-talks-youtube-tiktok-and-optimistic-nihilism/)). Steal simple shapes, bright focal colour and one idea per scene.
- **Oversimplified** ([Creator Handbook](https://www.creatorhandbook.net/oversimplified-a-youtube-empire/)). Steal big heads with expressive brows, bait-and-switch visuals and rewatch background gags.
- **Cyanide & Happiness** ([TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Webcomic/CyanideAndHappiness)). Steal the silent beat panel before the punch and minimal-figure acting through pose.
- **Duolingo on TikTok** ([Digiday](https://digiday.com/marketing/how-duolingo-is-using-its-unhinged-content-with-duo-the-owl-to-make-people-laugh-on-tiktok/)). Steal one consistent exaggerated character, trend-native pacing and judging by watch time and shares.
- **Platform safe zones** ([Outfy](https://www.outfy.com/blog/instagram-safe-zone/)). Steal the overlay check on every snapshot.
