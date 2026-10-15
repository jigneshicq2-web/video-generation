// 30 s YouTube Shorts (9:16, 1080x1920), "The pitch is won. Now turn it into a month of content."
// One campaign card is the anchor (yellow outline + violet campaign flag): the approved proposal
// unfolds into a blank calendar -> idea cards arrive and the month view opens -> they stack and the
// calendar folds into the campaign card -> it moves through the template sequence (Campaign Proposal
// -> Social Media Plan -> Content Calendar), picking up structure at each stage -> "Content Calendar"
// opens into the month and the card lands in its date slot -> the camera pushes into it and reveals
// the scheduling queue -> the agency drags it in, others follow -> the cards sweep together in an arc
// and the campaign card becomes the CTA. Visible words: the five headlines, "APPROVED", the three
// template names, Post / Reel / Campaign, and the end card. No URL, metrics, prices or names.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, clockIcon, checkIcon, cursor, riseText, getLogo } = L;
const T = TL.T;

// brand yellow + charcoal first; bright complementary accents for the joyful mood
const K = {
  sky: '#5DBDF2', skyT: '#DDF1FC', coral: '#FF8A65', coralT: '#FFE4DA',
  violet: '#8C7CF0', violetT: '#E8E4FD', mint: '#1FAF78', mintT: '#D6F3E6',
};
const TYPES = {
  post: { label: 'Post', col: K.sky, tint: K.skyT },
  reel: { label: 'Reel', col: K.coral, tint: K.coralT },
  camp: { label: 'Campaign', col: K.violet, tint: K.violetT },
};
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerpR = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
const spring = (t, t0, amp = 0.08, k = 9, f = 26) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) * k) * Math.cos((t - t0) * f));

// ---------- layout (screen coordinates; content kept inside x 90-990, y 230-1460) ----------
const DOC = { x: 240, y: 660, w: 600, h: 780 };       // the proposal
const CAL = { x: 90, y: 660, w: 900, h: 780 };        // the blank calendar it unfolds into
const TPL = [ // the template sequence (scene 3)
  { label: 'Campaign Proposal', y: 520, col: K.violet },
  { label: 'Social Media Plan', y: 790, col: K.sky },
  { label: 'Content Calendar', y: 1060, col: C.yellow },
];
const TPL_X = 140, TPL_W = 800, TPL_H = 220;
const tplRect = (i) => ({ x: TPL_X, y: TPL[i].y, w: TPL_W, h: TPL_H });
const slotOf = (i) => ({ x: TPL_X + TPL_W - 250, y: TPL[i].y + 35, w: 220, h: 150 }); // where the campaign card docks
const CAL2 = { x: 90, y: 690, w: 900, h: 760 };       // the month (scene 4)
const PANEL = { x: 140, y: 520, w: 800, h: 900 };     // scheduling queue (scene 5)
const QCARD = { w: 740, h: 170 };
const qSlot = (i) => ({ x: PANEL.x + 30, y: PANEL.y + 128 + i * 192, w: QCARD.w, h: QCARD.h });

// ---------- background ----------
function glow(ctx, x, y, r, col) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function bg(ctx, t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  glow(ctx, 880 - t * 8, 240 + t * 6, 820, 'rgba(255,205,66,0.26)');
  glow(ctx, 140 + t * 4, 1760 - t * 6, 760, 'rgba(93,189,242,0.13)');
  glow(ctx, 1000, 1320, 520, 'rgba(140,124,240,0.07)');
  ctx.fillStyle = 'rgba(31,31,31,0.05)';
  for (let y = 20; y < H; y += 40) for (let x = 20; x < W; x += 40) ctx.fillRect(x - 1, y - 1, 2.4, 2.4);
}

// ---------- headlines ----------
// Lines rise into clipped bands; `band` puts the yellow highlight behind one line, `bandMove`
// lets it travel to each new line as it lands; `arrow` appends a vector arrow to a line.
function headline(ctx, t, lines, t0s, t1, o = {}) {
  const out = ep(t, t1, t1 + 0.22, E.inOutCubic);
  if (out >= 1 || t < (Array.isArray(t0s) ? t0s[0] : t0s) - 0.01) return;
  const fs = o.fs || 100, gap = o.gap || Math.round(fs * 1.06), y0 = o.y0 || 330;
  const starts = lines.map((_, j) => (Array.isArray(t0s) ? t0s[j] : t0s + j * 0.08));
  ctx.save();
  ctx.globalAlpha = 1 - out; ctx.translate(0, -36 * out);
  ctx.font = font(800, fs); ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
  const widths = lines.map((s, j) => ctx.measureText(s).width + (o.arrow === j ? fs * 0.98 : 0));
  // yellow band (fixed line, or moving to the newest line)
  let bj = o.band, bp = 1, prev = null;
  if (o.bandMove) {
    bj = 0;
    starts.forEach((s, j) => { if (t >= s) bj = j; });
    prev = bj > 0 ? bj - 1 : null;
    bp = ep(t, starts[bj] + 0.06, starts[bj] + 0.36, E.outQuint);
  }
  if (bj !== undefined && bj !== null && t >= starts[bj]) {
    const w1 = widths[bj] + 52, y1 = y0 + bj * gap - fs * 0.93;
    let x, y, w;
    if (prev !== null) {
      const w0 = widths[prev] + 52;
      w = lerp(w0, w1, bp); x = W / 2 - w / 2; y = lerp(y0 + prev * gap - fs * 0.93, y1, bp);
    } else {
      const b = o.bandMove ? bp : ep(t, starts[bj] + 0.16, starts[bj] + 0.42, E.outQuint);
      w = w1 * b; x = W / 2 - w1 / 2; y = y1;
    }
    fillRR(ctx, x, y, w, fs * 1.17, 14, C.yellow);
  }
  lines.forEach((s, j) => {
    if (t < starts[j] - 0.01) return;
    const p = ep(t, starts[j], starts[j] + 0.38, E.outQuint);
    const x0 = W / 2 - widths[j] / 2, y = y0 + j * gap;
    ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    riseText(ctx, s, x0, y, p, fs * 1.19, fs * 1.2);
    if (o.arrow === j) arrow(ctx, x0 + ctx.measureText(s).width + fs * 0.24, y - fs * 0.36, fs * 0.74, fs * 0.14, ep(t, starts[j] + 0.2, starts[j] + 0.55, E.outCubic));
  });
  ctx.restore();
}
function arrow(ctx, x, y, w, th, p) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = C.ink; ctx.lineWidth = th; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const xe = x + w * p;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(xe, y); ctx.stroke();
  const hp = clamp((p - 0.45) / 0.55), hs = w * 0.42 * hp;
  if (hp > 0) { ctx.beginPath(); ctx.moveTo(xe - hs, y - hs); ctx.lineTo(xe, y); ctx.lineTo(xe - hs, y + hs); ctx.stroke(); }
  ctx.restore();
}

// ---------- small parts ----------
function flag(ctx, cx, cy, r, a = 1) {           // the campaign marker that travels with the hero
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = K.violet; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.34, cy - r * 0.5); ctx.lineTo(cx - r * 0.34, cy + r * 0.52); ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.34, cy - r * 0.5); ctx.lineTo(cx + r * 0.46, cy - r * 0.27); ctx.lineTo(cx - r * 0.34, cy - r * 0.02); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function pencil(ctx, cx, cy, s, col) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
  fillRR(ctx, -s * 0.13, -s * 0.46, s * 0.26, s * 0.66, s * 0.06, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-s * 0.13, s * 0.25); ctx.lineTo(s * 0.13, s * 0.25); ctx.lineTo(0, s * 0.46); ctx.fill();
  ctx.restore();
}
function editBadge(ctx, cx, cy, r) {
  ctx.save(); ctx.fillStyle = C.yTint; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  pencil(ctx, cx, cy, r * 1.05, C.ink);
}
function typeIcon(ctx, type, cx, cy, s, col) {
  ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col;
  if (type === 'post') {           // picture
    ctx.lineWidth = s * 0.12; rr(ctx, cx - s * 0.5, cy - s * 0.4, s, s * 0.8, s * 0.14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * 0.36, cy + s * 0.28); ctx.lineTo(cx - s * 0.08, cy - s * 0.04); ctx.lineTo(cx + s * 0.12, cy + s * 0.14);
    ctx.lineTo(cx + s * 0.22, cy + s * 0.04); ctx.lineTo(cx + s * 0.38, cy + s * 0.28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + s * 0.2, cy - s * 0.16, s * 0.09, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'reel') {    // play
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(cx - s * 0.13, cy - s * 0.22); ctx.lineTo(cx + s * 0.24, cy); ctx.lineTo(cx - s * 0.13, cy + s * 0.22); ctx.fill();
  } else {                         // campaign flag
    ctx.restore(); flag(ctx, cx, cy, s * 0.5); return;
  }
  ctx.restore();
}
function sparkle(ctx, x, y, s, col) {
  ctx.save(); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4, r = i % 2 ? s * 0.28 : s;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
// joyful burst: deterministic confetti from (x, y) starting at t0
const CONF = [C.yellow, C.ink, K.sky, C.yellow, K.coral];
function confetti(ctx, t, t0, x, y, n = 20, seed = 1, spread = 1) {
  const dt = t - t0;
  if (dt < 0 || dt > 1.1) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rnd(seed * 31 + i) - 0.5) * Math.PI * 1.7 * spread;
    const v = 380 + rnd(seed * 17 + i) * 420;
    const px = x + Math.cos(a) * v * dt, py = y + Math.sin(a) * v * dt + 520 * dt * dt;
    ctx.globalAlpha = clamp(1 - (dt - 0.4) / 0.45) * clamp(dt / 0.04);
    ctx.fillStyle = CONF[i % CONF.length];
    ctx.save(); ctx.translate(px, py); ctx.rotate(dt * (6 + rnd(i) * 8) * (i % 2 ? 1 : -1));
    if (i % 3 === 0) { ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); } else if (i % 3 === 1) fillRR(ctx, -12, -6, 24, 12, 6, CONF[i % CONF.length]); else { ctx.restore(); sparkle(ctx, px, py, 14, CONF[i % CONF.length]); continue; }
    ctx.restore();
  }
  ctx.restore();
}
function heroOutline(ctx, x, y, w, h, r, lw = 6, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; rr(ctx, x - lw / 2, y - lw / 2, w + lw, h + lw, r + lw / 2);
  ctx.strokeStyle = C.yellow; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
}
function card(ctx, x, y, w, h, r, lift = 0.5) {
  shadowed(ctx, 24 + 30 * lift, 8 + 14 * lift, 0.1 + 0.06 * lift, () => fillRR(ctx, x, y, w, h, r, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.strokeStyle = 'rgba(31,31,31,0.06)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
}

// ---------- 1 · proposal -> calendar ----------
function proposalContent(ctx, R, a) {
  if (a <= 0) return;
  const { x, y, w } = R;
  ctx.save(); ctx.globalAlpha *= a;
  flag(ctx, x + 70, y + 72, 32);
  fillRR(ctx, x + 122, y + 52, w * 0.46, 26, 13, C.ink);
  fillRR(ctx, x + 122, y + 92, w * 0.28, 16, 8, C.gray);
  // cover art
  ctx.save(); rr(ctx, x + 40, y + 140, w - 80, 230, 20); ctx.fillStyle = K.violetT; ctx.fill(); ctx.clip();
  ctx.fillStyle = K.sky; ctx.beginPath(); ctx.arc(x + w * 0.74, y + 205, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.moveTo(x + 20, y + 370); ctx.lineTo(x + w * 0.36, y + 230); ctx.lineTo(x + w * 0.66, y + 370); ctx.fill();
  ctx.fillStyle = K.coral; ctx.beginPath(); ctx.moveTo(x + w * 0.42, y + 370); ctx.lineTo(x + w * 0.66, y + 270); ctx.lineTo(x + w + 20, y + 370); ctx.fill();
  ctx.restore();
  [0.86, 0.74, 0.8, 0.52].forEach((k, i) => fillRR(ctx, x + 40, y + 404 + i * 34, (w - 80) * k, 14, 7, C.gray));
  fillRR(ctx, x + 40, y + 560, (w - 100) / 2, 84, 16, K.skyT);
  fillRR(ctx, x + 60 + (w - 100) / 2, y + 560, (w - 100) / 2, 84, 16, K.coralT);
  ctx.restore();
}
function stampDraw(ctx, cx, cy, s, rot, a) {
  if (a <= 0 || s <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.font = font(800, 66); ctx.letterSpacing = '4px';
  const tw = ctx.measureText('APPROVED').width, w = tw + 76, h = 124;
  fillRR(ctx, -w / 2, -h / 2, w, h, 24, 'rgba(255,255,255,0.88)');
  rr(ctx, -w / 2, -h / 2, w, h, 24); ctx.strokeStyle = K.mint; ctx.lineWidth = 8; ctx.stroke();
  rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 14); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = K.mint; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('APPROVED', 2, 4);
  ctx.restore();
}
// calendar geometry for any rect / row count
function calGeom(R, rows = 5) {
  const gx = R.x + 30, gy = R.y + 150, cw = (R.w - 60) / 7, ch = (R.h - 150 - 26) / rows;
  return { gx, gy, cw, ch, cell: (c, r) => ({ x: gx + c * cw, y: gy + r * ch, w: cw, h: ch }) };
}
function calHeader(ctx, R, a, check = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  flag(ctx, R.x + 62, R.y + 62, 30);
  fillRR(ctx, R.x + 110, R.y + 46, 250, 24, 12, C.ink);
  fillRR(ctx, R.x + 110, R.y + 82, 150, 14, 7, C.gray);
  for (let c = 0; c < 7; c++) fillRR(ctx, R.x + 30 + c * ((R.w - 60) / 7) + ((R.w - 60) / 7 - 44) / 2, R.y + 120, 44, 12, 6, C.line);
  ctx.restore();
  if (check > 0) {                // the approval stays with the plan as a small check badge
    ctx.save(); ctx.translate(R.x + R.w - 64, R.y + 62); ctx.scale(check, check);
    ctx.fillStyle = K.mint; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    checkIcon(ctx, 0, 0, 30, '#FFFFFF'); ctx.restore();
  }
}
function calSlots(ctx, R, rows, aFn) {
  const g = calGeom(R, rows);
  ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5;
  for (let r = 0; r < rows; r++) {
    const a = aFn(r); if (a <= 0) continue;
    for (let c = 0; c < 7; c++) {
      const s = 0.6 + 0.4 * E.outBack(a, 1.6), cl = g.cell(c, r), iw = cl.w - 16, ih = cl.h - 16;
      ctx.save(); ctx.globalAlpha *= clamp(a * 1.4);
      ctx.translate(cl.x + cl.w / 2, cl.y + cl.h / 2); ctx.scale(s, s);
      rr(ctx, -iw / 2, -ih / 2, iw, ih, 14); ctx.fillStyle = '#FAF9F6'; ctx.fill();
      ctx.strokeStyle = '#D9D5CB'; ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function scene1(ctx, t) {
  const pIn = ep(t, ...T.docIn, (v) => E.outBack(v, 1.05));
  const shake = t > T.stamp ? 9 * Math.exp(-(t - T.stamp) * 13) * Math.sin((t - T.stamp) * 70) : 0;
  const u = ep(t, ...T.unfold, E.inOutCubic);
  ctx.save(); ctx.translate(0, shake);
  if (u <= 0) {
    // the proposal slides up into frame and settles under the stamp
    const sq = 1 - 0.018 * Math.exp(-Math.max(0, t - T.stamp) * 10) * (t > T.stamp ? 1 : 0);
    const cx = DOC.x + DOC.w / 2, cy = DOC.y + DOC.h / 2 + 900 * (1 - pIn);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.14 * (1 - pIn)); ctx.scale(sq, sq); ctx.translate(-DOC.w / 2, -DOC.h / 2);
    const R = { x: 0, y: 0, w: DOC.w, h: DOC.h };
    card(ctx, 0, 0, DOC.w, DOC.h, 30, 0.8);
    proposalContent(ctx, R, 1);
    heroOutline(ctx, 0, 0, DOC.w, DOC.h, 30, 7);
    ctx.restore();
  } else {
    // the paper unfolds: two side flaps open on hinges into a blank content calendar
    const fl = ep(t, T.unfold[0], T.unfold[0] + 0.55, E.inOutCubic), fr = ep(t, T.unfold[0] + 0.45, T.unfold[1], E.inOutCubic);
    const lw = 150 * fl, rw = 150 * fr;
    const R = { x: DOC.x - lw, y: DOC.y, w: DOC.w + lw + rw, h: DOC.h };
    const done = fl >= 1 && fr >= 1;
    shadowed(ctx, 50, 18, 0.16, () => {
      fillRR(ctx, DOC.x, DOC.y, DOC.w, DOC.h, 30, C.surface);
      flap(ctx, DOC.x, DOC.y, DOC.h, -lw, fl);
      flap(ctx, DOC.x + DOC.w, DOC.y, DOC.h, rw, fr);
    });
    ctx.save();
    ctx.beginPath(); flapPath(ctx, DOC.x, DOC.y, DOC.h, -lw, fl); flapPath(ctx, DOC.x + DOC.w, DOC.y, DOC.h, rw, fr);
    rr(ctx, DOC.x, DOC.y, DOC.w, DOC.h, 30); ctx.clip();
    fillRR(ctx, R.x - 20, R.y, R.w + 40, R.h, 0, C.surface);
    proposalContent(ctx, DOC, 1 - ep(t, T.unfold[0], T.unfold[0] + 0.35));
    calHeader(ctx, CAL, ep(t, T.unfold[0] + 0.2, T.unfold[0] + 0.7), 0);
    calSlots(ctx, CAL, 3, (r) => ep(t, T.slots[0] + r * 0.12, T.slots[0] + r * 0.12 + 0.3));
    // fold shading on the flaps while they open
    shade(ctx, DOC.x, DOC.y, DOC.h, -lw, fl); shade(ctx, DOC.x + DOC.w, DOC.y, DOC.h, rw, fr);
    ctx.restore();
    heroOutline(ctx, R.x, R.y, R.w, R.h, 30, 7);
    if (done) calHeader(ctx, CAL, 0, E.outBack(ep(t, T.stampToBadge[1] - 0.15, T.stampToBadge[1] + 0.2), 1.8));
  }
  // APPROVED stamp: drops in on the downbeat, bounces, then shrinks into the header check badge
  const sIn = ep(t, T.stamp - 0.17, T.stamp, (v) => v * v);
  const tb = ep(t, ...T.stampToBadge, E.inOutCubic);
  if (sIn > 0 && tb < 1) {
    const s0 = lerp(1.9, 1, sIn) * (1 + spring(t, T.stamp, 0.1, 8, 30));
    const sx = lerp(DOC.x + DOC.w / 2 + 30, CAL.x + CAL.w - 64, tb), sy = lerp(DOC.y + DOC.h - 200, CAL.y + 62, tb);
    stampDraw(ctx, sx, sy, s0 * lerp(1, 0.16, tb), lerp(-0.16, 0, tb), sIn * (1 - tb * tb));
    if (t > T.stamp) {             // ink ring on impact
      const k = ep(t, T.stamp, T.stamp + 0.45, E.outCubic);
      ctx.save(); ctx.globalAlpha = 0.5 * (1 - k); ctx.strokeStyle = K.mint; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(sx, sy, 250 + 140 * k, 90 + 70 * k, -0.16, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  confetti(ctx, t, T.stamp, DOC.x + DOC.w / 2 + 30, DOC.y + DOC.h - 230, 12, 3, 0.9);
  ctx.restore();
}
function flapPath(ctx, hx, y, h, dw, p) {        // trapezoid: hinge edge full height, far edge foreshortened
  const k = (1 - p) * 70;
  ctx.moveTo(hx, y); ctx.lineTo(hx + dw, y + k); ctx.lineTo(hx + dw, y + h - k); ctx.lineTo(hx, y + h); ctx.closePath();
}
function flap(ctx, hx, y, h, dw, p) {
  if (Math.abs(dw) < 0.5) return;
  ctx.beginPath(); flapPath(ctx, hx, y, h, dw, p); ctx.fillStyle = C.surface; ctx.fill();
}
function shade(ctx, hx, y, h, dw, p) {
  if (Math.abs(dw) < 0.5 || p >= 1) return;
  const g = ctx.createLinearGradient(hx, 0, hx + dw, 0);
  g.addColorStop(0, `rgba(31,31,31,${0.02 * (1 - p)})`); g.addColorStop(1, `rgba(31,31,31,${0.1 * (1 - p)})`);
  ctx.beginPath(); flapPath(ctx, hx, y, h, dw, p); ctx.fillStyle = g; ctx.fill();
}

// ---------- 2 · idea notes ----------
const NOTE_T = [C.yTint, K.skyT, K.coralT, K.violetT, K.mintT];
const NOTE_C = [C.yellow, K.sky, K.coral, K.violet, K.mint];
const NOTES = [ // scattered position, rotation, target slot for the three the cursor places
  { x: 300, y: 930, r: -0.1, slot: [1, 1] }, { x: 560, y: 900, r: 0.08, slot: [3, 1] }, { x: 790, y: 950, r: -0.06, slot: [5, 1] },
  { x: 250, y: 1180, r: 0.12 }, { x: 450, y: 1230, r: -0.05 }, { x: 640, y: 1170, r: 0.1 },
  { x: 830, y: 1240, r: -0.12 }, { x: 540, y: 1340, r: 0.05 },
];
const NOTE_S = 112;
function note(ctx, cx, cy, rot, s, i, a = 1) {
  if (s <= 0 || a <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= a;
  const h = NOTE_S / 2;
  shadowed(ctx, 16, 6, 0.14, () => fillRR(ctx, -h, -h, NOTE_S, NOTE_S, 10, NOTE_T[i % 5]));
  ctx.save(); rr(ctx, -h, -h, NOTE_S, NOTE_S, 10); ctx.clip(); ctx.fillStyle = NOTE_C[i % 5]; ctx.fillRect(-h, -h, NOTE_S, 18); ctx.restore();
  fillRR(ctx, -h + 16, -h + 38, NOTE_S - 32, 11, 5.5, 'rgba(31,31,31,0.32)');
  fillRR(ctx, -h + 16, -h + 60, NOTE_S - 50, 11, 5.5, 'rgba(31,31,31,0.18)');
  fillRR(ctx, -h + 16, -h + 82, NOTE_S - 62, 11, 5.5, 'rgba(31,31,31,0.18)');
  ctx.restore();
}
// where note i is at time t (before the stack sweep)
function notePose(i, t, R) {
  const n = NOTES[i];
  let x = n.x, y = n.y, r = n.r;
  if (n.slot) {
    const g = calGeom(R, 5), cl = g.cell(...n.slot);
    const [a, b] = T.place[i];
    const p = ep(t, a, b, E.inOutCubic);
    x = lerp(x, cl.x + cl.w / 2, p); y = lerp(y, cl.y + cl.h / 2, p) - 26 * Math.sin(Math.PI * p); r = lerp(r, 0.02 * (i - 1), p);
  }
  return { x, y, r };
}
const STACK = { x: 540, y: 1040 };
function cursorPos(t, R) {
  // waypoints: enter -> note 0 -> drop -> note 1 -> drop -> note 2 -> drop -> drift away
  const pts = [];
  pts.push([4.15, 1010, 1520]);
  T.place.forEach(([a, b], i) => {
    const s = notePose(i, a, R), e = notePose(i, b, R);
    pts.push([a - 0.02, s.x + 8, s.y + 8], [b, e.x + 8, e.y + 8]);
  });
  pts.push([6.15, 930, 1500]);
  if (t <= pts[0][0]) return { x: pts[0][1], y: pts[0][2] };
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, x0, y0] = pts[i - 1], [t1, x1, y1] = pts[i];
      const p = E.inOutCubic(clamp((t - t0) / (t1 - t0)));
      return { x: lerp(x0, x1, p), y: lerp(y0, y1, p) };
    }
  }
  return { x: pts[pts.length - 1][1], y: pts[pts.length - 1][2] };
}

// the campaign card in its compact form; it gains structure stage by stage:
// ideas -> proposal (cover) -> plan (sections) -> calendar (grid). Drawn in local 220 x 150 units.
const MINI = [K.violetT, C.yTint, K.skyT, K.coralT, K.violetT, K.skyT, C.yTint];
function heroStaged(ctx, R, st = {}) {
  const a = st.a || 0, b = st.b || 0, c = st.c || 0, chips = st.chips ?? 1;
  ctx.save(); ctx.translate(R.x, R.y); ctx.scale(R.w / 220, R.h / 150);
  card(ctx, 0, 0, 220, 150, 22, st.lift ?? 0.7);
  flag(ctx, 30, 30, 18);
  fillRR(ctx, 56, 20, 96, 13, 6.5, C.ink);
  fillRR(ctx, 56, 40, 60, 9, 4.5, C.gray);
  const B = { x: 16, y: 60, w: 188, h: 76 };
  // ideas
  const ia = 1 - b;
  if (ia > 0) [C.yTint, K.skyT, K.coralT].forEach((col, i) => {
    const s = E.outBack(clamp(chips * 3 - i), 1.6) ;
    if (s <= 0) return;
    ctx.save(); ctx.globalAlpha *= ia; ctx.translate(B.x + 17 + i * 38, B.y + 22); ctx.scale(s, s);
    fillRR(ctx, -15, -15, 30, 30, 7, col); fillRR(ctx, -15, -15, 30, 7, 3, NOTE_C[i]); ctx.restore();
  });
  // proposal: a cover block
  if (a > 0 && c < 1) {
    const k = E.outBack(a, 1.4);
    ctx.save(); ctx.globalAlpha *= (1 - c);
    ctx.translate(B.x + B.w - 34, B.y + B.h / 2); ctx.scale(k, k);
    ctx.save(); rr(ctx, -34, -38, 68, 76, 10); ctx.fillStyle = K.violetT; ctx.fill(); ctx.clip();
    ctx.fillStyle = K.sky; ctx.beginPath(); ctx.arc(14, -16, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.moveTo(-40, 38); ctx.lineTo(-6, 2); ctx.lineTo(26, 38); ctx.fill();
    ctx.restore(); ctx.restore();
  }
  // plan: section bars
  if (b > 0 && c < 1) {
    [[K.violet, 0.66], [K.sky, 0.5], [K.coral, 0.58]].forEach(([col, k], j) => {
      const p = E.outBack(clamp(b * 1.6 - j * 0.3), 1.3);
      if (p > 0) { ctx.save(); ctx.globalAlpha *= (1 - c); fillRR(ctx, B.x, B.y + 6 + j * 25, (B.w - 84) * k * p / 0.66, 15, 7.5, col); ctx.restore(); }
    });
  }
  // calendar: a mini month grid
  if (c > 0) {
    const cw = B.w / 7, ch = B.h / 3;
    for (let r = 0; r < 3; r++) for (let q = 0; q < 7; q++) {
      const k = clamp(c * 2 - (q + r * 7) / 21);
      if (k <= 0) continue;
      const s = E.outBack(k, 1.6);
      ctx.save(); ctx.translate(B.x + q * cw + cw / 2, B.y + r * ch + ch / 2); ctx.scale(s, s);
      fillRR(ctx, -(cw - 5) / 2, -(ch - 5) / 2, cw - 5, ch - 5, 4, (q * 3 + r * 5) % 4 === 1 ? '#F3F1EC' : MINI[(q + r * 2) % 7]);
      ctx.restore();
    }
  }
  heroOutline(ctx, 0, 0, 220, 150, 22, 6);
  ctx.restore();
}
const stage = (t, i) => ep(t, T.pick[i], T.pick[i] + 0.4);
const heroStages = (t) => ({ a: stage(t, 0), b: stage(t, 1), c: stage(t, 2) });

function scene2(ctx, t) {
  const g = ep(t, ...T.grow, E.inOutCubic), sc = 1 + 0.03 * g;
  const fold = ep(t, ...T.fold, E.inOutQuart);
  const mo = ep(t, ...T.month, E.inOutCubic);
  const st = (i) => ep(t, T.stack[0] + i * 0.03, T.stack[1] + i * 0.015, E.inOutCubic);
  const SLOT_A = slotOf(0);
  // calendar (opening into the month view, then folding into the campaign card)
  const R = fold > 0 ? lerpR(CAL, SLOT_A, fold) : CAL;
  ctx.save();
  if (fold <= 0) { ctx.translate(540, 1050); ctx.scale(sc, sc); ctx.translate(-540, -1050); }
  const rad = lerp(30, 22, fold);
  card(ctx, R.x, R.y, R.w, R.h, rad, 0.8);
  if (fold < 0.55) {
    ctx.save(); ctx.globalAlpha = 1 - clamp(fold / 0.5);
    calHeader(ctx, CAL, 1, 1);
    if (mo < 1) { ctx.save(); ctx.globalAlpha *= 1 - mo; calSlots(ctx, CAL, 3, () => 1); ctx.restore(); }
    calSlots(ctx, CAL, 5, (r) => ep(t, T.month[0] + 0.1 + r * 0.07, T.month[0] + 0.4 + r * 0.07));
    ctx.restore();
  }
  if (fold > 0.5) heroStaged(ctx, R, { chips: ep(t, T.fold[1] - 0.15, T.fold[1] + 0.3) });
  else heroOutline(ctx, R.x, R.y, R.w, R.h, rad, 7);
  // idea cards: arrive quickly, the cursor tries to organize them, then they stack neatly
  NOTES.forEach((n, i) => {
    const t0 = T.ideas[i];
    if (t < t0) return;
    const s = E.outBack(ep(t, t0, t0 + 0.3), 1.7);
    const p = notePose(i, t, CAL);
    const k = st(i);
    let x = lerp(p.x, STACK.x + (i - 3.5) * 2.5, k), y = lerp(p.y, STACK.y - i * 5, k), r = lerp(p.r, (i % 2 ? 1 : -1) * 0.03, k);
    let ss = s, a = 1;
    if (fold > 0) {             // the stack rides into the campaign card's idea chips
      x = lerp(x, SLOT_A.x + 54, fold); y = lerp(y, SLOT_A.y + 82, fold);
      ss = s * lerp(1, 0.26, fold); a = 1 - ep(fold, 0.55, 0.9);
    }
    note(ctx, x, y, r, ss, i, a);
  });
  ctx.restore();
  const ca = ep(t, 4.15, 4.35) * (1 - ep(t, 5.95, 6.2));
  if (ca > 0) {
    const c = cursorPos(t, CAL);
    ctx.save(); ctx.globalAlpha = ca;
    ctx.translate(540, 1050); ctx.scale(sc, sc); ctx.translate(-540, -1050);
    const down = T.place.some(([a, b]) => t > a - 0.04 && t < b + 0.02);
    cursor(ctx, c.x, c.y, down ? 1.25 : 1.35);
    ctx.restore();
  }
}

// ---------- 3 · the template sequence ----------
function tplCard(ctx, i, t, o = {}) {
  const R = o.R || tplRect(i), d = TPL[i];
  const inP = ep(t, T.tpl[i] - 0.3, T.tpl[i], (v) => E.outBack(v, 1.15));
  if (inP <= 0) return;
  const dir = i % 2 ? 1 : -1;
  ctx.save(); ctx.globalAlpha *= (o.a ?? 1);
  ctx.translate(dir * 900 * (1 - inP) + (o.dx || 0), (o.dy || 0));
  card(ctx, R.x, R.y, R.w, R.h, 26, 0.5);
  const la = o.labelA ?? 1;
  if (la > 0) {
    ctx.save(); ctx.globalAlpha *= la;
    ctx.font = font(800, 50); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(d.label, R.x + 40, R.y + 92);
    editBadge(ctx, R.x + 64, R.y + 158, 24);
    fillRR(ctx, R.x + 104, R.y + 150, 120, 16, 8, d.col);
    fillRR(ctx, R.x + 236, R.y + 150, 90, 16, 8, C.line);
    // the dock where the campaign card lands
    const S = slotOf(i);
    ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = '#D9D5CB';
    rr(ctx, S.x, S.y + (R.y - TPL[i].y), S.w, S.h, 22); ctx.fillStyle = '#FAF9F6'; ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  // a pulse when the campaign card picks up this stage's structure
  const pk = ep(t, T.pick[i], T.pick[i] + 0.5, E.outCubic);
  if (pk > 0 && pk < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - pk; rr(ctx, R.x - 6 - 10 * pk, R.y - 6 - 10 * pk, R.w + 12 + 20 * pk, R.h + 12 + 20 * pk, 30);
    ctx.strokeStyle = d.col; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function connectors(ctx, t, a = 1) {
  // dotted links between the stages: a clear sequence, not a pile
  [[0, 1], [1, 2]].forEach(([i, j]) => {
    const p = ep(t, T.tpl[j] + 0.05, T.tpl[j] + 0.35);
    if (p <= 0) return;
    const x = slotOf(i).x + 110, y0 = slotOf(i).y + 150 + 8, y1 = slotOf(j).y - 8;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.gray2; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 12]);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, lerp(y0, y1, p)); ctx.stroke(); ctx.restore();
  });
}
function heroSeqRect(t) {
  let R = slotOf(0);
  R = lerpR(R, slotOf(1), ep(t, ...T.toB, E.inOutCubic));
  R = lerpR(R, slotOf(2), ep(t, ...T.toC, E.inOutCubic));
  return R;
}
function scene3(ctx, t) {
  const out = ep(t, ...T.tplOut, E.inOutCubic);
  connectors(ctx, t, 1 - out);
  [0, 1].forEach((i) => tplCard(ctx, i, t, { a: 1 - out, dx: (i % 2 ? 1 : -1) * 260 * out }));
  tplCard(ctx, 2, t);
  const R = heroSeqRect(t);
  const lift = Math.sin(Math.PI * ep(t, ...T.toB)) + Math.sin(Math.PI * ep(t, ...T.toC));
  heroStaged(ctx, { ...R, y: R.y - 14 * lift }, { ...heroStages(t), lift: 0.6 + 0.4 * lift });
}

// ---------- 4 · the month ----------
const POSTS = [ // [col, row, type]; the first is the campaign post (the hero)
  [2, 1, 'camp'], [0, 0, 'post'], [2, 0, 'reel'], [4, 0, 'post'], [6, 0, 'camp'], [1, 1, 'post'],
  [4, 1, 'reel'], [0, 2, 'post'], [3, 2, 'camp'], [5, 2, 'post'], [1, 3, 'reel'], [3, 3, 'post'], [5, 4, 'camp'],
];
function chip(ctx, x, y, w, h, type, o = {}) {
  const ty = TYPES[type], r = 14;
  shadowed(ctx, 12 + 16 * (o.lift || 0), 4 + 6 * (o.lift || 0), 0.13, () => fillRR(ctx, x, y, w, h, r, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
  ctx.fillStyle = ty.tint; ctx.fillRect(x, y, w, h * 0.56);
  ctx.restore();
  typeIcon(ctx, type, x + w / 2, y + h * 0.28, h * 0.3, ty.col);
  fillRR(ctx, x + w * 0.14, y + h * 0.66, w * 0.72, h * 0.08, h * 0.04, 'rgba(31,31,31,0.3)');
  fillRR(ctx, x + w * 0.14, y + h * 0.8, w * 0.46, h * 0.08, h * 0.04, C.gray);
  if (o.hero) heroOutline(ctx, x, y, w, h, r, Math.max(4, h * 0.045));
}
function legend(ctx, t) {
  const items = ['post', 'reel', 'camp'];
  ctx.save();
  ctx.font = font(800, 40); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const ws = items.map((k) => ctx.measureText(TYPES[k].label).width + 104);
  let x = W / 2 - (ws.reduce((a, b) => a + b, 0) + 20 * 2) / 2;
  items.forEach((k, i) => {
    const s = E.outBack(ep(t, T.legend[i], T.legend[i] + 0.34), 1.7);
    if (s > 0) {
      ctx.save(); ctx.translate(x + ws[i] / 2, 600); ctx.scale(s, s); ctx.translate(-ws[i] / 2, -36);
      shadowed(ctx, 16, 5, 0.1, () => fillRR(ctx, 0, 0, ws[i], 72, 36, C.surface));
      ctx.fillStyle = TYPES[k].tint; ctx.beginPath(); ctx.arc(38, 36, 24, 0, Math.PI * 2); ctx.fill();
      typeIcon(ctx, k, 38, 36, 26, TYPES[k].col);
      ctx.fillStyle = C.ink; ctx.fillText(TYPES[k].label, 74, 38);
      ctx.restore();
    }
    x += ws[i] + 20;
  });
  ctx.restore();
}
function postRect(i) {
  const g = calGeom(CAL2, 5), [c, r] = POSTS[i], cl = g.cell(c, r);
  return { x: cl.x + 8, y: cl.y + 8, w: cl.w - 16, h: cl.h - 16 };
}
function zoomCam(t) {
  // a slow move across the calendar, then a push into the campaign card
  const pp = ep(t, ...T.pan, E.inOutCubic);
  const b = { s: 1 + 0.04 * pp, cx: lerp(520, 560, pp), cy: lerp(1040, 1060, pp) };
  const z = ep(t, ...T.zoom, E.inOutQuart);
  const R = postRect(0), fx = R.x + R.w / 2, fy = R.y + R.h / 2;
  return { s: lerp(b.s, 5, z), cx: lerp(b.cx, fx, z), cy: lerp(b.cy, fy, z), z };
}
function scene4(ctx, t) {
  const cam = zoomCam(t);
  ctx.save();
  ctx.translate(540, 1040); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);
  // "Content Calendar" opens into the month: the card grows, its label fades out
  const ex = ep(t, ...T.expand, E.inOutQuart);
  const R = lerpR(tplRect(2), CAL2, ex);
  if (ex < 1) tplCard(ctx, 2, t, { R, labelA: 1 - ep(t, T.expand[0], T.expand[0] + 0.25) });
  const ca = ep(ex, 0.35, 1);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca;
    card(ctx, R.x, R.y, R.w, R.h, 26, 0.7);
    calHeader(ctx, R, 1, 0);
    calSlots(ctx, R, 5, () => ep(ex, 0.6, 1));
    ctx.restore();
    heroOutline(ctx, R.x, R.y, R.w, R.h, 26, 7, ca);
  }
  // other post cards land in dates on the 8ths
  POSTS.forEach((p, i) => {
    if (!i) return;
    const t0 = T.postsIn + (i - 1) * 0.25;
    if (t < t0) return;
    const k = ep(t, t0, t0 + 0.38, (v) => E.outBack(v, 1.3));
    const Rp = postRect(i), dy = (1 - k) * 380, a = ep(t, t0, t0 + 0.12);
    ctx.save(); ctx.globalAlpha = a;
    chip(ctx, Rp.x, Rp.y + dy, Rp.w, Rp.h, p[2], { lift: 1 - k });
    ctx.restore();
  });
  // the campaign card lands in its date slot and stays in view (it becomes the campaign post)
  const hk = ep(t, ...T.heroToCell, E.inOutCubic);
  const Rh = lerpR(slotOf(2), postRect(0), hk);
  Rh.y -= Math.sin(Math.PI * hk) * 60;
  const swap = ep(hk, 0.55, 1);
  if (swap < 1) { ctx.save(); ctx.globalAlpha = 1 - swap; heroStaged(ctx, Rh, { a: 1, b: 1, c: 1, lift: 1 }); ctx.restore(); }
  if (swap > 0) {
    const float = Math.sin((t - 12) * 2.2) * 2 * (1 - cam.z);
    ctx.save(); ctx.globalAlpha = swap;
    chip(ctx, Rh.x, Rh.y + float, Rh.w, Rh.h, 'camp', { hero: true, lift: 1 - hk * 0.6 });
    ctx.restore();
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 1 - cam.z; legend(ctx, t); ctx.restore();
}

// ---------- 5 · scheduling queue ----------
const QTYPES = ['camp', 'post', 'reel', 'post'];
function queueCard(ctx, R, type, o = {}) {
  const ty = TYPES[type], r = 24, { x, y, w, h } = R;
  shadowed(ctx, 18 + 26 * (o.lift || 0), 6 + 12 * (o.lift || 0), 0.12 + 0.06 * (o.lift || 0), () => fillRR(ctx, x, y, w, h, r, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip(); ctx.fillStyle = ty.col; ctx.fillRect(x, y, 10, h); ctx.restore();
  const th = h - 40;
  fillRR(ctx, x + 30, y + 20, th, th, 16, ty.tint);
  typeIcon(ctx, type, x + 30 + th / 2, y + 20 + th / 2, th * 0.42, ty.col);
  fillRR(ctx, x + th + 60, y + 34, w * 0.36, 20, 10, 'rgba(31,31,31,0.82)');
  ctx.save();
  ctx.font = font(800, 36); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const lw = ctx.measureText(ty.label).width + 40;
  fillRR(ctx, x + th + 60, y + 78, lw, 58, 29, ty.tint);
  ctx.fillStyle = C.ink; ctx.fillText(ty.label, x + th + 80, y + 108);
  ctx.restore();
  if ((o.badge ?? 0) > 0) {        // clock badge: in the scheduling queue
    const s = E.outBack(o.badge, 1.8);
    ctx.save(); ctx.translate(x + w - 66, y + h / 2); ctx.scale(s, s);
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fill();
    clockIcon(ctx, 0, 0, 18, C.ink); ctx.restore();
  }
  if (o.hero) heroOutline(ctx, x, y, w, h, r, 6);
}
function panel(ctx, t, a) {
  if (a <= 0) return;
  const R = PANEL;
  ctx.save(); ctx.globalAlpha *= a;
  shadowed(ctx, 60, 22, 0.13, () => fillRR(ctx, R.x, R.y, R.w, R.h, 30, C.surface));
  ctx.save(); rr(ctx, R.x, R.y, R.w, R.h, 30); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(R.x, R.y, R.w, 108); ctx.fillStyle = C.line; ctx.fillRect(R.x, R.y + 107, R.w, 1.5);
  ctx.restore();
  const LOGO = getLogo(), lh = 46, lw = lh * (LOGO.width / LOGO.height); // native ratio
  ctx.drawImage(LOGO, R.x + 36, R.y + 54 - lh / 2, lw, lh);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(R.x + R.w - 62, R.y + 54, 30, 0, Math.PI * 2); ctx.fill();
  clockIcon(ctx, R.x + R.w - 62, R.y + 54, 15, C.ink);
  // empty slots
  ctx.setLineDash([12, 9]); ctx.lineWidth = 2.5; ctx.strokeStyle = '#D9D5CB';
  for (let i = 0; i < 4; i++) { const s = qSlot(i); rr(ctx, s.x, s.y, s.w, s.h, 24); ctx.fillStyle = '#FAF9F6'; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function heroQueueRect(t) {
  // zoomed chip (square, screen centre) -> wide post card -> dragged into slot 1
  const m = ep(t, T.zoom[1] - 0.05, T.grab, E.inOutCubic);
  const P0 = postRect(0), Z = { x: 540 - P0.w * 2.5, y: 1040 - P0.h * 2.5, w: P0.w * 5, h: P0.h * 5 };
  const B = { x: 170, y: 1010, w: QCARD.w, h: QCARD.h };
  let R = lerpR(Z, B, m);
  const d = ep(t, ...T.drag, E.inOutCubic);
  R = lerpR(R, qSlot(0), d);
  R.y -= Math.sin(Math.PI * d) * 40;
  return { R, m, d };
}
function scene5(ctx, t, inEnd = false) {
  const pa = ep(t, ...T.queueIn, E.outCubic) * (1 - ep(t, T.sweep[0], T.sweep[0] + 0.4));
  ctx.save(); ctx.translate(0, 60 * (1 - ep(t, ...T.queueIn, E.outCubic)));
  const bob = t > T.organized ? Math.sin((t - T.organized) * 2.4) * 5 * (1 - ep(t, 23.9, T.sweep[0])) : 0;
  ctx.translate(0, bob);
  panel(ctx, t, pa);
  // the bright accent once the queue is organized
  const ok = ep(t, T.organized, T.organized + 0.7);
  if (ok > 0 && ok < 1 && pa > 0) {
    ctx.save(); rr(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 30); ctx.clip();
    const sx = lerp(PANEL.x - 400, PANEL.x + PANEL.w + 400, E.inOutCubic(ok));
    const g = ctx.createLinearGradient(sx - 220, 0, sx + 220, 0);
    g.addColorStop(0, 'rgba(255,205,66,0)'); g.addColorStop(0.5, 'rgba(255,205,66,0.35)'); g.addColorStop(1, 'rgba(255,205,66,0)');
    ctx.fillStyle = g; ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.restore();
  }
  const okRing = ep(t, T.organized, T.organized + 0.5, E.outCubic);
  if (okRing > 0 && okRing < 1) {
    ctx.save(); ctx.globalAlpha = 1 - okRing; rr(ctx, PANEL.x - 8 - 14 * okRing, PANEL.y - 8 - 14 * okRing, PANEL.w + 16 + 28 * okRing, PANEL.h + 16 + 28 * okRing, 36);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
  }
  // the others follow into the queue
  T.follow.forEach((t0, i) => {
    if (inEnd || t < t0 - 0.45) return;
    const k = ep(t, t0 - 0.45, t0, (v) => E.outBack(v, 1.2));
    const S = qSlot(i + 1), R = { ...S, y: lerp(H + 80, S.y, k) };
    queueCard(ctx, R, QTYPES[i + 1], { badge: ep(t, t0 + 0.05, t0 + 0.35), lift: 1 - k });
  });
  if (!inEnd) {
    const { R, m, d } = heroQueueRect(t);
    if (m < 0.4) {
      ctx.save(); ctx.globalAlpha = 1 - m * 2.5; chip(ctx, R.x, R.y, R.w, R.h, 'camp', { hero: true, lift: 1 }); ctx.restore();
    }
    if (m > 0.35) {
      ctx.save(); ctx.globalAlpha = clamp((m - 0.35) / 0.4);
      queueCard(ctx, R, 'camp', { hero: true, lift: d < 1 ? 1 : 0, badge: ep(t, T.drag[1], T.drag[1] + 0.3) });
      ctx.restore();
    }
    // the agency drags the campaign post into the queue
    const ca = ep(t, T.grab - 0.3, T.grab) * (1 - ep(t, T.drag[1] + 0.25, T.drag[1] + 0.5));
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha = ca;
      const cx = lerp(980, R.x + R.w * 0.55, ep(t, T.grab - 0.3, T.grab, E.outCubic)), cy = lerp(1500, R.y + R.h * 0.55, ep(t, T.grab - 0.3, T.grab, E.outCubic));
      cursor(ctx, t < T.grab ? cx : R.x + R.w * 0.55, t < T.grab ? cy : R.y + R.h * 0.55, t > T.grab - 0.03 && t < T.drag[1] ? 1.25 : 1.35);
      ctx.restore();
    }
  }
  ctx.restore();
  if (t > T.organized) {
    [[PANEL.x - 6, PANEL.y - 8, C.yellow, 30], [PANEL.x + PANEL.w - 20, PANEL.y + 150, K.sky, 24], [PANEL.x + 10, PANEL.y + PANEL.h - 80, K.coral, 26], [PANEL.x + PANEL.w - 40, PANEL.y + PANEL.h - 20, K.violet, 30]].forEach(([x, y, col, s], i) => {
      const k = ep(t, T.organized + i * 0.06, T.organized + 0.5 + i * 0.06);
      if (k <= 0 || k >= 1) return;
      ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * k); sparkle(ctx, x, y, s * (0.6 + 0.6 * k), col); ctx.restore();
    });
  }
}

// ---------- 6 · end card ----------
const CTA = 'START YOUR RECURPOST TRIAL';
const CTA_FS = 48;
function endLayout() {
  const LOGO = getLogo(), lw = 840, lh = lw / (LOGO.width / LOGO.height); // native ratio, never altered
  return { logo: { x: (W - lw) / 2, y: 846, w: lw, h: lh }, pill: { x: (W - 846) / 2, y: 1030, w: 846, h: 128 }, tagY: [672, 752] };
}
function scene6(ctx, t) {
  const L6 = endLayout(), P = L6.pill, pc = { x: P.x + P.w / 2, y: P.y + P.h / 2 };
  scene5(ctx, t, true);
  // the queue cards sweep together along an arc into the CTA position (campaign card last, on top)
  [3, 2, 1, 0].forEach((i) => {
    const S = qSlot(i), c0 = { x: S.x + S.w / 2, y: S.y + S.h / 2 };
    const k = ep(t, T.sweep[0] + (3 - i) * 0.05, T.sweep[1] - i * 0.04, E.inOutCubic);
    const side = i % 2 ? 1 : -1, ctrl = { x: 540 + side * 240, y: lerp(c0.y, pc.y, 0.5) - 80 };
    const q = (a, b, cc) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * cc + k * k * b;
    const x = q(c0.x, pc.x, ctrl.x), y = q(c0.y, pc.y, ctrl.y);
    const rot = Math.sin(Math.PI * k) * 0.12 * side;
    if (i > 0) {
      const a = 1 - ep(k, 0.7, 1);
      if (a <= 0) return;
      const s = lerp(1, 0.86, k);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      queueCard(ctx, { x: -S.w / 2, y: -S.h / 2, w: S.w, h: S.h }, QTYPES[i], { badge: 1, lift: Math.sin(Math.PI * k) });
      ctx.restore();
      return;
    }
    // the campaign card becomes the CTA
    const m = ep(t, ...T.cta, E.inOutCubic);
    const w = lerp(S.w, P.w, m), h = lerp(S.h, P.h, m), rad = lerp(24, P.h / 2, m);
    const sp = 1 + spring(t, T.cta[1], 0.05, 8, 22);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot * (1 - m)); ctx.scale(sp, sp); ctx.translate(-w / 2, -h / 2);
    if (m < 0.6) { ctx.save(); ctx.globalAlpha = 1 - m / 0.6; queueCard(ctx, { x: 0, y: 0, w, h }, 'camp', { hero: true, badge: 1, lift: Math.sin(Math.PI * k) }); ctx.restore(); }
    if (m > 0.3) {
      const a = clamp((m - 0.3) / 0.5);
      ctx.save(); ctx.globalAlpha = a;
      shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, 0, 0, w, h, rad, C.yellow));
      ctx.font = font(800, CTA_FS); ctx.letterSpacing = '1px'; ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = a * ep(m, 0.65, 1);
      ctx.fillText(CTA, w / 2, h / 2 + CTA_FS * 0.04);
      ctx.restore();
    }
    ctx.restore();
  });
  // a soft ring as the CTA lands
  const rg = ep(t, T.cta[1], T.cta[1] + 0.5, E.outCubic);
  if (rg > 0 && rg < 1) {
    ctx.save(); ctx.globalAlpha = 0.8 * (1 - rg); rr(ctx, P.x - 10 - 26 * rg, P.y - 10 - 26 * rg, P.w + 20 + 52 * rg, P.h + 20 + 52 * rg, P.h / 2 + 20);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  }
  // logo, tagline
  const lp = ep(t, ...T.logo, E.outQuint);
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha = lp;
    ctx.drawImage(getLogo(), L6.logo.x, L6.logo.y + 30 * (1 - lp), L6.logo.w, L6.logo.h);
    ctx.restore();
  }
  ctx.save();
  ctx.font = font(800, 64); ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.letterSpacing = '0px';
  ['CARRY THE PLAN', 'INTO YOUR WORKFLOW'].forEach((s, j) => {
    const p = ep(t, T.tag + j * 0.08, T.tag + j * 0.08 + 0.4, E.outQuint);
    if (p > 0) riseText(ctx, s, W / 2, L6.tagY[j], p, 76, 78);
  });
  ctx.restore();
}

// ---------- frame ----------
function mainScene(ctx, t) {
  bg(ctx, t);
  // a gentle float on the stage keeps every hold alive; it settles before the end card
  const fl = 1 - ep(t, 24.1, 24.9);
  ctx.save(); ctx.translate(540, 1040); ctx.rotate(0.004 * Math.sin(t * 1.1) * fl); ctx.scale(1 + 0.008 * Math.sin(t * 0.9) * fl, 1 + 0.008 * Math.sin(t * 0.9) * fl);
  ctx.translate(-540, -1040 + 8 * Math.sin(t * 1.7) * fl);
  if (t < 3.5) scene1(ctx, t);
  else if (t < 7.0) scene2(ctx, t);
  else if (t < T.expand[0]) scene3(ctx, t);
  else if (t < T.zoom[1]) scene4(ctx, t);
  else if (t < T.sweep[0]) scene5(ctx, t);
  else scene6(ctx, t);
  ctx.restore();
  // headlines (always above the stage)
  headline(ctx, t, ['CLIENT WON.'], T.head1[0], T.head1[1], { fs: 124, band: 0, y0: 420 });
  headline(ctx, t, ['STRATEGY', 'CONTENT PLAN'], T.head2[0], T.head2[1], { fs: 96, band: 1, arrow: 0 });
  headline(ctx, t, ['START WITH AN', 'EDITABLE TEMPLATE'], T.head3[0], T.head3[1], { fs: 84, band: 1, y0: 330 });
  headline(ctx, t, ['PLAN.', 'ORGANIZE.', 'PREPARE.'], T.head4, T.head4Out, { fs: 96, gap: 102, y0: 300, bandMove: true });
  headline(ctx, t, ['FROM PLAN TO', 'SCHEDULING'], T.head5[0], T.head5[1], { band: 1 });
}
function renderAt(ctx, t) { mainScene(ctx, t); }

module.exports = { TL, renderAt, mainScene };
