// Video 3, "Month-end reports eating your Friday?": single source of truth for timing (120 BPM).
// `node bumper/spots/reports/timeline.js` prints the cue sheet as JSON for bumper/vo.py and bumper/audio.py.
const DURATION = 6.0;
const BPM = 120;

const SCENES = { s1: [0.0, 1.5], s2: [1.5, 3.8], s3: [3.8, 6.0] };

const PAGE_LAND = [0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84]; // report pages hit the desk

const T = {
  flip: -0.16,               // MONTH-END page is mid-flip on frame 0
  pageFall: 0.17,            // each page falls for this long before it lands
  push: [0.8, 1.5],          // camera pushes in: the stack fills the frame
  headlineOut: [1.5, 1.7],
  compress: [1.56, 2.02],    // the paper stack compresses into one digital report
  copy2: 1.82,               // "BRANDED REPORTS. SCHEDULED DELIVERY." lands with the VO
  cover: [2.0, 2.3],         // logo onto the report cover
  charts: [2.12, 2.7],       // brand-coloured abstract charts build
  connector: [2.5, 2.85],
  calIcon: 2.55,             // calendar icon (recurring)
  mailIcon: 2.74,            // scheduled-email icon -> confirmation
  wipe: [3.76, 4.22],
  logoIn: [4.02, 4.42],
  ctaIn: [4.18, 4.56],       // end card fully static from 4.56 s to 6.0 s
};

const VO = [
  { line: 0, at: 0.04, text: 'Client reports. There goes Friday.' },
  { line: 1, at: 1.82, text: 'Brand and schedule them with RecurPost.' },
  { line: 2, at: 4.28, text: 'Try it free.' },
];

const SFX = [
  [0.0, 'flip', 0.55],
  ...PAGE_LAND.slice(0, -1).map((t) => [t, 'paper', 0.14]),
  [PAGE_LAND[PAGE_LAND.length - 1], 'paper', 0.5],
  [1.54, 'whoosh', 0.55],
  [T.mailIcon + 0.04, 'confirm', 0.45],
  [3.72, 'whoosh', 0.55],
];

module.exports = { DURATION, BPM, SCENES, PAGE_LAND, T, VO, SFX };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T }));
}
