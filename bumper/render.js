// RecurPost 6 s YouTube bumper, 1920x1080 @ 30 fps. Every frame is a pure function of time.
//   node bumper/render.js video [out.mp4]     silent video
//   node bumper/render.js stills 0.5,2.9       PNG stills -> out/bumper_stills/
//   node bumper/render.js sheet [step]         QA contact sheet -> out/bumper_contact_sheet.png
// END_LAYOUT=side puts the logo and CTA side by side instead of stacked.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const TL = require('./timeline');

const W = 1920, H = 1080, FPS = 30;
const FRAMES = Math.round(TL.DURATION * FPS);
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

// ---------- layout ----------
const CW = 260, CH = 380, GAP = 44;
const CX0 = (W - (5 * CW + 4 * GAP)) / 2, CY = 425;
const cardRect = (i) => ({ x: CX0 + i * (CW + GAP), y: CY, w: CW, h: CH });
const btnPos = (i) => { const r = cardRect(i); return { x: r.x + r.w - 42, y: r.y + r.h - 40 }; };

const WIN = { x: 250, y: 352, w: 1420, h: 600 };
const SIDE = 232, TOP = 66, HEAD = 42;
const GX = WIN.x + SIDE, GY = WIN.y + TOP + HEAD, COLS = 7, ROWS = 4;
const COLW = (WIN.w - SIDE - 18) / COLS, ROWH = (WIN.h - TOP - HEAD - 16) / ROWS;
const cellRect = (r, c) => ({ x: GX + c * COLW + 9, y: GY + r * ROWH + 10, w: COLW - 18, h: ROWH - 20 });
const BULK = { x: WIN.x + WIN.w - 24 - 176, y: WIN.y + 13, w: 176, h: 40 };

// ---------- post cards ----------
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

// Full-size post card (Scene 1). `sched` 0..1 is the scheduled state, `press` 0..1 the button press.
function bigCardContent(ctx, x, y, w, h, i, sched, press, alpha) {
  if (alpha <= 0) return;
  const v = VARIANTS[i % VARIANTS.length];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = CLIENT[i % CLIENT.length];
  ctx.beginPath(); ctx.arc(x + 34, y + 34, 15, 0, Math.PI * 2); ctx.fill();
  fillRR(ctx, x + 58, y + 24, 112, 10, 5, C.gray);
  fillRR(ctx, x + 58, y + 40, 72, 8, 4, C.line);
  thumb(ctx, x + 18, y + 64, w - 36, 150, 14, v);
  fillRR(ctx, x + 18, y + 234, w - 52, 10, 5, C.gray);
  fillRR(ctx, x + 18, y + 254, w - 96, 10, 5, C.gray);
  fillRR(ctx, x + 18, y + 274, w - 74, 10, 5, C.line);
  ctx.fillStyle = C.line; ctx.fillRect(x + 18, y + h - 74, w - 36, 2);
  // date slot fills in once the post is scheduled
  fillRR(ctx, x + 18, y + h - 46, 110, 14, 7, C.line);
  if (sched > 0) fillRR(ctx, x + 18, y + h - 46, 110 * sched, 14, 7, C.yellow);
  // schedule control
  const b = { x: x + w - 42, y: y + h - 40 };
  const s = 1 - 0.14 * press;
  ctx.save();
  ctx.translate(b.x, b.y); ctx.scale(s, s);
  ctx.fillStyle = '#EFEDE7';
  ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.fill();
  if (sched > 0) {
    ctx.fillStyle = C.yellow;
    ctx.beginPath(); ctx.arc(0, 0, 23 * E.outBack(sched), 0, Math.PI * 2); ctx.fill();
  }
  if (sched < 0.5) clockIcon(ctx, 0, 0, 10, C.ink);
  else checkIcon(ctx, 0, 0, 22, C.ink, clamp((sched - 0.5) * 2));
  ctx.restore();
  ctx.restore();
}

// Compact calendar slot card (Scene 2).
function miniCardContent(ctx, x, y, w, h, i, alpha) {
  if (alpha <= 0) return;
  const v = VARIANTS[i % VARIANTS.length];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.save(); rr(ctx, x, y, w, h, 12); ctx.clip();
  ctx.fillStyle = CLIENT[Math.floor(i / 7) % CLIENT.length]; ctx.fillRect(x, y, 6, h);
  ctx.restore();
  const th = h - 24;
  thumb(ctx, x + 16, y + 12, th, th, 8, v);
  const bx = x + 16 + th + 12, bw = w - (bx - x) - 12;
  fillRR(ctx, bx, y + 16, bw, 9, 4.5, C.gray);
  fillRR(ctx, bx, y + 33, bw * 0.7, 9, 4.5, C.line);
  fillRR(ctx, bx, y + h - 26, Math.min(44, bw), 12, 6, C.yellow);
  ctx.restore();
}

function cardShell(ctx, x, y, w, h, r, lift = 1) {
  shadowed(ctx, 30 * lift + 10, 10 * lift + 4, 0.10 + 0.06 * lift, () => fillRR(ctx, x, y, w, h, r, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = 'rgba(31,31,31,0.06)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}

// ---------- Scene 1 ----------
function headline1(ctx, t) {
  const out = ep(t, ...TL.T.headlineOut, E.inOutCubic);
  if (out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(0, -50 * out);
  ctx.font = font(800, 100); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.ink;
  [['STILL SCHEDULING', 212, -0.14], ['ONE POST AT A TIME?', 322, -0.07]].forEach(([s, by, t0]) => {
    const p = ep(t, t0, t0 + 0.36, E.outQuint);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, by - 92, W, 116); ctx.clip();
    ctx.fillText(s, W / 2, by + 110 * (1 - p));
    ctx.restore();
  });
  ctx.restore();
}

function cardState(i, t) {
  const tc = TL.CARD_CLICKS[i];
  const press = Math.max(0, 1 - Math.abs(t - tc) / 0.07);
  return { sched: ep(t, tc + 0.01, tc + 0.18), press };
}

function bigCard(ctx, i, t) {
  const te = TL.CARD_ENTER[i];
  const p = ep(t, te, te + 0.34, E.outQuint);
  if (p <= 0) return;
  const r = cardRect(i);
  const s = 0.9 + 0.1 * p;
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2 + 70 * (1 - p);
  ctx.save();
  ctx.globalAlpha = clamp(p * 1.6);
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-r.w / 2, -r.h / 2);
  cardShell(ctx, 0, 0, r.w, r.h, 24);
  const st = cardState(i, t);
  bigCardContent(ctx, 0, 0, r.w, r.h, i, st.sched, st.press, 1);
  ctx.restore();
}

function ripples(ctx, t) {
  TL.CARD_CLICKS.forEach((tc, i) => {
    const q = (t - tc) / 0.34;
    if (q < 0 || q > 1) return;
    const b = btnPos(i);
    ctx.save();
    ctx.strokeStyle = `rgba(255,205,66,${0.85 * (1 - q)})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y, 24 + 34 * E.outCubic(q), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  });
}

// ---------- cursor path ----------
const CURSOR_KEYS = (() => {
  const k = [[0, 1380, 980]];
  TL.CARD_CLICKS.forEach((tc, i) => { const b = btnPos(i); k.push([tc - 0.05, b.x, b.y], [tc + 0.05, b.x, b.y]); });
  const lb = btnPos(4);
  k.push([2.05, lb.x, lb.y]);
  const bx = BULK.x + BULK.w * 0.5, by = BULK.y + BULK.h * 0.55;
  k.push([TL.T.bulkClick - 0.06, bx, by], [TL.T.bulkClick + 0.12, bx, by], [3.0, bx + 150, by + 210]);
  return k;
})();
function cursorPos(t) {
  const k = CURSOR_KEYS;
  if (t <= k[0][0]) return { x: k[0][1], y: k[0][2] };
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, x0, y0] = k[i], [t1, x1, y1] = k[i + 1];
    if (t <= t1) { const p = E.inOutCubic(clamp((t - t0) / (t1 - t0))); return { x: lerp(x0, x1, p), y: lerp(y0, y1, p) }; }
  }
  const l = k[k.length - 1];
  return { x: l[1], y: l[2] };
}
function drawCursor(ctx, t) {
  const a = 1 - ep(t, 3.05, 3.35);
  if (a <= 0) return;
  const p = cursorPos(t);
  const clicks = [...TL.CARD_CLICKS, TL.T.bulkClick];
  const press = Math.max(0, ...clicks.map((tc) => 1 - Math.abs(t - tc) / 0.07));
  ctx.save(); ctx.globalAlpha = a;
  cursor(ctx, p.x - 2, p.y - 2, 1 - 0.12 * press);
  ctx.restore();
}

// ---------- Scene 2: calendar ----------
function cameraZoom(t) { return 1 + 0.03 * ep(t, 2.3, 3.8, E.inOutCubic); }

function calendarWindow(ctx, t) {
  const p = ep(t, ...TL.T.window, E.outQuint);
  if (p <= 0) return;
  const { x, y, w, h } = WIN;
  ctx.save();
  ctx.globalAlpha = clamp(p * 1.4);
  const s = 0.94 + 0.06 * p;
  ctx.translate(x + w / 2, y + h / 2 + 30 * (1 - p)); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  shadowed(ctx, 70, 26, 0.16, () => fillRR(ctx, x, y, w, h, 26, C.surface));
  // top bar
  ctx.save(); rr(ctx, x, y, w, h, 26); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(x, y, w, TOP);
  ctx.fillStyle = C.line; ctx.fillRect(x, y + TOP - 1, w, 1.5);
  ['#E3E0D8', '#E3E0D8', '#E3E0D8'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 32 + i * 22, y + TOP / 2, 7, 0, Math.PI * 2); ctx.fill(); });
  fillRR(ctx, x + SIDE + 9, y + 22, 210, 22, 11, C.gray);
  fillRR(ctx, x + SIDE + 236, y + 22, 92, 22, 11, C.line);
  // sidebar: one row per client profile
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(x, y + TOP, SIDE, h - TOP);
  ctx.fillStyle = C.line; ctx.fillRect(x + SIDE - 1, y + TOP, 1.5, h - TOP);
  for (let r = 0; r < ROWS; r++) {
    const q = ep(t, 1.8 + r * 0.05, 2.15 + r * 0.05);
    const ry = GY + r * ROWH + ROWH / 2;
    ctx.save(); ctx.globalAlpha *= q; ctx.translate(-16 * (1 - q), 0);
    ctx.fillStyle = CLIENT[r];
    ctx.beginPath(); ctx.arc(x + 46, ry, 19, 0, Math.PI * 2); ctx.fill();
    fillRR(ctx, x + 78, ry - 12, 116 - r * 10, 11, 5.5, C.gray);
    fillRR(ctx, x + 78, ry + 6, 68, 9, 4.5, C.line);
    ctx.restore();
  }
  // day header + grid
  for (let c = 0; c < COLS; c++) fillRR(ctx, GX + c * COLW + COLW / 2 - 26, y + TOP + 16, 52, 10, 5, c >= 5 ? C.line : C.gray);
  ctx.fillStyle = C.line;
  for (let c = 1; c < COLS; c++) ctx.fillRect(GX + c * COLW, GY, 1.2, ROWS * ROWH);
  for (let r = 0; r <= ROWS; r++) ctx.fillRect(GX, GY + r * ROWH, COLS * COLW, 1.2);
  ctx.restore();
  bulkButton(ctx, t);
  ctx.restore();
}

function bulkButton(ctx, t) {
  const { x, y, w, h } = BULK;
  const press = Math.max(0, 1 - Math.abs(t - TL.T.bulkClick) / 0.08);
  const done = ep(t, TL.T.confirm, TL.T.confirm + 0.22);
  const pulse = Math.sin(Math.PI * ep(t, TL.T.confirm, TL.T.confirm + 0.3)) * 0.06;
  const s = 1 - 0.07 * press + pulse;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  shadowed(ctx, 14, 4, 0.12, () => fillRR(ctx, x, y, w, h, h / 2, C.yellow));
  if (done < 0.5) {
    ctx.globalAlpha *= 1 - done * 2;
    stackIcon(ctx, x + 32, y + h / 2 + 1, 24, C.ink);
    fillRR(ctx, x + 58, y + h / 2 - 5, w - 82, 10, 5, 'rgba(31,31,31,0.75)');
  } else {
    ctx.globalAlpha *= (done - 0.5) * 2;
    checkIcon(ctx, x + w / 2, y + h / 2, 24, C.ink, (done - 0.5) * 2);
  }
  ctx.restore();
  // progress sheen while the batch populates
  const sh = ep(t, TL.T.bulkClick + 0.05, TL.T.confirm, (v) => v);
  if (sh > 0 && sh < 1) {
    ctx.save(); rr(ctx, x, y, w, h, h / 2); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(x, y + h - 5, w * sh, 5);
    ctx.restore();
  }
}

// cells populated by the single bulk action (everything except the five swept cards)
const FILL = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!(r === 0 && c < 5)) FILL.push({ r, c, d: TL.T.fillStart + c * 0.045 + r * 0.06 });

function filledCells(ctx, t) {
  for (const f of FILL) {
    const a = ep(t, f.d, f.d + 0.1);
    if (a <= 0) continue;
    const q = ep(t, f.d, f.d + 0.24, (v) => E.outBack(v, 1.6));
    const cr = cellRect(f.r, f.c);
    const s = 0.55 + 0.45 * q;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cr.x + cr.w / 2, cr.y + cr.h / 2); ctx.scale(s, s); ctx.translate(-cr.w / 2, -cr.h / 2);
    cardShell(ctx, 0, 0, cr.w, cr.h, 12, 0.15);
    miniCardContent(ctx, 0, 0, cr.w, cr.h, f.r * 7 + f.c, 1);
    ctx.restore();
  }
}

// The five Scene-1 cards fly from their positions into the first client row.
function sweptCards(ctx, t) {
  for (let i = 0; i < 5; i++) {
    const t0 = TL.T.sweep[0] + i * 0.035;
    const p = ep(t, t0, t0 + 0.47, E.inOutQuart);
    const a = cardRect(i), b = cellRect(0, i);
    const arc = Math.sin(Math.PI * p);
    const x = lerp(a.x, b.x, p), y = lerp(a.y, b.y, p) - 70 * arc;
    const w = lerp(a.w, b.w, p), h = lerp(a.h, b.h, p);
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.rotate((i - 2) * 0.03 * arc); ctx.translate(-w / 2, -h / 2);
    cardShell(ctx, 0, 0, w, h, lerp(24, 12, p), lerp(1, 0.15, p) + arc * 0.6);
    const st = cardState(i, t);
    ctx.save(); rr(ctx, 0, 0, w, h, lerp(24, 12, p)); ctx.clip();
    // both layouts scale uniformly with the shell (no distortion) and cross-fade mid-flight
    if (p < 0.55) {
      const k = Math.min(w / a.w, h / a.h);
      ctx.save(); ctx.translate((w - a.w * k) / 2, (h - a.h * k) / 2); ctx.scale(k, k);
      bigCardContent(ctx, 0, 0, a.w, a.h, i, st.sched, 0, 1 - ep(p, 0.15, 0.55));
      ctx.restore();
    }
    if (p > 0.3) {
      const k = Math.min(w / b.w, h / b.h);
      ctx.save(); ctx.translate((w - b.w * k) / 2, (h - b.h * k) / 2); ctx.scale(k, k);
      miniCardContent(ctx, 0, 0, b.w, b.h, i, ep(p, 0.3, 0.75));
      ctx.restore();
    }
    ctx.restore();
    ctx.restore();
  }
}

function headline2(ctx, t) {
  const t0 = TL.T.copy2;
  if (t < t0 - 0.01) return;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const big = 'BATCH SCHEDULE';
  ctx.font = font(800, 104);
  const tw = ctx.measureText(big).width;
  const by = 218;
  // yellow highlight band wipes in, then the words rise into it
  const band = ep(t, t0, t0 + 0.24, E.outQuint);
  fillRR(ctx, W / 2 - tw / 2 - 30, by - 94, (tw + 60) * band, 116, 14, C.yellow);
  const p = ep(t, t0 + 0.04, t0 + 0.36, E.outQuint);
  ctx.save(); ctx.beginPath(); ctx.rect(0, by - 94, W, 116); ctx.clip();
  ctx.fillStyle = C.ink; ctx.fillText(big, W / 2, by + 110 * (1 - p));
  ctx.restore();
  const q = ep(t, t0 + 0.14, t0 + 0.44, E.outQuint);
  ctx.globalAlpha = q;
  ctx.font = font(800, 50);
  ctx.letterSpacing = '6px';
  ctx.fillStyle = C.ink;
  ctx.fillText('WITH RECURPOST', W / 2 + 3, 300 + 24 * (1 - q));
  ctx.restore();
}

// ---------- Scene 3: end card ----------
let LOGO = null;
function endCard(ctx, t) {
  background(ctx, t);
  const lp = ep(t, ...TL.T.logoIn, E.outQuint);
  const cp = ep(t, ...TL.T.ctaIn, (v) => E.outBack(v, 1.2));
  const ca = ep(t, TL.T.ctaIn[0], TL.T.ctaIn[0] + 0.2);
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
function uiLayer(ctx, t) {
  const z = cameraZoom(t);
  ctx.save();
  ctx.translate(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2); ctx.scale(z, z); ctx.translate(-(WIN.x + WIN.w / 2), -(WIN.y + WIN.h / 2));
  if (t >= TL.T.window[0]) calendarWindow(ctx, t);
  if (t < TL.T.sweep[0]) { for (let i = 0; i < 5; i++) bigCard(ctx, i, t); ripples(ctx, t); } else sweptCards(ctx, t);
  filledCells(ctx, t);
  drawCursor(ctx, t);
  ctx.restore();
}

function mainScene(ctx, t) {
  background(ctx, t);
  headline1(ctx, t);
  headline2(ctx, t);
  uiLayer(ctx, t);
}

// Yellow wipe with slanted edges: scene 1-2 on the left of `lead`, end card right of `trail`.
function renderAt(ctx, t) {
  const [w0, w1] = TL.T.wipe;
  if (t < w0) return mainScene(ctx, t);
  const span = W + 320;
  const lead = W + 160 - span * ep(t, w0, w1 - 0.14, E.inOutCubic);
  const trail = W + 160 - span * ep(t, w0 + 0.12, w1, E.inOutCubic);
  if (trail <= -170) return endCard(ctx, t);
  const region = (a, b) => { // polygon between slanted edges a (left) and b (right)
    ctx.beginPath();
    ctx.moveTo(a + 150, 0); ctx.lineTo(b + 150, 0); ctx.lineTo(b - 150, H); ctx.lineTo(a - 150, H); ctx.closePath();
  };
  ctx.save(); region(-2000, lead); ctx.clip(); mainScene(ctx, t); ctx.restore();
  ctx.save(); region(lead, trail); ctx.fillStyle = C.yellow; ctx.fill(); ctx.restore();
  ctx.save(); region(trail, W + 2000); ctx.clip(); endCard(ctx, t); ctx.restore();
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
function renderFrame(f) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
  renderAt(ctx, f / FPS);
  ctx.restore();
}

async function main() {
  LOGO = await loadImage(path.join(ROOT, 'assets', 'brand', 'logo_dark_text.png'));
  const [mode = 'video', arg] = process.argv.slice(2);
  const outDir = path.join(ROOT, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  if (mode === 'stills') {
    const dir = path.join(outDir, 'bumper_stills');
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
    for (let t = 0; t < TL.DURATION - 1e-6; t += step) times.push(t);
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
    fs.writeFileSync(path.join(outDir, 'bumper_contact_sheet.png'), sheet.toBuffer('image/png'));
    return;
  }
  const out = arg || path.join(outDir, 'bumper_silent.mp4');
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

main().catch((e) => { console.error(e); process.exit(1); });
