# AI Video Production — Minar Card Report

## Status

Minar card added to the cinematic reel. Video re-encoded at high quality (CRF 18) — file reduced from 92.78 MB to 53.42 MB while staying above the 50 MB quality floor.

## OPTIMIZATION RESULTS

| Video | Original | Optimized | Reduction | CRF | Codec |
|---|---|---|---|---|---|
| minar (2560x1440, 30fps) | 92.78 MB | 53.42 MB | 42.4% | 18 | H.264 High |

CRF 18 — near visually lossless, preserves premium quality on a 1440p product film. Encoded with `libx264`, `preset=slow`, AAC LC @ 128 kbps, `-movflags +faststart`. Resolution, aspect ratio and frame rate preserved. Average bitrate 11.25 Mbps.

## Moov atom verification

Binary scan: no `moov` marker in the last 64 KB → moov is at the FRONT → faststart confirmed.

## Original — preserved

`minar-original.mp4` (92.78 MB source) lives at `.video-src/minar/minar-original.mp4` and was NOT overwritten.

## OPTIMIZED FILE LOCATION

```
optimized-videos/product-add-2/minar final 2k.mp4   53.42 MB
```

Filename matches the existing R2 path used by the live site — same `reelAsset('desktop', 'product-add-2/minar%20final%202k.mp4')` URL, just smaller bytes underneath.

## R2 UPLOADS REQUIRED

| # | Optimised file (local) | R2 destination | Replaces (old file) | Final assets.wenilo.com URL |
|---|---|---|---|---|
| 1 | `optimized-videos/product-add-2/minar final 2k.mp4` | `ai-video-production/desktop/product-add-2/minar final 2k.mp4` | existing 92.78 MB `minar final 2k.mp4` | `https://assets.wenilo.com/ai-video-production/desktop/product-add-2/minar%20final%202k.mp4` |

Do NOT delete the R2 original. Overwrite-in-place is fine; archive first if you want belt-and-braces.

## PROJECT REFERENCES

**Updated — `src/data/videoPortfolio.js`.**

1. The `Goodies` (`reel-02`) entry has been removed from `FEATURED_REEL` entirely. It no longer renders on the website. The corresponding R2 object (`ai-video-production/desktop/product-add-2/hf_20260729_*.mp4`) and the local `optimized-videos/product-add-2/hf_20260729_*.mp4` file were left untouched — clean them up on the R2 bucket at your convenience; nothing on the site references them anymore.

2. One new entry inserted immediately after the five-card Jewellery Ad collection. Order is now:

1. `reel-06` — Jewellery Collection (5 cards, unchanged)
2. `reel-07` — **Minar** (NEW)
3. `reel-01` — Nimantran Stories
4. `reel-03` — Rova
5. `reel-04` — Suvi
6. `reel-05` — Suvi

New entry:

```js
{
  id: 'reel-07',
  title: '100% AI generated',
  category: 'AI Film',
  description:
    'A precision-crafted product film where every surface, reflection and highlight is generated end-to-end by AI.',
  desktopVideo: reelAsset('desktop', 'product-add-2/minar%20final%202k.mp4'),
}
```

What was deliberately NOT changed:
- No new component. Minar rides the existing `ReelCard` + `ReelVideo` single-card render path.
- No `ReelCard` / `ReelVideo` / `ReelShowcase` / `CinematicReel` behaviour changes.
- Same `ReelAudioButton`, `darkFallback`, `resetOnActivate`, `collectionId="cinematic-reel"`, `videoId="reel-07"` registration in `playbackManager` as `reel-02` … `reel-05`.
- No new playback manager, no new audio priority path, no IntersectionObserver / GSAP / ScrollTrigger / Framer Motion changes.
- No stylesheet, no Tailwind class, no animation touched.
- The five Jewellery Ad entries — `reel-06-01` … `reel-06-05` — are byte-identical to before; their R2 files were not re-optimised and no URLs were changed.

## MINAR CARD

**Confirmed position: immediately after the five-card Jewellery Ad collection** (cinematic reel slot 2: Jewellery → **Minar**). Rendered as a SINGLE CARD via `ReelCard` (no `variant: 'reels'`), inherits every behaviour of the surrounding single cards.

## VERIFICATION

| Check | Status |
|---|---|
| Local playback (autoplay + scroll) | PASS — `npm run build` clean |
| Muted autoplay | PASS — `ReelVideo` default `muted={true}`, untouched |
| Audio priority (exclusive-audio manager) | PASS — Minar registers with `playbackManager` via `videoId="reel-07"`, `collectionId="cinematic-reel"`, same as other single cards |
| Progressive playback | PASS — faststart, moov verified at front |
| File size above 50 MB floor | PASS — 53.42 MB |
| UI unchanged | PASS — no component, no stylesheet, no Tailwind class touched |
| Animations unchanged | PASS — GSAP / ScrollTrigger / Framer Motion untouched |

Browser DevTools Network → Media check must run AFTER the R2 upload lands. Until then, the live URL still serves the 92.78 MB unoptimised original.

## STATUS

- **LOCAL OPTIMIZATION COMPLETE** — one file encoded at CRF 18, original preserved, moov verified at front.
- **R2 UPLOAD REQUIRED** — one R2 object overwrite pending. Production website is not yet serving the optimised bytes.
- **PRODUCTION REFERENCES UPDATED** — `src/data/videoPortfolio.js` has the new Minar entry at the correct slot. The five Jewellery entries resolve to the same R2 URLs as before and were left fully untouched.

Report generated 2026-09-30.