/**
 * Verifies the wenilo wordmark sits flush on the page's bottom edge without
 * being sheared, on both closing sections, across viewports.
 *
 * Two things have to hold at once, and they pull against each other:
 *   blankBelowInk == 0   the section ends where the logo ends
 *   not sheared          the logo's round letters still taper to a point
 * A pixel scan alone can't tell "flush" from "cut", so the taper is checked
 * explicitly: ink coverage must fall away over the last rows, not stop dead.
 *
 *   node scripts/verify-wordmark.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = process.argv[2] || 'http://localhost:5311';

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'AIVid', path: '/ai-video-production' },
];

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, dsf: 1, mobile: false },
  { name: '1512x900', width: 1512, height: 900, dsf: 2, mobile: false },
  { name: '1366x768', width: 1366, height: 768, dsf: 1, mobile: false },
  { name: '834x1194', width: 834, height: 1194, dsf: 2, mobile: true },
  { name: '430x932', width: 430, height: 932, dsf: 3, mobile: true },
  { name: '390x844', width: 390, height: 844, dsf: 3, mobile: true },
  { name: '360x640', width: 360, height: 640, dsf: 3, mobile: true },
];

async function scan(buf) {
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();
  const ch = raw.length / (width * height);
  const at = (x, y) => {
    const i = (y * width + x) * ch;
    return [raw[i], raw[i + 1], raw[i + 2]];
  };
  const counts = [];
  for (let y = 0; y < height; y++) {
    const [br, bg, bb] = at(1, y); // row's own background, left of the type
    let n = 0;
    for (let x = 3; x < width - 3; x++) {
      const [r, g, b] = at(x, y);
      if (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) > 40) n++;
    }
    counts.push(n);
  }
  return { counts, lastInkRow: counts.findLastIndex((n) => n >= 1), height };
}

const browser = await chromium.launch();
const rows = [];
let bad = 0;

for (const vp of VIEWPORTS) {
  for (const p of PAGES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + p.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(2200);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(900);

    const geo = await page.evaluate(() => {
      const span = [...document.querySelectorAll('span')].find(
        (s) => s.textContent.trim().toLowerCase() === 'wenilo' && s.querySelector('i'),
      );
      const wrap = span.closest('div').parentElement;
      const cs = getComputedStyle(wrap);
      return {
        size: Math.round(parseFloat(getComputedStyle(span).fontSize)),
        padB: cs.paddingBottom,
        marB: cs.marginBottom,
      };
    });

    const strip = await page.screenshot({
      clip: { x: 0, y: vp.height - 70, width: vp.width, height: 70 },
    });
    const s = await scan(strip);
    const blank = (s.height - 1 - s.lastInkRow) / vp.dsf;

    // Taper check: on an intact wordmark the round letters narrow to points, so
    // the final rows carry far less ink than the body of the glyphs. A flat cut
    // leaves the last row nearly as inked as the rows above it.
    const body = s.counts[s.lastInkRow - Math.round(12 * vp.dsf)] ?? 0;
    const edge = s.counts[s.lastInkRow] ?? 0;
    const sheared = body > 0 && edge > body * 0.55;

    const ok = blank <= 1 && !sheared;
    if (!ok) bad++;

    rows.push({
      page: p.name,
      vp: vp.name,
      size: geo.size,
      marB: geo.marB,
      blankPx: +blank.toFixed(1),
      edgeInk: edge,
      bodyInk: body,
      sheared,
      ok,
    });

    await ctx.close();
  }
}

console.table(rows);
console.log(bad === 0 ? '\nPASS — flush everywhere, nothing sheared' : `\nFAIL — ${bad} case(s)`);
await browser.close();
process.exit(bad === 0 ? 0 : 1);
