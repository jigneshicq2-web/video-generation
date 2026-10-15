// 30 s YouTube Shorts (9:16, 1080x1920), "The pitch is done. Now turn it into a month of content."
// Timing source of truth (120 BPM, scene changes on bar lines). `node bumper/spots/plan/timeline.js` prints JSON.
const DURATION = 30.0;
const BPM = 120;

// warm, lively read (1.05x); every line fits its scene window with room for the on-screen text
const VO = [
  { line: 0, at: 0.2, speed: 1.05, text: 'The client said yes.', tts: 'The client said yes!' },
  { line: 1, at: 1.75, speed: 1.05, text: 'Now comes the content calendar.' },
  { line: 2, at: 4.15, speed: 1.05, text: 'But turning a strategy into a month of posts takes a plan.' },
  { line: 3, at: 8.2, speed: 1.05, text: 'RecurPost offers editable planning templates to help shape the work.' },
  { line: 4, at: 14.15, speed: 1.05, text: 'Shape the calendar, organize campaign content, and prepare posts for scheduling.' },
  { line: 5, at: 20.15, speed: 1.05, text: 'Then move your content into RecurPost’s scheduling workflow.', tts: "Then move your content into RecurPost's scheduling workflow." },
  { line: 6, at: 25.3, speed: 1.05, text: 'Take the plan into RecurPost.' },
  { line: 7, at: 27.4, speed: 1.05, text: 'Start your trial today.' },
];

const T = {
  // 1 · the pitch is won (0-4)
  docIn: [-0.3, 0.75],       // proposal slides up into frame (already moving on frame 0)
  head1: [0.3, 3.75],        // THE PITCH IS APPROVED.
  stamp: 1.0,                // APPROVED stamp lands on the downbeat, then bounces
  unfold: [1.9, 2.95],       // the proposal unfolds (two flaps) into a blank content calendar
  stampToBadge: [1.95, 2.6], // the stamp shrinks into the calendar header as a check badge
  slots: [2.2, 2.9],         // empty post slots pop in row by row
  // 2 · the work after the win (4-8)
  head2: [4.05, 7.7],        // STRATEGY → CONTENT PLAN
  grow: [3.9, 7.0],          // the calendar slowly expands
  ideas: [4.4, 4.65, 4.9, 5.15, 5.4, 5.65, 5.9, 6.15], // idea notes pop in on the 8ths
  place: [[5.05, 5.45], [5.6, 6.0], [6.15, 6.55]],       // the cursor drags three notes into dates
  stack: [6.85, 7.4],        // notes sweep into one neat stack
  fold: [7.3, 7.95],         // the calendar folds into the compact campaign card; the stack rides it
  // 3 · editable templates (8-14)
  tplIn: [7.7, 8.3],         // "Social Media Content Calendar" revealed behind
  head3: [8.25, 13.45],      // START WITH AN EDITABLE TEMPLATE
  tpl2: 8.85, tpl3: 9.25,    // "Campaign Proposal", "Social Media Plan"
  toT2: [9.6, 10.1], pick2: 10.15,
  toT3: [10.65, 11.15], pick3: 11.2,
  toT1: [11.75, 12.35], dock: 12.4,
  smallOut: [13.05, 13.55],
  expand: [13.55, 14.3],     // the template opens into the monthly calendar
  // 4 · plan, organize, prepare (14-20)
  head4: [14.25, 15.35, 17.3], head4Out: 18.55, // each word lands with the VO
  legend: [14.45, 14.7, 14.95],
  postsIn: 14.6,             // post cards land in dates on the 8ths (hero first)
  zoom: [18.6, 19.85],       // camera moves forward into the campaign post card
  // 5 · scheduling workflow (20-25)
  queueIn: [19.85, 20.4],
  head5: [20.25, 24.65],     // READY FOR SCHEDULING
  grab: 20.45, drag: [20.5, 21.05],
  follow: [21.45, 21.95, 22.45],
  organized: 22.95,          // bright accent + confirmation tone
  // 6 · brand payoff (25-30)
  fan: [24.75, 25.6],        // queue cards fan out into the end card
  logo: [25.7, 26.2], 
  tag: 25.9,                 // FROM PLAN TO PUBLISHING WORKFLOW
  cta: [25.0, 25.7],         // the campaign post card becomes the CTA
};

const SFX = [
  [0.0, 'whoosh_soft', 0.35],
  [T.stamp - 0.01, 'stamp', 0.6],
  [T.unfold[0], 'flip', 0.4],
  [T.unfold[0] + 0.45, 'flip', 0.38],
  [T.slots[0], 'paper', 0.22],
  ...T.ideas.map((t, i) => [t, 'pop', i < 3 ? 0.34 : 0.22]),
  ...T.place.map(([, b]) => [b, 'click', 0.32]),
  [T.stack[0], 'whoosh', 0.4],
  [T.stack[1], 'snap', 0.35],
  [T.tplIn[0] + 0.05, 'whoosh_soft', 0.32],
  [T.tpl2, 'pop', 0.3], [T.tpl3, 'pop', 0.3],
  [T.pick2, 'click', 0.32], [T.pick3, 'click', 0.32],
  [T.toT1[0], 'whoosh_soft', 0.28],
  [T.dock, 'snap', 0.38],
  [T.expand[0], 'whoosh', 0.42],
  ...T.head4.map((t) => [t, 'pop', 0.26]),
  ...Array.from({ length: 12 }, (_, i) => [T.postsIn + 0.25 * i + 0.2, 'click', 0.2]),
  [T.zoom[0] + 0.1, 'whoosh', 0.42],
  [T.grab, 'click', 0.3],
  [T.drag[1], 'snap', 0.36],
  ...T.follow.map((t) => [t, 'click', 0.3]),
  [T.organized, 'confirm', 0.42],
  [T.fan[0], 'whoosh', 0.42],
];

// bright from frame 0; shakers build from the calendar; a rise into a lift as posts enter the queue;
// a short drum break into the branded sting as the end card lands (beat 50)
const MUSIC = { drop: 0, solve: 0, riser: null, demo: 4.0, boost: [19.0, 20.0], lift: 24.0, end: 25.0 };

module.exports = { DURATION, BPM, VO, T, SFX, MUSIC };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T, music: MUSIC }));
}
