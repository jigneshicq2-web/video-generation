# Animation craft: acting and comedy timing for the Rex and Kate rigs

Companion to `motion-style.md` (the look) and `motion_kit.py` (the code). This file is the acting: what the classic books and schools teach, turned into numbers and GSAP rules for jointed stick-figure rigs at 30 fps in 9:16. All frame counts are at 30 fps unless marked @24 (film numbers from the sources; multiply by 1.25 to convert).

---

## (a) Principles, with the why

**The 12 principles** ([Thomas & Johnston, *The Illusion of Life*](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)). The ones that matter most for a two-hander dialogue reel:

- **Squash and stretch**: shows weight and flexibility. On a stick rig it lives in the `root` scale (hop, squash) and in the face (brows up = stretch, brows down = squash).
- **Anticipation**: tells the audience where to look before the action happens, so they do not miss it. The bigger the action, the bigger and longer the wind-up.
- **Staging**: one idea per moment, read in silhouette. In a 9:16 two-shot, only one character should be doing the big thing.
- **Pose to pose**: design the key poses first, then time them. Procedural animation is naturally pose to pose, which is good; the danger is that the in-betweens are all the same shape.
- **Follow-through and overlapping action**: parts of the body stop at different times. Without it, the rig reads as one rigid object ([Animation Mentor on overlap](https://www.animationmentor.com/blog/follow-through-and-overlapping-action-the-12-basic-principles-of-animation/)).
- **Slow in and slow out**: spacing, not timing, is what makes motion feel heavy or light.
- **Arcs**: hands and heads travel on arcs. Rotating joints gives you arcs for free; translating a whole group in a straight line does not.
- **Secondary action**: a hand to the chain, a sunglasses push, a pen click, which supports the main action without competing with it.
- **Timing**: the number of frames an action takes defines its weight and its meaning.
- **Exaggeration**: push the pose past real life so it reads at phone size in under a second.
- **Solid drawing / appeal**: for us this is asymmetry, clear line of action, and designs that read at 1080 px wide.

**Richard Williams, *The Animator's Survival Kit*** ([archive](https://archive.org/details/animatorssurviva0000will)):

- "It's all in the timing and the spacing." Timing is where the beats land; spacing is how far the thing moves between frames. Two tweens with identical duration feel totally different with different eases.
- **Key poses, then breakdowns.** The breakdown (the middle pose) is where the personality lives: an arm that goes out and then over reads differently from one that goes straight across. In GSAP, a breakdown is a keyframe in the middle of a move, not just an ease.
- **Successive breaking of joints** (from Art Babbitt and Milt Kahl): a movement travels through the chain one joint at a time, from the root outward, like a whip.
- **Takes and accents.** A take is anticipation, then the accent (extreme), then a settle. Accents are the hits that land on the stressed syllable.
- **Visual accents lead the sound by 2 frames** (Williams' rule for sound hits, noted in the expanded edition, [dokumen.pub](https://dokumen.pub/the-animators-survival-kit-expanded-edition-a-manual-of-methods-principles-and-formulas-for-classical-computer-games-stop-motion-and-internet-animators-expanded-edition-0571238347-9780571238347-0571238330.html)).
- **Walks and weight**: the body is lowest just after the contact, highest on the passing position. Weight is shown by where the drop happens, not by how far the feet travel.

**Ed Hooks, *Acting for Animators*** ([summary of the principles](https://pushingposes.blogspot.com/2009/09/essential-acting-principles.html), [second summary](http://adweaver.blogspot.com/2012/12/7-acting-principle-ed-hooks.html)):

- **Thinking leads to conclusions; emotion leads to action.** A character decides, then moves. Animate the thought (eyes shift, a pause) before the gesture.
- **Audiences empathize with emotion, not with thinking.** The joke lands on the face of whoever is reacting.
- **Play an action until something happens to make you play a different action.** Rex keeps selling until Kate's line stops him. No random pose changes.
- **A scene is a negotiation**: each character wants something, and there is a way to win and a way to lose. Rex wants it free and yesterday; Kate wants to be paid and sane.
- **Acting is doing and reacting.** The listener is acting too. In a dialogue reel, the listener is usually the funnier shot.
- **Scenes start in the middle.** Open on Rex already mid-gesture, not on a neutral T-pose.

**School curricula** (Animation Mentor, iAnimate, AnimSchool): pose to pose with strong **silhouettes** and a clear **line of action**; no **twinning** (symmetric limbs look "dead", [Animation Mentor](https://www.animationmentor.com/blog/twinning-and-why-you-should-usually-avoid-it/)); **moving holds** instead of freezes ([Animation Mentor](https://www.animationmentor.com/blog/why-all-animators-need-to-master-the-moving-hold/), [AnimSchool](https://blog.animschool.edu/2024/11/27/create-moving-holds-animating-nothing/)); **blink for a reason** (blinks mark a thought change or a head turn, not a metronome; Shawn Kelly via Animation Mentor, [Bloop on blinks and darts](https://www.bloopanimation.com/blinking-animation/)); **lip sync on the accents, not every syllable** ([Pluralsight](https://www.pluralsight.com/resources/blog/software-development/proven-tips-animating-believable-lip-sync)).

---

## (b) Acting method per dialogue line

Run these five questions for every line, for **both** characters (speaker and listener), before touching code.

1. **Objective.** What does the speaker want from the other person with this line? Write it as a verb: Rex *impresses*, *bullies*, *flatters*, *backpedals*; Kate *corrects*, *stalls*, *cuts off*, *lets him hang*. One verb per line (Hooks: one objective, play it until something changes).
2. **Thought.** What is the thought just before speaking? That is the pre-line beat: eye dart plus blink plus a small head move, 6 to 12 frames before the first word. If the line is a reply, the thought is a reaction to the last line.
3. **Pose.** One attitude pose for the line, plus one accent pose for the stressed word. Default: 2 key poses per line of up to 3 s; 3 poses for up to 6 s; never more than 1 new key pose per 1.5 s of speech. Find the single most stressed word and put the accent on it, landing 2 frames before the syllable.
4. **Take.** What does the listener do? Pick one: no reaction (deadpan hold), slow blink, eye dart to camera, brow up, small take, or big take. Scale the take to the joke's size and save the big take for the reel's biggest line.
5. **Hold.** Where does the line stop moving? Every punchline ends in a moving hold on the reactor of 0.5 to 1.5 s before anything else happens.

**Character vocabularies (keep them contrasting; contrast of energy is the comedy engine):**

- **Rex (high energy, high self-status).** Wide stance, weight on one leg, chest out, head tilted back 5 to 8 degrees, arms open and away from the body, big gestures that finish with a point or a spread palm. His eyes are hidden by the sunglasses, so he acts with **brows above the frames, head angle, mouth width and hands**. His one big take per reel is **lowering the sunglasses** (a reveal of eyes is his double take). Secondary: touch the chain, smooth the hair.
- **Kate (low energy, dry).** Narrow, closed, economical. Arms close to the body or crossed, one hand on hip. Her reactions are subtractions: a stillness, a single slow blink (10 to 14 frames), eyelids down to half (`lid`), a 3 to 6 degree head tilt, a flat mouth. She moves big at most once per reel, and it is earned. Her glance to camera (a Jim Halpert look) is a take in itself.

---

## (c) Comedy timing cheat-sheet (30 fps)

| Beat | Frames | Seconds | Notes |
|---|---|---|---|
| Blink, normal | 4 to 6 total (2 close, 1 closed, 2 to 3 open) | 0.13 to 0.2 | Close faster than open ([Bloop](https://www.bloopanimation.com/blinking-animation/)) |
| Blink, slow / tired / unimpressed | 10 to 14, closed 4 to 6 | 0.35 to 0.45 | Kate's signature |
| Eye dart | 2 to 3 | 0.07 to 0.1 | Snap, then hold; blink during head turns |
| Minimum readable pose | 8 to 15 hold | 0.25 to 0.5 | Main poses hold 6 to 12 @24 ([School of Motion](https://www.schoolofmotion.com/blog/how-to-animate-character-takes)) |
| Thinking beat before a reply | 6 to 12 | 0.2 to 0.4 | Eyes move first, then head, then body |
| Take: anticipation | 5 to 8 | 0.17 to 0.27 | 4 @24 (smooth take) or 6 @24 (Warner pop) |
| Take: accent | 1 to 3 (pop) or 8 to 11 (hold on the extreme) | 0.03 to 0.37 | Warner style: 1 frame into the extreme |
| Take: settle | 8 to 10 | 0.27 to 0.33 | Ease into the final pose, overshoot once |
| Double take | antic 5, head turns 4 apart, accent 11, settle 9 | about 1.1 total | Head shakes between antic and accent |
| Hold before the take | 10 to 20 | 0.33 to 0.67 | The "it hasn't landed yet" beat |
| Deadpan hold after a punchline | 15 to 45 | 0.5 to 1.5 | Moving hold only, no new action |
| Slow burn | 45 to 90 | 1.5 to 3 | Lids lower in 2 to 3 steps, brows knit, one blink, then the line |
| Gesture accent vs audio | lead by 2 | 0.067 | Williams |
| Mouth open vs audio | lead by 1 to 2 | 0.03 to 0.067 | Close lips on p/b/m |
| Camera punch-in | 2 to 4 (or a cut) | 0.07 to 0.13 | On the reaction, not the line |
| Camera shake on a hit | 4 to 6 decaying | 0.13 to 0.2 | Existing `shake` at 0.04 per step |
| Beat between two jokes | at least 20 | 0.67 | Let the laugh breathe |

**Comedy rules of thumb:**

- **Fast, then still.** Comedy lives in the contrast: a snap (2 to 4 frames) into a hold (15+ frames). Even pacing is never funny ([Animation Mentor timing](https://www.animationmentor.com/blog/timing-the-12-basic-principles-of-animation/)).
- **The hold before the take is the joke.** The audience gets it before the character does. Make them wait 10 to 20 frames.
- **Deadpan is an active choice**: a moving hold with one blink, never a frozen frame.
- **Escalate** takes across the reel: small, medium, big. Never open with the big one.
- **Cut to the reaction.** The punch-in goes on the listener's face, not the speaker's mouth.

---

## (d) Amateur vs pro fix list

| Amateur tell | Why it reads fake | Fix |
|---|---|---|
| **Floaty easing** (`power1.inOut` or `sine.inOut` on everything) | Every move has the same soft start and stop, so nothing has weight | Use asymmetric eases: `power3.out` / `expo.out` for snaps, `power2.in` for falls, `back.out` for arrivals. Reserve `sine.inOut` for breathing and drifts |
| **Everything moves at once** | Body parts start and stop on the same frame, reads as a rigid puppet | Stagger joints 2 to 3 frames outward from the root; head lags the torso |
| **No holds** | Constant motion is noise; the eye has nothing to read | Every key pose holds at least 8 frames; punchlines hold 15 to 45 |
| **Dead holds** (frozen) | Looks like the render stalled | Moving hold: 1 to 3 degrees of drift in the direction of the last move, plus eyes |
| **Symmetric poses / twinning** | Mirror-image limbs are "dead" ([Animation Mentor](https://www.animationmentor.com/blog/twinning-and-why-you-should-usually-avoid-it/)) | Offset left and right joint angles by at least 8 degrees and in time by 2+ frames; weight on one leg |
| **Mechanical loops** (fixed-period breathing, blink every 2.0 s) | The eye spots the metronome in 3 cycles | Seed period and amplitude per cycle; tie blinks to thoughts and head turns |
| **No anticipation** | Actions surprise the viewer, who misses them | Counter-move 20 to 40% of the action's amplitude before every big gesture |
| **No weight** | Characters glide | Drop the body 3 to 6 px at contact and on the accent; overshoot on arrival |
| **Robotic idle breathing** (pure sine `y` yoyo) | Too even, too visible, and it never stops | Shoulders and chest only, 2 to 3 px, 3.5 to 5 s period with jitter, paused during big gestures |
| **Linear motion on limbs** | Straight lines, no arcs | Rotate joints about their origins; never translate a hand group |
| **Lip flap on every syllable** | Jittery mouth, eye goes there and stays | Open on accents and vowels, close on p/b/m, rest in pauses |
| **Both characters acting at once** | Staging mud | Only one character does a big move at a time; the other holds |
| **Camera moving constantly** | Same as no holds | Camera holds too; push slowly, punch rarely |

---

## (e) GSAP rig rules

**Ease map by action type:**

- Anticipation: `power2.inOut`, 5 to 8 frames.
- Snap into accent: `power4.out` or `expo.out`, 2 to 4 frames; or `tl.set` for a Warner pop.
- Arrival or settle: `back.out(1.4)` for realistic, `back.out(2.2)` or `elastic.out(1,0.5)` for cartoony, on the settle only.
- Head turn: `power3.out`, 5 to 8 frames, with a blink in the middle.
- Falling or slumping: `power2.in`, then a squash on contact.
- Moving hold drift and breathing: `sine.inOut` or `sine.out`, long (0.5 s+).
- `none` only for walk translation, boil, and the ticks.

**Successive breaking (the whip):**

```js
// joint order root -> hip -> spine/upper -> shoulder -> elbow; head lags the shoulders
const F=1/30;
const chain=(parts,at,d,ease,lag=2)=>parts.forEach(([k,rot],i)=>
  tl.to(id(k),{rotation:rot,svgOrigin:OR[k],duration:d,ease},at+i*lag*F));
chain([['armR',-70],['foreR',-35]],t,6*F,'power3.out');     // arm leads, forearm follows
tl.to(id('head'),{rotation:-6,svgOrigin:OR.head,duration:8*F,ease:'power2.out'},t+3*F);
```

Lag 2 frames per joint for snappy moves, 3 to 4 for heavy or lazy ones. The forearm overshoots about 10% past its target, then settles back over 6 frames.

**Primary vs secondary layering:** write the primary track (body pose, gesture) first; add the secondary (chain touch, sunglasses push, brow) 3 to 6 frames later and at a third of the amplitude. Secondary never starts on the same frame as the primary accent.

**Asymmetry:** in `K.pose`, never give `armL` and `armR` (or `legL`/`legR`) the same absolute angle or the same start time. Offset by at least 8 degrees and 2 frames.

**Moving hold after every key pose:**

```js
const hold=(k,drift,at,d)=>tl.to(id(k),{rotation:`+=${drift}`,svgOrigin:OR[k],duration:d,ease:'sine.out'},at);
// after the pose lands at t, for a 1 s hold: continue 1.5 deg the same way
hold('head',1.5,t,1.0); hold('armR',-2,t+2/30,1.0);
```

Drift is always smaller than the move before it and in the same direction ([Animation Mentor](https://www.animationmentor.com/blog/why-all-animators-need-to-master-the-moving-hold/)).

**Breathing (replace the fixed yoyo in `K.breathe`):** drive `upper` y from a `tick` with a seeded period: `period = 4.2 + 0.8*H(cycle,seed)`, amplitude 2 to 3 px, and multiply by 0 while a gesture tween is active. Breathing is a floor, not a feature.

**Blinks:** schedule blinks at thought changes (start of a reply, after a punchline), with every head turn over 15 degrees, and fill gaps so no stretch exceeds 4 s. Vary: 70% normal (5 frames), 20% slow (12 frames), 10% double blink. Never on the accent frame of a line.

**Eyes lead:** for any look or turn, pupils move first (2 to 3 frame dart), head follows 2 to 4 frames later, body 2 to 4 frames after that.

**Lip sync:** mouth shapes only on stressed vowels and plosives; open 1 to 2 frames before the audio, hold wide on the accent word, `mFlat` in pauses longer than 8 frames. Swap mouths with `tl.set` (discrete), never a crossfade.

**Poses per line:** 2 key poses per line up to 3 s, 3 up to 6 s. The listener gets 1 reaction pose per line, and nothing on lines where the speaker's gesture is the joke.

**Comedy holds:** after a punchline, the timeline for the reactor is a moving hold only, 15 to 45 frames, and the camera holds too. Anything else that moves in that window steals the laugh.

**Boil:** keep it on (3 frame re-pose), but its amplitude must stay below the moving-hold drift so a hold still reads as a hold.

---

## (f) Animation audit checklist (run on snapshots before render)

Snapshot at each line start, each accent word, and 0.5 s after each punchline.

1. Does every line have one written objective verb per character?
2. Does each speaker have a thinking beat (eyes move before the body) before replying?
3. Does every key pose read in silhouette (fill both characters black mentally)?
4. Is there a clear line of action through each torso, not a vertical stick?
5. Are all arms and legs asymmetric in angle and timing (no twinning)?
6. Does each big gesture have an anticipation in the opposite direction?
7. Do joints arrive in sequence (root, shoulder, elbow, head last), not on one frame?
8. Does each key pose hold at least 8 frames?
9. Is every hold a moving hold (compare two snapshots 0.5 s apart: small change, not zero, not large)?
10. At each punchline, is only one character moving (or none)?
11. Is there a 15 to 45 frame hold on the reactor after each punchline?
12. Do gesture accents land about 2 frames before the stressed syllable?
13. Are blinks tied to thoughts or head turns, with no metronome pattern and no gap over 4 s?
14. Does the mouth rest in pauses instead of flapping?
15. Do takes escalate across the reel, with the biggest one saved for the end?
16. Does Kate stay economical and Rex stay big (energy contrast intact)?
17. Does the camera hold during the reaction, and punch in on the reactor rather than the speaker?
18. Is the idle breathing invisible at a glance (2 to 3 px, varied period)?
19. Does the boil amplitude stay below the hold drift?

Any "no" is a fix before rendering.

---

## (g) References and what to steal

- **Thomas & Johnston, *The Illusion of Life*** ([overview](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)): the vocabulary. Steal staging (one idea at a time) and exaggeration for phone-size reads.
- **Richard Williams, *The Animator's Survival Kit*** ([archive](https://archive.org/details/animatorssurviva0000will)): steal timing vs spacing, breakdowns that carry personality, successive breaking of joints, and "accent 2 frames ahead of the sound".
- **Ed Hooks, *Acting for Animators*** ([notes](https://deborahfoy.wordpress.com/2021/03/08/notes-from-ed-hooks-acting-for-animators/)): steal the objective per scene, scene as negotiation, and "play an action until something changes it".
- **Animation Mentor blog**: [twinning](https://www.animationmentor.com/blog/twinning-and-why-you-should-usually-avoid-it/), [moving holds](https://www.animationmentor.com/blog/why-all-animators-need-to-master-the-moving-hold/), [overlap](https://www.animationmentor.com/blog/follow-through-and-overlapping-action-the-12-basic-principles-of-animation/). Steal the audit mindset: every frame justified.
- **School of Motion, "How to animate character takes"** ([link](https://www.schoolofmotion.com/blog/how-to-animate-character-takes)): steal the exact take and double take frame structure used in section (c).
- **AnimSchool, "Animating Nothing"** ([link](https://blog.animschool.edu/2024/11/27/create-moving-holds-animating-nothing/)): steal drift in the direction of the last move.
- **Bloop Animation on blinks** ([link](https://www.bloopanimation.com/blinking-animation/)) and **Alan Becker's stick figure course** ([link](https://www.bloopanimation.com/stick-figure-animation-course-by-alan-becker/)): steal fast-close/slow-open blinks, 3 frame darts, and Becker's lesson that stick figures sell everything through pose, silhouette and uneven in-betweens (favor the rest pose when starting from rest).
- **UPA and Hanna-Barbera limited animation** ([Wikipedia](https://en.wikipedia.org/wiki/Limited_animation), [Yowp on H-B tricks](https://yowpyowp.blogspot.com/2018/06/the-hanna-barbera-tricks.html)): steal the idea that design and timing beat frame count; hold the body and animate only the mouth, eyes and one hand. That is our rig.
- **South Park and Cyanide & Happiness** ([C&H](https://en.wikipedia.org/wiki/Cyanide_%26_Happiness)): steal deadpan pacing on crude rigs. The laugh comes from the voice read plus a held, blank reaction, so do not over-animate a line that is already funny.
- **Bluey (Ludo Studio)** ([behind the scenes](https://www.bluey.tv/blog/bluey-behind-the-scenes/)): steal observed, specific behavior (a real adult's sigh, a hand that hovers) rather than generic cartoon gestures; story and character first.
- **Duolingo's Duo** ([evolution](https://wordy.work/p/duolingo-social-media), [Rive system](https://dev.to/uianimation/how-duolingo-uses-rive-for-their-character-animation-and-how-you-can-build-a-similar-rive-mascot-5d19)): steal a small library of exaggerated face states swapped instantly, and big eyes as the main acting tool.
- **Kurzgesagt** ([Skillshare, Rubberhose class](https://www.skillshare.com/en/classes/motion-graphics-with-kurzgesagt-part-3/140140401)): steal secondary motion on everything that arrives (a little overshoot and settle) and the discipline of simple shapes carrying clear motion.
- **Comic timing generally** ([overview](https://grokipedia.com/page/Comic_timing)): steal the pregnant pause and the fast-slow juxtaposition.
