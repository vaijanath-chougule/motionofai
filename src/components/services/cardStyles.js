// Shared card chrome for the ServiceShowcase — Apple product aesthetic:
// large radius, soft shadow, minimal hairline border, subtle glass. The
// hover lift (translateY(-8px) + scale 1.02) lives on the OUTER frame;
// the entrance `.reveal` lives on an INNER wrapper — kept on separate
// elements so GSAP's reveal transform never fights the CSS hover transform.
export const CARD_SHELL =
  'group relative flex flex-col overflow-hidden rounded-[32px] border bg-white/70 p-3 md:p-4 ' +
  'shadow-[0_8px_40px_-12px_rgba(37,99,235,0.12),0_30px_90px_-50px_rgba(17,17,17,0.18)] ' +
  'backdrop-blur-glass will-change-transform ' +
  'transition-[transform,box-shadow] duration-500 ease-premium ' +
  'hover:-translate-y-2 hover:scale-[1.02] ' +
  'hover:shadow-[0_16px_60px_-12px_rgba(37,99,235,0.22),0_50px_120px_-45px_rgba(17,17,17,0.22)]';

// The media well inside a card (radius slightly tighter than the frame).
export const CARD_MEDIA =
  'relative overflow-hidden rounded-[24px]';

// Responsive aspect ladder for the video cards:
// mobile 9:16 (portrait) · tablet 4:3 · desktop 16:9.
export const CARD_MEDIA_ASPECT =
  'aspect-[9/16] md:aspect-[4/3] lg:aspect-video';
