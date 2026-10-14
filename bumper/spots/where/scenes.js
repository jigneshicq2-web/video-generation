// Video 2, "Where's the post?": scattered updates -> one calendar that shows every post's status.
// The only words on screen are the brief's: the headline, the client message, the four status
// labels and the end card. Everything else is abstract shapes.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, CLIENT, VARIANTS, font, clamp, lerp, E, ep, rr, fillRR, shadowed,
  clockIcon, checkIcon, background, thumb, cardShell, riseText } = L;
const T = TL.T;

// Status colours. Yellow and charcoal are the brand; red is a functional accent used for one
// failed post only, so a failure reads as a status the team can see, not as the story.
const ST = {
  S: { label: 'Scheduled', col: C.yellow },
  P: { label: 'Published', col: C.ink },
  D: { label: 'Drafts', col: C.gray2 },
  F: { label: 'Failed', col: '#E5484D' },
};

// ---------- layout ----------
const WIN = { x: 250, y: 344, w: 1420, h: 612 };
const SIDE = 232, TOP = 80, HEAD = 40;
const GX = WIN.x + SIDE, GY = WIN.y + TOP + HEAD, COLS = 7, ROWS = 4;
const COLW = (WIN.w - SIDE - 18) / COLS, ROWH = (WIN.h - TOP - HEAD - 16) / ROWS;
const cellRect = (r, c) => ({ x: GX + c * COLW + 9, y: GY + r * ROWH + 10, w: COLW - 18, h: ROWH - 20 });

// Calendar contents: P published, S scheduled, D draft, F failed, . empty
const GRID = ['P.PS.SD', 'PF.SS.D', '.P.PSS.', 'PP.S.DS'];
// Scene-1 cards and where each one lands (card 4 sits next to the message and is the post we find)
const CARDS = [
  { x: 330, y: 700, rot: -7, to: [0, 0] },
  { x: 560, y: 770, rot: 5, to: [3, 1] },
  { x: 790, y: 680, rot: -3, to: [1, 3] },
  { x: 1010, y: 775, rot: 6, to: [0, 3] },
  { x: 1235, y: 700, rot: -4, to: [2, 4] },
];
const HL = CARDS[4].to;
const CARD_W = 190, CARD_H = 278;
const WIDGET = { x: 1545, y: 790, w: 300, h: 236, rot: 4 };
const BUBBLE = { x: 1160, y: 408, w: 548, h: 124 };

// ---------- small parts ----------
function exclaim(ctx, cx, cy, s, col) {
  ctx.save();
  ctx.fillStyle = col;
  fillRR(ctx, cx - s * 0.09, cy - s * 0.42, s * 0.18, s * 0.5, s * 0.09, col);
  ctx.beginPath(); ctx.arc(cx, cy + s * 0.32, s * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Status badge: Scheduled = yellow clock, Published = charcoal check, Drafts = dashed ring, Failed = red "!"
function badge(ctx, k, cx, cy, r) {
  ctx.save();
  if (k === 'D') {
    ctx.setLineDash([r * 0.42, r * 0.32]); ctx.lineWidth = r * 0.2; ctx.strokeStyle = '#A9A59A';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.fillStyle = ST[k].col;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    if (k === 'S') clockIcon(ctx, cx, cy, r * 0.48, C.ink);
    if (k === 'P') checkIcon(ctx, cx, cy, r * 0.95, '#FFFFFF');
    if (k === 'F') exclaim(ctx, cx, cy, r * 1.05, '#FFFFFF');
  }
  ctx.restore();
}

// Scene-1 post card (no status yet: that is the point).
function postCard(ctx, w, h, i) {
  const v = VARIANTS[i % VARIANTS.length];
  const k = w / 260;
  ctx.save(); ctx.scale(k, k);
  const cw = 260, ch = h / k;
  ctx.fillStyle = CLIENT[i % CLIENT.length];
  ctx.beginPath(); ctx.arc(34, 34, 15, 0, Math.PI * 2); ctx.fill();
  fillRR(ctx, 58, 24, 112, 10, 5, C.gray);
  fillRR(ctx, 58, 40, 72, 8, 4, C.line);
  thumb(ctx, 18, 64, cw - 36, 150, 14, v);
  fillRR(ctx, 18, 234, cw - 52, 10, 5, C.gray);
  fillRR(ctx, 18, 254, cw - 96, 10, 5, C.gray);
  fillRR(ctx, 18, 274, cw - 74, 10, 5, C.line);
  ctx.fillStyle = C.line; ctx.fillRect(18, ch - 56, cw - 36, 2);
  fillRR(ctx, 18, ch - 34, 96, 12, 6, C.line);
  ctx.restore();
}

// Calendar slot card with its status.
function slotCard(ctx, w, h, k, i) {
  const v = VARIANTS[i % VARIANTS.length];
  const draft = k === 'D';
  ctx.save();
  ctx.save(); rr(ctx, 0, 0, w, h, 12); ctx.clip();
  ctx.fillStyle = ST[k].col; ctx.fillRect(0, 0, 6, h);
  ctx.restore();
  ctx.globalAlpha *= draft ? 0.55 : 1;
  const th = h - 24;
  thumb(ctx, 16, 12, th, th, 8, v);
  const bx = 16 + th + 12, bw = w - bx - 12;
  fillRR(ctx, bx, 16, bw - 28, 9, 4.5, C.gray);
  fillRR(ctx, bx, 33, bw * 0.62, 9, 4.5, C.line);
  ctx.globalAlpha /= draft ? 0.55 : 1;
  badge(ctx, k, w - 22, h - 22, 13);
  ctx.restore();
}

function slotShell(ctx, w, h, k, lift) {
  if (k === 'D') {
    ctx.save();
    rr(ctx, 0, 0, w, h, 12); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
    ctx.setLineDash([8, 6]); ctx.strokeStyle = C.gray2; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  } else cardShell(ctx, 0, 0, w, h, 12, lift);
}

// ---------- Scene 1 ----------
function headline1(ctx, t) {
  const out = ep(t, ...T.headlineOut, E.inOutCubic);
  if (out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(0, -50 * out);
  ctx.font = font(800, 100); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.ink;
  riseText(ctx, 'CLIENT ASKING:', W / 2, 212, ep(t, -0.14, 0.22, E.outQuint));
  riseText(ctx, '‘WHERE’S THE POST?’', W / 2, 322, ep(t, -0.07, 0.29, E.outQuint));
  ctx.restore();
}

// gentle independent drift: the content is "out there" but hard to pin down
const drift = (i, t) => ({ dx: 7 * Math.sin(t * 2.1 + i * 1.7), dy: 6 * Math.cos(t * 1.7 + i * 2.3), dr: 0.9 * Math.sin(t * 1.3 + i) });

function scatterCard(ctx, i, t) {
  const c = CARDS[i];
  const p = ep(t, T.cardsIn + i * 0.09, T.cardsIn + i * 0.09 + 0.42, E.outQuint);
  if (p <= 0) return;
  const d = drift(i, t);
  const fromX = c.x + (c.x - W / 2) * 0.35, fromY = c.y + 160;
  ctx.save();
  ctx.globalAlpha = clamp(p * 1.6);
  ctx.translate(lerp(fromX, c.x, p) + d.dx, lerp(fromY, c.y, p) + d.dy);
  ctx.rotate(((c.rot + d.dr) * Math.PI) / 180 * (0.4 + 0.6 * p));
  ctx.translate(-CARD_W / 2, -CARD_H / 2);
  cardShell(ctx, 0, 0, CARD_W, CARD_H, 20, 0.8);
  postCard(ctx, CARD_W, CARD_H, i);
  ctx.restore();
}

function widgetContent(ctx, w, h, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  fillRR(ctx, 18, 18, w * 0.42, 12, 6, C.gray);
  const gx = 18, gy = 46, cw = (w - 36) / 5, ch = (h - 64) / 4;
  const on = ['10110', '01101', '11010', '01011'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    fillRR(ctx, gx + c * cw + 4, gy + r * ch + 4, cw - 8, ch - 8, 6, on[r][c] === '1' ? (c % 2 ? C.yTint2 : C.gray) : '#F3F1EC');
  }
  ctx.restore();
}

function notification(ctx, t) {
  const p = ep(t, T.notif, T.notif + 0.32, (v) => E.outBack(v, 1.5));
  const out = ep(t, ...T.notifOut, E.inOutCubic);
  if (p <= 0 || out >= 1) return;
  const b = BUBBLE;
  const s = (0.7 + 0.3 * p) * (1 - 0.15 * out);
  ctx.save();
  ctx.globalAlpha = clamp(ep(t, T.notif, T.notif + 0.12) - out);
  ctx.translate(b.x + 40, b.y + b.h / 2 - 30 * out); ctx.scale(s, s); ctx.translate(-40, -b.h / 2);
  shadowed(ctx, 40, 14, 0.16, () => fillRR(ctx, 0, 0, b.w, b.h, 30, C.surface));
  // avatar: generic person glyph, no initials
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(64, b.h / 2, 34, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(64, b.h / 2, 34, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(64, b.h / 2 - 8, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(64, b.h / 2 + 26, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.ink; ctx.font = font(700, 46); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Where’s the post?', 120, b.h / 2 + 2);
  // unread dot
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(b.w - 30, 30, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Scene 2 ----------
function morphRect(t) {
  const p = ep(t, ...T.morph, E.inOutQuart);
  const wg = WIDGET;
  return {
    p,
    x: lerp(wg.x - wg.w / 2, WIN.x, p), y: lerp(wg.y - wg.h / 2, WIN.y, p),
    w: lerp(wg.w, WIN.w, p), h: lerp(wg.h, WIN.h, p), rot: (wg.rot * Math.PI / 180) * (1 - p),
  };
}

// The scene-1 calendar widget, which opens into the full calendar.
function calendar(ctx, t) {
  const pin = ep(t, T.cardsIn + 0.3, T.cardsIn + 0.75, E.outQuint);
  if (pin <= 0) return;
  const m = morphRect(t);
  const d = drift(7, t);
  const k = 1 - m.p;
  ctx.save();
  ctx.globalAlpha = clamp(pin * 1.6);
  ctx.translate(m.x + m.w / 2 + d.dx * k, m.y + m.h / 2 + d.dy * k + 140 * (1 - pin));
  ctx.rotate(m.rot + (d.dr * Math.PI / 180) * k);
  ctx.translate(-m.w / 2, -m.h / 2);
  shadowed(ctx, lerp(36, 70, m.p), lerp(14, 26, m.p), lerp(0.14, 0.16, m.p), () => fillRR(ctx, 0, 0, m.w, m.h, lerp(20, 26, m.p), C.surface));
  widgetContent(ctx, m.w, m.h, 1 - ep(m.p, 0, 0.35));
  windowContent(ctx, t, m.w, m.h, ep(m.p, 0.45, 1));
  ctx.restore();
}

function windowContent(ctx, t, w, h, a) {
  if (a <= 0) return;
  const x = 0, y = 0;
  ctx.save();
  ctx.globalAlpha *= a;
  rr(ctx, 0, 0, w, h, 26); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(0, 0, w, TOP);
  ctx.fillStyle = C.line; ctx.fillRect(0, TOP - 1, w, 1.5);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = C.gray; ctx.beginPath(); ctx.arc(32 + i * 22, TOP / 2, 7, 0, Math.PI * 2); ctx.fill(); }
  // sidebar: client profiles
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(0, TOP, SIDE, h - TOP);
  ctx.fillStyle = C.line; ctx.fillRect(SIDE - 1, TOP, 1.5, h - TOP);
  for (let r = 0; r < ROWS; r++) {
    const ry = GY - WIN.y + r * ROWH + ROWH / 2;
    ctx.fillStyle = CLIENT[r];
    ctx.beginPath(); ctx.arc(46, ry, 19, 0, Math.PI * 2); ctx.fill();
    fillRR(ctx, 78, ry - 12, 116 - r * 10, 11, 5.5, C.gray);
    fillRR(ctx, 78, ry + 6, 68, 9, 4.5, C.line);
  }
  const gx = GX - WIN.x, gy = GY - WIN.y;
  for (let c = 0; c < COLS; c++) fillRR(ctx, gx + c * COLW + COLW / 2 - 26, TOP + 15, 52, 10, 5, C.gray);
  ctx.fillStyle = C.line;
  for (let c = 1; c < COLS; c++) ctx.fillRect(gx + c * COLW, gy, 1.2, ROWS * ROWH);
  for (let r = 0; r <= ROWS; r++) ctx.fillRect(gx, gy + r * ROWH, COLS * COLW, 1.2);
  ctx.restore();
}

// Legend chips in the window's top bar: the four status labels, the only UI words.
function chips(ctx, t) {
  const keys = ['S', 'P', 'D', 'F'];
  ctx.save();
  ctx.font = font(700, 30); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const ws = keys.map((k) => ctx.measureText(ST[k].label).width + 82);
  const gap = 16, total = ws.reduce((a, b) => a + b, 0) + gap * 3;
  let x = WIN.x + WIN.w - 24 - total;
  const y = WIN.y + 16, h = 48;
  keys.forEach((k, i) => {
    const q = ep(t, T.chips + i * 0.07, T.chips + i * 0.07 + 0.3, (v) => E.outBack(v, 1.3));
    if (q > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(q * 2);
      ctx.translate(x + ws[i] / 2, y + h / 2); ctx.scale(0.8 + 0.2 * q, 0.8 + 0.2 * q); ctx.translate(-ws[i] / 2, -h / 2);
      fillRR(ctx, 0, 0, ws[i], h, h / 2, C.surface);
      rr(ctx, 0, 0, ws[i], h, h / 2); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
      badge(ctx, k, 28, h / 2, 13);
      ctx.fillStyle = C.ink; ctx.fillText(ST[k].label, 52, h / 2 + 1);
      ctx.restore();
    }
    x += ws[i] + gap;
  });
  ctx.restore();
}

const SWEPT = new Set(CARDS.map((c) => c.to.join(',')));
const FILL = [];
GRID.forEach((row, r) => [...row].forEach((k, c) => {
  if (k !== '.' && !SWEPT.has(`${r},${c}`)) FILL.push({ r, c, k, d: T.fill + c * 0.04 + r * 0.05 });
}));

function filledCells(ctx, t, skip) {
  for (const f of FILL) {
    const a = ep(t, f.d, f.d + 0.1);
    if (a <= 0) continue;
    const q = ep(t, f.d, f.d + 0.24, (v) => E.outBack(v, 1.5));
    const cr = cellRect(f.r, f.c);
    const s = 0.6 + 0.4 * q;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cr.x + cr.w / 2, cr.y + cr.h / 2); ctx.scale(s, s); ctx.translate(-cr.w / 2, -cr.h / 2);
    slotShell(ctx, cr.w, cr.h, f.k, 0.15);
    slotCard(ctx, cr.w, cr.h, f.k, f.r * 7 + f.c);
    ctx.restore();
  }
}

// Scene-1 cards fly from where they were scattered into their calendar slots.
function sweptCard(ctx, i, t, extraScale = 1) {
  const c = CARDS[i];
  const t0 = T.sweep[0] + i * 0.05;
  const p = ep(t, t0, t0 + 0.5, E.inOutQuart);
  const [r, col] = c.to;
  const k = GRID[r][col];
  const b = cellRect(r, col);
  const d = drift(i, t);
  const arc = Math.sin(Math.PI * p);
  const w = lerp(CARD_W, b.w, p), h = lerp(CARD_H, b.h, p);
  const cx = lerp(c.x + d.dx, b.x + b.w / 2, p), cy = lerp(c.y + d.dy, b.y + b.h / 2, p) - 60 * arc;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((c.rot + d.dr) * Math.PI / 180) * (1 - p));
  ctx.scale(extraScale, extraScale);
  ctx.translate(-w / 2, -h / 2);
  if (p < 1 || k !== 'D') cardShell(ctx, 0, 0, w, h, lerp(20, 12, p), lerp(0.8, 0.15, p) + arc * 0.6);
  ctx.save(); rr(ctx, 0, 0, w, h, lerp(20, 12, p)); ctx.clip();
  if (p < 0.55) {
    const s = Math.min(w / CARD_W, h / CARD_H);
    ctx.save(); ctx.globalAlpha *= 1 - ep(p, 0.15, 0.55);
    ctx.translate((w - CARD_W * s) / 2, (h - CARD_H * s) / 2); ctx.scale(s, s);
    postCard(ctx, CARD_W, CARD_H, i);
    ctx.restore();
  }
  ctx.restore();
  if (p > 0.3) {
    const s = Math.min(w / b.w, h / b.h);
    ctx.save(); ctx.globalAlpha *= ep(p, 0.3, 0.75);
    ctx.translate((w - b.w * s) / 2, (h - b.h * s) / 2); ctx.scale(s, s);
    slotCard(ctx, b.w, b.h, k, i);
    ctx.restore();
  }
  ctx.restore();
}

// Camera: a slow push toward the post we locate.
function camera(ctx, t) {
  const z = 1 + 0.045 * ep(t, T.highlight[0] - 0.05, 3.8, E.inOutCubic);
  const h = cellRect(...HL);
  const ax = h.x + h.w / 2, ay = h.y + h.h / 2;
  ctx.translate(ax, ay); ctx.scale(z, z); ctx.translate(-ax, -ay);
}

function highlight(ctx, t) {
  const p = ep(t, ...T.highlight, E.outCubic);
  if (p <= 0) return;
  // everything else steps back so the located post reads instantly
  ctx.save();
  ctx.globalAlpha = 0.55 * p;
  ctx.fillStyle = C.bg;
  rr(ctx, GX, GY, COLS * COLW, ROWS * ROWH, 0); ctx.fill();
  ctx.restore();
  const b = cellRect(...HL);
  const ring = 1 - ep(t, T.highlight[0] + 0.1, T.highlight[0] + 0.6);
  const s = 1 + 0.16 * ep(t, T.highlight[0], T.highlight[1], (v) => E.outBack(v, 1.6));
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(s, s); ctx.translate(-b.w / 2, -b.h / 2);
  shadowed(ctx, 36, 14, 0.22 * p, () => fillRR(ctx, -2, -2, b.w + 4, b.h + 4, 14, C.surface));
  slotCard(ctx, b.w, b.h, GRID[HL[0]][HL[1]], 4);
  rr(ctx, -5, -5, b.w + 10, b.h + 10, 16); ctx.strokeStyle = C.yellow; ctx.lineWidth = 5 * p; ctx.stroke();
  if (ring > 0 && ring < 1) {
    ctx.globalAlpha = ring * 0.8;
    rr(ctx, -5 - 26 * (1 - ring), -5 - 26 * (1 - ring), b.w + 10 + 52 * (1 - ring), b.h + 10 + 52 * (1 - ring), 16 + 20 * (1 - ring));
    ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.restore();
}

function headline2(ctx, t) {
  const t0 = T.copy2;
  if (t < t0 - 0.01) return;
  const a = 'KEEP EVERY CLIENT POST ', b = 'IN VIEW';
  ctx.save();
  ctx.font = font(800, 84); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width;
  const x0 = (W - (wa + wb)) / 2, by = 240;
  const band = ep(t, t0 + 0.14, t0 + 0.38, E.outQuint);
  fillRR(ctx, x0 + wa - 8, by - 80, (wb + 30) * band, 100, 12, C.yellow);
  ctx.fillStyle = C.ink;
  riseText(ctx, a + b, x0, by, ep(t, t0, t0 + 0.34, E.outQuint), 100, 100);
  ctx.restore();
}

// ---------- frame ----------
function mainScene(ctx, t) {
  background(ctx, t);
  headline1(ctx, t);
  headline2(ctx, t);
  ctx.save();
  camera(ctx, t);
  calendar(ctx, t);
  if (t >= T.chips) chips(ctx, t);
  filledCells(ctx, t);
  for (let i = 0; i < CARDS.length; i++) {
    if (t < T.sweep[0]) scatterCard(ctx, i, t);
    else sweptCard(ctx, i, t);
  }
  highlight(ctx, t);
  ctx.restore();
  notification(ctx, t);
}

module.exports = { TL, mainScene };
