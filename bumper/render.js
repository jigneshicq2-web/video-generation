// RecurPost 6 s YouTube bumpers, 1920x1080 @ 30 fps. Every frame is a pure function of time.
//   node bumper/render.js <spot> video [out.mp4]     silent video -> out/bumper_<spot>_silent.mp4
//   node bumper/render.js <spot> stills 0.5,2.9       PNG stills  -> out/bumper_<spot>_stills/
//   node bumper/render.js <spot> sheet [step]         QA contact sheet
// Spots: batch (Video 1), where (Video 2). END_LAYOUT=side puts logo and CTA side by side.
const { run } = require('./lib');

const [spot, mode, arg] = process.argv.slice(2);
if (!spot) { console.error('usage: node bumper/render.js <spot> [video|stills|sheet] [arg]'); process.exit(1); }
run(spot, mode, arg).catch((e) => { console.error(e); process.exit(1); });
