// 30 s YouTube Shorts (9:16, 1080x1920), "The pitch is won. Now turn it into a month of content."
// Timing source of truth (120 BPM). `node bumper/spots/won/timeline.js` prints the cue sheet as JSON.
const DURATION = 30.0;
const BPM = 120;

// warm, natural read (1.0x); every line ends inside its scene window
const VO = [
  { line: 0, at: 0.2, speed: 1.0, text: 'You won the client.', tts: 'You won the client!' },
  { line: 1, at: 1.6, speed: 1.0, text: 'Now comes the content plan.' },
  { line: 2, at: 3.7, speed: 1.0, text: 'Now turn the strategy into a month of posts.' },
  { line: 3, at: 7.3, speed: 1.0, text: 'RecurPost has editable templates to help shape the plan.' },
  { line: 4, at: 12.85, speed: 1.0, text: 'Organize campaign ideas and build the calendar.' },
  { line: 5, at: 18.75, speed: 1.0, text: 'Then bring the planned content into RecurPost’s scheduling workflow.', tts: "Then bring the planned content into RecurPost's scheduling workflow." },
  { line: 6, at: 25.0, speed: 1.0, text: 'Take your plan into RecurPost.' },
  { line: 7, at: 27.3, speed: 1.0, text: 'Start your trial today.' },
];

const T = {
  // 1 · client won (0-3.5)
  docIn: [-0.3, 0.6],        // the proposal flies up into frame (already moving on frame 0)
  head1: [0.25, 3.3],        // CLIENT WON.
  stamp: 1.0,                // APPROVED stamp on the beat (with a musical accent), then a small bounce
  unfold: [1.6, 2.6],        // the paper unfolds (two flaps) into a blank calendar, same screen position
  stampToBadge: [1.65, 2.3], // the stamp shrinks into the calendar header as a check badge
  slots: [1.9, 2.5],         // empty slots (two-week view) pop in
  // 2 · the real work (3.5-7)
  month: [3.5, 4.1],         // the calendar opens into the month view
  head2: [3.6, 6.65],        // STRATEGY → CONTENT PLAN
  grow: [3.5, 6.0],
  ideas: [3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5], // idea cards arrive quickly on the 8ths
  place: [[4.45, 4.8], [4.95, 5.3], [5.5, 5.85]],       // the cursor tries to organize them
  stack: [6.0, 6.5],         // the cards stack neatly
  fold: [6.45, 7.05],        // ...and the calendar folds into the campaign card
  // 3 · planning templates (7-12.5)
  head3: [7.2, 12.0],        // START WITH AN EDITABLE TEMPLATE
  tpl: [7.25, 7.75, 8.25],   // Campaign Proposal, Social Media Plan, Content Calendar slide in on the beat
  pick: [7.6, 9.1, 10.4],    // the campaign card picks up structure at each stage
  toB: [8.65, 9.05], toC: [9.95, 10.35],
  tplOut: [11.55, 12.05],    // the first two stages clear
  expand: [12.05, 12.75],    // "Content Calendar" opens into the month
  heroToCell: [12.2, 12.85], // the campaign card lands in its date slot
  // 4 · build the calendar (12.5-18.5)
  head4: [12.8, 13.8, 14.8], head4Out: 17.05,
  legend: [13.0, 13.25, 13.5],
  postsIn: 13.1,             // the other post cards land on the 8ths
  pan: [12.8, 17.1],         // slow camera move across the calendar
  zoom: [17.15, 18.4],       // push into the campaign card until it fills the frame
  // 5 · scheduling (18.5-24.5)
  queueIn: [18.4, 18.95],
  head5: [18.75, 24.2],      // FROM PLAN TO SCHEDULING
  grab: 19.0, drag: [19.05, 19.6],
  follow: [20.0, 20.5, 21.0],
  organized: 21.5,           // bright accent + confirmation tone
  // 6 · brand payoff (24.5-30)
  sweep: [24.3, 25.2],       // the post cards sweep together in an arc
  cta: [24.75, 25.45],       // the campaign card becomes the CTA
  logo: [25.3, 25.85],
  tag: 25.55,                // CARRY THE PLAN INTO YOUR WORKFLOW
};

const SFX = [
  [0.0, 'whoosh_soft', 0.35],
  [T.stamp - 0.01, 'stamp', 0.6],
  [T.unfold[0], 'whoosh_soft', 0.3],
  [T.unfold[0] + 0.05, 'flip', 0.3],
  [T.unfold[0] + 0.5, 'flip', 0.28],
  [T.month[0], 'whoosh', 0.36],
  ...T.ideas.map((t, i) => [t, 'pop', i < 3 ? 0.32 : 0.22]),
  ...T.place.map(([, b]) => [b, 'click', 0.3]),
  [T.stack[0], 'whoosh_soft', 0.3],
  [T.stack[1], 'snap', 0.32],
  ...T.tpl.map((t) => [t - 0.22, 'whoosh_soft', 0.26]),
  ...T.tpl.map((t) => [t + 0.12, 'snap', 0.26]),
  ...T.pick.slice(1).map((t) => [t, 'click', 0.3]),
  [T.toB[0], 'whoosh_soft', 0.2], [T.toC[0], 'whoosh_soft', 0.2],
  [T.expand[0], 'whoosh', 0.4],
  [T.heroToCell[1], 'click', 0.3],
  ...T.head4.map((t) => [t, 'pop', 0.24]),
  ...Array.from({ length: 12 }, (_, i) => [T.postsIn + 0.25 * i + 0.2, 'click', 0.2]),
  [T.zoom[0] + 0.1, 'whoosh', 0.42],
  [T.grab, 'click', 0.3],
  [T.drag[1], 'snap', 0.36],
  ...T.follow.map((t) => [t, 'click', 0.3]),
  [T.organized, 'confirm', 0.42],
  [T.sweep[0], 'whoosh', 0.42],
];

// bright from frame 0 with an accent on the stamp; shakers build from the month view; a rise into a
// brighter lift as posts enter the queue; a one-bar drum break into the branded sting on the sweep
const MUSIC = { drop: 0, solve: 0, riser: null, demo: 3.5, accent: [1.0], boost: [17.5, 18.5], lift: 23.5, end: 24.5 };

module.exports = { DURATION, BPM, VO, T, SFX, MUSIC };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T, music: MUSIC }));
}
