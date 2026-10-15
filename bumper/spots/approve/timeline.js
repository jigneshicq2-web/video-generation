// 15 s non-skippable in-stream, "Which version did the client approve?": timing source of truth (120 BPM).
// The exact script is ~13 s of speech, so the read is a brisk 1.2x and the beats follow the voice.
// `node bumper/spots/approve/timeline.js` prints the cue sheet as JSON for bumper/vo.py and bumper/audio.py.
const DURATION = 15.0;
const BPM = 120;

const VO = [
  { line: 0, at: 0.08, speed: 1.1, text: 'Which version did the client approve?' },
  { line: 1, at: 2.9, speed: 1.2, text: 'When feedback is scattered, publishing gets harder to manage.' },
  { line: 2, at: 5.95, speed: 1.2, text: 'RecurPost gives your team and client a shared post approval workflow.' },
  { line: 3, at: 9.65, speed: 1.2, text: 'Review together before posts go live.' },
  { line: 4, at: 11.7, speed: 1.2, text: 'Bring client approvals into RecurPost.' },
  { line: 5, at: 13.8, speed: 1.2, text: 'Start your trial today.' },
];

const T = {
  v: [-0.1, 0.5, 1.0],        // Version 1, Version 2, Updated version slide into the thread
  chatter: [1.15, 1.32],      // two short bubbles overlap briefly
  question: 1.62,             // "Which version is approved?" -> pause
  clear: [2.4, 2.95],         // bubbles slide away, the post card is left centred
  panels: 2.75,               // calendar / email / chat surfaces
  hops: [3.15, 3.95, 4.75],   // the card visits each surface (searching for the latest decision)
  align: [5.3, 5.95],         // surfaces align into one workspace (match cut on the card)
  logo: [6.0, 6.4],
  steps: [6.1, 6.95, 8.35],   // Draft -> In review -> Approved
  comment: 7.5,               // client comment beside the post
  toCal: [8.95, 9.6],         // approved card glides into the calendar
  end: [11.5, 12.15],         // the approved card becomes the CTA; end card static from ~12.5 s
};

const SFX = [
  ...T.v.map((t) => [Math.max(0.02, t + 0.12), 'click', 0.3]),
  [T.v[1] + 0.14, 'notif', 0.22], [T.chatter[0], 'notif', 0.2], [T.chatter[1], 'notif', 0.22],
  [T.clear[0], 'whoosh_soft', 0.3],
  ...T.hops.map((t) => [t, 'whoosh_soft', 0.18]),
  [T.align[0], 'whoosh', 0.42],
  [T.steps[2], 'confirm', 0.4],
  [T.end[0] - 0.05, 'whoosh_soft', 0.38],
];

// tension that pauses on the question, then a warmer groove from the workflow on (sting on beat 23)
const MUSIC = { pause: [1.62, 2.5], drop: 5.6, riser: 5.35, solve: 6.0, demo: 9.6, lift: 11.0, end: 11.5 };

module.exports = { DURATION, BPM, VO, T, SFX, MUSIC };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T, music: MUSIC }));
}
