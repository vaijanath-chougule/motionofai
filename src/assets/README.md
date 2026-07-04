# assets

Drop future media here (imported by components) or in `/public` (served by URL).

- `models/` — custom `.glb` files for the Voice sphere & 3D scenes (lazy-loaded via `useGLTF` + `DeferredMount`).
- `video/` — cinematic `.mp4` / `.webm` reels. Prefer `/public/video/*` and pass the URL as `src` to `HeroMedia` / `VideoPlaceholder` so they lazy-mount with no layout shift.
- `fonts/` — licensed SF Pro Display / Neue Montreal files (or place in `/public/fonts`).

Nothing here is bundled until a component imports it.
