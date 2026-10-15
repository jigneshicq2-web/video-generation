// RecurPost 6 s YouTube bumpers, 1920x1080 @ 30 fps. Every frame is a pure function of time.
//   node bumper/render.js <spot> video [out.mp4]     silent video -> out/bumper_<spot>_silent.mp4
//   node bumper/render.js <spot> stills 0.5,2.9       PNG stills  -> out/bumper_<spot>_stills/
//   node bumper/render.js <spot> sheet [step]         QA contact sheet
// Spots: batch (Video 1), where (Video 2). END_LAYOUT=side puts logo and CTA side by side.
const fs = require('fs');
const path = require('path');

const [spot, mode, arg] = process.argv.slice(2);
if (!spot) { console.error('usage: node bumper/render.js <spot> [video|stills|sheet] [arg]'); process.exit(1); }
// a spot may set its own canvas size (e.g. 9:16 Shorts) in format.json; must be known before lib loads
const fmt = path.join(__dirname, 'spots', spot, 'format.json');
if (fs.existsSync(fmt)) { const f = JSON.parse(fs.readFileSync(fmt, 'utf8')); process.env.BUMPER_SIZE = `${f.width}x${f.height}`; }
const { run } = require('./lib');
run(spot, mode, arg).catch((e) => { console.error(e); process.exit(1); });
