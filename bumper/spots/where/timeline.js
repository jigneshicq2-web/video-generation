// Video 2, "Where's the post?": single source of truth for timing (120 BPM, 1 beat = 0.5 s).
// `node bumper/spots/where/timeline.js` prints the cue sheet as JSON for bumper/vo.py and bumper/audio.py.
const DURATION = 6.0;
const BPM = 120;

const SCENES = { s1: [0.0, 1.5], s2: [1.5, 3.8], s3: [3.8, 6.0] };

const T = {
  cardsIn: -0.22,            // scattered cards are already moving on frame 0 (staggered 0.09 s)
  notif: 0.28,               // client message pops in
  headlineOut: [1.5, 1.72],
  notifOut: [1.48, 1.7],
  morph: [1.55, 2.0],        // the small calendar widget opens into the full calendar
  sweep: [1.58, 2.08],       // cards fly into their calendar slots (stagger 0.05 s)
  copy2: 1.72,               // "KEEP EVERY CLIENT POST IN VIEW" lands with the VO
  chips: 1.95,               // Scheduled / Published / Drafts / Failed legend
  fill: 1.95,                // the rest of the calendar populates
  settle: 2.42,              // calendar view settles -> confirmation
  highlight: [2.62, 2.92],   // one post card is located and highlighted
  wipe: [3.76, 4.22],
  logoIn: [4.02, 4.42],
  ctaIn: [4.18, 4.56],       // end card fully static from 4.56 s to 6.0 s
};

const VO = [
  { line: 0, at: 0.04, text: "Client asking, 'Where's the post?'", tts: 'Client asking, "Where\'s the post?"' },
  { line: 1, at: 1.7, text: 'Keep every post in view with RecurPost.' },
  { line: 2, at: 4.28, text: 'Try it free.' },
];

const SFX = [
  [T.notif, 'notif', 0.55],
  [1.52, 'whoosh', 0.5],
  [1.82, 'whoosh_soft', 0.4],
  [T.settle, 'confirm', 0.45],
  [3.72, 'whoosh', 0.55],
];

module.exports = { DURATION, BPM, SCENES, T, VO, SFX };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T }));
}
