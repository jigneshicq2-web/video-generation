// Brand tokens + logo.
//
// IMPORTANT: recurpost.com was not reachable from the build environment, so the
// palette below is a placeholder chosen to sit well on a dark canvas. Replace
// the values with the official RecurPost brand tokens before final delivery.
//
// Logo: drop the official file at assets/brand/logo.png (transparent, light
// version for dark backgrounds). It is always drawn with its native aspect
// ratio (contain-fit), never stretched or morphed. Until that file exists a
// plain typographic "RecurPost" wordmark is used as a stand-in — it is NOT the
// official logo.
const fs = require('fs');
const path = require('path');

const B = {
  bg: '#060818',
  bg2: '#0B1030',
  surface: '#111733',
  surface2: '#182044',
  line: 'rgba(255,255,255,0.09)',
  text: '#F4F6FF',
  muted: '#9AA3C7',
  dim: '#5F6890',
  primary: '#6C5CFF',   // placeholder brand violet
  secondary: '#22C7FF', // placeholder brand cyan
  accent: '#FF7A45',    // placeholder warm accent
  success: '#22D39A',
  warn: '#FFB547',
  error: '#FF4D6A',
  flow: ['#22C7FF', '#6C5CFF', '#FF7A45'], // Flow Line gradient
  name: 'RecurPost',
};

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'brand', 'logo.png');
B.logoFile = fs.existsSync(LOGO_PATH) ? LOGO_PATH : null;
const ICON_PATH = path.join(__dirname, '..', 'assets', 'brand', 'icon.png');
B.iconFile = fs.existsSync(ICON_PATH) ? ICON_PATH : null;

module.exports = B;
