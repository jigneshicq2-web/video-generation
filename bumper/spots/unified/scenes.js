// 20 s skippable in-stream, "One calendar view". One continuous story around one post card (the
// "hero"): lost among four client calendars -> the calendars become the rows of one calendar ->
// statuses at a glance -> the card is moved Thursday -> Friday -> the calendar becomes the end-card panel.
// Visible words: the five headlines, "Client 1-4", the client message, the four status labels,
// and the end-card line + CTA. Everything else is abstract.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, clockIcon, checkIcon, cursor, riseText, getLogo } = L;
const T = TL.T;

// ---------- data ----------
// Client accents: brand yellow and charcoal plus two coordinated warm tones.
const CLIENTS = [
  { label: 'Client 1', col: C.yellow }, { label: 'Client 2', col: C.ink },
  { label: 'Client 3', col: '#F2A93B' }, { label: 'Client 4', col: '#A8A397' },
];
const ST = {
  S: { label: 'Scheduled', col: C.yellow, text: C.ink },
  P: { label: 'Published', col: C.ink, text: '#FFFFFF' },
  D: { label: 'Draft', col: '#FFFFFF', text: C.ink },
  F: { label: 'Failed', col: '#E5484D', text: '#FFFFFF' },
};
// [row (client), col (day), status, thumbnail variant]
const POSTS = [
  [0, 0, 'P', 0], [0, 2, 'P', 2], [0, 4, 'S', 3], [0, 6, 'D', 2],
  [1, 1, 'P', 2], [1, 5, 'S', 0],
  [2, 0, 'P', 3], [2, 2, 'S', 2], [2, 5, 'D', 0], [2, 6, 'F', 3],
  [3, 1, 'S', 0], [3, 4, 'P', 2], [3, 6, 'S', 3],
];
const HERO = { row: 1, from: 3, to: 4, status: 'S', variant: 1 };
const TAGS = [{ k: 'S', rc: [3, 1] }, { k: 'P', rc: [3, 4] }, { k: 'D', rc: [2, 5] }, { k: 'F', rc: [2, 6], below: true }]
  .map((g, i) => ({ ...g, t: T.tags[i] }));

const VAR = [
  { tint: C.yTint, a: C.yellow, b: '#F5B82E' },
  { tint: '#2A2A2A', a: C.yellow, b: '#4A4A4A' },
  { tint: C.gray, a: C.gray2, b: '#BEB9AC' },
  { tint: C.yTint2, a: '#F5B82E', b: '#FFFFFF' },
];

// ---------- geometry ----------
const ASPECT = 1.52;                                   // every post card shares one aspect ratio
const U = { x: 230, y: 330, w: 1460, h: 620 };         // the unified calendar (layer coordinates)
const UTOP = 76, UHEAD = 40, USIDE = 230;
const GX = U.x + USIDE, GY = U.y + UTOP + UHEAD;
const COLW = (U.w - USIDE - 16) / 7, ROWH = (U.h - UTOP - UHEAD - 14) / 4;
const cellU = (r, c) => {
  const w = COLW - 18, h = Math.min(ROWH - 20, w / ASPECT);
  return { x: GX + c * COLW + 9, y: GY + r * ROWH + (ROWH - h) / 2, w, h };
};
const bandU = (i) => ({ x: U.x, y: GY + i * ROWH, w: U.w, h: ROWH });

const A_WIN = [ // scene 1: four client calendars split the screen
  { x: 200, y: 312, w: 742, h: 318 }, { x: 978, y: 312, w: 742, h: 318 },
  { x: 200, y: 656, w: 742, h: 318 }, { x: 978, y: 656, w: 742, h: 318 },
];
const B_WIN = [ // scene 2: the same calendars, overlapping
  { x: 250, y: 318, w: 700, h: 318 }, { x: 330, y: 398, w: 700, h: 318 },
  { x: 410, y: 478, w: 700, h: 318 }, { x: 490, y: 558, w: 700, h: 318 },
];
const ENTER_FROM = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
const WTOP = 60;

// cell inside a free-standing client window
function cellWin(rect, c, row = 0, top = WTOP) {
  const colW = (rect.w - 24) / 7, rowH = (rect.h - top - 14) / 2;
  const w = colW - 12, h = Math.min(rowH - 18, w / ASPECT);
  return { x: rect.x + 12 + c * colW + 6, y: rect.y + top + 7 + row * rowH + (rowH - h) / 2, w, h };
}

// ---------- drawing parts ----------
function thumb(ctx, x, y, w, h, r, v) {
  ctx.save();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = v.tint; ctx.fill(); ctx.clip();
  ctx.fillStyle = v.a; ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.33, Math.min(w, h) * 0.17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = v.b; ctx.beginPath(); ctx.moveTo(x - w * 0.05, y + h); ctx.lineTo(x + w * 0.33, y + h * 0.45); ctx.lineTo(x + w * 0.72, y + h); ctx.fill();
  ctx.fillStyle = v.a; ctx.beginPath(); ctx.moveTo(x + w * 0.38, y + h); ctx.lineTo(x + w * 0.66, y + h * 0.6); ctx.lineTo(x + w * 1.05, y + h); ctx.fill();
  ctx.restore();
}

function exclaim(ctx, cx, cy, s, col) {
  fillRR(ctx, cx - s * 0.09, cy - s * 0.42, s * 0.18, s * 0.5, s * 0.09, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy + s * 0.32, s * 0.11, 0, Math.PI * 2); ctx.fill();
}

function badge(ctx, k, cx, cy, r) {
  ctx.save();
  if (k === 'D') {
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.setLineDash([r * 0.42, r * 0.32]); ctx.lineWidth = r * 0.2; ctx.strokeStyle = '#8F8A7E';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.fillStyle = ST[k].col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    if (k === 'S') clockIcon(ctx, cx, cy, r * 0.5, C.ink);
    if (k === 'P') checkIcon(ctx, cx, cy, r * 0.95, '#FFFFFF');
    if (k === 'F') exclaim(ctx, cx, cy, r * 1.05, '#FFFFFF');
  }
  ctx.restore();
}

// A post card at any size; content scales with height. o: { client, status, statusA, variant, hero, lift, dim }
function postCard(ctx, x, y, w, h, o) {
  const r = h * 0.13;
  ctx.save();
  ctx.translate(x, y);
  const lift = o.lift ?? 0;
  const draft = o.status === 'D' && (o.statusA ?? 0) > 0;
  shadowed(ctx, 8 + 30 * lift + h * 0.08, 3 + 12 * lift, 0.1 + 0.12 * lift, () => fillRR(ctx, 0, 0, w, h, r, C.surface));
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.clip();
  ctx.fillStyle = CLIENTS[o.client].col; ctx.fillRect(0, 0, Math.max(4, h * 0.06), h);
  const pad = h * 0.13, th = h - pad * 2;
  ctx.globalAlpha *= draft ? 1 - 0.4 * o.statusA : 1;
  thumb(ctx, pad + h * 0.05, pad, th, th, h * 0.08, VAR[o.variant % VAR.length]);
  const bx = pad + h * 0.05 + th + h * 0.12, bw = w - bx - pad;
  fillRR(ctx, bx, pad + h * 0.04, bw * 0.95, h * 0.09, h * 0.045, C.gray);
  fillRR(ctx, bx, pad + h * 0.2, bw * 0.62, h * 0.09, h * 0.045, C.line);
  ctx.restore();
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.strokeStyle = 'rgba(31,31,31,0.07)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  if (o.hero) { rr(ctx, -2, -2, w + 4, h + 4, r + 2); ctx.strokeStyle = C.yellow; ctx.lineWidth = Math.max(3, h * 0.035); ctx.stroke(); }
  if (o.status && (o.statusA ?? 0) > 0) {
    const a = o.statusA, br = h * 0.14;
    ctx.save();
    ctx.translate(w - br - h * 0.1, h - br - h * 0.1); ctx.scale(E.outBack(a, 1.8), E.outBack(a, 1.8));
    badge(ctx, o.status, 0, 0, br);
    ctx.restore();
  }
  if (o.dim) { ctx.globalAlpha = o.dim; fillRR(ctx, -3, -3, w + 6, h + 6, r, C.bg); }
  ctx.restore();
}

// A free-standing client calendar window. m (0..1) morphs it into its row of the unified calendar.
function clientWindow(ctx, i, rect, t, o = {}) {
  const m = o.m ?? 0;
  const band = bandU(i);
  const R = {
    x: lerp(rect.x, band.x, m), y: lerp(rect.y, band.y, m),
    w: lerp(rect.w, band.w, m), h: lerp(rect.h, band.h, m),
  };
  const top = lerp(WTOP, 0, m);
  const rad = lerp(22, 0, m);
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  if (m < 1) shadowed(ctx, 40 * (1 - m), 16 * (1 - m), 0.15 * (1 - m), () => fillRR(ctx, R.x, R.y, R.w, R.h, rad, C.surface));
  else { ctx.fillStyle = C.surface; ctx.fillRect(R.x, R.y, R.w, R.h); }
  ctx.save(); rr(ctx, R.x, R.y, R.w, R.h, rad); ctx.clip();
  // window bar
  if (top > 1) { ctx.fillStyle = '#FBFAF7'; ctx.fillRect(R.x, R.y, R.w, top); ctx.fillStyle = C.line; ctx.fillRect(R.x, R.y + top - 1, R.w, 1.5); }
  // the "Client N" label travels from the window bar to the calendar's sidebar
  const lx = lerp(R.x + 26, band.x + 30, m), ly = lerp(R.y + top / 2, band.y + band.h / 2, m);
  const dotR = lerp(12, 16, m);
  ctx.fillStyle = CLIENTS[i].col; ctx.beginPath(); ctx.arc(lx + dotR, ly, dotR, 0, Math.PI * 2); ctx.fill();
  const tf = ctx.getTransform(), sxL = tf.a * lx + tf.e;
  ctx.save();
  ctx.globalAlpha *= clamp((sxL - 192) / 60);
  ctx.fillStyle = C.ink; ctx.font = font(700, 32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(CLIENTS[i].label, lx + dotR * 2 + 14, ly + 1);
  ctx.restore();
  // grid: window columns line up with the calendar's day columns
  const scroll = o.scroll ?? 0;
  const gx0 = lerp(R.x + 12, GX, m), colW = lerp((rect.w - 24) / 7, COLW, m);
  ctx.fillStyle = C.line;
  for (let c = 1; c < 7; c++) ctx.fillRect(gx0 + c * colW, R.y + top + 6, 1.2, R.h - top - 12);
  if (m < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - m;
    const rowH = (rect.h - WTOP - 14) / 2;
    ctx.fillRect(R.x + 12, R.y + top + 7 + rowH + scroll * 0.4, R.w - 24, 1.2);
    // faint "other week" cards in the window's second row
    for (const c of [(i + 1) % 7, (i + 4) % 7]) {
      const cw = cellWin(rect, c, 1);
      ctx.globalAlpha *= 0.45;
      postCard(ctx, cw.x + R.x - rect.x, cw.y + R.y - rect.y + scroll, cw.w, cw.h, { client: i, variant: c });
      ctx.globalAlpha /= 0.45;
    }
    ctx.restore();
  }
  if (m > 0) { ctx.fillStyle = C.line; ctx.fillRect(R.x + USIDE * m, R.y + R.h - 1, R.w, 1.2); }
  // this client's posts
  for (const [r, c, k, v] of POSTS) {
    if (r !== i) continue;
    const a = cellWin(rect, c), b = cellU(r, c);
    const x = lerp(a.x, b.x, m), y = lerp(a.y + scroll, b.y, m);
    const w = lerp(a.w, b.w, m), h = lerp(a.h, b.h, m);
    postCard(ctx, x, y, w, h, { client: i, variant: v, status: k, statusA: o.statusA ? o.statusA(r, c) : 0, dim: o.dim ? o.dim(r, c) : 0 });
  }
  ctx.restore();
  ctx.restore();
}

// the unified calendar's frame (behind the client rows)
function calendarFrame(ctx, t, a) {
  if (a <= 0) return;
  const { x, y, w, h } = U;
  ctx.save();
  ctx.globalAlpha *= a;
  shadowed(ctx, 70, 26, 0.16, () => fillRR(ctx, x, y, w, h, 26, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, 26); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(x, y, w, UTOP);
  ctx.fillStyle = C.line; ctx.fillRect(x, y + UTOP - 1, w, 1.5);
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(x, y + UTOP, USIDE, h - UTOP);
  ctx.fillStyle = C.line; ctx.fillRect(x + USIDE - 1, y + UTOP, 1.5, h - UTOP);
  for (let c = 0; c < 7; c++) fillRR(ctx, GX + c * COLW + COLW / 2 - 26, y + UTOP + 15, 52, 10, 5, C.gray);
  ctx.restore();
  // subtle logo reveal in the calendar bar: exact asset, native ratio
  const lp = ep(t, ...T.logo, E.outQuint) * (1 - ep(t, T.zoom[0] - 0.15, T.zoom[0]));
  if (lp > 0) {
    const LOGO = getLogo(), lh = 34;
    ctx.globalAlpha *= lp;
    ctx.drawImage(LOGO, x + 30, y + (UTOP - lh) / 2 + 6 * (1 - lp), lh * LOGO.width / LOGO.height, lh);
  }
  ctx.restore();
}

// ---------- headlines ----------
function headline(ctx, t, lines, t0, t1, opts = {}) {
  const inP = (d) => ep(t, t0 + d, t0 + d + 0.36, E.outQuint);
  const out = ep(t, t1, t1 + 0.2, E.inOutCubic);
  if (t < t0 - 0.01 || out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(0, -40 * out);
  const fs = opts.fs || 84;
  ctx.font = font(800, fs); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const ys = lines.length === 1 ? [220] : [168, 268];
  lines.forEach((s, j) => {
    if (opts.band === j) {
      const tw = ctx.measureText(s).width;
      const b = ep(t, t0 + 0.16, t0 + 0.4, E.outQuint);
      fillRR(ctx, W / 2 - tw / 2 - 24, ys[j] - fs * 0.93, (tw + 48) * b, fs * 1.17, 12, C.yellow);
    }
    ctx.fillStyle = opts.color ? opts.color(t, j) : C.ink;
    riseText(ctx, s, W / 2, ys[j], inP(j * 0.08), fs * 1.19, fs * 1.2);
  });
  ctx.restore();
}

function backdrop(ctx, a) {
  if (a <= 0) return;
  const g = ctx.createLinearGradient(0, 0, 0, 330);
  g.addColorStop(0, `rgba(246,245,241,${0.96 * a})`); g.addColorStop(0.8, `rgba(246,245,241,${0.85 * a})`); g.addColorStop(1, 'rgba(246,245,241,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 330);
}

// ---------- background: dark -> light opening, brand glow ----------
function background(ctx, t) {
  L.background(ctx, t);
  const d = 1 - ep(t, 0.0, 0.85, E.inOutCubic);
  if (d > 0) {
    ctx.save();
    ctx.globalAlpha = d;
    ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(960, 560, 0, 960, 560, 900);
    g.addColorStop(0, 'rgba(255,205,66,0.28)'); g.addColorStop(1, 'rgba(255,205,66,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// headline ink that stays readable while the opening background goes dark -> light
function inkOnOpening(t) {
  const d = 1 - ep(t, 0.0, 0.85, E.inOutCubic);
  const c = Math.round(lerp(31, 255, clamp(d * 1.6 - 0.3)));
  return `rgb(${c},${c},${c})`;
}

// ---------- motion helpers ----------
const freeze = (t) => 1 - ep(t, T.freeze - 0.06, T.freeze + 0.08);     // out-of-sync drift stops on the question
const driftOf = (i, t) => {
  const k = freeze(t) * (1 - ep(t, T.align[0], T.align[0] + 0.2));
  return {
    dx: 8 * Math.sin(t * (1.6 + i * 0.37) + i * 1.9) * k,
    dy: 7 * Math.cos(t * (1.3 + i * 0.29) + i * 2.4) * k,
    scroll: 10 * Math.sin(t * (2.0 + i * 0.55) + i) * k,
  };
};
const panOf = (i, t) => 1920 * ep(t, T.wipe + i * 0.05, T.wipe + 0.6 + i * 0.05, E.inOutCubic);

// z-order in scene 2: each cursor click brings one calendar to the front
function orderAt(t) {
  const order = [0, 1, 2, 3];
  [[T.clicks[0], 0], [T.clicks[1], 2], [T.clicks[2], 1]].forEach(([tc, w]) => {
    if (t >= tc) { order.splice(order.indexOf(w), 1); order.push(w); }
  });
  return order;
}
const CLICK_PTS = [[330, 360], [470, 760], [560, 455]]; // visible corners of windows 0, 2, 1

// ---------- camera (layer -> screen) for the unified calendar ----------
const ID = { z: 1, cx: 960, cy: 640, sx: 960, sy: 640 };
const KEYS = [ // [time, z, cx, cy, ease]; consecutive keys interpolate, the last one holds
  [T.heroLand, 1, 960, 640, E.inOutCubic], [T.zoom[0], 1.03, 960, 640, E.inOutCubic],   // slow settle push
  [T.zoom[1], 1.32, 850, 655, (v) => v], [T.toHero[0], 1.32, 1075, 655, E.inOutCubic],  // near-linear pan
  [T.toHero[1], 1.4, 1150, 660, E.inOutCubic], [T.drop + 0.3, 1.4, 1150, 660, E.inOutCubic],
  [T.endMove[0], 1.43, 1150, 660, E.inOutCubic],                                         // keeps drifting
];
function camera(t) {
  let z = 1, cx = 960, cy = 640;
  if (t >= KEYS[0][0]) {
    const i = KEYS.findIndex((k, j) => !KEYS[j + 1] || t < KEYS[j + 1][0]);
    const [t0, z0, x0, y0, ease] = KEYS[i];
    const nx = KEYS[i + 1];
    if (!nx) { z = z0; cx = x0; cy = y0; } else {
      const p = ease(clamp((t - t0) / (nx[0] - t0)));
      z = lerp(z0, nx[1], p); cx = lerp(x0, nx[2], p); cy = lerp(y0, nx[3], p);
    }
  }
  // end: the calendar scales down into the end-card panel
  const e = ep(t, ...T.endMove, E.inOutCubic);
  const P = endPanel();
  return {
    z: lerp(z, P.z, e), cx: lerp(cx, U.x + U.w / 2, e), cy: lerp(cy, U.y + U.h / 2, e),
    sx: lerp(960, P.sx, e), sy: lerp(640, P.sy, e),
  };
}
const applyCam = (ctx, k) => { ctx.translate(k.sx, k.sy); ctx.scale(k.z, k.z); ctx.translate(-k.cx, -k.cy); };
const toScreen = (k, x, y) => ({ x: (x - k.cx) * k.z + k.sx, y: (y - k.cy) * k.z + k.sy });

// ---------- end card layout ----------
const END_LINE = ['BRING YOUR CLIENT', 'SCHEDULES INTO VIEW.'];
const END_CTA = 'START YOUR RECURPOST TRIAL';
function endPanel() { const z = 0.4; return { z, sx: 1730 - (U.w * z) / 2, sy: 540 }; }

// ---------- the hero card ----------
function heroScreen(t) {
  // scene 1-2 positions in screen space (before it joins the calendar layer)
  const big = { w: 300, h: 300 / ASPECT };
  const small = { w: 170, h: 170 / ASPECT };
  const appear = ep(t, T.heroIn, T.heroIn + 0.45, E.outQuint);
  const p1 = ep(t, 0.45, T.heroBehind[0], E.inOutCubic);            // toward a slot in Client 2
  const w2 = cellWin(A_WIN[1], 3);
  const p2 = ep(t, T.heroBehind[0], T.heroBehind[1], E.inOutCubic); // behind Client 2, out on Client 4
  const w4 = cellWin(A_WIN[3], 5);
  const pw = ep(t, T.wipe, T.wipe + 0.65, E.inOutCubic);            // rides the pan to scene 2
  const bpos = { x: 1135, y: 620 };
  let x = 960, y = 560, w = big.w, h = big.h;
  x = lerp(x, w2.x + w2.w / 2, p1); y = lerp(y, w2.y + w2.h / 2, p1);
  w = lerp(w, small.w, p1); h = lerp(h, small.h, p1);
  x = lerp(x, w4.x + w4.w / 2 - 60, p2); y = lerp(y, w4.y + w4.h / 2, p2);
  const d4 = driftOf(3, t);
  x += d4.dx * p2; y += d4.dy * p2;
  x = lerp(x, bpos.x, pw); y = lerp(y, bpos.y, pw);
  const sB = 230 / small.w;
  w *= lerp(1, sB, pw); h *= lerp(1, sB, pw);
  return { x, y, w: w * (0.85 + 0.15 * appear), h: h * (0.85 + 0.15 * appear), a: clamp(appear * 1.5) };
}
const heroBehind = (t) => t > T.heroBehind[0] + 0.12 && t < T.heroBehind[1] - 0.04;

// hero in calendar-layer coordinates (from the align beat onward)
function heroLayer(t) {
  const s = heroScreen(Math.min(t, T.align[0]));
  const a = cellU(HERO.row, HERO.from), b = cellU(HERO.row, HERO.to);
  const p = ep(t, T.align[0], T.heroLand, E.inOutQuart);
  const arc = Math.sin(Math.PI * p) * 60;
  let x = lerp(s.x, a.x + a.w / 2, p), y = lerp(s.y, a.y + a.h / 2, p) - arc;
  let w = lerp(s.w, a.w, p), h = lerp(s.h, a.h, p);
  let lift = Math.sin(Math.PI * p) * 0.8;
  // drag Thursday -> Friday
  const g = ep(t, T.grab, T.grab + 0.14, E.outCubic) * (1 - ep(t, T.drop, T.drop + 0.16, E.outCubic));
  const d = ep(t, T.grab + 0.15, T.drop - 0.02, E.inOutCubic);
  x = lerp(x, b.x + b.w / 2, d); y -= 10 * g;
  const settle = Math.sin(Math.PI * ep(t, T.drop, T.drop + 0.22)) * 0.04;
  const s2 = 1 + 0.08 * g - settle;
  w *= s2; h *= s2; lift = Math.max(lift, g);
  return { x, y, w, h, lift };
}

// ---------- scenes ----------
function scene12(ctx, t) {
  // scene 1 windows (2x2), then the pan, then scene 2 overlapping windows
  const winA = (i) => {
    const q = ep(t, T.winIn + i * 0.08, T.winIn + i * 0.08 + 0.45, E.outQuint);
    if (q <= 0) return null;
    const [fx, fy] = ENTER_FROM[i];
    const d = driftOf(i, t), r = A_WIN[i];
    return { rect: { ...r, x: r.x + fx * 260 * (1 - q) + d.dx - panOf(i, t), y: r.y + fy * 160 * (1 - q) + d.dy }, a: clamp(q * 1.6), scroll: d.scroll };
  };
  const winB = (i) => {
    const d = driftOf(i, t), r = B_WIN[i];
    return { rect: { ...r, x: r.x + 1920 - panOf(i, t) + d.dx, y: r.y + d.dy }, a: 1, scroll: d.scroll };
  };
  const hs = heroScreen(t);
  const drawHero = () => postCard(ctx, hs.x - hs.w / 2, hs.y - hs.h / 2, hs.w, hs.h, { client: HERO.row, variant: HERO.variant, hero: true, lift: 0.7 });
  ctx.save(); ctx.globalAlpha = hs.a;
  if (heroBehind(t)) drawHero();
  ctx.restore();
  const order = orderAt(t);
  for (const i of order) {
    if (t < T.wipe + 0.85) { const A = winA(i); if (A && A.rect.x + A.rect.w > -50) { ctx.save(); ctx.globalAlpha = A.a; clientWindow(ctx, i, A.rect, t, { scroll: A.scroll }); ctx.restore(); } }
    if (t > T.wipe) { const B = winB(i); if (B.rect.x < W + 50) clientWindow(ctx, i, B.rect, t, { scroll: B.scroll }); }
  }
  if (!heroBehind(t)) {
    ctx.save(); ctx.globalAlpha = hs.a;
    const pop = Math.sin(Math.PI * ep(t, T.heroBehind[1] - 0.04, T.heroBehind[1] + 0.2)) * 0.08;
    ctx.translate(hs.x, hs.y); ctx.scale(1 + pop, 1 + pop); ctx.translate(-hs.x, -hs.y);
    drawHero();
    ctx.restore();
  }
}

function message(ctx, t) {
  const p = ep(t, T.notif, T.notif + 0.32, (v) => E.outBack(v, 1.5));
  const out = ep(t, T.align[0], T.align[0] + 0.22, E.inOutCubic);
  if (p <= 0 || out >= 1) return;
  const text = 'Is Thursday’s post ready?';
  ctx.save();
  ctx.font = font(700, 44);
  const bw = ctx.measureText(text).width + 150, bh = 116;
  const x = 1720 - bw, y = 420;
  const s = (0.7 + 0.3 * p) * (1 - 0.15 * out);
  ctx.globalAlpha = clamp(ep(t, T.notif, T.notif + 0.12) - out);
  ctx.translate(x + 40, y + bh / 2); ctx.scale(s, s); ctx.translate(-40, -bh / 2);
  shadowed(ctx, 40, 14, 0.16, () => fillRR(ctx, 0, 0, bw, bh, 30, C.surface));
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(62, bh / 2, 34, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(62, bh / 2, 34, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(62, bh / 2 - 8, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(62, bh / 2 + 26, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 116, bh / 2 + 2);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(bw - 28, 28, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function searchCursor(ctx, t) {
  const a = ep(t, T.clicks[0] - 0.3, T.clicks[0] - 0.15) * (1 - ep(t, T.align[0], T.align[0] + 0.15));
  if (a <= 0) return;
  const keys = [[T.clicks[0] - 0.3, 1500, 980], ...T.clicks.flatMap((tc, i) => [[tc - 0.05, ...CLICK_PTS[i]], [tc + 0.05, ...CLICK_PTS[i]]]), [T.freeze - 0.1, 760, 600]];
  let x = keys[0][1], y = keys[0][2];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
    if (t >= t0) { const p = E.inOutCubic(clamp((t - t0) / (t1 - t0))); x = lerp(x0, x1, p); y = lerp(y0, y1, p); }
  }
  const press = Math.max(0, ...T.clicks.map((tc) => 1 - Math.abs(t - tc) / 0.07));
  ctx.save(); ctx.globalAlpha = a; cursor(ctx, x, y, 1 - 0.12 * press); ctx.restore();
}

function calendarLayer(ctx, t) {
  const k = camera(t);
  ctx.save();
  applyCam(ctx, k);
  const m = ep(t, ...T.align, E.inOutQuart);
  calendarFrame(ctx, t, ep(m, 0.45, 1));
  const badgeA = (r, c) => ep(t, T.badges + c * 0.04 + r * 0.03, T.badges + c * 0.04 + r * 0.03 + 0.25);
  const dropTarget = ep(t, T.grab + 0.1, T.grab + 0.3) * (1 - ep(t, T.drop + 0.3, T.drop + 0.7));
  for (const i of orderAt(t)) {
    const d = driftOf(i, t), r = B_WIN[i];
    const rect = { ...r, x: r.x + d.dx, y: r.y + d.dy };
    clientWindow(ctx, i, rect, t, { m, scroll: d.scroll, statusA: badgeA });
  }
  // drop target for the move (Friday)
  if (dropTarget > 0) {
    const b = cellU(HERO.row, HERO.to);
    ctx.save(); ctx.globalAlpha = dropTarget;
    rr(ctx, b.x - 4, b.y - 4, b.w + 8, b.h + 8, 16); ctx.fillStyle = 'rgba(255,205,66,0.18)'; ctx.fill();
    ctx.setLineDash([10, 8]); ctx.strokeStyle = '#F2B705'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  const h = heroLayer(t);
  postCard(ctx, h.x - h.w / 2, h.y - h.h / 2, h.w, h.h, {
    client: HERO.row, variant: HERO.variant, hero: true, lift: h.lift, status: HERO.status, statusA: badgeA(HERO.row, HERO.from),
  });
  ctx.restore();
  return k;
}

// status tags: large while spoken, then they settle as small tags on their cards
function tags(ctx, t, k) {
  const out = ep(t, T.toHero[0], T.toHero[0] + 0.3);
  if (out >= 1) return;
  for (const g of TAGS) {
    const p = ep(t, g.t, g.t + 0.28, (v) => E.outBack(v, 1.6));
    if (p <= 0) continue;
    const small = ep(t, g.t + 0.62, g.t + 0.9, E.inOutCubic);
    const cell = cellU(...g.rc);
    const s = toScreen(k, cell.x + cell.w / 2, g.below ? cell.y + cell.h : cell.y);
    const sc = p * lerp(1, 0.58, small);
    ctx.save();
    ctx.globalAlpha = clamp(p * 2) * (1 - out);
    ctx.font = font(800, 42);
    const tw = ctx.measureText(ST[g.k].label).width;
    const pw = tw + 104, ph = 74;
    const half = (pw / 2) * sc, cxT = clamp(s.x, 192 + half, 1728 - half), off = (s.x - cxT) / Math.max(sc, 1e-3);
    // tags sit above their card; "below" tags hang under it so neighbouring tags never overlap
    if (g.below) { ctx.translate(cxT, s.y + 14); ctx.scale(sc, sc); ctx.translate(-pw / 2, 0); }
    else { ctx.translate(cxT, s.y - 14); ctx.scale(sc, sc); ctx.translate(-pw / 2, -ph); }
    shadowed(ctx, 26, 10, 0.18, () => fillRR(ctx, 0, 0, pw, ph, ph / 2, ST[g.k].col));
    if (g.k === 'D') { rr(ctx, 1.5, 1.5, pw - 3, ph - 3, ph / 2); ctx.setLineDash([10, 7]); ctx.strokeStyle = '#8F8A7E'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]); }
    // pointer into the card
    const py = g.below ? 1 : ph - 1, tip = g.below ? -12 : ph + 12;
    ctx.fillStyle = ST[g.k].col; ctx.beginPath(); ctx.moveTo(pw / 2 + off - 12, py); ctx.lineTo(pw / 2 + off + 12, py); ctx.lineTo(pw / 2 + off, tip); ctx.fill();
    const bc = g.k === 'S' ? C.ink : g.k === 'P' ? C.yellow : g.k === 'D' ? '#8F8A7E' : '#FFFFFF';
    if (g.k === 'S') clockIcon(ctx, 40, ph / 2, 14, bc);
    if (g.k === 'P') checkIcon(ctx, 40, ph / 2, 30, bc);
    if (g.k === 'D') { ctx.setLineDash([6, 5]); ctx.strokeStyle = bc; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(40, ph / 2, 13, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    if (g.k === 'F') exclaim(ctx, 40, ph / 2 + 2, 30, bc);
    ctx.fillStyle = ST[g.k].text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(ST[g.k].label, 70, ph / 2 + 2);
    ctx.restore();
  }
}

function dragCursor(ctx, t, k) {
  const a = ep(t, T.grab - 0.5, T.grab - 0.35) * (1 - ep(t, T.drop + 0.35, T.drop + 0.6));
  if (a <= 0) return;
  const h = heroLayer(t);
  const grabPt = toScreen(k, h.x + h.w * 0.12, h.y + h.h * 0.1);
  const come = ep(t, T.grab - 0.5, T.grab - 0.04, E.inOutCubic);
  const leave = ep(t, T.drop + 0.12, T.drop + 0.6, E.inOutCubic);
  const x = lerp(lerp(1560, grabPt.x, come), grabPt.x + 120, leave), y = lerp(lerp(1000, grabPt.y, come), grabPt.y + 160, leave);
  const press = (t > T.grab && t < T.drop) ? 1 : Math.max(0, 1 - Math.abs(t - T.grab) / 0.07);
  ctx.save(); ctx.globalAlpha = a; cursor(ctx, x, y, 1 - 0.1 * press); ctx.restore();
}

function endCard(ctx, t) {
  const t0 = T.endIn;
  const LOGO = getLogo();
  const colX = 192, colW = 900;
  const lh = 92, lw = lh * LOGO.width / LOGO.height;
  ctx.save();
  ctx.font = font(800, 62);
  const lineH = 76;
  let ctaFs = 46;
  ctx.font = font(800, ctaFs); ctx.letterSpacing = '1px';
  while (ctx.measureText(END_CTA).width + 100 > colW && ctaFs > 36) { ctaFs -= 1; ctx.font = font(800, ctaFs); }
  const ctaW = ctx.measureText(END_CTA).width + 100, ctaH = Math.round(ctaFs * 2.3);
  const total = lh + 58 + lineH * 2 + 46 + ctaH;
  let y = 540 - total / 2;
  // logo
  const lp = ep(t, t0, t0 + 0.4, E.outQuint);
  ctx.globalAlpha = lp;
  ctx.drawImage(LOGO, colX, y + 20 * (1 - lp), lw, lh);
  y += lh + 58;
  // line
  ctx.letterSpacing = '0px';
  ctx.font = font(800, 62); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  END_LINE.forEach((s, j) => {
    ctx.globalAlpha = 1;
    const p = ep(t, t0 + 0.12 + j * 0.08, t0 + 0.48 + j * 0.08, E.outQuint);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y + j * lineH - 6, W, lineH + 4); ctx.clip();
    ctx.fillText(s, colX, y + j * lineH + 58 + 70 * (1 - p));
    ctx.restore();
  });
  y += lineH * 2 + 46;
  // CTA
  const cp = ep(t, t0 + 0.32, t0 + 0.7, (v) => E.outBack(v, 1.2));
  ctx.globalAlpha = ep(t, t0 + 0.32, t0 + 0.5);
  ctx.translate(colX + ctaW / 2, y + ctaH / 2); ctx.scale(0.88 + 0.12 * cp, 0.88 + 0.12 * cp); ctx.translate(-ctaW / 2, -ctaH / 2);
  shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, 0, 0, ctaW, ctaH, ctaH / 2, C.yellow));
  ctx.font = font(800, ctaFs); ctx.letterSpacing = '1px';
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(END_CTA, ctaW / 2, ctaH / 2 + ctaFs * 0.04);
  ctx.restore();
}

// ---------- frame ----------
function renderAt(ctx, t) {
  background(ctx, t);
  if (t < T.align[0]) {
    scene12(ctx, t);
    message(ctx, t);
    searchCursor(ctx, t);
  } else {
    // the calendars keep their scene-2 z-order as they line up
    const k = calendarLayer(ctx, t);
    message(ctx, t);
    tags(ctx, t, k);
    dragCursor(ctx, t, k);
  }
  const zoomed = ep(t, T.zoom[0], T.zoom[1]) * (1 - ep(t, T.endMove[0], T.endMove[0] + 0.4));
  backdrop(ctx, Math.max(zoomed, ep(t, 0.4, 0.8) * (1 - ep(t, T.align[0], T.align[0] + 0.5))));
  headline(ctx, t, ['MULTIPLE CLIENTS.', 'MULTIPLE CALENDARS.'], -0.1, T.wipe + 0.05, {
    band: 1, color: (tt, j) => (j === 1 ? C.ink : inkOnOpening(tt)),
  });
  headline(ctx, t, ['WHERE’S THE FULL SCHEDULE?'], T.freeze, T.align[0], { band: 0 });
  headline(ctx, t, ['CLIENT POSTS.', 'ONE CALENDAR VIEW.'], 5.12, 8.55, { band: 1 });
  headline(ctx, t, ['SEE POST STATUS AT A GLANCE'], 8.9, 12.85, { band: 0 });
  headline(ctx, t, ['MOVE POSTS.', 'KEEP THE PLAN IN VIEW.'], 13.08, T.endMove[0] - 0.15, { band: 1 });
  if (t >= T.endIn) endCard(ctx, t);
}

module.exports = { TL, renderAt, mainScene: renderAt };
