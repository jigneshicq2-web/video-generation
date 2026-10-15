// Shared UI kit for the long-form RecurPost spots (20 s / 25 s): post cards, status badges,
// headlines, backdrop and the layer camera. One component language across the series.
const L = require('./lib');
const { W, C, font, clamp, lerp, E, ep, rr, fillRR, shadowed, clockIcon, checkIcon, riseText } = L;

// Client accents: brand yellow and charcoal plus two coordinated warm tones.
const CLIENTS = [
  { label: 'Client 1', col: C.yellow }, { label: 'Client 2', col: C.ink },
  { label: 'Client 3', col: '#F2A93B' }, { label: 'Client 4', col: '#A8A397' },
];
const ST = {
  S: { label: 'Scheduled', col: C.yellow, text: C.ink },
  P: { label: 'Published', col: C.ink, text: '#FFFFFF' },
  D: { label: 'Draft', col: '#FFFFFF', text: C.ink },
  F: { label: 'Failed', col: '#E5484D', text: '#FFFFFF' },
};
const VAR = [
  { tint: C.yTint, a: C.yellow, b: '#F5B82E' },
  { tint: '#2A2A2A', a: C.yellow, b: '#4A4A4A' },
  { tint: C.gray, a: C.gray2, b: '#BEB9AC' },
  { tint: C.yTint2, a: '#F5B82E', b: '#FFFFFF' },
];
const ASPECT = 1.52;                                   // every post card shares one aspect ratio
function thumb(ctx, x, y, w, h, r, v) {
  ctx.save();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = v.tint; ctx.fill(); ctx.clip();
  ctx.fillStyle = v.a; ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.33, Math.min(w, h) * 0.17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = v.b; ctx.beginPath(); ctx.moveTo(x - w * 0.05, y + h); ctx.lineTo(x + w * 0.33, y + h * 0.45); ctx.lineTo(x + w * 0.72, y + h); ctx.fill();
  ctx.fillStyle = v.a; ctx.beginPath(); ctx.moveTo(x + w * 0.38, y + h); ctx.lineTo(x + w * 0.66, y + h * 0.6); ctx.lineTo(x + w * 1.05, y + h); ctx.fill();
  ctx.restore();
}

function exclaim(ctx, cx, cy, s, col) {
  fillRR(ctx, cx - s * 0.09, cy - s * 0.42, s * 0.18, s * 0.5, s * 0.09, col);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy + s * 0.32, s * 0.11, 0, Math.PI * 2); ctx.fill();
}

function badge(ctx, k, cx, cy, r) {
  ctx.save();
  if (k === 'D') {
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.setLineDash([r * 0.42, r * 0.32]); ctx.lineWidth = r * 0.2; ctx.strokeStyle = '#8F8A7E';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.fillStyle = ST[k].col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    if (k === 'S') clockIcon(ctx, cx, cy, r * 0.5, C.ink);
    if (k === 'P') checkIcon(ctx, cx, cy, r * 0.95, '#FFFFFF');
    if (k === 'F') exclaim(ctx, cx, cy, r * 1.05, '#FFFFFF');
  }
  ctx.restore();
}

// A post card at any size; content scales with height. o: { client, status, statusA, variant, hero, lift, dim }
function postCard(ctx, x, y, w, h, o) {
  const r = h * 0.13;
  ctx.save();
  ctx.translate(x, y);
  const lift = o.lift ?? 0;
  const draft = o.status === 'D' && (o.statusA ?? 0) > 0;
  shadowed(ctx, 8 + 30 * lift + h * 0.08, 3 + 12 * lift, 0.1 + 0.12 * lift, () => fillRR(ctx, 0, 0, w, h, r, C.surface));
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.clip();
  ctx.fillStyle = CLIENTS[o.client].col; ctx.fillRect(0, 0, Math.max(4, h * 0.06), h);
  const pad = h * 0.13, th = h - pad * 2;
  ctx.globalAlpha *= draft ? 1 - 0.4 * o.statusA : 1;
  thumb(ctx, pad + h * 0.05, pad, th, th, h * 0.08, VAR[o.variant % VAR.length]);
  const bx = pad + h * 0.05 + th + h * 0.12, bw = w - bx - pad;
  fillRR(ctx, bx, pad + h * 0.04, bw * 0.95, h * 0.09, h * 0.045, C.gray);
  fillRR(ctx, bx, pad + h * 0.2, bw * 0.62, h * 0.09, h * 0.045, C.line);
  ctx.restore();
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.strokeStyle = 'rgba(31,31,31,0.07)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  if (o.hero) { rr(ctx, -2, -2, w + 4, h + 4, r + 2); ctx.strokeStyle = C.yellow; ctx.lineWidth = Math.max(3, h * 0.035); ctx.stroke(); }
  if (o.status && (o.statusA ?? 0) > 0) {
    const a = o.statusA, br = h * 0.14;
    ctx.save();
    ctx.translate(w - br - h * 0.1, h - br - h * 0.1); ctx.scale(E.outBack(a, 1.8), E.outBack(a, 1.8));
    badge(ctx, o.status, 0, 0, br);
    ctx.restore();
  }
  if (o.dim) { ctx.globalAlpha = o.dim; fillRR(ctx, -3, -3, w + 6, h + 6, r, C.bg); }
  ctx.restore();
}

// ---------- headlines ----------
function headline(ctx, t, lines, t0, t1, opts = {}) {
  const inP = (d) => ep(t, t0 + d, t0 + d + 0.36, E.outQuint);
  const out = ep(t, t1, t1 + 0.2, E.inOutCubic);
  if (t < t0 - 0.01 || out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(0, -40 * out);
  const fs = opts.fs || 84;
  ctx.font = font(800, fs); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const ys = lines.length === 1 ? [220] : [168, 268];
  lines.forEach((s, j) => {
    if (opts.band === j) {
      const tw = ctx.measureText(s).width;
      const b = ep(t, t0 + 0.16, t0 + 0.4, E.outQuint);
      fillRR(ctx, W / 2 - tw / 2 - 24, ys[j] - fs * 0.93, (tw + 48) * b, fs * 1.17, 12, C.yellow);
    }
    ctx.fillStyle = opts.color ? opts.color(t, j) : C.ink;
    riseText(ctx, s, W / 2, ys[j], inP(j * 0.08), fs * 1.19, fs * 1.2);
  });
  ctx.restore();
}

function backdrop(ctx, a) {
  if (a <= 0) return;
  const g = ctx.createLinearGradient(0, 0, 0, 330);
  g.addColorStop(0, `rgba(246,245,241,${0.96 * a})`); g.addColorStop(0.8, `rgba(246,245,241,${0.85 * a})`); g.addColorStop(1, 'rgba(246,245,241,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 330);
}

const applyCam = (ctx, k) => { ctx.translate(k.sx, k.sy); ctx.scale(k.z, k.z); ctx.translate(-k.cx, -k.cy); };
const toScreen = (k, x, y) => ({ x: (x - k.cx) * k.z + k.sx, y: (y - k.cy) * k.z + k.sy });

module.exports = { CLIENTS, ST, VAR, ASPECT, thumb, exclaim, badge, postCard, headline, backdrop, applyCam, toScreen };
