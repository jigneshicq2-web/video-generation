// Scene 06 (approvals), Scene 07 (publish + failure recovery), Scene 08 (unified inbox).
const L = require('../lib');
const C = require('./common');
const { B, W, H, rr, card, text, ui, disp, hexA, ep, E, prog, lerp, clamp, platformTile, flowLine, chipRow } = L;
const { fitFont } = require('./s01_s02');

// ---------------- Scene 06: APPROVALS ----------------
const STEPS = [
  ['POST', 14.3], ['CLIENT REVIEW', 14.55], ['PENDING APPROVAL', 14.8], ['APPROVED', 15.3], ['SCHEDULED', 16.1], ['PUBLISHED', 99],
];
const PC = { x: 90, y: 540, w: 900, h: 450 }; // post card
const BTN = { cx: W / 2, cy: 640 };          // PUBLISH button (hand-off to Scene 07)

function postCard(ctx, t, status, statusColor, o = {}) {
  const { x, y, w, h } = PC;
  card(ctx, x, y, w, h, { r: 32 });
  platformTile(ctx, 'instagram', x + 60, y + 62, 64);
  text(ctx, 'Instagram post', x + 110, y + 50, { font: ui(700, 30), align: 'left' });
  text(ctx, 'Thu · 6 PM', x + 110, y + 86, { font: ui(500, 24), color: B.muted, align: 'left' });
  C.postArt(ctx, x + 30, y + 130, 290, 290, 0, 20);
  C.lines(ctx, x + 350, y + 150, w - 390, 5, { lh: 36, th: 14 });
  if (status) {
    const pw = L.measure(ctx, status, ui(700, 24), 1) + 70;
    C.statusPill(ctx, status, x + w - 30 - pw / 2, y + 62, statusColor, { font: ui(700, 24), h: 48, check: o.check });
  }
}

function stepper(ctx, t, x, y, o = {}) {
  const rowH = 62;
  STEPS.forEach(([label, ta], i) => {
    const on = t >= ta;
    const p = ep(t, ta, ta + 0.2, E.outBack);
    const cy = y + i * rowH;
    // connector
    if (i > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, cy - rowH + 20); ctx.lineTo(x, cy - 20); ctx.stroke(); ctx.restore();
      const fp = ep(t, ta - 0.15, ta);
      if (fp > 0) flowLine(ctx, [[x, cy - rowH + 20], [x, cy - 20]], 0, fp, { lw: 4, glow: 12, head: false, gx0: x, gy0: y, gx1: x, gy1: y + rowH * 6 });
    }
    const col = label === 'APPROVED' ? B.success : label === 'PUBLISHED' ? B.success : B.secondary;
    ctx.save();
    ctx.translate(x, cy);
    if (on) {
      ctx.scale(lerp(0.4, 1, p), lerp(0.4, 1, p));
      ctx.shadowColor = col; ctx.shadowBlur = 18;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      L.checkMark(ctx, 0, 0, 22, '#07122A', 4.5, p);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.stroke();
    }
    ctx.restore();
    text(ctx, label, x + 44, cy + 1, { font: ui(800, 30), track: 2, align: 'left', color: on ? B.text : B.dim, alpha: o.alpha ?? 1 });
  });
}

function comment(ctx, x, y, w, name, msg, col, p, plat) {
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(x + w / 2, y + 70); ctx.scale(lerp(0.7, 1, p), lerp(0.7, 1, p)); ctx.translate(-w / 2, -70);
  card(ctx, 0, 0, w, 140, { r: 30, fill: '#223066', stroke: 'rgba(255,255,255,0.14)' });
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(62, 70, 34, 0, 7); ctx.fill();
  text(ctx, name.slice(0, 2).toUpperCase(), 62, 71, { font: ui(800, 22), color: '#0A0D22' });
  if (plat) platformTile(ctx, plat, 90, 96, 30);
  text(ctx, name, 116, 46, { font: ui(700, 24), color: B.muted, align: 'left' });
  text(ctx, msg, 116, 92, { font: ui(700, 32), align: 'left' });
  ctx.restore();
}

function scene6(ctx, t) {
  L.background(ctx, t, { gridShift: 450 + t * 30 });
  const morph = ep(t, 16.55, 16.98, E.inOutCubic);
  const uiFade = 1 - morph;

  // badge from Scene 05 unfolds into the post card
  const open = ep(t, 14.0, 14.3, E.outExpo);
  if (open < 1) {
    ctx.save(); ctx.globalAlpha = 1 - open;
    ctx.strokeStyle = B.success; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(W / 2, 960, 96 * (1 - open * 0.5), 0, 7); ctx.stroke();
    L.checkMark(ctx, W / 2, 960, 120 * (1 - open * 0.5), B.success, 16);
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = clamp(open * 1.4) * uiFade;
  ctx.translate(W / 2, 960 - (960 - (PC.y + PC.h / 2)) * open);
  ctx.scale(lerp(0.2, 1, open), lerp(0.2, 1, open));
  ctx.translate(-W / 2, -(PC.y + PC.h / 2));
  let st = ['Draft', B.muted];
  if (t >= 14.55) st = ['In client review', B.secondary];
  if (t >= 14.8) st = ['Pending approval', B.warn];
  if (t >= 15.3) st = ['Approved', B.success];
  if (t >= 16.1) st = ['Scheduled', B.primary];
  postCard(ctx, t, st[0], st[1], { check: t >= 15.3 });
  ctx.restore();

  // client comment
  const cp = ep(t, 14.9, 15.15, E.outBack);
  if (cp > 0) comment(ctx, 330, 930, 660, 'Client', 'Looks great! Approved.', B.accent, cp * uiFade, null);

  // stepper
  ctx.save(); ctx.globalAlpha = clamp(open) * uiFade;
  stepper(ctx, t, 150, 1130);
  ctx.restore();

  // big approval checkmark hit
  const hit = prog(t, 15.3, 15.5);
  if (hit > 0 && morph === 0) {
    const dock = ep(t, 15.85, 16.15, E.inOutCubic);
    const s = lerp(2.6, 1, E.outExpo(hit)) * lerp(1, 0.32, dock);
    const cx = lerp(W / 2, PC.x + 290, dock), cy = lerp(760, PC.y + 160, dock);
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.globalAlpha = clamp(hit * 3);
    ctx.shadowColor = B.success; ctx.shadowBlur = 60;
    ctx.fillStyle = B.success; ctx.beginPath(); ctx.arc(0, 0, 130, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    L.checkMark(ctx, 0, 0, 170, '#06281C', 26, ep(t, 15.33, 15.5));
    ctx.restore();
    // radial burst
    const rb = prog(t, 15.3, 15.8);
    if (rb < 1) {
      ctx.save(); ctx.strokeStyle = hexA(B.success, 0.7 * (1 - rb)); ctx.lineWidth = 6;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r0 = 170 + rb * 120, r1 = r0 + 60 * (1 - rb);
        ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, 760 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1, 760 + Math.sin(a) * r1); ctx.stroke();
      }
      ctx.restore();
    }
  }

  // headlines
  ctx.save(); ctx.globalAlpha = uiFade;
  const out1 = ep(t, 15.4, 15.55);
  ctx.save(); ctx.globalAlpha *= 1 - out1;
  C.kineticType(ctx, 'CLIENT REVIEW', W / 2, 390, t, 14.1, { font: disp(800, 96), per: 0.025 });
  ctx.restore();
  C.slam(ctx, 'NO MORE', W / 2, 330, t, 15.5, { font: disp(800, 92) });
  C.slam(ctx, 'APPROVAL CHAOS.', W / 2, 440, t, 15.58, { font: disp(800, fitFont(ctx, 'APPROVAL CHAOS.', 800, 92, 940)), color: B.success, glow: hexA(B.success, 0.5) });
  ctx.restore();

  // approved stamp morphs into the PUBLISH button
  if (morph > 0) {
    const cx = lerp(PC.x + 290, BTN.cx, morph), cy = lerp(PC.y + 160, BTN.cy, morph);
    const w = lerp(84, 520, E.outBack(morph)), h = lerp(84, 120, morph);
    ctx.save();
    ctx.shadowColor = hexA(B.primary, 0.8); ctx.shadowBlur = 40;
    rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, morph < 0.5 ? B.success : B.primary); g.addColorStop(1, morph < 0.5 ? B.success : B.secondary);
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    if (morph < 0.5) L.checkMark(ctx, cx, cy, 60, '#06281C', 10);
    else text(ctx, 'Publish now', cx, cy + 2, { font: ui(800, 44), alpha: (morph - 0.5) * 2 });
  }
}

// ---------------- Scene 07: PUBLISH + RECOVER ----------------
const PANEL = { x: 90, y: 760, w: 900, h: 470 };
const ROWS = [
  { k: 'instagram', name: 'Instagram', fail: false },
  { k: 'facebook', name: 'Facebook', fail: false },
  { k: 'linkedin', name: 'LinkedIn', fail: true },
];

function publishPanel(ctx, t) {
  const { x, y, w, h } = PANEL;
  card(ctx, x, y, w, h, { r: 32 });
  text(ctx, 'Publishing', x + 40, y + 60, { font: ui(700, 34), align: 'left' });
  ROWS.forEach((r, i) => {
    const ry = y + 130 + i * 112;
    const shake = r.fail && t > 17.85 && t < 18.1 ? Math.sin(t * 120) * 8 * (1 - prog(t, 17.85, 18.1)) : 0;
    ctx.save(); ctx.translate(shake, 0);
    rr(ctx, x + 24, ry - 44, w - 48, 92, 22);
    const failed = r.fail && t >= 17.85 && t < 19.45;
    ctx.fillStyle = failed ? hexA(B.error, 0.12) : 'rgba(255,255,255,0.035)'; ctx.fill();
    if (failed) { ctx.strokeStyle = hexA(B.error, 0.6); ctx.lineWidth = 2; ctx.stroke(); }
    platformTile(ctx, r.k, x + 78, ry, 60);
    text(ctx, r.name, x + 126, ry, { font: ui(700, 30), align: 'left' });
    // progress
    let pr = ep(t, 17.2 + i * 0.05, 17.75 + i * 0.03, E.inOutCubic);
    if (r.fail) pr = t < 17.85 ? Math.min(pr, 0.72) : t < 19.12 ? 0.72 : ep(t, 19.12, 19.42, E.inOutCubic);
    const bx = x + 370, bw = 260;
    rr(ctx, bx, ry - 6, bw, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    rr(ctx, bx, ry - 6, bw * pr, 12, 6); ctx.fillStyle = failed ? B.error : r.fail && t >= 19.12 && t < 19.45 ? B.warn : B.success; ctx.fill();
    // status
    const sx = x + w - 150;
    if (failed) C.statusPill(ctx, 'Failed', sx, ry, B.error, { font: ui(800, 24), h: 46 });
    else if ((!r.fail && t >= 17.75 + i * 0.03) || (r.fail && t >= 19.45)) C.statusPill(ctx, 'Published', sx, ry, B.success, { font: ui(800, 24), h: 46, check: true });
    else text(ctx, r.fail && t >= 19.12 ? 'Retrying' : 'Sending', sx, ry, { font: ui(600, 24), color: B.muted });
    ctx.restore();
  });
}

function scene7(ctx, t) {
  L.background(ctx, t, { gridShift: 540 + t * 30 });
  const out = ep(t, 19.6, 19.98, E.inOutCubic);
  // publish button: clicked, then shrinks
  const press = prog(t, 17.1, 17.3);
  const gone = ep(t, 17.2, 17.45, E.inCubic);
  if (gone < 1) {
    const s = (press > 0 && press < 0.5 ? 0.92 : 1) * (1 - gone);
    ctx.save(); ctx.translate(BTN.cx, BTN.cy); ctx.scale(s, s);
    ctx.shadowColor = hexA(B.primary, 0.8); ctx.shadowBlur = 40;
    rr(ctx, -260, -60, 520, 120, 60);
    const g = ctx.createLinearGradient(-260, 0, 260, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
    text(ctx, 'Publish now', 0, 2, { font: ui(800, 44) });
    ctx.restore();
    C.cursor(ctx, lerp(760, BTN.cx + 120, ep(t, 17.0, 17.1)), lerp(900, BTN.cy + 20, ep(t, 17.0, 17.1)), 1.1, prog(t, 17.1, 17.5));
  }
  // panel
  const pin = ep(t, 17.15, 17.4, E.outBack);
  if (pin > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(pin * 2) * (1 - out);
    ctx.translate(W / 2, PANEL.y + PANEL.h / 2); ctx.scale(lerp(0.85, 1, pin) * lerp(1, 0.4, out), lerp(0.85, 1, pin) * lerp(1, 0.4, out)); ctx.translate(-W / 2, -(PANEL.y + PANEL.h / 2));
    publishPanel(ctx, t);
    ctx.restore();
  }
  // big failure signal
  const pf = prog(t, 17.85, 18.45);
  if (pf > 0 && pf < 1) {
    ctx.save(); ctx.globalAlpha = Math.sin(pf * Math.PI);
    C.slam(ctx, 'POST FAILED', W / 2, 660, t, 17.85, { font: disp(800, 88), color: B.error, glow: hexA(B.error, 0.6), dur: 0.15 });
    ctx.restore();
    ctx.save(); ctx.fillStyle = B.error; ctx.globalAlpha = 0.12 * (1 - pf); ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // WHY? callout with the concrete reason + fix / retry actions
  const why = ep(t, 18.35, 18.6, E.outBack);
  const whyOut = ep(t, 19.45, 19.7);
  if (why > 0 && out < 1) {
    const x = 90, y = 1260, w = 900, h = 230;
    ctx.save();
    ctx.globalAlpha = clamp(why * 2) * (1 - whyOut);
    ctx.translate(W / 2, y); ctx.scale(lerp(0.8, 1, why), lerp(0.8, 1, why)); ctx.translate(-W / 2, -y);
    card(ctx, x, y, w, h, { r: 30, stroke: hexA(B.error, 0.6) });
    // pointer to the failed row
    ctx.beginPath(); ctx.moveTo(x + 150, y); ctx.lineTo(x + 175, y - 24); ctx.lineTo(x + 200, y); ctx.fillStyle = B.surface2; ctx.fill();
    text(ctx, 'WHY?', x + 40, y + 62, { font: disp(800, 48), color: B.error, align: 'left' });
    text(ctx, 'LinkedIn connection expired.', x + 210, y + 50, { font: ui(700, 32), align: 'left' });
    text(ctx, 'Reconnect the account, then retry.', x + 210, y + 92, { font: ui(500, 28), color: B.muted, align: 'left' });
    // buttons
    const fixed = t >= 18.75;
    const b1x = x + 210, by = y + 150;
    rr(ctx, b1x, by - 32, 250, 64, 32); ctx.fillStyle = fixed ? hexA(B.success, 0.2) : B.warn; ctx.fill();
    if (fixed) { ctx.strokeStyle = B.success; ctx.lineWidth = 2; ctx.stroke(); L.checkMark(ctx, b1x + 36, by, 24, B.success, 5); }
    text(ctx, fixed ? 'Reconnected' : 'Reconnect', b1x + (fixed ? 145 : 125), by + 1, { font: ui(800, 26), color: fixed ? B.success : '#241500' });
    const b2x = b1x + 280;
    rr(ctx, b2x, by - 32, 200, 64, 32); ctx.fillStyle = t >= 19.1 ? B.primary : 'rgba(255,255,255,0.08)'; ctx.fill();
    L.loopIcon(ctx, b2x + 40, by, 13, '#fff', 4, t >= 19.1 ? t * 8 : 0);
    text(ctx, 'Retry', b2x + 115, by + 1, { font: ui(800, 26) });
    ctx.restore();
    // cursor: Reconnect then Retry
    if (whyOut < 1) {
      const c1 = ep(t, 18.5, 18.72, E.inOutCubic), c2 = ep(t, 18.85, 19.08, E.inOutCubic);
      const px = lerp(lerp(900, b1x + 150, c1), b2x + 120, c2), py = lerp(lerp(1600, by + 10, c1), by + 10, c2);
      if (t > 18.5) C.cursor(ctx, px, py, 1.1, t < 19.1 ? prog(t, 18.75, 19.1) : prog(t, 19.1, 19.45));
    }
  }

  // headline + FIX → RETRY → PUBLISHED flow
  ctx.save(); ctx.globalAlpha = 1 - out;
  ctx.save(); ctx.globalAlpha *= 1 - ep(t, 17.8, 17.9);
  C.kineticType(ctx, 'PUBLISH.', W / 2, 390, t, 17.02, { font: disp(800, 108), per: 0.03, glow: hexA(B.primary, 0.7) });
  ctx.restore();
  const parts = [['SEE IT.', 17.9, B.text], ['FIX IT.', 18.72, B.warn], ['RETRY IT.', 19.12, B.success]];
  const size = fitFont(ctx, 'SEE IT. FIX IT. RETRY IT.', 800, 86, 960);
  const f = disp(800, size);
  const widths = parts.map(([s]) => L.measure(ctx, s + ' ', f));
  let x = W / 2 - widths.reduce((a, b) => a + b, 0) / 2 + L.measure(ctx, ' ', f) / 2;
  parts.forEach(([s, ta, col], i) => {
    const p = ep(t, ta, ta + 0.2, E.outBack);
    if (p > 0) {
      ctx.save(); ctx.translate(x + widths[i] / 2, 380); ctx.scale(lerp(1.8, 1, clamp(p)), lerp(1.8, 1, clamp(p)));
      text(ctx, s, 0, 0, { font: f, color: col, alpha: clamp(p * 2) });
      ctx.restore();
    }
    x += widths[i];
  });
  const steps = [['FIX', 18.72], ['RETRY', 19.12], ['PUBLISHED', 19.45]];
  let sx = W / 2 - 330;
  ctx.globalAlpha *= ep(t, 17.9, 18.1);
  steps.forEach(([s, ta], i) => {
    const on = t >= ta;
    const w = L.chip(ctx, s, -9999, -9999, { font: ui(800, 24) }); // measure
    const p = ep(t, ta, ta + 0.2, E.outBack);
    ctx.save(); ctx.translate(sx + w / 2, 490);
    if (on) ctx.scale(lerp(0.7, 1, p), lerp(0.7, 1, p));
    L.chip(ctx, s, 0, 0, { font: ui(800, 24), h: 52, alpha: on ? 1 : 0.35, fill: on ? hexA(i === 2 ? B.success : B.primary, 0.3) : undefined, stroke: on ? (i === 2 ? B.success : B.secondary) : undefined });
    ctx.restore();
    sx += w + 20;
    if (i < 2) { L.arrow(ctx, sx + 8, 490, 30, t >= steps[i + 1][1] ? B.secondary : B.dim, 4); sx += 46; }
  });
  ctx.restore();

  // success: published post lifts toward Scene 08
  if (out > 0) {
    const s = lerp(0.4, 1, out);
    ctx.save(); ctx.globalAlpha = out;
    ctx.translate(W / 2, lerp(995, 700, out)); ctx.scale(s, s);
    publishedCard(ctx, 0, 0);
    ctx.restore();
  }
}

function publishedCard(ctx, cx, cy) {
  const w = 360, h = 420;
  card(ctx, cx - w / 2, cy - h / 2, w, h, { r: 28 });
  platformTile(ctx, 'instagram', cx - w / 2 + 44, cy - h / 2 + 44, 48);
  C.lines(ctx, cx - w / 2 + 84, cy - h / 2 + 32, 160, 2, { lh: 18, th: 9 });
  C.postArt(ctx, cx - w / 2 + 20, cy - h / 2 + 84, w - 40, 230, 0, 16);
  C.statusPill(ctx, 'Published', cx, cy + h / 2 - 50, B.success, { font: ui(800, 24), h: 48, check: true });
}

// ---------------- Scene 08: UNIFIED INBOX ----------------
const MSGS = [
  { k: 'instagram', type: 'COMMENT', name: 'Maya R.', msg: 'Love this! Where can I get one?', pos: [300, 900], col: '#FF5FA2' },
  { k: 'facebook', type: 'COMMENT', name: 'Daniel K.', msg: 'Great tips, thank you!', pos: [780, 1030], col: B.secondary },
  { k: 'linkedin', type: 'MESSAGE', name: 'Priya S.', msg: 'Hi! Open to a collaboration?', pos: [320, 1170], col: B.warn },
  { k: 'gbp', type: 'REVIEW', name: 'Alex T.', msg: 'Friendly team, quick service.', pos: [760, 1310], col: B.success, stars: true },
  { k: 'instagram', type: 'DM', name: 'Sam W.', msg: 'Is this available in blue?', pos: [330, 1440], col: B.accent },
];
const INBOX = { x: 70, y: 560, w: 940, h: 800 };

function bubble(ctx, m, cx, cy, s, a) {
  const w = 560, h = 118;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.translate(cx, cy); ctx.scale(s, s);
  card(ctx, -w / 2, -h / 2, w, h, { r: 26, fill: '#1E2A5A', stroke: 'rgba(255,255,255,0.14)', shadowBlur: 30 });
  platformTile(ctx, m.k, -w / 2 + 56, 0, 64);
  text(ctx, `${m.name} · ${m.type.toLowerCase()}`, -w / 2 + 104, -22, { font: ui(600, 22), color: B.muted, align: 'left' });
  if (m.stars) { for (let i = 0; i < 5; i++) L.star(ctx, -w / 2 + 116 + i * 30, 20, 13, '#FFC53D'); text(ctx, m.msg.split(',')[0], -w / 2 + 272, 20, { font: ui(700, 26), align: 'left' }); }
  else text(ctx, m.msg, -w / 2 + 104, 18, { font: ui(700, 27), align: 'left' });
  ctx.restore();
}

function inbox(ctx, t, rowsIn) {
  const { x, y, w, h } = INBOX;
  card(ctx, x, y, w, h, { r: 34 });
  text(ctx, 'Inbox', x + 40, y + 60, { font: ui(800, 36), align: 'left' });
  const tabs = ['All', 'Comments', 'DMs', 'Reviews'];
  let tx = x + 40;
  tabs.forEach((tb, i) => {
    const tw = L.measure(ctx, tb, ui(700, 24)) + 36;
    rr(ctx, tx, y + 100, tw, 48, 24); ctx.fillStyle = i === 0 ? hexA(B.primary, 0.4) : 'rgba(255,255,255,0.05)'; ctx.fill();
    text(ctx, tb, tx + tw / 2, y + 125, { font: ui(700, 24), color: i === 0 ? B.text : B.muted });
    tx += tw + 12;
  });
  MSGS.forEach((m, i) => {
    const p = rowsIn[i];
    if (p <= 0) return;
    const ry = y + 180 + i * 118;
    ctx.save(); ctx.globalAlpha *= clamp(p * 2);
    ctx.translate(0, (1 - p) * 20);
    rr(ctx, x + 20, ry, w - 40, 106, 20); ctx.fillStyle = i === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)'; ctx.fill();
    platformTile(ctx, m.k, x + 74, ry + 53, 60);
    ctx.fillStyle = m.col; ctx.beginPath(); ctx.arc(x + 146, ry + 53, 26, 0, 7); ctx.fill();
    text(ctx, m.name.slice(0, 1), x + 146, ry + 54, { font: ui(800, 22), color: '#0A0D22' });
    text(ctx, m.name, x + 188, ry + 34, { font: ui(700, 26), align: 'left' });
    if (m.stars) for (let s = 0; s < 5; s++) L.star(ctx, x + 200 + s * 26, ry + 74, 11, '#FFC53D');
    text(ctx, m.stars ? m.msg.split(',')[0] : m.msg, x + (m.stars ? 340 : 188), ry + 74, { font: ui(500, 24), color: B.muted, align: 'left' });
    const tagCol = { COMMENT: B.secondary, DM: B.accent, REVIEW: B.success, MESSAGE: B.warn }[m.type];
    const tw = L.measure(ctx, m.type, ui(800, 18), 1) + 26;
    rr(ctx, x + w - 40 - tw, ry + 20, tw, 34, 17); ctx.fillStyle = hexA(tagCol, 0.2); ctx.fill();
    text(ctx, m.type, x + w - 40 - tw / 2, ry + 38, { font: ui(800, 18), color: tagCol, track: 1 });
    if (i < 2) { ctx.fillStyle = B.secondary; ctx.beginPath(); ctx.arc(x + w - 60, ry + 78, 7, 0, 7); ctx.fill(); }
    ctx.restore();
  });
}

function scene8(ctx, t) {
  L.background(ctx, t, { gridShift: 630 + t * 30 });
  const zoomOut = ep(t, 22.6, 22.98, E.inExpo);
  // the published post, source of the conversations
  const pcOut = ep(t, 20.9, 21.3, E.inCubic);
  if (pcOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - pcOut;
    ctx.translate(W / 2, lerp(700, 560, pcOut)); ctx.scale(lerp(1, 0.6, pcOut), lerp(1, 0.6, pcOut));
    publishedCard(ctx, 0, 0);
    ctx.restore();
  }
  const inboxIn = ep(t, 21.0, 21.35, E.outExpo);
  const rowsIn = MSGS.map((_, i) => ep(t, 21.52 + i * 0.03, 21.7 + i * 0.03, E.outBack));
  if (inboxIn > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(inboxIn * 2) * (1 - zoomOut);
    const s = lerp(0.9, 1, inboxIn) * lerp(1, 0.55, zoomOut);
    ctx.translate(W / 2, INBOX.y + INBOX.h / 2); ctx.scale(s, s); ctx.translate(-W / 2, -(INBOX.y + INBOX.h / 2));
    inbox(ctx, t, rowsIn);
    ctx.restore();
  }
  // interactions burst out, then get pulled magnetically into the inbox
  MSGS.forEach((m, i) => {
    const ta = 20.1 + i * 0.15;
    const p = ep(t, ta, ta + 0.25, E.outBack);
    if (p <= 0) return;
    const pull = ep(t, 21.1 + i * 0.05, 21.55 + i * 0.03, E.inExpo);
    if (pull >= 1) return;
    const [bx, by] = m.pos;
    const tx = W / 2, ty = INBOX.y + 180 + i * 118 + 53;
    const x = lerp(lerp(W / 2, bx, p), tx, pull), y = lerp(lerp(700, by, p), ty, pull);
    // motion streak during the pull
    if (pull > 0.1) flowLine(ctx, [[lerp(bx, tx, Math.max(0, pull - 0.3)), lerp(by, ty, Math.max(0, pull - 0.3))], [x, y]], 0, 1, { lw: 3, glow: 10, head: false, alpha: 0.6 });
    bubble(ctx, m, x, y, lerp(0.5, 1, clamp(p)) * lerp(1, 0.85, pull), clamp(p * 2) * (1 - pull * 0.6));
  });
  // snap flash
  const sn = prog(t, 21.58, 21.85);
  if (sn > 0 && sn < 1) { ctx.save(); ctx.strokeStyle = hexA(B.secondary, 0.8 * (1 - sn)); ctx.lineWidth = 6; rr(ctx, INBOX.x - sn * 40, INBOX.y - sn * 40, INBOX.w + sn * 80, INBOX.h + sn * 80, 40); ctx.stroke(); ctx.restore(); }

  // data particles leaving (hand-off to Scene 09)
  if (zoomOut > 0) {
    const r = L.rng(88);
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = zoomOut * (200 + r() * 700);
      ctx.save(); ctx.globalAlpha = zoomOut * (1 - zoomOut * 0.3);
      ctx.fillStyle = B.flow[i % 3];
      ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * d, 960 + Math.sin(a) * d, 3 + r() * 4, 0, 7); ctx.fill(); ctx.restore();
    }
  }

  // headline + chips
  ctx.save(); ctx.globalAlpha = 1 - zoomOut;
  const hp = ep(t, 21.6, 21.8, E.outBack);
  if (hp > 0) {
    ctx.save(); ctx.translate(W / 2, 400); ctx.scale(lerp(0.4, 1, hp), lerp(0.4, 1, hp));
    text(ctx, 'ONE INBOX.', 0, 0, { font: disp(800, 124), glow: hexA(B.secondary, 0.7), alpha: clamp(hp * 2) });
    ctx.restore();
  } else {
    const pre = ep(t, 20.1, 20.3);
    text(ctx, 'Comments. DMs. Reviews.', W / 2, 400, { font: disp(800, 64), color: B.muted, alpha: pre * (1 - ep(t, 21.45, 21.6)) });
  }
  chipRow(ctx, ['COMMENTS', 'DMs', 'REVIEWS', 'AUTOMATION'], W / 2, 1440, t, 22.0, { font: ui(800, 25), padX: 20, h: 54, gap: 14 });
  ctx.restore();
}

module.exports = { scene6, scene7, scene8 };
