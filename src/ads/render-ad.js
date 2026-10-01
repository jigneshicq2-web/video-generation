// Renders a static HTML ad to PNG at its exact pixel size.
// Usage: node src/ads/render-ad.js [src/ads/quiet-feed.html] [out/RecurPost_Ad_QuietFeed_1080x1350.png]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const src = path.resolve(process.argv[2] || 'src/ads/quiet-feed.html');
  const out = path.resolve(process.argv[3] || 'out/RecurPost_Ad_QuietFeed_1080x1350.png');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + src);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await browser.close();
  console.log(out);
})();
