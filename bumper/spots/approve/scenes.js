// 15 s non-skippable in-stream, "Which version did the client approve?". One client post card carries
// the story: three versions land in a message thread -> the card searches calendar / email / chat ->
// the surfaces align into one workspace -> Draft -> In review -> Approved (a review decision, not a
// publish result) -> the approved card takes its calendar slot -> it becomes the CTA.
// Visible words: the four headlines, the three version labels, the client question, the three
// step labels, and the end card.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, checkIcon, background, getLogo } = L;
const { CLIENTS, ASPECT, postCard, headline, backdrop } = require('../../ui');
const T = TL.T;

// ---------- shared parts ----------
function person(ctx, cx, cy, r, bg, fg) {
  ctx.save();
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.22, r * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.78, r * 0.66, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function approvedBadge(ctx, cx, cy, r, a = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(E.outBack(a, 1.8), E.outBack(a, 1.8));
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  checkIcon(ctx, 0, 0, r * 0.95, C.ink);
  ctx.restore();
}
// the client post card; approved (0..1) adds the yellow review-decision outline + check
function heroCard(ctx, x, y, w, h, o = {}) {
  postCard(ctx, x, y, w, h, { client: 0, variant: o.variant ?? 0, lift: o.lift ?? 0.5 });
  const a = o.approved ?? 0;
  if (a > 0) {
    ctx.save(); ctx.globalAlpha *= a;
    rr(ctx, x - 3, y - 3, w + 6, h + 6, h * 0.13 + 3); ctx.strokeStyle = C.yellow; ctx.lineWidth = Math.max(3, h * 0.03); ctx.stroke();
    ctx.restore();
    approvedBadge(ctx, x + w - h * 0.24, y + h - h * 0.24, h * 0.14, a);
  }
}
function versionPill(ctx, x, y, text, fs = 28) {
  ctx.save(); ctx.font = font(800, fs);
  const h = Math.round(fs * 1.7), w = ctx.measureText(text).width + h;
  fillRR(ctx, x, y, w, h, h / 2, C.ink);
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
  return { w, h };
}
function panelShell(ctx, r, rad = 24, bar = 56) {
  shadowed(ctx, 50, 18, 0.14, () => fillRR(ctx, r.x, r.y, r.w, r.h, rad, C.surface));
  ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, rad); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(r.x, r.y, r.w, bar); ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y + bar - 1, r.w, 1.5);
  ctx.restore();
}

// ---------- scene 1: the thread ----------
const TP = { x: 560, y: 320, w: 800, h: 620 };
const CARD1 = { w: 320, h: 320 / ASPECT };
const VERSIONS = [['Version 1', 2], ['Version 2', 3], ['Updated version', 0]];
const QUESTION = 'Which version is approved?';
// thread items, newest at the bottom: [appear, kind, data, height]
const ITEMS = [
  ...VERSIONS.map(([label, v], i) => ({ t: T.v[i], kind: 'card', label, v, h: CARD1.h + 84 })),
  { t: T.chatter[0], kind: 'bars', side: 'left', h: 84 },
  { t: T.chatter[1], kind: 'bars', side: 'right', h: 84 },
  { t: T.question, kind: 'question', h: 124 },
];
function threadLayout(t) {
  // y-bottom for each item: later items push earlier ones up (with easing)
  const bottom = TP.y + TP.h - 26;
  return ITEMS.map((it, i) => {
    let off = 0;
    for (let j = i + 1; j < ITEMS.length; j++) off += ITEMS[j].h * ep(t, ITEMS[j].t, ITEMS[j].t + 0.28, E.outCubic);
    return { ...it, yb: bottom - off, p: ep(t, it.t, it.t + 0.32, E.outQuint) };
  });
}
function heroThreadRect(t) {
  const it = threadLayout(t)[2];
  const x = TP.x + TP.w - 40 - CARD1.w, y = it.yb - CARD1.h - 8 + 40 * (1 - it.p);
  return { x, y, w: CARD1.w, h: CARD1.h };
}

function thread(ctx, t) {
  const out = ep(t, ...T.clear, E.inOutCubic);
  if (out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(-260 * out, 0);
  panelShell(ctx, TP, 26, 70);
  person(ctx, TP.x + 50, TP.y + 35, 22, C.ink, '#FFFFFF');
  fillRR(ctx, TP.x + 86, TP.y + 24, 170, 12, 6, C.gray); fillRR(ctx, TP.x + 86, TP.y + 42, 100, 9, 4.5, C.line);
  ctx.save(); rr(ctx, TP.x, TP.y + 70, TP.w, TP.h - 70, 0); ctx.clip();
  threadLayout(t).forEach((it, i) => {
    if (it.p <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(it.p * 1.6);
    const slide = (1 - it.p) * 40;
    if (it.kind === 'card') {
      // the newest version is the hero: drawn (with its label) by renderAt so it can leave the thread
      if (i !== 2) {
        const x = TP.x + TP.w - 40 - CARD1.w, y = it.yb - CARD1.h - 8 + slide;
        ctx.save(); ctx.font = font(800, 28); const pw = ctx.measureText(it.label).width + 48; ctx.restore();
        postCard(ctx, x, y, CARD1.w, CARD1.h, { client: 0, variant: it.v, lift: 0.3 });
        versionPill(ctx, x + CARD1.w - pw, y - 56, it.label, 28);
      }
    } else if (it.kind === 'bars') {
      const w = 380, h = 64, x = it.side === 'left' ? TP.x + 40 - slide : TP.x + TP.w - 40 - w + slide, y = it.yb - h - 10;
      fillRR(ctx, x, y, w, h, 24, it.side === 'left' ? '#F1EFEA' : C.yTint);
      fillRR(ctx, x + 24, y + 20, w * 0.62, 10, 5, C.gray2); fillRR(ctx, x + 24, y + 38, w * 0.38, 10, 5, C.gray);
    } else {
      ctx.font = font(700, 42);
      const w = ctx.measureText(QUESTION).width + 140, h = 104, x = TP.x + 30 - slide, y = it.yb - h - 10;
      const s = 0.85 + 0.15 * E.outBack(it.p, 1.6);
      ctx.translate(x, y + h / 2); ctx.scale(s, s); ctx.translate(-x, -(y + h / 2));
      shadowed(ctx, 30, 10, 0.16, () => fillRR(ctx, x, y, w, h, 30, C.surface));
      rr(ctx, x, y, w, h, 30); ctx.strokeStyle = C.yellow; ctx.lineWidth = 3; ctx.stroke();
      person(ctx, x + 54, y + h / 2, 30, C.ink, '#FFFFFF');
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(QUESTION, x + 102, y + h / 2 + 2);
    }
    ctx.restore();
  });
  ctx.restore();
  ctx.restore();
}

// ---------- scene 2: searching across surfaces ----------
const SURF = [
  { x: 200, y: 340, w: 470, h: 400, kind: 'cal' },
  { x: 725, y: 400, w: 470, h: 400, kind: 'mail' },
  { x: 1250, y: 340, w: 470, h: 400, kind: 'chat' },
];
const WS = { x: 230, y: 310, w: 1460, h: 590 };
const CENTER = { x: 960, y: 640 };
const HERO_BIG = { w: 340, h: 340 / ASPECT };
const HERO_HOP = { w: 230, h: 230 / ASPECT };

function surfaceContent(ctx, s, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const x = s.x, y = s.y + 56, w = s.w, h = s.h - 56;
  if (s.kind === 'cal') {
    const cw = (w - 40) / 5, ch = (h - 40) / 4;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) fillRR(ctx, x + 20 + c * cw + 5, y + 20 + r * ch + 5, cw - 10, ch - 10, 8, (r * 5 + c) % 4 ? '#F1EFEA' : C.yTint);
  } else if (s.kind === 'mail') {
    for (let r = 0; r < 4; r++) {
      const ry = y + 22 + r * 78;
      fillRR(ctx, x + 22, ry, 44, 32, 6, '#FFFFFF'); rr(ctx, x + 22, ry, 44, 32, 6); ctx.strokeStyle = C.gray2; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 25, ry + 4); ctx.lineTo(x + 44, ry + 18); ctx.lineTo(x + 63, ry + 4); ctx.stroke();
      fillRR(ctx, x + 84, ry + 4, w - 150 - r * 30, 11, 5.5, C.gray); fillRR(ctx, x + 84, ry + 22, w * 0.4, 9, 4.5, C.line);
    }
  } else {
    [[0, 0.62], [1, 0.48], [0, 0.55], [1, 0.4]].forEach(([right, f], r) => {
      const bw = w * f, bx = right ? x + w - 22 - bw : x + 22, by = y + 20 + r * 80;
      fillRR(ctx, bx, by, bw, 58, 22, right ? C.yTint : '#F1EFEA');
      fillRR(ctx, bx + 20, by + 24, bw * 0.6, 10, 5, C.gray2);
    });
  }
  ctx.restore();
}

function surfaces(ctx, t) {
  const m = ep(t, ...T.align, E.inOutQuart);
  SURF.forEach((s, i) => {
    const q = ep(t, T.panels + i * 0.08, T.panels + i * 0.08 + 0.4, E.outQuint);
    if (q <= 0) return;
    const r = { x: lerp(s.x, WS.x, m), y: lerp(s.y, WS.y, m) + 60 * (1 - q), w: lerp(s.w, WS.w, m), h: lerp(s.h, WS.h, m), kind: s.kind };
    ctx.save(); ctx.globalAlpha *= clamp(q * 1.6) * (m < 1 ? 1 : 0);
    panelShell(ctx, r, 24, lerp(56, 72, m));
    surfaceContent(ctx, { ...r, h: r.h }, 1 - ep(m, 0, 0.5));
    ctx.restore();
  });
}

// ---------- scene 3: the shared workspace ----------
const STEPS = ['Draft', 'In review', 'Approved'];
function workspace(ctx, t) {
  const a = ep(t, T.align[1] - 0.15, T.align[1]) * (1 - ep(t, T.toCal[0], T.toCal[0] + 0.35));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  panelShell(ctx, WS, 26, 72);
  const lp = ep(t, ...T.logo, E.outQuint);
  if (lp > 0) { const LOGO = getLogo(), lh = 34; ctx.save(); ctx.globalAlpha *= lp; ctx.drawImage(LOGO, WS.x + 30, WS.y + 19, lh * LOGO.width / LOGO.height, lh); ctx.restore(); }
  // team + client avatars: a shared space
  const av = [[C.ink, '#FFFFFF'], [C.yellow, C.ink], ['#F2A93B', '#FFFFFF']];
  av.forEach(([bg, fg], i) => { const cx = WS.x + WS.w - 60 - i * 46; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, WS.y + 36, 22, 0, Math.PI * 2); ctx.fill(); person(ctx, cx, WS.y + 36, 19, bg, fg); });
  // approval path: Draft -> In review -> Approved
  ctx.font = font(800, 36);
  const ws = STEPS.map((s) => ctx.measureText(s).width + 96);
  const gap = 70, total = ws.reduce((p, c) => p + c, 0) + gap * 2;
  let x = W / 2 - total / 2;
  const y = WS.y + 104, h = 70;
  const state = (i) => ep(t, T.steps[i], T.steps[i] + 0.25);
  STEPS.forEach((s, i) => {
    const q = ep(t, T.steps[0] - 0.05 + i * 0.08, T.steps[0] + 0.25 + i * 0.08, (v) => E.outBack(v, 1.3));
    const on = state(i), next = i < 2 ? state(i + 1) : 0;
    const active = on * (1 - next);
    if (i > 0) { // connector arrow fills as the step is reached
      const ax0 = x - gap + 12, ax1 = x - 12, ay = y + h / 2;
      fillRR(ctx, ax0, ay - 3, ax1 - ax0, 6, 3, C.gray);
      fillRR(ctx, ax0, ay - 3, (ax1 - ax0) * on, 6, 3, C.ink);
      ctx.fillStyle = on > 0.9 ? C.ink : C.gray; ctx.beginPath(); ctx.moveTo(ax1 + 4, ay); ctx.lineTo(ax1 - 10, ay - 10); ctx.lineTo(ax1 - 10, ay + 10); ctx.fill();
    }
    ctx.save();
    ctx.globalAlpha *= clamp(q * 2);
    const pop = 1 + 0.08 * Math.sin(Math.PI * ep(t, T.steps[i], T.steps[i] + 0.3));
    ctx.translate(x + ws[i] / 2, y + h / 2); ctx.scale((0.85 + 0.15 * q) * pop, (0.85 + 0.15 * q) * pop); ctx.translate(-ws[i] / 2, -h / 2);
    const done = i === 2 ? on : next;
    const fill = i === 2 ? lerp01(C.surface, C.yellow, on) : done > 0.5 ? '#EFEDE7' : C.surface;
    shadowed(ctx, 16 + 10 * active, 6, 0.08 + 0.08 * active, () => fillRR(ctx, 0, 0, ws[i], h, h / 2, fill));
    rr(ctx, 1.5, 1.5, ws[i] - 3, h - 3, h / 2); ctx.strokeStyle = active > 0.5 || (i === 2 && on > 0.5) ? C.ink : C.gray2; ctx.lineWidth = 3; ctx.stroke();
    // status dot / check
    if (i === 2 && on > 0) checkIcon(ctx, 36, h / 2, 26, C.ink, on);
    else if (done > 0.5) checkIcon(ctx, 36, h / 2, 24, C.muted, 1);
    else { ctx.fillStyle = active > 0.5 ? C.yellow : C.gray2; ctx.beginPath(); ctx.arc(36, h / 2, 10, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(s, 62, h / 2 + 1);
    ctx.restore();
    x += ws[i] + gap;
  });
  // client comment beside the post (abstract text, client avatar)
  const cp = ep(t, T.comment, T.comment + 0.35, (v) => E.outBack(v, 1.4));
  if (cp > 0) {
    const bx = 1215, by = 560, bw = 420, bh = 150;
    ctx.save(); ctx.globalAlpha *= clamp(cp * 2);
    ctx.translate(bx, by + bh / 2); ctx.scale(0.85 + 0.15 * cp, 0.85 + 0.15 * cp); ctx.translate(-bx, -(by + bh / 2));
    shadowed(ctx, 30, 10, 0.14, () => fillRR(ctx, bx, by, bw, bh, 24, C.surface));
    rr(ctx, bx, by, bw, bh, 24); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.surface; ctx.beginPath(); ctx.moveTo(bx + 1, by + 50); ctx.lineTo(bx - 16, by + 64); ctx.lineTo(bx + 1, by + 78); ctx.fill();
    person(ctx, bx + 46, by + 48, 26, C.yellow, C.ink);
    fillRR(ctx, bx + 88, by + 36, 150, 12, 6, C.gray);
    fillRR(ctx, bx + 30, by + 92, bw - 70, 12, 6, C.gray2); fillRR(ctx, bx + 30, by + 116, bw - 160, 12, 6, C.gray);
    ctx.restore();
  }
  // a quiet team column on the left (abstract list)
  for (let r = 0; r < 3; r++) {
    const ry = 590 + r * 74;
    ctx.save(); ctx.globalAlpha *= 0.9;
    person(ctx, WS.x + 70, ry, 20, r === 1 ? C.yellow : C.ink, r === 1 ? C.ink : '#FFFFFF');
    fillRR(ctx, WS.x + 102, ry - 12, 170 - r * 20, 11, 5.5, C.gray); fillRR(ctx, WS.x + 102, ry + 6, 100, 9, 4.5, C.line);
    ctx.restore();
  }
  ctx.restore();
}
function lerp01(c0, c1, p) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = h(c0), b = h(c1);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], p))).join(',')})`;
}

// ---------- scene 4: the calendar ----------
const CAL = { x: 230, y: 330, w: 1460, h: 620 };
const CTOP = 64, CSIDE = 200;
const CCOLW = (CAL.w - CSIDE - 16) / 7, CROWH = (CAL.h - CTOP - 40 - 14) / 3;
const ccell = (r, c) => { const w = CCOLW - 20, h = Math.min(CROWH - 22, w / ASPECT); return { x: CAL.x + CSIDE + c * CCOLW + 10, y: CAL.y + CTOP + 40 + r * CROWH + (CROWH - h) / 2, w, h }; };
const CPOSTS = [[0, 0, 2], [0, 2, 3], [0, 5, 0], [1, 1, 2], [1, 6, 3], [2, 0, 3], [2, 3, 2], [2, 5, 0]];
const SLOT = [1, 4];
function calendar(ctx, t) {
  const a = ep(t, T.toCal[0] + 0.1, T.toCal[0] + 0.45) * (1 - ep(t, T.end[0], T.end[0] + 0.35));
  if (a <= 0) return;
  const push = 1 + 0.03 * ep(t, T.toCal[1], T.end[0], (v) => v);
  const c = ccell(...SLOT), ax = c.x + c.w / 2, ay = c.y + c.h / 2;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.translate(ax, ay); ctx.scale(push, push); ctx.translate(-ax, -ay);
  panelShell(ctx, CAL, 26, CTOP);
  ctx.save(); rr(ctx, CAL.x, CAL.y, CAL.w, CAL.h, 26); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(CAL.x, CAL.y + CTOP, CSIDE, CAL.h - CTOP); ctx.fillStyle = C.line; ctx.fillRect(CAL.x + CSIDE - 1, CAL.y + CTOP, 1.5, CAL.h - CTOP);
  ctx.restore();
  for (let k = 0; k < 7; k++) fillRR(ctx, CAL.x + CSIDE + k * CCOLW + CCOLW / 2 - 24, CAL.y + CTOP + 15, 48, 10, 5, C.gray);
  ctx.fillStyle = C.line;
  for (let k = 1; k < 7; k++) ctx.fillRect(CAL.x + CSIDE + k * CCOLW, CAL.y + CTOP + 40, 1.2, CROWH * 3);
  for (let r = 1; r < 3; r++) ctx.fillRect(CAL.x + CSIDE, CAL.y + CTOP + 40 + r * CROWH, CAL.w - CSIDE - 16, 1.2);
  for (let r = 0; r < 3; r++) {
    const cy = CAL.y + CTOP + 40 + r * CROWH + CROWH / 2;
    ctx.fillStyle = CLIENTS[r === 1 ? 0 : r === 0 ? 1 : 2].col; ctx.beginPath(); ctx.arc(CAL.x + 44, cy, 17, 0, Math.PI * 2); ctx.fill();
    fillRR(ctx, CAL.x + 72, cy - 11, 96, 10, 5, C.gray); fillRR(ctx, CAL.x + 72, cy + 5, 60, 9, 4.5, C.line);
  }
  // other client content stays organized in the background
  for (const [r, k, v] of CPOSTS) { const q = ccell(r, k); ctx.save(); ctx.globalAlpha *= 0.55; postCard(ctx, q.x, q.y, q.w, q.h, { client: r === 1 ? 0 : r === 0 ? 1 : 2, variant: v }); ctx.restore(); }
  ctx.restore();
}

// ---------- the hero over time (screen space) ----------
function heroAt(t) {
  const approved = ep(t, T.steps[2], T.steps[2] + 0.3);
  const thr = heroThreadRect(t);
  let r = { ...thr };
  const c = ep(t, ...T.clear, E.inOutCubic);
  const center = (sz) => ({ x: CENTER.x - sz.w / 2, y: CENTER.y - sz.h / 2, w: sz.w, h: sz.h });
  const lerpR = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
  r = lerpR(r, center(HERO_BIG), c);
  // hop across the three surfaces, then back to the centre as they align
  const hopRect = (i) => { const s = SURF[i]; return { x: s.x + s.w / 2 - HERO_HOP.w / 2, y: s.y + 56 + (s.h - 56) / 2 - HERO_HOP.h / 2, w: HERO_HOP.w, h: HERO_HOP.h }; };
  let arc = 0;
  T.hops.forEach((th, i) => {
    const p = ep(t, th, th + 0.45, E.inOutCubic);
    if (p > 0) { r = lerpR(r, hopRect(i), p); arc += Math.sin(Math.PI * p) * 50; }
  });
  const back = ep(t, T.align[0], T.align[1], E.inOutCubic);
  r = lerpR(r, center(HERO_BIG), back);
  // into the calendar slot
  const k = ep(t, ...T.toCal, E.inOutQuart);
  const c0 = ccell(...SLOT), PR = 1.3;
  const sl = { x: c0.x + c0.w / 2 - (c0.w * PR) / 2, y: c0.y + c0.h / 2 - (c0.h * PR) / 2, w: c0.w * PR, h: c0.h * PR };
  r = lerpR(r, sl, k); arc += Math.sin(Math.PI * k) * 60;
  return { ...r, y: r.y - arc, approved, lift: 0.5 + 0.5 * Math.sin(Math.PI * k) + 0.3 * k };
}

// ---------- end card ----------
const END_CTA = 'START YOUR RECURPOST TRIAL';
function endGeom(ctx) {
  ctx.save(); ctx.font = font(800, 62); ctx.letterSpacing = '1px';
  const w = ctx.measureText(END_CTA).width + 136; ctx.restore();
  return { cta: { x: (W - w) / 2, y: 560, w, h: 142 }, logoH: 128, logoY: 330 };
}

// ---------- frame ----------
// a slow push through the workspace beat (workspace and card together)
const wsZoom = (t) => 1 + 0.035 * ep(t, T.align[1], T.toCal[0], (v) => v) * (1 - ep(t, T.toCal[0], T.toCal[0] + 0.4, E.inOutCubic));

function renderAt(ctx, t) {
  background(ctx, t);
  thread(ctx, t);
  surfaces(ctx, t);
  const z = wsZoom(t);
  ctx.save(); ctx.translate(CENTER.x, CENTER.y); ctx.scale(z, z); ctx.translate(-CENTER.x, -CENTER.y);
  workspace(ctx, t);
  ctx.restore();
  calendar(ctx, t);
  const e = ep(t, ...T.end, E.inOutCubic);
  const h0 = heroAt(t);
  const h = { ...h0, x: CENTER.x + (h0.x - CENTER.x) * z, y: CENTER.y + (h0.y - CENTER.y) * z, w: h0.w * z, h: h0.h * z };
  const g = endGeom(ctx);
  if (e < 1) {
    // the approved card becomes the CTA: it grows into the yellow pill
    if (e > 0) {
      const r = { x: lerp(h.x, g.cta.x, e), y: lerp(h.y, g.cta.y, e), w: lerp(h.w, g.cta.w, e), h: lerp(h.h, g.cta.h, e) };
      ctx.save();
      ctx.globalAlpha = 1 - ep(e, 0, 0.5);
      heroCard(ctx, r.x, r.y, r.w, r.h, { approved: h.approved, lift: 0.6 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = ep(e, 0.2, 0.6);
      shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, r.x, r.y, r.w, r.h, lerp(20, r.h / 2, e), C.yellow));
      ctx.restore();
    } else if (t > T.v[2] - 0.05) {
      const showPill = 1 - ep(t, T.clear[0], T.clear[0] + 0.2);
      const inThread = t < T.clear[0] + 0.05;
      ctx.save();
      if (inThread) { rr(ctx, TP.x, TP.y + 70, TP.w, TP.h - 70, 0); ctx.clip(); }
      heroCard(ctx, h.x, h.y, h.w, h.h, { approved: h.approved, lift: h.lift });
      if (showPill > 0 && t < T.clear[1]) {
        ctx.save(); ctx.globalAlpha = showPill * ep(t, T.v[2], T.v[2] + 0.2);
        ctx.font = font(800, 28); const pw = ctx.measureText('Updated version').width + 48;
        versionPill(ctx, h.x + h.w - pw, h.y - 56, 'Updated version', 28);
        ctx.restore();
      }
      ctx.restore();
    }
  }
  if (t >= T.end[0]) {
    const pill = ep(t, T.end[1] - 0.15, T.end[1]);
    if (e >= 1 || pill > 0) {
      ctx.save();
      shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, g.cta.x, g.cta.y, g.cta.w, g.cta.h, g.cta.h / 2, C.yellow));
      ctx.globalAlpha = ep(t, T.end[1] - 0.05, T.end[1] + 0.25);
      ctx.font = font(800, 62); ctx.letterSpacing = '1px'; ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(END_CTA, W / 2, g.cta.y + g.cta.h / 2 + 2);
      ctx.restore();
    }
    const lp = ep(t, T.end[0] + 0.35, T.end[0] + 0.8, E.outQuint);
    if (lp > 0) {
      const LOGO = getLogo(), lw = g.logoH * LOGO.width / LOGO.height;
      ctx.save(); ctx.globalAlpha = lp; ctx.drawImage(LOGO, (W - lw) / 2, g.logoY + 20 * (1 - lp), lw, g.logoH); ctx.restore();
    }
  }
  backdrop(ctx, ep(t, T.toCal[0], T.toCal[1]) * (1 - ep(t, T.end[0], T.end[0] + 0.3)));
  headline(ctx, t, ['WHICH VERSION IS APPROVED?'], T.question + 0.04, T.clear[1] - 0.05, { band: 0 });
  headline(ctx, t, ['FEEDBACK, SPREAD ACROSS THREADS.'], 3.0, T.align[1] - 0.15, { band: 0, fs: 76 });
  headline(ctx, t, ['A CLEARER CLIENT REVIEW WORKFLOW'], T.align[1] + 0.1, T.toCal[0], { band: 0, fs: 72 });
  headline(ctx, t, ['REVIEW BEFORE PUBLISHING'], T.toCal[1] + 0.05, T.end[0], { band: 0 });
}

module.exports = { TL, renderAt, mainScene: renderAt };
