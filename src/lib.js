// Shared motion + drawing primitives for the RecurPost spot.
// Everything is a pure function of time so any frame can be rendered alone.
const { GlobalFonts, Path2D } = require('@napi-rs/canvas');
const path = require('path');
const si = require('simple-icons');
const B = require('./brand');

const W = 1080, H = 1920, FPS = 30;

// ---------- fonts ----------
const FONT_DIR = path.join(__dirname, '..', 'node_modules', '@fontsource');
for (const w of [500, 700, 800]) {
  GlobalFonts.registerFromPath(
    `${FONT_DIR}/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff2`, `J${w}`);
}
for (const w of [400, 500, 600, 700, 800]) {
  GlobalFonts.registerFromPath(`${FONT_DIR}/inter/files/inter-latin-${w}-normal.woff2`, `I${w}`);
}
const disp = (w, px) => `${px}px J${w}`;   // display face (headlines)
const ui = (w, px) => `${px}px I${w}`;     // UI face

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: (x) => x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  outElastic: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
// eased progress helper
const ep = (t, a, b, ease = E.outCubic) => {
  const x = prog(t, a, b);
  return x <= 0 ? 0 : x >= 1 ? 1 : ease(x);
};

// deterministic RNG
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ---------- shapes ----------
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Standard product surface: dark glass card, hairline border, soft shadow.
function card(ctx, x, y, w, h, o = {}) {
  const r = o.r ?? 28;
  ctx.save();
  if (o.shadow !== false) {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = o.shadowBlur ?? 50;
    ctx.shadowOffsetY = 18;
  }
  rr(ctx, x, y, w, h, r);
  if (o.fill) ctx.fillStyle = o.fill;
  else {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, B.surface2);
    g.addColorStop(1, B.surface);
    ctx.fillStyle = g;
  }
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = o.lw ?? 2;
  ctx.strokeStyle = o.stroke ?? 'rgba(255,255,255,0.09)';
  ctx.stroke();
  ctx.restore();
}

// Text with optional tracking, alignment and glow.
function text(ctx, str, x, y, o = {}) {
  ctx.save();
  ctx.font = o.font || disp(800, 64);
  ctx.fillStyle = o.color || B.text;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
  ctx.letterSpacing = `${o.track || 0}px`;
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowBlur ?? 30; }
  ctx.fillText(str, x, y);
  ctx.restore();
}
function measure(ctx, str, font, track = 0) {
  ctx.save();
  ctx.font = font;
  ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

// Pill label ("chip") used for feature micro-labels.
function chip(ctx, str, cx, cy, o = {}) {
  const font = o.font || ui(700, 28);
  const track = o.track ?? 2;
  const tw = measure(ctx, str, font, track);
  const padX = o.padX ?? 26, h = o.h ?? 58;
  const w = tw + padX * 2 + (o.icon ? 40 : 0);
  const x = cx - w / 2, y = cy - h / 2;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = o.fill || 'rgba(255,255,255,0.06)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.14)';
  ctx.stroke();
  if (o.icon) o.icon(x + padX + 14, cy);
  text(ctx, str, x + padX + (o.icon ? 40 : 0) + tw / 2, cy + 1, { font, color: o.color || B.text, track });
  ctx.restore();
  return w;
}

// Row of chips that pop in one after another, centered on cx.
function chipRow(ctx, labels, cx, cy, t, t0, o = {}) {
  const gap = o.gap ?? 18;
  const font = o.font || ui(700, 28);
  const widths = labels.map((l) => measure(ctx, l, font, o.track ?? 2) + (o.padX ?? 26) * 2);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let x = cx - total / 2;
  labels.forEach((l, i) => {
    const p = ep(t, t0 + i * (o.stagger ?? 0.09), t0 + i * (o.stagger ?? 0.09) + 0.28, E.outBack);
    if (p <= 0) { x += widths[i] + gap; return; }
    ctx.save();
    const mx = x + widths[i] / 2;
    ctx.translate(mx, cy + (1 - p) * 30);
    ctx.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
    chip(ctx, l, 0, 0, { ...o, alpha: clamp(p) * (o.alpha ?? 1) });
    ctx.restore();
    x += widths[i] + gap;
  });
}

// ---------- icons ----------
// Platform glyphs come from simple-icons (accurate vector marks). LinkedIn and
// Google Business Profile marks are not distributed there, so those render as
// clean text-label tiles instead of hand-drawn (inaccurate) logos.
const PLATFORMS = {
  instagram: { name: 'Instagram', color: '#E4405F', icon: si.siInstagram },
  facebook: { name: 'Facebook', color: '#1877F2', icon: si.siFacebook },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', icon: null, abbr: 'LinkedIn' },
  tiktok: { name: 'TikTok', color: '#111111', icon: si.siTiktok, ring: true },
  gbp: { name: 'Google Business Profile', color: '#4285F4', icon: si.siGoogle, short: 'Google' },
};
const iconPaths = {};
function platformTile(ctx, key, cx, cy, size, o = {}) {
  const p = PLATFORMS[key];
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  const r = size * 0.26;
  if (p.icon) {
    rr(ctx, cx - size / 2, cy - size / 2, size, size, r);
    ctx.fillStyle = key === 'gbp' ? '#FFFFFF' : p.color;
    ctx.fill();
    if (p.ring) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke(); }
    if (!iconPaths[key]) iconPaths[key] = new Path2D(p.icon.path);
    const s = (size * 0.56) / 24;
    ctx.translate(cx - 12 * s, cy - 12 * s);
    ctx.scale(s, s);
    ctx.fillStyle = key === 'gbp' ? p.color : '#FFFFFF';
    ctx.fill(iconPaths[key]);
  } else {
    // text-label tile (no logo reproduction)
    const label = 'in';
    rr(ctx, cx - size / 2, cy - size / 2, size, size, r);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.font = ui(800, Math.round(size * 0.2));
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LinkedIn', cx, cy + 1);
    void label;
  }
  ctx.restore();
}

// Vector check / cross / arrow so we never depend on font glyph coverage.
function checkMark(ctx, cx, cy, s, color, lw, p = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pts = [[-0.42, 0.02], [-0.12, 0.32], [0.46, -0.3]];
  const l1 = Math.hypot(0.3, 0.3), l2 = Math.hypot(0.58, 0.62), L = l1 + l2;
  const d = p * L;
  ctx.beginPath();
  ctx.moveTo(cx + pts[0][0] * s, cy + pts[0][1] * s);
  if (d <= l1) {
    const k = d / l1;
    ctx.lineTo(cx + lerp(pts[0][0], pts[1][0], k) * s, cy + lerp(pts[0][1], pts[1][1], k) * s);
  } else {
    ctx.lineTo(cx + pts[1][0] * s, cy + pts[1][1] * s);
    const k = (d - l1) / l2;
    ctx.lineTo(cx + lerp(pts[1][0], pts[2][0], k) * s, cy + lerp(pts[1][1], pts[2][1], k) * s);
  }
  ctx.stroke();
  ctx.restore();
}
function crossMark(ctx, cx, cy, s, color, lw) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, cy - s * 0.3); ctx.lineTo(cx + s * 0.3, cy + s * 0.3);
  ctx.moveTo(cx + s * 0.3, cy - s * 0.3); ctx.lineTo(cx - s * 0.3, cy + s * 0.3);
  ctx.stroke();
  ctx.restore();
}
function arrow(ctx, cx, cy, s, color, lw, dir = 0) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(dir);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, 0); ctx.lineTo(s * 0.42, 0);
  ctx.moveTo(s * 0.08, -s * 0.34); ctx.lineTo(s * 0.45, 0); ctx.lineTo(s * 0.08, s * 0.34);
  ctx.stroke();
  ctx.restore();
}
function star(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
function sparkle(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
// circular "recycle" arrows
function loopIcon(ctx, cx, cy, r, color, lw, rot = 0) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    ctx.save(); ctx.rotate(k * Math.PI);
    ctx.beginPath(); ctx.arc(0, 0, r, 0.25, Math.PI - 0.45); ctx.stroke();
    const a = Math.PI - 0.45;
    const hx = Math.cos(a) * r, hy = Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(hx - lw * 1.4, hy - lw * 0.2);
    ctx.lineTo(hx + lw * 1.1, hy - lw * 1.3);
    ctx.lineTo(hx + lw * 0.6, hy + lw * 1.4);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- the RecurPost Flow Line ----------
// A glowing gradient stroke drawn partially along a polyline / sampled curve.
function flowLine(ctx, pts, p0, p1, o = {}) {
  if (p1 <= p0 || pts.length < 2) return;
  // cumulative lengths
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1];
  const a = p0 * tot, b = p1 * tot;
  const at = (d) => {
    let i = 1;
    while (i < L.length - 1 && L[i] < d) i++;
    const k = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
  };
  const seg = [at(a)];
  for (let i = 0; i < pts.length; i++) if (L[i] > a && L[i] < b) seg.push(pts[i]);
  seg.push(at(b));
  const draw = (lw, alpha, blur) => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const g = ctx.createLinearGradient(o.gx0 ?? 0, o.gy0 ?? 0, o.gx1 ?? W, o.gy1 ?? H);
    g.addColorStop(0, B.flow[0]); g.addColorStop(0.5, B.flow[1]); g.addColorStop(1, B.flow[2]);
    ctx.strokeStyle = g;
    if (blur) { ctx.shadowColor = B.flow[1]; ctx.shadowBlur = blur; }
    ctx.beginPath();
    seg.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  const lw = o.lw ?? 8;
  draw(lw * 3.2, 0.18 * (o.alpha ?? 1), 0);
  draw(lw, o.alpha ?? 1, o.glow ?? 26);
  // bright head
  if (o.head !== false) {
    const [hx, hy] = seg[seg.length - 1];
    ctx.save();
    ctx.globalAlpha *= o.alpha ?? 1;
    const rg = ctx.createRadialGradient(hx, hy, 0, hx, hy, lw * 5);
    rg.addColorStop(0, 'rgba(255,255,255,0.95)');
    rg.addColorStop(0.3, hexA(B.flow[1], 0.6));
    rg.addColorStop(1, hexA(B.flow[1], 0));
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(hx, hy, lw * 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
function sampleCurve(fn, n = 120) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(fn(i / n));
  return out;
}

// ---------- background ----------
function background(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, o.top || B.bg2);
  g.addColorStop(1, o.bottom || B.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // soft brand glows
  const glows = o.glows ?? [
    [B.primary, 180 + Math.sin(t * 0.7) * 40, 520, 760, 0.22],
    [B.secondary, 920, 1380 + Math.cos(t * 0.6) * 60, 700, 0.14],
  ];
  for (const [c, x, y, r, a] of glows) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, hexA(c, a));
    rg.addColorStop(1, hexA(c, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }
  if (o.grid !== false) {
    ctx.save();
    ctx.globalAlpha = o.gridAlpha ?? 0.05;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const step = 90, off = ((o.gridShift ?? t * 20) % step);
    ctx.beginPath();
    for (let x = -step + off; x < W + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = -step + off; y < H + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    ctx.restore();
  }
}

// vignette + film grain for a finished, non-flat look
const grainRng = rng(7);
const GRAIN = Array.from({ length: 1400 }, () => [grainRng() * W, grainRng() * H, grainRng()]);
function finish(ctx, frame) {
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  const shift = (frame * 7919) % GRAIN.length;
  for (let i = 0; i < 500; i++) {
    const [x, y, v] = GRAIN[(i + shift) % GRAIN.length];
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect((x + frame * 13) % W, (y + frame * 29) % H, 2, 2);
  }
  ctx.restore();
}

// Camera: scale/rotate about a focus point, plus translation.
function camera(ctx, { s = 1, x = 0, y = 0, rot = 0, fx = W / 2, fy = H / 2 } = {}) {
  ctx.translate(fx + x, fy + y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.translate(-fx, -fy);
}

// Headline zone helper (keeps copy inside the mobile safe area).
const SAFE = { top: 300, bottom: 1480, left: 70, right: W - 70 };

module.exports = {
  W, H, FPS, B, disp, ui, clamp, lerp, prog, ep, E, rng, hexA, rr, card, text, measure, chip, chipRow,
  PLATFORMS, platformTile, checkMark, crossMark, arrow, star, sparkle, loopIcon, flowLine, sampleCurve,
  background, finish, camera, SAFE,
};
