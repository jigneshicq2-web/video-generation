// Video 1, "Batch schedule": one-at-a-time scheduling -> one bulk action fills the calendar.
const L = require('../../lib');
const TL = require('./timeline');
const { W, C, CLIENT, VARIANTS, font, clamp, lerp, E, ep, rr, fillRR, shadowed,
  clockIcon, checkIcon, stackIcon, cursor, background, thumb, cardShell } = L;

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

module.exports = { TL, mainScene };
