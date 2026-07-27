# wenilo

A premium, cinematic interactive experience with a single message: **Get More Customers.**

Built to Awwwards standards — Apple-grade whitespace, magnetic custom cursor, Lenis smooth scroll, GSAP ScrollTrigger storytelling, and a GSAP Flip page transition that morphs the home "voice sphere" into the Voice Agent page.

## Stack

React 19 · Vite · Tailwind CSS · GSAP (ScrollTrigger + Flip) · Lenis · React Router DOM · Three.js / React Three Fiber / drei (installed & ready for the WebGL swap).

## Scripts

```bash
npm install
npm run dev       # local dev
npm run build     # production build (code-split, gzipped)
npm run preview   # serve the build
```

## Architecture

```
src/
  animations/   gsap plugin registration + easing/duration vocabulary
  components/
    common/     MagneticButton, VideoPlaceholder, DeferredMount, loaders
    cursor/     custom magnetic cursor
    hero/       fullscreen cinematic hero + media
    navigation/ floating glass navbar + mobile menu
    sections/   the storytelling sections
    voice/      SpherePlaceholder (the morph target)
    work/        luxury work cards
    footer/
  contexts/     SmoothScroll (Lenis), Cursor, Transition (Flip handoff)
  hooks/        useScrollReveal, useMagnetic, useParallax, useInView
  pages/        Home, VoiceAgentPage, NotFound
  routes/       lazy, code-split routing
  styles/       Tailwind layer + design tokens
  utils/        constants (all copy), device probes
```

## Replacing the placeholders (no layout shift)

Every placeholder reserves its box up front, so swapping in real media is a one-line change.

| Placeholder | File | How to swap |
|---|---|---|
| **Hero 3D sequence** | `components/hero/HeroSequence.jsx` + `/public/hero-frames` | 152-frame scroll-scrubbed canvas. Drop a new numbered set in `/public/hero-frames`, update `HERO_SEQUENCE` in `utils/constants.js`, then run `npm run frames:webp` to regenerate optimised WebP (JPG kept as auto fallback). |
| **Hero video (alt)** | `components/hero/HeroMedia.jsx` | Optional fullscreen video variant — pass `src="/media/hero.mp4"` |
| **3D / AI video reels** | `components/common/VideoPlaceholder.jsx` | Pass `src=`; it lazy-mounts a muted, looping, autoplay `<video>` via IntersectionObserver |
| **Work cards** | `components/work/WorkCard.jsx` | Drop an image/video into `.card-media` |
| **Voice sphere (Three.js)** | `components/voice/SpherePlaceholder.jsx` | Pass a `<Canvas>` as `children`; the frame, `data-flip-id` and breathing rhythm stay. Use `DeferredMount` to lazy-load the WebGL chunk. |

The Flip morph works because the home sphere and the `/voice-agents` hero share the same `data-flip-id` (`utils/constants.js → VOICE_FLIP_ID`). Swap the visual skin for a real mesh and the transition still runs.

## Performance notes

- Route-level code splitting; Three.js is not bundled until a Canvas imports it.
- All media + heavy content lazy-mounts via IntersectionObserver.
- Aspect ratios reserved everywhere → no layout shift (CLS ≈ 0).
- GSAP + Lenis share one RAF via `gsap.ticker` → 60fps, no double loops.
- `prefers-reduced-motion` fully honoured; custom cursor/magnetics only on fine pointers.

## Fonts

Inter loads from Google Fonts as the guaranteed fallback. Drop licensed **SF Pro Display** / **Neue Montreal** files into `/public/fonts` and they resolve automatically (see `styles/index.css`).
