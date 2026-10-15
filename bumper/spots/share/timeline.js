// 25 s skippable in-stream, "Your client shouldn't need your scheduler login to review the plan".
// Timing source of truth (120 BPM). `node bumper/spots/share/timeline.js` prints the cue sheet as JSON.
const DURATION = 25.0;
const BPM = 120;

// warm, energetic read (1.1x); the close starts in the payoff so the CTA keeps a real pause
const VO = [
  { line: 0, at: 0.15, speed: 1.1, text: 'Your client wants to review next week’s posts.', tts: "Your client wants to review next week's posts." },
  { line: 1, at: 4.05, speed: 1.1, text: 'They shouldn’t need your scheduler login to see the plan.', tts: "They shouldn't need your scheduler login to see the plan." },
  { line: 2, at: 8.1, speed: 1.1, text: 'With RecurPost, share a calendar for clients to review and comment on.' },
  { line: 3, at: 14.1, speed: 1.1, text: 'Your team stays in control of the content and publishing workflow.' },
  { line: 4, at: 19.15, speed: 1.1, text: 'Make review easier to share.' },
  { line: 5, at: 21.2, speed: 1.1, text: 'Share client calendars with RecurPost.' },
  { line: 6, at: 23.55, speed: 1.1, text: 'Start your trial today.' },
];

const T = {
  cardsIn: -0.25,            // calendar cards pop in on the 8th-note grid (already moving on frame 0)
  msg: 0.85,                 // "Can I review next week's posts?"
  login: [1.7, 3.3],         // generic login panel: cursor approaches, pauses, pulls back
  loginPause: 2.55,
  toPreview: [3.4, 4.2],     // the post card lifts and becomes a shareable preview panel
  share: [4.35, 4.95],       // a share chip travels from the agency side to the client preview
  lockClose: 4.8,
  lockAside: [6.1, 6.9],
  glide: [7.0, 8.2],         // camera glides into the client-facing shared calendar
  logo: [8.35, 8.8],
  label: 9.0,                // "Shared calendar"
  clientClick: 10.65, comment: 10.85,
  toAgency: [13.3, 14.1],    // the same calendar, now the agency workspace
  zoomIn: [14.0, 14.7],
  teamSees: 15.0,
  lift: [15.85, 16.2], edit: 16.3, back: [16.95, 17.35], reviewed: 17.6,
  pullBack: [18.9, 19.8], celebrate: 19.2,
  sweep: [21.7, 22.4],       // cards sweep outward; the post card becomes the CTA
  endIn: 22.0,               // end card static from ~23.0 s
};

const SFX = [
  [T.msg, 'pop', 0.45],
  [T.loginPause, 'click', 0.3],
  [T.toPreview[0], 'whoosh', 0.45],
  [T.share[0], 'whoosh_soft', 0.3],
  [T.lockClose, 'click', 0.35],
  [T.lockAside[0], 'whoosh_soft', 0.25],
  [T.glide[0], 'whoosh', 0.4],
  [T.clientClick, 'click', 0.4],
  [T.comment, 'pop', 0.35],
  [T.teamSees, 'click', 0.35],
  [T.edit, 'click', 0.35],
  [T.back[1], 'snap', 0.4],
  [T.celebrate - 0.05, 'confirm', 0.4],
  [T.sweep[0], 'whoosh', 0.42],
];

// bright from the first frame (no problem section), opens up on the shared calendar, sting on beat 44
const MUSIC = { drop: 0, solve: 0, riser: null, demo: 8.0, lift: 21.0, end: 22.0 };

module.exports = { DURATION, BPM, VO, T, SFX, MUSIC };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T, music: MUSIC }));
}
