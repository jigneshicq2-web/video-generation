// Scene 01 (hook / chaos) and Scene 02 (brand reveal).
const L = require('../lib');
const C = require('./common');
const { B, W, H, rr, card, text, ui, disp, hexA, ep, E, prog, lerp, clamp, platformTile, flowLine, sampleCurve } = L;

// ---------------- Scene 01: CHAOS ----------------
const FREEZE = 2.7;

// Fixed, art-directed layout (not random) so the chaos reads as designed.
const CARDS = [
  { t: 0.0, type: 'browser', x: 60, y: 630, w: 820, h: 520, r: -3 },
  { t: 0.12, type: 'platform', k: 'instagram', x: 780, y: 580, w: 170, h: 170, r: 8 },
  { t: 0.26, type: 'sheet', x: 300, y: 930, w: 700, h: 420, r: 4 },
  { t: 0.38, type: 'toast', label: 'Approval needed', c: 'warn', x: 120, y: 1290, w: 560, h: 110, r: -2 },
  { t: 0.52, type: 'platform', k: 'facebook', x: 110, y: 810, w: 150, h: 150, r: -10 },
  { t: 0.66, type: 'calendar', x: 520, y: 670, w: 470, h: 430, r: 6 },
  { t: 0.8, type: 'chat', label: 'Any update on the report?', x: 90, y: 1060, w: 600, h: 150, r: -4 },
  { t: 0.94, type: 'platform', k: 'linkedin', x: 820, y: 1170, w: 160, h: 160, r: 6 },
  { t: 1.08, type: 'analytics', x: 150, y: 670, w: 520, h: 360, r: -6 },
  { t: 1.22, type: 'dm', x: 470, y: 1230, w: 540, h: 140, r: 3 },
  { t: 1.36, type: 'platform', k: 'tiktok', x: 70, y: 1370, w: 150, h: 150, r: -8 },
  { t: 1.5, type: 'doc', label: 'Report_draft_v3', x: 560, y: 810, w: 430, h: 520, r: 5 },
  { t: 1.66, type: 'toast', label: 'Upload failed', c: 'error', x: 380, y: 630, w: 520, h: 110, r: 3 },
  { t: 1.82, type: 'browser', x: 140, y: 890, w: 780, h: 480, r: 2 },
  { t: 1.98, type: 'toast', label: 'New comment', c: 'secondary', x: 90, y: 730, w: 500, h: 110, r: -5 },
  { t: 2.14, type: 'sheet', x: 420, y: 1110, w: 600, h: 340, r: -3 },
  { t: 2.3, type: 'chat', label: 'Which account is this for?', x: 250, y: 1380, w: 640, h: 150, r: 2 },
  { t: 2.46, type: 'toast', label: 'Reminder: post at 5 PM', c: 'primary', x: 330, y: 750, w: 620, h: 110, r: -2 },
];

const FLASHES = [
  { t: 0.45, s: 'APPROVED?', x: 540, y: 910, r: -4, c: B.warn },
  { t: 0.8, s: 'POSTED?', x: 540, y: 1210, r: 3, c: B.secondary },
  { t: 1.15, s: "WHERE'S THE REPORT?", x: 540, y: 990, r: -3, c: '#FFFFFF' },
  { t: 1.5, s: 'CAN YOU POST THIS AGAIN?', x: 540, y: 1270, r: 2, c: B.accent },
  { t: 1.85, s: 'CLIENT WAITING...', x: 540, y: 950, r: -2, c: B.error },
  { t: 2.2, s: 'WHICH ACCOUNT?', x: 540, y: 1230, r: 3, c: B.warn },
];

// Camera punch keys (t, scale, dx, dy, rot) — quick snaps between framings.
const PUNCH = [
  [0.0, 1.18, 0, 40, 0], [0.3, 1.05, -30, 0, -0.01], [0.62, 1.14, 40, -30, 0.012], [0.95, 1.02, 0, 20, 0],
  [1.3, 1.16, -40, 30, -0.015], [1.62, 1.06, 30, -20, 0.01], [1.98, 1.2, 0, 0, -0.008], [2.32, 1.1, -20, 20, 0.012], [2.7, 1.25, 0, 0, 0],
];
function punchAt(t) {
  let i = 0;
  while (i < PUNCH.length - 1 && PUNCH[i + 1][0] <= t) i++;
  const a = PUNCH[i], b = PUNCH[Math.min(i + 1, PUNCH.length - 1)];
  if (a === b) return a;
  const k = E.outExpo(prog(t, a[0], a[0] + 0.12));
  const prev = PUNCH[Math.max(0, i - 1)];
  const from = i === 0 ? a : prev;
  void b;
  return [0, lerp(from[1], a[1], k), lerp(from[2], a[2], k), lerp(from[3], a[3], k), lerp(from[4], a[4], k)];
}

function drawChaosCard(ctx, c, tl) {
  const { x, y, w, h } = c;
  switch (c.type) {
    case 'browser': {
      card(ctx, x, y, w, h, { r: 22 });
      ctx.save();
      rr(ctx, x, y, w, 64, 22); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
      ['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 32 + i * 26, y + 32, 8, 0, 7); ctx.fill(); });
      const tabs = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'Sheets', 'Inbox', 'Drive', 'Calendar', 'Mail'];
      const n = Math.min(tabs.length, 3 + Math.floor(tl * 12));
      const tw = (w - 130) / n;
      for (let i = 0; i < n; i++) {
        const tx = x + 118 + i * tw;
        rr(ctx, tx, y + 14, tw - 6, 40, 10);
        ctx.fillStyle = i === n - 1 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'; ctx.fill();
        if (tw > 70) text(ctx, tabs[i], tx + (tw - 6) / 2, y + 35, { font: ui(600, 18), color: B.muted });
      }
      rr(ctx, x + 30, y + 84, w - 60, 44, 12); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
      C.lines(ctx, x + 40, y + 160, w - 80, 4, { lh: 34, th: 14 });
      C.postArt(ctx, x + 40, y + 310, (w - 100) / 2, h - 340, 1, 14);
      C.postArt(ctx, x + 60 + (w - 100) / 2, y + 310, (w - 100) / 2, h - 340, 3, 14);
      ctx.restore();
      break;
    }
    case 'platform':
      platformTile(ctx, c.k, x + w / 2, y + h / 2, w);
      break;
    case 'sheet': {
      card(ctx, x, y, w, h, { r: 18, fill: '#F4F6FB', stroke: 'rgba(0,0,0,0.1)' });
      text(ctx, 'Content_plan_FINAL_v7', x + 28, y + 36, { font: ui(700, 24), color: '#1B2140', align: 'left' });
      ctx.save(); ctx.strokeStyle = 'rgba(20,30,60,0.16)'; ctx.lineWidth = 2;
      const rows = 7, cols = 5, gy = y + 70, gh = h - 90;
      for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(x + 20, gy + (r * gh) / rows); ctx.lineTo(x + w - 20, gy + (r * gh) / rows); ctx.stroke(); }
      for (let cI = 0; cI <= cols; cI++) { ctx.beginPath(); ctx.moveTo(x + 20 + (cI * (w - 40)) / cols, gy); ctx.lineTo(x + 20 + (cI * (w - 40)) / cols, gy + gh); ctx.stroke(); }
      const cols2 = ['#FFD66B', '#9FE3C1', '#FFB0B0', '#B7C4FF'];
      for (let r = 1; r < rows; r++) for (let cI = 0; cI < cols; cI++) if ((r * 3 + cI) % 4 !== 0) {
        ctx.fillStyle = cI === 0 ? 'rgba(20,30,60,0.22)' : cols2[(r + cI) % 4];
        rr(ctx, x + 30 + (cI * (w - 40)) / cols, gy + (r * gh) / rows + 14, (w - 40) / cols - 22, gh / rows - 28, 5); ctx.fill();
      }
      ctx.restore();
      break;
    }
    case 'calendar': {
      card(ctx, x, y, w, h, { r: 22 });
      text(ctx, 'Calendar', x + 28, y + 40, { font: ui(700, 26), align: 'left' });
      const gx = x + 24, gy = y + 80, cw = (w - 48) / 7, ch = (h - 104) / 5;
      for (let r = 0; r < 5; r++) for (let cI = 0; cI < 7; cI++) {
        rr(ctx, gx + cI * cw + 3, gy + r * ch + 3, cw - 6, ch - 6, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
        if ((r * 7 + cI) % 3 === 0) { ctx.fillStyle = [B.primary, B.accent, B.secondary, B.error][(r + cI) % 4]; ctx.beginPath(); ctx.arc(gx + cI * cw + cw / 2, gy + r * ch + ch / 2, 8, 0, 7); ctx.fill(); }
      }
      break;
    }
    case 'toast': {
      const col = B[c.c];
      card(ctx, x, y, w, h, { r: 26 });
      ctx.save(); ctx.fillStyle = hexA(col, 0.18); rr(ctx, x + 20, y + 20, h - 40, h - 40, 16); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 20 + (h - 40) / 2, y + h / 2, 12, 0, 7); ctx.fill(); ctx.restore();
      text(ctx, c.label, x + h + 4, y + h / 2 - 12, { font: ui(700, 30), align: 'left' });
      text(ctx, 'just now', x + h + 4, y + h / 2 + 22, { font: ui(500, 22), color: B.muted, align: 'left' });
      break;
    }
    case 'chat': {
      card(ctx, x, y, w, h, { r: 30, fill: '#1E2A5A' });
      ctx.save(); ctx.fillStyle = B.accent; ctx.beginPath(); ctx.arc(x + 56, y + h / 2, 30, 0, 7); ctx.fill(); ctx.restore();
      text(ctx, 'CL', x + 56, y + h / 2 + 1, { font: ui(800, 22), color: '#1B1030' });
      text(ctx, 'Client', x + 104, y + 46, { font: ui(700, 24), color: B.muted, align: 'left' });
      text(ctx, c.label, x + 104, y + 92, { font: ui(600, 30), align: 'left' });
      break;
    }
    case 'analytics': {
      card(ctx, x, y, w, h, { r: 22 });
      text(ctx, 'Analytics', x + 28, y + 40, { font: ui(700, 26), align: 'left' });
      const bars = [0.4, 0.7, 0.5, 0.85, 0.6, 0.9, 0.45];
      bars.forEach((b, i) => {
        const bw = (w - 80) / bars.length;
        const bh = (h - 120) * b * clamp(tl * 3);
        rr(ctx, x + 40 + i * bw + 6, y + h - 30 - bh, bw - 12, bh, 6);
        ctx.fillStyle = i % 2 ? B.secondary : B.primary; ctx.fill();
      });
      break;
    }
    case 'dm': {
      card(ctx, x, y, w, h, { r: 26 });
      platformTile(ctx, 'instagram', x + 60, y + h / 2, 64);
      text(ctx, 'New message', x + 110, y + 50, { font: ui(700, 28), align: 'left' });
      C.lines(ctx, x + 110, y + 82, w - 160, 2, { lh: 22, th: 10 });
      ctx.save(); ctx.fillStyle = B.error; ctx.beginPath(); ctx.arc(x + w - 36, y + 36, 20, 0, 7); ctx.fill(); ctx.restore();
      text(ctx, '9+', x + w - 36, y + 37, { font: ui(800, 20) });
      break;
    }
    case 'doc': {
      card(ctx, x, y, w, h, { r: 16, fill: '#F4F6FB', stroke: 'rgba(0,0,0,0.1)' });
      text(ctx, c.label, x + 28, y + 42, { font: ui(700, 26), color: '#1B2140', align: 'left' });
      C.lines(ctx, x + 28, y + 90, w - 56, 6, { lh: 30, th: 12, color: 'rgba(20,30,60,0.15)' });
      ctx.save(); rr(ctx, x + 28, y + 290, w - 56, h - 330, 10); ctx.fillStyle = 'rgba(20,30,60,0.08)'; ctx.fill(); ctx.restore();
      break;
    }
  }
}

function chaosLayer(ctx, te, collapse = 0) {
  CARDS.forEach((c, i) => {
    const tl = te - c.t;
    if (tl < 0) return;
    const p = E.outBack(clamp(tl / 0.16), 2.2);
    // continuous drift so nothing is ever static
    const dx = Math.sin(te * 2.2 + i) * 14, dy = Math.cos(te * 1.8 + i * 1.3) * 12;
    const cx = c.x + c.w / 2 + dx, cy = c.y + c.h / 2 + dy;
    ctx.save();
    if (collapse > 0) {
      const k = E.inExpo(collapse);
      ctx.translate(lerp(cx, W / 2, k), lerp(cy, 860, k));
      ctx.rotate((c.r * Math.PI) / 180 + k * (i % 2 ? 1.4 : -1.4));
      ctx.scale(lerp(1, 0.04, k), lerp(1, 0.04, k));
      ctx.globalAlpha = 1 - clamp((collapse - 0.8) * 5);
    } else {
      ctx.translate(cx, cy);
      ctx.rotate((c.r * Math.PI) / 180);
      ctx.scale(lerp(0.5, 1, p), lerp(0.5, 1, p));
      ctx.globalAlpha = clamp(tl / 0.06);
    }
    ctx.translate(-c.w / 2, -c.h / 2);
    drawChaosCard(ctx, { ...c, x: 0, y: 0 }, tl);
    ctx.restore();
  });
}

function fitFont(ctx, str, weight, px, maxW, track = 0) {
  let s = px;
  while (s > 20 && L.measure(ctx, str, disp(weight, s), track) > maxW) s -= 2;
  return s;
}

function sticker(ctx, f, t) {
  const tl = t - f.t;
  if (tl < 0 || tl > 0.5) return;
  const inP = E.outBack(clamp(tl / 0.1), 2.5);
  const outA = 1 - clamp((tl - 0.38) / 0.12);
  const size = fitFont(ctx, f.s, 800, 76, 880, 1);
  const tw = L.measure(ctx, f.s, disp(800, size), 1);
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate((f.r * Math.PI) / 180);
  ctx.scale(lerp(1.6, 1, inP), lerp(1.6, 1, inP));
  ctx.globalAlpha = outA;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  rr(ctx, -tw / 2 - 34, -size * 0.78, tw + 68, size * 1.56, 18);
  ctx.fillStyle = f.c; ctx.fill();
  ctx.shadowColor = 'transparent';
  text(ctx, f.s, 0, 3, { font: disp(800, size), color: '#0A0D22', track: 1 });
  ctx.restore();
}

function scene1(ctx, t) {
  const te = Math.min(t, FREEZE);
  L.background(ctx, te, { gridShift: te * 60 });
  const [, s, dx, dy, rot] = punchAt(te);
  ctx.save();
  L.camera(ctx, { s, x: dx, y: dy, rot });
  chaosLayer(ctx, te);
  ctx.restore();
  FLASHES.forEach((f) => sticker(ctx, f, te));

  // TOO MANY TABS. — slams on and stays (sound-off hook)
  C.slam(ctx, 'TOO MANY TABS.', W / 2, 400, te, 0.15, { font: disp(800, 104), glow: hexA(B.error, 0.6) });
  const up = ep(te, 0.3, 0.5);
  if (up > 0) {
    ctx.save(); ctx.fillStyle = B.error; ctx.globalAlpha = 0.95;
    rr(ctx, W / 2 - 400 * up, 468, 800 * up, 10, 5); ctx.fill(); ctx.restore();
  }

  // freeze frame: flash + desaturate wash
  if (t >= FREEZE) {
    const k = prog(t, FREEZE, FREEZE + 0.15);
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080'; ctx.globalAlpha = 0.85; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.save(); ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.55 * (1 - k); ctx.fillRect(0, 0, W, H); ctx.restore();
  }
}

// ---------------- Scene 02: BRAND REVEAL ----------------
const RING = { cx: W / 2, cy: 900, r: 330 };
const WORDS = ['CREATE', 'PLAN', 'SCHEDULE', 'APPROVE', 'PUBLISH', 'ENGAGE', 'ANALYZE'];
const ringPt = (u) => {
  const a = -Math.PI / 2 + u * Math.PI * 2;
  return [RING.cx + Math.cos(a) * RING.r, RING.cy + Math.sin(a) * RING.r];
};
const RING_PTS = sampleCurve(ringPt, 180);

function scene2(ctx, t) {
  // push-in at the end: fly through the CREATE node into the product
  const push = ep(t, 5.5, 6.0, E.inExpo);
  L.background(ctx, t, { gridShift: 162 + (t - 2.7) * 20 });
  ctx.save();
  L.camera(ctx, { s: 1 + push * 5, fx: RING.cx, fy: RING.cy - RING.r });

  // 1) chaos collapses into the centre
  if (t < 3.08) chaosLayer(ctx, FREEZE, prog(t, 2.85, 3.05));

  // 2) flash + shockwave
  const sw = prog(t, 3.0, 3.6);
  if (sw > 0 && sw < 1) {
    ctx.save();
    ctx.strokeStyle = hexA(B.secondary, 0.7 * (1 - sw));
    ctx.lineWidth = 14 * (1 - sw) + 2;
    ctx.beginPath(); ctx.arc(RING.cx, RING.cy, 40 + E.outCubic(sw) * 900, 0, 7); ctx.stroke();
    ctx.restore();
  }
  const fl = 1 - prog(t, 3.0, 3.3);
  if (t >= 3.0 && fl > 0) {
    const rg = ctx.createRadialGradient(RING.cx, RING.cy, 0, RING.cx, RING.cy, 900);
    rg.addColorStop(0, `rgba(255,255,255,${0.9 * fl})`);
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }

  // 3) the Flow Line draws the workflow ring; words land on its nodes
  const lp = ep(t, 3.12, 4.55, E.inOutCubic);
  if (lp > 0) {
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(RING.cx, RING.cy, RING.r, 0, 7); ctx.stroke(); ctx.restore();
    flowLine(ctx, RING_PTS, 0, lp, { lw: 7, gx0: RING.cx - RING.r, gy0: RING.cy - RING.r, gx1: RING.cx + RING.r, gy1: RING.cy + RING.r, head: lp < 1 });
  }
  WORDS.forEach((w, i) => {
    const u = i / WORDS.length;
    const ta = 3.45 + i * 0.17;
    const p = ep(t, ta, ta + 0.25, E.outBack);
    if (p <= 0) return;
    const [x, y] = ringPt(u);
    ctx.save();
    ctx.translate(x, y); ctx.scale(p, p);
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();
    const lw = L.measure(ctx, w, ui(800, 26), 3) + 40;
    // keep labels inside the safe margins
    const ox = x < RING.cx - 100 ? -lw / 2 + 10 : x > RING.cx + 100 ? lw / 2 - 10 : 0;
    const oy = y < RING.cy ? -44 : 44;
    L.chip(ctx, w, ox, oy, { font: ui(800, 26), track: 3, h: 50, padX: 20, fill: hexA(B.bg2, 0.92), stroke: hexA(B.flow[i % 3], 0.8) });
    ctx.restore();
  });

  // 4) logo
  const lg = ep(t, 3.0, 3.4, E.outBack);
  if (lg > 0) {
    ctx.save();
    ctx.translate(RING.cx, RING.cy); ctx.scale(lerp(0.6, 1, lg), lerp(0.6, 1, lg)); ctx.translate(-RING.cx, -RING.cy);
    const mp = ep(t, 2.95, 3.2);
    text(ctx, 'MEET', RING.cx, RING.cy - 96, { font: ui(700, 28), color: B.muted, track: 10, alpha: mp * (1 - ep(t, 4.0, 4.3)) });
    C.logo(ctx, RING.cx, RING.cy, 104, { alpha: clamp(lg * 2), glow: 40 });
    ctx.restore();
  }
  ctx.restore();

  // 5) tagline (outside the camera so it stays readable during the push)
  const tg = ep(t, 4.0, 4.3);
  if (tg > 0) {
    const a = tg * (1 - push * 2);
    text(ctx, 'Your social media workflow,', W / 2, 1380 + (1 - tg) * 30, { font: disp(800, 58), alpha: a });
    text(ctx, 'in one place.', W / 2, 1452 + (1 - tg) * 30, { font: disp(800, 58), color: B.secondary, alpha: a });
  }
  // whiteout at the end of the push to hand over to Scene 03
  if (push > 0.6) { ctx.save(); ctx.fillStyle = B.bg; ctx.globalAlpha = (push - 0.6) / 0.4; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

module.exports = { scene1, scene2, fitFont };
