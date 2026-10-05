// Frame renderer. Usage:
//   node src/render.js video [out.mp4]         full 40 s, 1080x1920 @ 30 fps (silent)
//   node src/render.js stills 0.5,2.8,...      PNG stills to out/stills/ (real seconds)
//   node src/render.js sheet                   contact sheet (1 frame / 0.5 s) for QA
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { createCanvas } = require('@napi-rs/canvas');
const L = require('./lib');
const TL = require('./timeline');
const C = require('./scenes/common');
const S12 = require('./scenes/s01_s02');
const S35 = require('./scenes/s03_s05');
const S68 = require('./scenes/s06_s08');
const S911 = require('./scenes/s09_s11');

const { W, H, FPS } = L;
const FRAMES = Math.round(TL.DURATION * FPS);
const DRAW = {
  1: S12.scene1, 2: S12.scene2, 3: S35.scene3, 4: S35.scene4, 5: S35.scene5,
  6: S68.scene6, 7: S68.scene7, 8: S68.scene8, 9: S911.scene9, 10: S911.scene10, 11: S911.scene11,
};

function sceneAt(t) {
  for (const s of TL.SCENES) if (t >= s.start && t < s.end) return s;
  return TL.SCENES[TL.SCENES.length - 1];
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function renderFrame(frame) {
  // scenes are authored in storyboard seconds; the spot plays SCALE x slower
  const t = frame / FPS / TL.SCALE;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  DRAW[sceneAt(t).id](ctx, t);
  ctx.restore();
  ctx.save();
  L.finish(ctx, frame);
  ctx.restore();
}

function ffmpegBin() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim(); } catch (e) { return 'ffmpeg'; }
}

async function main() {
  await C.preloadLogo();
  const [mode = 'video', arg] = process.argv.slice(2);
  const outDir = path.join(__dirname, '..', 'out');
  fs.mkdirSync(outDir, { recursive: true });

  if (mode === 'stills') {
    const dir = path.join(outDir, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const s of (arg || '1').split(',')) {
      const f = Math.min(FRAMES - 1, Math.round(parseFloat(s) * FPS));
      renderFrame(f);
      fs.writeFileSync(path.join(dir, `t${(f / FPS).toFixed(2)}.png`), canvas.toBuffer('image/png'));
    }
    return;
  }

  if (mode === 'sheet') {
    const step = parseFloat(arg || '0.5');
    const times = [];
    for (let t = 0.1; t < TL.DURATION; t += step) times.push(t);
    const cols = 10, tw = 216, th = 384, rows = Math.ceil(times.length / cols);
    const sheet = createCanvas(cols * tw, rows * (th + 30));
    const sc = sheet.getContext('2d');
    sc.fillStyle = '#000'; sc.fillRect(0, 0, sheet.width, sheet.height);
    times.forEach((t, i) => {
      renderFrame(Math.round(t * FPS));
      const x = (i % cols) * tw, y = Math.floor(i / cols) * (th + 30);
      sc.drawImage(canvas, x, y, tw, th);
      sc.fillStyle = '#fff'; sc.font = '20px I600'; sc.fillText(`${t.toFixed(1)}s`, x + 8, y + th + 22);
    });
    fs.writeFileSync(path.join(outDir, 'contact_sheet.png'), sheet.toBuffer('image/png'));
    return;
  }

  const out = arg || path.join(outDir, 'video_silent.mp4');
  const ff = spawn(ffmpegBin(), [
    '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < FRAMES; f++) {
    renderFrame(f);
    const buf = canvas.data(); // raw RGBA
    if (!ff.stdin.write(Buffer.from(buf))) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stderr.write(`frame ${f}/${FRAMES}  ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  process.stderr.write(`done: ${out}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
