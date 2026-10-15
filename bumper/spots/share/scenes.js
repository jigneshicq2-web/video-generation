// 25 s skippable in-stream, "Your client shouldn't need your scheduler login to review the plan".
// One calendar and one post card carry the story: agency calendar -> client asks -> (login panel:
// approach, pause, pull back) -> the card becomes a shareable preview -> lock stays on the agency side
// -> client-facing "Shared calendar" -> client comments on the card -> same calendar as the agency
// workspace -> team reviews and updates the card -> organized payoff -> the card becomes the CTA.
// Visible words: the six headlines, the client message, "Shared calendar", and the end card.
const L = require('../../lib');
const TL = require('./timeline');
const { W, H, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, checkIcon, cursor, background, getLogo } = L;
const { ASPECT, postCard, headline, backdrop, applyCam, toScreen } = require('../../ui');
const T = TL.T;

// brand palette + bright complementary accents for the upbeat mood
const SKY = '#6CC4F5', CORAL = '#FF8A65';
const VX = [
  { tint: '#DDF1FD', a: SKY, b: '#A9DCF9' },        // sky
  { tint: '#FFE3D9', a: CORAL, b: '#FFC0A8' },      // coral
  { tint: C.yTint, a: C.yellow, b: '#F5B82E' },     // brand yellow
  { tint: '#2A2A2A', a: C.yellow, b: '#4A4A4A' },   // brand charcoal
  { tint: C.yTint2, a: '#F5B82E', b: '#FFFFFF' },
];
const HERO_V = VX[0], HERO_V2 = VX[1]; // the update swaps the artwork sky -> coral

// ---------- calendar geometry (layer coordinates) ----------
const CAL = { x: 230, y: 330, w: 1460, h: 620 };
const TOP = 70, SIDE = 210;
const GX = CAL.x + SIDE, GY = CAL.y + TOP + 40, COLW = (CAL.w - SIDE - 16) / 7, ROWH = (CAL.h - TOP - 40 - 14) / 3;
const cell = (r, c) => { const w = COLW - 20, h = Math.min(ROWH - 24, w / ASPECT); return { x: GX + c * COLW + 10, y: GY + r * ROWH + (ROWH - h) / 2, w, h }; };
const POSTS = [[0, 0, 2], [0, 2, 1], [0, 4, 3], [0, 6, 0], [1, 1, 4], [1, 5, 2], [2, 0, 1], [2, 2, 0], [2, 4, 2], [2, 6, 3], [1, 6, 1]];
const HERO = [1, 3];

// ---------- small parts ----------
function person(ctx, cx, cy, r, bg, fg) {
  ctx.save();
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.22, r * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.78, r * 0.66, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function lockIcon(ctx, cx, cy, s, closed, body = C.yellow) {
  ctx.save();
  ctx.lineWidth = s * 0.13; ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
  const lift = (1 - closed) * s * 0.22;
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.12 - lift, s * 0.26, Math.PI, 0); ctx.lineTo(cx + s * 0.26, cy + s * 0.05 - lift * (closed < 1 ? 0.2 : 0));
  ctx.moveTo(cx - s * 0.26, cy - s * 0.12 - lift); ctx.lineTo(cx - s * 0.26, cy + s * 0.05); ctx.stroke();
  fillRR(ctx, cx - s * 0.4, cy, s * 0.8, s * 0.6, s * 0.12, body);
  rr(ctx, cx - s * 0.4, cy, s * 0.8, s * 0.6, s * 0.12); ctx.lineWidth = s * 0.07; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy + s * 0.27, s * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function shareIcon(ctx, cx, cy, s, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.12;
  const p = [[cx - s * 0.32, cy], [cx + s * 0.28, cy - s * 0.3], [cx + s * 0.28, cy + s * 0.3]];
  ctx.beginPath(); ctx.moveTo(...p[1]); ctx.lineTo(...p[0]); ctx.lineTo(...p[2]); ctx.stroke();
  p.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, s * 0.15, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}
function pencil(ctx, cx, cy, s, col) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
  fillRR(ctx, -s * 0.12, -s * 0.42, s * 0.24, s * 0.62, s * 0.05, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-s * 0.12, s * 0.24); ctx.lineTo(s * 0.12, s * 0.24); ctx.lineTo(0, s * 0.44); ctx.fill();
  ctx.restore();
}
function panelShell(ctx, r, rad = 26, bar = TOP) {
  shadowed(ctx, 60, 22, 0.15, () => fillRR(ctx, r.x, r.y, r.w, r.h, rad, C.surface));
  ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, rad); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(r.x, r.y, r.w, bar); ctx.fillStyle = C.line; ctx.fillRect(r.x, r.y + bar - 1, r.w, 1.5);
  ctx.restore();
}
function bubble(ctx, x, y, text, fs, p, opts = {}) {
  ctx.save();
  ctx.font = font(700, fs);
  const bw = ctx.measureText(text).width + fs * 3.4, bh = Math.round(fs * 2.6);
  const s = 0.7 + 0.3 * E.outBack(p, 1.6);
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(x + bh / 2, y + bh / 2); ctx.scale(s, s); ctx.translate(-bh / 2, -bh / 2);
  shadowed(ctx, 40, 14, 0.16, () => fillRR(ctx, 0, 0, bw, bh, bh / 2.2, C.surface));
  person(ctx, bh * 0.52, bh / 2, bh * 0.3, opts.avatar || CORAL, '#FFFFFF');
  ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bh * 0.98, bh / 2 + 2);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(bw - 26, 26, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  return { bw, bh };
}

// ---------- calendar chrome: agency workspace vs client-facing shared view ----------
// mode: 0 = agency workspace, 1 = shared calendar (client view). Cards and grid stay put.
function calendar(ctx, t, mode, a = 1, cardA = () => 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  panelShell(ctx, CAL);
  ctx.save(); rr(ctx, CAL.x, CAL.y, CAL.w, CAL.h, 26); ctx.clip();
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(CAL.x, CAL.y + TOP, SIDE, CAL.h - TOP);
  ctx.fillStyle = C.line; ctx.fillRect(CAL.x + SIDE - 1, CAL.y + TOP, 1.5, CAL.h - TOP);
  ctx.restore();
  // agency chrome: team list + toolbar
  if (mode < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - mode;
    [[C.ink, '#FFFFFF'], [C.yellow, C.ink], [SKY, '#FFFFFF']].forEach(([bg, fg], i) => {
      const cy = GY + 30 + i * 70;
      person(ctx, CAL.x + 44, cy, 20, bg, fg);
      fillRR(ctx, CAL.x + 76, cy - 11, 104 - i * 14, 10, 5, C.gray); fillRR(ctx, CAL.x + 76, cy + 5, 64, 9, 4.5, C.line);
    });
    for (let i = 0; i < 3; i++) fillRR(ctx, CAL.x + CAL.w - 70 - i * 56, CAL.y + 20, 40, 30, 10, i === 0 ? C.yellow : '#EFEDE7');
    ctx.restore();
  }
  // shared chrome: "Shared calendar" label + the client's avatar; no editing controls
  if (mode > 0) {
    ctx.save(); ctx.globalAlpha *= mode;
    const lp = ep(t, T.label, T.label + 0.35, (v) => E.outBack(v, 1.4));
    if (lp > 0) {
      ctx.save(); ctx.font = font(800, 32);
      const tw = ctx.measureText('Shared calendar').width, pw = tw + 96, ph = 52;
      const x = CAL.x + CAL.w / 2 - pw / 2, y = CAL.y + (TOP - ph) / 2;
      ctx.globalAlpha *= clamp(lp * 2);
      ctx.translate(x + pw / 2, y + ph / 2); ctx.scale(0.85 + 0.15 * lp, 0.85 + 0.15 * lp); ctx.translate(-pw / 2, -ph / 2);
      fillRR(ctx, 0, 0, pw, ph, ph / 2, C.yellow);
      shareIcon(ctx, 34, ph / 2, 26, C.ink);
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Shared calendar', 62, ph / 2 + 1);
      ctx.restore();
    }
    person(ctx, CAL.x + CAL.w - 50, CAL.y + 35, 22, CORAL, '#FFFFFF');
    for (let i = 0; i < 3; i++) { const cy = GY + 30 + i * 70; fillRR(ctx, CAL.x + 30, cy - 8, 140 - i * 22, 12, 6, C.gray); }
    ctx.restore();
  }
  // logo in the bar (exact asset, native ratio)
  // hidden while the camera is zoomed in, so the logo is never cropped
  const lgA = ep(t, ...T.logo, E.outQuint) * (1 - ep(t, T.zoomIn[0] - 0.1, T.zoomIn[0] + 0.15) + ep(t, T.pullBack[1] - 0.2, T.pullBack[1]));
  if (lgA > 0) { const LOGO = getLogo(), lh = 32; ctx.save(); ctx.globalAlpha *= lgA; ctx.drawImage(LOGO, CAL.x + 28, CAL.y + (TOP - lh) / 2, lh * LOGO.width / LOGO.height, lh); ctx.restore(); }
  // grid
  for (let k = 0; k < 7; k++) fillRR(ctx, GX + k * COLW + COLW / 2 - 24, CAL.y + TOP + 15, 48, 10, 5, C.gray);
  ctx.fillStyle = C.line;
  for (let k = 1; k < 7; k++) ctx.fillRect(GX + k * COLW, GY, 1.2, ROWH * 3);
  for (let r = 1; r < 3; r++) ctx.fillRect(GX, GY + r * ROWH, COLW * 7, 1.2);
  for (const [r, k, v] of POSTS) {
    const q = cardA(r, k);
    if (q <= 0) continue;
    const c = cell(r, k), s = 0.6 + 0.4 * E.outBack(clamp(q), 1.6);
    ctx.save(); ctx.globalAlpha *= clamp(q * 2);
    ctx.translate(c.x + c.w / 2, c.y + c.h / 2); ctx.scale(s, s); ctx.translate(-c.w / 2, -c.h / 2);
    postCard(ctx, 0, 0, c.w, c.h, { client: 0, vObj: VX[v], lift: 0.1 });
    ctx.restore();
  }
  ctx.restore();
}

// ---------- the hero card ----------
function heroCard(ctx, x, y, w, h, o = {}) {
  const sw = o.swap ?? 0;
  postCard(ctx, x, y, w, h, { client: 0, vObj: sw < 0.5 ? HERO_V : HERO_V2, lift: o.lift ?? 0.3, hero: true });
  if (sw > 0 && sw < 1) { // a quick light sweep while the artwork updates
    ctx.save(); rr(ctx, x, y, w, h, h * 0.13); ctx.clip();
    const sx = x - w * 0.3 + (w * 1.6) * sw;
    const g = ctx.createLinearGradient(sx - w * 0.2, 0, sx + w * 0.2, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

// ---------- camera for the calendar layer ----------
const hc = cell(...HERO), HX = hc.x + hc.w / 2, HY = hc.y + hc.h / 2;
const KEYS = [ // [time, z, cx, cy, ease]
  [0, 1.06, 960, 640, E.outCubic], [1.6, 1.0, 960, 640, (v) => v], [T.toPreview[0], 1.03, 960, 640, E.inOutCubic],
  [T.glide[1], 1.0, 960, 640, (v) => v], [9.5, 1.025, 950, 640, E.inOutCubic], [T.toAgency[0], 1.08, (960 + HX) / 2, 640, (v) => v],
  [T.zoomIn[0], 1.08, (960 + HX) / 2, 640, E.inOutCubic], [T.zoomIn[1], 1.35, HX + 130, HY + 10, (v) => v],
  [T.pullBack[0], 1.38, HX + 130, HY + 10, E.inOutCubic], [T.pullBack[1], 0.94, 960, 640, (v) => v],
  [T.sweep[0], 0.96, 960, 640, E.inOutCubic],
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

// ---------- scene 2 layout (screen space) ----------
const AW = { x: 240, y: 410, w: 560, h: 380 };      // the agency workspace, shrunk to the left
const PREV = { x: 1060, y: 380, w: 620, h: 440 };   // the shareable preview panel (client side)
const LOCK = { x: 930, y: 600 };
function awTransform(t) { // calendar layer -> agency workspace thumbnail on the left
  const p = ep(t, T.toPreview[0], T.toPreview[1], E.inOutCubic);
  const out = ep(t, T.glide[0], T.glide[0] + 0.6, E.inOutCubic);
  const s = AW.w / CAL.w;
  const fl = Math.sin(t * 2.4) * 7 * p;
  return { p, out, z: lerp(1, s, p), dx: lerp(0, AW.x - CAL.x * s, p) - 420 * out, dy: lerp(0, AW.y - CAL.y * s, p) + fl };
}

function previewPanel(ctx, t, r, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  panelShell(ctx, r, 24, 54);
  // tiny shared-calendar preview: grid + cards, the hero highlighted (no text)
  const gx = r.x + 24, gy = r.y + 74, gw = r.w - 48, gh = r.h - 98, cw = gw / 7, ch = gh / 3;
  ctx.fillStyle = C.line;
  for (let k = 1; k < 7; k++) ctx.fillRect(gx + k * cw, gy, 1, gh);
  for (let q = 1; q < 3; q++) ctx.fillRect(gx, gy + q * ch, gw, 1);
  for (const [rr_, k, v] of [...POSTS, [HERO[0], HERO[1], -1]]) {
    const w = cw - 10, h = Math.min(ch - 12, w / ASPECT);
    const x = gx + k * cw + 5, y = gy + rr_ * ch + (ch - h) / 2;
    if (v === -1) heroCard(ctx, x, y, w, h, { lift: 0.2 });
    else postCard(ctx, x, y, w, h, { client: 0, vObj: VX[v], lift: 0.05 });
  }
  shareIcon(ctx, r.x + 34, r.y + 27, 24, C.ink);
  fillRR(ctx, r.x + 60, r.y + 21, 130, 12, 6, C.gray);
  person(ctx, r.x + r.w - 36, r.y + 27, 18, CORAL, '#FFFFFF');
  ctx.restore();
}

// ---------- frame ----------
function renderAt(ctx, t) {
  background(ctx, t);
  const k = camera(t);
  const aw = awTransform(t);
  const glide = ep(t, ...T.glide, E.inOutCubic);           // preview -> full shared calendar
  const mode = ep(t, T.glide[0] + 0.4, T.glide[1]) * (1 - ep(t, ...T.toAgency, E.inOutCubic));
  const sweep = ep(t, ...T.sweep, E.inOutCubic);
  const cardsA = (r, c) => {
    const d = T.cardsIn + c * 0.06 + r * 0.04;
    return ep(t, d, d + 0.3);
  };
  // card positions during the sweep: they fly outward from the centre
  const sweepCard = (r, c) => {
    const q = cell(r, c), dx = q.x + q.w / 2 - 960, dy = q.y + q.h / 2 - 640, d = Math.hypot(dx, dy) || 1;
    return { dx: (dx / d) * 1400 * E.inOutCubic(sweep), dy: (dy / d) * 1400 * E.inOutCubic(sweep) };
  };

  // --- the calendar layer (agency view, then the shared view in the same place) ---
  const calA = glide > 0 ? 1 : 1 - aw.out;
  ctx.save();
  if (glide <= 0) { ctx.translate(aw.dx, aw.dy); ctx.scale(aw.z, aw.z); }
  else {
    // glide: the full calendar grows out of the preview panel
    const s0 = PREV.w / CAL.w, s = lerp(s0, 1, glide);
    const ox = lerp(PREV.x - CAL.x * s0, 0, glide), oy = lerp(PREV.y + 20 - CAL.y * s0, 0, glide);
    ctx.translate(ox, oy); ctx.scale(s, s);
  }
  applyCam(ctx, k);
  const visible = glide > 0 ? ep(glide, 0, 0.3) : 1 - aw.out;
  if (visible > 0 && sweep < 1) {
    ctx.save(); ctx.globalAlpha = (1 - ep(sweep, 0.2, 0.7));
    calendar(ctx, t, mode, visible, (r, c) => (sweep > 0 ? 0 : cardsA(r, c))); // flying cards drawn below
    ctx.restore();
    // the hero sits in its slot until it lifts off to become the shareable preview
    if (glide <= 0 && t < T.toPreview[0]) {
      const q = cardsA(...HERO), sc = 0.6 + 0.4 * E.outBack(clamp(q), 1.6);
      ctx.save(); ctx.globalAlpha *= clamp(q * 2);
      ctx.translate(HX, HY); ctx.scale(sc, sc); ctx.translate(-HX, -HY);
      heroCard(ctx, hc.x, hc.y, hc.w, hc.h, { lift: 0.3 });
      ctx.restore();
    }
    // cards flying outward are drawn on top while the frame fades
    if (sweep > 0) {
      for (const [r, c, v] of POSTS) {
        const q = cell(r, c), s = sweepCard(r, c);
        ctx.save(); ctx.globalAlpha = 1 - ep(sweep, 0.5, 1);
        postCard(ctx, q.x + s.dx, q.y + s.dy, q.w, q.h, { client: 0, vObj: VX[v], lift: 0.4 });
        ctx.restore();
      }
    }
  }
  // client comment (attached to the hero, in layer space so it travels with the calendar)
  const cmt = ep(t, T.comment, T.comment + 0.35, (v) => E.outBack(v, 1.5)) * (1 - ep(t, T.sweep[0] - 0.3, T.sweep[0]));
  if (cmt > 0 && glide > 0) {
    const bx = hc.x + hc.w + 26, by = hc.y - 18, bw = 300, bh = 132;
    ctx.save(); ctx.globalAlpha *= clamp(cmt * 2);
    ctx.translate(bx, by + bh / 2); ctx.scale(0.8 + 0.2 * cmt, 0.8 + 0.2 * cmt); ctx.translate(-bx, -(by + bh / 2));
    shadowed(ctx, 26, 10, 0.16, () => fillRR(ctx, bx, by, bw, bh, 20, C.surface));
    rr(ctx, bx, by, bw, bh, 20); ctx.strokeStyle = CORAL; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = C.surface; ctx.beginPath(); ctx.moveTo(bx + 2, by + 46); ctx.lineTo(bx - 16, by + 58); ctx.lineTo(bx + 2, by + 70); ctx.fill();
    ctx.strokeStyle = CORAL; ctx.beginPath(); ctx.moveTo(bx, by + 46); ctx.lineTo(bx - 16, by + 58); ctx.lineTo(bx, by + 70); ctx.stroke();
    person(ctx, bx + 38, by + 40, 20, CORAL, '#FFFFFF');
    fillRR(ctx, bx + 68, by + 30, 110, 10, 5, C.gray);
    fillRR(ctx, bx + 22, by + 76, bw - 54, 11, 5.5, C.gray2); fillRR(ctx, bx + 22, by + 98, bw - 120, 11, 5.5, C.gray);
    // the team marks the feedback as reviewed (it does not publish anything)
    const rv = ep(t, T.reviewed, T.reviewed + 0.3, (v) => E.outBack(v, 1.8));
    if (rv > 0) { ctx.save(); ctx.translate(bx + bw - 26, by + 26); ctx.scale(rv, rv); ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); checkIcon(ctx, 0, 0, 18, C.ink); ctx.restore(); }
    // team member reviewing beside the comment
    const tm = ep(t, T.teamSees, T.teamSees + 0.3, (v) => E.outBack(v, 1.6)) * (1 - ep(t, T.pullBack[0], T.pullBack[0] + 0.3));
    if (tm > 0) { ctx.save(); ctx.globalAlpha *= tm; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(bx + bw + 6, by + bh - 6, 24, 0, Math.PI * 2); ctx.fill(); person(ctx, bx + bw + 6, by + bh - 6, 21, C.ink, '#FFFFFF'); ctx.restore(); }
    ctx.restore();
  }
  // the hero card in the calendar (from the glide on); lifts out for the update, then returns
  if (glide > 0 && sweep <= 0) {
    const lift = ep(t, ...T.lift, E.outCubic) * (1 - ep(t, ...T.back, E.inOutCubic));
    const settle = Math.sin(Math.PI * ep(t, T.back[1], T.back[1] + 0.25)) * 0.04;
    const s = 1 + 0.16 * lift - settle;
    const hl = ep(t, T.clientClick, T.clientClick + 0.3) * (1 - ep(t, T.pullBack[0], T.pullBack[1]));
    if (hl > 0) { ctx.save(); ctx.globalAlpha *= hl * 0.5; fillRR(ctx, hc.x - 12, hc.y - 12, hc.w + 24, hc.h + 24, 22, C.yTint); ctx.restore(); }
    ctx.save();
    ctx.translate(HX, HY - 26 * lift); ctx.scale(s, s); ctx.translate(-HX, -HY);
    heroCard(ctx, hc.x, hc.y, hc.w, hc.h, { lift: 0.3 + lift, swap: ep(t, T.edit, T.edit + 0.45, (v) => v) });
    ctx.restore();
    // edit badge while the team updates the card
    const eb = ep(t, T.edit - 0.05, T.edit + 0.2, (v) => E.outBack(v, 1.8)) * (1 - ep(t, T.back[0], T.back[0] + 0.2));
    if (eb > 0) { ctx.save(); ctx.translate(hc.x + 8, hc.y + 8 - 26 * lift); ctx.scale(eb, eb); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); pencil(ctx, 0, 0, 22, C.yellow); ctx.restore(); }
  }
  ctx.restore();

  // --- scene 1: client message + login panel (screen space) ---
  const msgOut = ep(t, T.toPreview[0], T.toPreview[0] + 0.3);
  if (t < T.toPreview[1]) {
    const p = ep(t, T.msg, T.msg + 0.35);
    if (p > 0) { ctx.save(); ctx.globalAlpha = 1 - msgOut; bubble(ctx, 860, 430, 'Can I review next week’s posts?', 40, p); ctx.restore(); }
    // generic login panel: no fields text, no credentials
    const lp = ep(t, T.login[0], T.login[0] + 0.3, (v) => E.outBack(v, 1.4)) * (1 - ep(t, T.login[1] - 0.35, T.login[1]));
    if (lp > 0) {
      const r = { x: 330, y: 560, w: 400, h: 300 };
      ctx.save(); ctx.globalAlpha = clamp(lp * 2);
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(0.85 + 0.15 * lp, 0.85 + 0.15 * lp); ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
      shadowed(ctx, 40, 14, 0.18, () => fillRR(ctx, r.x, r.y, r.w, r.h, 22, C.surface));
      lockIcon(ctx, r.x + r.w / 2, r.y + 44, 44, 1, '#EFEDE7');
      fillRR(ctx, r.x + 40, r.y + 112, r.w - 80, 44, 12, '#F3F1EC'); fillRR(ctx, r.x + 40, r.y + 170, r.w - 80, 44, 12, '#F3F1EC');
      fillRR(ctx, r.x + 40, r.y + 232, r.w - 80, 44, 22, C.gray);
      ctx.restore();
      // cursor approaches, pauses, pulls back
      const ca = ep(t, T.login[0] + 0.1, T.login[0] + 0.3) * (1 - ep(t, T.login[1] - 0.2, T.login[1]));
      const toward = ep(t, T.login[0] + 0.1, T.loginPause, E.inOutCubic), backP = ep(t, T.loginPause + 0.25, T.login[1] - 0.1, E.inOutCubic);
      const tx = r.x + r.w * 0.6, ty = r.y + 252;
      const x = lerp(lerp(900, tx, toward), 860, backP), y = lerp(lerp(900, ty, toward), 930, backP);
      ctx.save(); ctx.globalAlpha = ca; cursor(ctx, x, y, 1 - 0.08 * Math.max(0, 1 - Math.abs(t - T.loginPause) / 0.08)); ctx.restore();
    }
  }

  // --- scene 1 -> 2: the card lifts and becomes the shareable preview ---
  if (t >= T.toPreview[0] && glide < 1) {
    const p = ep(t, ...T.toPreview, E.inOutCubic);
    const hs = toScreen(k, HX, HY);
    const from = { x: hs.x - (hc.w * k.z) / 2, y: hs.y - (hc.h * k.z) / 2, w: hc.w * k.z, h: hc.h * k.z };
    const fl = -Math.sin(t * 2.4) * 7 * p * (1 - glide);
    const r = { x: lerp(from.x, PREV.x, p), y: lerp(from.y, PREV.y, p) - Math.sin(Math.PI * p) * 80 + fl, w: lerp(from.w, PREV.w, p), h: lerp(from.h, PREV.h, p) };
    const out = ep(glide, 0, 0.35);
    if (p < 0.55) { ctx.save(); ctx.globalAlpha = 1 - ep(p, 0.3, 0.55); heroCard(ctx, r.x, r.y, r.w, r.h, { lift: 0.8 }); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = ep(p, 0.35, 0.7) * (1 - out);
    previewPanel(ctx, t, r, 1);
    ctx.restore();
    // share chip travels to the client preview; the lock stays on the agency side
    const sc = ep(t, ...T.share, E.inOutCubic), scA = ep(t, T.share[0], T.share[0] + 0.1) * (1 - ep(t, T.share[1], T.share[1] + 0.2));
    if (scA > 0) {
      const x = lerp(AW.x + AW.w - 40, PREV.x + PREV.w - 36, sc), y = lerp(AW.y + 30, PREV.y + 27, sc) - Math.sin(Math.PI * sc) * 120;
      ctx.save(); ctx.globalAlpha = scA; ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill(); shareIcon(ctx, x, y, 30, C.ink); ctx.restore();
    }
    const lk = ep(t, T.toPreview[1] - 0.1, T.toPreview[1] + 0.3, (v) => E.outBack(v, 1.6)) * (1 - ep(t, T.glide[0], T.glide[0] + 0.3));
    if (lk > 0) {
      const aside = ep(t, ...T.lockAside, E.inOutCubic);
      const x = lerp(LOCK.x, AW.x + AW.w - 30, aside), y = lerp(LOCK.y, AW.y + AW.h - 30, aside), sz = lerp(110, 64, aside);
      ctx.save(); ctx.globalAlpha = clamp(lk * 2);
      const br = 1 + 0.035 * Math.sin(t * 3.1);
      ctx.translate(x, y + Math.sin(t * 2.4 + 1.5) * 5); ctx.scale(lk * br, lk * br);
      shadowed(ctx, 26, 10, 0.16, () => { ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(0, 0, sz * 0.62, 0, Math.PI * 2); ctx.fill(); });
      lockIcon(ctx, 0, -sz * 0.12, sz * 0.62, ep(t, T.lockClose - 0.15, T.lockClose, E.inOutCubic));
      ctx.restore();
    }
  }

  // --- client cursor in the shared calendar ---
  if (glide >= 1) {
    const ca = ep(t, T.clientClick - 0.9, T.clientClick - 0.7) * (1 - ep(t, T.comment + 0.4, T.comment + 0.7));
    if (ca > 0) {
      const tgt = toScreen(k, HX + hc.w * 0.15, HY + hc.h * 0.1);
      const p = ep(t, T.clientClick - 0.9, T.clientClick - 0.04, E.inOutCubic), lv = ep(t, T.comment + 0.2, T.comment + 0.7, E.inOutCubic);
      const x = lerp(lerp(1500, tgt.x, p), tgt.x - 160, lv), y = lerp(lerp(960, tgt.y, p), tgt.y + 200, lv);
      ctx.save(); ctx.globalAlpha = ca;
      cursor(ctx, x, y, 1 - 0.1 * Math.max(0, 1 - Math.abs(t - T.clientClick) / 0.07));
      person(ctx, x + 44, y + 52, 16, CORAL, '#FFFFFF');
      ctx.restore();
    }
  }

  // --- payoff: a smooth ripple + bright shapes from the card ---
  const cel = (t - T.celebrate) / 1.3;
  if (cel > 0 && cel < 1) {
    const c = toScreen(k, HX, HY);
    ctx.save();
    ctx.globalAlpha = 0.7 * (1 - cel); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(c.x, c.y, 80 + 520 * E.outCubic(cel), 0, Math.PI * 2); ctx.stroke();
    const cols = [C.yellow, SKY, CORAL, C.yellow, SKY, CORAL];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.3, d = 140 + 420 * E.outCubic(cel) * (0.7 + 0.3 * ((i * 7) % 5) / 4);
      const x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * 0.75;
      ctx.globalAlpha = (1 - cel) * 0.9; ctx.fillStyle = cols[i % cols.length];
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + cel * 3);
      if (i % 3 === 0) fillRR(ctx, -9, -9, 18, 18, 5, cols[i % cols.length]); else { ctx.beginPath(); ctx.arc(0, 0, i % 2 ? 7 : 10, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }

  // --- end: the post card becomes the CTA ---
  if (t >= T.sweep[0]) {
    const p = ep(t, T.sweep[0] + 0.1, T.endIn + 0.55, E.inOutCubic);
    ctx.save(); ctx.font = font(800, 62); ctx.letterSpacing = '1px';
    const cw = ctx.measureText(END_CTA).width + 136; ctx.restore();
    const cta = { x: (W - cw) / 2, y: 568, w: cw, h: 142 };
    const hs = toScreen(k, HX, HY);
    const from = { x: hs.x - (hc.w * k.z) / 2, y: hs.y - (hc.h * k.z) / 2, w: hc.w * k.z, h: hc.h * k.z };
    const r = { x: lerp(from.x, cta.x, p), y: lerp(from.y, cta.y, p), w: lerp(from.w, cta.w, p), h: lerp(from.h, cta.h, p) };
    ctx.save(); ctx.globalAlpha = 1 - ep(p, 0, 0.45); heroCard(ctx, r.x, r.y, r.w, r.h, { lift: 0.6, swap: 1 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = ep(p, 0.15, 0.55);
    shadowed(ctx, 34, 12, 0.16, () => fillRR(ctx, r.x, r.y, r.w, r.h, lerp(14, r.h / 2, p), C.yellow));
    ctx.restore();
    const ta = ep(t, T.endIn + 0.5, T.endIn + 0.8);
    if (ta > 0) { ctx.save(); ctx.globalAlpha = ta; ctx.font = font(800, 62); ctx.letterSpacing = '1px'; ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(END_CTA, W / 2, cta.y + cta.h / 2 + 2); ctx.restore(); }
    const lp = ep(t, T.endIn + 0.45, T.endIn + 0.9, E.outQuint);
    if (lp > 0) { const LOGO = getLogo(), lh = 128, lw = lh * LOGO.width / LOGO.height; ctx.save(); ctx.globalAlpha = lp; ctx.drawImage(LOGO, (W - lw) / 2, 336 + 20 * (1 - lp), lw, lh); ctx.restore(); }
  }

  // --- headlines ---
  const zoomed = ep(t, ...T.zoomIn) * (1 - ep(t, ...T.pullBack));
  backdrop(ctx, Math.max(zoomed, 0.6 * ep(t, 0, 0.2) * (1 - ep(t, T.toPreview[0], T.toPreview[1]))));
  headline(ctx, t, ['CLIENT WANTS TO REVIEW THE PLAN?'], T.msg + 0.15, T.toPreview[0] + 0.2, { band: 0, fs: 76 });
  headline(ctx, t, ['SHARE THE CALENDAR.', 'KEEP YOUR LOGIN PRIVATE.'], 4.1, T.glide[0] + 0.3, { band: 1, fs: 80 });
  headline(ctx, t, ['SHARE FOR REVIEW AND COMMENTS'], T.glide[1] + 0.1, T.toAgency[0], { band: 0, fs: 76 });
  headline(ctx, t, ['CLIENT FEEDBACK.', 'YOUR WORKFLOW.'], 14.15, T.pullBack[0] - 0.1, { band: 1 });
  headline(ctx, t, ['A CLEARER WAY TO REVIEW THE PLAN'], T.celebrate - 0.05, T.sweep[0] - 0.15, { band: 0, fs: 74 });
}
const END_CTA = 'START YOUR RECURPOST TRIAL';

module.exports = { TL, renderAt, mainScene: renderAt };
