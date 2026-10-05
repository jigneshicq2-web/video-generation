// Single source of truth for timing: scenes, voiceover placement and SFX cues.
//
// All scene/VO/SFX times below are written in *storyboard seconds* (the
// original 30 s cut). The delivered spot plays everything SCALE times slower,
// so it runs 40 s with identical copy and motion, just a calmer pace.
// Music runs at 135 BPM: one storyboard second = 3 beats, so every scene
// change still lands on a beat.
// `node src/timeline.js` prints the cue sheet (in real seconds) for the audio builder.

const BASE_DURATION = 30.0;
const DURATION = 40.0;
const SCALE = DURATION / BASE_DURATION;
const BPM = 135;
// "ONE WORKFLOW." hit: beat 79 at 135 BPM (35.111 s real) -> storyboard time
const SLAM = (79 * 60) / BPM / SCALE;

const SCENES = [
  { id: 1, name: 'Hook / Chaos', start: 0.0, end: 2.85 },
  { id: 2, name: 'Brand reveal', start: 2.85, end: 6.0 },
  { id: 3, name: 'AI content creation', start: 6.0, end: 8.0 },
  { id: 4, name: 'Planning + scheduling', start: 8.0, end: 11.0 },
  { id: 5, name: 'Evergreen recycling', start: 11.0, end: 14.0 },
  { id: 6, name: 'Approvals', start: 14.0, end: 17.0 },
  { id: 7, name: 'Publishing + recovery', start: 17.0, end: 20.0 },
  { id: 8, name: 'Unified inbox', start: 20.0, end: 23.0 },
  { id: 9, name: 'Analytics + reporting', start: 23.0, end: 26.0 },
  { id: 10, name: 'Hero ecosystem', start: 26.0, end: 28.0 },
  { id: 11, name: 'Brand close', start: 28.0, end: 30.0 },
];

// Voiceover line index -> start time (s). Lines are the exact script (see scripts/vo.py).
const VO = [
  { line: 0, at: 0.3 },   // Still managing social media like this?
  { line: 1, at: 2.9 },  // Meet RecurPost.
  { line: 2, at: 4.0 },  // Your social media workflow, in one place.
  { line: 3, at: 6.3 },   // Create smarter with AI.
  { line: 4, at: 8.25 },  // Schedule across accounts.
  { line: 5, at: 11.3 },  // And keep your best content working.
  { line: 6, at: 14.3 },  // Get approvals without the back-and-forth.
  { line: 7, at: 17.15 }, // And when something goes wrong, know exactly what to fix.
  { line: 8, at: 20.35 }, // Manage conversations from one inbox.
  { line: 9, at: 23.3 },  // Turn performance into client-ready reports.
  { line: 10, at: 26.18 }, // One workflow.
  { line: 11, at: 26.95 },// All in RecurPost.
];

// SFX cue sheet: [time, type, gain]
const SFX = [];
const add = (t, type, g = 1) => SFX.push([+t.toFixed(3), type, g]);

// S1 chaos: card pops, notifications, keys, whooshes, error, rising tension
const S1_CARDS = [0.0, 0.12, 0.26, 0.38, 0.52, 0.66, 0.8, 0.94, 1.08, 1.22, 1.36, 1.5, 1.66, 1.82, 1.98, 2.14, 2.3, 2.46];
S1_CARDS.forEach((t, i) => add(t, i % 3 === 0 ? 'notif' : i % 3 === 1 ? 'pop' : 'click', 0.55));
[0.2, 0.28, 0.35, 0.47, 0.55, 0.9, 0.97, 1.05, 1.6, 1.68, 1.73, 2.0, 2.08].forEach((t) => add(t, 'key', 0.35));
[0.1, 0.62, 1.15, 1.7, 2.2].forEach((t) => add(t, 'whoosh_short', 0.55));
add(0.15, 'slam', 0.9);        // TOO MANY TABS.
add(1.9, 'error', 0.45);
add(0.0, 'tension', 0.9);
add(2.7, 'freeze', 1.0);       // everything freezes
// S2 reveal
add(2.85, 'implode', 0.9);
add(3.0, 'impact_big', 1.0);
add(3.02, 'logo_sting', 0.8);
[3.45, 3.62, 3.79, 3.96, 4.13, 4.3, 4.47].forEach((t) => add(t, 'blip', 0.4));
add(5.55, 'whoosh_long', 0.8);
// S3 create
add(6.05, 'type_burst', 0.45);
add(6.55, 'click', 0.6);
add(6.6, 'ai_gen', 0.7);
[7.0, 7.08, 7.16, 7.24].forEach((t) => add(t, 'pop', 0.45));
add(7.62, 'whoosh_short', 0.7);
// S4 plan/schedule
add(8.05, 'thud', 0.7);
[8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5].forEach((t) => add(t, 'snap', 0.35));
add(9.2, 'whoosh_wide', 0.6);  // SCHEDULE EVERYWHERE expands
add(9.85, 'whoosh_long', 0.55);
[10.1, 10.18, 10.26, 10.34, 10.42, 10.5].forEach((t) => add(t, 'blip', 0.3));
add(10.75, 'implode', 0.55);
// S5 recycle
add(11.1, 'slam', 0.85);        // CREATE ONCE.
add(11.9, 'slam', 0.75);        // KEEP IT WORKING.
[11.5, 12.25, 13.0].forEach((t) => add(t, 'circle_whoosh', 0.55));
[11.75, 12.5, 13.25].forEach((t) => add(t, 'soft_impact', 0.45));
add(13.7, 'morph', 0.6);
// S6 approvals
add(14.25, 'click', 0.5);
[14.35, 14.6, 14.85].forEach((t) => add(t, 'tick', 0.45));
add(14.9, 'notif', 0.6);        // client comment
add(15.3, 'chime', 0.85);       // APPROVED
add(15.32, 'impact', 0.8);
add(15.55, 'slam', 0.6);
add(16.1, 'tick', 0.4);
add(16.65, 'morph', 0.6);
// S7 publish / fail / recover
add(17.1, 'click', 0.8);
add(17.15, 'publish_whoosh', 0.55);
add(17.75, 'success', 0.35);
add(17.85, 'error', 0.75);
add(17.9, 'tension_short', 0.5);
add(18.35, 'pop', 0.5);         // WHY?
add(18.75, 'click', 0.7);       // Fix
add(19.1, 'click', 0.7);        // Retry
add(19.12, 'retry', 0.6);
add(19.45, 'success', 0.85);
add(19.7, 'whoosh_short', 0.6);
// S8 inbox
[20.1, 20.25, 20.4, 20.55, 20.7].forEach((t) => add(t, 'notif', 0.5));
add(21.05, 'whoosh_long', 0.5);
add(21.6, 'magnet_snap', 1.0);
[22.0, 22.09, 22.18, 22.27].forEach((t) => add(t, 'pop', 0.35));
add(22.65, 'whoosh_short', 0.6);
// S9 analytics
add(23.0, 'data_burst', 0.8);
for (let i = 0; i < 10; i++) add(23.15 + i * 0.07, 'data_blip', 0.3);
[23.7, 23.95, 24.2, 24.45].forEach((t) => add(t, 'chart_build', 0.45));
add(24.8, 'report_impact', 0.85);
[25.2, 25.35].forEach((t) => add(t, 'pop', 0.4));
add(25.6, 'whoosh_rev', 0.6);
// S10 hero
add(26.0, 'riser_short', 0.6);
add(SLAM, 'impact_big', 1.0);   // ONE WORKFLOW. on the beat
[26.1, 26.2, 26.3, 26.45, 26.6, 26.7, 26.8, 26.9].forEach((t) => add(t, 'blip', 0.25));
add(27.1, 'shimmer', 0.6);
add(27.9, 'whoosh_rev', 0.5);
// S11 close
add(28.0, 'logo_sting', 0.9);
add(28.45, 'tick', 0.35);
add(28.75, 'tick', 0.35);

function cueSheet() {
  const r = (x) => +(x * SCALE).toFixed(3);
  return {
    duration: DURATION,
    bpm: BPM,
    scale: SCALE,
    slam: r(SLAM),
    scenes: SCENES.map((x) => ({ ...x, start: r(x.start), end: r(x.end) })),
    vo: VO.map((v) => ({ ...v, at: r(v.at) })),
    sfx: SFX.map(([t, k, g]) => [r(t), k, g]).sort((a, b) => a[0] - b[0]),
  };
}

module.exports = { BASE_DURATION, DURATION, SCALE, BPM, SLAM, SCENES, VO, SFX, cueSheet };

if (require.main === module) process.stdout.write(JSON.stringify(cueSheet(), null, 2));
