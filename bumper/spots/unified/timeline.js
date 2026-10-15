// 20 s skippable in-stream, "One calendar view": single source of truth for timing (120 BPM, 1 beat = 0.5 s).
// `node bumper/spots/unified/timeline.js` prints the cue sheet as JSON for bumper/vo.py and bumper/audio.py.
const DURATION = 20.0;
const BPM = 120;

// VO first: the scenes are fitted to the read. Hook lines are a touch brisker; the solution settles.
const VO = [
  { line: 0, at: 0.05, speed: 1.2, text: 'Managing social for multiple clients?' },
  { line: 1, at: 2.2, speed: 1.15, text: 'Still switching between calendars to find one post?' },
  { line: 2, at: 5.0, speed: 1.1, text: 'RecurPost brings selected client posts into one calendar view.' },
  { line: 3, at: 8.9, speed: 1.1, text: "See what's scheduled, published, in draft, or needs attention." },
  { line: 4, at: 13.05, speed: 1.1, text: 'Then adjust the plan from the calendar.' },
  { line: 5, at: 15.3, speed: 1.1, text: 'Bring your client schedules into view with RecurPost.' },
  { line: 6, at: 18.4, speed: 1.05, text: 'Start your trial today.' },
];

// Visual beats (fitted to the VO above; word positions in line 3 measured from its pauses)
const T = {
  heroIn: -0.12,             // the post card is already moving on frame 0, background going dark -> light
  winIn: 0.38,               // four client calendars split the screen (stagger 0.08 s)
  heroBehind: [0.92, 1.3],   // card slips behind Client 2, reappears on Client 4
  wipe: 1.72,                // calendars pan past camera (stagger 0.05 s, 0.6 s each)
  notif: 2.5,                // "Is Thursday's post ready?"
  clicks: [2.9, 3.14, 3.36], // cursor searches the windows
  freeze: 3.52,              // layers stop; "WHERE'S THE FULL SCHEDULE?"
  align: [4.72, 5.6],        // windows become the rows of one calendar (rising whoosh)
  logo: [5.5, 6.0],          // subtle logo reveal in the calendar bar
  heroLand: 6.3,             // the recurring post card takes its slot
  zoom: [8.7, 9.25],         // camera moves in and pans across the calendar
  badges: 8.95,              // status badges switch on across the calendar
  tags: [9.28, 10.08, 10.6, 11.35], // Scheduled, Published, Draft, Failed (on the spoken word)
  toHero: [12.3, 13.0],
  grab: 13.4, drop: 14.3,    // drag Thursday -> Friday, soft snap
  endMove: [15.4, 16.45],    // calendar scales down into the end-card panel
  endIn: 16.25,              // logo, line and CTA build; static from ~17.2 s
};

const SFX = [
  [0.02, 'click', 0.35],
  ...[0, 1, 2, 3].map((i) => [T.winIn + i * 0.08 + 0.05, 'click', 0.28]),
  [T.wipe - 0.02, 'whoosh', 0.5],
  [T.notif, 'notif', 0.5],
  ...T.clicks.map((t) => [t, 'click', 0.4]),
  [T.align[0] - 0.05, 'riser', 0.55],
  [T.heroLand, 'click', 0.35],
  ...T.tags.map((t) => [t, 'confirm', 0.2]),
  [T.grab, 'click', 0.35],
  [T.drop, 'snap', 0.5],
  [T.endMove[0], 'whoosh_soft', 0.4],
];

module.exports = { DURATION, BPM, VO, T, SFX };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T, music: 'long20' }));
}
