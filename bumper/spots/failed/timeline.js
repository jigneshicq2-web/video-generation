// 25 s skippable in-stream, "A post fails. The client notices first.": timing source of truth (120 BPM).
// `node bumper/spots/failed/timeline.js` prints the cue sheet as JSON for bumper/vo.py and bumper/audio.py.
const DURATION = 25.0;
const BPM = 120;

// Matter-of-fact open, calm informative middle, slight lift on the close.
const VO = [
  { line: 0, at: 0.3, speed: 1.0, text: 'A client post fails.' },
  { line: 1, at: 3.75, speed: 1.0, text: 'And the client notices first.' },
  { line: 2, at: 7.15, speed: 1.0, text: 'In RecurPost, your team can review failed posts and see the reason in History.' },
  { line: 3, at: 12.45, speed: 1.0, text: 'Review it, then edit and retry—or retry now.', tts: 'Review it, then edit and retry, or retry now.' },
  { line: 4, at: 17.75, speed: 1.0, text: 'Keep publishing issues easier to spot and address.' },
  { line: 5, at: 21.05, speed: 1.1, text: 'Handle client publishing with RecurPost.' },
  { line: 6, at: 23.6, speed: 1.1, text: 'Start your trial today.' },
];

const T = {
  heroIn: -0.15,            // the scheduled post is already moving toward its slot on frame 0
  arrive: 1.0,              // reaches the publishing slot and pauses
  fail: 1.3,                // receives the "Failed" status (soft alert)
  toTimeline: [2.75, 3.5],  // slides into the client's post timeline
  notif: 3.75,              // "Wasn't this supposed to go live?"
  msgAside: [6.3, 6.9],     // message slides aside; camera moves toward the post's status
  history: [6.9, 7.6],      // the timeline becomes the History view (subtle logo reveal)
  logo: [7.3, 7.8],
  focus: [8.4, 9.0],        // failed post highlighted, others step back
  reason: 9.7,              // "Reason shown in History"
  reviewer: 8.6,            // a team member reviews the card
  detail: [11.7, 12.4],     // the card expands into a post detail panel
  buttons: 12.5,
  hoverEdit: 13.35, clickRetry: 14.75, // hover "Edit and Retry", select "Retry Now" on the spoken words
  selected: 14.95,          // neutral "Retry action selected" + restrained confirmation
  collapse: [15.7, 16.6],   // detail folds back into the card in the History timeline
  pullBack: [16.7, 18.2],   // organized multi-client view
  statusView: 18.0,         // client message replaced by a simple status view
  gather: [20.35, 21.15],   // timeline cards gather into a brand panel
  endIn: 21.1,              // panel becomes the CTA; logo and line build; static from ~22.2 s
};

const SFX = [
  [T.fail, 'alert_soft', 0.45],
  [T.toTimeline[0], 'whoosh_soft', 0.3],
  [T.notif, 'notif', 0.45],
  [T.msgAside[0], 'whoosh_soft', 0.35],
  [T.detail[0], 'whoosh_soft', 0.35],
  [T.clickRetry, 'click', 0.45],
  [T.selected, 'confirm', 0.3],
  [T.collapse[0], 'whoosh_soft', 0.3],
  [T.gather[0], 'whoosh', 0.45],
];

const MUSIC = { drop: 6.3, solve: 7.0, riser: 6.3, demo: 12.0, lift: 20.4, end: 21.0 };

module.exports = { DURATION, BPM, VO, T, SFX, MUSIC };

if (require.main === module) {
  console.log(JSON.stringify({ duration: DURATION, bpm: BPM, vo: VO, sfx: SFX, t: T, music: MUSIC }));
}
