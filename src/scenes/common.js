// Reusable product-UI pieces shared across scenes.
const L = require('../lib');
const { B, rr, card, text, ui, disp, hexA, platformTile, checkMark } = L;

let logoImg = null;
let iconImg = null;
async function preloadLogo() {
  const { loadImage } = require('@napi-rs/canvas');
  if (B.logoFile) logoImg = await loadImage(B.logoFile);
  if (B.iconFile) iconImg = await loadImage(B.iconFile);
}

// Logo lockup centred at (cx, cy). `h` is the target height; `maxW` caps the
// width (the official lockup is ~8:1), shrinking height to match so the logo
// is always contain-fitted at native proportions, never stretched.
function logo(ctx, cx, cy, h, o = {}) {
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.shadowColor = 'rgba(255,205,69,0.35)'; ctx.shadowBlur = o.glow; }
  if (logoImg) {
    const ar = logoImg.width / logoImg.height;
    let w = ar * h;
    if (o.maxW && w > o.maxW) { w = o.maxW; h = w / ar; }
    ctx.drawImage(logoImg, cx - w / 2, cy - h / 2, w, h);
  } else {
    text(ctx, B.name, cx, cy + h * 0.04, { font: disp(800, Math.round(h * 0.9)), color: '#FFFFFF', track: -1 });
  }
  ctx.restore();
}

// RecurPost clock-arrow mark (square), centred at (cx, cy).
function icon(ctx, cx, cy, size, o = {}) {
  if (!iconImg) return;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.drawImage(iconImg, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

// Small image placeholder used inside post cards: abstract, brand-tinted art
// (no fake photos, no text).
function postArt(ctx, x, y, w, h, seed = 0, r = 18) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  const palettes = [
    [B.primary, B.secondary], [B.accent, B.primary], [B.secondary, B.success], ['#FF5FA2', B.accent], [B.primary, '#FF5FA2'],
  ];
  const [c1, c2] = palettes[seed % palettes.length];
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * 0.28;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x + w * 0.72, y + h * 0.34, Math.min(w, h) * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a0 * 0.18;
  ctx.beginPath();
  ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.38, y + h * 0.5); ctx.lineTo(x + w * 0.62, y + h * 0.78);
  ctx.lineTo(x + w * 0.8, y + h * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Text-line placeholders (skeleton) — used where copy would be unreadably small.
function lines(ctx, x, y, w, n, o = {}) {
  ctx.save();
  ctx.fillStyle = o.color || 'rgba(255,255,255,0.14)';
  const lh = o.lh ?? 22, th = o.th ?? 10;
  for (let i = 0; i < n; i++) {
    const lw = i === n - 1 ? w * 0.6 : w * (0.85 + ((i * 37) % 15) / 100);
    rr(ctx, x, y + i * lh, Math.min(w, lw), th, th / 2);
    ctx.fill();
  }
  ctx.restore();
}

// Mini post card (platform glyph + art + skeleton caption).
function miniPost(ctx, x, y, w, h, platform, seed, o = {}) {
  card(ctx, x, y, w, h, { r: 20, shadowBlur: 30, ...o });
  const pad = 14;
  if (platform) platformTile(ctx, platform, x + pad + 18, y + pad + 18, 36);
  lines(ctx, x + pad + 46, y + pad + 10, w * 0.45, 2, { lh: 16, th: 8 });
  const artH = h - 58 - 36;
  if (artH > 20) postArt(ctx, x + pad, y + 58, w - pad * 2, artH, seed, 12);
  lines(ctx, x + pad, y + h - 28, w - pad * 2, 1, { th: 8 });
}

// Status pill with a coloured dot.
function statusPill(ctx, label, cx, cy, color, o = {}) {
  const font = o.font || ui(700, 26);
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.font = font; ctx.letterSpacing = `${o.track ?? 1}px`;
  const tw = ctx.measureText(label).width;
  const h = o.h ?? 50, w = tw + 70;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = hexA(color, 0.16); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = hexA(color, 0.55); ctx.stroke();
  ctx.fillStyle = color;
  if (o.check) checkMark(ctx, cx - w / 2 + 26, cy, 22, color, 4.5);
  else { ctx.beginPath(); ctx.arc(cx - w / 2 + 26, cy, 7, 0, Math.PI * 2); ctx.fill(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, cx - w / 2 + 46, cy + 1);
  ctx.restore();
  return w;
}

// Mouse cursor (arrow) with optional click ripple.
function cursor(ctx, x, y, s = 1, click = 0) {
  ctx.save();
  if (click > 0 && click < 1) {
    ctx.strokeStyle = hexA('#FFFFFF', 0.7 * (1 - click));
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, 14 + click * 46, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.translate(x, y); ctx.scale(s * (click > 0 && click < 0.25 ? 0.88 : 1), s * (click > 0 && click < 0.25 ? 0.88 : 1));
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.lineTo(11, 33); ctx.lineTo(19, 51); ctx.lineTo(27, 47); ctx.lineTo(19, 30); ctx.lineTo(34, 30);
  ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#0B1030'; ctx.stroke();
  ctx.restore();
}

// Kinetic headline: each character drops in with a staggered spring.
function kineticType(ctx, str, cx, cy, t, t0, o = {}) {
  const font = o.font || disp(800, 104);
  const track = o.track ?? 0;
  ctx.save();
  ctx.font = font; ctx.letterSpacing = `${track}px`;
  const total = ctx.measureText(str).width;
  let x = cx - total / 2;
  const chars = [...str];
  const per = o.per ?? 0.03;
  chars.forEach((ch, i) => {
    ctx.font = font; ctx.letterSpacing = `${track}px`;
    const cw = ctx.measureText(ch).width;
    const p = L.ep(t, t0 + i * per, t0 + i * per + (o.dur ?? 0.22), L.E.outBack);
    if (p > 0) {
      ctx.save();
      ctx.globalAlpha *= L.clamp(p * 1.6);
      ctx.translate(x + cw / 2, cy + (1 - p) * (o.rise ?? 60));
      ctx.scale(1, 0.7 + 0.3 * p);
      ctx.fillStyle = o.color || B.text;
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 28; }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    x += cw;
  });
  ctx.restore();
}

// "Slam": big type scales down from oversize with a flash — for impact words.
function slam(ctx, str, cx, cy, t, t0, o = {}) {
  const p = L.prog(t, t0, t0 + (o.dur ?? 0.2));
  if (p <= 0) return;
  const e = L.E.outExpo(p);
  const s = L.lerp(o.from ?? 2.4, 1, e);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.globalAlpha *= L.clamp(p * 3) * (o.alpha ?? 1);
  text(ctx, str, 0, 0, { font: o.font || disp(800, 110), color: o.color || B.text, track: o.track ?? 0, glow: o.glow, glowBlur: 34 });
  ctx.restore();
}

module.exports = { preloadLogo, logo, icon, postArt, lines, miniPost, statusPill, cursor, kineticType, slam };
