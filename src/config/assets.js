// Cloudflare R2 asset delivery (assets.wenilo.com).
//
// Bucket layout — flat, one folder per device cut:
//   website/desktop-assets/<filename>
//   website/mobile-assets/<filename>
//
// Filenames are identical to the previous CDN; only the base URL changed.
// R2 serves the file as uploaded (no on-the-fly format/quality transforms),
// so upload the already-optimised WebP/MP4 you want the browser to get.
export const R2_BASE = 'https://assets.wenilo.com/website';

// Accepts a bare filename or any legacy folder-prefixed path and keeps only
// the filename, since the R2 folders are flat.
const file = (path) => String(path).split('/').filter(Boolean).pop();

export const desktopAsset = (path) => `${R2_BASE}/desktop-assets/${file(path)}`;

export const mobileAsset = (path) => `${R2_BASE}/mobile-assets/${file(path)}`;

// Device-keyed helper for data files that carry the cut as a value.
export const asset = (device, path) =>
  device === 'mobile' ? mobileAsset(path) : desktopAsset(path);

// ------------------------------------------------------------------
// AI Video Production reels.
//
// These live outside the website/ prefix above, under their own tree:
//   ai-video-production/{desktop,mobile}/<NN>/<filename>.mp4
//
// Two cuts, because the two layouts have opposite needs. The desktop reel
// shows FIVE 9:16 cards side by side — each only ~250 CSS px wide, but all
// five stream at once — so it gets a 720-wide cut. A phone shows ONE card
// full-width on a high-DPI screen with nothing competing, so it gets the
// 1080-wide cut. ResponsiveVideo/ReelVideo resolve exactly one per device
// via matchMedia, so a visitor only ever downloads the cut they can see.
//
// `path` is already percent-encoded (some filenames carry spaces and &).
// ------------------------------------------------------------------
export const REELS_BASE = 'https://assets.wenilo.com/ai-video-production';

export const reelAsset = (device, path) =>
  `${REELS_BASE}/${device === 'mobile' ? 'mobile' : 'desktop'}/${path}`;

// ------------------------------------------------------------------
// Selected Work media — a third flat tree, outside both prefixes above:
//   work-section/<filename>
//
// One cut per file, not the desktop/mobile pair the two trees above carry.
// Callers therefore pass it as the desktop source only; ReelVideo already
// falls back to that when no mobile cut exists, so no URL is invented.
// ------------------------------------------------------------------
export const WORK_BASE = 'https://assets.wenilo.com/work-section';

export const workAsset = (path) => `${WORK_BASE}/${path}`;
