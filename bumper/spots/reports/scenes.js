// Video 3, "Month-end reports eating your Friday?": a month-end paper pile -> one branded
// report with recurring, scheduled delivery. Visible words: the two headlines, "MONTH-END" on the
// calendar page and the end card. Charts are abstract (no numbers, axes or labels).
// COVER=agency swaps the RecurPost logo on the report cover for an abstract agency mark.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, clockIcon, checkIcon, background, riseText, getLogo } = L;
const T = TL.T;
const COVER = process.env.COVER || 'recurpost';

// ---------- layout ----------
const PW = 360, PH = 470;                  // paper report page
const DESK_Y = 880;                         // desk surface top edge
// [x, y-lift, rotation deg] per landing page; side pages fan out under the main pile
const PAGES = [
  [960, 0, -2], [640, 18, -9], [1280, 14, 8], [960, 6, 3], [780, 10, -5],
  [1140, 9, 6], [960, 12, -1.5], [880, 16, 2.5], [1040, 20, -3],
];
const CAL = { x: 350, y: 560, w: 300, h: 330 };   // MONTH-END tear-off page (centre)
const CLOCK = { x: 1640, y: 500, r: 58 };
const R = { x: 280, y: 378, w: 820, h: 560 };      // the digital report
const CY = R.y + R.h / 2;
const CALI = { x: 1330, y: CY, s: 156 };           // recurring-calendar icon (centre, size)
const MAIL = { x: 1590, y: CY, w: 190, h: 136 };    // scheduled-email icon

// ---------- scene 1 parts ----------
function paperPage(ctx, w, h, i) {
  const k = w / PW;
  ctx.save(); ctx.scale(k, h / PH);
  fillRR(ctx, 28, 30, 150, 14, 7, C.gray);
  fillRR(ctx, 28, 54, 96, 10, 5, C.line);
  // a generic, unbranded chart block in greys
  ctx.fillStyle = '#F3F1EC'; rr(ctx, 28, 86, PW - 56, 150, 10); ctx.fill();
  const hs = [0.5, 0.75, 0.4, 0.85, 0.6, 0.7];
  hs.forEach((v, j) => fillRR(ctx, 48 + j * 46, 220 - 116 * ((v + i * 0.07) % 1 * 0.6 + 0.35), 26, 116 * ((v + i * 0.07) % 1 * 0.6 + 0.35), 5, j % 2 ? C.gray2 : C.gray));
  for (let j = 0; j < 6; j++) fillRR(ctx, 28, 266 + j * 26, PW - 56 - ((j * 37 + i * 13) % 90), 10, 5, j % 3 ? C.line : C.gray);
  fillRR(ctx, 28, PH - 44, 80, 10, 5, C.line);
  ctx.restore();
}

function pageShell(ctx, w, h, r, lift) {
  shadowed(ctx, 18 + 24 * lift, 6 + 10 * lift, 0.1 + 0.08 * lift, () => fillRR(ctx, 0, 0, w, h, r, C.surface));
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.strokeStyle = 'rgba(31,31,31,0.07)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}

function desk(ctx, t) {
  const a = 1 - ep(t, 1.58, 1.9);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, DESK_Y, 0, H);
  g.addColorStop(0, '#E9E5DB'); g.addColorStop(1, '#DED9CC');
  ctx.fillStyle = g; ctx.fillRect(-200, DESK_Y, W + 400, H - DESK_Y + 200);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-200, DESK_Y, W + 400, 2);
  ctx.restore();
}

// where page i sits at time t during scene 1
function pagePose(i, t) {
  const land = TL.PAGE_LAND[i];
  const [x, lift, rot] = PAGES[i];
  const f = clamp((t - (land - T.pageFall)) / T.pageFall);
  const fall = f * f;                                   // accelerate into the desk
  const settle = Math.sin(Math.PI * ep(t, land, land + 0.12)) * 5;
  return {
    show: t >= land - T.pageFall,
    x, y: DESK_Y - PH / 2 - lift - i * 3 - (1 - fall) * 760 + settle,
    rot: (rot + (1 - fall) * (i % 2 ? 10 : -10)) * Math.PI / 180,
    a: clamp(f * 3),
  };
}

function calendarPage(ctx, t) {
  const out = ep(t, 1.56, 1.84, E.inOutCubic);
  if (out >= 1) return;
  const { x, y, w, h } = CAL;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(x - 120 * out, y);
  ctx.rotate(-0.06);
  // previous (blank) page flips up and away
  const old = ep(t, T.flip, T.flip + 0.2, E.inOutCubic);
  // the MONTH-END page flips down into view from the top hinge
  const p = ep(t, T.flip + 0.1, T.flip + 0.44, (v) => E.outBack(v, 1.3));
  const top = -h / 2;
  shadowed(ctx, 30, 12, 0.14, () => fillRR(ctx, -w / 2, top, w, h, 18, C.surface)); // pad backing
  const face = (sy, monthEnd) => {
    ctx.save();
    ctx.translate(0, top); ctx.scale(1, sy); ctx.translate(0, -top);
    fillRR(ctx, -w / 2, top, w, h, 18, C.surface);
    ctx.save(); rr(ctx, -w / 2, top, w, h, 18); ctx.clip();
    ctx.fillStyle = C.ink; ctx.fillRect(-w / 2, top, w, 96);
    ctx.restore();
    const gx = -w / 2 + 26, gy = top + 120, cw = (w - 52) / 5, ch = (h - 146) / 4;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      const last = monthEnd && r === 3 && c === 4;
      fillRR(ctx, gx + c * cw + 5, gy + r * ch + 5, cw - 10, ch - 10, 7, last ? C.yellow : (r * 5 + c) % 3 ? '#F1EFEA' : C.gray);
    }
    if (monthEnd) {
      ctx.fillStyle = C.yellow; ctx.font = font(800, 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MONTH-END', 0, top + 52);
    }
    ctx.restore();
  };
  if (p > 0.02) face(p, true);
  if (old < 1) face(1 - old, false);
  // binder rings
  for (const rx of [-w / 4, w / 4]) {
    ctx.fillStyle = '#BDB9AE'; fillRR(ctx, rx - 7, top - 18, 14, 34, 7, '#BDB9AE');
  }
  ctx.restore();
}

function tickingClock(ctx, t) {
  const p = ep(t, 0.1, 0.4, (v) => E.outBack(v, 1.6));
  const out = ep(t, 1.56, 1.8);
  if (p <= 0 || out >= 1) return;
  const { x, y, r } = CLOCK;
  ctx.save();
  ctx.globalAlpha = clamp(p * 2) * (1 - out);
  ctx.translate(x, y); ctx.scale(p, p);
  shadowed(ctx, 24, 8, 0.14, () => { ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    ctx.fillStyle = i % 3 ? C.gray2 : C.ink;
    ctx.beginPath(); ctx.arc(Math.sin(a) * (r - 18), -Math.cos(a) * (r - 18), i % 3 ? 2.5 : 4, 0, Math.PI * 2); ctx.fill();
  }
  // second hand ticks on the 8th-note grid with a small overshoot
  const step = Math.floor(t / 0.25), frac = ep(t - step * 0.25, 0, 0.08, (v) => E.outBack(v, 2));
  const ang = (step + frac) * (Math.PI / 15) + 0.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(1.9) * (r - 30), -Math.cos(1.9) * (r - 30)); ctx.stroke();
  ctx.strokeStyle = C.yellow; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-Math.sin(ang) * 10, Math.cos(ang) * 10); ctx.lineTo(Math.sin(ang) * (r - 14), -Math.cos(ang) * (r - 14)); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function headline1(ctx, t) {
  const out = ep(t, ...T.headlineOut, E.inOutCubic);
  if (out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(0, -50 * out);
  ctx.font = font(800, 100); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  // soft backdrop keeps the hook readable while the pages fill the frame
  const g = ctx.createLinearGradient(0, 0, 0, 400);
  g.addColorStop(0, 'rgba(246,245,241,0.92)'); g.addColorStop(0.75, 'rgba(246,245,241,0.75)'); g.addColorStop(1, 'rgba(246,245,241,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 400);
  const w2 = ctx.measureText('THERE GOES FRIDAY.').width;
  const band = ep(t, 0.12, 0.36, E.outQuint);
  fillRR(ctx, W / 2 - w2 / 2 - 28, 322 - 92, (w2 + 56) * band, 114, 14, C.yellow);
  ctx.fillStyle = C.ink;
  riseText(ctx, 'CLIENT REPORTS.', W / 2, 212, ep(t, -0.14, 0.22, E.outQuint));
  riseText(ctx, 'THERE GOES FRIDAY.', W / 2, 322, ep(t, -0.04, 0.32, E.outQuint));
  ctx.restore();
}

function pushCam(ctx, t) {
  const z = 1 + 0.1 * ep(t, ...T.push, E.inOutCubic) * (1 - ep(t, 1.56, 2.0, E.inOutCubic));
  ctx.translate(960, 700); ctx.scale(z, z); ctx.translate(-960, -700);
}

// ---------- scene 2 parts ----------
function agencyMark(ctx, x, y, h) {
  // abstract "your agency" mark: no letters, no real brand
  fillRR(ctx, x, y, h, h, h * 0.26, C.ink);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(x + h / 2, y + h / 2, h * 0.24, 0, Math.PI * 2); ctx.fill();
  fillRR(ctx, x + h + 18, y + h * 0.18, 210, h * 0.26, h * 0.13, C.ink);
  fillRR(ctx, x + h + 18, y + h * 0.6, 130, h * 0.2, h * 0.1, C.gray2);
}

function reportContent(ctx, t, w, h) {
  // cover header: logo (exact asset, native ratio) or the abstract agency mark
  const lp = ep(t, ...T.cover, E.outQuint);
  ctx.save(); ctx.globalAlpha *= lp;
  if (COVER === 'agency') agencyMark(ctx, 44, 40 + 10 * (1 - lp), 56);
  else {
    const LOGO = getLogo(), lh = 52;
    ctx.drawImage(LOGO, 44, 42 + 10 * (1 - lp), lh * LOGO.width / LOGO.height, lh);
  }
  fillRR(ctx, w - 44 - 140, 58, 140, 16, 8, C.yellow);
  ctx.restore();
  ctx.fillStyle = C.line; ctx.fillRect(44, 122, w - 88, 2);
  ctx.save(); rr(ctx, 0, 0, w, h, 22); ctx.clip(); ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, 12, h); ctx.restore();
  const cp = (d) => ep(t, T.charts[0] + d, T.charts[0] + d + 0.4, E.outCubic);
  // bar chart (left)
  const bx = 44, by = 150, bw = 380, bh = h - 190;
  fillRR(ctx, bx, by, bw, bh, 16, '#FAF9F5');
  const bars = [0.6, 0.78, 0.5, 0.72, 0.56, 0.68]; // no trend implied
  bars.forEach((v, j) => {
    const p = cp(j * 0.04);
    const hh = (bh - 60) * v * p;
    fillRR(ctx, bx + 30 + j * 58, by + bh - 28 - hh, 36, hh, 8, j % 2 ? C.ink : C.yellow);
  });
  ctx.fillStyle = C.line; ctx.fillRect(bx + 22, by + bh - 26, bw - 44, 2);
  // donut (top right)
  const dx = 470, dw = w - dx - 44, dh = (bh - 20) / 2;
  fillRR(ctx, dx, by, dw, dh, 16, '#FAF9F5');
  const cx = dx + 92, cy = by + dh / 2, rad = 58;
  const segs = [[0.5, C.yellow], [0.3, C.ink], [0.2, C.gray2]];
  let a0 = -Math.PI / 2;
  const dp = cp(0.1);
  ctx.lineWidth = 24;
  for (const [f, col] of segs) {
    const a1 = a0 + f * Math.PI * 2 * dp;
    ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(cx, cy, rad, a0, a1); ctx.stroke();
    a0 = a0 + f * Math.PI * 2 * dp;
  }
  segs.forEach(([, col], j) => {
    fillRR(ctx, cx + 92, cy - 34 + j * 26, 16, 16, 4, col);
    fillRR(ctx, cx + 118, cy - 31 + j * 26, 70 - j * 12, 10, 5, C.gray);
  });
  // line chart (bottom right): gentle, non-committal shape, no values
  const ly = by + dh + 20;
  fillRR(ctx, dx, ly, dw, dh, 16, '#FAF9F5');
  const pts = [0.55, 0.4, 0.5, 0.35, 0.45, 0.3, 0.38];
  const lp2 = cp(0.18);
  const X = (j) => dx + 26 + j * ((dw - 52) / (pts.length - 1));
  const Y = (v) => ly + 22 + v * (dh - 44);
  ctx.save();
  ctx.beginPath(); ctx.rect(dx, ly, 26 + (dw - 52) * lp2, dh); ctx.clip();
  ctx.beginPath(); ctx.moveTo(X(0), Y(pts[0]));
  pts.forEach((v, j) => ctx.lineTo(X(j), Y(v)));
  ctx.lineTo(X(pts.length - 1), ly + dh - 14); ctx.lineTo(X(0), ly + dh - 14); ctx.closePath();
  ctx.fillStyle = 'rgba(255,205,66,0.25)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(X(0), Y(pts[0]));
  pts.forEach((v, j) => ctx.lineTo(X(j), Y(v)));
  ctx.strokeStyle = '#F2B705'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

// Pages converge and compress into the single report.
function compressing(ctx, t) {
  const [c0, c1] = T.compress;
  for (let i = 0; i < PAGES.length; i++) {
    const pose = pagePose(i, Math.min(t, c0));
    if (!pose.show) continue;
    const d = (PAGES.length - 1 - i) * 0.02;              // top pages move first
    const p = ep(t, c0 + d, c1 - 0.06 + d * 0.3, E.inOutQuart);
    const top = i === PAGES.length - 1;
    const w = lerp(PW, R.w, p), h = lerp(PH, R.h, p) * (1 - 0.18 * Math.sin(Math.PI * p)); // squash mid-flight
    const x = lerp(pose.x, R.x + R.w / 2, p), y = lerp(pose.y, CY, p);
    ctx.save();
    ctx.globalAlpha = top ? 1 : 1 - ep(p, 0.55, 0.95);
    ctx.translate(x, y); ctx.rotate(pose.rot * (1 - p)); ctx.translate(-w / 2, -h / 2);
    pageShell(ctx, w, h, lerp(10, 22, p), 0.4 + 0.6 * Math.sin(Math.PI * p));
    ctx.save(); rr(ctx, 0, 0, w, h, lerp(10, 22, p)); ctx.clip();
    if (p < 0.6) { ctx.globalAlpha *= 1 - ep(p, 0.2, 0.6); paperPage(ctx, w, h, i); }
    ctx.restore();
    ctx.restore();
  }
}

function report(ctx, t) {
  if (t < T.compress[1] - 0.12) return;
  ctx.save();
  ctx.translate(R.x, R.y);
  if (t >= T.compress[1]) pageShell(ctx, R.w, R.h, 22, 0.6);
  reportContent(ctx, t, R.w, R.h);
  ctx.restore();
}

function recurArrow(ctx, cx, cy, r, col) {
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = r * 0.24; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, -Math.PI * 0.15, Math.PI * 1.35); ctx.stroke();
  const a = -Math.PI * 0.15, ex = cx + Math.cos(a) * r * 0.62, ey = cy + Math.sin(a) * r * 0.62;
  ctx.beginPath(); ctx.moveTo(ex - r * 0.32, ey - r * 0.05); ctx.lineTo(ex + r * 0.12, ey - r * 0.3); ctx.lineTo(ex + r * 0.12, ey + r * 0.22); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function calendarIcon(ctx, t) {
  const p = ep(t, T.calIcon, T.calIcon + 0.3, (v) => E.outBack(v, 1.7));
  if (p <= 0) return;
  const { x, y, s } = CALI;
  ctx.save();
  ctx.globalAlpha = clamp(p * 2);
  ctx.translate(x, y); ctx.scale(p, p);
  shadowed(ctx, 30, 12, 0.14, () => fillRR(ctx, -s / 2, -s / 2, s, s, 26, C.surface));
  ctx.save(); rr(ctx, -s / 2, -s / 2, s, s, 26); ctx.clip(); ctx.fillStyle = C.ink; ctx.fillRect(-s / 2, -s / 2, s, 42); ctx.restore();
  for (const rx of [-s / 4, s / 4]) fillRR(ctx, rx - 6, -s / 2 - 12, 12, 26, 6, '#BDB9AE');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const on = r === 1 && c === 2;
    fillRR(ctx, -s / 2 + 20 + c * 30, -s / 2 + 56 + r * 28, 20, 18, 5, on ? C.yellow : '#ECE9E2');
  }
  // recurring badge
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(s / 2 - 6, s / 2 - 6, 30, 0, Math.PI * 2); ctx.fill();
  recurArrow(ctx, s / 2 - 6, s / 2 - 6, 30, C.ink);
  ctx.restore();
}

function mailIcon(ctx, t) {
  const p = ep(t, T.mailIcon, T.mailIcon + 0.3, (v) => E.outBack(v, 1.7));
  if (p <= 0) return;
  const { x, y, w, h } = MAIL;
  ctx.save();
  ctx.globalAlpha = clamp(p * 2);
  ctx.translate(x, y); ctx.scale(p, p);
  shadowed(ctx, 30, 12, 0.14, () => fillRR(ctx, -w / 2, -h / 2, w, h, 18, C.surface));
  ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  rr(ctx, -w / 2 + 3.5, -h / 2 + 3.5, w - 7, h - 7, 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2 + 14, -h / 2 + 18); ctx.lineTo(0, 10); ctx.lineTo(w / 2 - 14, -h / 2 + 18); ctx.stroke();
  // scheduled badge: clock that resolves to a check (the confirmation beat)
  const done = ep(t, T.mailIcon + 0.04, T.mailIcon + 0.26);
  const bx = w / 2 - 4, by = -h / 2 + 4;
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(bx, by, 32 * (1 + 0.12 * Math.sin(Math.PI * done)), 0, Math.PI * 2); ctx.fill();
  if (done < 0.5) clockIcon(ctx, bx, by, 15, C.ink);
  else checkIcon(ctx, bx, by, 30, C.ink, (done - 0.5) * 2);
  ctx.restore();
}

function connector(ctx, t) {
  const p = ep(t, ...T.connector, E.inOutCubic);
  if (p <= 0) return;
  const x0 = R.x + R.w + 26, x1 = MAIL.x - MAIL.w / 2 - 26;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 10, CY - 20, (x1 - x0 + 20) * p, 40); ctx.clip();
  ctx.strokeStyle = C.gray2; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]);
  ctx.beginPath(); ctx.moveTo(x0, CY); ctx.lineTo(x1, CY); ctx.stroke();
  ctx.restore();
}

function headline2(ctx, t) {
  const t0 = T.copy2;
  if (t < t0 - 0.01) return;
  ctx.save();
  ctx.font = font(800, 84); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const w2 = ctx.measureText('SCHEDULED DELIVERY.').width;
  const band = ep(t, t0 + 0.16, t0 + 0.4, E.outQuint);
  fillRR(ctx, W / 2 - w2 / 2 - 24, 292 - 78, (w2 + 48) * band, 98, 12, C.yellow);
  ctx.fillStyle = C.ink;
  riseText(ctx, 'BRANDED REPORTS.', W / 2, 190, ep(t, t0, t0 + 0.34, E.outQuint), 100, 100);
  riseText(ctx, 'SCHEDULED DELIVERY.', W / 2, 292, ep(t, t0 + 0.08, t0 + 0.42, E.outQuint), 100, 100);
  ctx.restore();
}

function cam2(ctx, t) {
  const z = 1 + 0.03 * ep(t, 2.3, 3.8, E.inOutCubic);
  ctx.translate(990, CY); ctx.scale(z, z); ctx.translate(-990, -CY);
}

// ---------- frame ----------
function mainScene(ctx, t) {
  background(ctx, t);
  ctx.save();
  if (t < T.compress[0] + 0.5) {
    ctx.save(); pushCam(ctx, t);
    desk(ctx, t);
    // contact shadow under the pile
    const pile = ep(t, TL.PAGE_LAND[0], TL.PAGE_LAND[8]) * (1 - ep(t, 1.58, 1.8));
    if (pile > 0) {
      const g = ctx.createRadialGradient(960, DESK_Y + 6, 0, 960, DESK_Y + 6, 520);
      g.addColorStop(0, `rgba(31,31,31,${0.16 * pile})`); g.addColorStop(1, 'rgba(31,31,31,0)');
      ctx.fillStyle = g; ctx.fillRect(400, DESK_Y - 30, 1120, 90);
    }
    if (t < T.compress[0]) {
      for (let i = 0; i < PAGES.length; i++) {
        const p = pagePose(i, t);
        if (!p.show) continue;
        ctx.save(); ctx.globalAlpha = p.a;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.translate(-PW / 2, -PH / 2);
        pageShell(ctx, PW, PH, 10, t < TL.PAGE_LAND[i] ? 1 : 0.4);
        ctx.save(); rr(ctx, 0, 0, PW, PH, 10); ctx.clip(); paperPage(ctx, PW, PH, i); ctx.restore();
        ctx.restore();
      }
    } else compressing(ctx, t); // same camera as the pile, so the hand-off has no jump
    ctx.restore();
    calendarPage(ctx, t);
    tickingClock(ctx, t);
  }
  if (t >= T.compress[0]) {
    ctx.save(); cam2(ctx, t);
    report(ctx, t);
    connector(ctx, t);
    calendarIcon(ctx, t);
    mailIcon(ctx, t);
    ctx.restore();
  }
  ctx.restore();
  headline1(ctx, t);
  headline2(ctx, t);
}

module.exports = { TL, mainScene };
