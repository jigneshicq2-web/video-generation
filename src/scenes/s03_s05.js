// Scene 03 (AI creation), Scene 04 (plan + schedule), Scene 05 (evergreen loop).
const L = require('../lib');
const C = require('./common');
const { B, W, H, rr, card, text, ui, disp, hexA, ep, E, prog, lerp, clamp, platformTile, flowLine, sampleCurve, chipRow } = L;
const { fitFont } = require('./s01_s02');

// Shared hand-off geometry: the content card leaves Scene 03 and lands in the
// Scene 04 calendar at WED / 12 PM.
const CAL = { x: 70, y: 560, w: 940, h: 780, gut: 118, head: 150 };
CAL.cw = (CAL.w - 30 - CAL.gut) / 5;
CAL.ch = (CAL.h - CAL.head - 20) / 4;
const slot = (col, row) => [CAL.x + CAL.gut + col * CAL.cw + 6, CAL.y + CAL.head + row * CAL.ch + 6, CAL.cw - 12, CAL.ch - 12];
const LAND = slot(2, 1);

// ---------------- Scene 03: CREATE ----------------
const POST_TEXT = ['Plan a week of content', 'in one sitting. Here is our', 'simple three-step routine.'];

function composer(ctx, t, x, y, w, h) {
  card(ctx, x, y, w, h, { r: 32 });
  text(ctx, 'New post', x + 40, y + 58, { font: ui(700, 34), align: 'left' });
  // AI Assist button
  const bx = x + w - 250, by = y + 30, bw = 214, bh = 58;
  const hot = ep(t, 6.5, 6.6);
  ctx.save();
  ctx.shadowColor = hexA(B.primary, 0.9); ctx.shadowBlur = 20 + 30 * hot;
  rr(ctx, bx, by, bw, bh, 29);
  const g = ctx.createLinearGradient(bx, by, bx + bw, by);
  g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  L.sparkle(ctx, bx + 38, by + bh / 2, 14, '#fff');
  text(ctx, 'AI Assist', bx + 126, by + bh / 2 + 1, { font: ui(700, 28) });
  // divider
  ctx.save(); ctx.fillStyle = B.line; ctx.fillRect(x + 30, y + 112, w - 60, 2); ctx.restore();

  // text area
  const gen = prog(t, 6.62, 7.02);
  if (gen <= 0) {
    text(ctx, 'What do you want to share?', x + 40, y + 170, { font: ui(500, 34), color: B.dim, align: 'left' });
    if (Math.floor(t * 4) % 2 === 0) { ctx.save(); ctx.fillStyle = B.secondary; ctx.fillRect(x + 40, y + 148, 3, 44); ctx.restore(); }
  } else {
    // shimmer sweep while generating
    const total = POST_TEXT.join('').length;
    let shown = Math.floor(gen * total);
    POST_TEXT.forEach((ln, i) => {
      const s = ln.slice(0, Math.max(0, shown));
      shown -= ln.length;
      if (s) text(ctx, s, x + 40, y + 170 + i * 50, { font: ui(600, 36), align: 'left' });
    });
    if (gen < 1) {
      const sx = x + 40 + gen * (w - 80);
      const sg = ctx.createLinearGradient(sx - 120, 0, sx + 40, 0);
      sg.addColorStop(0, hexA(B.secondary, 0)); sg.addColorStop(1, hexA(B.secondary, 0.35));
      ctx.save(); ctx.fillStyle = sg; ctx.fillRect(sx - 120, y + 140, 160, 160); ctx.restore();
    }
    const badge = ep(t, 6.9, 7.1, E.outBack);
    if (badge > 0) {
      ctx.save(); ctx.translate(x + w - 150, y + 330); ctx.scale(badge, badge);
      L.chip(ctx, 'AI generated', 0, 0, { font: ui(700, 22), h: 44, padX: 16, fill: hexA(B.primary, 0.25), stroke: hexA(B.primary, 0.8), track: 1,
        icon: (ix, iy) => L.sparkle(ctx, ix - 2, iy, 11, B.secondary) });
      ctx.restore();
    }
  }
  // media
  const art = ep(t, 6.8, 7.0);
  if (art > 0) { ctx.save(); ctx.globalAlpha = art; C.postArt(ctx, x + 40, y + 370, w - 80, h - 530, 0, 22); ctx.restore(); }
  else { ctx.save(); rr(ctx, x + 40, y + 370, w - 80, h - 530, 22); ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  // platforms row
  text(ctx, 'Post to', x + 40, y + h - 80, { font: ui(600, 26), color: B.muted, align: 'left' });
  ['instagram', 'facebook', 'linkedin', 'tiktok'].forEach((k, i) => {
    const p = ep(t, 6.95 + i * 0.08, 7.15 + i * 0.08, E.outBack);
    const on = p > 0;
    const px = x + 250 + i * 110, py = y + h - 80;
    if (!on) { ctx.save(); rr(ctx, px - 38, py - 38, 76, 76, 20); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); return; }
    ctx.save(); ctx.translate(px, py); ctx.scale(lerp(0.5, 1, p), lerp(0.5, 1, p));
    platformTile(ctx, k, 0, 0, 76);
    ctx.restore();
  });
}

// per-platform previews: the same post adapted to each format
function preview(ctx, k, x, y, w, h, seed) {
  card(ctx, x, y, w, h, { r: 20, shadowBlur: 24 });
  platformTile(ctx, k, x + 34, y + 34, 44);
  C.lines(ctx, x + 66, y + 24, w - 90, 2, { lh: 16, th: 8 });
  const ar = { instagram: 1, facebook: 0.62, linkedin: 0.5, tiktok: 1.5 }[k];
  const aw = w - 28;
  const ah = Math.min(h - 100, aw * ar);
  C.postArt(ctx, x + 14 + (aw - Math.min(aw, ah / ar)) / 2, y + 66, Math.min(aw, ah / ar), ah, seed, 12);
  C.lines(ctx, x + 14, y + 76 + ah, w - 28, k === 'linkedin' ? 3 : 1, { lh: 16, th: 8 });
}

function scene3(ctx, t) {
  L.background(ctx, t, { gridShift: 200 + t * 30 });
  const flyIn = ep(t, 6.0, 6.25, E.outExpo);
  const shrink = ep(t, 7.05, 7.4, E.inOutCubic);
  const fold = ep(t, 7.55, 7.72, E.inCubic);
  const fly = ep(t, 7.68, 8.0, E.inOutCubic);

  // composer frame (flies in from the brand ring, later shrinks up)
  const cw = 900, chh = 820;
  let s = lerp(2.6, 1, flyIn) * lerp(1, 0.66, shrink);
  let cx = W / 2, cy = lerp(1000, 1000, flyIn) - shrink * 170;
  ctx.save();
  ctx.globalAlpha = clamp(flyIn * 1.5) * (1 - fold);
  ctx.translate(cx, cy); ctx.scale(s * lerp(1, 0.3, fold), s * lerp(1, 0.3, fold)); ctx.translate(-cw / 2, -chh / 2);
  composer(ctx, t, 0, 0, cw, chh);
  ctx.restore();

  // cursor → AI Assist
  const cp = ep(t, 6.18, 6.5, E.inOutCubic);
  if (t < 7.05 && cp > 0) {
    const tx = cx - cw / 2 + cw - 150, ty = cy - chh / 2 + 70;
    C.cursor(ctx, lerp(760, tx, cp), lerp(1500, ty, cp), 1.1, prog(t, 6.55, 6.95));
  }

  // previews fan out under the composer: content adapting across platforms
  const kinds = ['instagram', 'facebook', 'linkedin', 'tiktok'];
  kinds.forEach((k, i) => {
    const p = ep(t, 7.12 + i * 0.05, 7.4 + i * 0.05, E.outBack);
    if (p <= 0) return;
    const w = 214, h = 300;
    const tx = 70 + i * (w + 18), ty = 1060;
    const sx = W / 2 - w / 2, sy = 900;
    ctx.save();
    ctx.globalAlpha = clamp(p) * (1 - fold);
    const fx = lerp(lerp(sx, tx, p), W / 2 - w / 2, fold), fy = lerp(lerp(sy, ty, p), 900, fold);
    preview(ctx, k, fx, fy, w, h, i + 1);
    ctx.restore();
  });

  // headline + chips
  if (fold < 1) {
    ctx.save(); ctx.globalAlpha = 1 - fold;
    C.kineticType(ctx, 'CREATE SMARTER', W / 2, 390, t, 6.05, { font: disp(800, 100), per: 0.028, glow: hexA(B.primary, 0.7) });
    chipRow(ctx, ['AI CONTENT', 'MULTI-PLATFORM', 'CONTENT COMPOSER'], W / 2, 1440, t, 7.15, { font: ui(800, 25), padX: 20, h: 54, gap: 14 });
    ctx.restore();
  }

  // the folded content card travels toward where the calendar slot will be
  if (fold > 0) {
    const [lx, ly, lw, lh] = LAND;
    const x0 = W / 2 - 150, y0 = 900 - 100;
    const x = lerp(x0, lx, fly), y = lerp(y0, ly, fly) - Math.sin(fly * Math.PI) * 160;
    const w = lerp(300, lw, fly), h = lerp(200, lh, fly);
    // motion trail
    for (let k = 3; k > 0; k--) {
      const f2 = Math.max(0, fly - k * 0.05);
      ctx.save(); ctx.globalAlpha = 0.12 * (4 - k) * (fly < 1 ? 1 : 0);
      rr(ctx, lerp(x0, lx, f2), lerp(y0, ly, f2) - Math.sin(f2 * Math.PI) * 160, w, h, 16); ctx.fillStyle = B.primary; ctx.fill(); ctx.restore();
    }
    contentChip(ctx, x, y, w, h, 'instagram', 0, 1);
  }
}

// compact scheduled-post chip used in the calendar
function contentChip(ctx, x, y, w, h, k, seed, glow = 0) {
  ctx.save();
  if (glow) { ctx.shadowColor = hexA(B.secondary, 0.8); ctx.shadowBlur = 30 * glow; }
  rr(ctx, x, y, w, h, 16);
  ctx.fillStyle = B.surface2; ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, x, y, w, h, 16); ctx.lineWidth = 2; ctx.strokeStyle = hexA(L.PLATFORMS[k].color === '#111111' ? '#FFFFFF' : L.PLATFORMS[k].color, 0.7); ctx.stroke();
  ctx.restore();
  const s = Math.min(w, h);
  C.postArt(ctx, x + 10, y + 10, w - 20, h * 0.5, seed, 10);
  platformTile(ctx, k, x + 10 + s * 0.16, y + h * 0.5 + 10 + s * 0.16, s * 0.3);
  C.lines(ctx, x + 22 + s * 0.32, y + h * 0.5 + 22, w - 34 - s * 0.32, 2, { lh: 16, th: 8 });
}

// ---------------- Scene 04: PLAN + SCHEDULE ----------------
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const TIMES = ['9 AM', '12 PM', '3 PM', '6 PM'];
const FILL = [
  [0, 0, 'linkedin'], [1, 2, 'instagram'], [3, 0, 'facebook'], [4, 1, 'tiktok'], [0, 2, 'instagram'], [2, 3, 'facebook'],
  [1, 0, 'tiktok'], [4, 3, 'linkedin'], [3, 2, 'instagram'], [0, 3, 'facebook'], [2, 0, 'linkedin'], [4, 0, 'instagram'],
];
const ACCOUNTS = [
  ['Agency HQ', 'AH', B.primary, ['instagram', 'linkedin']], ['Client · Retail', 'RT', B.accent, ['instagram', 'facebook']],
  ['Client · Café', 'CF', B.secondary, ['instagram', 'tiktok']], ['Client · Fitness', 'FT', B.success, ['tiktok', 'facebook']],
  ['Client · Realty', 'RE', B.warn, ['facebook', 'linkedin']], ['Personal brand', 'PB', '#FF5FA2', ['linkedin', 'instagram']],
];
const ACC_POS = [[70, 640], [770, 640], [70, 900], [770, 900], [70, 1160], [770, 1160]];

function calendar(ctx, t) {
  const { x, y, w, h } = CAL;
  card(ctx, x, y, w, h, { r: 34 });
  text(ctx, 'Content calendar', x + 36, y + 56, { font: ui(700, 34), align: 'left' });
  // view switch
  ['Week', 'Month'].forEach((v, i) => {
    const bx = x + w - 250 + i * 118;
    ctx.save(); rr(ctx, bx, y + 30, 108, 50, 25); ctx.fillStyle = i === 0 ? hexA(B.primary, 0.35) : 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.restore();
    text(ctx, v, bx + 54, y + 56, { font: ui(600, 24), color: i === 0 ? B.text : B.muted });
  });
  DAYS.forEach((d, i) => text(ctx, d, x + CAL.gut + i * CAL.cw + CAL.cw / 2, y + 118, { font: ui(800, 24), color: B.muted, track: 2 }));
  TIMES.forEach((tm, r) => text(ctx, tm, x + 26, y + CAL.head + r * CAL.ch + CAL.ch / 2, { font: ui(600, 22), color: B.dim, align: 'left' }));
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2;
  for (let r = 0; r <= 4; r++) { ctx.beginPath(); ctx.moveTo(x + CAL.gut, y + CAL.head + r * CAL.ch); ctx.lineTo(x + w - 30, y + CAL.head + r * CAL.ch); ctx.stroke(); }
  for (let c = 0; c <= 5; c++) { ctx.beginPath(); ctx.moveTo(x + CAL.gut + c * CAL.cw, y + CAL.head); ctx.lineTo(x + CAL.gut + c * CAL.cw, y + h - 20); ctx.stroke(); }
  ctx.restore();

  // landed card from Scene 03
  const [lx, ly, lw, lh] = LAND;
  const land = ep(t, 8.0, 8.18, E.outBack);
  contentChip(ctx, lx, ly, lw, lh, 'instagram', 0, 1 - prog(t, 8.1, 8.6));
  if (t < 8.5) {
    const rp = prog(t, 8.02, 8.5);
    ctx.save(); ctx.strokeStyle = hexA(B.secondary, 0.8 * (1 - rp)); ctx.lineWidth = 4;
    rr(ctx, lx - rp * 30, ly - rp * 30, lw + rp * 60, lh + rp * 60, 20); ctx.stroke(); ctx.restore();
  }
  void land;
  // posts snap into slots
  FILL.forEach(([c, r, k], i) => {
    const ta = 8.35 + i * 0.1;
    const p = ep(t, ta, ta + 0.16, E.outBack);
    if (p <= 0) return;
    const [sx, sy, sw, sh] = slot(c, r);
    ctx.save();
    ctx.globalAlpha = clamp(p * 2);
    ctx.translate(sx + sw / 2, sy + sh / 2 - (1 - p) * 70);
    ctx.scale(lerp(1.25, 1, p), lerp(1.25, 1, p));
    contentChip(ctx, -sw / 2, -sh / 2, sw, sh, k, i + 1);
    ctx.restore();
  });
  // best time highlight
  const bt = ep(t, 9.55, 9.8, E.outBack);
  if (bt > 0) {
    const [sx, sy, sw, sh] = slot(3, 3);
    ctx.save();
    ctx.shadowColor = B.success; ctx.shadowBlur = 30;
    rr(ctx, sx, sy, sw, sh, 16); ctx.strokeStyle = B.success; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 40; ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(sx + sw / 2, sy + sh / 2); ctx.scale(bt, bt);
    L.chip(ctx, 'Best time', 0, 0, { font: ui(800, 20), h: 40, padX: 12, fill: B.success, stroke: B.success, color: '#06281C', track: 0 });
    ctx.restore();
  }
}

function accountTile(ctx, a, x, y, p) {
  const [name, ini, col, plats] = a;
  const w = 250, h = 190;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(lerp(0.6, 1, p), lerp(0.6, 1, p)); ctx.translate(-w / 2, -h / 2);
  card(ctx, 0, 0, w, h, { r: 26 });
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(52, 56, 32, 0, 7); ctx.fill();
  text(ctx, ini, 52, 57, { font: ui(800, 24), color: '#0A0D22' });
  plats.forEach((k, i) => platformTile(ctx, k, 118 + i * 52, 56, 42));
  text(ctx, name, 24, 130, { font: ui(700, 26), align: 'left' });
  // "scheduled" meter
  ctx.save(); rr(ctx, 24, 156, w - 48, 10, 5); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  rr(ctx, 24, 156, (w - 48) * clamp(p * 1.2) * (0.55 + (ini.charCodeAt(0) % 5) / 12), 10, 5); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  ctx.restore();
}

function scene4(ctx, t) {
  L.background(ctx, t, { gridShift: 260 + t * 30 });
  const zo = ep(t, 9.85, 10.45, E.inOutCubic);       // camera pulls out
  const col = ep(t, 10.62, 10.98, E.inExpo);          // collapse into one card
  const cs = lerp(1, 0.5, zo) * lerp(1, 0.25, col);
  ctx.save();
  ctx.globalAlpha = 1 - clamp((col - 0.7) / 0.3);
  L.camera(ctx, { s: cs, fx: W / 2, fy: CAL.y + CAL.h / 2, y: zo * 0 });
  calendar(ctx, t);
  ctx.restore();

  // accounts around the zoomed-out calendar, wired with the Flow Line
  ACCOUNTS.forEach((a, i) => {
    const p = ep(t, 10.05 + i * 0.08, 10.3 + i * 0.08, E.outBack);
    if (p <= 0) return;
    const [ax, ay] = ACC_POS[i];
    const k = col;
    const x = lerp(ax, W / 2 - 125, k), y = lerp(ay, 950 - 95, k);
    const lp = ep(t, 10.1 + i * 0.08, 10.45 + i * 0.08);
    if (k < 0.5) {
      const from = [ax + (ax < W / 2 ? 250 : 0), ay + 95], to = [W / 2 + (ax < W / 2 ? -120 : 120), 950];
      flowLine(ctx, [from, [lerp(from[0], to[0], 0.5), from[1]], [lerp(from[0], to[0], 0.5), to[1]], to], 0, lp, { lw: 4, glow: 14, alpha: 0.9 * (1 - k * 2) });
    }
    ctx.save(); ctx.globalAlpha = 1 - clamp((k - 0.6) / 0.4);
    accountTile(ctx, a, x, y, p * lerp(1, 0.3, k));
    ctx.restore();
  });
  // the single card that carries into Scene 05
  if (col > 0.5) {
    const p = (col - 0.5) / 0.5;
    ctx.save(); ctx.globalAlpha = p;
    contentChip(ctx, W / 2 - 90, 960 - 90, 180, 180, 'instagram', 0, p);
    ctx.restore();
  }

  // headlines
  const fade = 1 - col;
  ctx.save(); ctx.globalAlpha = fade;
  C.kineticType(ctx, 'PLAN ONCE.', W / 2, 340, t, 8.08, { font: disp(800, 92), per: 0.03 });
  const se = ep(t, 9.15, 9.5, E.outExpo);
  if (se > 0) {
    const size = fitFont(ctx, 'SCHEDULE EVERYWHERE.', 800, 92, 940);
    ctx.save(); ctx.translate(W / 2, 450); ctx.scale(lerp(0.2, 1, se), 1);
    text(ctx, 'SCHEDULE EVERYWHERE.', 0, 0, { font: disp(800, size), color: B.secondary, track: lerp(30, 0, se), alpha: clamp(se * 2), glow: hexA(B.secondary, 0.6) });
    ctx.restore();
  }
  chipRow(ctx, ['BULK SCHEDULING', 'MULTIPLE ACCOUNTS'], W / 2, 1400, t, 9.0, { font: ui(800, 25), padX: 20, h: 54, gap: 14 });
  chipRow(ctx, ['BEST TIME', 'CONTENT CALENDAR'], W / 2, 1468, t, 9.2, { font: ui(800, 25), padX: 20, h: 54, gap: 14 });
  ctx.restore();
}

// ---------------- Scene 05: EVERGREEN LOOP ----------------
const LOOP = { cx: W / 2, cy: 960, r: 290 };
const loopPt = (u, r = LOOP.r) => {
  const a = -Math.PI / 2 + u * Math.PI * 2;
  return [LOOP.cx + Math.cos(a) * r, LOOP.cy + Math.sin(a) * r];
};
const STATIONS = [
  { u: 0, label: 'POST' }, { u: 1 / 3, label: 'PUBLISH' }, { u: 2 / 3, label: 'RECYCLE' },
];
const EVERGREEN = [
  { enter: 11.0, from: [W / 2, 960], k: 'instagram', phase: 0 },
  { enter: 11.55, from: [1250, 700], k: 'linkedin', phase: 0.25 },
  { enter: 11.95, from: [-200, 1250], k: 'facebook', phase: 0.5 },
  { enter: 12.35, from: [1250, 1300], k: 'tiktok', phase: 0.75 },
];
const SPEED = 1 / 2.25; // revolutions per second

function scene5(ctx, t) {
  L.background(ctx, t, { gridShift: 360 + t * 30 });
  const shrink = ep(t, 13.55, 13.95, E.inOutCubic);
  const r = lerp(LOOP.r, 96, shrink);

  // ring
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(LOOP.cx, LOOP.cy, r, 0, 7); ctx.stroke(); ctx.restore();
  const draw = ep(t, 11.0, 11.5, E.inOutCubic);
  const rot = t * SPEED;
  const pts = sampleCurve((u) => loopPt(u + rot, r), 160);
  if (shrink < 1) flowLine(ctx, pts, 0, draw * 0.999, { lw: lerp(8, 12, shrink), alpha: 1 - shrink, gx0: LOOP.cx - r, gy0: LOOP.cy - r, gx1: LOOP.cx + r, gy1: LOOP.cy + r });
  // travelling light particles along the loop
  for (let i = 0; i < 18; i++) {
    const u = (i / 18 + t * SPEED * 1.6) % 1;
    const [px, py] = loopPt(u, r);
    ctx.save(); ctx.globalAlpha = 0.6 * draw * (1 - shrink); ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill(); ctx.restore();
  }

  // stations
  STATIONS.forEach((s, i) => {
    const p = ep(t, 11.15 + i * 0.12, 11.4 + i * 0.12, E.outBack) * (1 - shrink);
    if (p <= 0) return;
    const [x, y] = loopPt(s.u, r);
    // pulse when an evergreen card passes the station
    let pulse = 0;
    EVERGREEN.forEach((c) => { if (t > c.enter + 0.4) { const d = Math.abs((((c.phase + t * SPEED) % 1) - s.u + 1.5) % 1 - 0.5); pulse = Math.max(pulse, 1 - d * 12); } });
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.fillStyle = B.bg2; ctx.strokeStyle = s.label === 'PUBLISH' ? B.success : s.label === 'RECYCLE' ? B.accent : B.secondary; ctx.lineWidth = 5;
    ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16 + 30 * clamp(pulse);
    ctx.beginPath(); ctx.arc(0, 0, 22 + 6 * clamp(pulse), 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    const lx = x + (i === 0 ? 0 : i === 1 ? 20 : -20), ly = y + (i === 0 ? -62 : 64);
    ctx.save(); ctx.translate(lx, ly); ctx.scale(p, p);
    L.chip(ctx, s.label, 0, 0, { font: ui(800, 26), track: 3, h: 52, padX: 20, fill: hexA(B.bg2, 0.95) });
    ctx.restore();
  });

  // evergreen cards riding the loop
  EVERGREEN.forEach((c, i) => {
    const p = ep(t, c.enter, c.enter + 0.45, E.inOutCubic);
    if (p <= 0) return;
    const u = c.phase + t * SPEED;
    const [lx, ly] = loopPt(u, r);
    const x = lerp(c.from[0], lx, p), y = lerp(c.from[1], ly, p);
    const s = lerp(i === 0 ? 1 : 0.8, 1, p) * lerp(1, 0.2, shrink);
    ctx.save(); ctx.globalAlpha = 1 - shrink;
    ctx.translate(x, y); ctx.scale(s, s);
    contentChip(ctx, -70, -70, 140, 140, c.k, i, 0.4);
    // evergreen tag
    ctx.save(); rr(ctx, -52, 58, 104, 30, 15); ctx.fillStyle = B.success; ctx.fill(); ctx.restore();
    L.loopIcon(ctx, -30, 73, 8, '#06281C', 3, t * 3);
    text(ctx, 'Evergreen', 12, 74, { font: ui(800, 15), color: '#06281C' });
    ctx.restore();
  });

  // hub
  const hub = ep(t, 11.3, 11.6, E.outBack) * (1 - shrink);
  if (hub > 0) {
    ctx.save(); ctx.translate(LOOP.cx, LOOP.cy); ctx.scale(hub, hub);
    L.loopIcon(ctx, 0, -40, 44, B.secondary, 9, t * 2.2);
    text(ctx, 'Evergreen library', 0, 50, { font: ui(700, 30) });
    text(ctx, 'Repeats automatically', 0, 92, { font: ui(500, 24), color: B.muted });
    ctx.restore();
  }

  // loop → approval badge (hand-off to Scene 06)
  if (shrink > 0) {
    ctx.save();
    ctx.globalAlpha = shrink;
    ctx.shadowColor = B.success; ctx.shadowBlur = 40 * shrink;
    ctx.strokeStyle = B.success; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(LOOP.cx, LOOP.cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shrink); ctx.stroke();
    ctx.restore();
    L.checkMark(ctx, LOOP.cx, LOOP.cy, 120, B.success, 16, ep(t, 13.75, 14.0));
  }

  // headlines
  const hf = 1 - shrink;
  ctx.save(); ctx.globalAlpha = hf;
  C.slam(ctx, 'CREATE ONCE.', W / 2, 340, t, 11.1, { font: disp(800, 100) });
  C.slam(ctx, 'KEEP IT WORKING.', W / 2, 455, t, 11.9, { font: disp(800, fitFont(ctx, 'KEEP IT WORKING.', 800, 100, 940)), color: B.secondary, glow: hexA(B.secondary, 0.6) });
  chipRow(ctx, ['EVERGREEN CONTENT', 'RECURRING POSTS', 'AUTOMATION'], W / 2, 1440, t, 12.4, { font: ui(800, 24), padX: 18, h: 52, gap: 12 });
  ctx.restore();
}

module.exports = { scene3, scene4, scene5, contentChip, LOOP };
