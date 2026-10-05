// Scene 09 (analytics + reporting), Scene 10 (hero ecosystem), Scene 11 (brand close).
const L = require('../lib');
const C = require('./common');
const { B, W, H, rr, card, text, ui, disp, hexA, ep, E, prog, lerp, clamp, flowLine, sampleCurve, chipRow } = L;
const { fitFont } = require('./s01_s02');
const { SLAM } = require('../timeline'); // "ONE WORKFLOW." beat

// ---------------- Scene 09: ANALYTICS → CLIENT REPORT ----------------
const METRICS = [
  { label: 'REACH', col: B.secondary, x: 90, y: 560 },
  { label: 'ENGAGEMENT', col: B.primary, x: 550, y: 560 },
  { label: 'CLICKS', col: B.accent, x: 90, y: 780 },
  { label: 'FOLLOWERS', col: B.success, x: 550, y: 780 },
];
const REPORT = { x: 170, y: 540, w: 740, h: 880 };

function sparkPts(seed, n = 9) {
  const r = L.rng(seed);
  let v = 0.3;
  return Array.from({ length: n }, (_, i) => { v = clamp(v + (r() - 0.35) * 0.25, 0.08, 0.95); return [i / (n - 1), v]; });
}

function metricTile(ctx, m, i, t, x, y, w, h) {
  card(ctx, x, y, w, h, { r: 26 });
  text(ctx, m.label, x + 30, y + 44, { font: ui(800, 26), track: 2, align: 'left', color: B.muted });
  // trend badge (direction only — no invented numbers)
  ctx.save(); rr(ctx, x + w - 90, y + 22, 64, 44, 22); ctx.fillStyle = hexA(B.success, 0.18); ctx.fill(); ctx.restore();
  L.arrow(ctx, x + w - 58, y + 44, 26, B.success, 4.5, -Math.PI / 4);
  const pts = sparkPts(i + 3).map(([u, v]) => [x + 30 + u * (w - 60), y + h - 26 - v * (h - 100)]);
  const p = ep(t, 23.3 + i * 0.08, 23.9 + i * 0.08, E.inOutCubic);
  if (p > 0) {
    // fill under the line
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pts[0][0], y + h - 20);
    const cut = Math.max(1, Math.round(p * (pts.length - 1)));
    for (let k = 0; k <= cut; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.lineTo(pts[cut][0], y + h - 20); ctx.closePath();
    const g = ctx.createLinearGradient(0, y + 80, 0, y + h); g.addColorStop(0, hexA(m.col, 0.35)); g.addColorStop(1, hexA(m.col, 0));
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = m.col; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.shadowColor = m.col; ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let k = 0; k <= cut; k++) k ? ctx.lineTo(pts[k][0], pts[k][1]) : ctx.moveTo(pts[k][0], pts[k][1]);
    ctx.stroke(); ctx.restore();
  }
}

function lineChart(ctx, t, x, y, w, h, t0, title = 'Engagement over time') {
  card(ctx, x, y, w, h, { r: 26 });
  text(ctx, title, x + 30, y + 44, { font: ui(700, 26), align: 'left' });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) { const gy = y + 90 + k * ((h - 120) / 3); ctx.beginPath(); ctx.moveTo(x + 30, gy); ctx.lineTo(x + w - 30, gy); ctx.stroke(); }
  ctx.restore();
  const series = [[sparkPts(11, 12), B.secondary], [sparkPts(17, 12), B.primary]];
  series.forEach(([pts, col], si) => {
    const p = ep(t, t0 + si * 0.1, t0 + 0.5 + si * 0.1, E.inOutCubic);
    const P = pts.map(([u, v]) => [x + 30 + u * (w - 60), y + h - 30 - v * (h - 130)]);
    flowLine(ctx, P, 0, Math.max(0.001, p), { lw: 5, glow: 12, head: p < 1, alpha: p > 0 ? 1 : 0, gx0: x, gx1: x + w, gy0: y, gy1: y });
    void col;
  });
}

function barChart(ctx, t, x, y, w, h, t0) {
  card(ctx, x, y, w, h, { r: 26 });
  text(ctx, 'By platform', x + 30, y + 44, { font: ui(700, 26), align: 'left' });
  const keys = ['instagram', 'facebook', 'linkedin', 'tiktok'];
  const vals = [0.85, 0.6, 0.7, 0.5];
  const bw = (w - 60) / keys.length;
  keys.forEach((k, i) => {
    const p = ep(t, t0 + i * 0.06, t0 + 0.35 + i * 0.06, E.outBack);
    const bh = (h - 150) * vals[i] * p;
    const bx = x + 30 + i * bw + 10;
    rr(ctx, bx, y + h - 70 - bh, bw - 20, Math.max(0, bh), 10);
    ctx.fillStyle = L.PLATFORMS[k].color === '#111111' ? '#EDEDED' : L.PLATFORMS[k].color; ctx.fill();
    L.platformTile(ctx, k, bx + (bw - 20) / 2, y + h - 38, 40);
  });
}

function topPosts(ctx, t, x, y, w, h, t0) {
  card(ctx, x, y, w, h, { r: 26 });
  text(ctx, 'TOP POSTS', x + 30, y + 44, { font: ui(800, 26), track: 2, align: 'left', color: B.muted });
  for (let i = 0; i < 3; i++) {
    const p = ep(t, t0 + i * 0.08, t0 + 0.3 + i * 0.08, E.outBack);
    if (p <= 0) continue;
    const tw = (w - 60 - 40) / 3;
    const tx = x + 30 + i * (tw + 20), ty = y + 76;
    ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.translate(tx + tw / 2, ty + (h - 100) / 2); ctx.scale(p, p); ctx.translate(-(tx + tw / 2), -(ty + (h - 100) / 2));
    C.postArt(ctx, tx, ty, tw, h - 100, i + 2, 14);
    ctx.fillStyle = i === 0 ? '#FFC53D' : 'rgba(10,13,34,0.75)';
    ctx.beginPath(); ctx.arc(tx + 28, ty + 28, 20, 0, 7); ctx.fill();
    text(ctx, String(i + 1), tx + 28, ty + 29, { font: ui(800, 22), color: i === 0 ? '#2A1A00' : '#fff' });
    ctx.restore();
  }
}

function reportDoc(ctx, t, p) {
  const { x, y, w, h } = REPORT;
  card(ctx, x, y, w, h, { r: 26, fill: '#F6F7FB', stroke: 'rgba(0,0,0,0.08)', shadowBlur: 80 });
  // white-label header: the agency's own logo slot (dashed placeholder)
  ctx.save(); rr(ctx, x + 40, y + 40, 230, 70, 14); ctx.setLineDash([8, 6]); ctx.strokeStyle = 'rgba(20,30,70,0.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  text(ctx, 'Your logo', x + 155, y + 76, { font: ui(700, 24), color: 'rgba(20,30,70,0.55)' });
  text(ctx, 'CLIENT REPORT', x + 40, y + 170, { font: disp(800, 50), color: '#101633', align: 'left' });
  text(ctx, 'Monthly social performance', x + 40, y + 218, { font: ui(500, 26), color: '#5A6388', align: 'left' });
  // PERFORMANCE
  text(ctx, 'PERFORMANCE', x + 40, y + 292, { font: ui(800, 22), track: 3, color: B.primary, align: 'left' });
  const cy = y + 320, ch = 230;
  ctx.save(); rr(ctx, x + 40, cy, w - 80, ch, 16); ctx.fillStyle = '#E9ECF7'; ctx.fill(); ctx.restore();
  const pts = sparkPts(11, 12).map(([u, v]) => [x + 70 + u * (w - 140), cy + ch - 30 - v * (ch - 70)]);
  ctx.save(); ctx.strokeStyle = B.primary; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); ctx.restore();
  // mini KPI bars (labels only)
  ['Reach', 'Engagement', 'Clicks'].forEach((lb, i) => {
    const bx = x + 40 + i * ((w - 80) / 3);
    text(ctx, lb, bx + 4, y + 600, { font: ui(700, 24), color: '#2A3050', align: 'left' });
    ctx.save(); rr(ctx, bx + 4, y + 626, (w - 80) / 3 - 30, 12, 6); ctx.fillStyle = '#DDE1F0'; ctx.fill();
    rr(ctx, bx + 4, y + 626, ((w - 80) / 3 - 30) * [0.8, 0.65, 0.55][i] * p, 12, 6); ctx.fillStyle = [B.secondary, B.primary, B.accent][i]; ctx.fill(); ctx.restore();
  });
  // INSIGHTS
  text(ctx, 'INSIGHTS', x + 40, y + 690, { font: ui(800, 22), track: 3, color: B.primary, align: 'left' });
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.fillStyle = B.success; ctx.beginPath(); ctx.arc(x + 52, y + 730 + i * 40, 7, 0, 7); ctx.fill(); ctx.restore();
    C.lines(ctx, x + 74, y + 724 + i * 40, (w - 140) * [0.9, 0.75, 0.82][i], 1, { th: 12, color: 'rgba(20,30,70,0.16)' });
  }
}

function scene9(ctx, t) {
  L.background(ctx, t, { gridShift: 720 + t * 30 });
  const asm = ep(t, 24.72, 25.05, E.inOutCubic);   // tiles assemble into the report
  const back = ep(t, 25.62, 25.98, E.inExpo);       // report zooms backward

  // data burst
  const db = prog(t, 23.0, 23.6);
  if (db < 1) {
    const r = L.rng(88);
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, d = 900 * (0.25 + r() * 0.75) * E.outCubic(db) + 220;
      ctx.save(); ctx.globalAlpha = 1 - db; ctx.fillStyle = B.flow[i % 3];
      ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * d, 960 + Math.sin(a) * d, 3 + r() * 5, 0, 7); ctx.fill(); ctx.restore();
    }
  }

  // dashboard pieces (fly into report on assemble)
  const pieces = [
    ...METRICS.map((m, i) => ({ draw: (x, y) => metricTile(ctx, m, i, t, x, y, 440, 200), x: m.x, y: m.y, w: 440, h: 200, tin: 23.1 + i * 0.07 })),
    { draw: (x, y) => lineChart(ctx, t, x, y, 560, 300, 23.65), x: 90, y: 1000, w: 560, h: 300, tin: 23.55 },
    { draw: (x, y) => barChart(ctx, t, x, y, 320, 300, 23.9), x: 670, y: 1000, w: 320, h: 300, tin: 23.75 },
    { draw: (x, y) => topPosts(ctx, t, x, y, 900, 190, 24.25), x: 90, y: 1320, w: 900, h: 190, tin: 24.15 },
  ];
  if (asm < 1) {
    pieces.forEach((pc, i) => {
      const p = ep(t, pc.tin, pc.tin + 0.28, E.outBack);
      if (p <= 0) return;
      const tx = REPORT.x + REPORT.w / 2, ty = REPORT.y + 300 + (i % 4) * 120;
      const k = E.inCubic(clamp(asm * 1.2 - i * 0.03));
      const cx = lerp(pc.x + pc.w / 2, tx, k), cy = lerp(pc.y + pc.h / 2, ty, k);
      const s = lerp(0.7, 1, p) * lerp(1, 0.3, k);
      ctx.save(); ctx.globalAlpha = clamp(p * 2) * (1 - k);
      ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-pc.w / 2, -pc.h / 2);
      pc.draw(0, 0);
      ctx.restore();
    });
  }
  // report document
  if (asm > 0) {
    const s = lerp(0.6, 1, E.outBack(asm)) * lerp(1, 0.3, back);
    ctx.save(); ctx.globalAlpha = clamp(asm * 2) * (1 - back * 0.4);
    ctx.translate(W / 2, REPORT.y + REPORT.h / 2 + back * 40); ctx.scale(s, s); ctx.translate(-W / 2, -(REPORT.y + REPORT.h / 2));
    reportDoc(ctx, t, ep(t, 24.9, 25.4));
    ctx.restore();
    const flash = 1 - prog(t, 24.8, 25.1);
    if (t > 24.8 && flash > 0) { ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.35 * flash; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }

  // headlines + badges
  ctx.save(); ctx.globalAlpha = 1 - back;
  const swap = ep(t, 24.72, 24.85);
  ctx.save(); ctx.globalAlpha *= 1 - swap;
  C.kineticType(ctx, 'ANALYTICS', W / 2, 390, t, 23.1, { font: disp(800, 108), per: 0.03, glow: hexA(B.secondary, 0.6) });
  ctx.restore();
  C.slam(ctx, 'CLIENT REPORT', W / 2, 390, t, 24.82, { font: disp(800, 108) });
  const pp = ep(t, 24.95, 25.15) * (1 - ep(t, 25.62, 25.8));
  if (pp > 0) {
    text(ctx, 'PERFORMANCE  ·  INSIGHTS', W / 2, 478, { font: ui(800, 28), track: 4, color: B.muted, alpha: pp });
  }
  chipRow(ctx, ['WHITE LABEL', 'SCHEDULED REPORT'], W / 2, 1478, t, 25.2, {
    font: ui(800, 27), padX: 24, h: 60, gap: 16, stagger: 0.15, fill: hexA(B.primary, 0.3), stroke: B.secondary,
  });
  ctx.restore();
}

// ---------------- Scene 10: HERO ECOSYSTEM ----------------
const ORB = { cx: W / 2, cy: 1010, rx: 380, ry: 400 };
const PILLARS = ['CREATE', 'PLAN', 'SCHEDULE', 'RECYCLE', 'APPROVE', 'PUBLISH', 'ENGAGE', 'ANALYZE'];

function pillarIcon(ctx, name, x, y, s, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  switch (name) {
    case 'CREATE': L.sparkle(ctx, x, y, s * 0.55, col); break;
    case 'PLAN': {
      rr(ctx, x - s * 0.45, y - s * 0.4, s * 0.9, s * 0.8, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s * 0.45, y - s * 0.12); ctx.lineTo(x + s * 0.45, y - s * 0.12); ctx.stroke();
      break;
    }
    case 'SCHEDULE': ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - s * 0.25); ctx.lineTo(x, y); ctx.lineTo(x + s * 0.2, y + s * 0.12); ctx.stroke(); break;
    case 'RECYCLE': L.loopIcon(ctx, x, y, s * 0.38, col, 4, 0); break;
    case 'APPROVE': L.checkMark(ctx, x, y, s * 0.9, col, 5); break;
    case 'PUBLISH': L.arrow(ctx, x, y, s * 0.8, col, 5, -Math.PI / 2); break;
    case 'ENGAGE': {
      rr(ctx, x - s * 0.45, y - s * 0.35, s * 0.9, s * 0.6, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.25); ctx.lineTo(x - s * 0.3, y + s * 0.45); ctx.lineTo(x, y + s * 0.25); ctx.stroke();
      break;
    }
    case 'ANALYZE': [0.35, 0.65, 0.5].forEach((v, i) => { rr(ctx, x - s * 0.4 + i * s * 0.3, y + s * 0.4 - v * s, s * 0.2, v * s, 3); ctx.fill(); }); break;
  }
  ctx.restore();
}

function heroInterface(ctx, x, y, w, h, t) {
  card(ctx, x, y, w, h, { r: 30, stroke: hexA(B.secondary, 0.5), shadowBlur: 80 });
  // sidebar
  ctx.save(); rr(ctx, x + 16, y + 16, 70, h - 32, 18); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.restore();
  for (let i = 1; i < 5; i++) { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.14)'; rr(ctx, x + 35, y + 40 + i * 52, 32, 32, 9); ctx.fill(); ctx.restore(); }
  C.icon(ctx, x + 51, y + 56, 40);
  C.logo(ctx, x + 96 + (w - 110) / 2, y + 56, 46, { maxW: w - 140 });
  // mini calendar + chart
  const gx = x + 108, gy = y + 100, gw = w - 130;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    ctx.save(); rr(ctx, gx + c * (gw / 5) + 3, gy + r * 56, gw / 5 - 6, 48, 8);
    ctx.fillStyle = (r * 5 + c) % 3 === 0 ? hexA(B.flow[(r + c) % 3], 0.7) : 'rgba(255,255,255,0.05)'; ctx.fill(); ctx.restore();
  }
  const P = sparkPts(5, 10).map(([u, v]) => [gx + u * gw, y + h - 30 - v * 70]);
  flowLine(ctx, P, 0, 1, { lw: 4, glow: 10, head: false, gx0: gx, gx1: gx + gw, gy0: 0, gy1: 0 });
  void t;
}

function scene10(ctx, t) {
  L.background(ctx, t, { gridShift: 800 + t * 30, glows: [[B.primary, W / 2, ORB.cy, 900, 0.3], [B.secondary, W / 2, ORB.cy + 200, 600, 0.12]] });
  const pull = ep(t, 26.0, 26.45, E.outExpo);              // camera pulls back
  const bump = Math.sin(clamp(prog(t, SLAM, SLAM + 0.25)) * Math.PI) * 0.035;
  const conv = ep(t, 27.35, 27.95, E.inOutCubic);         // pillars converge
  ctx.save();
  L.camera(ctx, { s: lerp(1.9, 1, pull) + bump, fx: W / 2, fy: ORB.cy });

  const rot = (t - 26) * 0.18;
  const node = (i, k = 1) => {
    const a = -Math.PI / 2 + (i / PILLARS.length) * Math.PI * 2 + rot;
    return [ORB.cx + Math.cos(a) * ORB.rx * k, ORB.cy + Math.sin(a) * ORB.ry * k];
  };
  const k = lerp(1, 0, conv);
  // orbit path + Flow Line through every pillar
  const orbit = sampleCurve((u) => { const a = -Math.PI / 2 + u * Math.PI * 2 + rot; return [ORB.cx + Math.cos(a) * ORB.rx * k, ORB.cy + Math.sin(a) * ORB.ry * k]; }, 200);
  const lp = ep(t, 26.02, 26.5, E.inOutCubic);
  flowLine(ctx, orbit, 0, Math.max(0.001, lp), { lw: 7, glow: 30, alpha: 1 - conv, head: lp < 1, gx0: ORB.cx - ORB.rx, gy0: ORB.cy - ORB.ry, gx1: ORB.cx + ORB.rx, gy1: ORB.cy + ORB.ry });
  // spokes to the centre + travelling pulses
  PILLARS.forEach((_, i) => {
    const [x, y] = node(i, k);
    const sp = ep(t, 26.2 + i * 0.03, 26.5 + i * 0.03);
    ctx.save(); ctx.globalAlpha = 0.35 * sp * (1 - conv); ctx.strokeStyle = B.flow[i % 3]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ORB.cx, ORB.cy); ctx.stroke(); ctx.restore();
    const u = ((t * 1.4 + i / 8) % 1);
    ctx.save(); ctx.globalAlpha = sp * (1 - conv); ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(lerp(x, ORB.cx, u), lerp(y, ORB.cy, u), 4, 0, 7); ctx.fill(); ctx.restore();
  });
  // central RecurPost interface → logo lockup
  const hi = ep(t, 26.0, 26.3, E.outBack);
  const iw = 470, ih = 330;
  ctx.save();
  ctx.globalAlpha = clamp(hi * 2) * (1 - conv);
  ctx.translate(ORB.cx, ORB.cy); ctx.scale(lerp(0.3, 1, hi) * (1 + 0.04 * Math.sin(t * 6) * (1 - conv)), lerp(0.3, 1, hi)); ctx.translate(-iw / 2, -ih / 2);
  heroInterface(ctx, 0, 0, iw, ih, t);
  ctx.restore();
  // pillars
  PILLARS.forEach((name, i) => {
    const p = ep(t, 26.08 + i * 0.045, 26.33 + i * 0.045, E.outBack);
    if (p <= 0) return;
    const [x, y] = node(i, k);
    const col = B.flow[i % 3];
    ctx.save(); ctx.globalAlpha = clamp(p * 2) * (1 - conv * conv);
    ctx.translate(x, y); ctx.scale(p * lerp(1, 0.4, conv), p * lerp(1, 0.4, conv));
    ctx.shadowColor = col; ctx.shadowBlur = 26;
    ctx.fillStyle = B.bg2; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); ctx.shadowBlur = 0;
    pillarIcon(ctx, name, 0, 0, 44, '#FFFFFF');
    const oy = y < ORB.cy - 50 ? -84 : y > ORB.cy + 50 ? 84 : 0;
    const ox = oy === 0 ? (x < ORB.cx ? 30 : -30) : 0;
    L.chip(ctx, name, ox, oy, { font: ui(800, 26), track: 3, h: 50, padX: 18, fill: hexA(B.bg, 0.9), stroke: hexA(col, 0.9) });
    ctx.restore();
  });
  ctx.restore();

  // logo lockup forms as everything converges ("All in RecurPost.")
  if (conv > 0) {
    const lg = E.outBack(conv);
    ctx.save(); ctx.translate(W / 2, ORB.cy); ctx.scale(lerp(0.5, 1, lg), lerp(0.5, 1, lg));
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 420);
    rg.addColorStop(0, hexA(B.primary, 0.45 * conv)); rg.addColorStop(1, hexA(B.primary, 0));
    ctx.fillStyle = rg; ctx.fillRect(-500, -500, 1000, 1000);
    C.logo(ctx, 0, 0, 120, { alpha: conv, glow: 50, maxW: 860 });
    ctx.restore();
    text(ctx, 'YOUR SOCIAL MEDIA.', W / 2, ORB.cy + 150, { font: disp(800, 56), alpha: ep(t, 27.45, 27.7) });
    text(ctx, 'SIMPLIFIED.', W / 2, ORB.cy + 218, { font: disp(800, 56), color: B.secondary, alpha: ep(t, 27.55, 27.8) });
  }

  // headline
  const es = ep(t, 26.0, 26.45, E.inOutCubic);
  ctx.save(); ctx.translate(W / 2, 330);
  text(ctx, 'EVERYTHING SOCIAL.', 0, 0, { font: disp(800, fitFont(ctx, 'EVERYTHING SOCIAL.', 800, 96, 900, 6)), track: lerp(6, 0, es), alpha: es });
  ctx.restore();
  C.slam(ctx, 'ONE WORKFLOW.', W / 2, 442, t, SLAM, { font: disp(800, 104), color: B.secondary, glow: hexA(B.secondary, 0.7), from: 2.0, dur: 0.16 });
  const fl = 1 - prog(t, SLAM, SLAM + 0.3);
  if (t >= SLAM && fl > 0) { ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.3 * fl; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

// ---------------- Scene 11: BRAND CLOSE ----------------
const FINAL = { logoY: 690, l1: 880, l2: 990, sub: 1110, cta: 1265 };

function scene11(ctx, t) {
  // clean branded background; the Flow Line becomes a calm arc
  L.background(ctx, t, { grid: false, top: '#0A0F2E', bottom: '#05071A', glows: [[B.primary, W / 2, 900, 900, 0.32], [B.secondary, W / 2, 1300, 700, 0.12]] });
  const arc = sampleCurve((u) => [lerp(-80, W + 80, u), 1560 - Math.sin(u * Math.PI) * 260], 120);
  flowLine(ctx, arc, 0, ep(t, 28.0, 28.6, E.inOutCubic), { lw: 5, glow: 22, alpha: 0.55, head: false, gx0: 0, gx1: W, gy0: 0, gy1: 0 });

  const settle = ep(t, 28.0, 28.4, E.inOutCubic);
  C.logo(ctx, W / 2, lerp(ORB.cy, FINAL.logoY, settle), lerp(120, 132, settle), { glow: 30, maxW: lerp(860, 900, settle) });

  // hand-over line from Scene 10 leaves…
  const out = ep(t, 28.1, 28.35, E.inCubic);
  if (out < 1) {
    text(ctx, 'YOUR SOCIAL MEDIA.', W / 2, ORB.cy + 150 - out * 40, { font: disp(800, 56), alpha: 1 - out });
    text(ctx, 'SIMPLIFIED.', W / 2, ORB.cy + 218 - out * 40, { font: disp(800, 56), color: B.secondary, alpha: 1 - out });
  }
  // …and the headline travels from the top into the final lockup
  const mv = ep(t, 28.0, 28.45, E.inOutCubic);
  text(ctx, 'EVERYTHING SOCIAL.', W / 2, lerp(330, FINAL.l1, mv), { font: disp(800, lerp(fitFont(ctx, 'EVERYTHING SOCIAL.', 800, 96, 960), 88, mv)) });
  text(ctx, 'ONE WORKFLOW.', W / 2, lerp(442, FINAL.l2, mv), { font: disp(800, lerp(104, 88, mv)), color: B.secondary, glow: hexA(B.secondary, 0.5) });

  const sp = ep(t, 28.35, 28.6);
  text(ctx, 'Plan. Publish. Manage. Measure.', W / 2, FINAL.sub + (1 - sp) * 20, { font: ui(600, 42), color: B.muted, alpha: sp });

  const cp = ep(t, 28.45, 28.75, E.outBack);
  if (cp > 0) {
    const w = 640, h = 116;
    ctx.save(); ctx.translate(W / 2, FINAL.cta); ctx.scale(lerp(0.8, 1, cp), lerp(0.8, 1, cp)); ctx.globalAlpha = clamp(cp * 2);
    ctx.shadowColor = hexA(B.primary, 0.8); ctx.shadowBlur = 50;
    rr(ctx, -w / 2, -h / 2, w, h, h / 2);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
    // subtle sheen sweep
    const sx = lerp(-w, w, (t - 28.8) / 0.9 % 1);
    ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.clip();
    const sg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.22)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    const label = 'EXPLORE RECURPOST';
    const tw = L.measure(ctx, label, disp(800, 40), 2);
    text(ctx, label, -30, 2, { font: disp(800, 40), track: 2 });
    L.arrow(ctx, -30 + tw / 2 + 44 + Math.sin(t * 6) * 4, 2, 40, '#FFFFFF', 6);
    ctx.restore();
  }
}

module.exports = { scene9, scene10, scene11 };
