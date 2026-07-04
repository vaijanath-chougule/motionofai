/**
 * Build-time frame optimiser. Converts every JPG in the hero-frame sets
 * to WebP alongside the original. The runtime loader prefers .webp and
 * falls back to .jpg automatically, so the JPGs stay as a safety net.
 *
 * Two sets are processed:
 *   • /public/hero-frames         desktop / tablet (landscape 2580x1440)
 *   • /public/hero-frames/mobile  phones (portrait 1440x2580)
 * Mobile frames are capped narrower — a phone never needs 1440px wide.
 *
 * Run: npm run frames:webp
 * sharp is a devDependency — it is never bundled into the app.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public', 'hero-frames');

// A cover-fit motion background scrubbed at speed doesn't need full res.
// These widths are crisp during motion where the real weight lives.
const QUALITY = 64;
const TARGETS = [
  { dir: ROOT, maxWidth: 1440, label: 'desktop' },
  { dir: join(ROOT, 'mobile'), maxWidth: 720, label: 'mobile' },
];

const bytes = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;

async function convertDir({ dir, maxWidth, label }) {
  let files;
  try {
    files = (await readdir(dir)).filter((f) => /\.jpe?g$/i.test(f)).sort();
  } catch {
    console.warn(`  (skip ${label}: ${dir} not found)`);
    return;
  }
  if (!files.length) {
    console.warn(`  (skip ${label}: no JPGs in ${dir})`);
    return;
  }

  let jpgTotal = 0;
  let webpTotal = 0;
  let done = 0;

  const CONCURRENCY = 8;
  const queue = [...files];

  async function worker() {
    while (queue.length) {
      const file = queue.shift();
      const src = join(dir, file);
      const out = join(dir, file.replace(/\.jpe?g$/i, '.webp'));
      const { size: inSize } = await stat(src);
      const info = await sharp(src)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(out);
      jpgTotal += inSize;
      webpTotal += info.size;
      done += 1;
      if (done % 25 === 0 || done === files.length) {
        process.stdout.write(`  [${label}] ${done}/${files.length} frames\r`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const saved = ((1 - webpTotal / jpgTotal) * 100).toFixed(1);
  console.log(`\n${label}: ${files.length} frames  JPG ${bytes(jpgTotal)} → WebP ${bytes(webpTotal)} (-${saved}%)`);
}

async function main() {
  for (const target of TARGETS) {
    await convertDir(target);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
