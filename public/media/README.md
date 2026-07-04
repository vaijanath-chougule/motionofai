# /public/media

Device-split media for the ServiceShowcase cards (and optional hero-video
variant). Components resolve **exactly one** source per device — no double
downloads — and show an elegant placeholder until these files exist, so
the site looks premium even before assets land (zero layout shift either
way). Paths are already wired in `src/utils/constants.js → MEDIA`; just
drop the files in and they go live.

```
desktop/                     mobile/           (portrait 9:16 cuts)
  website.mp4          16:9     website.mp4          9:16
  video-production.mp4 16:9     video-production.mp4 9:16
  hero.mp4  (optional)         hero.mp4  (optional)
  hero.webp (poster)           hero.webp (poster)
```

Guidelines: H.264/MP4, muted, seamless loop, ~1080p desktop / ~720p
mobile, aggressively compressed (these autoplay). Cards apply
`object-fit: cover`, so exact dimensions need not match the card box —
only the aspect intent (landscape desktop, portrait mobile).
