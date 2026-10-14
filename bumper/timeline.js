// RecurPost 6 s YouTube bumper (16:9): single source of truth for timing.
// Music is 120 BPM, so one beat = 0.5 s and the scheduling clicks sit on the 8th-note grid.
// `node bumper/timeline.js` prints the cue sheet as JSON for bumper/audio.py.
const DURATION = 6.0;
const BPM = 120;

const SCENES = { s1: [0.0, 1.5], s2: [1.5, 3.8], s3: [3.8, 6.0] };

// Scene 1: five post cards, one click per card on the 8th-note grid.
const CARD_CLICKS = [0.25, 0.5, 0.75, 1.0, 1.25];
const CARD_ENTER = CARD_CLICKS.map((t) => t - 0.4); // card 0 is already moving on frame 0

const T = {
  headlineOut: [1.62, 1.86],
  sweep: [1.7, 2.22],        // cards fly into the calendar's first client row
  window: [1.66, 2.06],      // calendar interface builds in
  copy2: 2.32,               // "BATCH SCHEDULE WITH RECURPOST" lands with the VO
  bulkClick: 2.55,           // the single bulk action
  fillStart: 2.62,           // calendar populates across every client row
  confirm: 3.3,              // fill complete -> confirmation
  wipe: [3.76, 4.22],        // yellow wipe to the end card
  logoIn: [4.02, 4.42],
  ctaIn: [4.18, 4.56],       // end card is fully static from 4.56 s to 6.0 s
};

// VO: exact script, three lines, one per visual beat.
const VO = [
  { line: 0, at: 0.05, text: 'Still scheduling client posts one at a time?' },
  { line: 1, at: 2.32, text: 'Batch schedule with RecurPost.' },
  { line: 2, at: 4.28, text: 'Try it free.' },
];

const SFX = [
  ...CARD_CLICKS.map((t) => [t, 'click', 0.55]),
  [1.66, 'whoosh', 0.45],
  [T.bulkClick, 'click', 0.7],
  [T.confirm, 'confirm', 0.5],
  [3.72, 'whoosh', 0.55],
];

module.exports = { DURATION, BPM, SCENES, CARD_CLICKS, CARD_ENTER, T, VO, SFX };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T }));
}
