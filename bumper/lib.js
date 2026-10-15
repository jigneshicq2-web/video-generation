// Shared toolkit for the RecurPost 6 s YouTube bumpers (1920x1080 @ 30 fps):
// palette, type, easing, shapes, icons, background, post-card parts, the branded wipe,
// the end card and the frame driver. Each spot lives in bumper/spots/<name>/.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const W = 1920, H = 1080, FPS = 30;
const ROOT = path.join(__dirname, '..');
const END_LAYOUT = process.env.END_LAYOUT || 'stacked';

const FONT_DIR = path.join(ROOT, 'node_modules', '@fontsource', 'plus-jakarta-sans', 'files');
for (const w of [700, 800]) {
  GlobalFonts.registerFromPath(`${FONT_DIR}/plus-jakarta-sans-latin-${w}-normal.woff2`, `J${w}`);
}
const font = (w, px) => `${px}px J${w}`;

// Palette sampled from the supplied logo: yellow #FFCD42, charcoal #1F1F1F, plus neutrals.
const C = {
  bg: '#F6F5F1', surface: '#FFFFFF', ink: '#1F1F1F', yellow: '#FFCD42',
  yTint: '#FFF1C6', yTint2: '#FFE38F', line: '#E8E6DF', gray: '#E3E0D8', gray2: '#CFCBC0', muted: '#A9A59A',
};
const CLIENT = [C.yellow, C.ink, C.gray2, '#F5B82E'];

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  inOutQuart: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  outBack: (x, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
};
const ep = (t, a, b, ease = E.outCubic) => {
  const x = clamp((t - a) / (b - a));
  return x <= 0 ? 0 : x >= 1 ? 1 : ease(x);
};

function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fillRR(ctx, x, y, w, h, r, col) { rr(ctx, x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); }
function shadowed(ctx, blur, dy, alpha, fn) {
  ctx.save();
  ctx.shadowColor = `rgba(31,31,31,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = dy;
  fn();
  ctx.restore();
}

// ---------- icons (vector, no text) ----------
function clockIcon(ctx, cx, cy, r, col) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.55); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * 0.45, cy + r * 0.2); ctx.stroke();
  ctx.restore();
}
function checkIcon(ctx, cx, cy, s, col, p = 1) {
  // p draws the stroke on (0..1)
  const pts = [[-0.5, 0.02], [-0.15, 0.36], [0.52, -0.34]];
  const l1 = Math.hypot(0.35, 0.34), l2 = Math.hypot(0.67, 0.7), tot = l1 + l2;
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + pts[0][0] * s, cy + pts[0][1] * s);
  const d = p * tot;
  if (d <= l1) {
    const k = d / l1;
    ctx.lineTo(cx + lerp(pts[0][0], pts[1][0], k) * s, cy + lerp(pts[0][1], pts[1][1], k) * s);
  } else {
    const k = (d - l1) / l2;
    ctx.lineTo(cx + pts[1][0] * s, cy + pts[1][1] * s);
    ctx.lineTo(cx + lerp(pts[1][0], pts[2][0], k) * s, cy + lerp(pts[1][1], pts[2][1], k) * s);
  }
  ctx.stroke();
  ctx.restore();
}
function stackIcon(ctx, cx, cy, s, col) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = s * 0.12; ctx.lineJoin = 'round';
  for (let i = 2; i >= 0; i--) {
    rr(ctx, cx - s * 0.5 + i * s * 0.16, cy - s * 0.42 + i * s * 0.16, s * 0.68, s * 0.52, s * 0.1);
    if (i === 0) { ctx.fillStyle = col; ctx.fill(); } else ctx.stroke();
  }
  ctx.restore();
}
function cursor(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.lineTo(10, 31); ctx.lineTo(17, 46); ctx.lineTo(24, 43);
  ctx.lineTo(17, 28); ctx.lineTo(30, 28); ctx.closePath();
  ctx.shadowColor = 'rgba(31,31,31,0.28)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.fillStyle = C.ink; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = '#FFFFFF'; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

// ---------- background ----------
function background(ctx, t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // soft brand glow for depth, drifting slowly
  const gx = 1500 - t * 40, gy = 120 + t * 10;
  let g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 900);
  g.addColorStop(0, 'rgba(255,205,66,0.22)'); g.addColorStop(1, 'rgba(255,205,66,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(260, 1000, 0, 260, 1000, 700);
  g.addColorStop(0, 'rgba(255,205,66,0.10)'); g.addColorStop(1, 'rgba(255,205,66,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(31,31,31,0.055)';
  for (let y = 20; y < H; y += 40) for (let x = 20; x < W; x += 40) { ctx.fillRect(x - 1, y - 1, 2.4, 2.4); }
}


// ---------- post-card parts ----------
const VARIANTS = [
  { tint: C.yTint, shape: C.yellow, shape2: '#F5B82E' },
  { tint: '#2A2A2A', shape: C.yellow, shape2: '#454545' },
  { tint: C.gray, shape: C.gray2, shape2: '#BEB9AC' },
  { tint: C.yTint2, shape: '#F5B82E', shape2: C.surface },
];

function thumb(ctx, x, y, w, h, r, v) {
  ctx.save();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = v.tint; ctx.fill(); ctx.clip();
  ctx.fillStyle = v.shape;
  ctx.beginPath(); ctx.arc(x + w * 0.72, y + h * 0.32, Math.min(w, h) * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = v.shape2;
  ctx.beginPath(); ctx.moveTo(x - w * 0.05, y + h); ctx.lineTo(x + w * 0.32, y + h * 0.45); ctx.lineTo(x + w * 0.7, y + h); ctx.fill();
  ctx.fillStyle = v.shape;
  ctx.beginPath(); ctx.moveTo(x + w * 0.38, y + h); ctx.lineTo(x + w * 0.66, y + h * 0.6); ctx.lineTo(x + w * 1.05, y + h); ctx.fill();
  ctx.restore();
}


function cardShell(ctx, x, y, w, h, r, lift = 1) {
  shadowed(ctx, 30 * lift + 10, 10 * lift + 4, 0.10 + 0.06 * lift, () => fillRR(ctx, x, y, w, h, r, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = 'rgba(31,31,31,0.06)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}


// Generic headline line that rises into a clipped band (mask reveal).
function riseText(ctx, s, x, by, p, band = 116, rise = 110) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, by - band + 22, W, band); ctx.clip();
  ctx.fillText(s, x, by + rise * (1 - p));
  ctx.restore();
}

// ---------- end card ----------
let LOGO = null;
function endCard(ctx, t, T) {
  background(ctx, t);
  const lp = ep(t, ...T.logoIn, E.outQuint);
  const cp = ep(t, ...T.ctaIn, (v) => E.outBack(v, 1.2));
  const ca = ep(t, T.ctaIn[0], T.ctaIn[0] + 0.2);
  const cta = 'TRY RECURPOST FREE';
  const ar = LOGO.width / LOGO.height; // native aspect ratio, never altered
  let logo, pill, fs;
  if (END_LAYOUT === 'side') {
    const lh = 86, lw = lh * ar;
    fs = 50;
    ctx.font = font(800, fs); ctx.letterSpacing = '1px';
    const pw = ctx.measureText(cta).width + 96, ph = 108, gap = 64;
    const total = lw + gap * 2 + 3 + pw, x0 = (W - total) / 2;
    logo = { x: x0, y: H / 2 - lh / 2, w: lw, h: lh };
    pill = { x: x0 + lw + gap * 2 + 3, y: H / 2 - ph / 2, w: pw, h: ph };
    ctx.save(); ctx.globalAlpha = lp; ctx.fillStyle = C.gray2; ctx.fillRect(x0 + lw + gap, H / 2 - 60, 3, 120); ctx.restore();
  } else {
    const lh = 132, lw = lh * ar;
    fs = 66;
    ctx.font = font(800, fs); ctx.letterSpacing = '1px';
    const pw = ctx.measureText(cta).width + 120, ph = 136;
    logo = { x: (W - lw) / 2, y: 360, w: lw, h: lh };
    pill = { x: (W - pw) / 2, y: 588, w: pw, h: ph };
  }
  // logo: drawn unaltered at its native ratio; only position/opacity animate on entry
  ctx.save();
  ctx.globalAlpha = lp;
  ctx.drawImage(LOGO, logo.x, logo.y + 26 * (1 - lp), logo.w, logo.h);
  ctx.restore();
  // CTA
  ctx.save();
  ctx.globalAlpha = ca;
  const s = 0.86 + 0.14 * cp;
  ctx.translate(pill.x + pill.w / 2, pill.y + pill.h / 2); ctx.scale(s, s); ctx.translate(-pill.w / 2, -pill.h / 2);
  shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, 0, 0, pill.w, pill.h, pill.h / 2, C.yellow));
  ctx.font = font(800, fs); ctx.letterSpacing = '1px';
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(cta, pill.w / 2, pill.h / 2 + fs * 0.04);
  ctx.restore();
}

// ---------- frame ----------
// Yellow wipe with slanted edges: main scene left of `lead`, end card right of `trail`.
function renderAt(ctx, t, spot) {
  if (spot.renderAt) return spot.renderAt(ctx, t); // spots with their own ending (e.g. the 20 s cut)
  const [w0, w1] = spot.TL.T.wipe;
  if (t < w0) return spot.mainScene(ctx, t);
  const span = W + 320;
  const lead = W + 160 - span * ep(t, w0, w1 - 0.14, E.inOutCubic);
  const trail = W + 160 - span * ep(t, w0 + 0.12, w1, E.inOutCubic);
  if (trail <= -170) return endCard(ctx, t, spot.TL.T);
  const region = (a, b) => { // polygon between slanted edges a (left) and b (right)
    ctx.beginPath();
    ctx.moveTo(a + 150, 0); ctx.lineTo(b + 150, 0); ctx.lineTo(b - 150, H); ctx.lineTo(a - 150, H); ctx.closePath();
  };
  ctx.save(); region(-2000, lead); ctx.clip(); spot.mainScene(ctx, t); ctx.restore();
  ctx.save(); region(lead, trail); ctx.fillStyle = C.yellow; ctx.fill(); ctx.restore();
  ctx.save(); region(trail, W + 2000); ctx.clip(); endCard(ctx, t, spot.TL.T); ctx.restore();
}

async function run(spotName, mode = 'video', arg) {
  const spot = require(`./spots/${spotName}/scenes`);
  const FRAMES = Math.round(spot.TL.DURATION * FPS);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const renderFrame = (f) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    renderAt(ctx, f / FPS, spot);
    ctx.restore();
  };
  LOGO = await loadImage(path.join(ROOT, 'assets', 'brand', 'logo_dark_text.png'));
  const outDir = path.join(ROOT, 'out');
  const tag = `bumper_${spotName}`;
  fs.mkdirSync(outDir, { recursive: true });
  if (mode === 'stills') {
    const dir = path.join(outDir, `${tag}_stills`);
    fs.mkdirSync(dir, { recursive: true });
    for (const s of (arg || '0').split(',')) {
      const f = Math.min(FRAMES - 1, Math.round(parseFloat(s) * FPS));
      renderFrame(f);
      fs.writeFileSync(path.join(dir, `t${(f / FPS).toFixed(2)}${END_LAYOUT === 'side' ? '_side' : ''}.png`), canvas.toBuffer('image/png'));
    }
    return;
  }
  if (mode === 'sheet') {
    const step = parseFloat(arg || '0.25');
    const times = [];
    for (let t = 0; t < spot.TL.DURATION - 1e-6; t += step) times.push(t);
    const cols = 6, tw = 480, th = 270, rows = Math.ceil(times.length / cols);
    const sheet = createCanvas(cols * tw, rows * (th + 34));
    const sc = sheet.getContext('2d');
    sc.fillStyle = '#111'; sc.fillRect(0, 0, sheet.width, sheet.height);
    times.forEach((t, i) => {
      renderFrame(Math.round(t * FPS));
      const x = (i % cols) * tw, y = Math.floor(i / cols) * (th + 34);
      sc.drawImage(canvas, x + 2, y + 2, tw - 4, th - 4);
      sc.fillStyle = '#fff'; sc.font = font(700, 22); sc.fillText(`${t.toFixed(2)}s`, x + 10, y + th + 26);
    });
    fs.writeFileSync(path.join(outDir, `${tag}_contact_sheet.png`), sheet.toBuffer('image/png'));
    return;
  }
  const out = arg || path.join(outDir, `${tag}_silent.mp4`);
  const ff = spawn(process.env.FFMPEG || 'ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FRAMES; f++) {
    renderFrame(f);
    if (!ff.stdin.write(Buffer.from(canvas.data()))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  process.stderr.write(`done: ${out} (${FRAMES} frames)\n`);
}

module.exports = {
  W, H, FPS, ROOT, C, CLIENT, VARIANTS, font, clamp, lerp, E, ep, rr, fillRR, shadowed,
  clockIcon, checkIcon, stackIcon, cursor, background, thumb, cardShell, riseText, run,
  getLogo: () => LOGO, // the supplied logo, loaded once before rendering
};
