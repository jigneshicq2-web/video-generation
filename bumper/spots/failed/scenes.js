// 25 s skippable in-stream, "A post fails. The client notices first." One continuous story around one
// scheduled post card: it fails at its slot -> joins the client's timeline -> the client asks -> the
// timeline becomes the History view -> the reason is shown -> a detail panel offers the two actions ->
// "Retry action selected" (neutral, never a success state) -> organized view -> brand panel -> CTA.
// Visible words: the five headlines, the client message, "Failed", "Reason shown in History",
// "Edit and Retry", "Retry Now", "Retry action selected", and the end card.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, clockIcon, checkIcon, cursor, background, getLogo } = L;
const { CLIENTS, ST, ASPECT, VAR: VARS_UI, exclaim, badge, postCard, headline, backdrop, applyCam, toScreen } = require('../../ui');
const T = TL.T;
const RED = ST.F.col;

// ---------- the History view (layer coordinates) ----------
const HP = { x: 230, y: 300, w: 1460, h: 660 };
const HTOP = 72, HSIDE = 230;
const rowY = (i) => HP.y + HTOP + 20 + i * 186 + 93;
const slotX = (k) => 560 + k * 210;
const CW = 168, CH = CW / ASPECT;
// status per slot (P published, S scheduled, F failed, . empty); the hero is row 1, slot 3
const ROWS = ['PP.SS.', 'PPPFSS', 'P.S.SS'];
const HERO = { row: 1, k: 3, client: 1, variant: 1 };
const VARS = [[0, 2, 0, 3, 2, 3], [2, 0, 3, 1, 0, 2], [3, 0, 2, 0, 3, 0]];

// ---------- camera keys (layer -> screen, anchored at 960,640) ----------
const KEYS = [ // [time, z, cx, cy, ease]; holds keep a slow push so the frame never goes dead
  [T.toTimeline[0], 1.45, 1085, 690, E.inOutCubic], [T.toTimeline[1] + 0.3, 1.45, 1085, 690, (v) => v],
  [T.msgAside[0], 1.5, 1095, 690, E.inOutCubic], [T.msgAside[1], 1.6, 1190, 690, E.inOutCubic],
  [T.history[1], 1.0, 960, 640, (v) => v], [T.focus[0], 1.02, 960, 640, E.inOutCubic],
  [T.focus[1], 1.3, 1190, 671, (v) => v], [T.pullBack[0], 1.36, 1190, 671, E.inOutCubic],
  [T.pullBack[1], 1.0, 960, 640, (v) => v], [T.gather[0], 1.035, 960, 640, E.inOutCubic],
];
function camera(t) {
  let z = KEYS[0][1], cx = KEYS[0][2], cy = KEYS[0][3];
  for (let i = 0; i < KEYS.length; i++) {
    const nx = KEYS[i + 1];
    if (!nx || t < nx[0]) {
      const [t0, z0, x0, y0, ease] = KEYS[i];
      if (!nx || t <= t0) { z = z0; cx = x0; cy = y0; } else {
        const p = ease(clamp((t - t0) / (nx[0] - t0)));
        z = lerp(z0, nx[1], p); cx = lerp(x0, nx[2], p); cy = lerp(y0, nx[3], p);
      }
      break;
    }
  }
  return { z, cx, cy, sx: 960, sy: 640 };
}

// ---------- small parts ----------
function infoIcon(ctx, cx, cy, r, col) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = r * 0.18;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.42, r * 0.13, 0, Math.PI * 2); ctx.fill();
  fillRR(ctx, cx - r * 0.11, cy - r * 0.18, r * 0.22, r * 0.62, r * 0.1, col);
  ctx.restore();
}
function retryIcon(ctx, cx, cy, r, col) {
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = r * 0.24; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, -Math.PI * 0.2, Math.PI * 1.35); ctx.stroke();
  const a = -Math.PI * 0.2, ex = cx + Math.cos(a) * r * 0.7, ey = cy + Math.sin(a) * r * 0.7;
  ctx.beginPath(); ctx.moveTo(ex - r * 0.36, ey - r * 0.06); ctx.lineTo(ex + r * 0.14, ey - r * 0.34); ctx.lineTo(ex + r * 0.14, ey + r * 0.24); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function person(ctx, cx, cy, r, bg, fg) {
  ctx.save();
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.22, r * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.78, r * 0.66, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// A pill label: [icon] text. Returns its width. kind: 'failed' | 'neutral'
function pill(ctx, x, y, text, fs, kind, dryRun = false) {
  ctx.save();
  ctx.font = font(kind === 'failed' ? 800 : 700, fs);
  const h = Math.round(fs * 1.75), w = ctx.measureText(text).width + h * 1.55;
  if (!dryRun) {
    if (kind === 'failed') shadowed(ctx, 20, 8, 0.16, () => fillRR(ctx, x, y, w, h, h / 2, RED));
    else { fillRR(ctx, x, y, w, h, h / 2, '#EFEDE7'); rr(ctx, x, y, w, h, h / 2); ctx.strokeStyle = C.gray2; ctx.lineWidth = 2; ctx.stroke(); }
    const ic = x + h * 0.55, col = kind === 'failed' ? '#FFFFFF' : C.ink;
    if (kind === 'failed') exclaim(ctx, ic, y + h / 2 + 1, h * 0.46, col); else retryIcon(ctx, ic, y + h / 2, h * 0.3, col);
    ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + h * 1.05, y + h / 2 + 1);
  }
  ctx.restore();
  return { w, h };
}

// The hero card with its failed state. f: 0..1 failed state on.
function heroCard(ctx, x, y, w, h, f, lift = 0) {
  postCard(ctx, x, y, w, h, { client: HERO.client, variant: HERO.variant, lift, status: 'F', statusA: f });
  if (f > 0) {
    ctx.save(); ctx.globalAlpha *= f;
    rr(ctx, x - 3, y - 3, w + 6, h + 6, h * 0.13 + 3); ctx.strokeStyle = RED; ctx.lineWidth = Math.max(3, h * 0.03); ctx.stroke();
    ctx.restore();
  }
}

// ---------- scene 1: the post fails at its slot ----------
const S1 = { x: 960, y: 610, w: 340, h: 340 / ASPECT };
function heroScreen(t) {
  const p = ep(t, T.heroIn, T.arrive, E.inOutCubic);
  const g = 1 + 0.05 * ep(t, T.fail + 0.2, T.toTimeline[0], (v) => v);
  return { x: lerp(330, S1.x, p), y: S1.y + Math.sin(Math.PI * p) * -18, w: S1.w * g, h: S1.h * g, a: clamp(ep(t, T.heroIn, T.heroIn + 0.3) * 1.5) };
}
function scene1(ctx, t) {
  // publishing slot
  const slotA = 1 - ep(t, T.toTimeline[0], T.toTimeline[0] + 0.3);
  if (slotA > 0) {
    ctx.save(); ctx.globalAlpha = slotA * (1 - 0.5 * ep(t, T.arrive - 0.1, T.arrive + 0.2));
    rr(ctx, S1.x - S1.w / 2 - 14, S1.y - S1.h / 2 - 14, S1.w + 28, S1.h + 28, 30);
    ctx.fillStyle = 'rgba(255,205,66,0.12)'; ctx.fill();
    ctx.setLineDash([12, 9]); ctx.strokeStyle = '#E3B53A'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
}

// ---------- the History panel and its timelines ----------
function historyFrame(ctx, t, a) {
  if (a <= 0) return;
  const { x, y, w, h } = HP;
  ctx.save(); ctx.globalAlpha *= a;
  shadowed(ctx, 70, 26, 0.16, () => fillRR(ctx, x, y, w, h, 26, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, 26); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(x, y, w, HTOP); ctx.fillStyle = C.line; ctx.fillRect(x, y + HTOP - 1, w, 1.5);
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(x, y + HTOP, HSIDE, h - HTOP); ctx.fillStyle = C.line; ctx.fillRect(x + HSIDE - 1, y + HTOP, 1.5, h - HTOP);
  ctx.restore();
  // client profiles (no names: dot + abstract bars)
  for (let i = 0; i < 3; i++) {
    const cy = rowY(i);
    ctx.fillStyle = CLIENTS[i].col; ctx.beginPath(); ctx.arc(x + 46, cy, 19, 0, Math.PI * 2); ctx.fill();
    fillRR(ctx, x + 78, cy - 12, 118 - i * 12, 11, 5.5, C.gray); fillRR(ctx, x + 78, cy + 6, 70, 9, 4.5, C.line);
  }
  // subtle logo reveal in the panel bar (exact asset, native ratio); hidden before any zoom so it is never cropped
  const lp = ep(t, ...T.logo, E.outQuint) * (1 - ep(t, T.focus[0] - 0.2, T.focus[0])) + ep(t, T.pullBack[1] - 0.3, T.pullBack[1]) * (1 - ep(t, T.gather[0], T.gather[0] + 0.2));
  if (lp > 0) {
    const LOGO = getLogo(), lh = 34;
    ctx.globalAlpha *= clamp(lp);
    ctx.drawImage(LOGO, x + 30, y + (HTOP - lh) / 2, lh * LOGO.width / LOGO.height, lh);
  }
  ctx.restore();
}

// status view in the panel bar (replaces the client message in the organized view): icons only
function statusView(ctx, t) {
  const a = ep(t, T.statusView, T.statusView + 0.4) * (1 - ep(t, T.gather[0], T.gather[0] + 0.2));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const keys = ['P', 'S', 'F'];
  keys.forEach((k, i) => {
    const x = HP.x + HP.w - 30 - (3 - i) * 150, y = HP.y + 16;
    fillRR(ctx, x, y, 136, 40, 20, C.surface); rr(ctx, x, y, 136, 40, 20); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    badge(ctx, k, x + 22, y + 20, 12);
    fillRR(ctx, x + 44, y + 15, 72 - i * 8, 10, 5, C.gray);
  });
  ctx.restore();
}

function track(ctx, i, a, t) {
  if (a <= 0) return;
  const y = rowY(i);
  ctx.save(); ctx.globalAlpha *= a;
  const draw = i === 1 ? ep(t, T.toTimeline[0], T.toTimeline[1], E.inOutCubic) : 1;
  const x0 = 470, x1 = 1660, xm = lerp(slotX(3), x0, draw), xM = lerp(slotX(3), x1, draw);
  ctx.fillStyle = C.line; fillRR(ctx, xm, y - 2, xM - xm, 4, 2, C.gray);
  for (let x = 480; x < 1660; x += 105) if (x > xm && x < xM) { ctx.fillStyle = C.gray2; ctx.fillRect(x, y - 9, 2, 18); }
  ctx.restore();
}

function rowCards(ctx, t, i, a, dim) {
  if (a <= 0) return;
  [...ROWS[i]].forEach((k, s) => {
    if (k === '.' || (i === HERO.row && s === HERO.k)) return;
    const d = i === 1 ? T.toTimeline[0] + 0.1 + Math.abs(s - 3) * 0.08 : 0;
    const q = i === 1 ? ep(t, d, d + 0.35, E.outQuint) : 1;
    if (q <= 0) return;
    const x = slotX(s) + (s < 3 ? -1 : 1) * 80 * (1 - q), y = rowY(i);
    ctx.save(); ctx.globalAlpha *= a * clamp(q * 1.5);
    postCard(ctx, x - CW / 2, y - CH / 2, CW, CH, { client: i, variant: VARS[i][s], status: k, statusA: 1, dim });
    ctx.restore();
  });
}

// ---------- hero placement over time ----------
// returns { space: 'screen'|'layer', x, y, w, h, f (failed), lift }
function heroAt(t, k) {
  const f = ep(t, T.fail, T.fail + 0.22);
  const s = heroScreen(t);
  if (t < T.toTimeline[0]) return { space: 'screen', ...s, f, lift: 0.6 + 0.3 * Math.sin(Math.PI * ep(t, T.arrive - 0.2, T.fail + 0.2)) };
  const lx = slotX(HERO.k), ly = rowY(HERO.row);
  const p = ep(t, ...T.toTimeline, E.inOutCubic);
  if (p < 1) {
    const sc = toScreen(k, lx, ly);
    return { space: 'screen', x: lerp(s.x, sc.x, p), y: lerp(s.y, sc.y, p), w: lerp(s.w, CW * k.z, p), h: lerp(s.h, CH * k.z, p), f, lift: 0.6 * (1 - p), a: 1 };
  }
  const focus = ep(t, ...T.focus, E.inOutCubic) * (1 - ep(t, T.pullBack[0], T.pullBack[1], E.inOutCubic));
  const s2 = 1 + 0.1 * focus;
  return { space: 'layer', x: lx, y: ly, w: CW * s2, h: CH * s2, f, lift: 0.8 * focus, a: 1 };
}

// ---------- client message ----------
function message(ctx, t) {
  const p = ep(t, T.notif, T.notif + 0.32, (v) => E.outBack(v, 1.4));
  const aside = ep(t, ...T.msgAside, E.inOutCubic);
  if (p <= 0 || aside >= 1) return;
  const text = 'Wasn’t this supposed to go live?';
  ctx.save();
  ctx.font = font(700, 42);
  const bw = ctx.measureText(text).width + 150, bh = 112;
  const x = 1720 - bw + 260 * aside, y = 400;
  ctx.globalAlpha = clamp(ep(t, T.notif, T.notif + 0.12) * (1 - aside));
  const s = 0.75 + 0.25 * p;
  ctx.translate(x + 40, y + bh / 2); ctx.scale(s, s); ctx.translate(-40, -bh / 2);
  shadowed(ctx, 40, 14, 0.16, () => fillRR(ctx, 0, 0, bw, bh, 30, C.surface));
  person(ctx, 62, bh / 2, 34, C.ink, '#FFFFFF');
  ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 116, bh / 2 + 2);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(bw - 28, 28, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- scene 3: reviewer + reason ----------
function reviewer(ctx, t, hs) {
  const a = ep(t, T.reviewer, T.reviewer + 0.3) * (1 - ep(t, T.detail[0], T.detail[0] + 0.2));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const ax = hs.x - hs.w / 2 - 30, ay = hs.y + hs.h / 2 + 34;
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(ax, ay, 33, 0, Math.PI * 2); ctx.fill();
  person(ctx, ax, ay, 28, C.ink, '#FFFFFF');
  const drift = Math.sin((t - T.reviewer) * 2.2) * 6;
  const cp = ep(t, T.reviewer, T.reviewer + 0.6, E.inOutCubic);
  cursor(ctx, lerp(ax + 40, hs.x + hs.w * 0.12, cp) + drift, lerp(ay + 40, hs.y + hs.h * 0.18, cp));
  ctx.restore();
}

function reasonCallout(ctx, t, hs) {
  const p = ep(t, T.reason, T.reason + 0.35, (v) => E.outBack(v, 1.3));
  const out = ep(t, T.detail[0], T.detail[0] + 0.2);
  if (p <= 0 || out >= 1) return;
  const x = hs.x + hs.w / 2 + 36, y = hs.y - 86, w = 610, h = 172;
  ctx.save();
  ctx.globalAlpha = clamp(p * 2) * (1 - out);
  ctx.translate(x, y + h / 2); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p); ctx.translate(-x, -(y + h / 2));
  shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, x, y, w, h, 22, C.surface));
  ctx.save(); rr(ctx, x, y, w, h, 22); ctx.clip(); ctx.fillStyle = C.yellow; ctx.fillRect(x, y, 8, h); ctx.restore();
  // pointer to the card
  ctx.fillStyle = C.surface; ctx.beginPath(); ctx.moveTo(x + 1, y + h / 2 - 14); ctx.lineTo(x - 14, y + h / 2); ctx.lineTo(x + 1, y + h / 2 + 14); ctx.fill();
  infoIcon(ctx, x + 50, y + 52, 20, C.ink);
  ctx.fillStyle = C.ink; ctx.font = font(700, 38); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Reason shown in History', x + 86, y + 54);
  // the reason itself stays abstract: no invented error text
  fillRR(ctx, x + 32, y + 104, w - 120, 14, 7, C.gray);
  fillRR(ctx, x + 32, y + 132, w - 260, 14, 7, C.line);
  ctx.restore();
}

// ---------- scene 4: detail panel ----------
const DP = { x: 330, y: 300, w: 1260, h: 660 };
const BTN = { y: 470, h: 86, fs: 36, gap: 24, x: 500 };
function buttonsGeom(ctx) {
  ctx.save(); ctx.font = font(800, BTN.fs);
  const w1 = ctx.measureText('Edit and Retry').width + 84, w2 = ctx.measureText('Retry Now').width + 84;
  ctx.restore();
  return { edit: { x: BTN.x, y: BTN.y, w: w1, h: BTN.h }, now: { x: BTN.x + w1 + BTN.gap, y: BTN.y, w: w2, h: BTN.h } };
}

function detailContent(ctx, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  // artwork + abstract caption
  const VAR = VARS_UI[HERO.variant];
  const th = 400;
  ctx.save(); rr(ctx, 48, 48, th, th, 24); ctx.fillStyle = VAR.tint; ctx.fill(); ctx.clip();
  ctx.fillStyle = VAR.a; ctx.beginPath(); ctx.arc(48 + th * 0.7, 48 + th * 0.33, th * 0.17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = VAR.b; ctx.beginPath(); ctx.moveTo(48 - th * 0.05, 48 + th); ctx.lineTo(48 + th * 0.33, 48 + th * 0.45); ctx.lineTo(48 + th * 0.72, 48 + th); ctx.fill();
  ctx.fillStyle = VAR.a; ctx.beginPath(); ctx.moveTo(48 + th * 0.38, 48 + th); ctx.lineTo(48 + th * 0.66, 48 + th * 0.6); ctx.lineTo(48 + th * 1.05, 48 + th); ctx.fill();
  ctx.restore();
  fillRR(ctx, 48, 480, 330, 14, 7, C.gray); fillRR(ctx, 48, 508, 240, 14, 7, C.line); fillRR(ctx, 48, 536, 290, 14, 7, C.line);
  // header: client + failed status
  ctx.fillStyle = CLIENTS[HERO.client].col; ctx.beginPath(); ctx.arc(BTN.x + 16, 76, 16, 0, Math.PI * 2); ctx.fill();
  fillRR(ctx, BTN.x + 44, 64, 220, 12, 6, C.gray); fillRR(ctx, BTN.x + 44, 84, 140, 10, 5, C.line);
  pill(ctx, BTN.x, 120, 'Failed', 32, 'failed');
  // reason box (abstract reason text)
  fillRR(ctx, BTN.x, 222, 700, 200, 20, '#FAF9F5'); rr(ctx, BTN.x, 222, 700, 200, 20); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  infoIcon(ctx, BTN.x + 46, 268, 19, C.ink);
  ctx.fillStyle = C.ink; ctx.font = font(700, 36); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Reason shown in History', BTN.x + 80, 270);
  fillRR(ctx, BTN.x + 32, 320, 600, 14, 7, C.gray); fillRR(ctx, BTN.x + 32, 348, 460, 14, 7, C.line); fillRR(ctx, BTN.x + 32, 376, 520, 14, 7, C.line);
  // actions
  const g = buttonsGeom(ctx);
  const bIn = (d) => ep(t, T.buttons + d, T.buttons + d + 0.3, (v) => E.outBack(v, 1.4));
  const hover = ep(t, T.hoverEdit, T.hoverEdit + 0.15) * (1 - ep(t, T.hoverEdit + 0.6, T.hoverEdit + 0.8));
  const press = Math.max(0, 1 - Math.abs(t - T.clickRetry) / 0.08);
  const sel = ep(t, T.clickRetry, T.clickRetry + 0.15);
  [['edit', 'Edit and Retry', 0], ['now', 'Retry Now', 0.08]].forEach(([key, label, d]) => {
    const b = g[key], q = bIn(d);
    if (q <= 0) return;
    const sc = (0.85 + 0.15 * q) * (key === 'now' ? 1 - 0.05 * press : 1) * (key === 'edit' ? 1 + 0.03 * hover : 1);
    ctx.save(); ctx.globalAlpha *= clamp(q * 2);
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(sc, sc); ctx.translate(-b.w / 2, -b.h / 2);
    if (key === 'edit') {
      shadowed(ctx, 16 + 14 * hover, 6, 0.1 + 0.06 * hover, () => fillRR(ctx, 0, 0, b.w, b.h, b.h / 2, C.surface));
      rr(ctx, 1.5, 1.5, b.w - 3, b.h - 3, b.h / 2); ctx.strokeStyle = hover > 0.01 ? '#E3B53A' : C.ink; ctx.lineWidth = 3; ctx.stroke();
    } else {
      shadowed(ctx, 16, 6, 0.14, () => fillRR(ctx, 0, 0, b.w, b.h, b.h / 2, C.yellow));
      if (sel > 0) { ctx.globalAlpha *= sel; rr(ctx, -5, -5, b.w + 10, b.h + 10, b.h / 2 + 5); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha /= sel; }
    }
    ctx.fillStyle = C.ink; ctx.font = font(800, BTN.fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, b.w / 2, b.h / 2 + 1);
    ctx.restore();
  });
  // neutral outcome: the action was selected (no published / success state)
  const c = ep(t, T.selected, T.selected + 0.3, (v) => E.outBack(v, 1.4));
  if (c > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(c * 2);
    ctx.translate(BTN.x, 580); ctx.scale(0.9 + 0.1 * c, 0.9 + 0.1 * c);
    pill(ctx, 0, 0, 'Retry action selected', 30, 'neutral');
    ctx.restore();
  }
  ctx.restore();
}

function actionCursor(ctx, t) {
  const a = ep(t, T.hoverEdit - 0.45, T.hoverEdit - 0.3) * (1 - ep(t, T.collapse[0] - 0.2, T.collapse[0]));
  if (a <= 0) return;
  const geo = buttonsGeom(ctx);
  const pE = { x: DP.x + geo.edit.x + geo.edit.w * 0.6, y: DP.y + geo.edit.y + geo.edit.h * 0.62 };
  const pN = { x: DP.x + geo.now.x + geo.now.w * 0.55, y: DP.y + geo.now.y + geo.now.h * 0.6 };
  const keys = [[T.hoverEdit - 0.45, 1560, 1010], [T.hoverEdit, pE.x, pE.y], [T.clickRetry - 0.45, pE.x, pE.y], [T.clickRetry - 0.04, pN.x, pN.y], [T.collapse[0], pN.x + 30, pN.y + 40]];
  let x = keys[0][1], y = keys[0][2];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
    if (t >= t0) { const p = E.inOutCubic(clamp((t - t0) / (t1 - t0))); x = lerp(x0, x1, p); y = lerp(y0, y1, p); }
  }
  const press = Math.max(0, 1 - Math.abs(t - T.clickRetry) / 0.07);
  ctx.save(); ctx.globalAlpha = a; cursor(ctx, x, y, 1 - 0.12 * press); ctx.restore();
}

// ---------- end ----------
const END_LINE = 'Keep client publishing in view.';
const END_CTA = 'START YOUR RECURPOST TRIAL';
function endGeom(ctx) {
  ctx.save(); ctx.font = font(800, 60); ctx.letterSpacing = '1px';
  const w = ctx.measureText(END_CTA).width + 130; ctx.restore();
  return { cta: { x: (W - w) / 2, y: 594, w, h: 138 }, logoH: 118, logoY: 300, lineY: 532 };
}
function endCard(ctx, t) {
  const g = endGeom(ctx);
  const LOGO = getLogo();
  // brand panel -> CTA pill
  const grow = ep(t, T.gather[0] + 0.15, T.gather[1] - 0.1, E.outQuint);
  const morph = ep(t, T.gather[1] - 0.1, T.endIn + 0.45, E.inOutCubic);
  if (grow > 0) {
    const big = { w: 1240, h: 380, x: (W - 1240) / 2, y: 540 - 190 };
    const r = { x: lerp(big.x, g.cta.x, morph), y: lerp(big.y, g.cta.y, morph), w: lerp(big.w, g.cta.w, morph), h: lerp(big.h, g.cta.h, morph) };
    const s = 0.6 + 0.4 * grow;
    ctx.save(); ctx.globalAlpha = clamp(grow * 2);
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(s, s); ctx.translate(-r.w / 2, -r.h / 2);
    shadowed(ctx, 40, 14, 0.16, () => fillRR(ctx, 0, 0, r.w, r.h, lerp(36, r.h / 2, morph), C.yellow));
    const ta = ep(t, T.endIn + 0.3, T.endIn + 0.6);
    if (ta > 0) {
      ctx.globalAlpha = ta; ctx.font = font(800, 60); ctx.letterSpacing = '1px';
      ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(END_CTA, r.w / 2, r.h / 2 + 2);
    }
    ctx.restore();
  }
  const lp = ep(t, T.endIn + 0.4, T.endIn + 0.8, E.outQuint);
  if (lp > 0) {
    const lw = g.logoH * LOGO.width / LOGO.height;
    ctx.save(); ctx.globalAlpha = lp;
    ctx.drawImage(LOGO, (W - lw) / 2, g.logoY + 20 * (1 - lp), lw, g.logoH);
    ctx.restore();
  }
  const np = ep(t, T.endIn + 0.6, T.endIn + 1.0, E.outQuint);
  if (np > 0) {
    ctx.save(); ctx.globalAlpha = np;
    ctx.font = font(700, 50); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(END_LINE, W / 2, g.lineY + 16 * (1 - np));
    ctx.restore();
  }
}

// ---------- frame ----------
function renderAt(ctx, t) {
  background(ctx, t);
  const k = camera(t);
  const hist = ep(t, T.history[0], T.history[1] - 0.1);
  const gather = ep(t, ...T.gather, E.inOutCubic);
  const focus = ep(t, ...T.focus, E.inOutCubic) * (1 - ep(t, T.collapse[0], T.pullBack[0] + 0.4, E.inOutCubic));
  const detailP = ep(t, ...T.detail, E.inOutCubic) * (1 - ep(t, ...T.collapse, E.inOutCubic));
  const h = heroAt(t, k);

  if (t < T.toTimeline[0] + 0.01) scene1(ctx, t);

  // the layer: History panel, timelines and cards (they gather toward the brand panel at the end)
  if (t >= T.toTimeline[0]) {
    ctx.save();
    if (gather > 0) {
      const s = 1 - 0.75 * gather;
      ctx.translate(960, 540); ctx.scale(s, s); ctx.translate(-960, -540);
      ctx.globalAlpha = 1 - ep(gather, 0.55, 1);
    }
    applyCam(ctx, k);
    historyFrame(ctx, t, hist);
    statusView(ctx, t);
    for (let i = 0; i < 3; i++) {
      const a = i === 1 ? 1 : hist;
      track(ctx, i, a, t);
      rowCards(ctx, t, i, a, 0.55 * focus);
    }
    if (h.space === 'layer') {
      const lift = h.lift;
      const vis = 1 - detailP;
      if (vis > 0.001) {
        ctx.save(); ctx.globalAlpha *= vis;
        heroCard(ctx, h.x - h.w / 2, h.y - h.h / 2, h.w, h.h, h.f, lift);
        ctx.restore();
      }
      // the chosen action stays with the card back in History as a neutral retry badge (not a success state)
      const chip = ep(t, T.collapse[1] - 0.2, T.collapse[1] + 0.2, (v) => E.outBack(v, 1.6));
      if (chip > 0) {
        const r = h.h * 0.14, bx = h.x + h.w / 2 - r - h.h * 0.1 - r * 2.5, by = h.y + h.h / 2 - r - h.h * 0.1;
        ctx.save(); ctx.globalAlpha *= clamp(chip * 2);
        ctx.translate(bx, by); ctx.scale(chip, chip);
        ctx.fillStyle = '#EFEDE7'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.gray2; ctx.lineWidth = 1.5; ctx.stroke();
        retryIcon(ctx, 0, 0, r * 0.62, C.ink);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // hero in screen space (scene 1 and the slide into the timeline)
  if (h.space === 'screen') {
    ctx.save(); ctx.globalAlpha = h.a ?? 1;
    heroCard(ctx, h.x - h.w / 2, h.y - h.h / 2, h.w, h.h, h.f, h.lift);
    ctx.restore();
    // the "Failed" status label arrives on the card (calm, no alarm)
    const tp = ep(t, T.fail, T.fail + 0.3, (v) => E.outBack(v, 1.5)) * (1 - ep(t, T.toTimeline[0], T.toTimeline[0] + 0.25));
    if (tp > 0) {
      ctx.save();
      const m = pill(ctx, 0, 0, 'Failed', 40, 'failed', true);
      ctx.globalAlpha = clamp(tp * 2);
      const px = h.x, py = h.y - h.h / 2 - 22;
      ctx.translate(px, py); ctx.scale(tp, tp); ctx.translate(-m.w / 2, -m.h);
      pill(ctx, 0, 0, 'Failed', 40, 'failed');
      ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(m.w / 2 - 12, m.h - 1); ctx.lineTo(m.w / 2 + 12, m.h - 1); ctx.lineTo(m.w / 2, m.h + 12); ctx.fill();
      ctx.restore();
    }
  }

  // reviewer + reason (screen space, attached to the hero)
  if (h.space === 'layer') {
    const c = toScreen(k, h.x, h.y);
    const hs = { x: c.x, y: c.y, w: h.w * k.z, h: h.h * k.z };
    reviewer(ctx, t, hs);
    reasonCallout(ctx, t, hs);
    // detail panel grows out of the card and folds back into it
    if (detailP > 0) {
      const r = { x: lerp(hs.x - hs.w / 2, DP.x, detailP), y: lerp(hs.y - hs.h / 2, DP.y, detailP), w: lerp(hs.w, DP.w, detailP), h: lerp(hs.h, DP.h, detailP) };
      ctx.save();
      shadowed(ctx, 60, 22, 0.2, () => fillRR(ctx, r.x, r.y, r.w, r.h, lerp(22, 30, detailP), C.surface));
      ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, lerp(22, 30, detailP)); ctx.clip();
      ctx.fillStyle = RED; ctx.fillRect(r.x, r.y, 8, r.h);
      ctx.translate(r.x, r.y); ctx.scale(r.w / DP.w, r.h / DP.h);
      detailContent(ctx, t, ep(detailP, 0.55, 1));
      ctx.restore();
      ctx.restore();
    }
    actionCursor(ctx, t);
  }

  message(ctx, t);
  const zoomed = Math.max(focus, ep(t, T.toTimeline[0], T.toTimeline[1]) * (1 - ep(t, T.history[0], T.history[1])));
  backdrop(ctx, Math.max(zoomed, detailP));
  headline(ctx, t, ['POST FAILED'], T.fail + 0.05, T.toTimeline[1] - 0.15, { band: 0 });
  headline(ctx, t, ['THE CLIENT NOTICED FIRST.'], T.notif + 0.05, T.msgAside[0] + 0.1, { band: 0 });
  headline(ctx, t, ['REVIEW FAILED POSTS IN HISTORY'], T.history[0] + 0.5, T.detail[0] - 0.1, { band: 0, fs: 74 });
  headline(ctx, t, ['REVIEW. EDIT. RETRY.'], T.buttons, T.collapse[0] + 0.3, { band: 0 });
  headline(ctx, t, ['SEE THE ISSUE.', 'TAKE THE NEXT STEP.'], T.pullBack[0] + 1.1, T.gather[0] - 0.05, { band: 1 });
  if (t >= T.gather[0]) endCard(ctx, t);
}

module.exports = { TL, renderAt, mainScene: renderAt };
