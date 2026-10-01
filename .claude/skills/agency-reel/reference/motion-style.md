# Motion style: the "living cartoon" (standing rule since 2026-09-24)

Dinesh, on the RecurPost agency explainer v2 (`~/videos/recurpost-agency-hub-explainer`, render `renders/draft-v2-kokoro.mp4`): "I love this style." He described v1 of the same video, with the same characters and story but stiff motion, as "good but simple. Animations can be a lot better." The reference he pointed at was a hand-animated mascot film (x.com/rehan_shei/status/2102773057068949748). Every reel is built in this style from now on.

Working code: `motion_kit.py` next to this file (rig, camera, particles, trails, boil, light), extracted from the explainer's `build.py`. That `build.py` is the full working example; copy from it.

## The five things that make it

1. **The character acts every second.** Kate (and Rex) are jointed rigs, not static SVGs: shoulders, elbows, hips, knees and the neck rotate about joint origins (`OR` in the kit). Every beat has an acting choice:
   - She walks in on a real walk cycle (legs, arm swing, body bob, a settle squash at the stop).
   - She anticipates before an action: wind up, then throw.
   - She reacts with the face set: `eyesN` normal, `eyesH` happy ^ ^, `eyesS` star eyes, `eyesW` wide, plus `lid` tired, `brows` worried, `sweat` drop, and the mouths `mSmile`, `mOpen`, `mFlat`, `mO`.
   - Her pupils track whatever just moved (`K.look`).
   - Wins get `K.hop` with squash and stretch.
   - Blink every 2 to 4 s, and breathe when idle.
   - Never let the character stand still through a line unless it is the planned held beat.
2. **The camera travels; cuts are hidden.** Every scene lives inside a `.cam` layer and moves with `cam()`: slow push-ins, punch-in on the thing the voice names, then pull back. Make scene N's last frame equal scene N+1's first frame so a hard cut reads as one move. Devices that worked:
   - Pull back from a scene until it becomes one tile among many (the desk becoming 1 of 15 client cards).
   - Dive back into it.
   - Zoom *through* a prop's centre into a solid colour, and that colour becomes the next element (clock hub → yellow → the logo's "O").
   - Match cut an app window into a laptop screen.
3. **Motion has physics.**
   - Things fly on arcs (`fly`) with a dotted trail, rotating along the path.
   - Landings overshoot (`back.out`, `elastic.out`, `bounce.out`).
   - Every arrival pops a seeded `burst` of stars, sparks or confetti.
   - Numbers count up and bars grow from zero.
   - Stamps slam with a camera `shake`.
   - Objects orbit the character with depth: they pass behind the head on the far side, and all positions are pure functions of `t` in a `tick`.
4. **Light and texture.**
   - Warm paper ground with fibers and grain, plus a vignette on every frame.
   - A sunbeam with drifting dust motes over the set.
   - The mood is graded with the sky: day, dusk, night (multiply overlay), then sunrise at the payoff.
   - A warm glow sits behind the focal element, and rays burst behind the logo.
   - A hand-drawn `boil` (re-pose every 3 frames) runs on the cartoon props and the character wrapper.
5. **Less on screen, more acting.** One focal action at a time. Text only for the lines that land (big Bricolage words that rise in with a yellow swoosh under the key word). Sound on every motion: swish on flights, pop on landings, chime on wins, buzz on phones, ding on clocks.

## Rules learned while building it

- **Seek-safety:** anything per-frame (orbits, flights, typing, count-ups, boil) goes through `tick(fn(t))`, never `Math.random` or wall-clock time. Seeded randomness comes from `H(n, seed)` and `U(n, seed)`.
- **One element, one driver.** An element moved by `fly` or an orbit `tick` gets x/y every frame, so a separate tween on its x/y/opacity is silently overwritten. Drive its opacity with `fly(...,{vis:[t0,t1]})` and put extra motion on an inner child.
- **`typeSeq`, never two `typeText` calls on one element:** the later tick blanks the text before its start.
- **Avoid `fromTo(..., {immediateRender:false})` for an element whose first visible frame matters.** The reveal disc stayed invisible until it became `gsap.set` at build time plus `tl.set(opacity)` plus `tl.to`.
- **Stacking:** a `.cam` with a transform is its own stacking context. A background layer placed before it needs `style="z-index:0"`, or its children (z-index 2) paint over the whole camera. Cards that move across Kanban columns need the destination column's z-index raised at move time.
- **Boil scales with its parent.** Exclude anything that gets zoomed hugely (the clock during the zoom-through), or the jitter becomes 100 px.
- **Layout check:** text glyphs hidden behind other layers can fail `content_overlap`. Draw decorative glyphs (a tab's ×) with CSS instead of text.
- **Build time:** about 1,200 lines of generator for 12 scenes and 89 s. A 20 s reel is 3 to 4 scenes, so reuse the kit and budget an afternoon, not an hour.

## Adapting to the 9:16 short reel

- **Canvas:** 1080x1920. Pass `T.VW=1080, T.VH=1920` in every frame's `T`, and set `data-width` / `data-height` to match in `wrap()`.
- **Sets:** re-lay any set built from `desk_set` into portrait (its coordinates are 1920x1080 world px). Kate and Rex stay the same rig scaled up; one character acting large beats two small ones.
- **Rex:** give him the same rig. Copy `kate()` and swap the head group for his slick hair, sunglasses and gold chain from `ep1/build.py rex_svg`.
- **Series rules still apply:** the short-format rules in SKILL.md (20 s cap, escalating pauses, the held beat before the punch, end card as a second beat) take priority. The living-cartoon style is how it moves, not a licence to add scenes.
