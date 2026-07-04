/**
 * Device-aware image. Native <picture> means the browser fetches EXACTLY
 * ONE source (mobile below the breakpoint, desktop above) — no double
 * download. Lazy + async-decoded by default. The box (aspect ratio,
 * radius, overflow) is owned by the parent via `className`.
 */
import { MOBILE_QUERY } from '../../hooks/useMediaQuery';

export default function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt = '',
  className = '',
  loading = 'lazy',
}) {
  return (
    <picture className={className}>
      {mobileSrc && <source media={MOBILE_QUERY} srcSet={mobileSrc} />}
      <img
        src={desktopSrc ?? mobileSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </picture>
  );
}
