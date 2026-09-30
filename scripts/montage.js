// Tile PNGs into one image for quick review: node scripts/montage.js out.png a.png b.png ...
const { createCanvas, loadImage } = require('@napi-rs/canvas');
(async () => {
  const [out, ...files] = process.argv.slice(2);
  const cols = Math.min(5, files.length), tw = 360, th = 640, rows = Math.ceil(files.length / cols);
  const c = createCanvas(cols * tw, rows * th), x = c.getContext('2d');
  for (let i = 0; i < files.length; i++) x.drawImage(await loadImage(files[i]), (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
  require('fs').writeFileSync(out, c.toBuffer('image/png'));
})();
